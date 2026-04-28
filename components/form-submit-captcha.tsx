"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { RefreshCcw, ShieldCheck } from "lucide-react"

import { Button } from "reactjs-platform/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "reactjs-platform/ui/dialog"
import { Input } from "reactjs-platform/ui/input"
import {
  normalizeCaptchaProvider,
  normalizeCaptchaTheme,
  type CaptchaSubmission,
} from "@/lib/captcha-shared"

type CaptchaChallenge = {
  prompt: string
  answer: string
}

type UseCaptchaSubmitOptions<T> = {
  formLabel: string
  onSubmit: (data: T, captcha?: CaptchaSubmission) => Promise<void> | void
}

type ScriptProvider = "recaptcha" | "turnstile"

type RecaptchaRenderOptions = {
  sitekey: string
  theme?: "light" | "dark"
  callback?: (token: string) => void
  "expired-callback"?: () => void
  "error-callback"?: () => void
}

type Grecaptcha = {
  ready: (callback: () => void) => void
  render: (container: HTMLElement, options: RecaptchaRenderOptions) => number
  reset: (widgetId?: number) => void
}

type TurnstileRenderOptions = {
  sitekey: string
  theme?: "auto" | "light" | "dark"
  callback?: (token: string) => void
  "expired-callback"?: () => void
  "error-callback"?: () => void
}

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string
  reset: (widgetId?: string) => void
  remove: (widgetId?: string) => void
}

declare global {
  interface Window {
    grecaptcha?: Grecaptcha
    turnstile?: TurnstileApi
  }
}

const createCaptchaChallenge = (): CaptchaChallenge => {
  const left = Math.floor(Math.random() * 8) + 2
  const right = Math.floor(Math.random() * 8) + 2
  const useAddition = Math.random() > 0.35

  if (useAddition) {
    return {
      prompt: `${left} + ${right} = ?`,
      answer: String(left + right),
    }
  }

  const max = Math.max(left, right)
  const min = Math.min(left, right)

  return {
    prompt: `${max} - ${min} = ?`,
    answer: String(max - min),
  }
}

const scriptState: Partial<Record<ScriptProvider, Promise<void>>> = {}

const getScriptConfig = (provider: ScriptProvider) => {
  if (provider === "recaptcha") {
    return {
      id: "captcha-recaptcha-script",
      src: "https://www.google.com/recaptcha/api.js?render=explicit",
    }
  }

  return {
    id: "captcha-turnstile-script",
    src: "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
  }
}

const loadExternalCaptchaScript = (provider: ScriptProvider) => {
  if (scriptState[provider]) {
    return scriptState[provider] as Promise<void>
  }

  const { id, src } = getScriptConfig(provider)
  scriptState[provider] = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(id) as HTMLScriptElement | null

    if (existing) {
      if ((provider === "recaptcha" && window.grecaptcha) || (provider === "turnstile" && window.turnstile)) {
        resolve()
        return
      }

      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener("error", () => reject(new Error(`Không thể tải ${provider} script.`)), {
        once: true,
      })
      return
    }

    const script = document.createElement("script")
    script.id = id
    script.src = src
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Không thể tải ${provider} script.`))
    document.head.appendChild(script)
  })

  return scriptState[provider] as Promise<void>
}

export function useCaptchaSubmit<T>({
  formLabel,
  onSubmit,
}: UseCaptchaSubmitOptions<T>) {
  const pendingDataRef = useRef<T | null>(null)
  const externalContainerRef = useRef<HTMLDivElement | null>(null)
  const recaptchaWidgetIdRef = useRef<number | null>(null)
  const turnstileWidgetIdRef = useRef<string | null>(null)

  const provider = useMemo(
    () => normalizeCaptchaProvider(process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER),
    [],
  )
  const theme = useMemo(
    () => normalizeCaptchaTheme(process.env.NEXT_PUBLIC_CAPTCHA_THEME),
    [],
  )
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || ""
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""
  const effectiveSiteKey =
    provider === "recaptcha"
      ? recaptchaSiteKey
      : provider === "turnstile"
        ? turnstileSiteKey
        : ""

  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [answer, setAnswer] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [challenge, setChallenge] = useState<CaptchaChallenge>(
    createCaptchaChallenge,
  )
  const [externalToken, setExternalToken] = useState("")
  const [externalReady, setExternalReady] = useState(provider === "local")
  const [externalRenderKey, setExternalRenderKey] = useState(0)

  const refreshLocalChallenge = () => {
    setChallenge(createCaptchaChallenge())
    setAnswer("")
    setError(null)
  }

  const resetExternalWidget = () => {
    setExternalToken("")
    setError(null)

    if (provider === "recaptcha" && recaptchaWidgetIdRef.current !== null) {
      window.grecaptcha?.reset(recaptchaWidgetIdRef.current)
      recaptchaWidgetIdRef.current = null
    }

    if (provider === "turnstile" && turnstileWidgetIdRef.current) {
      window.turnstile?.remove(turnstileWidgetIdRef.current)
      turnstileWidgetIdRef.current = null
    }

    if (externalContainerRef.current) {
      externalContainerRef.current.innerHTML = ""
    }

    setExternalRenderKey((current) => current + 1)
  }

  const resetAllState = () => {
    pendingDataRef.current = null
    setAnswer("")
    setError(null)
    setExternalToken("")
  }

  const handleOpenChange = (open: boolean) => {
    if (isSubmitting) return
    setIsOpen(open)

    if (!open) {
      resetAllState()
      if (provider !== "local") {
        resetExternalWidget()
      }
    }
  }

  const submitWithCaptcha = (data: T) => {
    if (isOpen || isSubmitting) return

    pendingDataRef.current = data
    setError(null)

    if (provider === "local") {
      refreshLocalChallenge()
    } else {
      setExternalToken("")
    }

    setIsOpen(true)
  }

  const completeSubmit = async (captcha?: CaptchaSubmission) => {
    const pendingData = pendingDataRef.current

    if (!pendingData) {
      handleOpenChange(false)
      return
    }

    pendingDataRef.current = null
    setIsOpen(false)
    setError(null)
    setIsSubmitting(true)

    try {
      await onSubmit(pendingData, captcha)
    } catch {
      // Submit errors are surfaced by the form-specific handler.
    } finally {
      setIsSubmitting(false)
      setAnswer("")
      setExternalToken("")
      setChallenge(createCaptchaChallenge())
      if (provider !== "local") {
        resetExternalWidget()
      }
    }
  }

  const confirmCaptcha = async () => {
    if (provider === "local") {
      if (answer.trim() !== challenge.answer) {
        setError("Thông tin xác nhận chưa đúng. Vui lòng thử lại.")
        setChallenge(createCaptchaChallenge())
        setAnswer("")
        return
      }

      await completeSubmit({ provider: "local" })
      return
    }

    if (!effectiveSiteKey) {
      setError("Hệ thống xác nhận đang tạm thời chưa sẵn sàng. Vui lòng thử lại sau ít phút.")
      return
    }

    if (!externalToken.trim()) {
      setError("Vui lòng hoàn tất bước xác nhận để tiếp tục.")
      return
    }

    await completeSubmit({
      provider,
      token: externalToken,
    })
  }

  useEffect(() => {
    if (!isOpen || provider === "local") return

    if (!effectiveSiteKey) {
      setExternalReady(false)
      return
    }

    let cancelled = false
    setExternalReady(false)
    setError(null)

    loadExternalCaptchaScript(provider)
      .then(() => {
        if (!cancelled) {
          setExternalReady(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setExternalReady(false)
          setError("Bước xác nhận đang tạm thời gián đoạn. Vui lòng thử lại.")
        }
      })

    return () => {
      cancelled = true
    }
  }, [effectiveSiteKey, isOpen, provider])

  useEffect(() => {
    if (!isOpen || provider === "local" || !externalReady || !effectiveSiteKey) {
      return
    }

    const container = externalContainerRef.current
    if (!container) return

    if (provider === "recaptcha" && window.grecaptcha) {
      window.grecaptcha.ready(() => {
        if (!externalContainerRef.current) return

        try {
          if (recaptchaWidgetIdRef.current !== null) {
            window.grecaptcha?.reset(recaptchaWidgetIdRef.current)
            return
          }

          recaptchaWidgetIdRef.current = window.grecaptcha?.render(
            externalContainerRef.current,
            {
              sitekey: effectiveSiteKey,
              theme: theme === "dark" ? "dark" : "light",
              callback: (token: string) => {
                setExternalToken(token)
                setError(null)
              },
              "expired-callback": () => {
                setExternalToken("")
              },
              "error-callback": () => {
                setExternalToken("")
                setError("Bước xác nhận đang tạm thời gián đoạn. Vui lòng thử lại.")
              },
            },
          ) ?? null
        } catch (captchaError) {
          console.error("reCAPTCHA render failed", captchaError)
          setError("Bước xác nhận đang tạm thời gián đoạn. Vui lòng thử lại.")
        }
      })

      return
    }

    if (provider === "turnstile" && window.turnstile) {
      try {
        if (turnstileWidgetIdRef.current) {
          window.turnstile.remove(turnstileWidgetIdRef.current)
          turnstileWidgetIdRef.current = null
        }

        turnstileWidgetIdRef.current = window.turnstile.render(container, {
          sitekey: effectiveSiteKey,
          theme,
          callback: (token: string) => {
            setExternalToken(token)
            setError(null)
          },
          "expired-callback": () => {
            setExternalToken("")
          },
          "error-callback": () => {
            setExternalToken("")
            setError("Bước xác nhận đang tạm thời gián đoạn. Vui lòng thử lại.")
          },
        })
      } catch (captchaError) {
        console.error("Turnstile render failed", captchaError)
        setError("Bước xác nhận đang tạm thời gián đoạn. Vui lòng thử lại.")
      }
    }
  }, [effectiveSiteKey, externalReady, externalRenderKey, isOpen, provider, theme])

  const providerTitle = "Xác nhận bảo mật"
  const providerDescription =
    provider === "local"
      ? "Vui lòng nhập kết quả phép tính bên dưới để tiếp tục."
      : "Vui lòng hoàn tất bước xác nhận bên dưới để tiếp tục gửi thông tin."

  const captchaDialog = (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={!isSubmitting} className="max-w-md">
        <DialogHeader>
          <div className="mb-2 inline-flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-700">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <DialogTitle>Xác nhận trước khi tiếp tục</DialogTitle>
          <DialogDescription>
            Vui lòng hoàn tất bước xác nhận để tiếp tục gửi thông tin đăng ký.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-900">{providerTitle}</p>
              <p className="mt-1 text-sm text-slate-600">{providerDescription}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 bg-white"
              onClick={
                provider === "local"
                  ? refreshLocalChallenge
                  : resetExternalWidget
              }
              disabled={isSubmitting}
              aria-label="Làm mới bước xác nhận"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>

          {provider === "local" ? (
            <>
              <p className="mb-3 text-2xl font-semibold tracking-wide text-slate-900">
                {challenge.prompt}
              </p>
              <Input
                value={answer}
                onChange={(event) => {
                  setAnswer(event.target.value)
                  if (error) setError(null)
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    void confirmCaptcha()
                  }
                }}
                inputMode="numeric"
                placeholder="Nhập đáp án"
                autoFocus
                disabled={isSubmitting}
              />
            </>
          ) : !effectiveSiteKey ? (
            <p className="text-sm text-amber-700">
              Hệ thống xác nhận đang tạm thời chưa sẵn sàng. Vui lòng thử lại sau ít phút.
            </p>
          ) : (
            <div className="space-y-3">
              <div
                key={externalRenderKey}
                ref={externalContainerRef}
                className="min-h-[78px] overflow-hidden rounded-lg border border-dashed border-slate-300 bg-white p-3"
              />
              {!externalReady && (
                <p className="text-sm text-slate-600">Đang chuẩn bị bước xác nhận...</p>
              )}
            </div>
          )}

          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            type="button"
            onClick={() => void confirmCaptcha()}
            disabled={
              isSubmitting ||
              (provider === "local"
                ? !answer.trim()
                : !externalToken.trim())
            }
          >
            {isSubmitting ? "Đang xử lý..." : "Tiếp tục gửi thông tin"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  return {
    captchaDialog,
    captchaProvider: provider,
    isCaptchaBusy: isOpen || isSubmitting,
    isCaptchaSubmitting: isSubmitting,
    submitWithCaptcha,
  }
}

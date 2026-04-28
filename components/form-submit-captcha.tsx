"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { RefreshCcw, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import {
  normalizeCaptchaProvider,
  normalizeCaptchaTheme,
  type CaptchaProvider,
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
  "error-callback"?: (errorCode?: string | number) => void
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
  "timeout-callback"?: () => void
  "error-callback"?: (errorCode?: string | number) => void
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

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error || "")

const isCaptchaSubmitError = (error: unknown) => {
  if ((error as { isCaptchaError?: unknown } | null)?.isCaptchaError === true) {
    return true
  }

  const message = getErrorMessage(error).toLowerCase()

  return (
    message.includes("captcha") ||
    message.includes("recaptcha") ||
    message.includes("turnstile") ||
    message.includes("cloudflare") ||
    message.includes("xác minh")
  )
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
  const submitLockRef = useRef(false)

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
  const [activeProvider, setActiveProvider] = useState<CaptchaProvider>(provider)
  const [externalReady, setExternalReady] = useState(provider === "local")
  const [externalRenderKey, setExternalRenderKey] = useState(0)

  const fallbackToLocalCaptcha = (message?: string) => {
    if (activeProvider !== "local") {
      resetExternalWidget()
    }

    setActiveProvider("local")
    setExternalReady(true)
    setExternalToken("")
    setChallenge(createCaptchaChallenge())
    setAnswer("")
    setIsOpen(true)
    setError(
      message ||
        "",
    )
  }

  const refreshLocalChallenge = () => {
    setChallenge(createCaptchaChallenge())
    setAnswer("")
    setError(null)
  }

  const resetExternalWidget = () => {
    setExternalToken("")
    setError(null)

    if (activeProvider === "recaptcha" && recaptchaWidgetIdRef.current !== null) {
      window.grecaptcha?.reset(recaptchaWidgetIdRef.current)
      recaptchaWidgetIdRef.current = null
    }

    if (activeProvider === "turnstile" && turnstileWidgetIdRef.current) {
      window.turnstile?.remove(turnstileWidgetIdRef.current)
      turnstileWidgetIdRef.current = null
    }

    if (externalContainerRef.current) {
      externalContainerRef.current.innerHTML = ""
    }

    setExternalRenderKey((current) => current + 1)
  }

  const resetAllState = () => {
    submitLockRef.current = false
    pendingDataRef.current = null
    setAnswer("")
    setError(null)
    setExternalToken("")
  }

  const handleOpenChange = (open: boolean) => {
    if (isSubmitting || submitLockRef.current) return
    setIsOpen(open)

    if (!open) {
      resetAllState()
      setActiveProvider(provider)
      setExternalReady(provider === "local")
      if (activeProvider !== "local") {
        resetExternalWidget()
      }
    }
  }

  const submitWithCaptcha = (data: T) => {
    if (isOpen || isSubmitting || submitLockRef.current) return

    pendingDataRef.current = data
    setError(null)
    setActiveProvider(provider)

    if (provider === "local") {
      refreshLocalChallenge()
    } else {
      setExternalToken("")
    }

    setIsOpen(true)
  }

  const completeSubmit = async (captcha?: CaptchaSubmission) => {
    if (submitLockRef.current) return

    submitLockRef.current = true
    const pendingData = pendingDataRef.current

    if (!pendingData) {
      submitLockRef.current = false
      handleOpenChange(false)
      return
    }

    pendingDataRef.current = null
    setIsOpen(false)
    setError(null)
    setIsSubmitting(true)
    let fallbackToLocal = false

    try {
      await onSubmit(pendingData, captcha)
    } catch (submitError) {
      if (captcha?.provider !== "local" && isCaptchaSubmitError(submitError)) {
        fallbackToLocal = true
        pendingDataRef.current = pendingData
        fallbackToLocalCaptcha()
      }
      // Submit errors are surfaced by the form-specific handler.
    } finally {
      submitLockRef.current = false
      setIsSubmitting(false)

      if (fallbackToLocal) {
        return
      }

      setAnswer("")
      setExternalToken("")
      setChallenge(createCaptchaChallenge())
      setActiveProvider(provider)
      setExternalReady(provider === "local")
      if (activeProvider !== "local") {
        resetExternalWidget()
      }
    }
  }

  const confirmCaptcha = async () => {
    if (submitLockRef.current || isSubmitting) return

    if (activeProvider === "local") {
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
      provider: activeProvider,
      token: externalToken,
    })
  }

  useEffect(() => {
    if (!isOpen || activeProvider === "local") return

    if (!effectiveSiteKey) {
      fallbackToLocalCaptcha()
      return
    }

    let cancelled = false
    setExternalReady(false)
    setError(null)

    loadExternalCaptchaScript(activeProvider)
      .then(() => {
        if (!cancelled) {
          setExternalReady(true)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setExternalReady(false)
          fallbackToLocalCaptcha()
        }
      })

    return () => {
      cancelled = true
    }
  }, [activeProvider, effectiveSiteKey, isOpen])

  useEffect(() => {
    if (!isOpen || activeProvider === "local" || !externalReady || !effectiveSiteKey) {
      return
    }

    const container = externalContainerRef.current
    if (!container) return

    if (activeProvider === "recaptcha" && window.grecaptcha) {
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
                setError("Mã xác nhận đã hết hạn. Vui lòng xác nhận lại.")
              },
              "error-callback": (errorCode?: string | number) => {
                setExternalToken("")
                fallbackToLocalCaptcha()
              },
            },
          ) ?? null
        } catch (captchaError) {
          console.error("reCAPTCHA render failed", captchaError)
          fallbackToLocalCaptcha()
        }
      })

      return
    }

    if (activeProvider === "turnstile" && window.turnstile) {
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
            setError("Mã xác nhận đã hết hạn. Vui lòng xác nhận lại.")
          },
          "timeout-callback": () => {
            setExternalToken("")
            setError("Phiên xác nhận đã hết thời gian. Vui lòng xác nhận lại.")
          },
          "error-callback": (errorCode?: string | number) => {
            setExternalToken("")
            fallbackToLocalCaptcha()
          },
        })
      } catch (captchaError) {
        console.error("Turnstile render failed", captchaError)
        fallbackToLocalCaptcha()
      }
    }
  }, [activeProvider, effectiveSiteKey, externalReady, externalRenderKey, isOpen, theme])

  const providerTitle = "Xác nhận bảo mật"
  const providerDescription =
    activeProvider === "local"
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
            Vui lòng hoàn tất bước xác nhận để tiếp tục {formLabel.toLowerCase()}.
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
                activeProvider === "local"
                  ? refreshLocalChallenge
                  : resetExternalWidget
              }
              disabled={isSubmitting}
              aria-label="Làm mới bước xác nhận"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>

          {activeProvider === "local" ? (
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
              (activeProvider === "local"
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
    captchaProvider: activeProvider,
    isCaptchaBusy: isOpen || isSubmitting,
    isCaptchaSubmitting: isSubmitting,
    submitWithCaptcha,
  }
}

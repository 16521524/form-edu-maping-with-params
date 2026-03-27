import {
  normalizeCaptchaProvider,
  type CaptchaProvider,
} from "@/lib/captcha-shared";

type VerifyCaptchaInput = {
  provider?: string | null;
  token?: string | null;
  remoteIp?: string | null;
};

type VerifyCaptchaResult = {
  ok: boolean;
  message?: string;
  provider: CaptchaProvider;
};

const RECAPTCHA_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";
const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

const getServerCaptchaProvider = (): CaptchaProvider =>
  normalizeCaptchaProvider(process.env.NEXT_PUBLIC_CAPTCHA_PROVIDER);

const getRecaptchaSecret = () =>
  process.env.RECAPTCHA_SECRET_KEY ||
  process.env.CAPTCHA_RECAPTCHA_SECRET_KEY ||
  "";

const getTurnstileSecret = () =>
  process.env.TURNSTILE_SECRET_KEY ||
  process.env.CAPTCHA_TURNSTILE_SECRET_KEY ||
  "";

const postForm = async (url: string, body: URLSearchParams) => {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  const json = await response.json().catch(() => null);

  return { response, json };
};

export async function verifyCaptchaSubmission({
  provider,
  token,
  remoteIp,
}: VerifyCaptchaInput): Promise<VerifyCaptchaResult> {
  const resolvedProvider = normalizeCaptchaProvider(
    provider || getServerCaptchaProvider(),
  );

  if (resolvedProvider === "local") {
    return { ok: true, provider: resolvedProvider };
  }

  if (!token?.trim()) {
    return {
      ok: false,
      provider: resolvedProvider,
      message: "Thiếu captcha token.",
    };
  }

  if (resolvedProvider === "recaptcha") {
    const secret = getRecaptchaSecret();

    if (!secret) {
      return {
        ok: false,
        provider: resolvedProvider,
        message: "Server chưa cấu hình RECAPTCHA_SECRET_KEY.",
      };
    }

    const body = new URLSearchParams({
      secret,
      response: token,
    });

    if (remoteIp) {
      body.set("remoteip", remoteIp);
    }

    const { response, json } = await postForm(RECAPTCHA_VERIFY_URL, body);
    if (!response.ok || !json?.success) {
      return {
        ok: false,
        provider: resolvedProvider,
        message: "Xác minh Google reCAPTCHA thất bại.",
      };
    }

    return { ok: true, provider: resolvedProvider };
  }

  const secret = getTurnstileSecret();

  if (!secret) {
    return {
      ok: false,
      provider: resolvedProvider,
      message: "Server chưa cấu hình TURNSTILE_SECRET_KEY.",
    };
  }

  const body = new URLSearchParams({
    secret,
    response: token,
  });

  if (remoteIp) {
    body.set("remoteip", remoteIp);
  }

  const { response, json } = await postForm(TURNSTILE_VERIFY_URL, body);
  if (!response.ok || !json?.success) {
    return {
      ok: false,
      provider: resolvedProvider,
      message: "Xác minh Cloudflare Turnstile thất bại.",
    };
  }

  return { ok: true, provider: resolvedProvider };
}

export function getClientIpFromRequest(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return req.headers.get("cf-connecting-ip") || null;
}

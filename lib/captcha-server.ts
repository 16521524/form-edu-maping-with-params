import {
  normalizeCaptchaProvider,
  type CaptchaProvider,
} from "@/lib/captcha-shared";

type VerifyCaptchaInput = {
  provider?: string | null;
  token?: string | null;
  remoteIp?: string | null;
  userAgent?: string | null;
};

type VerifyCaptchaResult = {
  ok: boolean;
  message?: string;
  provider: CaptchaProvider;
  errorCodes?: string[];
};

type CaptchaVerifyResponse = {
  success?: boolean;
  "error-codes"?: string[];
  hostname?: string;
  action?: string;
  cdata?: string;
  challenge_ts?: string;
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

  return {
    response,
    json: (json as CaptchaVerifyResponse | null) ?? null,
  };
};

const getCaptchaErrorCodes = (payload: CaptchaVerifyResponse | null) =>
  Array.isArray(payload?.["error-codes"])
    ? payload["error-codes"].filter(
        (value): value is string => typeof value === "string" && value.length > 0,
      )
    : [];

const getRecaptchaFailureMessage = (errorCodes: string[]) => {
  if (errorCodes.includes("timeout-or-duplicate")) {
    return "Mã xác nhận Google reCAPTCHA đã hết hạn hoặc đã được sử dụng. Vui lòng xác nhận lại.";
  }

  if (errorCodes.includes("missing-input-response")) {
    return "Thiếu mã xác nhận Google reCAPTCHA.";
  }

  if (errorCodes.includes("invalid-input-response")) {
    return "Mã xác nhận Google reCAPTCHA không hợp lệ. Vui lòng xác nhận lại.";
  }

  if (
    errorCodes.includes("invalid-input-secret") ||
    errorCodes.includes("missing-input-secret")
  ) {
    return "Server chưa cấu hình đúng khóa Google reCAPTCHA.";
  }

  return "Xác minh Google reCAPTCHA thất bại.";
};

const getTurnstileFailureMessage = (errorCodes: string[]) => {
  if (errorCodes.includes("timeout-or-duplicate")) {
    return "Mã xác nhận Cloudflare Turnstile đã hết hạn hoặc đã được sử dụng. Vui lòng xác nhận lại.";
  }

  if (errorCodes.includes("missing-input-response")) {
    return "Thiếu mã xác nhận Cloudflare Turnstile.";
  }

  if (errorCodes.includes("invalid-input-response")) {
    return "Mã xác nhận Cloudflare Turnstile không hợp lệ. Vui lòng xác nhận lại.";
  }

  if (
    errorCodes.includes("invalid-input-secret") ||
    errorCodes.includes("missing-input-secret")
  ) {
    return "Server chưa cấu hình đúng khóa Cloudflare Turnstile.";
  }

  return "Xác minh Cloudflare Turnstile thất bại.";
};

const isInAppBrowser = (userAgent?: string | null) =>
  /(FBAN|FBAV|Instagram|Line|MicroMessenger|Zalo|TikTok|Messenger)/i.test(
    userAgent || "",
  );

const withEmbeddedBrowserHint = (
  message: string,
  userAgent?: string | null,
) => {
  if (!isInAppBrowser(userAgent)) {
    return message;
  }

  return `${message} Nếu đang mở trong trình duyệt trong ứng dụng, hãy mở bằng Safari hoặc Chrome rồi thử lại.`;
};

export async function verifyCaptchaSubmission({
  provider,
  token,
  remoteIp,
  userAgent,
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
    const errorCodes = getCaptchaErrorCodes(json);
    if (!response.ok || !json?.success) {
      console.error("[captcha] reCAPTCHA verification failed", {
        status: response.status,
        errorCodes,
        hostname: json?.hostname,
        action: json?.action,
        challengeTs: json?.challenge_ts,
        hasRemoteIp: Boolean(remoteIp),
        inAppBrowser: isInAppBrowser(userAgent),
      });

      return {
        ok: false,
        provider: resolvedProvider,
        errorCodes,
        message: withEmbeddedBrowserHint(
          getRecaptchaFailureMessage(errorCodes),
          userAgent,
        ),
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
  const errorCodes = getCaptchaErrorCodes(json);
  if (!response.ok || !json?.success) {
    console.error("[captcha] turnstile verification failed", {
      status: response.status,
      errorCodes,
      hostname: json?.hostname,
      action: json?.action,
      challengeTs: json?.challenge_ts,
      hasRemoteIp: Boolean(remoteIp),
      inAppBrowser: isInAppBrowser(userAgent),
    });

    return {
      ok: false,
      provider: resolvedProvider,
      errorCodes,
      message: withEmbeddedBrowserHint(
        getTurnstileFailureMessage(errorCodes),
        userAgent,
      ),
    };
  }

  return { ok: true, provider: resolvedProvider };
}

export function getClientIpFromRequest(req: Request) {
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) {
    return cfConnectingIp.trim() || null;
  }

  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || null;
  }

  return null;
}

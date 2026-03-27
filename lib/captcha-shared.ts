export type CaptchaProvider = "local" | "recaptcha" | "turnstile";

export type CaptchaTheme = "auto" | "light" | "dark";

export type CaptchaSubmission =
  | {
      provider: "local";
      token?: undefined;
    }
  | {
      provider: "recaptcha" | "turnstile";
      token: string;
    };

export const normalizeCaptchaProvider = (
  value?: string | null,
): CaptchaProvider => {
  switch ((value || "").trim().toLowerCase()) {
    case "recaptcha":
    case "google":
    case "google_recaptcha":
      return "recaptcha";
    case "turnstile":
    case "cloudflare":
    case "cloudflare_turnstile":
      return "turnstile";
    default:
      return "local";
  }
};

export const normalizeCaptchaTheme = (
  value?: string | null,
): CaptchaTheme => {
  switch ((value || "").trim().toLowerCase()) {
    case "dark":
      return "dark";
    case "light":
      return "light";
    default:
      return "auto";
  }
};

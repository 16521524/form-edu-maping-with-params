import { parseDdMmYyyy } from "@/lib/date-format";

class FormValidationService {
  private static instance: FormValidationService | null = null;

  public readonly fullNamePattern = /^[\p{L}\s.'-]+$/u;
  public readonly fullNamePartPattern = /^\p{L}+(?:[.'-]\p{L}+)*$/u;
  public readonly phonePattern = /^[0-9+\s().-]+$/;

  private constructor() {}

  public static getInstance() {
    if (!FormValidationService.instance) {
      FormValidationService.instance = new FormValidationService();
    }

    return FormValidationService.instance;
  }

  public extractDigits(value: string) {
    return value.replace(/\D/g, "");
  }

  public hasAllSameDigits(value: string) {
    return /^(\d)\1+$/.test(value);
  }

  public getFullNameError(
    value: string,
    fieldLabel = "Họ và tên",
  ) {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const normalized = trimmed.replace(/\s+/g, " ");
    if (!this.fullNamePattern.test(normalized)) {
      return `${fieldLabel} không đúng định dạng.`;
    }

    const parts = normalized.split(" ").filter(Boolean);
    if (parts.length < 2) {
      return `${fieldLabel} phải có ít nhất 2 từ.`;
    }

    const hasInvalidPart = parts.some(
      (part) => !this.fullNamePartPattern.test(part),
    );
    if (hasInvalidPart) {
      return `${fieldLabel} không đúng định dạng.`;
    }

    return undefined;
  }

  public isValidFullName(value: string) {
    return !this.getFullNameError(value);
  }

  public normalizePhoneForSubmit(value: string) {
    const digits = this.extractDigits(value);
    if (!digits) return "";
    return value.trim().startsWith("+") ? `+${digits}` : digits;
  }

  public getVietnamMobileError(
    value: string,
    fieldLabel = "Số điện thoại",
  ) {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const structureMessage = `${fieldLabel} phải gồm 10 chữ số hoặc theo định dạng +84xxxxxxxxx.`;
    const digits = this.extractDigits(trimmed);

    if (!this.phonePattern.test(trimmed) || !digits) {
      return structureMessage;
    }

    if (trimmed.startsWith("+")) {
      if (digits.length !== 11 || !digits.startsWith("84")) {
        return structureMessage;
      }

      const normalizedLocalPhone = `0${digits.slice(2)}`;
      if (
        this.hasAllSameDigits(normalizedLocalPhone) ||
        !/^0(?:3|5|7|8|9)\d{8}$/.test(normalizedLocalPhone)
      ) {
        return `${fieldLabel} không hợp lệ.`;
      }

      return undefined;
    }

    if (digits.length !== 10 || !digits.startsWith("0")) {
      return structureMessage;
    }

    if (
      this.hasAllSameDigits(digits) ||
      !/^0(?:3|5|7|8|9)\d{8}$/.test(digits)
    ) {
      return `${fieldLabel} không hợp lệ.`;
    }

    return undefined;
  }

  public isValidVietnamMobile(value: string) {
    return !this.getVietnamMobileError(value);
  }

  public getNationalIdError(
    value: string,
    fieldLabel = "Số CCCD/CMND",
  ) {
    const trimmed = value.trim();
    if (!trimmed) return undefined;

    const normalized = trimmed.replace(/\s/g, "");
    const digits = this.extractDigits(trimmed);

    if (!/^\d+$/.test(normalized) || (digits.length !== 9 && digits.length !== 12)) {
      return `${fieldLabel} phải gồm 9 hoặc 12 chữ số.`;
    }

    if (this.hasAllSameDigits(digits)) {
      return `${fieldLabel} không hợp lệ.`;
    }

    return undefined;
  }

  public isValidNationalId(value: string) {
    return !this.getNationalIdError(value);
  }

  public isValidBirthDate(value: string) {
    const parsed = parseDdMmYyyy(value.trim());
    if (!parsed) return false;

    const now = new Date();
    const minDate = new Date(1900, 0, 1);
    return parsed >= minDate && parsed <= now;
  }

  public isValidGpa(value: string) {
    const trimmed = value.trim();
    if (!/^\d+(\.\d+)?$/.test(trimmed)) return false;

    const gpa = Number(trimmed);
    return gpa >= 0 && gpa <= 10;
  }

  public isLikelyProfileUrl(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return false;

    try {
      const url = new URL(trimmed);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }

  public getErrorMessage(message: unknown) {
    return typeof message === "string" ? message : undefined;
  }
}

export { FormValidationService };
export const formValidation = FormValidationService.getInstance();

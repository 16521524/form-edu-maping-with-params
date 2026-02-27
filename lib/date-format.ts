import { format, isValid, parse } from "date-fns";

export const DISPLAY_DATE_FORMAT = "dd/MM/yyyy";

/**
 * Limit numeric input to dd/MM/yyyy while typing.
 */
export const maskDdMmYyyy = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  let result = day;
  if (month) result = `${day}/${month}`;
  if (year) result = `${day}/${month}/${year}`;
  return result;
};

export const parseDdMmYyyy = (value?: string) => {
  if (!value) return null;
  const parsed = parse(value, DISPLAY_DATE_FORMAT, new Date());
  return isValid(parsed) ? parsed : null;
};

export const formatToDisplay = (date?: Date | null) =>
  date ? format(date, DISPLAY_DATE_FORMAT) : "";

export const isoToDdMmYyyy = (val?: string) => {
  if (!val) return "";
  const match = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return val;
  const [, y, m, d] = match;
  return `${d}/${m}/${y}`;
};

export const ddMmYyyyToIso = (val?: string) => {
  if (!val) return "";
  const match = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return val;
  const [, d, m, y] = match;
  return `${y}-${m}-${d}`;
};

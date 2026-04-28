"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useController,
  Controller,
  useForm,
  useWatch,
  type Control,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Inter } from "next/font/google";
import { z } from "zod";
import {
  Check,
  ChevronDown,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";

import { Button } from "reactjs-platform/ui/button";
import { Checkbox } from "reactjs-platform/ui/checkbox";
import { Input } from "reactjs-platform/ui/input";
import { DatePickerInput } from "reactjs-platform/ui/date-picker-input";
import { ddMmYyyyToIso, isoToDdMmYyyy } from "@/lib/date-format";
import { cn } from "@/lib/utils";
import { formValidation } from "@/lib/form-validation";
import type { CaptchaSubmission } from "@/lib/captcha-shared";
import {
  getMetadataCareer,
  getMetadataSchools,
  getCampaigns,
  postCareerLead,
  updateCampaignTotalScans,
  searchSubjectCombination,
  searchPreference,
} from "@/servers";
import FormSuccessModal from "./career-success-modal";
import { useCaptchaSubmit } from "./form-submit-captcha";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

type FormData = {
  fullName: string;
  birthDate: string;
  gender: string;
  address: string;
  phone: string;
  parentPhone: string;
  nationalId: string;
  email: string;
  utmCampaign: string;
  utmCampaignQr: string;
  utmSales: string;
  role: string;
  city: string;
  school: string;
  gradeLevel: string;
  academicPerformance: string;
  gpa: string;
  preferences: { preference_name: string; subject_combination: string }[];
  notifyVia: string[];
  socials: { platform: string; link_profile: string }[];
  confirmAccuracy: boolean;
};

type OptionItem = {
  value: string;
  display: string;
  text_color?: string;
  background_color?: string;
  sub_title?: string;
};

const mapDataOptions = (items: any[] | undefined): OptionItem[] => {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (!item) return null;
      const value = item.value ?? item.display;
      const display = item.display ?? item.value;
      if (!value && !display) return null;
      return {
        value: String(value ?? ""),
        display: String(display ?? value ?? ""),
        text_color: item.text_color,
        background_color: item.background_color,
        sub_title: item.sub_title,
      };
    })
    .filter(Boolean) as OptionItem[];
};

const NOTIFICATION_CHANNELS = ["email", "zalo", "messenger", "whatsapp"];

const metaData: any = {};
const metaCampaigns: OptionItem[] = mapDataOptions(metaData.campaigns);

const initialFormData: FormData = {
  fullName: "",
  birthDate: "",
  gender: "",
  address: "",
  phone: "",
  parentPhone: "",
  nationalId: "",
  email: "",
  utmCampaign: "",
  utmCampaignQr: "",
  utmSales: "",
  role: "",
  city: "",
  school: "",
  gradeLevel: "",
  academicPerformance: "",
  gpa: "",
  preferences: [],
  notifyVia: [NOTIFICATION_CHANNELS[0] || "email"].filter(Boolean),
  socials: [],
  confirmAccuracy: false,
};

const fallbackGenderOptions: OptionItem[] = [
  { value: "Male", display: "Nam" },
  { value: "Female", display: "Nữ" },
  { value: "Other", display: "Khác" },
];

const fallbackGradeOptions: OptionItem[] = [
  { value: "10", display: "10" },
  { value: "11", display: "11" },
  { value: "12", display: "12" },
  { value: "Đã TN", display: "Đã TN" },
];

const fallbackPerformanceOptions: OptionItem[] = [
  { value: "Kém", display: "Kém" },
  { value: "Yếu", display: "Yếu" },
  { value: "Trung bình", display: "Trung bình" },
  { value: "Khá", display: "Khá" },
  { value: "Giỏi", display: "Giỏi" },
  { value: "Xuất sắc", display: "Xuất sắc" },
];

const fallbackRoleOptions: OptionItem[] = [
  { value: "Student", display: "Student" },
  { value: "Parent", display: "Parent" },
  { value: "Guardian", display: "Guardian" },
];

const fallbackPreferenceOptions: OptionItem[] = [];

const panelClass =
  "rounded-lg border border-[#e2e7ef] bg-white shadow-[0_8px_22px_rgba(31,63,119,0.06)]";

const inputClass =
  "h-11 w-full rounded-lg border border-[#d7dde7] bg-white text-[15px] text-slate-800 placeholder:italic placeholder:text-[#a8afbb] shadow-[inset_0_1px_0_rgba(0,0,0,0.04)] focus:border-[#1f3f77] focus:ring-2 focus:ring-[#1f3f77]/15";

const selectClass =
  "h-11 w-full rounded-[10px] border border-[#cfd6e1] bg-white px-4 pr-12 text-[13px] font-medium text-slate-800 placeholder:italic placeholder:text-[#aeb7c3] leading-[22px] shadow-[inset_0_1px_0_rgba(0,0,0,0.04)] focus:border-[#1f3f77] focus:ring-2 focus:ring-[#1f3f77]/15";

const SOCIAL_OPTIONS = [
  { value: "Facebook", label: "Facebook", icon: "/social/facebook.png" },
  { value: "Zalo", label: "Zalo", icon: "/social/zalo.png" },
  // { value: "TikTok", label: "TikTok", icon: "/social/tiktok.png" },
  { value: "WhatsApp", label: "WhatsApp", icon: "/social/whatsapp.png" },
];

const normalizeText = (val: string) =>
  (val || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const toOptionItem = (item: any): OptionItem | null => {
  if (!item) return null;
  if (typeof item === "string") {
    return { value: String(item), display: String(item) };
  }
  const value = item.value ?? item.display;
  const display = item.display ?? item.value;
  if (!value && !display) return null;
  return {
    value: String(value),
    display: String(display),
    text_color: item.text_color,
    background_color: item.background_color,
    sub_title: item.sub_title,
  };
};

const normalizeOptions = (
  source: any,
  fallback: OptionItem[] = [],
): OptionItem[] => {
  if (Array.isArray(source)) {
    const normalized = source.map(toOptionItem).filter(Boolean) as OptionItem[];
    if (normalized.length) return normalized;
  }
  return fallback;
};

const coerceToValue = (
  raw: string | undefined,
  options: OptionItem[],
): string | undefined => {
  if (!raw) return raw;
  const byValue = options.find((opt) => opt.value === raw);
  if (byValue) return byValue.value;
  const byDisplay = options.find((opt) => opt.display === raw);
  if (byDisplay) return byDisplay.value;
  return raw;
};

const isValidEmail = (value: string) => z.string().email().safeParse(value).success;

const careerConsultationSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập họ và tên.")
    .superRefine((value, ctx) => {
      if (!value) return
      const message = formValidation.getFullNameError(value, "Họ và tên")
      if (message) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message })
      }
    }),
  birthDate: z
    .string()
    .trim()
    .refine(
      (value) => !value || formValidation.isValidBirthDate(value),
      "Ngày sinh không hợp lệ. Dùng định dạng dd/MM/yyyy.",
    ),
  gender: z.string(),
  address: z.string(),
  phone: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số điện thoại.")
    .superRefine((value, ctx) => {
      if (!value) return
      const message = formValidation.getVietnamMobileError(value, "Số điện thoại")
      if (message) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message })
      }
    }),
  parentPhone: z
    .string()
    .trim()
    .superRefine((value, ctx) => {
      const message = formValidation.getVietnamMobileError(
        value,
        "Số điện thoại phụ huynh",
      )
      if (message) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message })
      }
    }),
  nationalId: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập căn cước công dân.")
    .superRefine((value, ctx) => {
      if (!value) return
      const message = formValidation.getNationalIdError(
        value,
        "Số CCCD/CMND",
      )
      if (message) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message })
      }
    }),
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email.")
    .refine((value) => isValidEmail(value), "Email không hợp lệ."),
  utmCampaign: z.string(),
  utmCampaignQr: z.string(),
  utmSales: z.string(),
  role: z.string(),
  city: z.string(),
  school: z.string(),
  gradeLevel: z.string(),
  academicPerformance: z.string(),
  gpa: z
    .string()
    .trim()
    .refine((value) => !value || formValidation.isValidGpa(value), "Điểm trung bình phải từ 0 đến 10."),
  preferences: z.array(
    z.object({
      preference_name: z.string(),
      subject_combination: z.string(),
    }),
  ),
  notifyVia: z.array(z.string()),
  socials: z.array(
    z.object({
      platform: z.string(),
      link_profile: z.string(),
    }),
  ),
  confirmAccuracy: z
    .boolean()
    .refine(
      (value) => value,
      "Vui lòng xác nhận những thông tin trên là chính xác.",
    ),
});

export default function CareerConsultationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const lastQuery = useRef<string>("");
  const hasHydrated = useRef(false);
  const skipNextSync = useRef(false);
  const hydratedSnapshot = useRef<FormData | null>(null);
  const campaignScanTracked = useRef(false);
  const initialCampaignName = useRef<string | null>(null);
  const initialSchoolQuery = useRef<string | null>(null);
  const fetchedComboPref = useRef<Set<string>>(new Set());
  if (initialCampaignName.current === null) {
    initialCampaignName.current = searchParams.get("utmCampaignQr");
  }
  if (initialSchoolQuery.current === null) {
    initialSchoolQuery.current = searchParams.get("school");
  }
  const [isHydrating, setIsHydrating] = useState(true);
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    formState: { isSubmitting, errors },
  } = useForm<FormData>({
    defaultValues: initialFormData,
    resolver: zodResolver(careerConsultationSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });
  const formData = useWatch({ control });
  const preferences = watch("preferences") || [];
  const aspirationNames = (preferences || []).map(
    (p) => p.preference_name,
  );
  const [aspirationInput, setAspirationInput] = useState("");
  const [metaOptions, setMetaOptions] = useState<{
    genders: OptionItem[];
    preferences: OptionItem[];
    provinces: OptionItem[];
    grades: OptionItem[];
    performances: OptionItem[];
    schools: OptionItem[];
    campaigns: OptionItem[];
    roles: OptionItem[];
  }>({
    genders: [],
    preferences: [],
    provinces: [],
    grades: [],
    performances: [],
    schools: [],
    campaigns: [],
    roles: [],
  });
  const [metaReady, setMetaReady] = useState(false);
  const [loadingSchoolOptions, setLoadingSchoolOptions] = useState(false);
  const [showAspirationDropdown, setShowAspirationDropdown] = useState(false);
  const [comboOptions, setComboOptions] = useState<
    Record<string, OptionItem[]>
  >({});
  const [preferenceSearch, setPreferenceSearch] = useState<OptionItem[]>([]);
  const [preferenceLoading, setPreferenceLoading] = useState(false);
  const [socials, setSocials] = useState<
    { platform: string; link_profile: string }[]
  >([]);
  const [openSocialIndex, setOpenSocialIndex] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const genderOptions =
    metaOptions.genders.length > 0
      ? metaOptions.genders
      : fallbackGenderOptions;
  const gradeOptions =
    metaOptions.grades.length > 0 ? metaOptions.grades : fallbackGradeOptions;
  const performanceOptions =
    metaOptions.performances.length > 0
      ? metaOptions.performances
      : fallbackPerformanceOptions;
  const roleOptions =
    metaOptions.roles.length > 0 ? metaOptions.roles : fallbackRoleOptions;
  const preferenceOptions =
    metaOptions.preferences.length > 0
      ? metaOptions.preferences
      : fallbackPreferenceOptions;
  const provinceOptions = metaOptions.provinces;
  const schoolOptions = metaOptions.schools;
  const selectedRole = formData.role || "";
  const emailReady = (watch("email") || "").trim() !== "";
  const socialReadySet = new Set(
    socials
      .filter(
        (s) =>
          s.platform &&
          typeof s.link_profile === "string" &&
          s.link_profile.trim() !== "",
      )
      .map((s) => s.platform)
      .filter(Boolean),
  );
  const channelPlatformMap: Record<string, string | null> = {
    email: null,
    messenger: "Facebook",
    zalo: "Zalo",
    whatsapp: "WhatsApp",
  };
  const canSelectChannel = (channel: string) => {
    const key = channel.toLowerCase();
    if (key === "email") return emailReady;
    const platform = channelPlatformMap[key] ?? channel;
    return platform ? socialReadySet.has(platform) : false;
  };
  const submitDisabled = isSubmitting;
  const phoneNumber = (watch("phone") || "").trim();
  const parentPhoneNumber = (watch("parentPhone") || "").trim();
  const campaignDisplay = useMemo(() => {
    const utmCampaign =
      formData.utmCampaign || searchParams.get("utmCampaign") || "";
    if (!utmCampaign) return "";
    const normalizedCampaign = coerceToValue(
      utmCampaign,
      metaOptions.campaigns,
    );
    const matched =
      metaOptions.campaigns.find(
        (c) =>
          c.value === normalizedCampaign ||
          c.display === normalizedCampaign ||
          c.value === utmCampaign,
      ) || null;
    return matched?.display || normalizedCampaign || utmCampaign;
  }, [formData.utmCampaign, metaOptions.campaigns, searchParams]);
  const getPreferenceDisplay = (value: string) =>
    preferenceOptions.find((opt) => opt.value === value)?.display || value;

  useEffect(() => {
    let active = true;
    const loadMeta = async () => {
      setLoadingSchoolOptions(true);
      try {
        const [json, schoolsResp] = await Promise.all([
          getMetadataCareer(),
          getMetadataSchools({
            province: searchParams.get("city") || undefined,
          }),
        ]);
        const campaignsResp = await getCampaigns();
        if (!active) return;
        const data = json?.data ?? {};
        const genders = normalizeOptions(data.genders, fallbackGenderOptions);
        const preferences = normalizeOptions(
          data.preferences,
          fallbackPreferenceOptions,
        );
        const provinces = normalizeOptions(data.provinces, []);
        const grades = normalizeOptions(data.grades, fallbackGradeOptions);
        const performances = normalizeOptions(
          data.performances,
          fallbackPerformanceOptions,
        );
        const campaignsFromApi =
          campaignsResp?.data?.map((item: any) => ({
            value: item.name,
            display: item.campaign_name || item.name,
          })) || [];
        const campaigns = normalizeOptions(
          campaignsFromApi,
          metaCampaigns || [],
        );
        const roles = normalizeOptions(data.roles, fallbackRoleOptions);
        const schools = normalizeOptions(
          schoolsResp.data && schoolsResp.data.length
            ? schoolsResp.data
            : data.schools,
          [],
        ).filter((s) => s.value || s.display);
        setMetaOptions({
          genders,
          preferences,
          provinces,
          grades,
          performances,
          schools,
          campaigns,
          roles,
        });
      } catch (err) {
        console.log(err);
        console.warn("Could not load metadata, using fallbacks", err);
        setMetaOptions({
          genders: fallbackGenderOptions,
          preferences: fallbackPreferenceOptions,
          provinces: [],
          grades: fallbackGradeOptions,
          performances: fallbackPerformanceOptions,
          schools: [],
          campaigns: metaCampaigns,
          roles: fallbackRoleOptions,
        });
      } finally {
        if (active) {
          setMetaReady(true);
          setLoadingSchoolOptions(false);
        }
      }
    };
    loadMeta();
    return () => {
      active = false;
      setLoadingSchoolOptions(false);
    };
  }, []);

  useEffect(() => {
    if (!metaReady) return;
    if (!formData.city) {
      setMetaOptions((prev) =>
        prev.schools.length ? { ...prev, schools: [] } : prev,
      );
      if (formData.school) {
        setValue("school", "", { shouldDirty: true });
      }
      setLoadingSchoolOptions(false);
      return;
    }
    let active = true;
    setLoadingSchoolOptions(true);
    getMetadataSchools({ province: formData.city })
      .then((res) => {
        if (!active) return;
        const opts = normalizeOptions(res?.data, []);
        const targetSchool =
          formData.school ||
          (!hasHydrated.current ? initialSchoolQuery.current || "" : "");
        const normalizedSchool = coerceToValue(targetSchool, opts);
        setMetaOptions((prev) =>
          prev.schools !== opts ? { ...prev, schools: opts } : prev,
        );
        if (normalizedSchool && normalizedSchool !== formData.school) {
          setValue("school", normalizedSchool, { shouldDirty: true });
        }
        if (initialSchoolQuery.current && normalizedSchool) {
          initialSchoolQuery.current = null;
        }
        if (process.env.NODE_ENV === "development") {
          console.debug("[career-form] schools fetched", {
            city: formData.city,
            count: opts.length,
            normalizedSchool,
            current: formData.school,
          });
        }
      })
      .catch(() => setMetaOptions((prev) => ({ ...prev, schools: [] })))
      .finally(() => {
        if (active) setLoadingSchoolOptions(false);
      });
    return () => {
      active = false;
      setLoadingSchoolOptions(false);
    };
  }, [metaReady, formData.city, formData.school, setValue]);

  useEffect(() => {
    const campaignName = initialCampaignName.current;
    if (!campaignName) return;

    const storageKey = `campaign-scan-${campaignName}`;
    if (campaignScanTracked.current) return;

    if (typeof window === "undefined") return;
    if (localStorage.getItem(storageKey)) {
      campaignScanTracked.current = true;
      return;
    }

    const trackScan = async () => {
      try {
        campaignScanTracked.current = true;
        await updateCampaignTotalScans(campaignName);
        localStorage.setItem(storageKey, "1");
      } catch (err: any) {
        // Ignore missing campaign (404) so user isn't spammed with console errors.
        const message = String(err?.message || err || "");
        const isNotFound = message.includes("404");
        if (!isNotFound) {
          console.warn("Failed to update campaign scan", err);
        }
        localStorage.setItem(storageKey, "skipped");
        campaignScanTracked.current = true;
      }
    };

    trackScan();
  }, []);

  useEffect(() => {
    if (!showAspirationDropdown) return;
    const query = aspirationInput.trim();
    if (!query) {
      setPreferenceSearch([]);
      return;
    }
    let active = true;
    setPreferenceLoading(true);
    searchPreference(query)
      .then((res) => {
        if (!active) return;
        setPreferenceSearch(mapDataOptions(res.data) || []);
      })
      .catch((err) => {
        console.warn("searchPreference failed", err);
        if (active) setPreferenceSearch([]);
      })
      .finally(() => {
        if (active) setPreferenceLoading(false);
      });
    return () => {
      active = false;
    };
  }, [aspirationInput, showAspirationDropdown]);

  useEffect(() => {
    if (!metaReady) return;
    const query = searchParams.toString();
    if (query === lastQuery.current && hasHydrated.current) return;
    lastQuery.current = query;

    const safeDecode = (value: string) => {
      try {
        return decodeURIComponent(value);
      } catch {
        return value;
      }
    };
    const decodeParam = (value: string) => {
      const withSpaces = value.replace(/\+/g, " ");
      const decodedOnce = safeDecode(withSpaces);
      const decodedTwice = safeDecode(decodedOnce);
      return decodedTwice;
    };
    const getDecoded = (key: keyof FormData) => {
      const value = searchParams.get(key);
      if (value === null) return undefined;
      return decodeParam(value);
    };
    const getVal = (key: keyof FormData) => {
      const decoded = getDecoded(key);
      if (decoded === undefined) return undefined;
      if (decoded === "__empty") return "";
      return decoded;
    };
    const getList = (key: keyof FormData) => {
      const decoded = getDecoded(key);
      if (decoded === undefined) return undefined;
      if (decoded === "none") return [];
      if (decoded) return decoded.split(",").filter(Boolean);
      return undefined;
    };
    const getPreferencesParam = () => {
      const list = getList("preferences" as keyof FormData);
      if (!list) return undefined;
      return list
        .map((item) => {
          const [pref, combo] = item.split(":");
          return {
            preference_name: pref || "",
            subject_combination: combo || "",
          };
        })
        .filter((p) => p.preference_name);
    };
    const aspirationsParam = getList("aspirations" as keyof FormData);
    const getBool = (keys: string[], defaultValue = false) => {
      for (const key of keys) {
        const value = getDecoded(key as keyof FormData);
        if (value !== undefined) return value === "true";
      }
      return defaultValue;
    };

    const prefer = (value: string | undefined, fallback: string | undefined) =>
      value === undefined ? (fallback ?? "") : value;
    const ensureOption = (
      value: string | undefined,
      allowed: string[],
      fallback: string | undefined,
    ) => {
      if (value === "") return "";
      if (allowed.length === 0) return value ?? fallback ?? "";
      if (value && allowed.includes(value)) return value;
      if (fallback && allowed.includes(fallback)) return fallback;
      return "";
    };

    const mappedData: Partial<FormData> = {
      fullName: getVal("fullName"),
      birthDate: getVal("birthDate"),
      gender: getVal("gender"),
      address: getVal("address"),
      phone: getVal("phone"),
      parentPhone: getVal("parentPhone"),
      nationalId: getVal("nationalId"),
      email: getVal("email"),
      utmCampaign: getVal("utmCampaign"),
      utmCampaignQr: getVal("utmCampaignQr"),
      utmSales: getVal("utmSales"),
      role: getVal("role"),
      city: getVal("city"),
      school: getVal("school"),
      gradeLevel: getVal("gradeLevel"),
      academicPerformance: getVal("academicPerformance"),
      gpa: getVal("gpa"),
      preferences: getPreferencesParam(),
      notifyVia: getList("notifyVia"),
      confirmAccuracy: getBool(
        ["confirmAccuracy"],
        initialFormData.confirmAccuracy,
      ),
    };

    const normalizedGender = coerceToValue(mappedData.gender, genderOptions);
    const normalizedGrade = coerceToValue(mappedData.gradeLevel, gradeOptions);
    const normalizedPerformance = coerceToValue(
      mappedData.academicPerformance,
      performanceOptions,
    );
    const normalizedCity = coerceToValue(
      mappedData.city,
      metaOptions.provinces,
    );
    const normalizedSchool = coerceToValue(
      mappedData.school,
      metaOptions.schools,
    );
    const normalizedRole = coerceToValue(mappedData.role, roleOptions);
    const normalizedPreferences =
      mappedData.preferences && Array.isArray(mappedData.preferences)
        ? mappedData.preferences
            .slice(0, 3)
            .map((pref: FormData["preferences"][number]) => ({
              preference_name: coerceToValue(
                pref?.preference_name,
                preferenceOptions,
              ) || "",
              subject_combination: pref?.subject_combination || "",
            }))
        : (aspirationsParam || [])
            .slice(0, 3)
            .map((item: string) => ({
              preference_name: coerceToValue(item, preferenceOptions) || "",
              subject_combination: "",
            }));

    const allowedGenders = genderOptions.map((o) => o.value);
    const allowedGrades = gradeOptions.map((o) => o.value);
    const allowedAcademic = performanceOptions.map((o) => o.value);
    const allowedProvinces = metaOptions.provinces.map((p) => p.value);
    const allowedSchools = (metaOptions.schools ?? []).map((s) => s.value);
    const allowedRoles = roleOptions.map((o) => o.value);
    const allowedNotification = NOTIFICATION_CHANNELS;
    const resolvedRole = (() => {
      const candidate = normalizedRole || initialFormData.role;
      if (!candidate) return "";
      if (allowedRoles.length === 0) return candidate;
      return allowedRoles.includes(candidate) ? candidate : "";
    })();
    const resolvedPreferences =
      (normalizedPreferences ?? initialFormData.preferences).filter(
        (p) => p.preference_name,
      );
    const normalizeNotifyArray = (value: string[] | undefined) => {
      if (Array.isArray(value)) return value.filter(Boolean);
      return initialFormData.notifyVia;
    };
    const resolvedNotify = normalizeNotifyArray(mappedData.notifyVia).filter(
      (item) => allowedNotification.includes(item),
    );

    const hydratedData = {
      fullName: prefer(mappedData.fullName, initialFormData.fullName),
      birthDate: isoToDdMmYyyy(
        prefer(mappedData.birthDate, initialFormData.birthDate),
      ),
      gender: ensureOption(
        normalizedGender,
        allowedGenders,
        initialFormData.gender,
      ),
      address: prefer(mappedData.address, initialFormData.address),
      phone: prefer(mappedData.phone, initialFormData.phone),
      nationalId: prefer(mappedData.nationalId, initialFormData.nationalId),
      email: prefer(mappedData.email, initialFormData.email),
      parentPhone: prefer(mappedData.parentPhone, initialFormData.parentPhone),
      utmCampaign: prefer(mappedData.utmCampaign, initialFormData.utmCampaign),
      utmCampaignQr: prefer(
        mappedData.utmCampaignQr,
        initialFormData.utmCampaignQr,
      ),
      utmSales: prefer(mappedData.utmSales, initialFormData.utmSales),
      city: ensureOption(
        normalizedCity,
        allowedProvinces,
        initialFormData.city,
      ),
      school: ensureOption(
        normalizedSchool,
        allowedSchools,
        initialFormData.school,
      ),
      gradeLevel: ensureOption(
        normalizedGrade,
        allowedGrades,
        initialFormData.gradeLevel,
      ),
      academicPerformance: ensureOption(
        normalizedPerformance,
        allowedAcademic,
        initialFormData.academicPerformance,
      ),
      role: resolvedRole,
      gpa: prefer(mappedData.gpa, initialFormData.gpa),
      preferences: resolvedPreferences,
      socials: initialFormData.socials ?? [],
      notifyVia: resolvedNotify,
      confirmAccuracy:
        mappedData.confirmAccuracy ?? initialFormData.confirmAccuracy ?? false,
    };

    reset(hydratedData);
    if (process.env.NODE_ENV === "development") {
      console.debug("[career-form] hydrated", {
        city: hydratedData.city,
        school: hydratedData.school,
        schoolsCount: metaOptions.schools.length,
        initialSchoolQuery: initialSchoolQuery.current,
      });
    }
    hydratedSnapshot.current = hydratedData;
    setSocials(hydratedData.socials || []);
    skipNextSync.current = true;
    setAspirationInput("");
    setIsHydrating(false);
    hasHydrated.current = true;
  }, [searchParams, reset, metaOptions, metaReady]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    if (skipNextSync.current) {
      const snap = hydratedSnapshot.current;
      if (snap && JSON.stringify(formData) === JSON.stringify(snap)) {
        skipNextSync.current = false;
      }
      return;
    }

    const params = new URLSearchParams();
    const addParam = (key: string, value?: string | string[] | boolean) => {
      if (value === undefined || value === null) return;
      if (Array.isArray(value)) {
        if (value.length === 0) {
          params.set(key, "none");
          return;
        }
        params.set(key, value.join(","));
        return;
      }
      if (typeof value === "boolean") {
        params.set(key, value ? "true" : "false");
        return;
      }
      if (value === "") {
        params.set(key, "__empty");
        return;
      }
      params.set(key, value);
    };

    addParam("fullName", formData.fullName);
    addParam("birthDate", formData.birthDate);
    addParam("gender", formData.gender);
    addParam("address", formData.address);
    addParam("phone", formData.phone);
    addParam("parentPhone", formData.parentPhone);
    addParam("nationalId", formData.nationalId);
    addParam("email", formData.email);
    addParam("utmCampaign", formData.utmCampaign);
    addParam("utmCampaignQr", formData.utmCampaignQr);
    addParam("utmSales", formData.utmSales);
    addParam("role", formData.role);
    addParam("city", formData.city);
    addParam("school", formData.school);
    addParam("gradeLevel", formData.gradeLevel);
    addParam("academicPerformance", formData.academicPerformance);
    addParam("gpa", formData.gpa);
    addParam(
      "preferences",
      (formData.preferences || [])
        .map((p) =>
          [p.preference_name, p.subject_combination].filter(Boolean).join(":"),
        )
        .filter(Boolean),
    );
    addParam(
      "aspirations",
      (formData.preferences || [])
        .map((p) => p.preference_name || "")
        .filter(Boolean) as string[],
    );
    addParam(
      "socials",
      socials
        .filter((s) => s.platform || s.link_profile)
        .map((s) => `${s.platform}:${s.link_profile}`),
    );
    addParam("notifyVia", formData.notifyVia);
    addParam("confirmAccuracy", formData.confirmAccuracy);

    const query = params.toString();
    if (query === lastQuery.current) return;
    lastQuery.current = query;
    const target = query ? `${pathname}?${query}` : pathname;
    router.replace(target, { scroll: false });
  }, [formData, router, pathname]);

  useEffect(() => {
    if (!hasHydrated.current) return;
    (preferences || []).forEach((pref) => {
      const prefName = pref.preference_name;
      if (!prefName) return;
      if (fetchedComboPref.current.has(prefName)) return;
      fetchedComboPref.current.add(prefName);
      const addFallbackOption = (options: OptionItem[]) => {
        if (
          pref.subject_combination &&
          !options.some((opt) => opt.value === pref.subject_combination)
        ) {
          return [
            ...options,
            {
              value: pref.subject_combination,
              display: pref.subject_combination,
            },
          ];
        }
        return options;
      };
      searchSubjectCombination(prefName)
        .then((res) => {
          const options =
            (res?.data || []).map((item: any) => ({
              value: item?.name || "",
              display: item?.name || "",
            })) || [];
          setComboOptions((prev) => ({
            ...prev,
            [prefName]: addFallbackOption(options),
          }));
        })
        .catch(() => {
          setComboOptions((prev) => {
            if (prev[prefName]?.length) return prev;
            if (!pref.subject_combination) return prev;
            return {
              ...prev,
              [prefName]: [
                {
                  value: pref.subject_combination,
                  display: pref.subject_combination,
                },
              ],
            };
          });
        });
    });
  }, [preferences]);

  const handleAddPreference = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (preferences.some((p) => p.preference_name === trimmed)) {
      handleRemovePreference(trimmed);
      return;
    }
    if (preferences.length >= 3) return;
    const next = [
      ...preferences,
      { preference_name: trimmed, subject_combination: "" },
    ];
    setValue("preferences", next, { shouldDirty: true, shouldTouch: true });
    setAspirationInput("");
    setShowAspirationDropdown(false);
  };

  const handleRemovePreference = (value: string) => {
    fetchedComboPref.current.delete(value);
    const next = preferences.filter((item) => item.preference_name !== value);
    setValue("preferences", next, { shouldDirty: true, shouldTouch: true });
    setComboOptions((prev) => {
      const copy = { ...prev };
      delete copy[value];
      return copy;
    });
    setShowAspirationDropdown(false);
  };

  const handleNotifyChange = (channel: string, checked: boolean) => {
    const current = formData.notifyVia || [];
    const hasChannel = current.includes(channel);
    // Avoid redundant setValue to prevent unnecessary re-renders.
    if (checked === hasChannel) return;
    const next = checked
      ? Array.from(new Set([...current, channel]))
      : current.filter((c) => c !== channel);
    setValue("notifyVia", next, { shouldDirty: true, shouldTouch: true });
  };

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    console.debug("[career-form] options change", {
      provinces: metaOptions.provinces.length,
      schools: metaOptions.schools.length,
      city: formData.city,
      school: formData.school,
    });
  }, [
    metaOptions.provinces.length,
    metaOptions.schools.length,
    formData.city,
    formData.school,
  ]);

  const handleSelectSocialPlatform = (idx: number, platform: string) => {
    setSocials((prev) => {
      const next = [...prev];
      const currentEntry = next[idx] || { platform: "", link_profile: "" };
      const hasPhone = Boolean(phoneNumber);
      const shouldAutofill =
        hasPhone &&
        (platform === "Zalo" || platform === "WhatsApp") &&
        !(currentEntry.link_profile || "").trim();
      next[idx] = {
        ...currentEntry,
        platform,
        link_profile: shouldAutofill
          ? phoneNumber
          : currentEntry.link_profile || "",
      };
      return next;
    });
    setOpenSocialIndex(null);
  };

  const onSubmit = (data: FormData, captcha?: CaptchaSubmission) =>
    new Promise<void>(async (resolve, reject) => {
      try {
        setSubmitError(null);
        const fallbackRole = roleOptions[0]?.value || "Student";
        const primaryRole =
          data.role && data.role.trim() ? data.role : fallbackRole || "Student";
        const rawDateOfBirth = ddMmYyyyToIso(data.birthDate);
        const dateOfBirth =
          rawDateOfBirth && rawDateOfBirth.trim()
            ? rawDateOfBirth
            : null;
        const preferencesPayload =
          data.preferences
            ?.map((pref) => pref.preference_name)
            .filter(Boolean) || [];
        const payload = {
          full_name: data.fullName,
          mobile_no: formValidation.normalizePhoneForSubmit(data.phone),
          parent_phone:
            formValidation.normalizePhoneForSubmit(data.parentPhone) ||
            undefined,
          email: data.email,
          gender: data.gender,
          date_of_birth: dateOfBirth,
          role: primaryRole,
          national_id: formValidation.extractDigits(data.nationalId),
          province: data.city,
          state: data.city,
          school_name: data.school,
          class_stream: "",
          grade_level: data.gradeLevel,
          performance: data.academicPerformance,
          preferences: preferencesPayload,
          certificates: [],
          utm_campaign: data.utmCampaign || undefined,
          utm_campaign_qr: data.utmCampaignQr || undefined,
          utm_sales: data.utmSales || undefined,
          captchaProvider: captcha?.provider,
          captchaToken: captcha?.token,
          notify_vias: data.notifyVia || [],
          socials: socials
            .filter(
              (s) =>
                s.platform &&
                typeof s.link_profile === "string" &&
                s.link_profile.trim() !== "",
            )
            .map((s) => ({
              platform: s.platform,
              link_profile: s.link_profile,
            })),
        };
        await postCareerLead(payload);
        setShowSuccess(true);
        resolve();
      } catch (err) {
        console.log(err);
        console.error("Career consultation submit failed", err);
        const messageFromApi =
          (err as any)?.detail?.[0]?.message ||
          (err as any)?.message ||
          "Gửi thất bại, vui lòng thử lại.";
        setSubmitError(messageFromApi);
        reject(err);
      }
    });

  const {
    captchaDialog,
    isCaptchaBusy,
    isCaptchaSubmitting,
    submitWithCaptcha,
  } = useCaptchaSubmit<FormData>({
    formLabel: "Đăng ký tư vấn hướng nghiệp",
    onSubmit,
  });
  const isSubmitBlocked = submitDisabled || isCaptchaBusy;

  if (isHydrating) {
    return (
      <main
        className={cn(
          "min-h-screen bg-[#eef3f8] flex items-center justify-center",
          inter.className,
        )}
      >
        <div className="flex items-center gap-2 text-[#1f3f77]">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Đang tải dữ liệu...</span>
        </div>
      </main>
    );
  }

  return (
    <main
      className={cn(
        "career-form min-h-screen bg-[#eef3f8] flex justify-center px-2",
        inter.className,
      )}
    >
      <style jsx global>{`
        .career-form input,
        .career-form select,
        .career-form textarea {
          font-style: normal;
        }
        .career-form ::placeholder {
          font-style: italic;
        }
        .career-date-input::-webkit-calendar-picker-indicator {
          opacity: 0;
          display: none;
        }
        .career-date-input::-webkit-inner-spin-button,
        .career-date-input::-webkit-clear-button {
          display: none;
        }
        .career-date-input {
          appearance: none;
          -webkit-appearance: none;
        }
      `}</style>
      <div className="w-full max-w-[430px] bg-slate-50">
        <div className="relative h-36 sm:h-44 w-full overflow-hidden rounded-b-lg shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
          <Image
            src="/assets/career/banner-top.png"
            alt="Campus cover"
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/5 via-slate-900/25 to-slate-900/50" />
          <div className="absolute inset-0 flex items-center gap-3 px-4 sm:px-5">
            <div className="h-[68px] w-[70px] sm:h-[76px] sm:w-[79px] p-2 bg-white/80 rounded-lg shadow-sm">
              <Image
                src="/assets/career/logo.png"
                alt="Career logo"
                width={76}
                height={79}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="text-[#0f2b5a] leading-[1.02] [text-shadow:0_3px_12px_rgba(0,0,0,0.18)]">
              {campaignDisplay ? (
                <div className="text-[28px] sm:text-[32px] font-extrabold leading-[1.08] whitespace-pre-line">
                  {campaignDisplay}
                </div>
              ) : (
                <>
                  <div className="text-[28px] sm:text-[32px] font-extrabold">
                    Đăng ký tư vấn
                  </div>
                  <div className="-mt-0 text-[28px] sm:text-[32px] font-extrabold">
                    Hướng nghiệp
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(submitWithCaptcha)}
          noValidate
          className="px-4 pb-8 pt-5 space-y-4"
        >
          <section className={panelClass}>
            <div className="space-y-3 p-4">
              <LabeledInput
                label="Họ và Tên"
                required
                placeholder="Nhập họ và tên"
                inputProps={{ ...register("fullName"), className: inputClass }}
                error={formValidation.getErrorMessage(errors.fullName?.message)}
              />

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-900">
                  Người tạo hồ sơ
                </label>
                <div className="flex flex-wrap gap-2">
                  {roleOptions.map((option) => {
                    const checked = selectedRole === option.value;
                    return (
                      <label
                        key={option.value}
                        className={cn(
                          "flex items-center gap-2 py-2 text-sm font-medium transition-colors cursor-pointer",
                          checked ? "" : "hover:border-[#1f3f77]",
                        )}
                      >
                        <input
                          type="radio"
                          className="sr-only"
                          checked={checked}
                          onChange={() =>
                            setValue("role", option.value || "", {
                              shouldDirty: true,
                              shouldValidate: true,
                            })
                          }
                        />
                        <span className="inline-flex items-center gap-2">
                          <span
                            className={cn(
                              "flex h-4 w-4 items-center justify-center rounded-full border",
                              checked
                                ? "border-[#1f3f77] bg-[#1f3f77]"
                                : "border-[#c7cfdb]",
                            )}
                          >
                            {checked && (
                              <span className="h-2 w-2 rounded-full bg-white" />
                            )}
                          </span>
                          {option.display}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">
                    Ngày/ Tháng/ Năm sinh
                  </label>
                  <Controller
                    name="birthDate"
                    control={control}
                    render={({ field, fieldState }) => (
                      <>
                        <DatePickerInput
                          id="birthDate"
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          inputClassName={cn(
                            inputClass,
                            "appearance-none career-date-input",
                            fieldState.error &&
                              "border-red-500 focus:border-red-500 focus:ring-red-500/15",
                          )}
                        />
                        {fieldState.error?.message && (
                          <p className="text-sm text-red-600">
                            {fieldState.error.message}
                          </p>
                        )}
                      </>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">
                    Giới tính
                  </label>
                  <div className="relative">
                    <select
                      {...register("gender")}
                      className={cn(
                        selectClass,
                        "appearance-none leading-tight",
                      )}
                    >
                      <option value="">Chọn giới tính</option>
                      {genderOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.display}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1f3f77]" />
                  </div>
                </div>
              </div>

              {false && (
                <LabeledInput
                  label="Địa chỉ"
                  placeholder="Nhập địa chỉ"
                  inputProps={{ ...register("address"), className: inputClass }}
                />
              )}

              <LabeledInput
                label="Số điện thoại"
                required
                placeholder="Nhập số điện thoại"
                inputProps={{ ...register("phone"), className: inputClass }}
                error={formValidation.getErrorMessage(errors.phone?.message)}
              />
              <LabeledInput
                label="Số điện thoại phụ huynh"
                placeholder="Nhập số điện thoại phụ huynh"
                inputProps={{
                  ...register("parentPhone"),
                  className: inputClass,
                }}
                error={formValidation.getErrorMessage(
                  errors.parentPhone?.message,
                )}
              />

              <LabeledInput
                label="Căn cước công dân"
                required
                placeholder="Nhập căn cước công dân"
                inputProps={{
                  ...register("nationalId"),
                  className: inputClass,
                }}
                error={formValidation.getErrorMessage(
                  errors.nationalId?.message,
                )}
              />

              <LabeledInput
                label="Email"
                required
                placeholder="Nhập email"
                inputProps={{
                  ...register("email"),
                  className: inputClass,
                  type: "email",
                }}
                error={formValidation.getErrorMessage(errors.email?.message)}
              />

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-900">
                  Mạng xã hội
                </p>
                {socials.map((social, idx) => (
                  <div
                    key={`${social.platform}-${idx}`}
                    className="grid grid-cols-12 gap-2 items-center"
                  >
                    <div className="col-span-6 relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenSocialIndex(
                            openSocialIndex === idx ? null : idx,
                          )
                        }
                        className={cn(
                          selectClass,
                          "flex items-center gap-2 pr-10 text-left",
                          openSocialIndex === idx &&
                            "border-[#1f3f77] ring-2 ring-[#1f3f77]/15",
                        )}
                      >
                        {social.platform ? (
                          <>
                            <SocialIcon value={social.platform} />
                            <span>
                              {SOCIAL_OPTIONS.find(
                                (s) => s.value === social.platform,
                              )?.label || social.platform}
                            </span>
                          </>
                        ) : (
                          <span className="text-[#aeb7c3]">Nền tảng</span>
                        )}
                      </button>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      {openSocialIndex === idx && (
                        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                          {SOCIAL_OPTIONS.map((option) => (
                            <button
                              type="button"
                              key={option.value}
                              className={cn(
                                "flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-100",
                                social.platform === option.value &&
                                  "bg-[#eaf0ff]",
                              )}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                handleSelectSocialPlatform(idx, option.value);
                              }}
                            >
                              <SocialIcon value={option.value} />
                              <span>{option.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="col-span-5">
                      {(() => {
                        const platform = social.platform;
                        const placeholder =
                          platform === "Facebook"
                            ? "Dán link profile Facebook"
                            : platform === "Zalo"
                              ? "Nhập số điện thoại Zalo"
                              : platform === "TikTok"
                                ? "Nhập link hoặc ID TikTok"
                                : platform === "WhatsApp"
                                  ? "Nhập số điện thoại WhatsApp"
                                  : "Dán link profile";
                        const isPhone =
                          platform === "Zalo" || platform === "WhatsApp";
                        const inputMode = isPhone ? "tel" : undefined;
                        const type = isPhone ? "tel" : "text";
                        return (
                          <Input
                            value={social.link_profile}
                            placeholder={placeholder}
                            type={type}
                            inputMode={inputMode}
                            onChange={(e) => {
                              const next = [...socials];
                              next[idx] = {
                                ...next[idx],
                                link_profile: e.target.value,
                              };
                              setSocials(next);
                            }}
                            className={cn(inputClass, "h-11")}
                          />
                        );
                      })()}
                    </div>
                    <div className="col-span-1 flex items-center justify-end pr-1">
                      <button
                        type="button"
                        onClick={() =>
                          setSocials(socials.filter((_, i) => i !== idx))
                        }
                        className="h-8 w-8 flex items-center justify-center text-slate-600 hover:text-slate-800"
                        aria-label="Xóa mạng xã hội"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setSocials([...socials, { platform: "", link_profile: "" }])
                  }
                  className="w-full h-11"
                >
                  + Thêm nền tảng
                </Button>
              </div>
            </div>
          </section>

          <input type="hidden" {...register("utmCampaign")} />
          <input type="hidden" {...register("utmCampaignQr")} />
          <input type="hidden" {...register("utmSales")} />

          <section className={panelClass}>
            <div className="space-y-3 p-4">
              <SearchSelectField
                label="Tỉnh/Thành phố"
                name="city"
                control={control}
                placeholder="Chọn Tỉnh/Thành phố"
                options={provinceOptions}
                disabled
              />

              <SearchSelectField
                label="Trường học"
                name="school"
                control={control}
                placeholder="Chọn trường học"
                options={schoolOptions}
                readOnlyInput
                loading={loadingSchoolOptions}
                disabled
              />

              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">
                    Lớp học
                  </label>
                  <div className="relative">
                    <select
                      {...register("gradeLevel")}
                      className={cn(
                        selectClass,
                        "appearance-none leading-tight",
                      )}
                    >
                      <option value="">Chọn lớp</option>
                      {gradeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.display}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1f3f77]" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">
                    Học lực
                  </label>
                  <div className="relative">
                    <select
                      {...register("academicPerformance")}
                      className={cn(
                        selectClass,
                        "appearance-none leading-tight",
                      )}
                    >
                      <option value="">Chọn học lực</option>
                      {performanceOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.display}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1f3f77]" />
                  </div>
                </div>
                <LabeledInput
                  label="Điểm trung bình"
                  inputProps={{
                    ...register("gpa"),
                    type: "number",
                    step: "0.1",
                    min: "0",
                    max: "10",
                    placeholder: "Nhập điểm (ví dụ 8.5)",
                    inputMode: "decimal",
                    className: inputClass,
                  }}
                  error={formValidation.getErrorMessage(errors.gpa?.message)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-900">
                    Nguyện vọng (Tối đa 3 nguyện vọng)
                  </label>
                  <span className="text-xs text-slate-500">
                    {aspirationNames.length}/3
                  </span>
                </div>
                <div className="relative">
                  <Input
                    value={aspirationInput}
                    disabled={aspirationNames.length >= 3}
                    onChange={(e) => setAspirationInput(e.target.value)}
                    onFocus={() =>
                      aspirationNames.length < 3 && setShowAspirationDropdown(true)
                    }
                    onClick={() =>
                      aspirationNames.length < 3 && setShowAspirationDropdown(true)
                    }
                    onBlur={() =>
                      setTimeout(() => setShowAspirationDropdown(false), 120)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddPreference(aspirationInput);
                      }
                    }}
                    placeholder={
                      aspirationNames.length >= 3
                        ? "Đã đủ 3 nguyện vọng"
                        : "Tìm kiếm ngành/ưu tiên"
                    }
                    className={cn(
                      inputClass,
                      "pr-11",
                      aspirationNames.length >= 3 &&
                        "bg-slate-100 cursor-not-allowed",
                    )}
                  />
                  <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  {showAspirationDropdown && aspirationNames.length < 3 && (
                    <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                      {(preferenceSearch.length
                        ? preferenceSearch
                        : preferenceOptions
                      )
                        .slice(0, 20)
                        .map((option) => (
                          <button
                            type="button"
                            key={option.value}
                            className={cn(
                              "flex w-full items-center justify-between px-3 py-2 text-left text-sm",
                              aspirationNames.includes(option.value)
                                ? "bg-[#eaf0ff]"
                                : "hover:bg-slate-100",
                            )}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleAddPreference(option.value);
                            }}
                          >
                            <span>{option.display}</span>
                            {aspirationNames.includes(option.value) && (
                              <Check className="h-4 w-4 text-[#1f3f77]" />
                            )}
                          </button>
                        ))}
                      {preferenceLoading && (
                        <div className="px-3 py-2 text-sm text-slate-500">
                          Đang tìm...
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  {preferences.map((pref, idx) => (
                    <div
                      key={`${pref.preference_name}-${idx}`}
                      className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-slate-900">
                          {getPreferenceDisplay(pref.preference_name)}
                        </div>
                        <div className="text-xs text-slate-500">
                          Chọn tổ hợp xét tuyển
                        </div>
                        <div className="mt-2">
                          <select
                            value={pref.subject_combination}
                            onChange={(e) => {
                              const next = [...preferences];
                              next[idx] = {
                                ...pref,
                                subject_combination: e.target.value,
                              };
                              setValue("preferences", next, {
                                shouldDirty: true,
                                shouldTouch: true,
                              });
                            }}
                            onFocus={async () => {
                              const existing =
                                comboOptions[pref.preference_name] || [];
                              const onlyFallback =
                                existing.length === 1 &&
                                pref.subject_combination &&
                                existing[0].value === pref.subject_combination;
                              if (existing.length > 0 && !onlyFallback) return;
                              try {
                                const res = await searchSubjectCombination(
                                  pref.preference_name,
                                );
                                const options =
                                  (res?.data || []).map((item: any) => ({
                                    value: item?.name || "",
                                    display: item?.name || "",
                                  })) || [];
                                setComboOptions((prev) => ({
                                  ...prev,
                                  [pref.preference_name]:
                                    pref.subject_combination &&
                                    !options.some(
                                      (opt) =>
                                        opt.value === pref.subject_combination,
                                    )
                                      ? [
                                          ...options,
                                          {
                                            value: pref.subject_combination,
                                            display: pref.subject_combination,
                                          },
                                        ]
                                      : options,
                                }));
                              } catch (err) {
                                console.warn(
                                  "Load subject combination failed",
                                  err,
                                );
                              }
                            }}
                            className={cn(
                              selectClass,
                              "appearance-none leading-tight",
                            )}
                          >
                            <option value="">Chọn tổ hợp</option>
                            {(() => {
                              const baseOptions =
                                comboOptions[pref.preference_name] || [];
                              const hasSelected =
                                pref.subject_combination &&
                                !baseOptions.some(
                                  (opt) =>
                                    opt.value === pref.subject_combination,
                                );
                              const options = hasSelected
                                ? [
                                    {
                                      value: pref.subject_combination,
                                      display: pref.subject_combination,
                                    },
                                    ...baseOptions,
                                  ]
                                : baseOptions;
                              return options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                  {opt.display}
                                </option>
                              ));
                            })()}
                          </select>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemovePreference(pref.preference_name)
                        }
                        className="text-sm text-slate-500 hover:text-red-600"
                        aria-label="Xóa nguyện vọng"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className={panelClass}>
            <div className="space-y-4 p-4">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-900">
                  Bạn muốn nhận thông báo qua
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {NOTIFICATION_CHANNELS.map((channel) => {
                    const checked = (formData.notifyVia || []).includes(
                      channel,
                    );
                    const enabled = canSelectChannel(channel);
                    return (
                      <label
                        key={channel}
                        className={cn(
                          "flex items-center gap-2 text-sm capitalize transition-colors",
                          enabled
                            ? "cursor-pointer"
                            : "cursor-not-allowed opacity-60",
                          checked
                            ? "border-[#1f3f77] bg-white text-[#1f3f77]"
                            : "border-[#d7dde7] bg-white text-slate-700 hover:border-[#1f3f77]",
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={!enabled}
                          onCheckedChange={(c) => {
                            if (!enabled) return;
                            if (typeof c !== "boolean") return;
                            handleNotifyChange(channel, c);
                          }}
                        />
                        <span className="inline-flex items-center gap-2">
                          <SocialIcon value={channel} />
                          {channel}
                        </span>
                      </label>
                    );
                  })}
                </div>
                {/* <p className="text-xs text-red-600">
                  Nhập email và thêm kênh mạng xã hội tương ứng để bật lựa chọn.
                </p> */}
              </div>
            </div>
          </section>

          <label className="flex items-start gap-3 text-sm text-slate-800">
            <Checkbox
              checked={watch("confirmAccuracy")}
              onCheckedChange={(checked) =>
                setValue("confirmAccuracy", Boolean(checked), {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                })
              }
              className="mt-0.5"
            />
            <span className="italic">
              Xác nhận những thông tin trên là chính xác.
            </span>
          </label>
          {formValidation.getErrorMessage(errors.confirmAccuracy?.message) && (
            <p className="text-sm text-red-600">
              {formValidation.getErrorMessage(errors.confirmAccuracy?.message)}
            </p>
          )}
          <Button
            type="submit"
            disabled={isSubmitBlocked}
            className="w-full h-11 rounded-md bg-[#1a3561] text-white text-[15px] font-semibold hover:bg-[#18335f]"
          >
            {isSubmitting || isCaptchaSubmitting ? "Đang gửi..." : "Đăng ký"}
          </Button>
          {submitError && (
            <p className="text-sm text-red-600 text-center">{submitError}</p>
          )}
        </form>
      </div>
      {captchaDialog}
      {showSuccess && (
        <FormSuccessModal
          title="Đăng ký thành công"
          description="Thông tin tư vấn của bạn đã được ghi nhận. Theo dõi các kênh bên dưới để nhận thêm thông tin mới nhất từ trường."
          onClose={() => setShowSuccess(false)}
        />
      )}
    </main>
  );
}

type LabeledInputProps = {
  label: string;
  required?: boolean;
  placeholder?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  error?: string;
};

function SearchSelectField({
  label,
  name,
  control,
  options,
  required,
  placeholder,
  disabled,
  readOnlyInput,
  loading,
}: {
  label: string;
  name: keyof FormData;
  control: Control<FormData>;
  options: OptionItem[];
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  readOnlyInput?: boolean;
  loading?: boolean;
}) {
  const {
    field: { value, onChange, onBlur, name: fieldName, ref },
    fieldState,
  } = useController({ name, control });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value) || null,
    [options, value],
  );

  useEffect(() => {
    setQuery(selectedOption?.display || "");
  }, [selectedOption?.display]);

  const normalizedQuery = normalizeText(query);
  const filteredOptions = useMemo(() => {
    if (!normalizedQuery) return options;
    return options.filter((opt) =>
      normalizeText(`${opt.display} ${opt.value}`).includes(normalizedQuery),
    );
  }, [options, normalizedQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        onBlur();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlur]);

  const handleSelect = (option: OptionItem | null) => {
    onChange(option?.value || "");
    setQuery(option?.display || "");
    setOpen(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (filteredOptions[0]) handleSelect(filteredOptions[0]);
    }
    if (e.key === "Escape") setOpen(false);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setOpen(false);
      onBlur();
      setQuery(options.find((opt) => opt.value === value)?.display || "");
    }, 80);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative" ref={containerRef}>
        <Input
          ref={ref}
          name={fieldName}
          value={query}
          readOnly={readOnlyInput}
          onChange={
            readOnlyInput
              ? undefined
              : (e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                }
          }
          onFocus={() => {
            if (!loading) setOpen(true);
          }}
          onClick={() => {
            if (!loading) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder || "Chọn"}
          disabled={disabled || loading}
          autoComplete="off"
          aria-invalid={Boolean(fieldState.error)}
          className={cn(
            selectClass,
            "appearance-none pr-10 text-left",
            (disabled || loading) && "bg-slate-100",
            fieldState.error &&
              "border-red-500 focus:border-red-500 focus:ring-red-500/15",
          )}
        />
        {value && !disabled && !loading && (
          <button
            type="button"
            className="absolute right-9 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            onMouseDown={(e) => {
              e.preventDefault();
              handleSelect(null);
              setOpen(true);
            }}
            aria-label={`Xóa ${label}`}
          >
            ×
          </button>
        )}
        {loading ? (
          <Loader2 className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1f3f77] animate-spin" />
        ) : (
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1f3f77]" />
        )}
        {open && !disabled && !loading && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg max-h-64">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-slate-500">
                Không tìm thấy kết quả
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {filteredOptions.map((option) => (
                  <button
                    type="button"
                    key={option.value}
                    className={cn(
                      "flex w-full flex-col items-start px-3 py-2 text-left text-sm hover:bg-slate-100",
                      option.value === value && "bg-[#eaf0ff]",
                    )}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(option);
                    }}
                  >
                    <span className="font-medium text-slate-800">
                      {option.display}
                    </span>
                    {option.sub_title && (
                      <span className="text-[11px] text-slate-500">
                        {option.sub_title}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {options.length > filteredOptions.length && (
              <div className="border-t px-3 py-2 text-[11px] text-slate-400">
                Hiển thị {filteredOptions.length}/{options.length} kết quả
              </div>
            )}
          </div>
        )}
      </div>
      {fieldState.error?.message && (
        <p className="text-sm text-red-600">{fieldState.error.message}</p>
      )}
    </div>
  );
}

function LabeledInput({
  label,
  required,
  placeholder,
  inputProps,
  error,
}: LabeledInputProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Input
        {...inputProps}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={cn(
          "italic",
          inputProps?.className,
          error && "border-red-500 focus:border-red-500 focus:ring-red-500/15",
        )}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

type NotificationPillProps = {
  label: string;
  active: boolean;
  onClick: () => void;
};

function NotificationPill({ label, active, onClick }: NotificationPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-2 text-sm capitalize transition-colors",
        active
          ? "border-[#1f3f77] bg-white text-[#1f3f77]"
          : "border-[#d7dde7] bg-white text-slate-700 hover:border-[#1f3f77]",
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-full border",
          active ? "border-[#f2c94c] bg-[#f2c94c]" : "border-slate-300",
        )}
      >
        {active && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      {label}
    </button>
  );
}
function SocialIcon({ value }: { value: string }) {
  const sizeClass = "h-5 w-5 rounded-full object-contain";
  const src = SOCIAL_OPTIONS.find((s) => s.value === value)?.icon;
  if (!src) return null;
  return (
    <Image src={src} alt={value} width={20} height={20} className={sizeClass} />
  );
}

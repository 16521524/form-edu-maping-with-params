"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useController,
  useForm,
  useWatch,
  type Control,
  type UseFormRegisterReturn,
} from "react-hook-form";
import { Inter } from "next/font/google";
import { CalendarDays, ChevronDown, Loader2 } from "lucide-react";

import formMeta from "@/lib/form-meta.json";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  ICareerMetadataSchool,
  getMetadataCareer,
  getMetadataSchools,
  getMetadataWards,
  postAdmissionApplication,
} from "@/servers";
import CareerSuccessModal from "./career-success-modal";

type FormData = {
  fullName: string;
  gender: string;
  birthDate: string;
  nationalId: string;
  studentPhone: string;
  parentPhone: string;
  email: string;
  permanentProvince: string;
  permanentWard: string;
  permanentStreet: string;
  permanentHouse: string;
  grade12Province: string;
  grade12School: string;
  grade12Class: string;
  graduationYear: string;
  receivingProvince: string;
  receivingWard: string;
  receivingStreet: string;
  receivingHouse: string;
  applySameAddress: boolean;
  confirmAccuracy: boolean;
  conversationId?: string;
  sectionId?: string;
};

type OptionItem = {
  value: string;
  display: string;
  text_color?: string;
  background_color?: string;
  sub_title?: string;
};

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

const metaData = (formMeta as any).data ?? {};
const fallbackProvinces: OptionItem[] = mapDataOptions(metaData.provinces);
const fallbackGenders: OptionItem[] = mapDataOptions(metaData.genders);
const fallbackSchools: OptionItem[] = mapDataOptions(metaData.schools);

const initialFormData: FormData = {
  fullName: "",
  gender: "",
  birthDate: "",
  nationalId: "",
  studentPhone: "",
  parentPhone: "",
  email: "",
  permanentProvince: "",
  permanentWard: "",
  permanentStreet: "",
  permanentHouse: "",
  grade12Province: "",
  grade12School: "",
  grade12Class: "",
  graduationYear: "",
  receivingProvince: "",
  receivingWard: "",
  receivingStreet: "",
  receivingHouse: "",
  applySameAddress: false,
  confirmAccuracy: false,
  conversationId: "",
  sectionId: "",
};

const panelClass =
  "rounded-2xl border border-[#e2e7ef] bg-white shadow-[0_8px_22px_rgba(31,63,119,0.06)]";

const inputClass =
  "h-11 w-full rounded-lg border border-[#d7dde7] bg-white text-[15px] text-slate-800 placeholder:italic placeholder:text-[#a8afbb] shadow-[inset_0_1px_0_rgba(0,0,0,0.04)] focus:border-[#1f3f77] focus:ring-2 focus:ring-[#1f3f77]/15";

const selectClass =
  "h-11 w-full rounded-[10px] border border-[#cfd6e1] bg-white px-4 pr-12 text-[13px] font-medium text-slate-800 placeholder:italic placeholder:text-[#aeb7c3] leading-[22px] shadow-[inset_0_1px_0_rgba(0,0,0,0.04)] focus:border-[#1f3f77] focus:ring-2 focus:ring-[#1f3f77]/15";

const yearOptions = (() => {
  const current = new Date().getFullYear();
  const limit = current + 1;
  return Array.from({ length: 8 }, (_, idx) => String(limit - idx));
})();

const normalizeText = (val: string) =>
  (val || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const isoToDdMmYyyy = (val?: string) => {
  if (!val) return "";
  const match = val.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return val;
  const [, y, m, d] = match;
  return `${d}/${m}/${y}`;
};

const ddMmYyyyToIso = (val?: string) => {
  if (!val) return "";
  const match = val.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return val;
  const [, d, m, y] = match;
  return `${y}-${m}-${d}`;
};

const formatBirthInput = (raw: string) => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  let result = day;
  if (month) result = `${day}/${month}`;
  if (year) result = `${day}/${month}/${year}`;
  return result;
};

function mapDataOptions(items: any[] | undefined): OptionItem[] {
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
        sub_title: item.sub_title ?? '',
      };
    })
    .filter(Boolean) as OptionItem[];
}

const toOptionItem = (item: any): OptionItem | null => {
  if (!item) return null;
  if (typeof item === "string") {
    return { value: String(item), display: String(item) };
  }
  const value = item.value ?? item.display;
  const display = item.display ?? item.value;
  if (!value && !display) return null;
  const sub_title = item.sub_title ?? '';
  return {
    value: String(value),
    display: String(display),
    text_color: item.text_color,
    background_color: item.background_color,
    sub_title: sub_title ? String(sub_title) : undefined,
  };
};

const normalizeOptions = (
  source: any,
  fallback: OptionItem[] = []
): OptionItem[] => {
  if (Array.isArray(source)) {
    const normalized = source.map(toOptionItem).filter(Boolean) as OptionItem[];
    if (normalized.length) return normalized;
  }
  return fallback;
};

const coerceToValue = (
  raw: string | undefined,
  options: OptionItem[]
): string | undefined => {
  if (!raw) return raw;
  const byValue = options.find((opt) => opt.value === raw);
  if (byValue) return byValue.value;
  const byDisplay = options.find((opt) => opt.display === raw);
  if (byDisplay) return byDisplay.value;
  return raw;
};

const buildStreetAddress = (house?: string, street?: string) => {
  const parts = [house?.trim(), street?.trim()].filter(Boolean);
  return parts.join(" ").trim();
};

const buildQueryString = (data: FormData) => {
  const params = new URLSearchParams();
  const addParam = (key: string, value?: string | boolean) => {
    if (value === undefined || value === null) return;
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

  addParam("fullName", data.fullName);
  addParam("gender", data.gender);
  addParam("birthDate", data.birthDate);
  addParam("nationalId", data.nationalId);
  addParam("studentPhone", data.studentPhone);
  addParam("parentPhone", data.parentPhone);
  addParam("email", data.email);
  addParam("permanentProvince", data.permanentProvince);
  addParam("permanentWard", data.permanentWard);
  addParam("permanentStreet", data.permanentStreet);
  addParam("permanentHouse", data.permanentHouse);
  addParam("grade12Province", data.grade12Province);
  addParam("grade12School", data.grade12School);
  addParam("grade12Class", data.grade12Class);
  addParam("graduationYear", data.graduationYear);
  addParam("receivingProvince", data.receivingProvince);
  addParam("receivingWard", data.receivingWard);
  addParam("receivingStreet", data.receivingStreet);
  addParam("receivingHouse", data.receivingHouse);
  addParam("applySameAddress", data.applySameAddress);
  addParam("confirmAccuracy", data.confirmAccuracy);
  addParam("conversationId", data.conversationId);
  addParam("section_id", data.sectionId);
  return params.toString();
};

export default function AdmissionApplicationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const lastQuery = useRef<string>("");
  const hasHydrated = useRef(false);
  const skipNextSync = useRef(false);
  const hydratedSnapshot = useRef<FormData | null>(null);
  const initialGrade12SchoolQuery = useRef<string | null>(null);
  const prevGrade12Province = useRef<string>("");
  const prevPermanentProvince = useRef<string>("");
  const prevReceivingProvince = useRef<string>("");
  const [isHydrating, setIsHydrating] = useState(true);
  const [loadingPermanentWard, setLoadingPermanentWard] = useState(false);
  const [loadingReceivingWard, setLoadingReceivingWard] = useState(false);
  const [loadingGrade12School, setLoadingGrade12School] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const birthInputRef = useRef<HTMLInputElement | null>(null);
  const [metaReady, setMetaReady] = useState(false);
  const [metaOptions, setMetaOptions] = useState<{
    genders: OptionItem[];
    provinces: OptionItem[];
  }>({
    genders: [],
    provinces: [],
  });
  const [wardOptionsPermanent, setWardOptionsPermanent] = useState<OptionItem[]>(
    []
  );
  const [wardOptionsReceiving, setWardOptionsReceiving] = useState<OptionItem[]>(
    []
  );
  const [schoolOptionsGrade12, setSchoolOptionsGrade12] = useState<OptionItem[]>(
    []
  );
  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormData>({
    defaultValues: initialFormData,
  });
  const formData = useWatch({ control });
  const { field: applySameAddressField } = useController({
    name: "applySameAddress",
    control,
  });
  const { field: confirmAccuracyField } = useController({
    name: "confirmAccuracy",
    control,
  });

  const genderOptions =
    metaOptions.genders.length > 0 ? metaOptions.genders : fallbackGenders;
  const provinceOptions =
    metaOptions.provinces.length > 0
      ? metaOptions.provinces
      : fallbackProvinces;
  const permanentWardOptions = wardOptionsPermanent;
  const receivingWardOptions = wardOptionsReceiving;
  const grade12SchoolOptions =
    schoolOptionsGrade12.length > 0 ? schoolOptionsGrade12 : fallbackSchools;

  const requiredFields: (keyof FormData)[] = [
    "fullName",
    "gender",
    "birthDate",
    "nationalId",
    "studentPhone",
    "parentPhone",
    "email",
    "permanentProvince",
    "permanentWard",
    "permanentStreet",
    "grade12Province",
    "grade12School",
    "grade12Class",
    "graduationYear",
    "receivingProvince",
    "receivingWard",
    "receivingStreet",
  ];

  const requiredFieldsFilled = requiredFields.every((field) => {
    const value = formData[field];
    if (typeof value === "string") return value.trim() !== "";
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  });

  const submitDisabled =
    isSubmitting || !confirmAccuracyField.value || !requiredFieldsFilled;

  useEffect(() => {
    const prevProvince = prevPermanentProvince.current;
    if (prevProvince && prevProvince !== formData.permanentProvince) {
      // Province changed or cleared: drop stale ward selection immediately.
      skipNextSync.current = true;
      setValue("permanentWard", "", { shouldDirty: true });
    }
    prevPermanentProvince.current = formData.permanentProvince || "";
  }, [formData.permanentProvince, setValue]);

  useEffect(() => {
    let active = true;
    const loadMeta = async () => {
      try {
        const json = await getMetadataCareer();
        if (!active) return;
        const data = json?.data ?? {};
        const genders = normalizeOptions(data.genders, fallbackGenders);
        const provinces = normalizeOptions(data.provinces, fallbackProvinces);
        setMetaOptions({ genders, provinces });
      } catch (err) {
        setMetaOptions({
          genders: fallbackGenders,
          provinces: fallbackProvinces,
        });
      } finally {
        if (active) setMetaReady(true);
      }
    };
    loadMeta();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!formData.permanentProvince) {
      setWardOptionsPermanent([]);
      if (formData.permanentWard) {
        setValue("permanentWard", "", { shouldDirty: true });
      }
      setLoadingPermanentWard(false);
      return;
    }
    let active = true;
    setLoadingPermanentWard(true);
    getMetadataWards({ province: formData.permanentProvince })
      .then((res) => {
        if (!active) return;
        const opts = normalizeOptions(res?.data, []);
        const withSelected =
          formData.permanentWard && !opts.some((opt) => opt.value === formData.permanentWard)
            ? [...opts, { value: formData.permanentWard, display: formData.permanentWard }]
            : opts;
        const normalizedWard = coerceToValue(formData.permanentWard, withSelected);
        setWardOptionsPermanent(withSelected);
        if (normalizedWard && normalizedWard !== formData.permanentWard) {
          skipNextSync.current = true;
          setValue("permanentWard", normalizedWard, { shouldDirty: true });
        }
      })
      .catch(() => setWardOptionsPermanent([]))
      .finally(() => {
        if (active) setLoadingPermanentWard(false);
      });
    return () => {
      active = false;
      setLoadingPermanentWard(false);
    };
  }, [formData.permanentProvince, formData.permanentWard, setValue]);

  useEffect(() => {
    if (formData.applySameAddress) {
      setLoadingReceivingWard(false);
      if (formData.receivingProvince !== formData.permanentProvince) {
        skipNextSync.current = true;
        setValue("receivingProvince", formData.permanentProvince ?? "", {
          shouldDirty: true,
        });
      }

      if (formData.receivingWard !== formData.permanentWard) {
        skipNextSync.current = true;
        setValue("receivingWard", formData.permanentWard ?? "", {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
      if (formData.receivingStreet !== formData.permanentStreet) {
        skipNextSync.current = true;
        setValue("receivingStreet", formData.permanentStreet ?? "", {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
      if (formData.receivingHouse !== formData.permanentHouse) {
        skipNextSync.current = true;
        setValue("receivingHouse", formData.permanentHouse ?? "", {
          shouldDirty: true,
          shouldTouch: true,
        });
      }
      setWardOptionsReceiving(wardOptionsPermanent);
      setLoadingReceivingWard(false);
      return;
    }

    const prevProvince = prevReceivingProvince.current;
    if (
      prevProvince &&
      prevProvince !== formData.receivingProvince &&
      !formData.applySameAddress
    ) {
      // Province changed: clear stale ward to avoid showing a ward from another province.
      skipNextSync.current = true;
      setValue("receivingWard", "", { shouldDirty: true });
    }
    prevReceivingProvince.current = formData.receivingProvince || "";

    if (!formData.receivingProvince) {
      setWardOptionsReceiving([]);
      if (formData.receivingWard) {
        skipNextSync.current = true;
        setValue("receivingWard", "", { shouldDirty: true });
      }
      setLoadingReceivingWard(false);
      return;
    }
    let active = true;
    setLoadingReceivingWard(true);
    getMetadataWards({ province: formData.receivingProvince })
      .then((res) => {
        if (!active) return;
        const opts = normalizeOptions(res?.data, []);
        const nextOptions =
          formData.applySameAddress || !formData.receivingWard
            ? opts
            : !opts.some((opt) => opt.value === formData.receivingWard)
              ? [...opts, { value: formData.receivingWard, display: formData.receivingWard }]
              : opts;
        const normalizedWard = coerceToValue(formData.receivingWard, nextOptions);
        setWardOptionsReceiving(nextOptions);
        if (formData.applySameAddress) {
          const targetWard = formData.permanentWard ?? "";
          if (targetWard !== formData.receivingWard) {
            skipNextSync.current = true;
            setValue("receivingWard", targetWard, {
              shouldDirty: true,
              shouldTouch: true,
            });
          }
        } else if (normalizedWard && normalizedWard !== formData.receivingWard) {
          skipNextSync.current = true;
          setValue("receivingWard", normalizedWard, { shouldDirty: true });
        }
        setLoadingReceivingWard(false);
      })
      .catch(() => {
        setWardOptionsReceiving([]);
        setLoadingReceivingWard(false);
      });
    return () => {
      active = false;
      setLoadingReceivingWard(false);
    };
  }, [
    formData.applySameAddress,
    formData.permanentProvince,
    formData.permanentWard,
    formData.permanentStreet,
    formData.permanentHouse,
    formData.receivingProvince,
    formData.receivingWard,
    formData.receivingStreet,
    formData.receivingHouse,
    wardOptionsPermanent,
    setValue,
  ]);

  useEffect(() => {
    const prevProvince = prevGrade12Province.current;
    if (prevProvince && prevProvince !== formData.grade12Province) {
      skipNextSync.current = true;
      setSchoolOptionsGrade12([]);
      if (formData.grade12School) {
        setValue("grade12School", "", { shouldDirty: true });
      }
      initialGrade12SchoolQuery.current = null;
    }
    prevGrade12Province.current = formData.grade12Province || "";

    if (!formData.grade12Province) {
      setSchoolOptionsGrade12([]);
      if (formData.grade12School) {
        skipNextSync.current = true;
        setValue("grade12School", "", { shouldDirty: true });
      }
      setLoadingGrade12School(false);
      return;
    }
    let active = true;
    setLoadingGrade12School(true);
    getMetadataSchools({ province: formData.grade12Province })
      .then((res) => {
        if (!active) return;
        const convertData = (data: ICareerMetadataSchool[]) => {
          return data.map((item) => ({
            value: item?.value,
            display: item.display,
            sub_title: item?.sub_title,
          }));
        };

        const opts = normalizeOptions(convertData(res?.data ?? []), fallbackSchools);
        setSchoolOptionsGrade12(opts);
        const targetSchool =
          formData.grade12School ||
          initialGrade12SchoolQuery.current ||
          "";
        const normalizedSchool = coerceToValue(targetSchool, opts);
        if (normalizedSchool && normalizedSchool !== formData.grade12School) {
          skipNextSync.current = true;
          setValue("grade12School", normalizedSchool, { shouldDirty: true });
        }
        if (initialGrade12SchoolQuery.current && normalizedSchool) {
          initialGrade12SchoolQuery.current = null;
        }
        if (process.env.NODE_ENV === "development") {
          console.debug("[admission-form] grade12 schools fetched", {
            province: formData.grade12Province,
            count: opts.length,
            targetSchool,
            normalizedSchool,
            current: formData.grade12School,
          });
        }
      })
      .catch(() => setSchoolOptionsGrade12(fallbackSchools))
      .finally(() => {
        if (active) setLoadingGrade12School(false);
      });
    return () => {
      active = false;
      setLoadingGrade12School(false);
    };
  }, [formData.grade12Province, setValue]);

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
    const getDecoded = (key: keyof FormData | string) => {
      const value = searchParams.get(key);
      if (value === null) return undefined;
      return decodeParam(value);
    };
    const getVal = (key: keyof FormData | string) => {
      const decoded = getDecoded(key);
      if (decoded === undefined) return undefined;
      if (decoded === "__empty") return "";
      return decoded;
    };
    const getBool = (keys: (keyof FormData | string)[], fallback = false) => {
      for (const key of keys) {
        const value = getDecoded(key);
        if (value !== undefined) return value === "true";
      }
      return fallback;
    };

    const mappedData: Partial<FormData> = {
      fullName: getVal("fullName"),
      gender: getVal("gender"),
      birthDate: getVal("birthDate"),
      nationalId: getVal("nationalId"),
      studentPhone: getVal("studentPhone"),
      parentPhone: getVal("parentPhone"),
      email: getVal("email"),
      permanentProvince: getVal("permanentProvince"),
      permanentWard: getVal("permanentWard"),
      permanentStreet: getVal("permanentStreet"),
      permanentHouse: getVal("permanentHouse"),
      grade12Province: getVal("grade12Province"),
      grade12School: getVal("grade12School"),
      grade12Class: getVal("grade12Class"),
      graduationYear: getVal("graduationYear"),
      receivingProvince: getVal("receivingProvince"),
      receivingWard: getVal("receivingWard"),
      receivingStreet: getVal("receivingStreet"),
      receivingHouse: getVal("receivingHouse"),
      conversationId: getVal("conversationId") || undefined,
      sectionId: getVal("section_id") || getVal("sectionId") || undefined,
      applySameAddress: getBool(["applySameAddress"]),
      confirmAccuracy: getBool(["confirmAccuracy"], initialFormData.confirmAccuracy),
    };
    if (initialGrade12SchoolQuery.current === null) {
      initialGrade12SchoolQuery.current = mappedData.grade12School ?? null;
    }

    const normalizedGender = coerceToValue(mappedData.gender, genderOptions);
    const normalizedPermanentProvince = coerceToValue(
      mappedData.permanentProvince,
      provinceOptions
    );
    const normalizedPermanentWard = coerceToValue(
      mappedData.permanentWard,
      permanentWardOptions
    );
    const normalizedGradeProvince = coerceToValue(
      mappedData.grade12Province,
      provinceOptions
    );
    const normalizedGradeSchool = coerceToValue(
      mappedData.grade12School,
      grade12SchoolOptions
    );
    const normalizedReceivingProvince = coerceToValue(
      mappedData.receivingProvince,
      provinceOptions
    );
    const normalizedReceivingWard = coerceToValue(
      mappedData.receivingWard,
      receivingWardOptions
    );

    const allowedGenders = genderOptions.map((o) => o.value);
    const allowedProvinces = provinceOptions.map((o) => o.value);
    const allowedPermanentWards = permanentWardOptions.map((o) => o.value);
    const allowedReceivingWards = receivingWardOptions.map((o) => o.value);
    const allowedSchools = grade12SchoolOptions.map((o) => o.value);

    const ensureOption = (
      value: string | undefined,
      allowed: string[],
      fallback: string | undefined
    ) => {
      if (value === "") return "";
      if (allowed.length === 0) return value ?? fallback ?? "";
      if (value && allowed.includes(value)) return value;
      if (fallback && allowed.includes(fallback)) return fallback;
      return "";
    };

    const prefer = (value: string | undefined, fallback: string | undefined) =>
      value === undefined ? fallback ?? "" : value;

    const hydratedData: FormData = {
      fullName: prefer(mappedData.fullName, initialFormData.fullName),
      gender: ensureOption(
        normalizedGender,
        allowedGenders,
        initialFormData.gender
      ),
      birthDate: isoToDdMmYyyy(
        prefer(mappedData.birthDate, initialFormData.birthDate)
      ),
      nationalId: prefer(mappedData.nationalId, initialFormData.nationalId),
      studentPhone: prefer(
        mappedData.studentPhone,
        initialFormData.studentPhone
      ),
      parentPhone: prefer(mappedData.parentPhone, initialFormData.parentPhone),
      email: prefer(mappedData.email, initialFormData.email),
      permanentProvince: ensureOption(
        normalizedPermanentProvince,
        allowedProvinces,
        initialFormData.permanentProvince
      ),
      permanentWard: ensureOption(
        normalizedPermanentWard,
        allowedPermanentWards,
        initialFormData.permanentWard
      ),
      permanentStreet: prefer(
        mappedData.permanentStreet,
        initialFormData.permanentStreet
      ),
      permanentHouse: prefer(
        mappedData.permanentHouse,
        initialFormData.permanentHouse
      ),
      grade12Province: ensureOption(
        normalizedGradeProvince,
        allowedProvinces,
        initialFormData.grade12Province
      ),
      grade12School: ensureOption(
        normalizedGradeSchool,
        allowedSchools,
        initialFormData.grade12School
      ),
      grade12Class: prefer(
        mappedData.grade12Class,
        initialFormData.grade12Class
      ),
      graduationYear: prefer(
        mappedData.graduationYear,
        initialFormData.graduationYear
      ),
      receivingProvince: ensureOption(
        normalizedReceivingProvince,
        allowedProvinces,
        initialFormData.receivingProvince
      ),
      receivingWard: ensureOption(
        normalizedReceivingWard,
        allowedReceivingWards,
        initialFormData.receivingWard
      ),
      receivingStreet: prefer(
        mappedData.receivingStreet,
        initialFormData.receivingStreet
      ),
      receivingHouse: prefer(
        mappedData.receivingHouse,
        initialFormData.receivingHouse
      ),
      applySameAddress:
        mappedData.applySameAddress ?? initialFormData.applySameAddress,
      confirmAccuracy:
        mappedData.confirmAccuracy ?? initialFormData.confirmAccuracy,
      conversationId: prefer(
        mappedData.conversationId,
        initialFormData.conversationId
      ),
      sectionId: prefer(mappedData.sectionId, initialFormData.sectionId),
    };

    if (hydratedData.applySameAddress) {
      hydratedData.receivingProvince = hydratedData.permanentProvince;
      hydratedData.receivingWard = hydratedData.permanentWard;
      hydratedData.receivingStreet = hydratedData.permanentStreet;
      hydratedData.receivingHouse = hydratedData.permanentHouse;
    }

    reset(hydratedData);
    hydratedSnapshot.current = hydratedData;
    lastQuery.current = buildQueryString(hydratedData);
    if (process.env.NODE_ENV === "development") {
      console.debug("[admission-form] hydrated", {
        grade12Province: hydratedData.grade12Province,
        grade12School: hydratedData.grade12School,
        initialGrade12SchoolQuery: initialGrade12SchoolQuery.current,
      });
    }
    skipNextSync.current = true;
    setIsHydrating(false);
    hasHydrated.current = true;
  }, [
    searchParams,
    reset,
    metaReady,
    genderOptions,
    provinceOptions,
    permanentWardOptions,
    receivingWardOptions,
    grade12SchoolOptions,
  ]);

  useEffect(() => {
    if (!hasHydrated.current || isHydrating) return;
    const snap = hydratedSnapshot.current;
    if (snap && JSON.stringify(formData) === JSON.stringify(snap)) return;
    if (skipNextSync.current) {
      const snap = hydratedSnapshot.current;
      // Allow one skip when matching snapshot; otherwise resume syncing on next render.
      if (snap && JSON.stringify(formData) === JSON.stringify(snap)) {
        skipNextSync.current = false;
        return;
      }
      skipNextSync.current = false;
    }

    const query = buildQueryString(formData as FormData);
    if (query === lastQuery.current) return;
    lastQuery.current = query;
    const target = query ? `${pathname}?${query}` : pathname;
    router.replace(target, { scroll: false });
  }, [formData, router, pathname]);

  const onSubmit = (data: FormData) =>
    new Promise<void>(async (resolve, reject) => {
      try {
        setShowSuccess(false);
        setSubmitError(null);
        const payload = {
          conversation_id: data.sectionId || undefined,
          full_name: data.fullName,
          national_id: data.nationalId,
          parent_phone: data.parentPhone,
          gender: data.gender,
          email: data.email,
          date_of_birth: ddMmYyyyToIso(data.birthDate),
          student_phone: data.studentPhone,
          permanent_street_address: buildStreetAddress(
            data.permanentHouse,
            data.permanentStreet
          ),
          permanent_ward: data.permanentWard,
          permanent_province: data.permanentProvince,
          grade_12_province: data.grade12Province,
          grade_12_class: data.grade12Class,
          grade_12_school: data.grade12School,
          graduation_year: data.graduationYear,
          receiving_province: data.receivingProvince,
          receiving_ward: data.receivingWard,
          receiving_street_address: buildStreetAddress(
            data.receivingHouse,
            data.receivingStreet
          ),
        };
        await postAdmissionApplication(payload);
        setShowSuccess(true);
        resolve();
      } catch (err) {
        console.error("Admission application submit failed", err);
        const messageFromApi =
          (err as any)?.detail?.[0]?.message ||
          (err as any)?.message ||
          "Gửi thất bại, vui lòng thử lại.";
        setSubmitError(messageFromApi);
        reject(err);
      }
    });

  if (isHydrating) {
    return (
      <main
        className={cn(
          "min-h-screen bg-[#eef3f8] flex items-center justify-center",
          inter.className
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
        "min-h-screen bg-[#eef3f8] flex justify-center px-2",
        inter.className
      )}
    >
      <style jsx global>{`
        .admission-form input,
        .admission-form select,
        .admission-form textarea {
          font-style: normal;
        }
        .admission-form ::placeholder {
          font-style: italic;
        }
        .admission-form .date-input::-webkit-calendar-picker-indicator {
          opacity: 0;
          display: none;
        }
        .admission-form .date-input::-webkit-inner-spin-button,
        .admission-form .date-input::-webkit-clear-button {
          display: none;
        }
        .admission-form .date-input {
          appearance: none;
          -webkit-appearance: none;
        }
      `}</style>
      <div className="admission-form w-full pb-10">
        <div className="mx-auto w-full max-w-5xl">
          <div className="flex flex-col items-center gap-3 pb-5 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-[#1a2e59] pt-5">
              Đăng ký thông tin hồ sơ xét tuyển
            </h1>
            <div className="w-full">
              <div className="flex items-center gap-3 rounded-2xl bg-[#1c2f57] px-4 py-4 text-white shadow-md">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
                  <Image
                    src="/assets/career/logo.png"
                    alt="Logo"
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <span className="text-lg font-semibold">Thông tin thí sinh</span>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 px-1 sm:px-2"
          >
            <SectionCard title="Thông tin thí sinh">
              <div className="grid gap-4 md:grid-cols-2">
                <LabeledInput
                  label="Họ và Tên"
                  required
                  placeholder="Nhập họ và tên"
                  inputProps={{ ...register("fullName"), className: inputClass }}
                />

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">
                    Giới Tính <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      {...register("gender")}
                      className={cn(selectClass, "appearance-none leading-tight")}
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

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">
                    Ngày/ Tháng/ Năm sinh <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input
                      ref={birthInputRef}
                      type="text"
                      inputMode="numeric"
                      maxLength={10}
                      {...register("birthDate", {
                        onChange: (e) => {
                          const formatted = formatBirthInput(e.target.value);
                          setValue("birthDate", formatted, {
                            shouldValidate: true,
                            shouldDirty: true,
                          });
                        },
                      })}
                      placeholder="dd/mm/yyyy"
                      className={cn(
                        inputClass,
                        "pr-11 appearance-none date-input"
                      )}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#1f3f77]"
                      onClick={() => birthInputRef.current?.focus()}
                      aria-label="Chọn ngày sinh"
                    >
                      <CalendarDays className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <LabeledInput
                  label="Email"
                  required
                  placeholder="Nhập email"
                  inputProps={{
                    ...register("email"),
                    className: inputClass,
                    type: "email",
                  }}
                />

                <LabeledInput
                  label="Số CCCD/ Mã định danh"
                  required
                  placeholder="Nhập căn cước công dân"
                  inputProps={{
                    ...register("nationalId"),
                    className: inputClass,
                  }}
                />

                <div className="grid gap-4 md:grid-cols-2 md:col-span-2">
                  <LabeledInput
                    label="Số điện thoại"
                    required
                    placeholder="Nhập số điện thoại"
                    inputProps={{
                      ...register("studentPhone"),
                      className: inputClass,
                      inputMode: "tel",
                    }}
                  />

                  <LabeledInput
                    label="Số điện thoại phụ huynh"
                    required
                    placeholder="Nhập số điện thoại"
                    inputProps={{
                      ...register("parentPhone"),
                      className: inputClass,
                      inputMode: "tel",
                    }}
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Địa chỉ thường trú">
              <div className="grid gap-4 md:grid-cols-2">
                <SearchSelectField
                  label="Tỉnh/ Thành phố"
                  name="permanentProvince"
                  control={control}
                  required
                  placeholder="Chọn Tỉnh/ Thành phố"
                  options={provinceOptions}
                />
                  <SearchSelectField
                    label="Xã/ Phường"
                    name="permanentWard"
                    control={control}
                    required
                    placeholder="Chọn Xã/ Phường"
                    options={permanentWardOptions}
                    loading={loadingPermanentWard}
                  />
                <LabeledInput
                  label="Đường/ Phố"
                  required
                  placeholder="Nhập Đường/ Phố"
                  inputProps={{
                    ...register("permanentStreet"),
                    className: inputClass,
                  }}
                />
                <LabeledInput
                  label="Số nhà"
                  placeholder="Nhập số nhà"
                  inputProps={{
                    ...register("permanentHouse"),
                    className: inputClass,
                  }}
                />
              </div>
            </SectionCard>

            <SectionCard title="Thông tin lớp 12">
              <div className="grid gap-4 md:grid-cols-2">
                <SearchSelectField
                  label="Tỉnh/ Thành phố lớp 12"
                  name="grade12Province"
                  control={control}
                  required
                  placeholder="Chọn Tỉnh/ Thành phố"
                  options={provinceOptions}
                />
                <SearchSelectField
                  label="Trường lớp 12"
                  name="grade12School"
                  control={control}
                  required
                  placeholder="Chọn trường học"
                  options={grade12SchoolOptions}
                  loading={loadingGrade12School}
                />
                <SelectField
                  label="Năm tốt nghiệp"
                  required
                  placeholder="Chọn năm tốt nghiệp"
                  options={yearOptions.map((y) => ({ value: y, display: y }))}
                  registration={register("graduationYear")}
                />
                <LabeledInput
                  label="Tên lớp 12"
                  required
                  placeholder="Nhập tên lớp"
                  inputProps={{
                    ...register("grade12Class"),
                    className: inputClass,
                  }}
                />
              </div>
            </SectionCard>

            <SectionCard title="Địa chỉ nhận giấy báo">
              <div className="space-y-3">
                <label className="flex items-start gap-3 text-sm text-slate-800">
                  <Checkbox
                    checked={applySameAddressField.value}
                    onCheckedChange={(checked) => {
                      const next = Boolean(checked);
                      applySameAddressField.onChange(next);
                      if (next) {
                        // Mirror permanent address immediately when toggled on.
                        skipNextSync.current = true;
                        setValue(
                          "receivingProvince",
                          formData.permanentProvince ?? "",
                          { shouldDirty: true, shouldTouch: true }
                        );
                        setValue(
                          "receivingWard",
                          formData.permanentWard ?? "",
                          { shouldDirty: true, shouldTouch: true }
                        );
                        setValue(
                          "receivingStreet",
                          formData.permanentStreet ?? "",
                          { shouldDirty: true, shouldTouch: true }
                        );
                        setValue(
                          "receivingHouse",
                          formData.permanentHouse ?? "",
                          { shouldDirty: true, shouldTouch: true }
                        );
                        setWardOptionsReceiving(wardOptionsPermanent);
                      }
                    }}
                    className="mt-0.5"
                  />
                  <span>Áp dụng theo hộ khẩu thường trú</span>
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <SearchSelectField
                    label="Tỉnh/ Thành phố"
                    name="receivingProvince"
                    control={control}
                    required
                    placeholder="Chọn Tỉnh/ Thành phố"
                    options={provinceOptions}
                    disabled={applySameAddressField.value}
                  />
                  <SearchSelectField
                    label="Xã/ Phường"
                    name="receivingWard"
                    control={control}
                    required
                    placeholder="Chọn Xã/ Phường"
                    options={receivingWardOptions}
                    disabled={applySameAddressField.value}
                    loading={loadingReceivingWard}
                  />
                  <LabeledInput
                    label="Đường/ Phố"
                    required
                    placeholder="Nhập Đường/ Phố"
                    inputProps={{
                      ...register("receivingStreet"),
                      className: inputClass,
                      disabled: applySameAddressField.value,
                    }}
                  />
                  <LabeledInput
                    label="Số nhà"
                    placeholder="Nhập số nhà"
                    inputProps={{
                      ...register("receivingHouse"),
                      className: inputClass,
                      disabled: applySameAddressField.value,
                    }}
                  />
                </div>
              </div>
            </SectionCard>

            <input type="hidden" {...register("conversationId")} />
            <input type="hidden" {...register("sectionId")} />

            <label className="flex items-start gap-3 text-sm text-slate-800 px-1">
              <Checkbox
                checked={confirmAccuracyField.value}
                onCheckedChange={(checked) =>
                  confirmAccuracyField.onChange(Boolean(checked))
                }
                className="mt-0.5"
              />
              <span className="italic">
                Xác nhận những thông tin trên là chính xác.
              </span>
            </label>
            <Button
              type="submit"
              disabled={submitDisabled}
              className="w-full h-11 rounded-md bg-[#1a3561] text-white text-[15px] font-semibold hover:bg-[#18335f]"
            >
              {isSubmitting ? "Đang gửi..." : "Tiếp tục"}
            </Button>
            {submitError && (
              <p className="text-sm text-red-600 text-center">
                {submitError}
              </p>
            )}
          </form>
        </div>
      </div>
      {showSuccess && <CareerSuccessModal />}
    </main>
  );
}

function LabeledInput({
  label,
  required,
  placeholder,
  inputProps,
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  inputProps?: InputHTMLAttributes<HTMLInputElement>;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <Input
        {...inputProps}
        placeholder={placeholder}
        className={cn("italic", inputProps?.className)}
      />
    </div>
  );
}

function SearchSelectField({
  label,
  name,
  control,
  options,
  required,
  placeholder,
  disabled,
  loading,
}: {
  label: string;
  name: keyof FormData;
  control: Control<FormData>;
  options: OptionItem[];
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
}) {
  const {
    field: { value, onChange, onBlur, name: fieldName, ref },
  } = useController({ name, control });
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value) || null,
    [options, value]
  );

  useEffect(() => {
    if (selectedOption) {
      setQuery(selectedOption.display);
    } else if (!value) {
      setQuery("");
    } else {
      setQuery(String(value));
    }
  }, [selectedOption?.display, value]);

  const normalizedQuery = normalizeText(query);
  const filteredOptions = useMemo(() => {
    if (!normalizedQuery) return options;
    return options.filter((opt) =>
      normalizeText(`${opt.display} ${opt.value}`).includes(normalizedQuery)
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
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={placeholder || "Chọn"}
          disabled={disabled || loading}
          autoComplete="off"
          className={cn(
            selectClass,
            "appearance-none pr-10 text-left",
            (disabled || loading) && "bg-slate-100"
          )}
        />
        {/* {value && !disabled && !loading && (
          <button
            type="button"
            className="absolute right-9 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            onMouseDown={(e) => {
              e.preventDefault();
              handleSelect(null);
            }}
            aria-label={`Xóa ${label}`}
          >
            ×
          </button>
        )} */}
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
                      option.value === value && "bg-[#eaf0ff]"
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
    </div>
  );
}

function SelectField({
  label,
  required,
  placeholder,
  options,
  registration,
  disabled,
}: {
  label: string;
  required?: boolean;
  placeholder?: string;
  options: OptionItem[];
  registration: UseFormRegisterReturn;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-slate-900">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <select
          {...registration}
          disabled={disabled}
          className={cn(
            selectClass,
            "appearance-none leading-tight",
            disabled && "bg-slate-100"
          )}
        >
          <option value="">{placeholder || "Chọn"}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.display}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1f3f77]" />
      </div>
    </div>
  );
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className={cn(panelClass, "md:rounded-2xl")}>
      <div className="border-b border-[#eef1f6] px-4 py-3">
        <h2 className="text-[15px] font-semibold text-[#1a2e59]">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

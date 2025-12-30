"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import Image from "next/image";
import { Inter } from "next/font/google";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";

import formMeta from "@/lib/form-meta.json";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getMetadataCareer,
  getMetadataSchools,
  postCareerLead,
  updateCampaignTotalScans,
} from "@/servers";
import CareerSuccessModal from "./career-success-modal";

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
  nationalId: string;
  email: string;
  utmCampaign: string;
  utmCampaignQr: string;
  utmSales: string;
  city: string;
  school: string;
  gradeLevel: string;
  academicPerformance: string;
  gpa: string;
  aspirations: string[];
  notifyVia: string[];
  socials: { platform: string; link_profile: string }[];
  confirmAccuracy: boolean;
};

const initialFormData: FormData = {
  fullName: "",
  birthDate: "",
  gender: "",
  address: "",
  phone: "",
  nationalId: "",
  email: "",
  utmCampaign: "",
  utmCampaignQr: "",
  utmSales: "",
  city: "",
  school: "",
  gradeLevel: "",
  academicPerformance: "",
  gpa: "",
  aspirations: [],
  notifyVia: [formMeta.common.notificationChannels?.[0] || "email"].filter(
    Boolean
  ),
  socials: [],
  confirmAccuracy: false,
};

const panelClass =
  "rounded-lg border border-[#e2e7ef] bg-white shadow-[0_8px_22px_rgba(31,63,119,0.06)]";

const inputClass =
  "h-11 w-full rounded-lg border border-[#d7dde7] bg-white text-[15px] text-slate-800 placeholder:text-[#a8afbb] shadow-[inset_0_1px_0_rgba(0,0,0,0.04)] focus:border-[#1f3f77] focus:ring-2 focus:ring-[#1f3f77]/15";

const selectClass =
  "h-11 w-full rounded-[10px] border border-[#cfd6e1] bg-white px-4 pr-12 text-[13px] font-medium text-slate-800 placeholder:text-[#aeb7c3] leading-[22px] shadow-[inset_0_1px_0_rgba(0,0,0,0.04)] focus:border-[#1f3f77] focus:ring-2 focus:ring-[#1f3f77]/15";

const SOCIAL_OPTIONS = [
  { value: "Facebook", label: "Facebook", icon: "/social/facebook.png" },
  { value: "Zalo", label: "Zalo", icon: "/social/zalo.png" },
  // { value: "TikTok", label: "TikTok", icon: "/social/tiktok.png" },
  { value: "WhatsApp", label: "WhatsApp", icon: "/social/whatsapp.png" },
];

export default function CareerConsultationForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const lastQuery = useRef<string>("");
  const hasHydrated = useRef(false);
  const skipNextSync = useRef(false);
  const hydratedSnapshot = useRef<FormData | null>(null);
  const campaignScanTracked = useRef(false);
  const [isHydrating, setIsHydrating] = useState(true);
  const {
    register,
    handleSubmit,
    watch,
    control,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormData>({
    defaultValues: initialFormData,
  });
  const formData = useWatch({ control });
  const aspirations = watch("aspirations") || [];
  const [aspirationInput, setAspirationInput] = useState("");
  const [metaOptions, setMetaOptions] = useState<{
    genders: string[];
    preferences: string[];
    states: string[];
    schools: { value: string; display: string }[];
  }>({ genders: [], preferences: [], states: [], schools: [] });
  const [metaReady, setMetaReady] = useState(false);
  const [showAspirationDropdown, setShowAspirationDropdown] = useState(false);
  const birthInputRef = useRef<HTMLInputElement | null>(null);
  const [socials, setSocials] = useState<
    { platform: string; link_profile: string }[]
  >([]);
  const [openSocialIndex, setOpenSocialIndex] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const requiredFields: (keyof FormData)[] = [
    "fullName",
    "phone",
    "email",
    "nationalId",
  ];

  const requiredFieldsFilled = requiredFields.every((field) => {
    const value = watch(field);
    if (typeof value === "string") return value.trim() !== "";
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value);
  });
  const emailReady = (watch("email") || "").trim() !== "";
  const socialReadySet = new Set(
    socials
      .filter(
        (s) =>
          s.platform &&
          typeof s.link_profile === "string" &&
          s.link_profile.trim() !== ""
      )
      .map((s) => s.platform)
      .filter(Boolean)
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
  const submitDisabled =
    isSubmitting || !watch("confirmAccuracy") || !requiredFieldsFilled;

  useEffect(() => {
    let active = true;
    const loadMeta = async () => {
      try {
        const [json, schoolsResp] = await Promise.all([
          getMetadataCareer(),
          getMetadataSchools(searchParams.get("school") || undefined),
        ]);
        if (!active || !json?.data) return;
        setMetaOptions({
          genders: (json.data.genders || []).map((g: any) =>
            typeof g === "string" ? g : g.display || g.value || ""
          ),
          preferences: json.data.preferences || [],
          states: (json.data.provinces || []).map(
            (p: any) => p.display || p.value || String(p)
          ),
          schools: (schoolsResp.data || [])
            .map((s: any) => ({
              value: s?.value ?? s?.display ?? "",
              display: s?.display ?? s?.value ?? "",
            }))
            .filter((s: any) => s.value || s.display),
        });
      } catch (err) {
        console.warn("Could not load metadata, fallback to formMeta", err);
        setMetaOptions({
          genders: formMeta.common.genderOptions.map((o) => o.label) || [],
          preferences:
            formMeta.enrollment.majorOptions?.map((o) => o.label) || [],
          states: [],
          schools: [],
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
    const campaignName = searchParams.get("utmCampaignQr");
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
      } catch (err) {
        campaignScanTracked.current = false;
        console.error("Failed to update campaign scan", err);
      }
    };

    trackScan();
  }, [searchParams]);

  useEffect(() => {
    if (!metaReady) return;
    const query = searchParams.toString();
    if (query === lastQuery.current && hasHydrated.current) return;
    lastQuery.current = query;

    const getVal = (key: keyof FormData) => {
      const value = searchParams.get(key);
      if (value === null) return undefined;
      if (value === "__empty") return "";
      return value;
    };
    const getList = (key: keyof FormData) => {
      const value = searchParams.get(key);
      if (value === null) return undefined;
      if (value === "none") return [];
      if (value) return value.split(",").filter(Boolean);
      return undefined;
    };
    const getBool = (keys: string[], defaultValue = false) => {
      for (const key of keys) {
        const value = searchParams.get(key);
        if (value !== null) return value === "true";
      }
      return defaultValue;
    };

    const prefer = (value: string | undefined, fallback: string | undefined) =>
      value === undefined ? fallback ?? "" : value;
    const ensureOption = (
      value: string | undefined,
      allowed: string[],
      fallback: string | undefined
    ) => {
      if (value === "") return "";
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
      nationalId: getVal("nationalId"),
      email: getVal("email"),
      utmCampaign: getVal("utmCampaign"),
      utmCampaignQr: getVal("utmCampaignQr"),
      utmSales: getVal("utmSales"),
      city: getVal("city"),
      school: getVal("school"),
      gradeLevel: getVal("gradeLevel"),
      academicPerformance: getVal("academicPerformance"),
      gpa: getVal("gpa"),
      aspirations: getList("aspirations"),
      notifyVia: getList("notifyVia"),
      confirmAccuracy: getBool(
        ["confirmAccuracy"],
        initialFormData.confirmAccuracy
      ),
    };

    const allowedGenders = metaOptions.genders.length
      ? metaOptions.genders
      : (formMeta.common.genderOptions ?? []).map((o) => o.value);
    const allowedGrades = (formMeta.common.gradeOptions ?? []).map(
      (o) => o.value
    );
    const allowedAcademic = (
      formMeta.common.academicPerformanceOptions ?? []
    ).map((o) => o.value);
    const allowedSchools = (metaOptions.schools ?? []).map((s) => s.value);
    const allowedNotification = formMeta.common.notificationChannels ?? [];
    const resolvedAspirations = (
      mappedData.aspirations ?? initialFormData.aspirations
    )
      .filter(Boolean)
      .slice(0, 3);
    const normalizeNotifyArray = (value: string[] | undefined) => {
      if (Array.isArray(value)) return value.filter(Boolean);
      return initialFormData.notifyVia;
    };
    const resolvedNotify = normalizeNotifyArray(mappedData.notifyVia).filter(
      (item) => allowedNotification.includes(item)
    );

    const hydratedData = {
      fullName: prefer(mappedData.fullName, initialFormData.fullName),
      birthDate: prefer(mappedData.birthDate, initialFormData.birthDate),
      gender: ensureOption(
        mappedData.gender,
        allowedGenders,
        initialFormData.gender
      ),
      address: prefer(mappedData.address, initialFormData.address),
      phone: prefer(mappedData.phone, initialFormData.phone),
      nationalId: prefer(mappedData.nationalId, initialFormData.nationalId),
      email: prefer(mappedData.email, initialFormData.email),
      utmCampaign: prefer(mappedData.utmCampaign, initialFormData.utmCampaign),
      utmCampaignQr: prefer(
        mappedData.utmCampaignQr,
        initialFormData.utmCampaignQr
      ),
      utmSales: prefer(mappedData.utmSales, initialFormData.utmSales),
      city: prefer(mappedData.city, initialFormData.city),
      school: ensureOption(
        mappedData.school,
        allowedSchools,
        initialFormData.school
      ),
      gradeLevel: ensureOption(
        mappedData.gradeLevel,
        allowedGrades,
        initialFormData.gradeLevel
      ),
      academicPerformance: ensureOption(
        mappedData.academicPerformance,
        allowedAcademic,
        initialFormData.academicPerformance
      ),
      gpa: prefer(mappedData.gpa, initialFormData.gpa),
      aspirations: resolvedAspirations,
      socials: initialFormData.socials ?? [],
      notifyVia: resolvedNotify,
      confirmAccuracy:
        mappedData.confirmAccuracy ?? initialFormData.confirmAccuracy ?? false,
    };

    reset(hydratedData);
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
    addParam("nationalId", formData.nationalId);
    addParam("email", formData.email);
    addParam("utmCampaign", formData.utmCampaign);
    addParam("utmCampaignQr", formData.utmCampaignQr);
    addParam("utmSales", formData.utmSales);
    addParam("city", formData.city);
    addParam("school", formData.school);
    addParam("gradeLevel", formData.gradeLevel);
    addParam("academicPerformance", formData.academicPerformance);
    addParam("gpa", formData.gpa);
    addParam("aspirations", formData.aspirations || []);
    addParam(
      "socials",
      socials
        .filter((s) => s.platform || s.link_profile)
        .map((s) => `${s.platform}:${s.link_profile}`)
    );
    addParam("notifyVia", formData.notifyVia);
    addParam("confirmAccuracy", formData.confirmAccuracy);

    const query = params.toString();
    if (query === lastQuery.current) return;
    lastQuery.current = query;
    const target = query ? `${pathname}?${query}` : pathname;
    router.replace(target, { scroll: false });
  }, [formData, router, pathname]);

  const handleAddAspiration = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (aspirations.includes(trimmed)) {
      handleRemoveAspiration(trimmed);
      return;
    }
    if (aspirations.length >= 3) return;
    setValue("aspirations", [...aspirations, trimmed]);
    setAspirationInput("");
  };

  const handleRemoveAspiration = (value: string) => {
    setValue(
      "aspirations",
      aspirations.filter((item) => item !== value)
    );
  };

  const handleNotifyChange = (channel: string, checked: boolean) => {
    const current = formData.notifyVia || [];
    const next = checked
      ? Array.from(new Set([...current, channel]))
      : current.filter((c) => c !== channel);
    setValue("notifyVia", next);
  };

  const onSubmit = (data: FormData) =>
    new Promise<void>(async (resolve, reject) => {
      try {
        setSubmitError(null);
        const payload = {
          full_name: data.fullName,
          mobile_no: data.phone,
          email: data.email,
          gender: data.gender,
          date_of_birth: data.birthDate,
          role: "Student",
          national_id: data.nationalId,
          province: data.city,
          state: data.city,
          school_name: data.school,
          class_stream: "",
          grade_level: data.gradeLevel,
          performance: data.academicPerformance,
          preferences: data.aspirations || [],
          certificates: [],
          utm_campaign: data.utmCampaign || undefined,
          utm_campaign_qr: data.utmCampaignQr || undefined,
          utm_sales: data.utmSales || undefined,
          notify_vias: data.notifyVia || [],
          socials: socials
            .filter(
              (s) =>
                s.platform &&
                typeof s.link_profile === "string" &&
                s.link_profile.trim() !== ""
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
        console.error("Career consultation submit failed", err);
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
              <div className="text-[28px] sm:text-[32px] font-extrabold">Đăng ký tư vấn</div>
              <div className="-mt-0 text-[28px] sm:text-[32px] font-extrabold">
                Hướng nghiệp
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="px-4 pb-8 pt-5 space-y-4"
        >
          <section className={panelClass}>
            <div className="space-y-3 p-4">
              <LabeledInput
                label="Họ và Tên"
                required
                placeholder="Nhập họ và tên"
                inputProps={{ ...register("fullName"), className: inputClass }}
              />

              <div className="flex flex-col gap-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-900">
                    Ngày/ Tháng/ Năm sinh
                  </label>
                  <div className="relative">
                    <Input
                      ref={birthInputRef}
                      type="date"
                      {...register("birthDate")}
                      placeholder="dd/mm/yy"
                      className={cn(
                        inputClass,
                        "pr-11 appearance-none career-date-input"
                      )}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#1f3f77]"
                      onClick={() => {
                        const node = birthInputRef.current;
                        if (!node) return;
                        try {
                          if (typeof (node as any).showPicker === "function") {
                            (node as any).showPicker();
                            return;
                          }
                        } catch {}
                        node.focus();
                      }}
                      aria-label="Chọn ngày sinh"
                    >
                      <CalendarDays className="h-5 w-5" />
                    </button>
                  </div>
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
                        "appearance-none leading-tight"
                      )}
                    >
                      <option value="">Chọn giới tính</option>
                      {(metaOptions.genders.length
                        ? metaOptions.genders.map((g) => ({
                            value: g,
                            label: g,
                          }))
                        : formMeta.common.genderOptions
                      ).map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#1f3f77]" />
                  </div>
                </div>
              </div>

              <LabeledInput
                label="Địa chỉ"
                placeholder="Nhập địa chỉ"
                inputProps={{ ...register("address"), className: inputClass }}
              />

              <LabeledInput
                label="Số điện thoại"
                required
                placeholder="Nhập số điện thoại"
                inputProps={{ ...register("phone"), className: inputClass }}
              />

              <LabeledInput
                label="Căn cước công dân"
                required
                placeholder="Nhập căn cước công dân"
                inputProps={{
                  ...register("nationalId"),
                  className: inputClass,
                }}
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
                            openSocialIndex === idx ? null : idx
                          )
                        }
                        className={cn(
                          selectClass,
                          "flex items-center gap-2 pr-10 text-left",
                          openSocialIndex === idx &&
                            "border-[#1f3f77] ring-2 ring-[#1f3f77]/15"
                        )}
                      >
                        {social.platform ? (
                          <>
                            <SocialIcon value={social.platform} />
                            <span>
                              {SOCIAL_OPTIONS.find(
                                (s) => s.value === social.platform
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
                                  "bg-[#eaf0ff]"
                              )}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                const next = [...socials];
                                next[idx] = {
                                  ...next[idx],
                                  platform: option.value,
                                };
                                setSocials(next);
                                setOpenSocialIndex(null);
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
              <LabeledInput
                label="Tỉnh/Thành phố"
                inputProps={{
                  ...register("city"),
                  className: cn(
                    inputClass,
                    "bg-[#d7dbe2] text-slate-700 border-transparent"
                  ),
                  readOnly: true,
                }}
              />

              <LabeledInput
                label="Trường học"
                inputProps={{
                  value:
                    metaOptions.schools.find((s) => s.value === formData.school)
                      ?.display || formData.school,
                  className: cn(
                    inputClass,
                    "bg-[#d7dbe2] text-slate-700 border-transparent"
                  ),
                  readOnly: true,
                }}
              />
              <input type="hidden" {...register("school")} />

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
                        "appearance-none leading-tight"
                      )}
                    >
                      <option value="">Chọn lớp</option>
                      {formMeta.common.gradeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
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
                        "appearance-none leading-tight"
                      )}
                    >
                      <option value="">Chọn học lực</option>
                      {formMeta.common.academicPerformanceOptions.map(
                        (option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        )
                      )}
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
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-slate-900">
                    Nguyện vọng (Tối đa 3 nguyện vọng)
                  </label>
                  <span className="text-xs text-slate-500">
                    {aspirations.length}/3
                  </span>
                </div>
                <div className="relative">
                  <Input
                    value={aspirationInput}
                    onChange={(e) => setAspirationInput(e.target.value)}
                    onFocus={() => setShowAspirationDropdown(true)}
                    onClick={() => setShowAspirationDropdown(true)}
                    onBlur={() =>
                      setTimeout(() => setShowAspirationDropdown(false), 120)
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddAspiration(aspirationInput);
                      }
                    }}
                    placeholder="Tìm kiếm ngành/ưu tiên"
                    className={cn(inputClass, "pr-11")}
                  />
                  <Search className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  {showAspirationDropdown && (
                    <div className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                      {(metaOptions.preferences.length
                        ? metaOptions.preferences.map((p) =>
                            typeof p === "string"
                              ? p
                              : p.display || p.value || ""
                          )
                        : formMeta.enrollment.majorOptions.map((m) => m.label)
                      )
                        .filter((option) =>
                          option
                            .toLowerCase()
                            .includes(aspirationInput.toLowerCase())
                        )
                        .slice(0, 10)
                        .map((option) => (
                          <button
                            type="button"
                            key={option}
                            className={cn(
                              "flex w-full items-center justify-between px-3 py-2 text-left text-sm",
                              aspirations.includes(option)
                                ? "bg-[#eaf0ff]"
                                : "hover:bg-slate-100"
                            )}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleAddAspiration(option);
                            }}
                          >
                            <span>{option}</span>
                            {aspirations.includes(option) && (
                              <Check className="h-4 w-4 text-[#1f3f77]" />
                            )}
                          </button>
                        ))}
                      {aspirationInput &&
                        !metaOptions.preferences.includes(aspirationInput) &&
                        !aspirations.includes(aspirationInput) && (
                          <button
                            type="button"
                            className="flex w-full items-center px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleAddAspiration(aspirationInput);
                            }}
                          >
                            Thêm “{aspirationInput}”
                          </button>
                        )}
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {aspirations.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => handleRemoveAspiration(item)}
                      className="inline-flex items-center gap-2 rounded-[5px] border border-[#1A3561] bg-white px-3 py-1 text-sm text-slate-800 hover:bg-slate-100"
                    >
                      {item}
                      <span className="text-slate-500">×</span>
                    </button>
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
                  {formMeta.common.notificationChannels.map((channel) => {
                    const checked = (formData.notifyVia || []).includes(
                      channel
                    );
                    const enabled = canSelectChannel(channel);
                    return (
                      <label
                        key={channel}
                        className={cn(
                          "flex items-center gap-2 text-sm capitalize transition-colors",
                          enabled ? "cursor-pointer" : "cursor-not-allowed opacity-60",
                          checked
                            ? "border-[#1f3f77] bg-white text-[#1f3f77]"
                            : "border-[#d7dde7] bg-white text-slate-700 hover:border-[#1f3f77]"
                        )}
                      >
                        <Checkbox
                          checked={checked}
                          disabled={!enabled}
                          onCheckedChange={(c) =>
                            enabled &&
                            handleNotifyChange(channel, Boolean(c))
                          }
                        />
                        <span className="inline-flex items-center gap-2">
                          <SocialIcon value={channel} />
                          {channel}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <p className="text-xs text-red-600">
                  Nhập email và thêm kênh mạng xã hội tương ứng để bật lựa chọn.
                </p>
              </div>
            </div>
          </section>

          <label className="flex items-start gap-3 text-sm text-slate-800">
            <Checkbox
              checked={watch("confirmAccuracy")}
              onCheckedChange={(checked) =>
                setValue("confirmAccuracy", Boolean(checked))
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
            {isSubmitting ? "Đang gửi..." : "Đăng ký"}
          </Button>
          {submitError && (
            <p className="text-sm text-red-600 text-center">{submitError}</p>
          )}
        </form>
      </div>
      {showSuccess && (
        <CareerSuccessModal />
      )}
    </main>
  );
}

type LabeledInputProps = {
  label: string;
  required?: boolean;
  placeholder?: string;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
};

function LabeledInput({
  label,
  required,
  placeholder,
  inputProps,
}: LabeledInputProps) {
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
          : "border-[#d7dde7] bg-white text-slate-700 hover:border-[#1f3f77]"
      )}
    >
      <span
        className={cn(
          "flex h-4 w-4 items-center justify-center rounded-full border",
          active ? "border-[#f2c94c] bg-[#f2c94c]" : "border-slate-300"
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

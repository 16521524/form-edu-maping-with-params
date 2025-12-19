"use client"

import type React from "react"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
import { useRouter } from "next/navigation"
import formMeta from "@/lib/form-meta.json"
import eventDefaultsData from "@/lib/form-defaults-event.json"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Calendar, User, CalendarDays, Target, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"

interface FormData {
  // 1. Personal info
  fullName: string
  birthDate: string
  nationalId: string
  gender: string
  phone: string
  email: string
  highSchool: string
  gradeLevel: string
  socialLink: string
  // 2. Parent info
  parentName: string
  parentPhone: string
  parentEmail: string
  parentRelation: string
  // 3. Event info
  clubName: string
  eventName: string
  eventDate: string
  eventSlot: string
  selectedSessions: string[]
  // 3. Objectives
  eventObjectives: string[]
  heardFrom: string
  // 4. Confirm
  notifyVia: string[]
  consentUseInfo: boolean
  confirmAccuracy: boolean
}

const initialFormData: FormData = {
  fullName: "",
  birthDate: "",
  nationalId: "",
  gender: "",
  phone: "",
  email: "",
  highSchool: "",
  gradeLevel: "",
  socialLink: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  parentRelation: "",
  clubName: "",
  eventName: "",
  eventDate: "",
  eventSlot: "",
  selectedSessions: [],
  eventObjectives: [],
  heardFrom: "",
  notifyVia: ["Email"],
  consentUseInfo: true,
  confirmAccuracy: false,
}

const eventMeta = formMeta.event
const commonMeta = formMeta.common
const aiDefaults = eventDefaultsData

export default function EventRegistrationForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const lastQuery = useRef<string>("")
  const hasHydrated = useRef(false)
  const skipNextSync = useRef(false)
  const hydratedSnapshot = useRef<FormData | null>(null)
  const [isHydrating, setIsHydrating] = useState(true)
  const {
    control,
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormData>({ defaultValues: initialFormData })
  const formData = useWatch({ control })

  // Map URL params to form data - only run once
  useEffect(() => {
    const query = searchParams.toString()
    if (query === lastQuery.current && hasHydrated.current) return
    lastQuery.current = query

    const hasParams = query.length > 0
    if (!hasParams) {
      reset(initialFormData)
      setIsHydrating(false)
      hasHydrated.current = true
      return
    }

    const studentDefaults = aiDefaults?.studentProfile ?? {}
    const parentDefaults = aiDefaults?.parentProfile ?? {}
    const eventDefaults = aiDefaults?.eventPreference ?? {}
    const defaultsConfig = aiDefaults?.defaultsConfig ?? {}
    const defaultNotification = defaultsConfig.notifyVia ?? ["Email"]
    const selectedSessionsParam = searchParams.get("selectedSessions")?.split(",").filter(Boolean) || []
    const getVal = (key: string) => {
      const value = searchParams.get(key)
      if (value === null) return undefined
      if (value === "__empty") return ""
      return value
    }
    const getList = (key: string) => {
      const value = searchParams.get(key)
      if (value === null) return undefined
      if (value === "none") return []
      if (value) return value.split(",").filter(Boolean)
      return undefined
    }
    const getBool = (keys: string[], defaultValue = false) => {
      for (const key of keys) {
        const value = searchParams.get(key)
        if (value !== null) return value === "true"
      }
      return defaultValue
    }

    const preselectFromEventName = (eventName?: string) => {
      if (!eventName) return [] as string[]
      return eventMeta.eventSessions.filter((s) => (s.eventName || "").toLowerCase() === eventName.toLowerCase()).map((s) => s.id)
    }

    const eventNameParam = getVal("eventName")
    const prefer = (value: string | undefined, fallback: string | undefined) => (value === undefined ? fallback ?? "" : value)
    const ensureOption = (value: string | undefined, allowed: string[], fallback: string | undefined) => {
      if (value && allowed.includes(value)) return value
      if (fallback && allowed.includes(fallback)) return fallback
      return ""
    }
    const allowedGenders = (commonMeta.genderOptions ?? []).map((o) => o.value)
    const mappedData: FormData = {
      fullName: prefer(getVal("fullName"), studentDefaults.fullName),
      birthDate: prefer(getVal("birthDate"), studentDefaults.birthDate),
      nationalId: prefer(getVal("nationalId"), studentDefaults.nationalId),
      gender: ensureOption(getVal("gender"), allowedGenders, studentDefaults.gender),
      phone: prefer(getVal("phone"), studentDefaults.phone),
      email: prefer(getVal("email"), studentDefaults.email),
      highSchool: prefer(getVal("highSchool"), studentDefaults.highSchool),
      gradeLevel: ensureOption(
        getVal("gradeLevel"),
        commonMeta.gradeOptions.map((o) => o.value),
        studentDefaults.gradeLevel,
      ),
      socialLink: prefer(getVal("socialLink"), studentDefaults.socialLink),
      parentName: prefer(getVal("parentName"), parentDefaults.parentName),
      parentPhone: prefer(getVal("parentPhone"), parentDefaults.parentPhone),
      parentEmail: prefer(getVal("parentEmail"), parentDefaults.parentEmail),
      parentRelation: ensureOption(
        getVal("parentRelation"),
        eventMeta.parentRelationOptions.map((o) => o.value),
        parentDefaults.parentRelation,
      ),
      clubName: prefer(getVal("clubName"), eventDefaults.clubName ?? eventMeta.defaultClubName ?? parentDefaults.clubName),
      eventName: prefer(eventNameParam, eventDefaults.eventName),
      eventDate: prefer(getVal("eventDate"), eventDefaults.eventDate),
      eventSlot: prefer(getVal("eventSlot"), eventDefaults.eventSlot),
      selectedSessions: selectedSessionsParam.length
        ? selectedSessionsParam
        : preselectFromEventName(eventNameParam ?? eventDefaults.eventName),
      eventObjectives:
        getList("eventObjectives") ??
        (defaultsConfig.eventObjectives && defaultsConfig.eventObjectives.length
          ? defaultsConfig.eventObjectives
          : eventMeta.eventObjectiveOptions.length
            ? [eventMeta.eventObjectiveOptions[0]]
            : []),
      heardFrom: prefer(getVal("heardFrom"), eventDefaults.heardFrom),
      notifyVia: getList("notifyVia") ?? defaultNotification,
      consentUseInfo: getBool(["consentUseInfo"], defaultsConfig.consentUseInfo ?? true),
      confirmAccuracy: getBool(["confirmAccuracy"], defaultsConfig.confirmAccuracy ?? false),
    }
    const ensureEmailChecked = mappedData.notifyVia

    const selectedSessions = mappedData.selectedSessions
    const selectedSessionDetails = eventMeta.eventSessions.filter((s) => selectedSessions.includes(s.id))
    const tenSuKienAuto = selectedSessionDetails.length
      ? Array.from(new Set(selectedSessionDetails.map((s) => s.eventName || ""))).join(" | ")
      : ""
    const tenCauLacBoAuto = selectedSessionDetails.length ? selectedSessionDetails[0]?.clubName || "" : ""
    const firstSession = selectedSessionDetails[0]

    const genderFallback = mappedData.gender || studentDefaults.gender || "nam"
    const gradeFallback = mappedData.gradeLevel || studentDefaults.gradeLevel || commonMeta.gradeOptions[0]?.value || ""
    const relationFallback =
      mappedData.parentRelation || parentDefaults.parentRelation || eventMeta.parentRelationOptions[0]?.value || ""

    const hydrated: FormData = {
      ...mappedData,
      gender: genderFallback,
      gradeLevel: gradeFallback,
      parentRelation: relationFallback,
      eventName: selectedSessionDetails.length ? tenSuKienAuto : "",
      clubName: selectedSessionDetails.length ? tenCauLacBoAuto : "",
      eventDate: selectedSessionDetails.length ? firstSession?.date || mappedData.eventDate : "",
      eventSlot: selectedSessionDetails.length ? firstSession?.slotValue || mappedData.eventSlot : "",
      notifyVia: Array.from(new Set(ensureEmailChecked)),
    }
    reset(hydrated)
    hydratedSnapshot.current = hydrated
    skipNextSync.current = true
    setIsHydrating(false)
    hasHydrated.current = true
  }, [searchParams, reset])

  // Push form state back to URL params for sharing
  useEffect(() => {
    if (!hasHydrated.current) return
    if (skipNextSync.current) {
      const snap = hydratedSnapshot.current
      if (snap && JSON.stringify(formData) === JSON.stringify(snap)) {
        skipNextSync.current = false
      }
      return
    }

    const params = new URLSearchParams()
    const addParam = (key: string, value?: string | string[] | boolean) => {
      if (value === undefined || value === null) return
      if (Array.isArray(value)) {
        if (value.length === 0) {
          params.set(key, "none")
          return
        }
        params.set(key, value.join(","))
        return
      }
      if (typeof value === "boolean") {
        params.set(key, value ? "true" : "false")
        return
      }
      if (value === "") {
        params.set(key, "__empty")
        return
      }
      params.set(key, value)
    }

    addParam("fullName", formData.fullName)
    addParam("birthDate", formData.birthDate)
    addParam("nationalId", formData.nationalId)
    addParam("gender", formData.gender)
    addParam("phone", formData.phone)
    addParam("email", formData.email)
    addParam("highSchool", formData.highSchool)
    addParam("gradeLevel", formData.gradeLevel)
    addParam("socialLink", formData.socialLink)
    addParam("parentName", formData.parentName)
    addParam("parentPhone", formData.parentPhone)
    addParam("parentEmail", formData.parentEmail)
    addParam("parentRelation", formData.parentRelation)
    addParam("clubName", formData.clubName)
    addParam("eventName", formData.eventName)
    addParam("eventDate", formData.eventDate)
    addParam("eventSlot", formData.eventSlot)
    addParam("selectedSessions", formData.selectedSessions)
    addParam("eventObjectives", formData.eventObjectives)
    addParam("heardFrom", formData.heardFrom)
    addParam("notifyVia", formData.notifyVia)
    addParam("consentUseInfo", formData.consentUseInfo)
    addParam("confirmAccuracy", formData.confirmAccuracy)

    const query = params.toString()
    if (query === lastQuery.current) return
    lastQuery.current = query
    const target = query ? `${pathname}?${query}` : pathname
    router.replace(target, { scroll: false })
  }, [formData, router, pathname])

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setValue(field, value as any)
  }

  const handleMucDichChange = (mucDich: string, checked: boolean) => {
    const current = formData.eventObjectives || []
    const next = checked ? [...current, mucDich] : current.filter((m) => m !== mucDich)
    setValue("eventObjectives", next)
  }

  const handleNotificationChange = (channel: string, checked: boolean) => {
    const current = formData.notifyVia || []
    const next = checked ? Array.from(new Set([...current, channel])) : current.filter((c) => c !== channel)
    setValue("notifyVia", next)
  }

  const handleSessionToggle = (session: (typeof eventMeta.eventSessions)[number], checked: boolean) => {
    const selectedSessions = checked
      ? Array.from(new Set([...(formData.selectedSessions || []), session.id]))
      : (formData.selectedSessions || []).filter((id) => id !== session.id)

    const selectedSessionDetails = eventMeta.eventSessions.filter((s) => selectedSessions.includes(s.id))
    const tenSuKienAuto = selectedSessionDetails.length
      ? Array.from(new Set(selectedSessionDetails.map((s) => s.eventName || ""))).join(" | ")
      : ""
    const firstSession = selectedSessionDetails[0]

    setValue("selectedSessions", selectedSessions)
    setValue("eventName", tenSuKienAuto)
    setValue("clubName", formData.clubName || firstSession?.clubName || eventMeta.defaultClubName || "")
    setValue("eventDate", firstSession?.date || "")
    setValue("eventSlot", firstSession?.slotValue || "")
  }

  const requiredPersonalFields: (keyof FormData)[] = ["fullName", "birthDate", "nationalId", "gender", "phone", "email", "highSchool", "gradeLevel"]
  const requiredParentFields: (keyof FormData)[] = ["parentName", "parentPhone", "parentRelation"]
  const requiredEventFields: (keyof FormData)[] = ["eventName", "heardFrom"]
  const requiredClubFields: (keyof FormData)[] = ["clubName"]
  const requiredFields = [
    ...requiredEventFields,
    ...(formData.consentUseInfo ? [...requiredPersonalFields, ...requiredParentFields, ...requiredClubFields] : []),
  ]

  const requiredFieldsFilled = requiredFields.every((field) => {
    const value = formData[field]
    if (typeof value === "string") return value.trim() !== ""
    if (Array.isArray(value)) return value.length > 0
    return Boolean(value)
  })

  const isSubmitEnabled = requiredFieldsFilled && formData.confirmAccuracy
  const isPersonalSectionDisabled = !formData.consentUseInfo

  const onSubmit = (data: FormData) =>
    new Promise<void>((resolve) => {
      console.log("Form submitted:", data)
      setTimeout(() => {
        alert("Đăng ký thành công! Kiểm tra console để xem dữ liệu.")
        resolve()
      }, 600)
    })

  if (isHydrating) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="flex items-center gap-3 text-green-700">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Đang tải dữ liệu...</span>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang chủ
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <Calendar className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Form đăng kí tham gia Câu lạc bộ & Sự kiện</h1>
          <p className="text-muted-foreground mt-2">Điền đầy đủ thông tin để hoàn tất đăng ký</p>
          <div className="flex items-start justify-center space-x-2 mt-4">
            <Checkbox
              id="consentUseInfo"
              checked={formData.consentUseInfo}
              onCheckedChange={(checked) => handleInputChange("consentUseInfo", checked as boolean)}
            />
            <Label htmlFor="consentUseInfo" className="font-normal cursor-pointer leading-relaxed">
              Tôi đồng ý sử dụng những thông tin này để đăng ký nhập học.
            </Label>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Section 1: Thông tin cá nhân */}
          <Card className={isPersonalSectionDisabled ? "opacity-60" : ""} aria-disabled={isPersonalSectionDisabled}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-green-600" />
                1. Thông tin cá nhân
              </CardTitle>
              <CardDescription>Thông tin liên hệ của bạn</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="fullName">Họ và tên đầy đủ *</Label>
                <Input
                  id="fullName"
                  placeholder="Nguyễn Văn A"
                  required={formData.consentUseInfo}
                  disabled={isPersonalSectionDisabled}
                  {...register("fullName")}
                />
              </div>
              <div>
                <Label htmlFor="birthDate">Ngày tháng năm sinh *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  required={formData.consentUseInfo}
                  disabled={isPersonalSectionDisabled}
                  {...register("birthDate")}
                />
              </div>
              <div>
                <Label htmlFor="nationalId">CCCD *</Label>
                <Input
                  id="nationalId"
                  placeholder="Số căn cước công dân"
                  required={formData.consentUseInfo}
                  disabled={isPersonalSectionDisabled}
                  {...register("nationalId")}
                />
              </div>
              <div>
                <Label htmlFor="gender">Giới tính *</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={isPersonalSectionDisabled}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn giới tính" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonMeta.genderOptions?.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="0901234567"
                  required={formData.consentUseInfo}
                  disabled={isPersonalSectionDisabled}
                  {...register("phone")}
                />
              </div>
              <div>
                <Label htmlFor="email">Email cá nhân *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  required={formData.consentUseInfo}
                  disabled={isPersonalSectionDisabled}
                  {...register("email")}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="highSchool">Trường THPT đang học *</Label>
                <Input
                  id="highSchool"
                  placeholder="Trường THPT..."
                  required={formData.consentUseInfo}
                  disabled={isPersonalSectionDisabled}
                  {...register("highSchool")}
                />
              </div>
              <div>
                <Label htmlFor="gradeLevel">Lớp hiện tại *</Label>
                <Controller
                  name="gradeLevel"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={isPersonalSectionDisabled}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn lớp" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonMeta.gradeOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="socialLink">Mạng xã hội (tùy chọn)</Label>
                <Input
                  id="socialLink"
                  placeholder="https://facebook.com/tenban"
                  disabled={isPersonalSectionDisabled}
                  {...register("socialLink")}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Thông tin phụ huynh */}
          <Card className={isPersonalSectionDisabled ? "opacity-60" : ""} aria-disabled={isPersonalSectionDisabled}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-green-600" />
                2. Thông tin phụ huynh
              </CardTitle>
              <CardDescription>Liên hệ để phối hợp cùng gia đình</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="parentName">Họ và tên phụ huynh *</Label>
                <Input
                  id="parentName"
                  placeholder="Nguyễn Văn B..."
                  required={formData.consentUseInfo}
                  disabled={isPersonalSectionDisabled}
                  {...register("parentName")}
                />
              </div>
              <div>
                <Label htmlFor="parentPhone">Số điện thoại *</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  placeholder="090xxxxxxx"
                  required={formData.consentUseInfo}
                  disabled={isPersonalSectionDisabled}
                  {...register("parentPhone")}
                />
              </div>
              <div>
                <Label htmlFor="parentEmail">Email (không bắt buộc)</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  placeholder="email@example.com"
                  disabled={isPersonalSectionDisabled}
                  {...register("parentEmail")}
                />
              </div>
              <div>
                <Label htmlFor="parentRelation">Mối quan hệ *</Label>
                <Controller
                  name="parentRelation"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange} disabled={isPersonalSectionDisabled}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn mối quan hệ" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventMeta.parentRelationOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Thông tin sự kiện */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarDays className="h-5 w-5 text-green-600" />
                3. Thông tin câu lạc bộ & sự kiện
              </CardTitle>
              <CardDescription>Chi tiết về sự kiện bạn muốn tham gia</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="clubName">Tên câu lạc bộ (auto-fill từ link)</Label>
                <Input
                  id="clubName"
                  placeholder="Câu lạc bộ Robotics"
                  disabled={isPersonalSectionDisabled}
                  {...register("clubName")}
                />
                <p className="text-xs text-muted-foreground mt-1">* Được tự động điền dựa trên link đăng ký câu lạc bộ</p>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="eventName">Tên sự kiện</Label>
                <Input
                  id="eventName"
                  readOnly
                  placeholder="Được tự động điền từ tick trong lịch sự kiện"
                  className="bg-muted"
                  {...register("eventName")}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  * Được tự động điền từ link đăng ký hoặc khi tick lựa chọn trong lịch sự kiện tham khảo.
                </p>
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label>Lịch sự kiện tham khảo</Label>
                  <span className="text-xs text-muted-foreground">Chọn đúng ngày/khung giờ còn trống</span>
                </div>
                <div className="border rounded-md overflow-x-auto overflow-y-auto max-h-[200px]">
                  <Table className="min-w-[750px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[40px]">STT</TableHead>
                        <TableHead className="w-[52px]">Chọn</TableHead>
                        <TableHead>Sự kiện</TableHead>
                        <TableHead>Ngày</TableHead>
                        <TableHead>Khung giờ</TableHead>
                        <TableHead>Địa điểm</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventMeta.eventSessions.map((session, idx) => {
                        const isSelected = formData.selectedSessions.includes(session.id)
                        return (
                          <TableRow key={session.id} className={isSelected ? "bg-green-50" : ""}>
                            <TableCell className="font-medium text-center">{idx + 1}</TableCell>
                            <TableCell>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => handleSessionToggle(session, checked as boolean)}
                                aria-label={`Chọn ${session.eventName}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{session.eventName}</TableCell>
                            <TableCell>{session.dateDisplay || session.date}</TableCell>
                            <TableCell>{session.slotLabel}</TableCell>
                            <TableCell>{session.location}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Mục đích tham gia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-green-600" />
                4. Mục đích tham gia
              </CardTitle>
              <CardDescription>Cho chúng tôi biết lý do bạn muốn tham gia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-3 block">Mục đích tham gia sự kiện (chọn nhiều):</Label>
                <div className="grid gap-3">
                  {(eventMeta.eventObjectiveOptions || []).map((objective) => (
                    <div key={objective} className="flex items-center space-x-2">
                      <Checkbox
                        id={`objective-${objective}`}
                        checked={formData.eventObjectives.includes(objective)}
                        onCheckedChange={(checked) => handleMucDichChange(objective, checked as boolean)}
                      />
                      <Label htmlFor={`objective-${objective}`} className="font-normal cursor-pointer">
                        {objective}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="heardFrom">Bạn biết đến sự kiện qua đâu? *</Label>
                <Controller
                  name="heardFrom"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn nguồn" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventMeta.heardFromOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Xác nhận thông tin */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                5. Xác nhận thông tin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-3 block">Bạn muốn nhận thông báo qua:</Label>
                <div className="flex flex-wrap gap-4">
                  {commonMeta.notificationChannels.map((channel) => (
                    <div key={channel} className="flex items-center space-x-2">
                      <Checkbox
                        id={`notify-${channel}`}
                        checked={formData.notifyVia.includes(channel)}
                        onCheckedChange={(checked) => handleNotificationChange(channel, checked as boolean)}
                      />
                      <Label htmlFor={`notify-${channel}`} className="font-normal cursor-pointer">
                        {channel}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="confirmAccuracy"
                  checked={formData.confirmAccuracy}
                  onCheckedChange={(checked) => handleInputChange("confirmAccuracy", checked as boolean)}
                  required
                />
                <Label htmlFor="confirmAccuracy" className="font-normal cursor-pointer leading-relaxed">
                  Tôi xác nhận thông tin là chính xác và đồng ý nhận thông tin từ Ban Tổ Chức.
                </Label>
              </div>
              <p className="italic text-sm text-muted-foreground">
                Vui lòng hoàn thành đầy đủ các thông tin bắt buộc (*) trước khi gửi đăng ký.
              </p>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
            disabled={!isSubmitEnabled || isSubmitting}
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang gửi...
              </span>
            ) : (
              "Tham gia sự kiện"
            )}
          </Button>
        </form>
      </div>
    </main>
  )
}

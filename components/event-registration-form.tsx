"use client"

import type React from "react"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import formMeta from "@/lib/form-meta.json"
import formDefaults from "@/lib/form-defaults.json"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Calendar, User, CalendarDays, Target, CheckCircle } from "lucide-react"
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
const aiDefaults = formDefaults

export default function EventRegistrationForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const urlSynced = useRef(false)
  const lastQuery = useRef<string>("")

  // Map URL params to form data - only run once
  useEffect(() => {
    const query = searchParams.toString()
    if (query === lastQuery.current) return
    lastQuery.current = query

    const hasParams = query.length > 0
    if (!hasParams) {
      setFormData(initialFormData)
      return
    }

    const studentDefaults = aiDefaults?.studentProfile ?? {}
    const parentDefaults = aiDefaults?.parentProfile ?? {}
    const eventDefaults = aiDefaults?.eventPreference ?? {}
    const defaultNotification = ["Email"]
    const selectedSessionsParam = searchParams.get("selectedSessions")?.split(",").filter(Boolean) || []
    const getVal = (...keys: string[]) => {
      for (const key of keys) {
        const value = searchParams.get(key)
        if (value !== null) return value
      }
      return ""
    }
    const getList = (...keys: string[]) => {
      for (const key of keys) {
        const value = searchParams.get(key)
        if (value) return value.split(",").filter(Boolean)
      }
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
      return eventMeta.eventSessions.filter((s) => s.tenSuKien.toLowerCase() === eventName.toLowerCase()).map((s) => s.id)
    }

    const mappedData: FormData = {
      fullName: getVal("fullName", "hoTen") || studentDefaults.fullName || "",
      birthDate: getVal("birthDate", "ngaySinh") || studentDefaults.birthDate || "",
      nationalId: getVal("nationalId", "cccd") || studentDefaults.nationalId || "",
      gender: getVal("gender", "gioiTinh") || studentDefaults.gender || "",
      phone: getVal("phone", "soDienThoai") || studentDefaults.phone || "",
      email: getVal("email", "email") || studentDefaults.email || "",
      highSchool: getVal("highSchool", "truongHoc") || studentDefaults.highSchool || "",
      gradeLevel: getVal("gradeLevel", "lop") || studentDefaults.gradeLevel || "",
      socialLink: getVal("socialLink", "mangXaHoi") || studentDefaults.socialLink || "",
      parentName: getVal("parentName", "hoTenPhuHuynh") || parentDefaults.parentName || "",
      parentPhone: getVal("parentPhone", "soDienThoaiPhuHuynh") || parentDefaults.parentPhone || "",
      parentEmail: getVal("parentEmail", "emailPhuHuynh") || parentDefaults.parentEmail || "",
      parentRelation: getVal("parentRelation", "moiQuanHe") || parentDefaults.parentRelation || "",
      clubName:
        getVal("clubName", "tenCauLacBo") ||
        eventDefaults.clubName ||
        eventMeta.defaultClubName ||
        parentDefaults.clubName ||
        "",
      eventName: getVal("eventName", "tenSuKien") || eventDefaults.eventName || "",
      eventDate: getVal("eventDate", "ngayThamGia") || eventDefaults.eventDate || "",
      eventSlot: getVal("eventSlot", "khungGio") || eventDefaults.eventSlot || "",
      selectedSessions: selectedSessionsParam.length
        ? selectedSessionsParam
        : preselectFromEventName(getVal("eventName", "tenSuKien") || eventDefaults.eventName),
      eventObjectives: getList("eventObjectives", "mucDichThamGia") ||
        (eventMeta.mucDichOptions.length ? [eventMeta.mucDichOptions[0]] : []),
      heardFrom: getVal("heardFrom", "bietQuaNguon") || eventDefaults.heardFrom || "",
      notifyVia: getList("notifyVia", "thongBaoQua") || defaultNotification,
      consentUseInfo: getBool(["consentUseInfo", "dongYSuDungThongTin"], true),
      confirmAccuracy: getBool(["confirmAccuracy", "xacNhanThongTin"], false),
    }
    const ensureEmailChecked = mappedData.notifyVia.includes("Email") ? mappedData.notifyVia : ["Email", ...mappedData.notifyVia]

    const selectedSessions = mappedData.selectedSessions
    const selectedSessionDetails = eventMeta.eventSessions.filter((s) => selectedSessions.includes(s.id))
    const tenSuKienAuto = selectedSessionDetails.length
      ? Array.from(new Set(selectedSessionDetails.map((s) => s.tenSuKien))).join(" | ")
      : mappedData.eventName
    const tenCauLacBoAuto = mappedData.clubName || selectedSessionDetails[0]?.tenCauLacBo || ""
    const firstSession = selectedSessionDetails[0]

    const genderFallback = mappedData.gender || studentDefaults.gender || "nam"
    const gradeFallback = mappedData.gradeLevel || studentDefaults.gradeLevel || commonMeta.lopOptions[0]?.value || ""
    const relationFallback = mappedData.parentRelation || parentDefaults.parentRelation || eventMeta.moiQuanHeOptions[0]?.value || ""

    setFormData({
      ...mappedData,
      gender: genderFallback,
      gradeLevel: gradeFallback,
      parentRelation: relationFallback,
      eventName: tenSuKienAuto,
      clubName: tenCauLacBoAuto,
      eventDate: firstSession?.ngay || mappedData.eventDate,
      eventSlot: firstSession?.khungGioValue || mappedData.eventSlot,
      notifyVia: Array.from(new Set(ensureEmailChecked)),
    })
  }, [searchParams])

  // Push form state back to URL params for sharing
  useEffect(() => {
    // avoid immediate replace before mapped data applied
    if (!urlSynced.current) {
      urlSynced.current = true
    }

    const params = new URLSearchParams()
    const addParam = (key: string, value?: string | string[] | boolean) => {
      if (value === undefined || value === null) return
      if (Array.isArray(value)) {
        if (value.length === 0) return
        params.set(key, value.join(","))
        return
      }
      if (typeof value === "boolean") {
        if (value) params.set(key, "true")
        return
      }
      if (value.trim() !== "") params.set(key, value)
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
    const target = query ? `${pathname}?${query}` : pathname
    router.replace(target, { scroll: false })
  }, [formData, router, pathname])

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMucDichChange = (mucDich: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      eventObjectives: checked ? [...prev.eventObjectives, mucDich] : prev.eventObjectives.filter((m) => m !== mucDich),
    }))
  }

  const handleNotificationChange = (channel: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      notifyVia: checked ? Array.from(new Set([...prev.notifyVia, channel])) : prev.notifyVia.filter((c) => c !== channel),
    }))
  }

  const handleSessionToggle = (session: (typeof eventMeta.eventSessions)[number], checked: boolean) => {
    setFormData((prev) => {
      const selectedSessions = checked
        ? Array.from(new Set([...prev.selectedSessions, session.id]))
        : prev.selectedSessions.filter((id) => id !== session.id)

      const selectedSessionDetails = eventMeta.eventSessions.filter((s) => selectedSessions.includes(s.id))
      const tenSuKienAuto = selectedSessionDetails.length
        ? Array.from(new Set(selectedSessionDetails.map((s) => s.tenSuKien))).join(" | ")
        : ""
      const firstSession = selectedSessionDetails[0]

      return {
        ...prev,
        selectedSessions,
        eventName: tenSuKienAuto,
        clubName: prev.clubName || firstSession?.tenCauLacBo || eventMeta.defaultClubName || "",
        eventDate: firstSession?.ngay || "",
        eventSlot: firstSession?.khungGioValue || "",
      }
    })
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    alert("Đăng ký thành công! Kiểm tra console để xem dữ liệu.")
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

        <form onSubmit={handleSubmit} className="space-y-6">
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
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required={formData.consentUseInfo}
                  disabled={isPersonalSectionDisabled}
                />
              </div>
              <div>
                <Label htmlFor="birthDate">Ngày tháng năm sinh *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                  required={formData.consentUseInfo}
                  disabled={isPersonalSectionDisabled}
                />
              </div>
              <div>
                <Label htmlFor="nationalId">CCCD *</Label>
                <Input
                  id="nationalId"
                  value={formData.nationalId}
                  onChange={(e) => handleInputChange("nationalId", e.target.value)}
                  placeholder="Số căn cước công dân"
                  required={formData.consentUseInfo}
                  disabled={isPersonalSectionDisabled}
                />
              </div>
              <div>
                <Label htmlFor="gender">Giới tính *</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v) => handleInputChange("gender", v)}
                  disabled={isPersonalSectionDisabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn giới tính" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nam">Nam</SelectItem>
                    <SelectItem value="nu">Nữ</SelectItem>
                    <SelectItem value="khac">Khác</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="0901234567"
                  required={formData.consentUseInfo}
                  disabled={isPersonalSectionDisabled}
                />
              </div>
              <div>
                <Label htmlFor="email">Email cá nhân *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@example.com"
                  required={formData.consentUseInfo}
                  disabled={isPersonalSectionDisabled}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="highSchool">Trường THPT đang học *</Label>
                <Input
                  id="highSchool"
                  value={formData.highSchool}
                  onChange={(e) => handleInputChange("highSchool", e.target.value)}
                  placeholder="Trường THPT..."
                  required={formData.consentUseInfo}
                  disabled={isPersonalSectionDisabled}
                />
              </div>
              <div>
                <Label htmlFor="gradeLevel">Lớp hiện tại *</Label>
                <Select
                  value={formData.gradeLevel}
                  onValueChange={(v) => handleInputChange("gradeLevel", v)}
                  disabled={isPersonalSectionDisabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lớp" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonMeta.lopOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="socialLink">Mạng xã hội (tùy chọn)</Label>
                <Input
                  id="socialLink"
                  value={formData.socialLink}
                  onChange={(e) => handleInputChange("socialLink", e.target.value)}
                  placeholder="https://facebook.com/tenban"
                  disabled={isPersonalSectionDisabled}
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
                  value={formData.parentName}
                  onChange={(e) => handleInputChange("parentName", e.target.value)}
                  placeholder="Nguyễn Văn B..."
                  required={formData.consentUseInfo}
                  disabled={isPersonalSectionDisabled}
                />
              </div>
              <div>
                <Label htmlFor="parentPhone">Số điện thoại *</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={formData.parentPhone}
                  onChange={(e) => handleInputChange("parentPhone", e.target.value)}
                  placeholder="090xxxxxxx"
                  required={formData.consentUseInfo}
                  disabled={isPersonalSectionDisabled}
                />
              </div>
              <div>
                <Label htmlFor="parentEmail">Email (không bắt buộc)</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={formData.parentEmail}
                  onChange={(e) => handleInputChange("parentEmail", e.target.value)}
                  placeholder="email@example.com"
                  disabled={isPersonalSectionDisabled}
                />
              </div>
              <div>
                <Label htmlFor="parentRelation">Mối quan hệ *</Label>
                <Select
                  value={formData.parentRelation}
                  onValueChange={(v) => handleInputChange("parentRelation", v)}
                  disabled={isPersonalSectionDisabled}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn mối quan hệ" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventMeta.moiQuanHeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  value={formData.clubName}
                  onChange={(e) => handleInputChange("clubName", e.target.value)}
                  placeholder="Câu lạc bộ Robotics"
                  disabled={isPersonalSectionDisabled}
                />
                <p className="text-xs text-muted-foreground mt-1">* Được tự động điền dựa trên link đăng ký câu lạc bộ</p>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="eventName">Tên sự kiện</Label>
                <Input
                  id="eventName"
                  value={formData.eventName}
                  readOnly
                  placeholder="Được tự động điền từ tick trong lịch sự kiện"
                  className="bg-muted"
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
                <div className="border rounded-md overflow-x-auto">
                  <Table className="min-w-[700px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[52px]">Chọn</TableHead>
                        <TableHead>Sự kiện</TableHead>
                        <TableHead>Ngày</TableHead>
                        <TableHead>Khung giờ</TableHead>
                        <TableHead>Địa điểm</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventMeta.eventSessions.map((session) => {
                        const isSelected = formData.selectedSessions.includes(session.id)
                        return (
                          <TableRow key={session.id} className={isSelected ? "bg-green-50" : ""}>
                            <TableCell>
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) => handleSessionToggle(session, checked as boolean)}
                                aria-label={`Chọn ${session.tenSuKien}`}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{session.tenSuKien}</TableCell>
                            <TableCell>{session.ngayDisplay || session.ngay}</TableCell>
                            <TableCell>{session.khungGio}</TableCell>
                            <TableCell>{session.diaDiem}</TableCell>
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
                  {eventMeta.mucDichOptions.map((mucDich) => (
                    <div key={mucDich} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mucDich-${mucDich}`}
                        checked={formData.eventObjectives.includes(mucDich)}
                        onCheckedChange={(checked) => handleMucDichChange(mucDich, checked as boolean)}
                      />
                      <Label htmlFor={`mucDich-${mucDich}`} className="font-normal cursor-pointer">
                        {mucDich}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="heardFrom">Bạn biết đến sự kiện qua đâu? *</Label>
                <Select value={formData.heardFrom} onValueChange={(v) => handleInputChange("heardFrom", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nguồn" />
                  </SelectTrigger>
                  <SelectContent>
                    {eventMeta.nguonOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
            disabled={!isSubmitEnabled}
          >
            Tham gia sự kiện
          </Button>
        </form>
      </div>
    </main>
  )
}

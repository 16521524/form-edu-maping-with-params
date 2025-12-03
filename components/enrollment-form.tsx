"use client"

import type React from "react"

import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import formMeta from "@/lib/form-meta.json"
import formDefaults from "@/lib/form-defaults.json"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, GraduationCap, User, BookOpen, Target, CheckCircle } from "lucide-react"
import Link from "next/link"

interface FormData {
  // 1. Personal info
  fullName: string
  birthDate: string
  nationalId: string
  gender: string
  phone: string
  email: string
  address: string
  // 2. Academic
  highSchool: string
  gradeLevel: string
  academicPerformance: string
  gpa: string
  strongSubjects: string
  socialLink: string
  // 3. Preferences
  majorPreference1: string
  majorPreference2: string
  majorPreference3: string
  // 4. Confirm
  notifyVia: string[]
  confirmAccuracy: boolean
}

const initialFormData: FormData = {
  fullName: "",
  birthDate: "",
  nationalId: "",
  gender: "",
  phone: "",
  email: "",
  address: "",
  highSchool: "",
  gradeLevel: "",
  academicPerformance: "",
  gpa: "",
  strongSubjects: "",
  socialLink: "",
  majorPreference1: "",
  majorPreference2: "",
  majorPreference3: "",
  notifyVia: ["Email"],
  confirmAccuracy: false,
}

const { common: commonMeta } = formMeta
const aiDefaults = formDefaults

export default function EnrollmentForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const urlSynced = useRef(false)
  const lastQuery = useRef<string>("")

  useEffect(() => {
    const query = searchParams.toString()
    if (query === lastQuery.current) return
    lastQuery.current = query

    const hasParams = query.length > 0
    if (!hasParams) {
      setFormData({
        ...initialFormData,
        gender: aiDefaults?.studentProfile?.gender || "",
        gradeLevel: aiDefaults?.studentProfile?.gradeLevel || "",
      })
      return
    }

    const studentDefaults = aiDefaults?.studentProfile ?? {}
    const enrollmentDefaults = aiDefaults?.enrollmentPreference ?? {}
    const defaultNotification = ["Email"]
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

    const mappedData: FormData = {
      fullName: getVal("fullName", "hoTen") || studentDefaults.fullName || "",
      birthDate: getVal("birthDate", "ngaySinh") || studentDefaults.birthDate || "",
      nationalId: getVal("nationalId", "cccd") || studentDefaults.nationalId || "",
      gender: getVal("gender", "gioiTinh") || studentDefaults.gender || "",
      phone: getVal("phone", "soDienThoai") || studentDefaults.phone || "",
      email: getVal("email", "email") || studentDefaults.email || "",
      address: getVal("address", "diaChi") || studentDefaults.address || "",
      highSchool: getVal("highSchool", "truongHoc") || studentDefaults.highSchool || "",
      gradeLevel: getVal("gradeLevel", "lop") || studentDefaults.gradeLevel || "",
      academicPerformance: getVal("academicPerformance", "hocLuc") || studentDefaults.academicPerformance || "",
      gpa: getVal("gpa", "diemTrungBinh") || studentDefaults.gpa || "",
      strongSubjects: getVal("strongSubjects", "monHocManh") || studentDefaults.strongSubjects || "",
      socialLink: getVal("socialLink", "mangXaHoi") || studentDefaults.socialLink || "",
      majorPreference1: getVal("majorPreference1", "nguyenVong1") || enrollmentDefaults.majorPreference1 || "",
      majorPreference2: getVal("majorPreference2", "nguyenVong2") || enrollmentDefaults.majorPreference2 || "",
      majorPreference3: getVal("majorPreference3", "nguyenVong3") || enrollmentDefaults.majorPreference3 || "",
      notifyVia: getList("notifyVia", "thongBaoQua") || defaultNotification,
      confirmAccuracy: getBool(["confirmAccuracy", "xacNhanThongTin"], false),
    }
    const ensureEmailChecked = mappedData.notifyVia.includes("Email") ? mappedData.notifyVia : ["Email", ...mappedData.notifyVia]
    const genderFallback = mappedData.gender || studentDefaults.gender || "nam"
    const gradeFallback = mappedData.gradeLevel || studentDefaults.gradeLevel || commonMeta.lopOptions[0]?.value || ""
    setFormData({
      ...mappedData,
      gender: genderFallback,
      gradeLevel: gradeFallback,
      notifyVia: Array.from(new Set(ensureEmailChecked)),
    })
  }, [searchParams])

  // Push form state back to URL for easy sharing
  useEffect(() => {
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
    addParam("address", formData.address)
    addParam("highSchool", formData.highSchool)
    addParam("gradeLevel", formData.gradeLevel)
    addParam("academicPerformance", formData.academicPerformance)
    addParam("gpa", formData.gpa)
    addParam("strongSubjects", formData.strongSubjects)
    addParam("socialLink", formData.socialLink)
    addParam("majorPreference1", formData.majorPreference1)
    addParam("majorPreference2", formData.majorPreference2)
    addParam("majorPreference3", formData.majorPreference3)
    addParam("notifyVia", formData.notifyVia)
    addParam("confirmAccuracy", formData.confirmAccuracy)

    const query = params.toString()
    const target = query ? `${pathname}?${query}` : pathname
    router.replace(target, { scroll: false })
  }, [formData, router, pathname])

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNotificationChange = (channel: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      notifyVia: checked ? Array.from(new Set([...prev.notifyVia, channel])) : prev.notifyVia.filter((c) => c !== channel),
    }))
  }

  const requiredFields: (keyof FormData)[] = [
    "fullName",
    "birthDate",
    "nationalId",
    "gender",
    "phone",
    "email",
    "address",
    "highSchool",
    "gradeLevel",
    "academicPerformance",
    "gpa",
    "majorPreference1",
  ]

  const requiredFieldsFilled = requiredFields.every((field) => {
    const value = formData[field]
    if (typeof value === "string") return value.trim() !== ""
    if (Array.isArray(value)) return value.length > 0
    return Boolean(value)
  })

  const isSubmitEnabled = requiredFieldsFilled && formData.confirmAccuracy

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    alert("Đăng ký thành công! Kiểm tra console để xem dữ liệu.")
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6">
          <ArrowLeft className="h-4 w-4" />
          Quay lại trang chủ
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <GraduationCap className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Đăng ký Nhập học</h1>
          <p className="text-muted-foreground mt-2">Điền đầy đủ thông tin để hoàn tất đăng ký</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Thông tin cá nhân */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-blue-600" />
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
                  required
                />
              </div>
              <div>
                <Label htmlFor="birthDate">Ngày tháng năm sinh *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => handleInputChange("birthDate", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="nationalId">Căn cước công dân *</Label>
                <Input
                  id="nationalId"
                  type="text"
                  placeholder="Căn cước công dân"
                  value={formData.nationalId}
                  onChange={(e) => handleInputChange("nationalId", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="gender">Giới tính *</Label>
                <Select value={formData.gender} onValueChange={(v) => handleInputChange("gender", v)}>
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
                  required
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
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="socialLink">Mạng xã hội (tùy chọn)</Label>
                <Input
                  id="socialLink"
                  value={formData.socialLink}
                  onChange={(e) => handleInputChange("socialLink", e.target.value)}
                  placeholder="https://facebook.com/tenban"
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Địa chỉ liên hệ *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Thông tin học tập */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
                2. Thông tin học tập
              </CardTitle>
              <CardDescription>Thông tin về quá trình học tập của bạn</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="highSchool">Trường THPT đang học *</Label>
                <Input
                  id="highSchool"
                  value={formData.highSchool}
                  onChange={(e) => handleInputChange("highSchool", e.target.value)}
                  placeholder="Trường THPT..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="gradeLevel">Lớp hiện tại *</Label>
                <Select value={formData.gradeLevel} onValueChange={(v) => handleInputChange("gradeLevel", v)}>
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
              <div>
                <Label htmlFor="academicPerformance">Học lực *</Label>
                <Select value={formData.academicPerformance} onValueChange={(v) => handleInputChange("academicPerformance", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn học lực" />
                  </SelectTrigger>
                  <SelectContent>
                    {commonMeta.hocLucOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="gpa">Điểm trung bình *</Label>
                <Input
                  id="gpa"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.gpa}
                  onChange={(e) => handleInputChange("gpa", e.target.value)}
                  placeholder="8.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="strongSubjects">Môn học mạnh</Label>
                <Input
                  id="strongSubjects"
                  value={formData.strongSubjects}
                  onChange={(e) => handleInputChange("strongSubjects", e.target.value)}
                  placeholder="Toán, Lý, Hóa..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Thông tin chọn ngành */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-blue-600" />
                3. Thông tin chọn ngành
              </CardTitle>
              <CardDescription>Ngành học và nguyện vọng của bạn</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <Label htmlFor="majorPreference1">Nguyện vọng 1 *</Label>
                <Input
                  id="majorPreference1"
                  value={formData.majorPreference1}
                  onChange={(e) => handleInputChange("majorPreference1", e.target.value)}
                  placeholder="Ngành học ưu tiên 1"
                  required
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="majorPreference2">Nguyện vọng 2</Label>
                  <Input
                    id="majorPreference2"
                    value={formData.majorPreference2}
                    onChange={(e) => handleInputChange("majorPreference2", e.target.value)}
                    placeholder="Ngành học ưu tiên 2"
                  />
                </div>
                <div>
                  <Label htmlFor="majorPreference3">Nguyện vọng 3</Label>
                  <Input
                    id="majorPreference3"
                    value={formData.majorPreference3}
                    onChange={(e) => handleInputChange("majorPreference3", e.target.value)}
                    placeholder="Ngành học ưu tiên 3"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Xác nhận thông tin */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                4. Xác nhận thông tin
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
            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
            disabled={!isSubmitEnabled}
          >
            Gửi đăng ký
          </Button>
        </form>
      </div>
    </main>
  )
}

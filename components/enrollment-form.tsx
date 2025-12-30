"use client"

import type React from "react"

import { usePathname, useSearchParams, useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
import formMeta from "@/lib/form-meta.json"
import enrollmentDefaultsData from "@/lib/form-defaults-enrollment.json"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, GraduationCap, User, BookOpen, Target, CheckCircle, Loader2 } from "lucide-react"
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
const aiDefaults = enrollmentDefaultsData

export default function EnrollmentForm() {
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
  } = useForm<FormData>({
    defaultValues: initialFormData,
  })
  const formData = useWatch({ control })

  useEffect(() => {
    const query = searchParams.toString()
    if (query === lastQuery.current && hasHydrated.current) return
    lastQuery.current = query

    const defaultsConfig = aiDefaults?.defaultsConfig ?? {}
    const getVal = (...keys: string[]) => {
      for (const key of keys) {
        const value = searchParams.get(key)
        if (value === null) continue
        if (value === "__empty") return ""
        return value
      }
      return undefined
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

    const mappedData: Partial<FormData> = {
      fullName: getVal("fullName"),
      birthDate: getVal("birthDate"),
      nationalId: getVal("nationalId"),
      gender: getVal("gender"),
      phone: getVal("phone"),
      email: getVal("email"),
      address: getVal("address"),
      highSchool: getVal("highSchool"),
      gradeLevel: getVal("gradeLevel"),
      academicPerformance: getVal("academicPerformance"),
      gpa: getVal("gpa"),
      strongSubjects: getVal("strongSubjects"),
      socialLink: getVal("socialLink"),
      majorPreference1: getVal("majorPreference1"),
      majorPreference2: getVal("majorPreference2"),
      majorPreference3: getVal("majorPreference3"),
      notifyVia: getList("notifyVia"),
      confirmAccuracy: getBool(["confirmAccuracy"], defaultsConfig.confirmAccuracy ?? false),
    }

    const meaningfulKeys = [
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
      "strongSubjects",
      "socialLink",
      "majorPreference1",
      "majorPreference2",
      "majorPreference3",
      "notifyVia",
      "confirmAccuracy",
    ]
    const hasMeaningfulParams = query.length > 0 && meaningfulKeys.some((key) => searchParams.has(key))

    if (!hasMeaningfulParams) {
      reset(initialFormData)
      setIsHydrating(false)
      hasHydrated.current = true
      return
    }

    const normalize = (value: string | undefined, fallback: string | undefined) =>
      value === undefined ? fallback ?? "" : value
    const ensureOption = (value: string | undefined, allowed: string[], fallback: string | undefined) => {
      if (value && allowed.includes(value)) return value
      if (fallback && allowed.includes(fallback)) return fallback
      return ""
    }
    const ensuredNotify = mappedData.notifyVia ?? defaultsConfig.notifyVia ?? []
    const studentDefaults = enrollmentDefaultsData.studentProfile ?? {}
    const enrollmentDefaults = enrollmentDefaultsData.enrollmentPreference ?? {}
    const allowedGenders = (commonMeta.genderOptions ?? []).map((o) => o.value)
    const allowedGrades = commonMeta.gradeOptions.map((o) => o.value)
    const allowedAcademic = commonMeta.academicPerformanceOptions.map((o) => o.value)

    reset({
      fullName: normalize(mappedData.fullName, studentDefaults.fullName),
      birthDate: normalize(mappedData.birthDate, studentDefaults.birthDate),
      nationalId: normalize(mappedData.nationalId, studentDefaults.nationalId),
      gender: ensureOption(mappedData.gender, allowedGenders, studentDefaults.gender),
      phone: normalize(mappedData.phone, studentDefaults.phone),
      email: normalize(mappedData.email, studentDefaults.email),
      address: normalize(mappedData.address, studentDefaults.address),
      highSchool: normalize(mappedData.highSchool, studentDefaults.highSchool),
      gradeLevel: ensureOption(mappedData.gradeLevel, allowedGrades, studentDefaults.gradeLevel),
      academicPerformance: ensureOption(mappedData.academicPerformance, allowedAcademic, studentDefaults.academicPerformance),
      gpa: normalize(mappedData.gpa, studentDefaults.gpa),
      strongSubjects: normalize(mappedData.strongSubjects, studentDefaults.strongSubjects),
      socialLink: normalize(mappedData.socialLink, studentDefaults.socialLink),
      majorPreference1: normalize(mappedData.majorPreference1, enrollmentDefaults.majorPreference1),
      majorPreference2: normalize(mappedData.majorPreference2, enrollmentDefaults.majorPreference2),
      majorPreference3: normalize(mappedData.majorPreference3, enrollmentDefaults.majorPreference3),
      notifyVia: Array.from(new Set(ensuredNotify)),
      confirmAccuracy: mappedData.confirmAccuracy ?? false,
    })
    hydratedSnapshot.current = {
      fullName: normalize(mappedData.fullName, studentDefaults.fullName),
      birthDate: normalize(mappedData.birthDate, studentDefaults.birthDate),
      nationalId: normalize(mappedData.nationalId, studentDefaults.nationalId),
      gender: ensureOption(mappedData.gender, allowedGenders, studentDefaults.gender),
      phone: normalize(mappedData.phone, studentDefaults.phone),
      email: normalize(mappedData.email, studentDefaults.email),
      address: normalize(mappedData.address, studentDefaults.address),
      highSchool: normalize(mappedData.highSchool, studentDefaults.highSchool),
      gradeLevel: ensureOption(mappedData.gradeLevel, allowedGrades, studentDefaults.gradeLevel),
      academicPerformance: ensureOption(mappedData.academicPerformance, allowedAcademic, studentDefaults.academicPerformance),
      gpa: normalize(mappedData.gpa, studentDefaults.gpa),
      strongSubjects: normalize(mappedData.strongSubjects, studentDefaults.strongSubjects),
      socialLink: normalize(mappedData.socialLink, studentDefaults.socialLink),
      majorPreference1: normalize(mappedData.majorPreference1, enrollmentDefaults.majorPreference1),
      majorPreference2: normalize(mappedData.majorPreference2, enrollmentDefaults.majorPreference2),
      majorPreference3: normalize(mappedData.majorPreference3, enrollmentDefaults.majorPreference3),
      notifyVia: Array.from(new Set(ensuredNotify)),
      confirmAccuracy: mappedData.confirmAccuracy ?? false,
    }
    skipNextSync.current = true
    setIsHydrating(false)
    hasHydrated.current = true
  }, [searchParams, reset])

  // Push form state back to URL for easy sharing
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
    if (query === lastQuery.current) return
    lastQuery.current = query
    const target = query ? `${pathname}?${query}` : pathname
    router.replace(target, { scroll: false })
  }, [formData, router, pathname])

  const handleNotificationChange = (channel: string, checked: boolean) => {
    const current = formData.notifyVia || []
    const next = checked ? Array.from(new Set([...current, channel])) : current.filter((c) => c !== channel)
    setValue("notifyVia", next)
  }

  const requiredFields: (keyof FormData)[] = ["fullName", "phone", "email", "highSchool", "majorPreference1"]

  const requiredFieldsFilled = requiredFields.every((field) => {
    const value = formData[field]
    if (typeof value === "string") return value.trim() !== ""
    if (Array.isArray(value)) return value.length > 0
    return Boolean(value)
  })

  const isSubmitEnabled = requiredFieldsFilled

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
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="flex items-center gap-3 text-blue-700">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Đang tải dữ liệu...</span>
        </div>
      </main>
    )
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
                <Input id="fullName" placeholder="Nguyễn Văn A" required {...register("fullName")} />
              </div>
              <div>
                <Label htmlFor="birthDate">Ngày tháng năm sinh</Label>
                <Input id="birthDate" type="date" {...register("birthDate")} />
              </div>
              <div>
                <Label htmlFor="nationalId">Căn cước công dân</Label>
                <Input id="nationalId" type="text" placeholder="Căn cước công dân" {...register("nationalId")} />
              </div>
              <div>
                <Label htmlFor="gender">Giới tính</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
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
                <Input id="phone" type="tel" placeholder="0901234567" required {...register("phone")} />
              </div>
              <div>
                <Label htmlFor="email">Email cá nhân *</Label>
                <Input id="email" type="email" placeholder="email@example.com" required {...register("email")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="socialLink">Mạng xã hội (tùy chọn)</Label>
                <Input id="socialLink" placeholder="https://facebook.com/tenban" {...register("socialLink")} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">Địa chỉ liên hệ</Label>
                <Textarea id="address" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" {...register("address")} />
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
                <Input id="highSchool" placeholder="Trường THPT..." required {...register("highSchool")} />
              </div>
              <div>
                <Label htmlFor="gradeLevel">Lớp hiện tại</Label>
                <Controller
                  name="gradeLevel"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
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
              <div>
                <Label htmlFor="academicPerformance">Học lực</Label>
                <Controller
                  name="academicPerformance"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn học lực" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonMeta.academicPerformanceOptions.map((option) => (
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
                <Label htmlFor="gpa">Điểm trung bình</Label>
                <Input id="gpa" type="number" step="0.1" min="0" max="10" placeholder="8.5" {...register("gpa")} />
              </div>
              <div>
                <Label htmlFor="strongSubjects">Môn học mạnh</Label>
                <Input id="strongSubjects" placeholder="Toán, Lý, Hóa..." {...register("strongSubjects")} />
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
                  placeholder="Ngành học ưu tiên 1"
                  required
                  {...register("majorPreference1")}
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="majorPreference2">Nguyện vọng 2</Label>
                  <Input id="majorPreference2" placeholder="Ngành học ưu tiên 2" {...register("majorPreference2")} />
                </div>
                <div>
                  <Label htmlFor="majorPreference3">Nguyện vọng 3</Label>
                  <Input id="majorPreference3" placeholder="Ngành học ưu tiên 3" {...register("majorPreference3")} />
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
                  onCheckedChange={(checked) => setValue("confirmAccuracy", checked as boolean)}
                  required
                />
                <Label htmlFor="confirmAccuracy" className="font-normal cursor-pointer leading-relaxed">
                  Tôi xác nhận thông tin là chính xác và đồng ý nhận thông tin từ Ban Tổ Chức.
                </Label>
              </div>
              <p className="italic text-sm text-muted-foreground">
                Vui lòng hoàn thành đầy đủ các thông tin bắt buộc (*) trước khi hoàn tất đăng ký.
              </p>
            </CardContent>
          </Card>

        <Button
          type="submit"
          className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
          disabled={!isSubmitEnabled || isSubmitting}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang gửi...
            </span>
          ) : (
            "Hoàn tất đăng ký"
          )}
        </Button>
        </form>
      </div>
    </main>
  )
}

"use client"

import type React from "react"

import { useSearchParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Calendar, User, CalendarDays, Target, CheckCircle } from "lucide-react"
import Link from "next/link"

interface FormData {
  // 1. Thông tin cá nhân
  hoTen: string
  ngaySinh: string
  gioiTinh: string
  soDienThoai: string
  email: string
  truongHoc: string
  lop: string
  // 2. Thông tin sự kiện
  tenSuKien: string
  ngayThamGia: string
  khungGio: string
  // 3. Mục đích tham gia
  mucDichThamGia: string[]
  bietQuaNguon: string
  // 4. Xác nhận
  thongBaoQua: string[]
  xacNhanThongTin: boolean
}

const initialFormData: FormData = {
  hoTen: "",
  ngaySinh: "",
  gioiTinh: "",
  soDienThoai: "",
  email: "",
  truongHoc: "",
  lop: "",
  tenSuKien: "",
  ngayThamGia: "",
  khungGio: "",
  mucDichThamGia: [],
  bietQuaNguon: "",
  thongBaoQua: [],
  xacNhanThongTin: false,
}

const mucDichOptions = [
  "Tìm hiểu về các ngành học",
  "Tham quan trường đại học",
  "Tìm hiểu học bổng và chính sách hỗ trợ",
  "Khám phá môi trường học tập",
  "Gặp gỡ giảng viên và sinh viên",
]

const nguonOptions = [
  { value: "facebook", label: "Facebook" },
  { value: "tiktok", label: "TikTok" },
  { value: "instagram", label: "Instagram" },
  { value: "ban-be", label: "Bạn bè giới thiệu" },
  { value: "truong-thpt", label: "Trường THPT" },
  { value: "website", label: "Website trường" },
  { value: "bao-chi", label: "Báo chí / Truyền thông" },
  { value: "khac", label: "Khác" },
]

const khungGioOptions = [
  { value: "sang", label: "Buổi sáng (8:00 - 12:00)" },
  { value: "chieu", label: "Buổi chiều (13:30 - 17:30)" },
  { value: "ca-ngay", label: "Cả ngày" },
]

export default function EventRegistrationForm() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const paramsLoaded = useRef(false)

  // Map URL params to form data - only run once
  useEffect(() => {
    if (paramsLoaded.current) return
    paramsLoaded.current = true

    const mappedData: FormData = {
      hoTen: searchParams.get("hoTen") || "",
      ngaySinh: searchParams.get("ngaySinh") || "",
      gioiTinh: searchParams.get("gioiTinh") || "",
      soDienThoai: searchParams.get("soDienThoai") || "",
      email: searchParams.get("email") || "",
      truongHoc: searchParams.get("truongHoc") || "",
      lop: searchParams.get("lop") || "",
      tenSuKien: searchParams.get("tenSuKien") || "",
      ngayThamGia: searchParams.get("ngayThamGia") || "",
      khungGio: searchParams.get("khungGio") || "",
      mucDichThamGia: [],
      bietQuaNguon: searchParams.get("bietQuaNguon") || "",
      thongBaoQua: [],
      xacNhanThongTin: false,
    }
    setFormData(mappedData)
  }, [searchParams])

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMucDichChange = (mucDich: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      mucDichThamGia: checked ? [...prev.mucDichThamGia, mucDich] : prev.mucDichThamGia.filter((m) => m !== mucDich),
    }))
  }

  const handleNotificationChange = (channel: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      thongBaoQua: checked ? [...prev.thongBaoQua, channel] : prev.thongBaoQua.filter((c) => c !== channel),
    }))
  }

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
          <h1 className="text-3xl font-bold text-foreground">Đăng ký Tham gia Sự kiện</h1>
          <p className="text-muted-foreground mt-2">Điền thông tin để đăng ký tham gia sự kiện</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Thông tin cá nhân */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-green-600" />
                1. Thông tin cá nhân
              </CardTitle>
              <CardDescription>Thông tin liên hệ của bạn</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="hoTen">Họ và tên đầy đủ *</Label>
                <Input
                  id="hoTen"
                  value={formData.hoTen}
                  onChange={(e) => handleInputChange("hoTen", e.target.value)}
                  placeholder="Nguyễn Văn A"
                  required
                />
              </div>
              <div>
                <Label htmlFor="ngaySinh">Ngày tháng năm sinh *</Label>
                <Input
                  id="ngaySinh"
                  type="date"
                  value={formData.ngaySinh}
                  onChange={(e) => handleInputChange("ngaySinh", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="gioiTinh">Giới tính *</Label>
                <Select value={formData.gioiTinh} onValueChange={(v) => handleInputChange("gioiTinh", v)}>
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
                <Label htmlFor="soDienThoai">Số điện thoại *</Label>
                <Input
                  id="soDienThoai"
                  type="tel"
                  value={formData.soDienThoai}
                  onChange={(e) => handleInputChange("soDienThoai", e.target.value)}
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
                <Label htmlFor="truongHoc">Trường THPT đang học *</Label>
                <Input
                  id="truongHoc"
                  value={formData.truongHoc}
                  onChange={(e) => handleInputChange("truongHoc", e.target.value)}
                  placeholder="Trường THPT..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="lop">Lớp hiện tại *</Label>
                <Select value={formData.lop} onValueChange={(v) => handleInputChange("lop", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn lớp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">Lớp 10</SelectItem>
                    <SelectItem value="11">Lớp 11</SelectItem>
                    <SelectItem value="12">Lớp 12</SelectItem>
                    <SelectItem value="tot-nghiep">Đã tốt nghiệp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Thông tin sự kiện */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CalendarDays className="h-5 w-5 text-green-600" />
                2. Thông tin sự kiện
              </CardTitle>
              <CardDescription>Chi tiết về sự kiện bạn muốn tham gia</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="tenSuKien">Tên sự kiện</Label>
                <Input
                  id="tenSuKien"
                  value={formData.tenSuKien}
                  onChange={(e) => handleInputChange("tenSuKien", e.target.value)}
                  placeholder="Được tự động điền từ link đăng ký"
                  readOnly={!!searchParams.get("tenSuKien")}
                  className={searchParams.get("tenSuKien") ? "bg-muted" : ""}
                />
                {searchParams.get("tenSuKien") && (
                  <p className="text-xs text-muted-foreground mt-1">* Được điền tự động từ link đăng ký</p>
                )}
              </div>
              <div>
                <Label htmlFor="ngayThamGia">Ngày tham gia *</Label>
                <Input
                  id="ngayThamGia"
                  type="date"
                  value={formData.ngayThamGia}
                  onChange={(e) => handleInputChange("ngayThamGia", e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="khungGio">Khung giờ mong muốn *</Label>
                <Select value={formData.khungGio} onValueChange={(v) => handleInputChange("khungGio", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khung giờ" />
                  </SelectTrigger>
                  <SelectContent>
                    {khungGioOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Mục đích tham gia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5 text-green-600" />
                3. Mục đích tham gia
              </CardTitle>
              <CardDescription>Cho chúng tôi biết lý do bạn muốn tham gia</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-3 block">Mục đích tham gia sự kiện (chọn nhiều):</Label>
                <div className="grid gap-3">
                  {mucDichOptions.map((mucDich) => (
                    <div key={mucDich} className="flex items-center space-x-2">
                      <Checkbox
                        id={`mucDich-${mucDich}`}
                        checked={formData.mucDichThamGia.includes(mucDich)}
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
                <Label htmlFor="bietQuaNguon">Bạn biết đến sự kiện qua đâu? *</Label>
                <Select value={formData.bietQuaNguon} onValueChange={(v) => handleInputChange("bietQuaNguon", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nguồn" />
                  </SelectTrigger>
                  <SelectContent>
                    {nguonOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Xác nhận thông tin */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                4. Xác nhận thông tin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-3 block">Bạn muốn nhận thông báo qua:</Label>
                <div className="flex flex-wrap gap-4">
                  {["Email", "Zalo", "Messenger", "Whatsapp"].map((channel) => (
                    <div key={channel} className="flex items-center space-x-2">
                      <Checkbox
                        id={`notify-${channel}`}
                        checked={formData.thongBaoQua.includes(channel)}
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
                  id="xacNhan"
                  checked={formData.xacNhanThongTin}
                  onCheckedChange={(checked) => handleInputChange("xacNhanThongTin", checked as boolean)}
                  required
                />
                <Label htmlFor="xacNhan" className="font-normal cursor-pointer leading-relaxed">
                  Tôi xác nhận thông tin trên là chính xác và đồng ý nhận thông tin từ ban tổ chức.
                </Label>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
            disabled={!formData.xacNhanThongTin}
          >
            Đăng ký tham gia
          </Button>
        </form>
      </div>
    </main>
  )
}

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
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, GraduationCap, User, BookOpen, Target, CheckCircle } from "lucide-react"
import Link from "next/link"

interface FormData {
  // 1. Thông tin cá nhân
  hoTen: string
  ngaySinh: string
  gioiTinh: string
  soDienThoai: string
  email: string
  diaChi: string
  // 2. Thông tin học tập
  truongHoc: string
  lop: string
  hocLuc: string
  diemTrungBinh: string
  monHocManh: string
  // 3. Thông tin chọn ngành
  nganhDangKy: string
  nguyenVong1: string
  nguyenVong2: string
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
  diaChi: "",
  truongHoc: "",
  lop: "",
  hocLuc: "",
  diemTrungBinh: "",
  monHocManh: "",
  nganhDangKy: "",
  nguyenVong1: "",
  nguyenVong2: "",
  thongBaoQua: [],
  xacNhanThongTin: false,
}

const nganhHocOptions = [
  { value: "cong-nghe-thong-tin", label: "Công nghệ Thông tin" },
  { value: "ky-thuat-phan-mem", label: "Kỹ thuật Phần mềm" },
  { value: "khoa-hoc-may-tinh", label: "Khoa học Máy tính" },
  { value: "ai-tri-tue-nhan-tao", label: "AI – Trí tuệ Nhân tạo" },
  { value: "quan-tri-kinh-doanh", label: "Quản trị Kinh doanh" },
  { value: "ke-toan", label: "Kế toán" },
  { value: "marketing", label: "Marketing" },
  { value: "thiet-ke-do-hoa", label: "Thiết kế Đồ họa" },
]

export default function EnrollmentForm() {
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const paramsLoaded = useRef(false)

  useEffect(() => {
    if (paramsLoaded.current) return
    paramsLoaded.current = true

    const mappedData: FormData = {
      hoTen: searchParams.get("hoTen") || "",
      ngaySinh: searchParams.get("ngaySinh") || "",
      gioiTinh: searchParams.get("gioiTinh") || "",
      soDienThoai: searchParams.get("soDienThoai") || "",
      email: searchParams.get("email") || "",
      diaChi: searchParams.get("diaChi") || "",
      truongHoc: searchParams.get("truongHoc") || "",
      lop: searchParams.get("lop") || "",
      hocLuc: searchParams.get("hocLuc") || "",
      diemTrungBinh: searchParams.get("diemTrungBinh") || "",
      monHocManh: searchParams.get("monHocManh") || "",
      nganhDangKy: searchParams.get("nganhDangKy") || "",
      nguyenVong1: searchParams.get("nguyenVong1") || "",
      nguyenVong2: searchParams.get("nguyenVong2") || "",
      thongBaoQua: [],
      xacNhanThongTin: false,
    }
    setFormData(mappedData)
  }, [searchParams])

  const handleInputChange = (field: keyof FormData, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
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
                <Label htmlFor="diaChi">Địa chỉ liên hệ *</Label>
                <Textarea
                  id="diaChi"
                  value={formData.diaChi}
                  onChange={(e) => handleInputChange("diaChi", e.target.value)}
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
              <div>
                <Label htmlFor="hocLuc">Học lực *</Label>
                <Select value={formData.hocLuc} onValueChange={(v) => handleInputChange("hocLuc", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn học lực" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gioi">Giỏi</SelectItem>
                    <SelectItem value="kha">Khá</SelectItem>
                    <SelectItem value="trung-binh">Trung bình</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="diemTrungBinh">Điểm trung bình *</Label>
                <Input
                  id="diemTrungBinh"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.diemTrungBinh}
                  onChange={(e) => handleInputChange("diemTrungBinh", e.target.value)}
                  placeholder="8.5"
                  required
                />
              </div>
              <div>
                <Label htmlFor="monHocManh">Môn học mạnh</Label>
                <Input
                  id="monHocManh"
                  value={formData.monHocManh}
                  onChange={(e) => handleInputChange("monHocManh", e.target.value)}
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
                <Label htmlFor="nganhDangKy">Ngành đăng ký *</Label>
                <Select value={formData.nganhDangKy} onValueChange={(v) => handleInputChange("nganhDangKy", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn ngành học" />
                  </SelectTrigger>
                  <SelectContent>
                    {nganhHocOptions.map((nganh) => (
                      <SelectItem key={nganh.value} value={nganh.value}>
                        {nganh.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nguyenVong1">Nguyện vọng 1</Label>
                  <Input
                    id="nguyenVong1"
                    value={formData.nguyenVong1}
                    onChange={(e) => handleInputChange("nguyenVong1", e.target.value)}
                    placeholder="Ngành học ưu tiên 1"
                  />
                </div>
                <div>
                  <Label htmlFor="nguyenVong2">Nguyện vọng 2</Label>
                  <Input
                    id="nguyenVong2"
                    value={formData.nguyenVong2}
                    onChange={(e) => handleInputChange("nguyenVong2", e.target.value)}
                    placeholder="Ngành học ưu tiên 2"
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
                  Tôi xác nhận thông tin trên là chính xác và đồng ý với các điều khoản của trường.
                </Label>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700"
            disabled={!formData.xacNhanThongTin}
          >
            Gửi đăng ký
          </Button>
        </form>
      </div>
    </main>
  )
}

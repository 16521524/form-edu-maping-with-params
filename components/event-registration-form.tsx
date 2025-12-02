"use client"

import type React from "react"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import formMeta from "@/lib/form-meta.json"
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
  // 1. Thông tin cá nhân
  hoTen: string
  ngaySinh: string
  cccd: string
  gioiTinh: string
  soDienThoai: string
  email: string
  truongHoc: string
  lop: string
  // 2. Thông tin phụ huynh
  hoTenPhuHuynh: string
  soDienThoaiPhuHuynh: string
  emailPhuHuynh: string
  moiQuanHe: string
  // 3. Thông tin sự kiện
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
  cccd: "",
  gioiTinh: "",
  soDienThoai: "",
  email: "",
  truongHoc: "",
  lop: "",
  hoTenPhuHuynh: "",
  soDienThoaiPhuHuynh: "",
  emailPhuHuynh: "",
  moiQuanHe: "",
  tenSuKien: "",
  ngayThamGia: "",
  khungGio: "",
  mucDichThamGia: [],
  bietQuaNguon: "",
  thongBaoQua: [],
  xacNhanThongTin: false,
}

const eventMeta = formMeta.event
const commonMeta = formMeta.common

export default function EventRegistrationForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const paramsLoaded = useRef(false)
  const urlSynced = useRef(false)

  // Map URL params to form data - only run once
  useEffect(() => {
    if (paramsLoaded.current) return
    paramsLoaded.current = true

    const mappedData: FormData = {
      hoTen: searchParams.get("hoTen") || "",
      ngaySinh: searchParams.get("ngaySinh") || "",
      cccd: searchParams.get("cccd") || "",
      gioiTinh: searchParams.get("gioiTinh") || "",
      soDienThoai: searchParams.get("soDienThoai") || "",
      email: searchParams.get("email") || "",
      truongHoc: searchParams.get("truongHoc") || "",
      lop: searchParams.get("lop") || "",
      hoTenPhuHuynh: searchParams.get("hoTenPhuHuynh") || "",
      soDienThoaiPhuHuynh: searchParams.get("soDienThoaiPhuHuynh") || "",
      emailPhuHuynh: searchParams.get("emailPhuHuynh") || "",
      moiQuanHe: searchParams.get("moiQuanHe") || "",
      tenSuKien: searchParams.get("tenSuKien") || "",
      ngayThamGia: searchParams.get("ngayThamGia") || "",
      khungGio: searchParams.get("khungGio") || "",
      mucDichThamGia: searchParams.get("mucDichThamGia")?.split(",").filter(Boolean) || [],
      bietQuaNguon: searchParams.get("bietQuaNguon") || "",
      thongBaoQua: searchParams.get("thongBaoQua")?.split(",").filter(Boolean) || [],
      xacNhanThongTin: searchParams.get("xacNhanThongTin") === "true",
    }
    setFormData(mappedData)
  }, [searchParams])

  // Push form state back to URL params for sharing
  useEffect(() => {
    if (!paramsLoaded.current) return
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

    addParam("hoTen", formData.hoTen)
    addParam("ngaySinh", formData.ngaySinh)
    addParam("cccd", formData.cccd)
    addParam("gioiTinh", formData.gioiTinh)
    addParam("soDienThoai", formData.soDienThoai)
    addParam("email", formData.email)
    addParam("truongHoc", formData.truongHoc)
    addParam("lop", formData.lop)
    addParam("hoTenPhuHuynh", formData.hoTenPhuHuynh)
    addParam("soDienThoaiPhuHuynh", formData.soDienThoaiPhuHuynh)
    addParam("emailPhuHuynh", formData.emailPhuHuynh)
    addParam("moiQuanHe", formData.moiQuanHe)
    addParam("tenSuKien", formData.tenSuKien)
    addParam("ngayThamGia", formData.ngayThamGia)
    addParam("khungGio", formData.khungGio)
    addParam("mucDichThamGia", formData.mucDichThamGia)
    addParam("bietQuaNguon", formData.bietQuaNguon)
    addParam("thongBaoQua", formData.thongBaoQua)
    addParam("xacNhanThongTin", formData.xacNhanThongTin)

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
                <Label htmlFor="cccd">CCCD *</Label>
                <Input
                  id="cccd"
                  value={formData.cccd}
                  onChange={(e) => handleInputChange("cccd", e.target.value)}
                  placeholder="Số căn cước công dân"
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
                    {commonMeta.lopOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Thông tin phụ huynh */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-green-600" />
                2. Thông tin phụ huynh
              </CardTitle>
              <CardDescription>Liên hệ để phối hợp cùng gia đình</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="hoTenPhuHuynh">Họ và tên phụ huynh *</Label>
                <Input
                  id="hoTenPhuHuynh"
                  value={formData.hoTenPhuHuynh}
                  onChange={(e) => handleInputChange("hoTenPhuHuynh", e.target.value)}
                  placeholder="Nguyễn Văn B..."
                  required
                />
              </div>
              <div>
                <Label htmlFor="soDienThoaiPhuHuynh">Số điện thoại *</Label>
                <Input
                  id="soDienThoaiPhuHuynh"
                  type="tel"
                  value={formData.soDienThoaiPhuHuynh}
                  onChange={(e) => handleInputChange("soDienThoaiPhuHuynh", e.target.value)}
                  placeholder="090xxxxxxx"
                  required
                />
              </div>
              <div>
                <Label htmlFor="emailPhuHuynh">Email (không bắt buộc)</Label>
                <Input
                  id="emailPhuHuynh"
                  type="email"
                  value={formData.emailPhuHuynh}
                  onChange={(e) => handleInputChange("emailPhuHuynh", e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="moiQuanHe">Mối quan hệ *</Label>
                <Select value={formData.moiQuanHe} onValueChange={(v) => handleInputChange("moiQuanHe", v)}>
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
                3. Thông tin sự kiện
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
                    {eventMeta.khungGioOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <Label>Lịch sự kiện tham khảo</Label>
                  <span className="text-xs text-muted-foreground">Chọn đúng ngày/khung giờ còn trống</span>
                </div>
                <div className="border rounded-md overflow-x-auto">
                  <Table className="min-w-[640px]">
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sự kiện</TableHead>
                        <TableHead>Ngày</TableHead>
                        <TableHead>Khung giờ</TableHead>
                        <TableHead>Địa điểm</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {eventMeta.eventSessions.map((session) => {
                        const isSelected =
                          formData.tenSuKien.toLowerCase() === session.tenSuKien.toLowerCase() ||
                          (!formData.tenSuKien && session.tenSuKien.toLowerCase().includes("tư vấn"))
                        return (
                          <TableRow key={`${session.tenSuKien}-${session.ngay}-${session.khungGio}`} className={isSelected ? "bg-green-50" : ""}>
                            <TableCell className="font-medium">{session.tenSuKien}</TableCell>
                            <TableCell>{session.ngay}</TableCell>
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

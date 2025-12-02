import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, Calendar } from "lucide-react"

const sampleStudentData = {
  hoTen: "Nguyễn Văn T.",
  ngaySinh: "2007-02-21",
  cccd: "079203000123",
  gioiTinh: "nam",
  soDienThoai: "0901234567",
  email: "nguyenvant@email.com",
  diaChi: "Khu phố 1, Phường Tân Mỹ, TP Hồ Chí Minh, Việt Nam",
  truongHoc: "Trường THPT Ngô Quyền",
  lop: "12",
  hocLuc: "gioi",
  diemTrungBinh: "8.5",
  monHocManh: "Toán, Tin học, Tiếng Anh, Vật lý",
  nguyenVong1: "Ngành Công nghệ Thông Tin",
  nguyenVong2: "Ngành AI – Trí Tuệ Nhân Tạo",
  nguyenVong3: "Ngành Quản trị Kinh doanh",
}

const sampleEventData = {
  ...sampleStudentData,
  tenSuKien: "Ngày hội tư vấn tuyển sinh 2025",
  ngayThamGia: "2025-03-15",
  khungGio: "sang",
  bietQuaNguon: "facebook",
  hoTenPhuHuynh: "Nguyễn Văn B.",
  soDienThoaiPhuHuynh: "0912345678",
  emailPhuHuynh: "phuhuynh@example.com",
  moiQuanHe: "cha",
}

// Pre-compute URLs outside component
const enrollmentParams = new URLSearchParams(sampleStudentData as Record<string, string>).toString()
const eventParams = new URLSearchParams(sampleEventData as Record<string, string>).toString()

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Hệ thống Đăng ký Sinh viên</h1>
          {/* <p className="text-muted-foreground">Click vào các link bên dưới để test mapping URL params vào form</p> */}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-6 w-6 text-blue-600" />
                Form Đăng ký Nhập học
              </CardTitle>
              <CardDescription>Đăng ký xét tuyển vào các ngành học tại trường</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/dang-ky-nhap-hoc?${enrollmentParams}`}>
                <Button className="w-full bg-blue-600 hover:bg-blue-700">Mở Form (với dữ liệu mẫu)</Button>
              </Link>
              <Link href="/dang-ky-nhap-hoc" className="block mt-2">
                <Button variant="outline" className="w-full bg-transparent">
                  Mở Form (trống)
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-6 w-6 text-green-600" />
                Form Đăng ký Sự kiện
              </CardTitle>
              <CardDescription>Đăng ký tham gia các sự kiện tư vấn tuyển sinh</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/dang-ky-su-kien?${eventParams}`}>
                <Button className="w-full bg-green-600 hover:bg-green-700">Mở Form (với dữ liệu mẫu)</Button>
              </Link>
              <Link href="/dang-ky-su-kien" className="block mt-2">
                <Button variant="outline" className="w-full bg-transparent">
                  Mở Form (trống)
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Sample URL params display */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-lg">URL Params Reference</CardTitle>
            <CardDescription>Danh sách các params có thể truyền vào URL</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono bg-muted p-4 rounded-lg overflow-x-auto">
              <p className="font-semibold mb-2 font-sans">Form Đăng ký Nhập học:</p>
              <code className="text-xs break-all">
                ?hoTen=...&ngaySinh=...&cccd=...&gioiTinh=...&soDienThoai=...&email=...&diaChi=...&truongHoc=...&lop=...&hocLuc=...&diemTrungBinh=...&monHocManh=...&nguyenVong1=...&nguyenVong2=...&nguyenVong3=...
              </code>

              <p className="font-semibold mt-4 mb-2 font-sans">Form Đăng ký Sự kiện:</p>
              <code className="text-xs break-all">
                ?hoTen=...&ngaySinh=...&cccd=...&soDienThoai=...&email=...&truongHoc=...&lop=...&hoTenPhuHuynh=...&soDienThoaiPhuHuynh=...&emailPhuHuynh=...&moiQuanHe=...&tenSuKien=...&ngayThamGia=...&khungGio=...&bietQuaNguon=...
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

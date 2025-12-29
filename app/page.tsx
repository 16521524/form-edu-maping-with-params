import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GraduationCap, Calendar, Compass } from "lucide-react"
import enrollmentDefaults from "@/lib/form-defaults-enrollment.json"
import eventDefaults from "@/lib/form-defaults-event.json"
import careerDefaults from "@/lib/form-defaults-career.json"

const sampleStudentData = {
  ...enrollmentDefaults.studentProfile,
  ...enrollmentDefaults.enrollmentPreference,
  notifyVia: "Email",
  confirmAccuracy: "true",
}

const sampleEventData = {
  ...sampleStudentData,
  ...eventDefaults.parentProfile,
  ...eventDefaults.eventPreference,
  selectedSessions: "openday-2203",
  confirmAccuracy: "true",
  consentUseInfo: "true",
}

// Pre-compute URLs outside component
const enrollmentParams = new URLSearchParams(sampleStudentData as Record<string, string>).toString()
const eventParams = new URLSearchParams(sampleEventData as Record<string, string>).toString()
const careerSampleData = {
  ...careerDefaults,
  aspirations: (careerDefaults.aspirations || []).join(","),
  confirmAccuracy: "true",
}
const careerParams = new URLSearchParams(careerSampleData as Record<string, string>).toString()

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-4">Hệ thống Đăng ký Sinh viên</h1>
          {/* <p className="text-muted-foreground">Click vào các link bên dưới để test mapping URL params vào form</p> */}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
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

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-6 w-6 text-indigo-600" />
                Form Đăng ký tư vấn hướng nghiệp
              </CardTitle>
              <CardDescription>Mobile-first form bám sát layout hình mẫu</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href={`/dang-ky-tu-van-huong-nghiep?${careerParams}`}>
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">Mở Form (với dữ liệu mẫu)</Button>
              </Link>
              <Link href="/dang-ky-tu-van-huong-nghiep" className="block mt-2">
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
                ?fullName=...&birthDate=...&nationalId=...&gender=...&phone=...&email=...&address=...&highSchool=...&gradeLevel=...&academicPerformance=...&gpa=...&strongSubjects=...&socialLink=...&majorPreference1=...&majorPreference2=...&majorPreference3=...&notifyVia=Email,Zalo&confirmAccuracy=true
              </code>

              <p className="font-semibold mt-4 mb-2 font-sans">Form Đăng ký Sự kiện:</p>
              <code className="text-xs break-all">
                ?fullName=...&birthDate=...&nationalId=...&phone=...&email=...&highSchool=...&gradeLevel=...&socialLink=...&parentName=...&parentPhone=...&parentEmail=...&parentRelation=...&clubName=...&eventName=...&selectedSessions=...&heardFrom=...&consentUseInfo=true&confirmAccuracy=true
              </code>

              <p className="font-semibold mt-4 mb-2 font-sans">Form Đăng ký tư vấn hướng nghiệp:</p>
              <code className="text-xs break-all">
                ?fullName=...&birthDate=...&gender=...&address=...&phone=...&nationalId=...&email=...&socialLink=...&utmCampaign=...&city=...&school=...&gradeLevel=...&academicPerformance=...&gpa=...&aspirations=...&notifyVia=...&confirmAccuracy=true
              </code>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

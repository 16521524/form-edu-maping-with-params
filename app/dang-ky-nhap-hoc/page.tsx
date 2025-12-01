import { Suspense } from "react"
import EnrollmentForm from "@/components/enrollment-form"

export const metadata = {
  title: "Đăng ký Nhập học",
  description: "Form đăng ký nhập học cho sinh viên",
}

export default function EnrollmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <EnrollmentForm />
    </Suspense>
  )
}

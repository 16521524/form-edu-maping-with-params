import { Suspense } from "react"
import CareerConsultationForm from "@/components/career-consultation-form"

export const metadata = {
  title: "Đăng ký tư vấn hướng nghiệp",
  description: "Form đăng ký tư vấn hướng nghiệp (mobile first)",
}

export default function CareerConsultationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <CareerConsultationForm />
    </Suspense>
  )
}

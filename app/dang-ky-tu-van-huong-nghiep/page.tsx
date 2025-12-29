import { Suspense } from "react"
import CareerConsultationForm from "@/components/career-consultation-form"

export const metadata = {
  title: "Đăng ký tư vấn hướng nghiệp",
  description: "Form đăng ký tư vấn hướng nghiệp",
  openGraph: {
    title: "Đăng ký tư vấn hướng nghiệp",
    description: "Form đăng ký tư vấn hướng nghiệp",
    images: [
      "https://giadinh.edu.vn/upload/photo/logo-dai-hoc-gia-dinh-9904.png",
    ],
  },
}

export default function CareerConsultationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <CareerConsultationForm />
    </Suspense>
  )
}

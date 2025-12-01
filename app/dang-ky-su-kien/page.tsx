import { Suspense } from "react"
import EventRegistrationForm from "@/components/event-registration-form"

export const metadata = {
  title: "Đăng ký Sự kiện",
  description: "Form đăng ký tham gia sự kiện",
}

export default function EventPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Đang tải...</div>}>
      <EventRegistrationForm />
    </Suspense>
  )
}

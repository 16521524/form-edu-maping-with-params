import { Suspense } from "react";
import EventRegistrationForm from "@/components/event-registration-form";

export const metadata = {
  title: "Đăng ký Sự kiện",
  description: "Form đăng ký tham gia sự kiện",
  openGraph: {
    title: "Đăng ký Sự kiện",
    description: "Form Đăng ký Sự kiện",
    images: [
      "https://giadinh.edu.vn/upload/photo/logo-dai-hoc-gia-dinh-9904.png",
    ],
  },
};

export default function EventPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Đang tải...
        </div>
      }
    >
      <EventRegistrationForm />
    </Suspense>
  );
}

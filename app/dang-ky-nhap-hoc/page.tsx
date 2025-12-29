import { Suspense } from "react";
import EnrollmentForm from "@/components/enrollment-form";

export const metadata = {
  title: "Đăng ký Nhập học",
  description: "Form đăng ký nhập học cho sinh viên",
  openGraph: {
    title: "Đăng ký Nhập học",
    description: "Form Đăng ký Nhập học",
    images: [
      "https://giadinh.edu.vn/upload/photo/logo-dai-hoc-gia-dinh-9904.png",
    ],
  },
};

export default function EnrollmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Đang tải...
        </div>
      }
    >
      <EnrollmentForm />
    </Suspense>
  );
}

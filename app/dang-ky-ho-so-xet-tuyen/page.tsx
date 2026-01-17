import { Suspense } from "react";
import AdmissionApplicationForm from "@/components/admission-application-form";

export const metadata = {
  title: "Đăng ký hồ sơ xét tuyển",
  description: "Form đăng ký thông tin hồ sơ xét tuyển",
  openGraph: {
    title: "Đăng ký hồ sơ xét tuyển",
    description: "Form đăng ký thông tin hồ sơ xét tuyển",
    images: [
      "https://giadinh.edu.vn/upload/photo/logo-dai-hoc-gia-dinh-9904.png",
    ],
  },
};

export default function AdmissionApplicationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Đang tải...
        </div>
      }
    >
      <AdmissionApplicationForm />
    </Suspense>
  );
}

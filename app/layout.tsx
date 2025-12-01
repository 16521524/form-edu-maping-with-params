import type React from "react"
import type { Metadata } from "next"
import { Be_Vietnam_Pro } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  title: "Đăng ký tuyển sinh - Đại học Gia Định",
  description: "Form đăng ký nhập học và sự kiện - Đại học Gia Định",
  icons: {
    icon: "https://giadinh.edu.vn/upload/photo/logogdu-02-5690.png",
    shortcut: "https://giadinh.edu.vn/upload/photo/logogdu-02-5690.png",
    apple: "https://giadinh.edu.vn/upload/photo/logogdu-02-5690.png",
  },
  openGraph: {
    title: "Đăng ký tuyển sinh - Đại học Gia Định",
    description: "Form đăng ký nhập học và sự kiện - Đại học Gia Định",
    images: ["https://giadinh.edu.vn/upload/photo/logogdu-02-5690.png"],
  },
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`${beVietnamPro.className} antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}

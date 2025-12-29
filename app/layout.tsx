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
  title: "Đại học Gia Định",
  description: "Đại học Gia Định",
  icons: {
    icon: "https://giadinh.edu.vn/upload/photo/logo-dai-hoc-gia-dinh-9904.png",
    shortcut: "https://giadinh.edu.vn/upload/photo/logo-dai-hoc-gia-dinh-9904.png",
    apple: "https://giadinh.edu.vn/upload/photo/logo-dai-hoc-gia-dinh-9904.png",
  },
  openGraph: {
    title: "Đại học Gia Định",
    description: "Đại học Gia Định",
    images: ["https://giadinh.edu.vn/upload/photo/logo-dai-hoc-gia-dinh-9904.png"],
  },
    generator: 'Edu'
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

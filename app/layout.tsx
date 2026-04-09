import type React from "react"
import type { Metadata } from "next"
import { Be_Vietnam_Pro } from "next/font/google"
import { createMetadata } from "@/lib/seo"
// import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
})

export const metadata: Metadata = createMetadata()

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi">
      <body className={`${beVietnamPro.className} antialiased`}>
        {children}
        {/* <Analytics /> */}
      </body>
    </html>
  )
}

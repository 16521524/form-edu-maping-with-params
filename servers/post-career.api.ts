import type { CareerMetadataResponse } from "./get-metadata-career.api"

export type CareerLeadPayload = {
  full_name: string
  mobile_no: string
  email: string
  gender: string
  date_of_birth: string | null
  role: string
  national_id: string
  state: string
  school_name: string
  class_stream: string
  grade_level: string
  performance: string
  preferences: string[]
  certificates: string[]
  campaign?: string
  utm_campaign?: string
  utm_campaign_qr?: string
  utm_sales?: string
}

export type CareerLeadResponse = {
  data?: unknown
  message?: string
}

export async function postCareerLead(payload: CareerLeadPayload): Promise<CareerLeadResponse> {
  const res = await fetch("/api/career/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const json = await res.json().catch(() => null)

  if (!res.ok) {
    const errorMessage =
      json?.message ||
      (typeof json === "string" ? json : "") ||
      `Không thể nộp hồ sơ ứng tuyển nghề nghiệp: ${res.status}`
    const errors = Array.isArray(json?.errors) ? json.errors : undefined
    const err = new Error(errorMessage)
    ;(err as any).detail = errors
    throw err
  }

  return json || {}
}

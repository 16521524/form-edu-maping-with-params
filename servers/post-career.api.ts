import type { CareerMetadataResponse } from "./get-metadata-career.api"

export type CareerLeadPayload = {
  full_name: string
  mobile_no: string
  email: string
  gender: string
  date_of_birth: string
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
  social_link?: string
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

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Failed to submit career lead: ${res.status} - ${text}`)
  }

  return res.json()
}

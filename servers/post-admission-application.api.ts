export type AdmissionApplicationPayload = {
  conversation_id?: string
  full_name: string
  national_id: string
  parent_phone: string
  gender: string
  email: string
  date_of_birth: string | null
  student_phone: string
  permanent_street_address: string
  permanent_ward: string
  permanent_province: string
  grade_12_province: string
  grade_12_class: string
  grade_12_school: string
  graduation_year: string
  receiving_province: string
  receiving_ward: string
  receiving_street_address: string
}

export type AdmissionApplicationResponse = {
  data?: unknown
  message?: string
}

export async function postAdmissionApplication(
  payload: AdmissionApplicationPayload
): Promise<AdmissionApplicationResponse> {
  const res = await fetch("/api/admission/submit", {
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
      `Không thể gửi hồ sơ: ${res.status}`
    const errors = Array.isArray(json?.errors) ? json.errors : undefined
    const err = new Error(errorMessage)
    ;(err as any).detail = errors
    throw err
  }

  return json || {}
}

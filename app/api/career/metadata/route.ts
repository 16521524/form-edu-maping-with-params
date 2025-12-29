import { NextResponse } from "next/server"

const CAREER_META_ENDPOINT = "https://erpnext.aurora-tech.com/api/method/edu_frappe_api.api.lead.get_metadata_form"

export async function GET(): Promise<NextResponse> {
  try {
    const res = await fetch(CAREER_META_ENDPOINT, { cache: "no-store" })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 })
  }
}

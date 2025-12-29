import { NextResponse } from "next/server"

const FRAPPE_BASE_URL = process.env.NEXT_PUBLIC_FRAPPE_BASE_URL || 'https://erpnext.aurora-tech.com';

const CAREER_META_ENDPOINT =
  `${FRAPPE_BASE_URL}/api/method/edu_frappe_api.api.lead.get_metadata_form`;

export async function GET(): Promise<NextResponse> {
  try {
    const res = await fetch(CAREER_META_ENDPOINT, { cache: "no-store" })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch metadata" }, { status: 500 })
  }
}

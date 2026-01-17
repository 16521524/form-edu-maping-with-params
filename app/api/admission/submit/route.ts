import { NextResponse } from "next/server"

const FRAPPE_BASE_URL =
  process.env.NEXT_PUBLIC_FRAPPE_BASE_URL || "https://erpnext.aurora-tech.com"

const ADMISSION_ENDPOINT = `${FRAPPE_BASE_URL}/api/method/application.create_admission_application`

const FRAPPE_AUTH =
  process.env.NEXT_PUBLIC_FRAPPE_TOKEN ||
  process.env.NEXT_PUBLIC_FRAPPE_ADMISSION_TOKEN ||
  "Bearer fBXatNg4cCxRyXKE0OZW9XTQHimU5w"

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json()
    const upstream = await fetch(ADMISSION_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: FRAPPE_AUTH,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await upstream.json()
    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status })
    }

    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to submit admission application" },
      { status: 500 }
    )
  }
}

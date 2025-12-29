import { NextResponse } from "next/server"

const CAREER_POST_ENDPOINT = "https://erpnext.aurora-tech.com/api/method/lead.create_lead"
const CAREER_POST_TOKEN = process.env.NEXT_PUBLIC_CAREER_TOKEN || "token 7c0403719248098:c307a8d2994c052"

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json()
    const upstream = await fetch(CAREER_POST_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: CAREER_POST_TOKEN,
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
    return NextResponse.json({ error: "Failed to submit career lead" }, { status: 500 })
  }
}

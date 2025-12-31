import { NextResponse } from "next/server";

const FRAPPE_BASE_URL = process.env.NEXT_PUBLIC_FRAPPE_BASE_URL || "";

const CAREER_META_ENDPOINT = `${FRAPPE_BASE_URL}/api/method/meta.get_metadata`;

const FRAPPE_TOKEN = process.env.NEXT_PUBLIC_FRAPPE_TOKEN || "";

export async function GET(): Promise<NextResponse> {
  try {
    console.log("[DEBUG-TOKEN]", {
      cookieAuth: FRAPPE_TOKEN,
    });

    const res = await fetch(CAREER_META_ENDPOINT, {
      method: "GET",
      headers: {
        Authorization: FRAPPE_TOKEN,
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}

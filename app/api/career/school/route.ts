import { NextResponse } from "next/server";

const FRAPPE_BASE_URL =
  process.env.NEXT_PUBLIC_FRAPPE_BASE_URL || "https://erpnext.aurora-tech.com";

const CAREER_SHOOL_ENDPOINT = `${FRAPPE_BASE_URL}/api/method/search.search_school`;

 
export async function GET(): Promise<NextResponse> {
  try {
    const res = await fetch(CAREER_SHOOL_ENDPOINT, {
      cache: 'no-cache'
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

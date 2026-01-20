import { NextResponse } from "next/server";

const FRAPPE_BASE_URL =
  process.env.NEXT_PUBLIC_FRAPPE_BASE_URL || "https://erpnext.aurora-tech.com";

const CAREER_SCHOOL_ENDPOINT = `${FRAPPE_BASE_URL}/api/method/search.search_school`;

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(req.url);

    const search_text = searchParams.get("search_text") ?? "";
    const province = searchParams.get("province") ?? "";
    const ward = searchParams.get("ward") ?? "";

    const url = new URL(CAREER_SCHOOL_ENDPOINT);
    url.searchParams.set("text", search_text);
    if (province) url.searchParams.set("province", province);
    if (ward) url.searchParams.set("ward", ward);

    const res = await fetch(url.toString(), {
      cache: "no-cache",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Failed to fetch metadata" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

const FRAPPE_BASE_URL =
  process.env.NEXT_PUBLIC_FRAPPE_BASE_URL || "https://erpnext.aurora-tech.com";
const FRAPPE_TOKEN = process.env.NEXT_PUBLIC_FRAPPE_TOKEN || "";

export async function GET(req: Request): Promise<NextResponse> {
  try {
    const url = new URL(req.url || "");
    const page = url.searchParams.get("page") || "1";
    const pageSize = url.searchParams.get("page_size") || "10";
    const orderBy = url.searchParams.get("order_by") || "creation desc";

    const endpoint = `${FRAPPE_BASE_URL}/api/method/campaign.get_campaigns?page=${encodeURIComponent(
      page
    )}&page_size=${encodeURIComponent(pageSize)}&order_by=${encodeURIComponent(
      orderBy
    )}`;

    const upstream = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: FRAPPE_TOKEN,
        "Content-Type": "application/json",
      },
    });

    const data = await upstream.json();
    return NextResponse.json(data, { status: upstream.status });
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" },
      { status: 500 }
    );
  }
}

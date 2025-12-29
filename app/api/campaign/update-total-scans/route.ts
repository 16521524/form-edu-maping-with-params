import { NextResponse } from "next/server";

const FRAPPE_BASE_URL = process.env.NEXT_PUBLIC_FRAPPE_BASE_URL || 'https://erpnext.aurora-tech.com';

const CAMPAIGN_SCAN_ENDPOINT =
  `${FRAPPE_BASE_URL}/api/method/campaign.update_total_scans`;
  
const CAMPAIGN_SCAN_TOKEN =
  process.env.NEXT_PUBLIC_FRAPPE_TOKEN ||
  "token 7c0403719248098:c307a8d2994c052";

export async function PUT(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json().catch(() => ({}));
    const name = body?.name;

    if (!name) {
      return NextResponse.json(
        { error: "Missing campaign name" },
        { status: 400 }
      );
    }

    const upstream = await fetch(CAMPAIGN_SCAN_ENDPOINT, {
      method: "PUT",
      headers: {
        Authorization: CAMPAIGN_SCAN_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return NextResponse.json(
        data || { error: "Failed to update campaign scan" },
        { status: upstream.status }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update campaign scan" },
      { status: 500 }
    );
  }
}

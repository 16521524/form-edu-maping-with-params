import { NextResponse } from "next/server";

const FRAPPE_BASE_URL = process.env.NEXT_PUBLIC_FRAPPE_BASE_URL || "";

const FRAPPE_AUTH =
  process.env.NEXT_PUBLIC_FRAPPE_TOKEN ||
  process.env.NEXT_PUBLIC_FRAPPE_ADMISSION_TOKEN ||
  "Bearer fBXatNg4cCxRyXKE0OZW9XTQHimU5w";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text") || "";

  if (!text) {
    return NextResponse.json({ data: [], message: "missing text" });
  }

  const url = `${FRAPPE_BASE_URL}/api/method/search.search_preference?text=${encodeURIComponent(text)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: FRAPPE_AUTH,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { message: "upstream error", status: res.status },
      { status: res.status },
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}

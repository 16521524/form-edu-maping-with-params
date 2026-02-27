import { NextResponse } from "next/server";

const FRAPPE_BASE_URL = process.env.NEXT_PUBLIC_FRAPPE_BASE_URL || "";

const FRAPPE_AUTH =
  process.env.NEXT_PUBLIC_FRAPPE_TOKEN ||
  process.env.NEXT_PUBLIC_FRAPPE_ADMISSION_TOKEN ||
  "Bearer fBXatNg4cCxRyXKE0OZW9XTQHimU5w";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name") || "";
  const token = process.env.NEXT_PUBLIC_ADMISSION_TOKEN;

  if (!name) {
    return NextResponse.json({ data: [], message: "missing name" });
  }

  const url = `${FRAPPE_BASE_URL}/api/method/search.search_subject_combination?name=${encodeURIComponent(name)}`;
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

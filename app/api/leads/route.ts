import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const FRAPPE_BASE_URL = process.env.NEXT_PUBLIC_FRAPPE_BASE_URL ?? '';

const LEAD_API_ENPOINT = `${FRAPPE_BASE_URL}/api/method/lead.get_leads`

const FRAPPE_TOKEN = process.env.NEXT_PUBLIC_FRAPPE_TOKEN || "";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const filters = searchParams.get("filters");
  const orderBy = searchParams.get("order_by") ?? "modified desc";
  const pageSize = searchParams.get("page_size") ?? "10";
  const page = searchParams.get("page") ?? "1";
  const creationFrom = searchParams.get("creation_from") ?? "";
  const creationTo = searchParams.get("creation_to") ?? "";

  const upstream = new URL(LEAD_API_ENPOINT);
  if (filters) upstream.searchParams.set("filters", filters);
  upstream.searchParams.set("order_by", orderBy);
  upstream.searchParams.set("page_size", pageSize);
  upstream.searchParams.set("page", page);
  upstream.searchParams.set("creation_from", creationFrom);
  upstream.searchParams.set("creation_to", creationTo);

  const headerAuth =
    request.headers.get("authorization") ||
    request.headers.get("x-forwarded-authorization");

  const cookieStore = await cookies();
  const cookieAuthRaw = cookieStore.get("APP_AUTH")?.value;
  const cookieAuthDecoded = cookieAuthRaw ? decodeURIComponent(cookieAuthRaw) : null;
  const cookieAuth =
    cookieAuthDecoded && cookieAuthDecoded.toLowerCase().startsWith("bearer")
      ? cookieAuthDecoded
      : null;

  const authHeader = headerAuth || cookieAuth || FRAPPE_TOKEN;

  console.log("[DEBUG-TOKEN]", {
    hasHeaderAuth: Boolean(headerAuth),
    hasCookieAuth: Boolean(cookieAuth),
    hasEnvToken: Boolean(FRAPPE_TOKEN),
  });

  if (!authHeader) {
    return NextResponse.json({ message: "Missing auth" }, { status: 401 });
  }

  try {
    const res = await fetch(upstream.toString(), {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { message: "Upstream error", detail: text },
        { status: res.status }
      );
    }

    return NextResponse.json(await res.json());
  } catch (error) {
    return NextResponse.json(
      { message: "Request failed", error: String(error) },
      { status: 500 }
    );
  }
}

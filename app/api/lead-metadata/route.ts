import { NextRequest, NextResponse } from "next/server";

const FRAPPE_BASE_URL = process.env.NEXT_PUBLIC_FRAPPE_BASE_URL || "";
const FRAPPE_TOKEN = process.env.NEXT_PUBLIC_FRAPPE_TOKEN || "";

const META_ENDPOINT = `${FRAPPE_BASE_URL}/api/method/meta.get_metadata`;

type MetadataResult = Record<string, unknown>;

async function fetchMetadataByKey(key: string): Promise<MetadataResult> {
  const url = new URL(META_ENDPOINT);
  url.searchParams.set("key", key);

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: FRAPPE_TOKEN,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      `Upstream metadata error (${res.status}) for ${key}: ${JSON.stringify(data)}`
    );
  }

  const keyData =
    (data?.data && typeof data.data === "object" && data.data[key]) || data?.data;

  return { [key]: keyData };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const keysParam = searchParams.get("keys") || searchParams.get("key");

  const keys =
    keysParam
      ?.split(",")
      .map((item) => item.trim())
      .filter(Boolean) ?? ["lead_statuses", "lead_stages"];

  if (!FRAPPE_BASE_URL || !FRAPPE_TOKEN) {
    return NextResponse.json(
      { message: "Missing FRAPPE configuration" },
      { status: 500 }
    );
  }

  try {
    const results = await Promise.all(keys.map((key) => fetchMetadataByKey(key)));
    const merged = results.reduce<MetadataResult>((acc, curr) => {
      return { ...acc, ...curr };
    }, {});

    return NextResponse.json(
      { message: "ok", data: merged },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch metadata", error: String(error) },
      { status: 500 }
    );
  }
}

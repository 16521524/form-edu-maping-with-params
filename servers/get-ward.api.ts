export type CareerMetadataWardResponse = {
  data?: {
    value?: string;
    display?: string;
    text_color?: string;
    background_color?: string;
  }[];
};

export async function getMetadataWards({
  search_text = "",
  province,
}: {
  search_text?: string;
  province?: string;
}): Promise<CareerMetadataWardResponse> {
  const qs = new URLSearchParams();
  qs.set("search_text", search_text);
  if (province) qs.set("province", province);

  const url = `/api/career/ward${qs.toString() ? `?${qs.toString()}` : ""}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load ward metadata: ${res.status}`);
  }
  return res.json();
}

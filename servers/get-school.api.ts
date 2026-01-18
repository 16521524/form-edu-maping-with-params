export type CareerMetadataSchoolResponse = {
  data?: {
    value?: string;
    display?: string;
    text_color?: string;
    background_color?: string;
  }[];
};

export async function getMetadataSchools({
  search_text = "",
  province,
  ward,
}: {
  search_text?: string;
  province?: string;
  ward?: string;
}): Promise<CareerMetadataSchoolResponse> {
  const qs = new URLSearchParams();
  if (search_text) qs.set("search_text", search_text);
  if (province) qs.set("province", province);
  if (ward) qs.set("ward", ward);

  const url = `/api/career/school${qs.toString() ? `?${qs.toString()}` : ""}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load career metadata: ${res.status}`);
  }
  return res.json();
}

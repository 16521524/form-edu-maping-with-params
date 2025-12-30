export type CareerMetadataSchoolResponse = {
  data?: {
    value?: string;
    display?: string;
  }[];
};

export async function getMetadataSchools(
  search_text: string = ""
): Promise<CareerMetadataSchoolResponse> {
  const qs = new URLSearchParams();
  if (search_text) qs.set("search_text", search_text);

  const url = `/api/career/school${qs.toString() ? `?${qs.toString()}` : ""}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load career metadata: ${res.status}`);
  }
  return res.json();
}

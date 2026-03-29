type PreferenceResponse = {
  data?: { value?: string; display?: string }[];
  message?: string;
};

export async function searchPreference(text: string, major?: string) {
  if (!text) return { data: [] };
  const params = new URLSearchParams({
    text,
  });
  if (major) params.set("major", major);
  const url = `/api/career/preference?${params.toString()}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`search_preference failed: ${res.status}`);
  }
  return (await res.json()) as PreferenceResponse;
}

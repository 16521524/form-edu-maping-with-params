type PreferenceResponse = {
  data?: { value?: string; display?: string }[];
  message?: string;
};

export async function searchPreference(text: string) {
  if (!text) return { data: [] };
  const url = `/api/career/preference?text=${encodeURIComponent(text)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`search_preference failed: ${res.status}`);
  }
  return (await res.json()) as PreferenceResponse;
}

const FRAPPE_BASE_URL =
  process.env.NEXT_PUBLIC_FRAPPE_BASE_URL || "https://erpnext.aurora-tech.com"

  
type SubjectCombinationResponse = {
  data?: { name?: string }[];
  message?: string;
};

const FRAPPE_AUTH =
  process.env.NEXT_PUBLIC_FRAPPE_TOKEN ||
  process.env.NEXT_PUBLIC_FRAPPE_ADMISSION_TOKEN ||
  "Bearer fBXatNg4cCxRyXKE0OZW9XTQHimU5w";

export async function searchSubjectCombination(name: string) {
  if (!name) return { data: [] };
  const url = `${FRAPPE_BASE_URL}/api/method/search.search_subject_combination?name=${encodeURIComponent(name)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: FRAPPE_AUTH,
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`search_subject_combination failed: ${res.status}`);
  }
  return (await res.json()) as SubjectCombinationResponse;
}

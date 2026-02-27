const FRAPPE_BASE_URL =
  process.env.NEXT_PUBLIC_FRAPPE_BASE_URL || "https://erpnext.aurora-tech.com"

  
type SubjectCombinationResponse = {
  data?: { name?: string }[];
  message?: string;
};

export async function searchSubjectCombination(name: string) {
  if (!name) return { data: [] };
  const url = `/api/career/subject-combination?name=${encodeURIComponent(name)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`search_subject_combination failed: ${res.status}`);
  }
  return (await res.json()) as SubjectCombinationResponse;
}

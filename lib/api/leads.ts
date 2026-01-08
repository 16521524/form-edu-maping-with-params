import type { LeadResponse } from "@/lib/types/leads";

type LeadParams = {
  filters?: Record<string, unknown>;
  orderBy?: string;
  page?: number;
  pageSize?: number;
  creationFrom?: string | null;
  creationTo?: string | null;
};

export async function fetchLeads({
  filters,
  orderBy = "modified desc",
  page = 1,
  pageSize = 10,
  creationFrom,
  creationTo,
}: LeadParams): Promise<LeadResponse> {
  const params = new URLSearchParams();
  if (filters) params.set("filters", JSON.stringify(filters));
  params.set("order_by", orderBy);
  params.set("page_size", String(pageSize));
  params.set("page", String(page));
  if (creationFrom) params.set("creation_from", creationFrom);
  if (creationTo) params.set("creation_to", creationTo);

  const res = await fetch(`/api/leads?${params.toString()}`, {
    cache: "no-store",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error(`Failed to load leads: ${res.status}`);
  }

  return res.json();
}

"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Inter } from "next/font/google";
import { MobileTable } from "@/components/mobile-table/MobileTable";
import { Pagination } from "@/components/mobile-table/Pagination";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { fetchLeads } from "@/lib/api/leads";
import type { Lead } from "@/components/mobile-table/data";
import type { LeadRecord } from "@/lib/types/leads";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export default function MobileTablePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center text-slate-600">
          Loading...
        </div>
      }
    >
      <MobileTablePageContent />
    </Suspense>
  );
}

function MobileTablePageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);

  const filtersFromUrl = useMemo(() => {
    const filtersParam = searchParams.get("filters");
    if (!filtersParam) return undefined;
    try {
      return JSON.parse(filtersParam);
    } catch {
      return undefined;
    }
  }, [searchParams]);

  const orderBy = searchParams.get("order_by") ?? "modified desc";
  const pageFromUrl = Number(searchParams.get("page") ?? 1);
  const pageSize = Number(searchParams.get("page_size") ?? 10);

  useEffect(() => {
    setPage(pageFromUrl);
  }, [pageFromUrl]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const res = await fetchLeads({
          filters: filtersFromUrl,
          orderBy,
          page: pageFromUrl,
          pageSize,
        });
        if (cancelled) return;
        setLeads(
          (res.data || []).map((item) => mapLeadRecordToLead(item)) as Lead[]
        );
        setPage(res.pagination.page);
        setPageCount(res.pagination.total_pages);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [filtersFromUrl, orderBy, pageFromUrl, pageSize]);

  const handlePageChange = (next: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(next));
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <main className={`min-h-screen bg-[#f2f3f6] px-4 py-0 ${inter.className}`}>
      <div className="mx-auto w-full max-w-[460px] space-y-5">
        {/* <div className="text-right pr-1 text-xs font-semibold text-[#1c2f57] underline">
          Grid view
        </div> */}
        <MobileTable leads={leads} loading={loading} />
        <div className="flex justify-end px-3 py-0 text-xs font-semibold text-slate-500">
          {loading ? "..." : `${leads.length}/${pageCount * pageSize || 1}`}
        </div>

        <Pagination page={page} pageCount={pageCount} onChange={handlePageChange} />
      </div>
    </main>
  );
}

function mapLeadRecordToLead(item: LeadRecord): Lead {
  return {
    id: item.name ?? "",
    name: item.lead_name || "—",
    role: item.custom_role || "—",
    stage: item.custom_stage || "—",
    status: item.status || "—",
    source: item.source || "—",
    segment: item.segment || "—",
    leadScore:
      typeof item.stage_position === "number"
        ? item.stage_position.toString()
        : "—",
    conversionRate: item.stage_conversion_rate || "—",
    consultant: item.lead_owner || "—",
    major: item.custom_major || "—",
    topic: item.summary || item.custom_note || "—",
  };
}

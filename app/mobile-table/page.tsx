"use client";

import { Suspense } from "react";
import { Inter } from "next/font/google";
import { MobileTable } from "@/components/mobile-table/MobileTable";
import { Pagination } from "@/components/mobile-table/Pagination";
import { leads as sampleLeads } from "@/components/mobile-table/data";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
});

export default function MobileTablePage() {
  const page = 1;
  const pageCount = 10;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center text-slate-600">
          Loading...
        </div>
      }
    >
      <main
        className={`min-h-screen bg-[#f2f3f6] px-4 py-6 ${inter.className}`}
      >
        <div className="mx-auto w-full max-w-[460px] space-y-5">
          <div className="text-right pr-1 text-xs font-semibold text-[#1c2f57] underline">
            Grid view
          </div>
          <MobileTable leads={sampleLeads.slice(0, 5)} />
          <div className="flex justify-end px-3 py-0 text-sm font-semibold text-slate-500">
            5/20
          </div>

          <Pagination page={page} pageCount={pageCount} />
        </div>
      </main>
    </Suspense>
  );
}

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  page: number;
  pageCount: number;
};

export function Pagination({ page, pageCount }: Props) {
  const pages = [1, 2, 3, 4, 0, pageCount]; // 0 = ellipsis
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700">
        <NavButton icon={<ChevronLeft className="h-3 w-3" />} />
        {pages.map((p, idx) =>
          p === 0 ? (
            <span key={idx} className="px-2 text-slate-500">
              ...
            </span>
          ) : (
            <button
              key={p}
              className={cn(
                "min-w-[40px] rounded-xl px-3 py-2 shadow-sm border border-[#e2e6ee] transition",
                p === page
                  ? "bg-white text-slate-900"
                  : "bg-transparent text-slate-600"
              )}
            >
              {p}
            </button>
          )
        )}
        <NavButton icon={<ChevronRight className="h-3 w-3" />} />
      </div>

      <div className="flex items-center justify-center gap-4">
        <span className="text-[13px] font-semibold text-slate-400">
          Đi đến trang:
        </span>

        <div className="flex items-center gap-3 rounded-[8px] bg-[#f3f5f9] px-2 py-1 border border-[#e5e7ef] shadow-sm">
          <input
            type="number"
            min={1}
            max={pageCount}
            placeholder="Số trang"
            className="w-20 font-semibold bg-transparent text-[12px] text-slate-500 placeholder:text-slate-400 outline-none
                 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />

          <button
            className="rounded-[8px] bg-white px-2 py-1 text-[13px] font-semibold text-slate-500
                 border border-[#e5e7ef] shadow-sm hover:bg-slate-50 active:scale-[0.99]"
          >
            Đến
          </button>
        </div>
      </div>
    </div>
  );
}

function NavButton({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="grid h-11 w-11 place-items-center rounded-2xl border border-[#e2e6ee] bg-white shadow-sm">
      {icon}
    </button>
  );
}

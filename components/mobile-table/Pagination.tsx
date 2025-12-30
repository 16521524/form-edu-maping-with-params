import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Props = {
  page: number;
  pageCount: number;
  onChange?: (page: number) => void;
};

export function Pagination({ page, pageCount, onChange }: Props) {
  const canPrev = page > 1;
  const canNext = page < pageCount;

  const buildPages = () => {
    if (pageCount <= 5) return Array.from({ length: pageCount }, (_, i) => i + 1);
    if (page <= 3) return [1, 2, 3, 0, pageCount];
    if (page >= pageCount - 2) return [1, 0, pageCount - 2, pageCount - 1, pageCount];
    return [1, 0, page - 1, page, page + 1, 0, pageCount];
  };

  const pages = buildPages();

  const goto = (p: number) => {
    if (!onChange) return;
    const next = Math.max(1, Math.min(pageCount, p));
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-center gap-2 text-xs font-semibold text-slate-700">
        <NavButton
          icon={<ChevronLeft className="h-3 w-3" />}
          disabled={!canPrev}
          onClick={() => goto(page - 1)}
        />
        {pages.map((p, idx) =>
          p === 0 ? (
            <span key={idx} className="px-2 text-slate-500">
              ...
            </span>
          ) : (
            <button
              key={p}
              onClick={() => goto(p)}
              className={cn(
                "min-w-8 rounded-[8px] px-3 py-1.5 shadow-sm border border-[#e2e6ee] transition",
                p === page ? "bg-white text-slate-900" : "bg-transparent text-slate-600"
              )}
            >
              {p}
            </button>
          )
        )}
        <NavButton
          icon={<ChevronRight className="h-3 w-3" />}
          disabled={!canNext}
          onClick={() => goto(page + 1)}
        />
      </div>

      <div className="flex items-center justify-center gap-4 pt-4">
        <span className="text-[13px] font-semibold text-slate-400">Đi đến trang:</span>
        <GotoBox pageCount={pageCount} onGoto={goto} />
      </div>
    </div>
  );
}

function GotoBox({
  pageCount,
  onGoto,
}: {
  pageCount: number;
  onGoto?: (p: number) => void;
}) {
  const [value, setValue] = useState<string>("");
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const p = Number(value);
    if (Number.isFinite(p) && onGoto) onGoto(p);
  };
  return (
    <form
      onSubmit={submit}
      className="flex items-center gap-1 rounded-[8px] bg-[#f3f5f9] px-2 py-1 border border-[#e5e7ef] shadow-sm"
    >
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        type="number"
        min={1}
        max={pageCount}
        placeholder="Số trang"
        className="w-15 font-semibold bg-transparent text-[12px] text-slate-500 placeholder:text-slate-400 outline-none
             [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />

      <button
        type="submit"
        className="rounded-[8px] bg-white px-2 h-[24px] text-[13px] font-semibold text-slate-500
             border border-[#e5e7ef] shadow-sm hover:bg-slate-50 active:scale-[0.99]"
      >
        Đến
      </button>
    </form>
  );
}

function NavButton({
  icon,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-[8px] border border-[#e2e6ee] bg-white shadow-sm",
        disabled && "opacity-40 cursor-not-allowed"
      )}
    >
      {icon}
    </button>
  );
}

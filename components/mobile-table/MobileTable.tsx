import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Info, Pin } from "lucide-react";
import { cn } from "@/lib/utils";
import { leads as defaultLeads, type Lead } from "./data";
import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnPinningState,
} from "@tanstack/react-table";

type Props = {
  leads?: Lead[];
  loading?: boolean;
  page?: number;
  pageSize?: number;
};

export function MobileTable({ leads = defaultLeads, loading, page = 1, pageSize }: Props) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({
    left: ["stt", "name"],
    right: [],
  });

  const [atEnd, setAtEnd] = useState(false);

  const [atStart, setAtStart] = useState(true);

  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleOpenLead = useCallback(
    (lead: Record<string, any>, event: "open_detail" | "open_popup") => {
      const leadId = lead?.id ?? "";
      const payload = {
        type: event,
        leadId,
        lead,
        ts: Date.now(),
      };
      if (
        typeof window !== "undefined" &&
        (window as any)?.ReactNativeWebView?.postMessage
      ) {
        (window as any).ReactNativeWebView.postMessage(
          JSON.stringify(payload)
        );
      } else if (leadId) {
        console.log("open lead", payload);
      }
    },
    []
  );

  const columns = useMemo<ColumnDef<Lead, any>[]>(
    () => [
      {
        id: "stt",
        header: "STT",
        size: 90,
        minSize: 80,
        cell: ({ row, table }) => {
          const inferredPageSize =
            pageSize ??
            (table.getRowModel().rows.length || 1);
          const currentPage = Number.isFinite(page) ? page : 1;
          const stt = row.index + 1 + (currentPage - 1) * inferredPageSize;
          return (
            <span className="flex items-center gap-2 font-semibold text-sm">
              #{stt}
              <button
                className="cursor-pointer"
                type="button"
                onClick={() => handleOpenLead(row.original, "open_popup")}
              >
                <Info className="h-3.5 w-3.5" strokeWidth={2.8} />
              </button>
            </span>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Name",
        size: 190,
        minSize: 160,
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => handleOpenLead(row.original, 'open_detail')}
            className="cursor-pointer underline decoration-[1.5px] underline-offset-[3px] font-semibold text-[#1C3055]"
          >
            {row.original.name}
          </button>
        ),
      },
      {
        accessorKey: "role",
        header: "Role",
        size: 150,
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.role}</span>
        ),
      },
      {
        accessorKey: "stage",
        header: "Stage",
        size: 170,
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.stage}</span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 160,
        cell: ({ row }) => <StatusPill value={row.original.status} />,
      },
      {
        accessorKey: "source",
        header: "Source",
        size: 130,
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.source}</span>
        ),
      },
      {
        accessorKey: "segment",
        header: "Current Segment",
        size: 260,
        cell: ({ row }) => (
          <span className="font-semibold leading-snug">
            {row.original.segment}
          </span>
        ),
      },
      {
        accessorKey: "leadScore",
        header: "Lead Score",
        size: 120,
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.leadScore}</span>
        ),
      },
      {
        accessorKey: "conversionRate",
        header: "Stage Conversion Rate",
        size: 220,
        cell: ({ row }) => (
          <span className="font-semibold">{row.original.conversionRate}</span>
        ),
      },
      {
        accessorKey: "consultant",
        header: "Assigned Consultant",
        size: 200,
        cell: ({ row }) => (
          <span className="font-semibold leading-snug">
            {row.original.consultant}
          </span>
        ),
      },
      {
        accessorKey: "major",
        header: "Major",
        size: 210,
        cell: ({ row }) => (
          <span className="font-semibold leading-snug">
            {row.original.major}
          </span>
        ),
      },
      // {
      //   accessorKey: "topic",
      //   header: "Topic",
      //   size: 200,
      //   cell: ({ row }) => (
      //     <span className="font-semibold leading-snug">
      //       {row.original.topic}
      //     </span>
      //   ),
      // },
    ],
    [handleOpenLead, page, pageSize]
  );

  const table = useReactTable({
    data: leads,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: { columnPinning },
    onColumnPinningChange: setColumnPinning,
    columnResizeMode: "onChange",
    defaultColumn: { size: 140, minSize: 100, maxSize: 400 },
  });

  const visibleColumns = table.getVisibleLeafColumns();
  const textColor = "#1C3055";
  const activeBg = "#ffffff";
  const activeShadow =
    "inset 6px 0 12px -8px rgba(0,0,0,0.16), inset -6px 0 12px -8px rgba(0,0,0,0.16)";
  const pinnedLeft = table.getState().columnPinning.left ?? [];
  const lastPinned = pinnedLeft[pinnedLeft.length - 1];
  const headerBg = "#1c2f57";
  const gapPx = 0;
  const template = visibleColumns.map((c) => `${c.getSize()}px`).join(" ");
  const totalWidth =
    visibleColumns.reduce((sum, c) => sum + c.getSize(), 0) +
    gapPx * Math.max(visibleColumns.length - 1, 0);
  const rowPadding = 32;
  const showSkeleton = loading && leads.length === 0;
  const showEmpty = !loading && leads.length === 0;
  const columnOffsets = useMemo(() => {
    const map = new Map<string, number>();
    let acc = 0;
    visibleColumns.forEach((col, idx) => {
      if (idx > 0) acc += gapPx;
      map.set(col.id, acc);
      acc += col.getSize();
    });
    return map;
  }, [visibleColumns]);

  const activeKey =
    hoveredKey ?? table.getState().columnPinning.left?.[0] ?? null;

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const slack = 12;
    const handle = () => {
      const start = el.scrollLeft <= slack;
      const end = el.scrollLeft + el.clientWidth >= el.scrollWidth - slack;
      setAtStart(start);
      setAtEnd(end);
    };
    handle();
    el.addEventListener("scroll", handle, { passive: true });
    return () => el.removeEventListener("scroll", handle);
  }, [totalWidth]);

  const radius = 26;
  const containerRadius = `${atStart ? radius : 0}px ${atEnd ? radius : 0}px ${
    atEnd ? radius : 0
  }px ${atStart ? radius : 0}px`;
  const headerRadius = `${atStart ? radius - 2 : 0}px ${
    atEnd ? radius - 2 : 0
  }px 0 0`;

  return (
    <div
      className="relative rounded-[26px] border border-[#e3e7ef] shadow-[0_16px_32px_rgba(0,0,0,0.08)] overflow-hidden bg-white transition-[border-radius] duration-200"
      style={{ borderRadius: containerRadius }}
    >
      <div
        ref={scrollRef}
        className="overflow-x-auto overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200 bg-white max-h-[250px]"
        aria-busy={loading}
      >
        <div
          className="relative pt-0"
          style={{
            minWidth: totalWidth + rowPadding,
          }}
        >
          <div className="sticky top-0 z-50">
            <div
              className="bg-[#1c2f57] text-white"
              style={{
                borderTopLeftRadius: headerRadius.split(" ")[0],
                borderTopRightRadius: headerRadius.split(" ")[1],
              }}
            >
              <div
                className="grid gap-0 px-4 py-4 text-sm font-semibold sticky top-0 z-10 bg-[#1c2f57]"
                style={{ gridTemplateColumns: template }}
              >
                {visibleColumns.map((col) => {
                  const pinned = col.getIsPinned();
                  const hovering = hoveredKey === col.id;
                  const left =
                    pinned === "left" ? columnOffsets.get(col.id) : undefined;
                  const active = pinned || hovering || activeKey === col.id;
                  const width = col.getSize();
                  const isLastPinned = pinned && lastPinned === col.id;
                  return (
                    <div
                      key={col.id}
                      onMouseEnter={() => setHoveredKey(col.id)}
                      onMouseLeave={() => setHoveredKey(null)}
                      className={cn(
                        "relative flex items-center gap-3 transition-colors px-4 overflow-hidden",
                        "text-white",
                        pinned && "sticky left-0 inset-y-0 z-60"
                      )}
                      style={
                        pinned
                          ? {
                              left,
                              width,
                              minWidth: width,
                              backgroundColor: headerBg,
                              boxShadow:
                                isLastPinned && !atEnd
                                  ? activeShadow
                                  : undefined,
                            }
                          : {
                              width,
                              minWidth: width,
                              backgroundColor: headerBg,
                            }
                      }
                    >
                      <span className="whitespace-nowrap">
                        {col.columnDef.header as string}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const leftPinned =
                            table.getState().columnPinning.left ?? [];
                          const isPinned = leftPinned.includes(col.id);
                          const nextLeft = isPinned
                            ? leftPinned.filter((c) => c !== col.id)
                            : [...leftPinned, col.id];
                          table.setColumnPinning({
                            ...table.getState().columnPinning,
                            left: nextLeft,
                          });
                        }}
                        aria-label="Pin column"
                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 transition bg-white/0 hover:bg-white/10 active:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-0"
                      >
                        <Pin
                          className={cn(
                            "h-4 w-4",
                            col.getIsPinned() ? "text-[#f1c40f]" : "text-white"
                          )}
                        />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {showEmpty && (
            <div
              className="flex items-center justify-center px-6 py-10 text-sm font-semibold text-slate-500"
              style={{ minWidth: totalWidth + rowPadding }}
              role="status"
            >
              Không có dữ liệu
            </div>
          )}

          {showSkeleton
            ? Array.from({ length: 1 }).map((_, idx) => (
                <div
                  key={`skeleton-${idx}`}
                  className="relative z-10 grid gap-0 px-4 py-0 text-sm border-b border-[#eef1f5] items-stretch animate-pulse"
                  style={{
                    gridTemplateColumns: template,
                    backgroundColor: idx % 2 === 1 ? "#f7f9fc" : "#ffffff",
                    minHeight: 64,
                  }}
                  aria-busy="true"
                >
                  {visibleColumns.map((col) => {
                    const pinned = col.getIsPinned();
                    const left =
                      pinned === "left" ? columnOffsets.get(col.id) : undefined;
                    const width = col.getSize();
                    const isLastPinned = pinned && lastPinned === col.id;
                    const cellBase = cn(
                      "relative z-10 flex h-full w-full items-center px-3",
                      pinned && "sticky left-0 inset-y-0 z-30"
                    );
                    const cellStyle = pinned
                      ? {
                          left,
                          width,
                          minWidth: width,
                          backgroundColor:
                            idx % 2 === 1 ? "#f7f9fc" : "#ffffff",
                          boxShadow:
                            isLastPinned && !atEnd ? activeShadow : undefined,
                        }
                      : {
                          width,
                          minWidth: width,
                          backgroundColor:
                            idx % 2 === 1 ? "#f7f9fc" : "#ffffff",
                        };
                    return (
                      <div
                        key={`s-${col.id}`}
                        className={cellBase}
                        style={cellStyle}
                      >
                        <span className="h-3 w-16 rounded-full bg-slate-200" />
                      </div>
                    );
                  })}
                </div>
              ))
            : table.getRowModel().rows.map((row, idx) => {
                const rowBg = idx % 2 === 1 ? "#f7f9fc" : "#ffffff";
                return (
                  <div
                    key={row.id}
                    className="relative z-10 grid gap-0 px-4 py-0 text-sm border-b border-[#eef1f5] items-stretch"
                    style={{
                      color: textColor,
                      gridTemplateColumns: template,
                      backgroundColor: rowBg,
                      minHeight: 64,
                    }}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const column = cell.column;
                      const pinned = column.getIsPinned();
                      const left =
                        pinned === "left"
                          ? columnOffsets.get(column.id)
                          : undefined;
                      const active = pinned || activeKey === column.id;
                      const width = column.getSize();
                      const isLastPinned = pinned && lastPinned === column.id;
                      const cellBase = cn(
                        "relative z-10 flex h-full w-full items-center px-3",
                        pinned && "sticky left-0 inset-y-0 z-30"
                      );
                      const cellStyle = pinned
                        ? {
                            left,
                            width,
                            minWidth: width,
                            backgroundColor: active ? activeBg : rowBg,
                            boxShadow:
                              isLastPinned && !atEnd ? activeShadow : undefined,
                          }
                        : {
                            width,
                            minWidth: width,
                            backgroundColor: active ? activeBg : rowBg,
                          };
                      return (
                        <div
                          key={cell.id}
                          className={cellBase}
                          style={cellStyle}
                          onMouseEnter={() => setHoveredKey(column.id)}
                          onMouseLeave={() => setHoveredKey(null)}
                        >
                          {cell.column.columnDef.cell?.({
                            ...cell,
                            getValue: cell.getValue,
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}

const statusColors: Record<string, { bg: string; text: string }> = {
  Disqualified: { bg: "bg-[#ffe2e2]", text: "text-[#e64c4c]" },
  "Profile Created": { bg: "bg-[#e6f2ff]", text: "text-[#2f7adf]" },
  "AI Validated": { bg: "bg-[#eaf6ff]", text: "text-[#1d6fbf]" },
  Nurturing: { bg: "bg-[#fff2dd]", text: "text-[#d0892b]" },
  "Enrolled & Paid": { bg: "bg-[#e4f6ed]", text: "text-[#2f8f58]" },
};

function StatusPill({ value }: { value: string }) {
  const palette = statusColors[value] || {
    bg: "bg-slate-200",
    text: "text-slate-700",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold",
        palette.bg,
        palette.text
      )}
    >
      {value}
    </span>
  );
}

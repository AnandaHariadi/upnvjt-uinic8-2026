"use client";

/* ── Generic skeleton line ── */
function SkeletonLine({ width = "w-full", height = "h-3" }: { width?: string; height?: string }) {
  return <div className={`${width} ${height} animate-pulse rounded-full bg-gray-200`} />;
}

/* ── KPI card skeleton ── */
export function SkeletonKpiCard() {
  return (
    <div className="flex gap-4 rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-gray-200" />
      <div className="flex flex-1 flex-col justify-center gap-2">
        <SkeletonLine width="w-2/3" height="h-2.5" />
        <SkeletonLine width="w-full" height="h-5" />
        <SkeletonLine width="w-1/2" height="h-2" />
      </div>
    </div>
  );
}

/* ── Post card skeleton ── */
export function SkeletonPostCard() {
  return (
    <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-gray-200" />
        <div className="flex flex-1 flex-col gap-2">
          <SkeletonLine width="w-1/3" />
          <SkeletonLine width="w-1/4" height="h-2" />
        </div>
        <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
      </div>
      <div className="flex flex-col gap-2">
        <SkeletonLine />
        <SkeletonLine />
        <SkeletonLine width="w-3/4" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-5 w-16 animate-pulse rounded-full bg-gray-200" />
        <div className="h-5 w-20 animate-pulse rounded-full bg-gray-200" />
      </div>
    </div>
  );
}

/* ── Activity row skeleton ── */
export function SkeletonActivityRow() {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-gray-200" />
      <div className="flex flex-1 flex-col gap-1.5">
        <SkeletonLine width="w-3/4" />
        <SkeletonLine width="w-1/4" height="h-2" />
      </div>
      <div className="h-5 w-14 animate-pulse rounded-full bg-gray-200" />
    </div>
  );
}

/* ── Generic card skeleton ── */
export function SkeletonGenericCard({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <SkeletonLine width="w-1/3" height="h-4" />
        <SkeletonLine width="w-16" height="h-3" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonLine key={i} width={i % 2 === 0 ? "w-full" : "w-4/5"} />
        ))}
      </div>
    </div>
  );
}

/* ── Profile header skeleton ── */
export function SkeletonProfileHeader() {
  return (
    <div className="rounded-[14px] bg-gray-200 p-7 animate-pulse">
      <div className="flex flex-wrap items-center gap-8">
        <div className="flex items-center gap-5">
          <div className="h-20 w-20 shrink-0 rounded-full bg-gray-300" />
          <div className="flex flex-col gap-2">
            <div className="h-5 w-40 rounded-full bg-gray-300" />
            <div className="h-3 w-28 rounded-full bg-gray-300" />
            <div className="mt-2 flex gap-2">
              <div className="h-8 w-24 rounded-md bg-gray-300" />
              <div className="h-8 w-20 rounded-md bg-gray-300" />
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-[280px] flex flex-col gap-3">
          <div className="h-3 w-24 rounded-full bg-gray-300" />
          <div className="h-6 w-28 rounded-full bg-gray-300" />
          <div className="h-3 w-full rounded-full bg-gray-300" />
          <div className="h-3 w-full rounded-full bg-gray-300" />
        </div>
      </div>
    </div>
  );
}

/* ── Default export for simple usage ── */
export default function SkeletonCard({ type = "generic" }: { type?: "kpi" | "post" | "activity" | "profile" | "generic" }) {
  switch (type) {
    case "kpi": return <SkeletonKpiCard />;
    case "post": return <SkeletonPostCard />;
    case "activity": return <SkeletonActivityRow />;
    case "profile": return <SkeletonProfileHeader />;
    default: return <SkeletonGenericCard />;
  }
}

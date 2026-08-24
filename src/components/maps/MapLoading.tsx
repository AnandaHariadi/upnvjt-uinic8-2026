export function MapLoading({ className = "h-[420px]" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center rounded-[12px] border border-[#E5E7EB] bg-[#F5F5F5] ${className}`} role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-4 border-[#A8D5BA] border-t-[#2D5F3F]" aria-hidden="true" />
      <span className="sr-only">Memuat peta Surabaya…</span>
    </div>
  );
}

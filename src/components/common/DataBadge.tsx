import { cn } from "@/utils/cn";

type Variant = "demo" | "prototype" | "simulated" | "estimated";

const STYLES: Record<Variant, { label: string; className: string; title: string }> = {
  demo: {
    label: "Data Simulasi",
    className: "border-amber-300 bg-amber-50 text-amber-800",
    title: "Data ilustratif untuk demonstrasi sistem.",
  },
  prototype: {
    label: "Prototipe",
    className: "border-sky-300 bg-sky-50 text-sky-800",
    title: "Fitur demonstrasi percontohan.",
  },
  simulated: {
    label: "Simulasi",
    className: "border-amber-300 bg-amber-50 text-amber-800",
    title: "Hasil verifikasi simulasi sistem.",
  },
  estimated: {
    label: "Estimasi",
    className: "border-emerald-300 bg-emerald-50 text-emerald-800",
    title: "Dihitung berdasarkan faktor konversi emisi.",
  },
};

/** Small, consistent label marking non-real or estimated data. */
export default function DataBadge({
  variant = "demo",
  label,
  className,
}: {
  variant?: Variant;
  label?: string;
  className?: string;
}) {
  const s = STYLES[variant];
  return (
    <span
      title={s.title}
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        s.className,
        className
      )}
    >
      {label ?? s.label}
    </span>
  );
}

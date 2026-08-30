"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { ChevronDown, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useEcoPointsStore } from "@/store/ecoPoints.store";
import { SUPPORTING_ECOPOINT_SOURCES } from "@/config/eco-points";

const MAX_REWARDED_LOGS_PER_DAY = 3;

/* ── Zod schema ── */
const aktivitasSchema = z.object({
  category: z.enum(["Transport", "Food", "Waste"], {
    required_error: "Pilih kategori aktivitas",
  }),
  amount: z
    .number({ invalid_type_error: "Masukkan angka yang valid" })
    .positive("Jumlah harus lebih dari 0")
    .max(10000, "Jumlah angka terlalu besar"),
  unit: z.string().min(1, "Satuan diperlukan"),
  notes: z.string().optional(),
});

type AktivitasForm = z.infer<typeof aktivitasSchema>;

type AktivitasCategory = "Transport" | "Food" | "Waste";

const CATEGORIES: AktivitasCategory[] = ["Transport", "Food", "Waste"];

const UNIT_MAP: Record<AktivitasCategory, string> = {
  Transport: "km",
  Food: "kg",
  Waste: "kg",
};

const CATEGORY_COLORS: Record<AktivitasCategory, string> = {
  Transport: "#2D5F3F",
  Food: "#7AC74F",
  Waste: "#10B981",
};

/* ── Toast mini ── */
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="flex items-center gap-2 rounded-lg border border-[#A8D5BA] bg-white px-4 py-3 shadow-md text-sm text-[#2D5F3F] font-medium"
    >
      <CheckCircle size={16} className="shrink-0 text-[#7AC74F]" />
      {message}
    </motion.div>
  );
}

interface CatatAktivitasBaruProps {
  onActivityAdded?: (data: AktivitasForm) => void;
  onGoToListrik?: () => void;
}

export default function CatatAktivitasBaru({
  onActivityAdded,
  onGoToListrik,
}: CatatAktivitasBaruProps) {
  const earn = useEcoPointsStore((s) => s.earn);
  const transactions = useEcoPointsStore((s) => s.transactions);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AktivitasForm>({
    resolver: zodResolver(aktivitasSchema),
    defaultValues: { unit: "km" },
  });

  const selectedCategory = watch("category");

  /* Auto-fill unit when category changes */
  useEffect(() => {
    if (selectedCategory && UNIT_MAP[selectedCategory]) {
      setValue("unit", UNIT_MAP[selectedCategory]);
    }
  }, [selectedCategory, setValue]);

  const onSubmit = async (data: AktivitasForm) => {
    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 600));
    setIsSubmitting(false);
    onActivityAdded?.(data);
    const today = new Date().toDateString();
    const logsToday = transactions.filter((t) => t.source === "footprint_log" && new Date(t.timestamp).toDateString() === today).length;
    const src = SUPPORTING_ECOPOINT_SOURCES.FOOTPRINT_LOG;
    const rewarded = logsToday < MAX_REWARDED_LOGS_PER_DAY;
    if (rewarded) earn(src.amount, "footprint_log", `${src.label}: ${data.category}`);
    reset({ unit: "km" });
    setToast(
      rewarded
        ? `Aktivitas berhasil dicatat · +${src.amount} EcoPoints`
        : "Aktivitas berhasil dicatat (batas harian perolehan poin tercapai)"
    );
  };

  const inputBase =
    "w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-[#1A1A1A] outline-none transition-all placeholder:text-gray-300 focus:border-[#2D5F3F] focus:ring-1 focus:ring-[#2D5F3F]";

  const labelBase = "mb-1.5 block text-xs font-semibold text-gray-600";

  return (
    <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Header */}
      <h3 className="mb-4 text-base font-bold text-[#0F3D2E]">
        Catat Aktivitas Emisi Harian
      </h3>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

        {/* Field 1: Kategori */}
        <div>
          <label htmlFor="catat-category" className={labelBase}>Kategori Aktivitas</label>
          <div className="relative">
            <select
              id="catat-category"
              {...register("category")}
              className={`${inputBase} appearance-none pr-9 bg-white font-medium`}
              defaultValue=""
            >
              <option value="" disabled>
                -- Pilih Kategori --
              </option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
          </div>
          {errors.category && (
            <p className="mt-1 text-xs text-[#EF4444]">{errors.category.message}</p>
          )}
          {/* Category color indicator */}
          {selectedCategory && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: CATEGORY_COLORS[selectedCategory] }}
              />
              <span className="text-xs text-gray-400">{selectedCategory}</span>
            </div>
          )}
        </div>

        {/* Field 2: Jumlah + Unit */}
        <div className="grid grid-cols-[1fr_80px] gap-2">
          <div>
            <label htmlFor="catat-amount" className={labelBase}>Jumlah</label>
            <input
              id="catat-amount"
              type="number"
              step="0.01"
              placeholder="Contoh: 15"
              {...register("amount", { valueAsNumber: true })}
              className={inputBase}
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-[#EF4444]">{errors.amount.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="catat-unit" className={labelBase}>Satuan</label>
            <input
              id="catat-unit"
              type="text"
              {...register("unit")}
              className={`${inputBase} text-center font-bold text-[#0F3D2E]`}
              readOnly
            />
          </div>
        </div>

        {/* Field 3: Catatan */}
        <div>
          <label htmlFor="catat-notes" className={labelBase}>
            Catatan{" "}
            <span className="font-normal text-gray-400">(opsional)</span>
          </label>
          <textarea
            id="catat-notes"
            rows={2}
            placeholder="Contoh: Bersepeda ke kampus, belanja tanpa kantong plastik…"
            {...register("notes")}
            className={`${inputBase} resize-none`}
          />
        </div>

        <p className="rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-2 text-xs text-[#0F3D2E]">
          Melakukan aksi nyata seperti pilah sampah atau tanam pohon?{" "}
          <Link href="/dashboard/eco-action" className="font-bold underline">Verifikasi Aksi Hijau</Link> untuk mendapatkan EcoPoints.
        </p>

        {/* Listrik redirect note */}
        <p className="text-xs text-gray-500">
          Ingin memantau rekening listrik PLN?{" "}
          <button
            type="button"
            onClick={onGoToListrik}
            className="font-bold text-[#1D9E75] underline underline-offset-2"
          >
            Buka tab Struk Listrik PLN
          </button>
        </p>

        {/* Submit */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileTap={{ scale: 0.97 }}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition-all disabled:opacity-70 bg-[#0F3D2E] hover:bg-[#18533F] shadow-sm"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Menyimpan…
            </>
          ) : (
            "Simpan Catatan Aktivitas"
          )}
        </motion.button>
      </form>
    </div>
  );
}

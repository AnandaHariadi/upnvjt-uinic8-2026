"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Train, Zap, Trash2, Leaf, Bike } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { EmissionCategory } from "@/types/carbon";
import DataBadge from "@/components/common/DataBadge";

const CATEGORY_LABEL: Record<EmissionCategory, string> = {
  Transportasi: "Transport",
  Energi: "Energy",
  Limbah: "Waste",
  Pangan: "Food",
};

/* ── Types ── */
interface RiwayatItem {
  id: string;
  icon: LucideIcon;
  activity: string;
  category: EmissionCategory;
  date: string;
  impactLabel: string;
}

/* ── Category config ── */
const CATEGORY_COLOR: Record<EmissionCategory, string> = {
  Transportasi: "#2D5F3F",
  Energi: "#F59E0B",
  Limbah: "#10B981",
  Pangan: "#7AC74F",
};

/* ── Sample data (illustrative, not user records) ── */
const mockRiwayat: RiwayatItem[] = [
  {
    id: "1",
    icon: Train,
    activity: "Took the commuter train",
    category: "Transportasi",
    date: "26 Oct 2026",
    impactLabel: "-2.4 kg CO₂",
  },
  {
    id: "2",
    icon: Zap,
    activity: "Lower electricity bill than last month",
    category: "Energi",
    date: "25 Oct 2026",
    impactLabel: "-8.1 kg CO₂",
  },
  {
    id: "3",
    icon: Trash2,
    activity: "Recycled plastic waste",
    category: "Limbah",
    date: "24 Oct 2026",
    impactLabel: "-1.8 kg CO₂",
  },
  {
    id: "4",
    icon: Leaf,
    activity: "Ate locally grown vegetables",
    category: "Pangan",
    date: "23 Oct 2026",
    impactLabel: "-0.9 kg CO₂",
  },
  {
    id: "5",
    icon: Bike,
    activity: "Cycled to campus",
    category: "Transportasi",
    date: "22 Oct 2026",
    impactLabel: "-3.2 kg CO₂",
  },
];

const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, delay: i * 0.05, ease: "easeOut" },
  }),
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

interface RiwayatAktivitasProps {
  items?: RiwayatItem[];
}

export default function RiwayatAktivitas({
  items = mockRiwayat,
}: RiwayatAktivitasProps) {
  const [expanded, setExpanded] = useState(false);
  const INITIAL_COUNT = 5;
  const visibleItems = expanded ? items : items.slice(0, INITIAL_COUNT);
  const canExpand = items.length > INITIAL_COUNT;

  return (
    <div className="rounded-[12px] border border-[#E5E7EB] bg-white p-6 shadow-sm">
      {/* Card header */}
      <div className="mb-5 flex items-center justify-between">
        <h3 className="text-base font-semibold text-[#1A1A1A]">
          Footprint activity history
        </h3>
        <DataBadge variant="demo" label="Sample data" />
        {canExpand && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-sm font-medium text-[#2D5F3F] hover:underline transition-colors"
          >
            {expanded ? "Show less" : "Show all"}
          </button>
        )}
      </div>

      {/* Table wrapper */}
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-[#E5E7EB]">
              {["Activity", "Date", "Estimated impact"].map((h) => (
                <th
                  key={h}
                  className="pb-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {visibleItems.map((item, i) => (
                <motion.tr
                  key={item.id}
                  custom={i}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="group border-b border-[#F3F4F6] last:border-0 hover:bg-[#F9FAFB] transition-colors"
                >
                  {/* Aktivitas */}
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-3">
                      {/* Icon circle */}
                      <span
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: `${CATEGORY_COLOR[item.category]}18`,
                        }}
                      >
                        <item.icon
                          size={15}
                          style={{ color: CATEGORY_COLOR[item.category] }}
                        />
                      </span>

                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-[#1A1A1A] leading-tight">
                          {item.activity}
                        </span>
                        {/* Category badge */}
                        <span
                          className="w-fit rounded-full px-2 py-0.5 text-[10px] font-medium"
                          style={{
                            backgroundColor: `${CATEGORY_COLOR[item.category]}15`,
                            color: CATEGORY_COLOR[item.category],
                          }}
                        >
                          {CATEGORY_LABEL[item.category]}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Tanggal */}
                  <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                    {item.date}
                  </td>

                  {/* Dampak */}
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <span className="font-medium text-[#10B981]">
                      {item.impactLabel}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}

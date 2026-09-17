"use client";

import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import DataBadge from "@/components/common/DataBadge";

/* ── Sample data (illustrative): estimated kg CO₂ per category ── */
const breakdownData = [
  { name: "Energi Rumah Tangga", value: 225, color: "#F59E0B", pct: 50 },
  { name: "Transportasi",        value: 135, color: "#2D5F3F", pct: 30 },
  { name: "Konsumsi Makanan",    value:  54, color: "#7AC74F", pct: 12 },
  { name: "Sampah Dapur",        value:  36, color: "#10B981", pct:  8 },
];

const TOTAL = breakdownData.reduce((sum, d) => sum + d.value, 0);

/* ── Custom Tooltip ── */
function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: typeof breakdownData[number] }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 shadow-md text-xs">
      <p className="font-semibold text-[#1A1A1A]">{item.name}</p>
      <p className="text-gray-600">{item.value} kg CO₂e</p>
      <p className="text-gray-400">{item.pct}% dari total</p>
    </div>
  );
}

export default function BreakdownKategori() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-xs"
    >
      {/* Header */}
      <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[#0F3D2E]">
        Distribusi Emisi per Kategori <DataBadge variant="demo" label="Data Sampel" />
      </h3>

      {/* Chart + center overlay */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={breakdownData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={88}
              startAngle={90}
              endAngle={-270}
              paddingAngle={2}
              dataKey="value"
              isAnimationActive={true}
              animationBegin={0}
              animationDuration={800}
              animationEasing="ease-out"
              labelLine={false}
            >
              {breakdownData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} stroke="white" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        {/* Center text: CSS overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-[22px] font-extrabold leading-none text-[#0F3D2E]">{TOTAL}</p>
            <p className="mt-0.5 text-[11px] text-gray-500 font-medium">kg CO₂e</p>
          </div>
        </div>
      </div>

      {/* Legend */}
      <ul className="mt-3 flex flex-col gap-2">
        {breakdownData.map(({ name, value, color, pct }) => (
          <li key={name} className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-gray-700 font-medium">{name}</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-[#0F3D2E]">{value} kg</span>
              <span className="ml-1.5 text-xs text-gray-400">({pct}%)</span>
            </div>
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

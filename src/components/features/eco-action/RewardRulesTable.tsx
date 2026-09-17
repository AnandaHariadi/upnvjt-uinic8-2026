import { GREEN_ACTION_LIST } from "@/config/green-actions";
import { IMPACT_FACTORS } from "@/config/impact-factors";
import DataBadge from "@/components/common/DataBadge";
import { GreenActionIcon } from "@/components/common/icons";

/** Action → Evidence → Verification → Impact → EcoPoints, rendered from config. */
export default function RewardRulesTable() {
  return (
    <section aria-labelledby="rules-heading" className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-6">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 id="rules-heading" className="text-base font-bold text-[#1A1A1A]">Ketentuan Perolehan EcoPoints</h2>
        <DataBadge variant="prototype" label="Ketentuan Poin" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-xs">
          <caption className="sr-only">Tabel ketentuan perolehan poin aksi hijau</caption>
          <thead>
            <tr className="border-b border-[#E5E7EB] text-[10px] uppercase tracking-wide text-gray-500">
              <th scope="col" className="py-2 pr-3">Aksi Hijau</th>
              <th scope="col" className="py-2 pr-3">Kriteria Bukti Foto</th>
              <th scope="col" className="py-2 pr-3">Verifikasi Sistem</th>
              <th scope="col" className="py-2 pr-3">Metrik Dampak</th>
              <th scope="col" className="py-2 pr-3 text-right">EcoPoints</th>
            </tr>
          </thead>
          <tbody>
            {GREEN_ACTION_LIST.map((a) => (
              <tr key={a.type} className="border-b border-[#F3F4F6] align-top">
                <th scope="row" className="py-2.5 pr-3 font-semibold text-[#1A1A1A]">
                  <span className="flex items-center gap-1.5"><GreenActionIcon type={a.type} size={15} /> {a.labelId}</span>
                </th>
                <td className="py-2.5 pr-3 text-gray-600">{a.evidenceRequirement}</td>
                <td className="py-2.5 pr-3 text-gray-600">Analisis AI + validasi · maks {a.dailyLimit}x/hari</td>
                <td className="py-2.5 pr-3 text-gray-600">{a.impactMetric}</td>
                <td className="py-2.5 pr-3 text-right font-bold text-[#2D5F3F]">+{a.ecoPoints}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-gray-500">
        EcoPoints merupakan sistem poin penghargaan komunitas (bukan uang tunai atau instrumen spekulatif) yang hanya diterbitkan untuk aksi dengan status
        &ldquo;Terverifikasi&rdquo;. Estimasi pengurangan emisi CO₂e mengacu pada faktor emisi kelistrikan nasional ESDM ({IMPACT_FACTORS.gridElectricity.value} kg CO₂/kWh) dan{" "}
        faktor emisi perjalanan motor ({IMPACT_FACTORS.motorcycleTravel.value} kg CO₂e/km). Aksi tanpa faktor konversi baku dilaporkan dalam satuan fisik.
      </p>
    </section>
  );
}

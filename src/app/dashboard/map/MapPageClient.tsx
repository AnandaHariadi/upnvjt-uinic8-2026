"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ShieldCheck, MapPin, X } from "lucide-react";
import PageWrapper from "@/components/common/PageWrapper";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import DataBadge from "@/components/common/DataBadge";
import DistrictTable from "@/components/features/local-impact-map/DistrictTable";
import { MapLoading } from "@/components/maps/MapLoading";
import { GREEN_ACTIONS, GREEN_ACTION_TYPES } from "@/config/green-actions";
import { DEMO_DATASET_LABEL } from "@/data/demo/district-baseline";
import { METRIC_META, cityTotals, useDistrictStats, type DistrictMetric } from "@/lib/impact-aggregation";
import { cn } from "@/utils/cn";
import { GreenActionIcon } from "@/components/common/icons";
import { useJudgeGuideStore } from "@/store/judgeGuide.store";

const ImpactMapCanvas = dynamic(() => import("@/components/features/local-impact-map/ImpactMapCanvas"), {
  ssr: false,
  loading: () => <MapLoading className="h-full min-h-[380px] lg:min-h-[560px]" />,
});

const METRICS = Object.keys(METRIC_META) as DistrictMetric[];

export default function MapPageClient() {
  const stats = useDistrictStats();
  const markVisited = useJudgeGuideStore((s) => s.markVisited);
  useEffect(() => markVisited("map"), [markVisited]);
  const totals = cityTotals(stats);
  const [metric, setMetric] = useState<DistrictMetric>("verifiedActions");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = stats.find((d) => d.kecamatan.id === selectedId) ?? null;
  const ranking = [...stats].sort((a, b) => b[metric] - a[metric]).slice(0, 5);

  return (
    <PageWrapper>
      <div className="flex flex-col gap-4 lg:gap-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>

            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-[#1D9E75] border border-emerald-200">
                Portal Warga
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D5F3F]">
                Geospasial Komunitas Surabaya
              </span>
            </div>
            <h1 className="text-xl font-bold text-[#1A1A1A] sm:text-2xl">
              Peta Dampak Aksi Hijau Warga Surabaya
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-600 leading-relaxed">
              Setiap lingkaran merefleksikan kontribusi warga di lingkungan sekitar. Aksi pemilahan sampah, pengumpulan jelantah, dan kebiasaan hijau warga diagregasikan di 31 kecamatan se-Surabaya.
            </p>
          </div>
          <DataBadge variant="demo" label={DEMO_DATASET_LABEL} />
        </header>

        {/* Metrik Agregat Kota */}
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { k: "Aksi Hijau Terverifikasi", v: totals.verifiedActions.toLocaleString("id-ID") },
            { k: "Estimasi Reduksi CO₂e", v: `${totals.estimatedCo2eKg.toLocaleString("id-ID")} kg` },
            { k: "Laporan Sampah (Terbuka)", v: `${totals.wasteReports} (${totals.openWasteReports})` },
            { k: "Warga Berkontribusi", v: totals.activeContributors.toLocaleString("id-ID") },
          ].map((x) => (
            <div key={x.k} className="rounded-xl border border-[#E5E7EB] bg-white p-3.5 shadow-xs">
              <dt className="text-xs font-medium text-gray-500">{x.k}</dt>
              <dd className="mt-0.5 text-lg font-black text-[#0F3D2E]">{x.v}</dd>
            </div>
          ))}
        </dl>

        {/* Pilihan Metrik Peta */}
        <fieldset>
          <legend className="mb-2 text-xs font-bold text-gray-700">Tampilkan Indikator pada Peta:</legend>
          <div className="flex flex-wrap gap-2">
            {METRICS.map((m) => (
              <label
                key={m}
                className={cn(
                  "cursor-pointer rounded-full border px-3 py-1.5 text-xs font-semibold transition-all focus-within:ring-2 focus-within:ring-[#2D5F3F]",
                  metric === m ? "border-transparent text-white shadow-xs" : "border-[#E5E7EB] bg-white text-gray-600 hover:bg-gray-50"
                )}
                style={metric === m ? { backgroundColor: METRIC_META[m].color } : undefined}
              >
                <input type="radio" name="map-metric" value={m} checked={metric === m} onChange={() => setMetric(m)} className="sr-only" />
                {METRIC_META[m].label}
              </label>
            ))}
          </div>
        </fieldset>

        {/* Konten Peta & Samping */}
        <div className="grid gap-4 lg:grid-cols-[1fr_320px] items-stretch">
          <div className="flex flex-col h-full min-h-[380px] lg:min-h-[560px]">

            <div className="flex-1 min-h-[380px] lg:min-h-[560px] flex flex-col">
              <ErrorBoundary>
              <ImpactMapCanvas stats={stats} metric={metric} selectedId={selectedId} onSelect={setSelectedId} className="flex-1 w-full h-full min-h-[380px] lg:min-h-[560px]" />
              </ErrorBoundary>
            </div>
            <p className="mt-2 text-[11px] text-gray-500 shrink-0">
              Besar lingkaran dan opasitas warna mencerminkan nilai {METRIC_META[metric].label.toLowerCase()} di setiap kecamatan. Garis putus-putus menunjukkan batas wilayah Surabaya.
            </p>
          </div>

          <aside className="flex flex-col gap-4" aria-label="Rincian Kecamatan">
            <section className="rounded-2xl border border-[#E5E7EB] bg-white shadow-xs overflow-hidden" aria-live="polite">
              <div className="bg-[#0F3D2E] px-4 py-3 text-sm font-bold text-white flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <MapPin size={15} className="shrink-0" />
                {selected ? `Kecamatan ${selected.kecamatan.name}` : "Rincian Kecamatan"}
                </h2>
                {selected && (
                  <button
                    type="button"
                    onClick={() => setSelectedId(null)}
                    aria-label="Tutup rincian kecamatan"
                    className="rounded-full p-1 text-emerald-200 hover:bg-white/20 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    title="Kembali ke tampilan default"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
              {selected ? (
                <div className="flex flex-col gap-2 p-4 text-sm">
                  <p className="text-xs font-bold text-emerald-700">Wilayah Surabaya {selected.kecamatan.region}</p>
                  {METRICS.map((m) => (
                    <div key={m} className="flex justify-between border-b border-[#F3F4F6] py-1 text-xs">
                      <span className="text-gray-500">{METRIC_META[m].label}</span>
                      <span className="font-bold tabular-nums text-gray-800">{selected[m].toLocaleString("id-ID")}</span>
                    </div>
                  ))}
                  <p className="mt-2 text-xs font-bold text-gray-700">Distribusi Aksi Hijau Warga</p>
                  <ul className="flex flex-col gap-1.5">
                    {GREEN_ACTION_TYPES.map((t) => {
                      const pct = Math.round((selected.actionsByType[t] / Math.max(1, selected.verifiedActions)) * 100);
                      return (
                        <li key={t} className="text-xs">
                          <div className="flex justify-between text-gray-700">
                            <span className="flex items-center gap-1.5">
                              <GreenActionIcon type={t} size={13} /> {GREEN_ACTIONS[t].labelId}
                            </span>
                            <span className="font-semibold">{selected.actionsByType[t]}</span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: GREEN_ACTIONS[t].color }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                  {selected.yourActions > 0 && (
                    <p className="mt-2 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-semibold text-[#0F3D2E]">
                      Termasuk {selected.yourActions} aksi hijau yang telah Anda verifikasi!
                    </p>
                  )}
                </div>
              ) : (
                <p className="p-4 text-xs text-gray-500 leading-relaxed">
                  Pilih salah satu lingkaran di peta atau klik baris kecamatan pada tabel di bawah untuk melihat rincian capaian komunitas.
                </p>
              )}
            </section>

            {/* Peringkat 5 Teratas */}
            <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xs">
              <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-600">
                5 Kecamatan Teratas · {METRIC_META[metric].label}
              </h2>
              <ol className="flex flex-col gap-1">
                {ranking.map((d, i) => (
                  <li key={d.kecamatan.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(d.kecamatan.id)}
                      className="flex w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs font-medium hover:bg-emerald-50 transition-colors"
                    >
                      <span className="w-5 text-xs font-bold text-emerald-800">#{i + 1}</span>
                      <span className="flex-1 text-gray-800 font-semibold">{d.kecamatan.name}</span>
                      <span className="font-bold tabular-nums text-[#0F3D2E]">{d[metric].toLocaleString("id-ID")}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </section>

            {/* Jaminan Privasi */}
            <section className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-xs text-gray-700 leading-relaxed">
              <p className="mb-1.5 flex items-center gap-1.5 font-bold text-[#0F3D2E]">
                <ShieldCheck size={15} className="text-[#1D9E75]" aria-hidden="true" />
                Privasi Terjaga Berbasis Desain
              </p>
              Aksi hijau warga hanya diagregasikan dalam skala kecamatan untuk menjaga kerahasiaan rumah tangga. Koordinat pribadi tidak pernah dipublikasikan secara terbuka.{" "}
              <Link href="/dashboard/eco-action" className="font-bold text-[#1D9E75] underline">
                Verifikasi aksi hijau Anda sekarang
              </Link>.
            </section>
          </aside>
        </div>

        {/* Tabel 31 Kecamatan */}
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-4 sm:p-5 shadow-xs" aria-labelledby="district-table-heading">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h2 id="district-table-heading" className="text-sm font-bold text-[#0F3D2E]">
              Data Capaian 31 Kecamatan se-Surabaya
            </h2>
            <DataBadge variant="demo" />
          </div>
          <DistrictTable stats={stats} selectedId={selectedId} onSelect={setSelectedId} />
        </section>
      </div>
    </PageWrapper>
  );
}

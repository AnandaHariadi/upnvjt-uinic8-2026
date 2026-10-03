import type { Metadata } from "next";
import { Suspense } from "react";
import MarketplaceClient from "./MarketplaceClient";

export const metadata: Metadata = {
  title: "Pusat Hadiah & Prestasi | PACUL",
  description: "Tukarkan EcoPoints dengan voucher UMKM lokal Surabaya, pantau papan peringkat warga, raih lencana prestasi, dan ikuti tantangan komunitas.",
};

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm text-gray-500">Memuat Pusat Hadiah & Prestasi…</div>}>
      <MarketplaceClient />
    </Suspense>
  );
}

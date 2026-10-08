import type { Metadata } from "next";
import MapPageClient from "./MapPageClient";

export const metadata: Metadata = {
  title: "Peta Aksi Hijau & Pantauan Sampah Surabaya | PACUL",
  description:
    "Peta sebaran aksi hijau terverifikasi, laporan timbulan sampah warga, dan capaian EcoPoints di 31 kecamatan Surabaya.",
};

export default function MapPage() {
  return <MapPageClient />;
}

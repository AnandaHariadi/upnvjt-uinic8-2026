import type { Metadata } from "next";
import LaporanSampahClient from "./LaporanSampahClient";

export const metadata: Metadata = {
  title: "Laporan Timbulan Sampah | PACUL",
  description: "Laporkan titik timbulan sampah liar di fasilitas umum Surabaya dan pantau status tindak lanjut petugas kebersihan.",
};

export default function LaporanSampahPage() {
  return <LaporanSampahClient />;
}

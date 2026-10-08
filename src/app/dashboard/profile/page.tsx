import type { Metadata } from "next";
import ProfilePageClient from "./ProfilePageClient";

export const metadata: Metadata = {
  title: "Profil Pengguna | PACUL",
  description: "Tingkat level EcoPoints, riwayat aksi hijau terverifikasi, lencana pencapaian, dan jejak kontribusi lingkungan Anda.",
};

export default function ProfilePage() {
  return <ProfilePageClient />;
}


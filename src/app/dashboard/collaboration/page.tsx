import type { Metadata } from "next";
import CollaborationPageClient from "./CollaborationPageClient";

export const metadata: Metadata = {
  title: "Forum Komunitas Warga | PACUL",
  description: "Bagikan aksi hijau terverifikasi, diskusikan inisiatif lingkungan, dan bangun gerakan bersama warga Surabaya.",
};

export default function CollaborationPage() {
  return <CollaborationPageClient />;
}

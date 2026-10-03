"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function DemoPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FAFDFB] p-6 text-center">
      <Loader2 size={32} className="animate-spin text-[#1D9E75]" aria-hidden="true" />
      <h1 className="text-lg font-bold text-[#0F3D2E]">Mengarahkan ke Halaman Masuk PACUL…</h1>
      <p className="max-w-sm text-xs text-gray-500">Silakan pilih peran Warga atau Pemkot untuk memulai demo interaktif.</p>
    </main>
  );
}

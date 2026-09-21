"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function GovLoginPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login?role=gov");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0F1A2E] p-4 text-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-[#7AC74F]" aria-hidden="true" />
        <p className="text-sm font-semibold text-white">Mengarahkan ke Portal Masuk Pemkot…</p>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { useCollaborationStore } from "@/store/collaboration.store";
import { useGreenActionStore } from "@/store/greenAction.store";
import { GREEN_ACTIONS } from "@/config/green-actions";
import { findKecamatan } from "@/config/surabaya";
import { makeInitials } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import type { CommunityPostType } from "@/types/community";

type ComposerType = Exclude<CommunityPostType, "VERIFIED_ACTION">;

export const POST_TYPE_META: Record<CommunityPostType, { label: string; color: string; placeholder: string }> = {
  IDEA: { label: "Ide", color: "#2D5F3F", placeholder: "Bagikan ide untuk lingkungan yang lebih asri dan bersih…" },
  MOVEMENT: { label: "Gerakan", color: "#047857", placeholder: "Ajak tetangga berpartisipasi dalam aksi bersama…" },
  EVENT: { label: "Kegiatan", color: "#B45309", placeholder: "Umumkan kerja bakti, workshop, atau setor jelantah…" },
  UPDATE: { label: "Kabar", color: "#1D4ED8", placeholder: "Bagikan kabar perkembangan lingkungan dari kampung Anda…" },
  VERIFIED_ACTION: { label: "Aksi Terverifikasi", color: "#047857", placeholder: "" },
};

const TYPES: ComposerType[] = ["IDEA", "MOVEMENT", "EVENT", "UPDATE"];

export default function PostComposer() {
  const user = useAuthStore((s) => s.user);
  const addPost = useCollaborationStore((s) => s.addPost);
  const shareVerifiedAction = useCollaborationStore((s) => s.shareVerifiedAction);
  const actions = useGreenActionStore((s) => s.actions);
  const markShared = useGreenActionStore((s) => s.markShared);
  const [type, setType] = useState<ComposerType>("IDEA");
  const [content, setContent] = useState("");
  const [linkedId, setLinkedId] = useState("");
  const [posting, setPosting] = useState(false);

  // Only the user's own, verified, not-yet-shared actions can be attached.
  const shareable = actions.filter((a) => a.verificationStatus === "verified" && !a.sharedToCommunity && !a.evidenceHash.startsWith("demo-seed"));

  if (!user) return null;
  const author = {
    name: user.name,
    initials: user.avatarInitials ?? makeInitials(user.name),
    kecamatan: user.kecamatan || "Surabaya",
  };

  const submit = async () => {
    const text = content.trim();
    if (!text || posting) return;
    setPosting(true);
    await new Promise((r) => setTimeout(r, 400));
    const linked = shareable.find((a) => a.actionId === linkedId);
    if (linked) {
      const def = GREEN_ACTIONS[linked.actionType];
      const imp = linked.estimatedImpact;
      shareVerifiedAction(
        { ...author, kecamatan: findKecamatan(linked.location?.kecamatanId)?.name ?? author.kecamatan },
        text,
        {
          actionId: linked.actionId,
          actionType: linked.actionType,
          mode: linked.verificationMode,
          impactSummary: `${def.labelId}: ${imp.quantity} ${imp.unit}${imp.estimatedCo2eKg != null ? ` · cegah ${imp.estimatedCo2eKg} kg CO₂e` : ""}`,
        }
      );
      markShared(linked.actionId);
    } else {
      const tags = Array.from(new Set(text.match(/#\w+/g) ?? [])).slice(0, 5);
      addPost({ author, type, content: text, tags });
    }
    setContent("");
    setLinkedId("");
    setPosting(false);
    toast.success("Berhasil dibagikan ke Forum Komunitas Warga");
  };

  return (
    <section aria-label="Buat postingan baru" className="rounded-[12px] border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ backgroundColor: user.avatarColor ?? "#2D5F3F" }} aria-hidden="true">
          {author.initials}
        </span>
        <div className="flex-1">
          <label htmlFor="post-content" className="sr-only">Konten postingan</label>
          <textarea
            id="post-content"
            rows={3}
            maxLength={500}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={POST_TYPE_META[type].placeholder}
            className="w-full resize-none rounded-lg border border-[#E5E7EB] px-3 py-2.5 text-sm outline-none focus:border-[#2D5F3F] focus:ring-2 focus:ring-[#2D5F3F]/20"
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2" role="group" aria-label="Kategori postingan">
        {TYPES.map((t) => (
          <button
            key={t}
            type="button"
            aria-pressed={type === t && !linkedId}
            onClick={() => { setType(t); setLinkedId(""); }}
            className={cn("rounded-full px-3 py-1 text-sm font-medium", type === t && !linkedId ? "text-white" : "text-gray-600 hover:bg-gray-100")}
            style={type === t && !linkedId ? { backgroundColor: POST_TYPE_META[t].color } : undefined}
          >
            {POST_TYPE_META[t].label}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex-1">
          <label htmlFor="post-link" className="mb-1 block text-xs font-semibold text-gray-600">Sematkan aksi hijau terverifikasi Anda (opsional)</label>
          <select
            id="post-link"
            value={linkedId}
            onChange={(e) => setLinkedId(e.target.value)}
            disabled={shareable.length === 0}
            className="w-full rounded-lg border border-[#E5E7EB] bg-white px-3 py-2 text-sm disabled:bg-gray-50 disabled:text-gray-500"
          >
            <option value="">{shareable.length === 0 ? "Belum ada aksi terverifikasi baru" : "Tanpa lampiran aksi hijau"}</option>
            {shareable.map((a) => (
              <option key={a.actionId} value={a.actionId}>
                {GREEN_ACTIONS[a.actionType].labelId} · {new Date(a.timestamp).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                {a.verificationMode === "demo" ? " (simulasi)" : ""}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!content.trim() || posting}
          className="flex items-center justify-center gap-2 rounded-lg bg-[#2D5F3F] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#245033] disabled:bg-gray-200 disabled:text-gray-500 sm:self-end"
        >
          {posting && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
          {posting ? "Mengirim…" : "Kirim"}
        </button>
      </div>
    </section>
  );
}

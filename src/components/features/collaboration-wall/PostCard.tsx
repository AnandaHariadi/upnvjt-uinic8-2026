"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Heart, MapPin, Users, X } from "lucide-react";
import { useCollaborationStore } from "@/store/collaboration.store";
import { GreenActionIcon } from "@/components/common/icons";
import { timeAgo } from "@/utils/formatters";
import DataBadge from "@/components/common/DataBadge";
import type { CommunityPost } from "@/types/community";
import PostKindBadge from "./PostKindBadge";
import { POST_TYPE_META } from "./PostComposer";

function JoinDialog({ post, onClose }: { post: CommunityPost; onClose: () => void }) {
  const [name, setName] = useState("");
  const join = () => {
    toast.success("Pendaftaran minat berhasil dicatat (simulasi percontohan).");
    onClose();
  };
  return (
    <Dialog.Root open onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Dialog.Content aria-describedby={undefined} className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-2xl focus:outline-none">
          <div className="mb-3 flex items-start justify-between gap-3">
            <Dialog.Title className="flex items-center gap-2 text-base font-bold text-[#1A1A1A]"><Users size={16} className="text-[#2D5F3F]" aria-hidden="true" /> Ikuti {POST_TYPE_META[post.type].label}</Dialog.Title>
            <Dialog.Close aria-label="Tutup" className="text-gray-500 hover:text-gray-700"><X size={18} /></Dialog.Close>
          </div>
          <p className="mb-3 line-clamp-2 text-xs text-gray-600">{post.content}</p>
          <label htmlFor="join-name" className="mb-1 block text-xs font-medium text-gray-600">Nama Lengkap Anda</label>
          <input id="join-name" value={name} onChange={(e) => setName(e.target.value.slice(0, 60))} className="w-full rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm outline-none focus:border-[#2D5F3F]" />
          <button type="button" onClick={join} disabled={!name.trim()} className="mt-4 w-full rounded-lg bg-[#2D5F3F] py-2.5 text-sm font-semibold text-white disabled:bg-gray-200 disabled:text-gray-500">
            Daftar Partisipasi
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function PostCard({ post }: { post: CommunityPost }) {
  const toggleLike = useCollaborationStore((s) => s.toggleLike);
  const [joining, setJoining] = useState(false);
  const meta = POST_TYPE_META[post.type];
  const canJoin = post.type === "MOVEMENT" || post.type === "EVENT";

  return (
    <article className={`rounded-[12px] border bg-white p-4 shadow-sm sm:p-5 ${post.verifiedAction ? "border-emerald-200" : "border-[#E5E7EB]"}`}>
      <header className="mb-3 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2D5F3F] text-sm font-bold text-white" aria-hidden="true">
          {post.author.initials}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#1A1A1A]">{post.author.name}</p>
          <p className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={10} aria-hidden="true" /> {post.author.kecamatan} · <time dateTime={post.createdAt}>{timeAgo(post.createdAt)}</time>
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <PostKindBadge post={post} />
          {!post.verifiedAction && <span className="text-[10px] font-semibold" style={{ color: meta.color }}>{meta.label}</span>}
        </div>
      </header>

      <p className="mb-3 whitespace-pre-line text-sm leading-relaxed text-gray-700">{post.content}</p>

      {post.verifiedAction && (
        <p className="mb-3 flex items-center gap-2 rounded-lg border-l-2 border-emerald-500 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
          <GreenActionIcon type={post.verifiedAction.actionType} size={14} /> {post.verifiedAction.impactSummary}
          {post.verifiedAction.mode === "demo" && " · verifikasi simulasi"}
        </p>
      )}

      {post.tags.length > 0 && (
        <ul className="mb-3 flex flex-wrap gap-2">
          {post.tags.map((t) => <li key={t} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">{t}</li>)}
        </ul>
      )}

      <footer className="flex items-center gap-3 border-t border-gray-100 pt-2">
        <button
          type="button"
          onClick={() => toggleLike(post.id)}
          aria-pressed={!!post.likedByMe}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-gray-600 hover:bg-gray-50"
        >
          <Heart size={15} className={post.likedByMe ? "fill-red-500 text-red-500" : ""} aria-hidden="true" />
          {post.likes} <span className="sr-only">suka</span>
        </button>
        <span className="text-xs text-gray-500">{post.replies} balasan</span>
        {post.isDemo && <DataBadge variant="demo" label="Postingan Simulasi" className="ml-1" />}
        {canJoin && (
          <button type="button" onClick={() => setJoining(true)} className="ml-auto rounded-md bg-[#2D5F3F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#245033]">
            Ikuti
          </button>
        )}
      </footer>
      {joining && <JoinDialog post={post} onClose={() => setJoining(false)} />}
    </article>
  );
}

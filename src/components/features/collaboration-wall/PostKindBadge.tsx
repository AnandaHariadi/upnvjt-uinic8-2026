import { BadgeCheck, MessageSquare } from "lucide-react";
import type { CommunityPost } from "@/types/community";

/**
 * Distinguishes posts backed by a verified green action from ordinary community posts.
 */
export default function PostKindBadge({ post }: { post: CommunityPost }) {
  if (post.verifiedAction) {
    return (
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800"
        title="Didukung bukti aksi hijau terverifikasi sistem"
      >
        <BadgeCheck size={11} aria-hidden="true" /> Aksi Terverifikasi
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-700">
      <MessageSquare size={11} aria-hidden="true" /> Postingan Warga
    </span>
  );
}

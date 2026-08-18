import type { GreenActionType, VerificationMode } from "@/types/green-action";

export type CommunityPostType = "IDEA" | "MOVEMENT" | "EVENT" | "UPDATE" | "VERIFIED_ACTION";

/**
 * A post is shown as a "Verified Action" ONLY when `verifiedAction` is set,
 * which happens exclusively when sharing a record that passed verification.
 */
export interface VerifiedActionRef {
  actionId: string;
  actionType: GreenActionType;
  mode: VerificationMode;
  impactSummary: string;
}

export interface CommunityPost {
  id: string;
  author: { name: string; initials: string; kecamatan: string };
  createdAt: string;
  type: CommunityPostType;
  content: string;
  tags: string[];
  likes: number;
  replies: number;
  likedByMe?: boolean;
  verifiedAction?: VerifiedActionRef;
  /** Seeded example content for the prototype. */
  isDemo?: boolean;
}

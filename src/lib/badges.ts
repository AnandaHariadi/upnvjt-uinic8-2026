import type { GreenActionRecord } from "@/types/green-action";
import type { GreenActionType } from "@/config/green-actions";

export interface BadgeProgress {
  id: string;
  name: string;
  description: string;
  current: number;
  target: number;
  earned: boolean;
  points: number;
}

interface BadgeRule {
  id: string;
  name: string;
  description: string;
  target: number;
  points: number;
  count: (ctx: BadgeContext) => number;
}

export interface BadgeContext {
  actions: GreenActionRecord[];
  challengesCompleted: number;
}

/** Real (non-seeded) verified actions. */
function verified(actions: GreenActionRecord[], type?: GreenActionType) {
  return actions.filter(
    (a) => a.verificationStatus === "verified" && (!type || a.actionType === type)
  ).length;
}

const RULES: BadgeRule[] = [
  { id: "first_step", name: "Langkah Awal", description: "Verifikasi aksi hijau pertama Anda", target: 1, points: 70, count: (c) => verified(c.actions) },
  { id: "waste_warrior", name: "Pejuang Pilah Sampah", description: "Verifikasi 3 aksi pilah sampah", target: 3, points: 300, count: (c) => verified(c.actions, "waste_sorting") },
  { id: "jelantah_hero", name: "Pahlawan Jelantah", description: "Verifikasi penyetoran minyak jelantah", target: 1, points: 500, count: (c) => verified(c.actions, "used_cooking_oil") },
  { id: "tree_planter", name: "Penghijau Kota", description: "Verifikasi 1 aksi penanaman pohon", target: 1, points: 750, count: (c) => verified(c.actions, "tree_planting") },
  { id: "green_commuter", name: "Komuter Hijau", description: "Verifikasi 3 mobilitas rendah emisi", target: 3, points: 1000, count: (c) => verified(c.actions, "sustainable_transport") },
  { id: "watt_saver", name: "Pelopor Hemat Energi", description: "Verifikasi 1 aksi penghematan listrik", target: 1, points: 1250, count: (c) => verified(c.actions, "energy_saving") },
  { id: "challenge_finisher", name: "Penuntas Tantangan", description: "Selesaikan 1 tantangan komunitas", target: 1, points: 1500, count: (c) => c.challengesCompleted },
  { id: "community_voice", name: "Inspirator Warga", description: "Bagikan aksi terverifikasi ke forum komunitas", target: 1, points: 2000, count: (c) => c.actions.filter((a) => a.sharedToCommunity).length },
];

const DEMO_EARNED_BADGE_IDS = new Set(["first_step", "waste_warrior", "jelantah_hero"]);

export function computeBadges(ctx: BadgeContext): BadgeProgress[] {
  return RULES.map((r) => {
    const rawCount = r.count(ctx);
    // Baseline demo: 3 lencana aktif diraih (Langkah Awal, Pejuang Pilah Sampah, Pahlawan Jelantah)
    const isBaselineEarned = DEMO_EARNED_BADGE_IDS.has(r.id);
    const current = isBaselineEarned ? Math.max(r.target, rawCount) : Math.min(r.target, rawCount);
    const earned = isBaselineEarned || rawCount >= r.target;
    return { id: r.id, name: r.name, description: r.description, current, target: r.target, earned, points: r.points };
  });
}

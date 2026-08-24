import {
  Award, Bike, Biohazard, Carrot, Coffee, Construction, Droplets, Flower2, Megaphone, Milk, Recycle,
  ShoppingBag, Sparkles, Sprout, Target, Trash2, TreePine, Waves, Wrench, Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { GREEN_ACTIONS, type GreenActionType } from "@/config/green-actions";
import type { WasteCategory } from "@/store/wasteReport.store";
import type { RewardIconKey } from "@/data/demo/umkm-rewards";

/** Single registry of the icons that represent PACUL domain concepts. */

const GREEN_ACTION_ICONS: Record<GreenActionType, LucideIcon> = {
  waste_sorting: Recycle,
  used_cooking_oil: Droplets,
  tree_planting: TreePine,
  energy_saving: Zap,
  sustainable_transport: Bike,
};

const WASTE_CATEGORY_ICONS: Record<WasteCategory, LucideIcon> = {
  overflowing_waste: Trash2,
  illegal_dumping: Construction,
  river_waste: Waves,
  street_litter: Trash2,
  hazardous_waste: Biohazard,
};

const REWARD_ICONS: Record<RewardIconKey, LucideIcon> = {
  coffee: Coffee,
  vegetables: Carrot,
  soap: Sparkles,
  refill: Milk,
  seedlings: Sprout,
  compost: Flower2,
  bag: ShoppingBag,
  bicycle: Wrench,
};

const BADGE_ICONS: Record<string, LucideIcon> = {
  first_step: Sprout,
  waste_warrior: Recycle,
  jelantah_hero: Droplets,
  tree_planter: TreePine,
  green_commuter: Bike,
  watt_saver: Zap,
  challenge_finisher: Target,
  community_voice: Megaphone,
};

interface IconProps {
  size?: number;
  className?: string;
}

export function GreenActionIcon({ type, size = 18, className, colored = true }: IconProps & { type: GreenActionType; colored?: boolean }) {
  const Icon = GREEN_ACTION_ICONS[type];
  return <Icon size={size} className={className} style={colored ? { color: GREEN_ACTIONS[type].color } : undefined} aria-hidden="true" />;
}

export function WasteCategoryIcon({ category, size = 18, className }: IconProps & { category: WasteCategory }) {
  const Icon = WASTE_CATEGORY_ICONS[category];
  return <Icon size={size} className={className} aria-hidden="true" />;
}

export function RewardIcon({ icon, size = 40, className }: IconProps & { icon: RewardIconKey }) {
  const Icon = REWARD_ICONS[icon];
  return <Icon size={size} className={className} aria-hidden="true" />;
}

export function BadgeIcon({ id, size = 24, className }: IconProps & { id: string }) {
  const Icon = BADGE_ICONS[id] ?? Award;
  return <Icon size={size} className={className} aria-hidden="true" />;
}

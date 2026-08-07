export type ActivityCategory = "transportation" | "energy" | "food" | "shopping";

export type EmissionCategory = "Transportasi" | "Energi" | "Limbah" | "Pangan";

export interface EmisiData {
  day?: string;
  month?: string;
  value: number;
}

export interface Emission {
  id: string;
  category: EmissionCategory;
  activity: string;
  value: number;
  unit: string;
  date: Date;
  impact: number;
  points: number;
}

export interface CarbonActivity {
  id: string;
  userId: string;
  category: ActivityCategory;
  description: string;
  emissionKg: number;
  date: string;
  createdAt: string;
}

export interface CarbonSummary {
  totalEmissionKg: number;
  weeklyTrend: { date: string; emissionKg: number }[];
  categoryBreakdown: { category: ActivityCategory; emissionKg: number }[];
}

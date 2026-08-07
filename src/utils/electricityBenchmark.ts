import { IMPACT_FACTORS } from "@/config/impact-factors";
import { SUPPORTING_ECOPOINT_SOURCES } from "@/config/eco-points";

export interface HouseholdProfile {
  members: 1 | 2 | 3 | 4 | 5 | 6;
  daya: 450 | 900 | 1300 | 2200 | 3500 | 4400 | 5500;
  type: "apartment" | "rumah_kecil" | "rumah_sedang" | "rumah_besar";
}

/**
 * ILLUSTRATIVE reference benchmark (kWh / month) by household size and PLN
 * power class. These values were set by the team for the prototype and are
 * NOT official statistics; replace with published PLN/BPS consumption data
 * before drawing conclusions.
 */
export const BENCHMARK_DATA: Record<string, number> = {
  "1_450": 50,
  "1_900": 80,
  "2_900": 110,
  "2_1300": 140,
  "3_1300": 170,
  "3_2200": 220,
  "4_1300": 200,
  "4_2200": 260,
  "4_3500": 340,
  "5_2200": 300,
  "5_3500": 400,
  default: 180,
};

export interface BenchmarkResult {
  yourUsage: number;
  averageUsage: number;
  difference: number;
  percentDiff: number;
  status: "sangat_hemat" | "hemat" | "normal" | "boros" | "sangat_boros";
  statusLabel: string;
  statusColor: string;
  statusBg: string;
  co2Impact: number;
  ecoPointsEarned: number;
  message: string;
  tips: string[];
}

export function analyzePowerUsage(
  usage: number,
  profile: HouseholdProfile
): BenchmarkResult {
  const key = `${profile.members}_${profile.daya}`;
  const average = BENCHMARK_DATA[key] ?? BENCHMARK_DATA["default"];

  const diff = usage - average;
  const percentDiff = (diff / average) * 100;

  let status: BenchmarkResult["status"];
  let statusLabel: string;
  let statusColor: string;
  let statusBg: string;
  let ecoPointsEarned: number;
  let tips: string[];

  if (percentDiff <= -20) {
    status = "sangat_hemat";
    statusLabel = "Very efficient";
    statusColor = "#10B981";
    statusBg = "linear-gradient(135deg,#064e3b,#065f46)";
    ecoPointsEarned = SUPPORTING_ECOPOINT_SOURCES.ELECTRICITY_VERY_EFFICIENT.amount;
    tips = [
      "Excellent. You are an energy-saving role model for your neighbourhood.",
      "Share your tips in the Community Action Network.",
      "Keep it up: consistent savings add up every month.",
    ];
  } else if (percentDiff <= -5) {
    status = "hemat";
    statusLabel = "Below reference, efficient";
    statusColor = "#7AC74F";
    statusBg = "linear-gradient(135deg,#14532d,#166534)";
    ecoPointsEarned = SUPPORTING_ECOPOINT_SOURCES.ELECTRICITY_EFFICIENT.amount;
    tips = [
      "Keep up your good habits.",
      "Try to save a further 10% next month.",
      "Switch off lights in empty rooms to save even more.",
    ];
  } else if (percentDiff <= 10) {
    status = "normal";
    statusLabel = "Around reference";
    statusColor = "#F59E0B";
    statusBg = "linear-gradient(135deg,#78350f,#92400e)";
    ecoPointsEarned = 0;
    tips = [
      "Your usage is close to the reference value.",
      "Switch the air conditioner off when a room is empty.",
      "Replacing old bulbs with LEDs lowers lighting consumption.",
    ];
  } else if (percentDiff <= 30) {
    status = "boros";
    statusLabel = "Above reference, worth a closer look";
    statusColor = "#F97316";
    statusBg = "linear-gradient(135deg,#7c2d12,#9a3412)";
    ecoPointsEarned = 0;
    tips = [
      "Check for devices left on standby all day.",
      "Air conditioning is often the largest load, so set it between 24 and 26 °C.",
      "Use timers for water heaters and pumps.",
    ];
  } else {
    status = "sangat_boros";
    statusLabel = "Well above reference";
    statusColor = "#EF4444";
    statusBg = "linear-gradient(135deg,#7f1d1d,#991b1b)";
    ecoPointsEarned = 0;
    tips = [
      "Review which appliances run the longest each day.",
      "Consider replacing an old fridge or AC with an efficient model.",
      "Have your wiring checked for leakage current.",
    ];
  }

  const co2Impact = Math.round(diff * IMPACT_FACTORS.gridElectricity.value * 100) / 100;
  const absPct = Math.abs(percentDiff).toFixed(1);

  return {
    yourUsage: usage,
    averageUsage: average,
    difference: Math.round(diff),
    percentDiff: Math.round(percentDiff * 10) / 10,
    status,
    statusLabel,
    statusColor,
    statusBg,
    co2Impact,
    ecoPointsEarned,
    message:
      diff < 0
        ? `You used ${Math.abs(Math.round(diff))} kWh (${absPct}%) less than the reference value.`
        : `You used ${Math.round(diff)} kWh (${absPct}%) more than the reference value.`,
    tips,
  };
}

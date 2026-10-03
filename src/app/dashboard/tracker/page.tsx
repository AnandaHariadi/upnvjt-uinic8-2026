import type { Metadata } from "next";
import TrackerPageClient from "./TrackerPageClient";

export const metadata: Metadata = {
  title: "Personal Environmental Impact Tracker | PACUL",
  description: "Estimate your personal footprint from transport, food, waste and electricity, including Electricity Bill OCR.",
};

export default function TrackerPage() {
  return <TrackerPageClient />;
}

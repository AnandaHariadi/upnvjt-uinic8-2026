import type { Metadata } from "next";
import StepTrackerClient from "./StepTrackerClient";

export const metadata: Metadata = {
  title: "Pelacak Langkah Kaki | PACUL",
  description: "Pantau langkah kaki Anda dan ketahui estimasi emisi karbon yang berhasil dihindari dari mobilitas ramah lingkungan.",
};

export default function StepTrackerPage() {
  return <StepTrackerClient />;
}

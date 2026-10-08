import type { Metadata } from "next";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import {
  Hero,
  Problem,
  BuiltForSurabaya,
  FinalCta,
} from "@/components/features/landing/LandingSections";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description,
};

export default function HomePage() {
  return (
    <LayoutWrapper>
      <Hero />
      <Problem />
      <BuiltForSurabaya />
      <FinalCta />
    </LayoutWrapper>
  );
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import { Providers } from "@/components/common/providers";
import { PWAInstallBanner } from "@/components/common/PWAInstallBanner";
import "@/styles/globals.css";
import { competitionConfig, siteConfig, teamConfig } from "@/config/site";

const plusJakartaSans = localFont({
  src: [
    {
      path: "../../public/fonts/PlusJakartaSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/PlusJakartaSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/PlusJakartaSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/PlusJakartaSans-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/PlusJakartaSans-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
  variable: "--font-jakarta",
  display: "swap",
});

const siteUrl = (() => {
  const customUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (customUrl) {
    return customUrl.startsWith("http://") || customUrl.startsWith("https://")
      ? customUrl
      : `https://${customUrl}`;
  }
  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (vercelUrl) {
    return `https://${vercelUrl}`;
  }
  return "http://localhost:3000";
})();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteConfig.title, template: "%s" },
  description: siteConfig.description,
  applicationName: "PACUL",
  authors: teamConfig.members.map((name) => ({ name })),
  keywords: ["PACUL", "Surabaya", "green action", "EcoPoints", "UMKM", "sustainability", competitionConfig.name],
  openGraph: {
    type: "website",
    siteName: "PACUL",
    title: siteConfig.title,
    description: siteConfig.description,
    locale: "en_US",
    images: [{ url: "/icons/icon-512x512.png", width: 512, height: 512, alt: "PACUL logo" }],
  },
  twitter: { card: "summary", title: siteConfig.title, description: siteConfig.description },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, statusBarStyle: "default", title: "PACUL" },
};

export const viewport = {
  themeColor: "#2D5F3F",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning className={`${plusJakartaSans.variable} font-sans`}>
      <body className={`${plusJakartaSans.className} font-sans antialiased`}>
        <Providers>{children}</Providers>
        <PWAInstallBanner />
      </body>
    </html>
  );
}

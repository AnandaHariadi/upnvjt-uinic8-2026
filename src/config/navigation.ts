import {
  LayoutDashboard,
  ShieldCheck,
  Gift,
  Trash2,
  Users,
  User,
} from "lucide-react";

/** Dashboard navigation: primary features first, supporting features after. */
export const DASHBOARD_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, exact: true, group: "primary" },
  { href: "/dashboard/eco-action", label: "Verifikasi Aksi", icon: ShieldCheck, exact: false, group: "primary" },
  { href: "/dashboard/marketplace", label: "Pusat Hadiah & Prestasi", icon: Gift, exact: false, group: "primary" },
  { href: "/dashboard/laporan-sampah", label: "Laporan Sampah", icon: Trash2, exact: false, group: "primary" },
  { href: "/dashboard/collaboration", label: "Jaringan Komunitas", icon: Users, exact: false, group: "more" },
  { href: "/dashboard/profile", label: "Profil", icon: User, exact: false, group: "more" },
] as const;

export const PUBLIC_NAV = [
  { href: "/#features", label: "Inovasi Fitur" },
  { href: "/#surabaya", label: "Kearifan Lokal" },
  { href: "/#gateway", label: "Akses Demo" },
] as const;

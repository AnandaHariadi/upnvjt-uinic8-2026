"use client";

import React from "react";

interface Badge3DProps {
  id: string;
  earned?: boolean;
  size?: number;
  className?: string;
}

/**
 * 3D Claymorphic & Skeuomorphic Badge Emblems for PACUL Surabaya.
 * Modeled with dimensional rims, specular gloss highlights, golden laurels, and rich depth.
 */
export default function Badge3DIcon({ id, earned = false, size = 68, className = "" }: Badge3DProps) {
  const uid = React.useId().replace(/:/g, "");

  if (!earned) {
    // 3D Tactile Slate Stone Medallion with subtle embossed silhouette and 3D lock
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 84 84"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.14)] ${className}`}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id={`locked_body_${uid}`} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#F1F5F9" />
            <stop offset="60%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#94A3B8" />
          </radialGradient>
          <linearGradient id={`locked_bevel_${uid}`} x1="0" y1="0" x2="84" y2="84">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#CBD5E1" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
          <linearGradient id={`lock_metal_${uid}`} x1="0" y1="0" x2="30" y2="30">
            <stop offset="0%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
        </defs>

        {/* Outer 3D Bevel Ring */}
        <circle cx="42" cy="40" r="38" fill={`url(#locked_bevel_${uid})`} />
        {/* Inner Clay Body */}
        <circle cx="42" cy="40" r="32" fill={`url(#locked_body_${uid})`} />
        {/* Embossed Inner Groove */}
        <circle cx="42" cy="40" r="27" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.6" />

        {/* Soft Specular Gloss Highlight */}
        <ellipse cx="42" cy="24" rx="14" ry="7" fill="white" fillOpacity="0.35" />

        {/* Embossed Silhouette of the Badge Concept */}
        <g opacity="0.25" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {id === "tree_planter" && (
            <path d="M42 24L32 38H37L30 48H54L47 38H52L42 24ZM42 48V56" />
          )}
          {id === "green_commuter" && (
            <>
              <circle cx="32" cy="44" r="7" />
              <circle cx="52" cy="44" r="7" />
              <path d="M32 44L40 32H46L52 44M40 32L36 28M46 32L40 44" />
            </>
          )}
          {id === "watt_saver" && (
            <path d="M44 24L34 38H44L40 54L52 38H42L44 24Z" />
          )}
          {id === "challenge_finisher" && (
            <>
              <circle cx="42" cy="40" r="14" />
              <circle cx="42" cy="40" r="8" />
              <circle cx="42" cy="40" r="2" fill="#475569" />
            </>
          )}
          {id === "community_voice" && (
            <path d="M32 35L48 27V53L32 45H26V35H32ZM48 35C52 37 54 40 54 40C54 40 52 43 48 45" />
          )}
          {id !== "tree_planter" && id !== "green_commuter" && id !== "watt_saver" && id !== "challenge_finisher" && id !== "community_voice" && (
            <circle cx="42" cy="40" r="10" />
          )}
        </g>

        {/* 3D Prominent Lock Badge at Center/Bottom-Right */}
        <g transform="translate(42, 38)" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.3))">
          <path
            d="M8 12V8C8 4.68 10.68 2 14 2C17.32 2 20 4.68 20 8V12"
            stroke="#475569"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <rect x="4" y="11" width="20" height="15" rx="4" fill={`url(#lock_metal_${uid})`} />
          <circle cx="14" cy="17" r="1.8" fill="#F8FAFC" />
          <path d="M13 18H15L15.3 22H12.7L13 18Z" fill="#F8FAFC" />
        </g>
      </svg>
    );
  }

  // 3D Ornamented Earned Medallions
  switch (id) {
    case "first_step": // Langkah Awal - Golden & Emerald Sprout Trophy
      return (
        <svg width={size} height={size} viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
          <defs>
            <radialGradient id={`sprout_glow_${uid}`} cx="35%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="55%" stopColor="#15803D" />
              <stop offset="100%" stopColor="#064E3B" />
            </radialGradient>
            <linearGradient id={`gold_rim_${uid}`} x1="0" y1="0" x2="84" y2="84">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="35%" stopColor="#FACC15" />
              <stop offset="70%" stopColor="#CA8A04" />
              <stop offset="100%" stopColor="#854D0E" />
            </linearGradient>
            <linearGradient id={`gold_leaf_${uid}`} x1="0" y1="0" x2="0" y2="30">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="100%" stopColor="#EAB308" />
            </linearGradient>
          </defs>
          {/* 3D Laurel Wreath Ornament */}
          <path d="M12 48C9 36 14 24 24 16M72 48C75 36 70 24 60 16" stroke={`url(#gold_rim_${uid})`} strokeWidth="3" strokeLinecap="round" />
          <circle cx="13" cy="38" r="3.5" fill={`url(#gold_leaf_${uid})`} />
          <circle cx="18" cy="27" r="3.5" fill={`url(#gold_leaf_${uid})`} />
          <circle cx="27" cy="18" r="3.5" fill={`url(#gold_leaf_${uid})`} />
          <circle cx="71" cy="38" r="3.5" fill={`url(#gold_leaf_${uid})`} />
          <circle cx="66" cy="27" r="3.5" fill={`url(#gold_leaf_${uid})`} />
          <circle cx="57" cy="18" r="3.5" fill={`url(#gold_leaf_${uid})`} />

          {/* 3D Medal Base Ribbon */}
          <path d="M30 68L42 78L54 68H30Z" fill="#B45309" />
          <path d="M26 66L42 80L58 66L52 64L42 72L32 64L26 66Z" fill="#F59E0B" />

          {/* Outer Gold Medallion Rim with 3D drop shadow */}
          <circle cx="42" cy="40" r="30" fill={`url(#gold_rim_${uid})`} filter="drop-shadow(0 6px 10px rgba(0,0,0,0.22))" />
          <circle cx="42" cy="40" r="24" fill={`url(#sprout_glow_${uid})`} />
          <ellipse cx="42" cy="24" rx="14" ry="7" fill="white" fillOpacity="0.32" />

          {/* 3D Sprout Icon */}
          <path d="M42 52V38M42 38C42 32 35 30 31 34C31 40 37 42 42 38ZM42 38C42 30 50 28 54 33C54 39 47 41 42 38Z" stroke="#FEF08A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case "waste_warrior": // Pejuang Pilah Sampah - 3D Emerald Recycling Shield Medal
      return (
        <svg width={size} height={size} viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
          <defs>
            <radialGradient id={`recycle_glow_${uid}`} cx="35%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="60%" stopColor="#059669" />
              <stop offset="100%" stopColor="#064E3B" />
            </radialGradient>
            <linearGradient id={`gold_wreath_${uid}`} x1="0" y1="0" x2="84" y2="84">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#A16207" />
            </linearGradient>
          </defs>
          {/* Ornamental Star Burst */}
          <path d="M42 6L45 14L53 11L49 19L57 21L50 26L56 31L48 33L50 41L42 36L34 41L36 33L28 31L34 26L27 21L35 19L31 11L39 14L42 6Z" fill={`url(#gold_wreath_${uid})`} opacity="0.3" />

          {/* 3D Gold Ribbon Tails */}
          <path d="M26 62L16 78L32 72L36 64" fill="#B45309" />
          <path d="M58 62L68 78L52 72L48 64" fill="#CA8A04" />

          {/* Medallion Rim with 3D Depth */}
          <circle cx="42" cy="40" r="30" fill={`url(#gold_wreath_${uid})`} filter="drop-shadow(0 6px 10px rgba(0,0,0,0.25))" />
          <circle cx="42" cy="40" r="24" fill={`url(#recycle_glow_${uid})`} />
          <ellipse cx="42" cy="24" rx="13" ry="6" fill="white" fillOpacity="0.35" />

          {/* 3D Embossed Recycle Triangle */}
          <g transform="translate(26, 25)">
            <path d="M16 6L21 11M21 11H14M21 11V6" stroke="#FEF08A" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M26 23L23 29M23 29L19 24M23 29L27 26" stroke="#FEF08A" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 21L6 26M6 26L12 26M6 26L8 20" stroke="#FEF08A" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="16" cy="16" r="3" fill="#FEF08A" />
          </g>
        </svg>
      );

    case "jelantah_hero": // Pahlawan Jelantah - 3D Golden Droplet Trophy
      return (
        <svg width={size} height={size} viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
          <defs>
            <radialGradient id={`oil_amber_${uid}`} cx="35%" cy="30%" r="70%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="45%" stopColor="#F59E0B" />
              <stop offset="85%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </radialGradient>
            <linearGradient id={`pedestal_metal_${uid}`} x1="0" y1="0" x2="84" y2="0">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="50%" stopColor="#1E293B" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
            <linearGradient id={`gold_trophy_${uid}`} x1="0" y1="0" x2="84" y2="84">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="40%" stopColor="#FACC15" />
              <stop offset="80%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>

          {/* Laurel Arch */}
          <path d="M14 50C10 38 14 22 28 14M70 50C74 38 70 22 56 14" stroke={`url(#gold_trophy_${uid})`} strokeWidth="3" strokeLinecap="round" />
          <circle cx="16" cy="40" r="3" fill="#FBBF24" />
          <circle cx="21" cy="28" r="3" fill="#FBBF24" />
          <circle cx="68" cy="40" r="3" fill="#FBBF24" />
          <circle cx="63" cy="28" r="3" fill="#FBBF24" />

          {/* 3D Round Golden Medallion */}
          <circle cx="42" cy="38" r="28" fill={`url(#gold_trophy_${uid})`} filter="drop-shadow(0 6px 10px rgba(0,0,0,0.25))" />
          <circle cx="42" cy="38" r="22" fill={`url(#oil_amber_${uid})`} />
          <ellipse cx="42" cy="24" rx="12" ry="5" fill="white" fillOpacity="0.4" />

          {/* 3D Glossy Liquid Droplet */}
          <path
            d="M42 24C42 24 33 34 33 42C33 47 37 51 42 51C47 51 51 47 51 42C51 34 42 24 42 24Z"
            fill="#FEF08A"
            filter="drop-shadow(0 2px 4px rgba(180,83,9,0.4))"
          />
          <ellipse cx="38" cy="40" rx="3" ry="5" fill="white" fillOpacity="0.6" transform="rotate(-20 38 40)" />

          {/* Base Pedestal */}
          <path d="M28 66L32 62H52L56 66H28Z" fill="#CA8A04" />
          <rect x="24" y="66" width="36" height="8" rx="3" fill={`url(#pedestal_metal_${uid})`} />
          <rect x="30" y="68" width="24" height="4" rx="1" fill="#FDE047" opacity="0.8" />
        </svg>
      );

    default: // 3D Medal for other badges
      return (
        <svg width={size} height={size} viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
          <defs>
            <radialGradient id={`gen_glow_${uid}`} cx="35%" cy="25%" r="75%">
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="60%" stopColor="#15803D" />
              <stop offset="100%" stopColor="#064E3B" />
            </radialGradient>
            <linearGradient id={`gen_gold_${uid}`} x1="0" y1="0" x2="84" y2="84">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#854D0E" />
            </linearGradient>
          </defs>
          <circle cx="42" cy="40" r="30" fill={`url(#gen_gold_${uid})`} filter="drop-shadow(0 6px 10px rgba(0,0,0,0.22))" />
          <circle cx="42" cy="40" r="24" fill={`url(#gen_glow_${uid})`} />
          <ellipse cx="42" cy="24" rx="13" ry="6" fill="white" fillOpacity="0.35" />
          <path d="M42 28L45 35L53 36L47 41L49 48L42 44L35 48L37 41L31 36L39 35L42 28Z" fill="#FEF08A" />
        </svg>
      );
  }
}

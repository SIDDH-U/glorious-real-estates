"use client";

import React, { useState } from "react";

interface PartnerLogo {
  id: string;
  name: string;
  category: string;
  location: string;
  symbol: React.ReactNode;
}

// ROW 1: Premier Architecture & Property Development Firms
const ROW_1_PARTNERS: PartnerLogo[] = [
  {
    id: "foster",
    name: "Foster + Partners",
    category: "Architecture & Design",
    location: "London • New York",
    symbol: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <path d="M16 3L3 29h26L16 3zm0 6.5l8.5 16.5H7.5L16 9.5z" fill="currentColor" />
        <circle cx="16" cy="19" r="2.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "brookfield",
    name: "Brookfield Properties",
    category: "Global Asset Development",
    location: "New York • Toronto",
    symbol: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="10" height="10" rx="2" fill="currentColor" />
        <rect x="18" y="4" width="10" height="10" rx="2" fill="currentColor" opacity="0.5" />
        <rect x="4" y="18" width="10" height="10" rx="2" fill="currentColor" opacity="0.5" />
        <rect x="18" y="18" width="10" height="10" rx="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "zaha",
    name: "Zaha Hadid Architects",
    category: "Fluid Architecture",
    location: "London • Dubai",
    symbol: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <path d="M5 24h22c-6 0-11-5-11-11s-5-11-11-11v22z" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "tishman",
    name: "Tishman Speyer",
    category: "Iconic Real Estate",
    location: "Rockefeller Center • NY",
    symbol: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <path d="M16 2l6 11h-12l6-11zm-8 12l5 15h-10l5-15zm16 0l5 15h-10l5-15z" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "big",
    name: "Bjarke Ingels Group",
    category: "BIG Architecture",
    location: "Copenhagen • New York",
    symbol: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <polygon points="16,3 29,10.5 29,21.5 16,29 3,21.5 3,10.5" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="16" cy="16" r="4.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "related",
    name: "Related Companies",
    category: "Hudson Yards • Development",
    location: "New York • Miami",
    symbol: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="21" cy="21" r="7" stroke="currentColor" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    id: "snohetta",
    name: "Snøhetta",
    category: "Architecture & Landscape",
    location: "Oslo • New York",
    symbol: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <polygon points="5,26 16,6 27,26" stroke="currentColor" strokeWidth="2.5" fill="none" />
        <line x1="9" y1="20" x2="23" y2="20" stroke="currentColor" strokeWidth="2.5" />
      </svg>
    ),
  },
  {
    id: "gensler",
    name: "Gensler",
    category: "Global Design & Masterplanning",
    location: "San Francisco • London",
    symbol: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <path d="M16 4a12 12 0 1 0 12 12h-12V4z" fill="currentColor" />
      </svg>
    ),
  },
];

// ROW 2: Private Wealth Lenders, Premier Real Estate Portals & Awards
const ROW_2_PARTNERS: PartnerLogo[] = [
  {
    id: "jpmorgan",
    name: "J.P. Morgan Private Bank",
    category: "Estate Financing & Capital",
    location: "Global Wealth Management",
    symbol: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <rect x="4" y="4" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2.2" />
        <path d="M9 10h14v2.5H9zm0 5h14v2.5H9zm0 5h8v2.5H9z" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "sothebys",
    name: "Sotheby's Intl Realty",
    category: "Heritage Luxury Estates",
    location: "Mayfair • New York",
    symbol: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2" />
        <path d="M11 19c0 2 2.5 3.5 5 3.5s5-1.5 5-3.5c0-4-10-1.5-10-5.5 0-2 2.5-3.5 5-3.5s5 1.5 5 3.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "archdigest",
    name: "Architectural Digest",
    category: "Design Authority & Media",
    location: "Global Editorial",
    symbol: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <rect x="3" y="6" width="26" height="20" rx="3" stroke="currentColor" strokeWidth="2.2" />
        <line x1="10" y1="6" x2="10" y2="26" stroke="currentColor" strokeWidth="2.2" />
        <line x1="22" y1="6" x2="22" y2="26" stroke="currentColor" strokeWidth="2.2" />
      </svg>
    ),
  },
  {
    id: "goldman",
    name: "Goldman Sachs Real Estate",
    category: "Private Investment Capital",
    location: "New York • Zurich",
    symbol: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <path d="M5 16l11-11 11 11-11 11-11-11z" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="16" cy="16" r="3.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "robbreport",
    name: "Robb Report Luxury",
    category: "Curated Living & Real Estate",
    location: "Beverly Hills • Monaco",
    symbol: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <polygon points="16,3 20,11 29,12 22,18 24,27 16,22 8,27 10,18 3,12 12,11" stroke="currentColor" strokeWidth="2" />
      </svg>
    ),
  },
  {
    id: "ubs",
    name: "UBS Wealth Management",
    category: "Swiss Private Financing",
    location: "Zurich • Singapore",
    symbol: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="9" r="5" stroke="currentColor" strokeWidth="2.2" />
        <path d="M6 27v-3a10 10 0 0 1 20 0v3" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: "christies",
    name: "Christie's Real Estate",
    category: "Masterpiece Properties",
    location: "London • Paris",
    symbol: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <polygon points="16,2 20,10 28,11 22,17 24,25 16,21 8,25 10,17 4,11 12,10" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: "waf",
    name: "World Architecture Festival",
    category: "Global Design Award",
    location: "International Jury",
    symbol: (
      <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
        <circle cx="16" cy="16" r="12" stroke="currentColor" strokeWidth="2.2" />
        <path d="M16 4v24M4 16h24" stroke="currentColor" strokeWidth="2.2" />
      </svg>
    ),
  },
];

// Interactive Logo Card with cursor spotlight and smooth hover transition
function PartnerCard({ partner }: { partner: PartnerLogo }) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group/card relative h-[92px] sm:h-[105px] min-w-[280px] sm:min-w-[330px] rounded-2xl px-6 py-4 flex items-center gap-4 cursor-pointer overflow-hidden transition-all duration-400 ease-out shrink-0 select-none"
      style={{
        background: isHovered
          ? `radial-gradient(220px circle at ${mousePos.x}% ${mousePos.y}%, rgba(229, 197, 150, 0.16), transparent 75%), linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(26, 20, 15, 0.85) 50%, rgba(14, 11, 8, 0.95) 100%)`
          : `linear-gradient(135deg, rgba(255, 255, 255, 0.04) 0%, rgba(20, 16, 12, 0.7) 50%, rgba(12, 9, 7, 0.9) 100%)`,
        border: isHovered
          ? "1px solid rgba(229, 197, 150, 0.7)"
          : "1px solid rgba(229, 197, 150, 0.18)",
        boxShadow: isHovered
          ? "0 18px 45px -10px rgba(0, 0, 0, 0.85), 0 0 25px 2px rgba(203, 160, 90, 0.3)"
          : "0 10px 30px -5px rgba(0, 0, 0, 0.6)",
        transform: isHovered ? "translateY(-5px) scale(1.04)" : "translateY(0) scale(1)",
      }}
    >
      {/* Light shine sweep effect on hover */}
      <div 
        className={`pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 ${
          isHovered ? "translate-x-full" : ""
        }`} 
      />

      {/* Brand Emblem / Icon */}
      <div 
        className="shrink-0 transition-all duration-400"
        style={{
          color: isHovered ? "#e5c596" : "rgba(255, 255, 255, 0.5)",
          filter: isHovered 
            ? "drop-shadow(0 0 14px rgba(229, 197, 150, 0.6)) grayscale(0)" 
            : "grayscale(1) contrast(1.2)",
        }}
      >
        {partner.symbol}
      </div>

      {/* Brand Wordmark & Metadata */}
      <div className="flex flex-col text-left min-w-0">
        <span 
          className="text-sm sm:text-base font-serif font-semibold tracking-[0.08em] transition-colors duration-300 truncate"
          style={{
            color: isHovered ? "#ffffff" : "rgba(255, 255, 255, 0.65)",
          }}
        >
          {partner.name}
        </span>
        <span 
          className="text-[10px] font-mono tracking-[0.18em] uppercase transition-colors duration-300 truncate mt-0.5"
          style={{
            color: isHovered ? "#e5c596" : "rgba(203, 160, 90, 0.55)",
          }}
        >
          {partner.category}
        </span>
        <span className="text-[9px] text-neutral-500 font-light truncate">
          {partner.location}
        </span>
      </div>
    </div>
  );
}

export default function TrustedByCarousel() {
  const row1 = [...ROW_1_PARTNERS, ...ROW_1_PARTNERS];
  const row2 = [...ROW_2_PARTNERS, ...ROW_2_PARTNERS];

  return (
    <section 
      id="trusted-by"
      className="relative w-full pt-14 sm:pt-18 pb-8 sm:pb-10 bg-[#08070d] text-white overflow-hidden select-none border-t border-[#e5c596]/15"
    >
      {/* Ambient Warm Champagne Glows (Sampled from hero lighting, strictly no purple/pink) */}
      <div 
        aria-hidden="true"
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[350px] bg-[#cba05a]/12 rounded-full blur-[140px] pointer-events-none"
      />
      <div 
        aria-hidden="true"
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[550px] h-[350px] bg-[#e5c596]/10 rounded-full blur-[140px] pointer-events-none"
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 flex flex-col items-center mb-10 sm:mb-12 text-center relative z-10">
        {/* Balanced Architectural Badge */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4">
          <div className="w-8 sm:w-14 h-[1px] bg-gradient-to-r from-transparent to-[#cca15c]/50" />
          <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-1.5 rounded-full bg-gradient-to-r from-[#17120e]/95 via-[#241c15]/95 to-[#17120e]/95 border border-[#cca15c]/45 backdrop-blur-xl shadow-[0_0_20px_rgba(204,161,92,0.18)]">
            <span className="text-[#e5c596] text-xs">✦</span>
            <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.26em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#faead2] via-[#e5c596] to-[#cca15c] font-semibold">
              PARTNER ECOSYSTEM
            </span>
          </div>
          <div className="w-8 sm:w-14 h-[1px] bg-gradient-to-l from-transparent to-[#cca15c]/50" />
        </div>
        
        {/* Balanced Section Heading */}
        <h2 className="text-xl sm:text-2xl md:text-3xl font-serif font-normal tracking-tight text-white max-w-2xl leading-[1.25] text-balance">
          Trusted by Leading Developers,{" "}
          <span className="font-display italic text-transparent bg-clip-text bg-gradient-to-r from-[#faead2] via-[#e5c596] to-[#cca15c]">
            Lenders & Global Partners
          </span>
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-neutral-400 font-light max-w-lg text-balance">
          Collaborating with world-class architectural studios and private wealth institutions.
        </p>
      </div>

      {/* Marquees Container with Soft Edge Fade Masks */}
      <div className="relative w-full overflow-hidden pause-on-hover py-2">
        {/* Left Gradient Edge Fade Mask */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-28 sm:w-56 bg-gradient-to-r from-[#08070d] via-[#08070d]/85 to-transparent z-20" />
        {/* Right Gradient Edge Fade Mask */}
        <div className="pointer-events-none absolute inset-y-0 right-0 w-28 sm:w-56 bg-gradient-to-l from-[#08070d] via-[#08070d]/85 to-transparent z-20" />

        {/* ======================================================== */}
        {/* ROW 1: Right -> Left (Architects & Developers)           */}
        {/* ======================================================== */}
        <div className="flex w-full overflow-hidden mb-6 sm:mb-8 group/row">
          <div className="animate-marquee-left flex items-center gap-5 sm:gap-8 group-hover/row:[animation-play-state:paused]">
            {row1.map((partner, idx) => (
              <PartnerCard key={`row1-${partner.id}-${idx}`} partner={partner} />
            ))}
          </div>
        </div>

        {/* ======================================================== */}
        {/* ROW 2: Left -> Right (Banks, Wealth, Media & Awards)     */}
        {/* ======================================================== */}
        <div className="flex w-full overflow-hidden group/row">
          <div className="animate-marquee-right flex items-center gap-5 sm:gap-8 group-hover/row:[animation-play-state:paused]">
            {row2.map((partner, idx) => (
              <PartnerCard key={`row2-${partner.id}-${idx}`} partner={partner} />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

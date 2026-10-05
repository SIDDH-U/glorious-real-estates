"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

export interface PropertyItem {
  id: string;
  name: string;
  location: string;
  specs: string;
  price: string;
  description: string;
  image: string;
  floorPlan?: string;
  designer?: string;
}

export const INDIAN_PROPERTIES: PropertyItem[] = [
  {
    id: "hill-villa",
    name: "Modern Hillside Villa",
    location: "Lonavala, Maharashtra",
    specs: "4 BHK · 6,200 sq ft",
    price: "₹14.5 Cr",
    description: "Cantilevered glass living framed by misty Sahyadri hills and twilight skies.",
    image: "/images/properties/hill-villa.jpg",
    floorPlan: "/images/properties/floor-plan.png",
    designer: "Studio Kappe & Partners",
  },
  {
    id: "coastal-villa",
    name: "Coastal Tropical Retreat",
    location: "South Goa",
    specs: "5 BHK · 5,800 sq ft",
    price: "₹12.8 Cr",
    description: "Laterite, teak and a courtyard pool, steps from the sea.",
    image: "/images/properties/coastal-villa.jpg",
    floorPlan: "/images/properties/floor-plan.png",
    designer: "Malik Architectural Design",
  },
  {
    id: "mumbai-tower",
    name: "Sky Residences",
    location: "Mumbai",
    specs: "4 BHK · 3,400 sq ft",
    price: "₹28 Cr",
    description: "Sea-facing sky homes with garden balconies and a rooftop infinity pool.",
    image: "/images/properties/mumbai-tower.jpg",
    floorPlan: "/images/properties/floor-plan.png",
    designer: "Hafeez Contractor Studio",
  },
  {
    id: "penthouse",
    name: "Urban Penthouse",
    location: "Bengaluru",
    specs: "4 BHK · 4,100 sq ft",
    price: "₹9.6 Cr",
    description: "Double-height living with brass, walnut and jaali details above the city.",
    image: "/images/properties/penthouse-interior.jpg",
    floorPlan: "/images/properties/floor-plan.png",
    designer: "Khosla Associates",
  },
  {
    id: "haveli-jaipur",
    name: "Heritage Haveli Modern",
    location: "Jaipur, Rajasthan",
    specs: "6 BHK · 7,000 sq ft",
    price: "₹11.2 Cr",
    description: "Sandstone, jaali and a courtyard water feature, reimagined for modern family living.",
    image: "/images/properties/haveli-jaipur.jpg",
    floorPlan: "/images/properties/floor-plan.png",
    designer: "Jaipur Heritage Atelier",
  },
];

const ROOM_PINS = [
  { name: "Living", details: "Double-Height Lounge", top: "63%", left: "43%" },
  { name: "Dining", details: "8-Seat Marble Island", top: "42%", left: "47%" },
  { name: "Kitchen", details: "Chef's Counter & Built-ins", top: "24%", left: "47%" },
  { name: "Master Bedroom", details: "Ensuite with Dressing", top: "29%", left: "78%" },
  { name: "Pooja Room", details: "Vastu Sanctum Alcove", top: "28%", left: "66%" },
  { name: "Balcony", details: "Wrap-Around Sky Deck", top: "82%", left: "38%" },
];

export default function RealEstateBentoGrid() {
  const [activePropertyIndex, setActivePropertyIndex] = useState(0);
  const [activeCenterTab, setActiveCenterTab] = useState<"Overview" | "Floor Plan" | "Gallery">("Overview");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isGalleryHovered, setIsGalleryHovered] = useState(false);
  const [floorPlanFailed, setFloorPlanFailed] = useState(false);
  const [showTourModal, setShowTourModal] = useState(false);
  const [isFloatingWindowOpen, setIsFloatingWindowOpen] = useState(false);
  const [propertyPriceCr, setPropertyPriceCr] = useState(14.5);
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);

  const selectedProperty = INDIAN_PROPERTIES[activePropertyIndex];
  const touchStartXRef = useRef<number>(0);

  // Keyboard shortcut (Escape) to close floating window & inquiry modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFloatingWindowOpen(false);
        setShowTourModal(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Lock body scroll when floating window or inquiry modal is open
  useEffect(() => {
    if (isFloatingWindowOpen || showTourModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFloatingWindowOpen, showTourModal]);

  // Gallery slideshow timer: auto-advance every 4s, pauses on hover or prefers-reduced-motion
  useEffect(() => {
    if (activeCenterTab !== "Gallery" || isGalleryHovered) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setGalleryIndex((prev) => (prev + 1) % INDIAN_PROPERTIES.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [activeCenterTab, isGalleryHovered]);

  const handlePrevGallery = () => {
    setGalleryIndex((prev) => (prev === 0 ? INDIAN_PROPERTIES.length - 1 : prev - 1));
  };

  const handleNextGallery = () => {
    setGalleryIndex((prev) => (prev + 1) % INDIAN_PROPERTIES.length);
  };

  // Touch swipe support for Gallery
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNextGallery();
      else handlePrevGallery();
    }
  };

  // Accessible tab navigation via arrow keys
  const handleTabKeyDown = (e: React.KeyboardEvent, tab: "Overview" | "Floor Plan" | "Gallery") => {
    const tabs: ("Overview" | "Floor Plan" | "Gallery")[] = ["Overview", "Floor Plan", "Gallery"];
    const currentIndex = tabs.indexOf(tab);
    if (e.key === "ArrowRight") {
      setActiveCenterTab(tabs[(currentIndex + 1) % tabs.length]);
    } else if (e.key === "ArrowLeft") {
      setActiveCenterTab(tabs[(currentIndex - 1 + tabs.length) % tabs.length]);
    }
  };

  // Mortgage EMI calculation (₹ in Cr)
  const loanInLakhs = propertyPriceCr * 100 * (1 - downPaymentPercent / 100);
  const monthlyEmiLakhs = (loanInLakhs * (8.6 / 1200) * Math.pow(1 + 8.6 / 1200, 240)) / (Math.pow(1 + 8.6 / 1200, 240) - 1);

  return (
    <section 
      id="projects"
      className="relative w-full pt-6 sm:pt-10 pb-20 sm:pb-28 bg-[#08070d] text-white overflow-hidden select-none"
    >
      {/* Ambient Warm Champagne Glows (Strictly warm gold & amber, no purple/pink) */}
      <div 
        aria-hidden="true"
        className="absolute top-1/4 left-1/3 w-[700px] h-[500px] bg-[#cba05a]/10 rounded-full blur-[170px] pointer-events-none"
      />
      <div 
        aria-hidden="true"
        className="absolute bottom-1/4 right-1/4 w-[600px] h-[450px] bg-[#e5c596]/08 rounded-full blur-[160px] pointer-events-none"
      />

      {/* Main Wide Container: 12 Columns, max-w-[1640px], 94vw on smaller screens */}
      <div className="w-[94vw] max-w-[1640px] mx-auto relative z-10">
        
        {/* ======================================================== */}
        {/* SECTION HEADER                                           */}
        {/* ======================================================== */}
        <div className="flex flex-col items-center text-center mb-10 sm:mb-14">
          {/* Balanced Architectural Badge */}
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <div className="w-8 sm:w-14 h-[1px] bg-gradient-to-r from-transparent to-[#cca15c]/50" />
            <div className="inline-flex items-center gap-2.5 px-4 sm:px-5 py-1.5 rounded-full bg-gradient-to-r from-[#17120e]/95 via-[#241c15]/95 to-[#17120e]/95 border border-[#cca15c]/45 backdrop-blur-xl shadow-[0_0_20px_rgba(204,161,92,0.18)]">
              <span className="text-[#e5c596] text-xs">✦</span>
              <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.26em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#faead2] via-[#e5c596] to-[#cca15c] font-semibold">
                CURATED LUXURY PROPERTY PORTFOLIO
              </span>
            </div>
            <div className="w-8 sm:w-14 h-[1px] bg-gradient-to-l from-transparent to-[#cca15c]/50" />
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-white max-w-4xl leading-[1.08] text-balance">
            Everything You Need to Find{" "}
            <span className="font-display italic text-transparent bg-clip-text bg-gradient-to-r from-[#faead2] via-[#e5c596] to-[#cca15c]">
              Your Dream Home
            </span>
          </h2>

          <p className="mt-4 text-sm sm:text-base text-neutral-400 max-w-2xl font-light leading-relaxed text-balance">
            Explore curated architectural masterpieces, prestigious Indian luxury estates, and bespoke floor plan layouts.
          </p>
        </div>

        {/* ======================================================== */}
        {/* MAIN BENTO BOARD CONTAINER (12-COL ASYMMETRIC GRID)      */}
        {/* ======================================================== */}
        <div className="relative rounded-[32px] sm:rounded-[40px] p-4 sm:p-6 lg:p-8 bg-[#0d0a08]/90 backdrop-blur-2xl border border-[#cca15c]/35 shadow-[0_35px_100px_rgba(0,0,0,0.95),0_0_55px_rgba(204,161,92,0.16),inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden">
          
          {/* Luminous Top-Rim Ambient Beam & Halo */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-3/4 max-w-3xl h-24 bg-[#cca15c]/14 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute top-0 left-1/5 right-1/5 h-[2px] bg-gradient-to-r from-transparent via-[#faead2] to-transparent blur-[0.5px] pointer-events-none" />
          <div className="absolute top-0 left-1/3 right-1/3 h-[1px] bg-gradient-to-r from-transparent via-white/85 to-transparent pointer-events-none" />

          {/* Ambient Radial Fill Lights */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(229,197,150,0.07),transparent_55%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(204,161,92,0.04),transparent_50%)] pointer-events-none" />

          {/* Architectural Corner L-Brackets */}
          <div className="absolute top-3.5 left-3.5 w-5 h-5 border-t-2 border-l-2 border-[#e5c596]/65 rounded-tl-xl pointer-events-none" />
          <div className="absolute top-3.5 right-3.5 w-5 h-5 border-t-2 border-r-2 border-[#e5c596]/65 rounded-tr-xl pointer-events-none" />
          <div className="absolute bottom-3.5 left-3.5 w-5 h-5 border-b-2 border-l-2 border-[#e5c596]/65 rounded-bl-xl pointer-events-none" />
          <div className="absolute bottom-3.5 right-3.5 w-5 h-5 border-b-2 border-r-2 border-[#e5c596]/65 rounded-br-xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-stretch relative z-10">
            
            {/* ======================================================== */}
            {/* COLUMN 1: LEFT COLUMN (GLORIOUS BRAND, VILLA, CTA)      */}
            {/* ======================================================== */}
            <div className="lg:col-span-3 flex flex-col justify-between gap-5">
              
              {/* Top Brand / Live Engine Header Card (Protected against scaling/overflow) */}
              <div className="flex items-center justify-between gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3.5 rounded-[20px] bg-gradient-to-r from-white/[0.05] via-white/[0.02] to-white/[0.04] border border-[#e5c596]/25 backdrop-blur-md min-w-0 overflow-hidden shadow-sm">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 shrink">
                  <span className="font-serif font-bold tracking-[0.14em] sm:tracking-[0.18em] text-sm sm:text-base uppercase text-white truncate min-w-0">
                    GLORIOUS
                  </span>
                  <span className="text-[8.5px] sm:text-[9px] font-mono px-1.5 sm:px-2 py-0.5 rounded-md bg-[#e5c596]/15 text-[#faead2] border border-[#e5c596]/30 uppercase tracking-wider font-semibold shrink-0">
                    ESTATES
                  </span>
                </div>
                <div className="flex items-center gap-1 sm:gap-1.5 text-neutral-400 text-xs shrink-0 ml-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                  <span className="text-[9px] sm:text-[10px] font-mono tracking-wider text-emerald-300 font-medium whitespace-nowrap">
                    5 CURATED
                  </span>
                </div>
              </div>

              {/* Middle Card: Slot A (Coastal Tropical Retreat • South Goa) */}
              <div className="relative rounded-[26px] overflow-hidden min-h-[300px] sm:min-h-[330px] lg:min-h-[320px] border border-[#e5c596]/20 group shadow-lg flex flex-col justify-between p-6">
                <Image
                  src={INDIAN_PROPERTIES[1].image}
                  alt={INDIAN_PROPERTIES[1].name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 25vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-[0.92]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/40 pointer-events-none" />

                {/* Top Badge */}
                <div className="relative z-10 flex items-center justify-between">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#e5c596]/35 shadow-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    <span className="text-[10px] font-mono tracking-wider uppercase text-white font-medium">
                      IMMERSIVE ESTATE TOUR
                    </span>
                  </div>
                </div>

                {/* Bottom Overlay Info */}
                <div className="relative z-10">
                  <h3 className="text-xl font-serif font-medium text-white drop-shadow-md">
                    {INDIAN_PROPERTIES[1].name}
                  </h3>
                  <p className="text-xs text-neutral-300 font-light mt-0.5">
                    {INDIAN_PROPERTIES[1].location} • {INDIAN_PROPERTIES[1].specs}
                  </p>
                  <p className="text-[11px] text-neutral-400 italic mt-1 line-clamp-1">
                    "{INDIAN_PROPERTIES[1].description}"
                  </p>
                  <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-white/15">
                    <span className="text-sm font-mono font-bold text-[#e5c596]">
                      {INDIAN_PROPERTIES[1].price}
                    </span>
                    <button 
                      onClick={() => {
                        setActivePropertyIndex(1);
                        setActiveCenterTab("Overview");
                        setShowTourModal(true);
                      }}
                      className="text-xs font-medium text-white hover:text-amber-200 transition-colors flex items-center gap-1.5"
                    >
                      <span>Explore</span>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Card: Luminous Silk-Marble Luxury Card (Elevated Static & Hover Effects) */}
              <div 
                onClick={() => setShowTourModal(true)}
                className="group/white-card relative rounded-[26px] p-5 sm:p-6 bg-gradient-to-br from-[#ffffff] via-[#fcfaf6] to-[#f4ebe1] text-black border border-[#cca15c]/45 shadow-[0_18px_45px_rgba(0,0,0,0.55),0_0_30px_rgba(229,197,150,0.22)] ring-1 ring-inset ring-white/90 overflow-hidden flex flex-col justify-between min-h-[195px] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_28px_65px_rgba(0,0,0,0.7),0_0_45px_rgba(204,161,92,0.45)] hover:border-[#cca15c]/85 cursor-pointer"
              >
                {/* Luminous Top Hairline Gold Light Bar */}
                <div className="absolute top-0 left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-[#cca15c] to-transparent pointer-events-none" />

                {/* Iridescent Light Sweep Shimmer on Hover */}
                <div className="absolute inset-0 -translate-x-full group-hover/white-card:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" />

                {/* Subtle Luxury Geometric Watermark in Background */}
                <svg 
                  className="absolute -bottom-6 -right-6 w-32 h-32 text-[#cca15c]/10 pointer-events-none transition-transform duration-700 group-hover/white-card:rotate-12 group-hover/white-card:scale-110" 
                  viewBox="0 0 100 100" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="1.2"
                >
                  <circle cx="50" cy="50" r="40" strokeDasharray="3 3" />
                  <circle cx="50" cy="50" r="28" />
                  <polygon points="50,15 85,50 50,85 15,50" />
                </svg>

                <div className="relative z-10">
                  {/* Private Catalog Gold Pill */}
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#18130e]/06 border border-[#cca15c]/40 mb-2.5 backdrop-blur-sm">
                    <span className="text-[#a87a32] text-[9px] animate-pulse">✦</span>
                    <span className="text-[9px] font-mono tracking-[0.22em] uppercase text-[#735223] font-bold">
                      PRIVATE CATALOG
                    </span>
                  </div>

                  <h4 className="text-xl sm:text-2xl font-serif font-bold text-[#14110d] leading-tight group-hover/white-card:text-black transition-colors">
                    Find Your Signature Space
                  </h4>
                  <p className="mt-1.5 text-xs sm:text-sm text-neutral-700 font-normal leading-relaxed">
                    Explore curated Indian luxury residences designed with timeless architectural movements.
                  </p>
                </div>

                <div className="relative z-10 mt-4 flex items-center justify-between pt-3 border-t border-[#cca15c]/25">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#cca15c]" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#664b22] font-semibold">
                      5 SIGNATURE ESTATES
                    </span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowTourModal(true);
                    }}
                    aria-label="View curated signature estates"
                    className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#15110d] to-[#2b221a] text-[#faead2] border border-[#cca15c]/40 flex items-center justify-center transition-all duration-300 group-hover/white-card:scale-110 group-hover/white-card:shadow-[0_0_20px_rgba(204,161,92,0.6)] group-hover/white-card:border-[#cca15c]"
                  >
                    <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover/white-card:translate-x-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              </div>

            </div>

            {/* ======================================================== */}
            {/* COLUMN 2: CENTER COLUMN (MAIN STAGE WITH TABS)           */}
            {/* ======================================================== */}
            <div className="lg:col-span-6 relative rounded-[30px] overflow-hidden min-h-[580px] sm:min-h-[640px] lg:min-h-[680px] border border-[#e5c596]/25 shadow-2xl flex flex-col justify-between p-6 sm:p-9 group bg-[#0e0b08]">
              
              {/* Layer 1: OVERVIEW TAB CONTENT */}
              <div 
                className={`absolute inset-0 transition-opacity duration-600 ease-in-out ${
                  activeCenterTab === "Overview" ? "opacity-100 z-[1] pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                <Image
                  src={selectedProperty.image}
                  alt={selectedProperty.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105 brightness-[0.92]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/55 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30 pointer-events-none" />

                {/* Overview Text Overlay */}
                <div className="absolute inset-x-6 sm:inset-x-9 bottom-24 top-28 flex flex-col justify-end pointer-events-none">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-[#e5c596]/30 self-start mb-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#e5c596]" />
                    <span className="text-[10px] font-mono tracking-widest text-[#faead2] uppercase">
                      {selectedProperty.location}
                    </span>
                  </div>
                  <h3 className="font-serif font-medium text-4xl sm:text-5xl lg:text-6xl text-white max-w-xl leading-[1.05] drop-shadow-[0_4px_24px_rgba(0,0,0,0.9)] text-balance">
                    {selectedProperty.name}
                  </h3>
                  <p className="mt-3 text-sm sm:text-base text-neutral-200 font-light max-w-lg drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] leading-relaxed">
                    {selectedProperty.description}
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-xs font-mono text-[#e5c596]">
                    <span>{selectedProperty.specs}</span>
                    <span>•</span>
                    <span className="font-bold text-white">{selectedProperty.price}</span>
                  </div>
                </div>
              </div>

              {/* Layer 2: FLOOR PLAN TAB CONTENT */}
              <div 
                className={`absolute inset-0 transition-opacity duration-600 ease-in-out ${
                  activeCenterTab === "Floor Plan" ? "opacity-100 z-[1] pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                {!floorPlanFailed ? (
                  <Image
                    src={selectedProperty.floorPlan || "/images/properties/floor-plan.png"}
                    alt={`${selectedProperty.name} Floor Plan`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover brightness-[0.88]"
                    onError={() => setFloorPlanFailed(true)}
                  />
                ) : (
                  /* Elegant Architectural SVG Plan in Champagne Gold Lines */
                  <div className="absolute inset-0 bg-[#0e0b08] flex items-center justify-center p-8">
                    <svg
                      viewBox="0 0 800 600"
                      className="w-full h-full max-h-[85%] text-[#e5c596]/85 stroke-current fill-none"
                      strokeWidth="1.6"
                    >
                      <rect x="50" y="40" width="700" height="520" rx="16" strokeWidth="2.5" stroke="#e5c596" />
                      {/* Living Lounge */}
                      <rect x="80" y="270" width="350" height="250" strokeDasharray="4 2" />
                      <text x="255" y="400" fill="#e5c596" stroke="none" fontSize="13" textAnchor="middle" letterSpacing="0.1em" fontFamily="sans-serif">LIVING</text>
                      {/* Balcony */}
                      <rect x="80" y="525" width="640" height="32" stroke="#cca15c" />
                      <text x="400" y="546" fill="#cca15c" stroke="none" fontSize="11" textAnchor="middle" letterSpacing="0.15em" fontFamily="sans-serif">PANORAMIC BALCONY</text>
                      {/* Dining */}
                      <rect x="230" y="150" width="200" height="110" />
                      <text x="330" y="210" fill="#e5c596" stroke="none" fontSize="13" textAnchor="middle" letterSpacing="0.1em" fontFamily="sans-serif">DINING</text>
                      {/* Kitchen */}
                      <rect x="80" y="55" width="140" height="205" />
                      <text x="150" y="160" fill="#e5c596" stroke="none" fontSize="13" textAnchor="middle" letterSpacing="0.1em" fontFamily="sans-serif">KITCHEN</text>
                      {/* Master Bedroom */}
                      <rect x="440" y="55" width="280" height="205" />
                      <text x="580" y="160" fill="#e5c596" stroke="none" fontSize="13" textAnchor="middle" letterSpacing="0.1em" fontFamily="sans-serif">MASTER BEDROOM</text>
                      {/* Pooja Room */}
                      <rect x="440" y="270" width="120" height="110" stroke="#f6d59c" />
                      <text x="500" y="330" fill="#f6d59c" stroke="none" fontSize="11" textAnchor="middle" letterSpacing="0.1em" fontFamily="sans-serif">POOJA ROOM</text>
                      {/* Suite 2 */}
                      <rect x="570" y="270" width="150" height="250" />
                      <text x="645" y="400" fill="#e5c596" stroke="none" fontSize="13" textAnchor="middle" letterSpacing="0.1em" fontFamily="sans-serif">GUEST SUITE</text>
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-black/65 pointer-events-none" />

                {/* Floor Plan Header Description */}
                <div className="absolute top-24 left-6 sm:left-9 right-6 sm:right-9 z-10 pointer-events-none">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-[#e5c596]/35 mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span className="text-[10px] font-mono tracking-widest text-[#faead2] uppercase">
                      ARCHITECTURAL FLOOR PLAN
                    </span>
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white drop-shadow-md">
                    Floor Plan
                  </h3>
                  <p className="text-xs text-neutral-300 font-light max-w-md drop-shadow mt-1">
                    Architectural layout featuring open living, dining pavilion, pooja sanctum, and panoramic balcony.
                  </p>
                </div>

                {/* Staggered Glass Room Pins Overlaid on Matching Coordinates */}
                <div className="absolute inset-0 pointer-events-auto">
                  {ROOM_PINS.map((pin, idx) => (
                    <div
                      key={pin.name}
                      style={{ 
                        top: pin.top, 
                        left: pin.left,
                        animationDelay: `${idx * 110 + 150}ms`
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group/pin cursor-pointer transition-all duration-300 hover:scale-110 z-20 animate-pin-in"
                    >
                      <div className="relative flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 hover:bg-black/95 backdrop-blur-md border border-[#e5c596]/55 shadow-xl text-white">
                        <span className="w-2 h-2 rounded-full bg-[#e5c596] animate-pulse" />
                        <span className="text-[10px] sm:text-[11px] font-sans font-medium tracking-wide whitespace-nowrap">
                          {pin.name}
                        </span>
                      </div>

                      {/* Tooltip on Hover */}
                      <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/pin:flex flex-col items-center px-2.5 py-1 rounded-md bg-[#14100c] border border-[#e5c596]/30 text-[9px] font-mono text-neutral-300 whitespace-nowrap shadow-2xl">
                        <span>{pin.details}</span>
                        <div className="w-1.5 h-1.5 bg-[#14100c] border-b border-r border-[#e5c596]/30 rotate-45 -mb-1" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Layer 3: GALLERY TAB CONTENT (AUTO-ADVANCING SLIDESHOW) */}
              <div 
                onMouseEnter={() => setIsGalleryHovered(true)}
                onMouseLeave={() => setIsGalleryHovered(false)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className={`absolute inset-0 transition-opacity duration-600 ease-in-out ${
                  activeCenterTab === "Gallery" ? "opacity-100 z-[1] pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
                }`}
              >
                {INDIAN_PROPERTIES.map((prop, idx) => (
                  <div
                    key={`gal-${prop.id}`}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                      galleryIndex === idx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
                    }`}
                  >
                    <Image
                      src={prop.image}
                      alt={prop.name}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className={`object-cover brightness-[0.92] ${galleryIndex === idx ? "ken-burns" : ""}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/55 pointer-events-none" />
                  </div>
                ))}

                {/* Gallery Slide Caption: (name · location) that updates */}
                <div className="absolute bottom-24 left-6 sm:left-9 right-6 sm:right-9 z-20 pointer-events-none">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-[#e5c596]/30 mb-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#e5c596] uppercase">
                      GALLERY {galleryIndex + 1} OF {INDIAN_PROPERTIES.length}
                    </span>
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-serif font-bold text-white drop-shadow-md">
                    {INDIAN_PROPERTIES[galleryIndex].name}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#faead2] font-mono mt-1 drop-shadow">
                    {INDIAN_PROPERTIES[galleryIndex].name} · {INDIAN_PROPERTIES[galleryIndex].location}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-neutral-300">
                    <span>{INDIAN_PROPERTIES[galleryIndex].specs}</span>
                    <span>•</span>
                    <span className="font-bold text-[#e5c596]">{INDIAN_PROPERTIES[galleryIndex].price}</span>
                  </div>
                </div>

                {/* Prev / Next Glass Controls */}
                <div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
                  <button
                    onClick={handlePrevGallery}
                    aria-label="Previous gallery image"
                    className="pointer-events-auto w-10 h-10 rounded-full bg-black/55 hover:bg-[#e5c596] hover:text-black backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 shadow-xl"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNextGallery}
                    aria-label="Next gallery image"
                    className="pointer-events-auto w-10 h-10 rounded-full bg-black/55 hover:bg-[#e5c596] hover:text-black backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 shadow-xl"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>

                {/* Progress Dots */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                  {INDIAN_PROPERTIES.map((_, idx) => (
                    <button
                      key={`dot-${idx}`}
                      onClick={() => setGalleryIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        galleryIndex === idx ? "w-6 bg-[#e5c596]" : "w-1.5 bg-white/30 hover:bg-white/60"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* TOP FLOATING TABS BAR (ACCESSIBLE TABLIST WITH ANIMATED INDICATOR) */}
              <div className="relative z-30 w-full flex items-center justify-between gap-3">
                {/* Menu / Property filter button */}
                <button 
                  onClick={() => setShowTourModal(true)}
                  aria-label="Filter perspectives"
                  className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all duration-200 shrink-0"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <line x1="4" y1="7" x2="20" y2="7" />
                    <line x1="4" y1="12" x2="16" y2="12" />
                    <line x1="4" y1="17" x2="20" y2="17" />
                  </svg>
                </button>

                {/* Center Navigation Tabs with Animated Sliding Indicator */}
                <div 
                  role="tablist"
                  aria-label="Property View Modes"
                  className="relative flex items-center p-1 rounded-full bg-black/65 backdrop-blur-md border border-[#e5c596]/30 shadow-lg"
                >
                  {/* Animated Tab Indicator Pill */}
                  <div
                    aria-hidden="true"
                    className="absolute top-1 bottom-1 rounded-full bg-[#fbf9f5] transition-all duration-300 ease-out shadow-md pointer-events-none"
                    style={{
                      left: activeCenterTab === "Overview" ? "4px" : activeCenterTab === "Floor Plan" ? "calc(33.333% + 2px)" : "calc(66.666% + 2px)",
                      width: "calc(33.333% - 4px)",
                    }}
                  />

                  {(["Overview", "Floor Plan", "Gallery"] as const).map((tab) => {
                    const isActive = activeCenterTab === tab;
                    return (
                      <button
                        key={tab}
                        role="tab"
                        aria-selected={isActive}
                        tabIndex={isActive ? 0 : -1}
                        onKeyDown={(e) => handleTabKeyDown(e, tab)}
                        onClick={() => setActiveCenterTab(tab)}
                        className={`relative z-10 px-3.5 sm:px-4 py-1.5 rounded-full text-xs transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#e5c596] whitespace-nowrap ${
                          isActive
                            ? "text-black font-bold"
                            : "text-neutral-300 hover:text-white"
                        }`}
                      >
                        {tab}
                        {isActive && (
                          <span className="sr-only"> (active tab)</span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Actions: Fullscreen Floating Window Trigger & Inquire */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsFloatingWindowOpen(true)}
                    title="Expand Residence Showcase"
                    aria-label="Expand residence viewer in floating window"
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/65 hover:bg-[#e5c596] text-[#faead2] hover:text-black backdrop-blur-md border border-[#e5c596]/40 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-md group/fs"
                  >
                    <svg className="w-4 h-4 transition-transform group-hover/fs:scale-110" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={() => setShowTourModal(true)}
                    className="px-4 sm:px-5 py-2 rounded-full bg-black/60 hover:bg-[#e5c596] hover:text-black backdrop-blur-md border border-[#e5c596]/40 text-white text-xs font-semibold tracking-wider uppercase transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    INQUIRE
                  </button>
                </div>
              </div>

              {/* BOTTOM FLOATING GLASS CONTROLS */}
              <div className="relative z-30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 mt-auto">
                
                {/* Left Floating Pill: Designer Credits */}
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/65 backdrop-blur-md border border-[#e5c596]/30 shadow-lg">
                  <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full border-2 border-black bg-gradient-to-tr from-[#cba05a] to-[#faead2] flex items-center justify-center text-[10px] font-bold text-black">
                      SK
                    </div>
                    <div className="w-7 h-7 rounded-full border-2 border-black bg-gradient-to-tr from-[#e5c596] to-white flex items-center justify-center text-[10px] font-bold text-black">
                      MA
                    </div>
                    <div className="w-7 h-7 rounded-full border-2 border-black bg-gradient-to-tr from-amber-600 to-amber-200 flex items-center justify-center text-[10px] font-bold text-black">
                      HC
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-neutral-400 leading-none">
                      Architecture by
                    </span>
                    <span className="text-xs font-sans font-semibold text-white mt-0.5 leading-none">
                      {selectedProperty.designer || "Studio Kappe & Partners"}
                    </span>
                  </div>
                </div>

                {/* Right Floating Pill: "Take 3D Tour" */}
                <button
                  onClick={() => setShowTourModal(true)}
                  className="group/btn inline-flex items-center gap-3 pl-4 pr-1.5 py-1.5 rounded-full bg-white/20 hover:bg-[#e5c596] hover:text-black backdrop-blur-xl border border-white/30 text-white shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  <span className="text-xs font-sans font-medium tracking-wide">
                    Take 3D Tour
                  </span>
                  <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/40 shadow-sm">
                    <Image
                      src={selectedProperty.image}
                      alt={selectedProperty.name}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white fill-current translate-x-0.5" viewBox="0 0 24 24">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                    </div>
                  </div>
                </button>

              </div>

            </div>

            {/* ======================================================== */}
            {/* COLUMN 3: RIGHT COLUMN (INDIAN RESIDENCES LIST)          */}
            {/* Slot B: Evenly stretched rows, swaps center property     */}
            {/* ======================================================== */}
            <div className="lg:col-span-3 flex flex-col justify-between">
              
              <div className="rounded-[26px] p-5 sm:p-7 bg-[#14100c]/90 backdrop-blur-xl border border-[#e5c596]/20 flex flex-col justify-between shadow-xl h-full">
                
                {/* Card Header */}
                <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#e5c596]/15 mb-3">
                  <div>
                    <h4 className="text-base font-serif font-bold tracking-wide text-white">
                      Indian Residences
                    </h4>
                    <p className="text-[11px] text-[#e5c596] font-mono mt-0.5">
                      5 Curated Homes
                    </p>
                  </div>
                  <button 
                    aria-label="Portfolio info"
                    className="w-7 h-7 rounded-full bg-white/[0.05] border border-white/10 hover:border-[#e5c596]/50 flex items-center justify-center text-neutral-400 text-xs transition-colors"
                  >
                    ⓘ
                  </button>
                </div>

                {/* Mobile: Horizontal scroll row of thumbnail chips under the stage */}
                {/* Desktop: Evenly stretched vertical rows (flex-1 / space-between, zero empty gap) */}
                <div className="flex flex-row overflow-x-auto no-scrollbar gap-2.5 pb-2 lg:flex-1 lg:flex-col lg:overflow-visible lg:justify-between lg:pb-0">
                  {INDIAN_PROPERTIES.map((property, idx) => {
                    const isSelected = activePropertyIndex === idx;
                    return (
                      <div
                        key={property.id}
                        onMouseEnter={() => {
                          setActivePropertyIndex(idx);
                        }}
                        onClick={() => {
                          setActivePropertyIndex(idx);
                          setActiveCenterTab("Overview");
                        }}
                        className={`group flex items-center justify-between px-3 sm:px-3.5 py-2.5 sm:py-3 rounded-2xl cursor-pointer transition-all duration-300 border shrink-0 min-w-[210px] lg:min-w-0 lg:w-full ${
                          isSelected
                            ? "bg-[#fbf9f5] text-black font-semibold border-white shadow-xl scale-[1.01] lg:scale-[1.02]"
                            : "hover:bg-white/[0.05] border-transparent text-neutral-300 hover:border-white/10"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Circular Thumbnail Crop (object-fit: cover) */}
                          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/20 shrink-0 shadow-sm">
                            <Image
                              src={property.image}
                              alt={property.name}
                              fill
                              sizes="40px"
                              className="object-cover"
                            />
                          </div>
                          
                          {/* Title & Subtitle */}
                          <div className="flex flex-col text-left min-w-0">
                            <span className={`text-xs font-sans truncate ${isSelected ? "font-bold text-black" : "font-medium text-white group-hover:text-[#faead2]"}`}>
                              {property.name}
                            </span>
                            <span className={`text-[10px] truncate ${isSelected ? "text-neutral-600 font-medium" : "text-neutral-400 font-light"}`}>
                              {property.location}
                            </span>
                            {/* Description hidden by default, shown on hover */}
                            <span className={`text-[9px] truncate transition-opacity duration-200 ${isSelected ? "text-neutral-500 block" : "hidden group-hover:block text-neutral-400"}`}>
                              "{property.description}"
                            </span>
                          </div>
                        </div>

                        {/* Price Tag */}
                        <div className="shrink-0 pl-2 text-right">
                          <span className={`text-[11px] font-mono ${isSelected ? "text-black font-bold" : "text-[#e5c596] font-medium"}`}>
                            {property.price}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explore All Homes Action Button */}
                <div className="mt-4 pt-3 sm:pt-4 border-t border-[#e5c596]/15">
                  <button
                    onClick={() => setShowTourModal(true)}
                    className="w-full py-3 rounded-full bg-[#fbf9f5] hover:bg-[#e5c596] text-black text-xs font-bold tracking-wider uppercase transition-all duration-200 shadow-md text-center flex items-center justify-center gap-2"
                  >
                    <span>Explore all homes</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ======================================================== */}
        {/* ROW 2: SUPPLEMENTARY BENTO MODULES (STATS & FINANCING)   */}
        {/* ======================================================== */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
          
          {/* Stat Card 1: Volume in Indian Cr */}
          <div className="rounded-[24px] p-6 bg-[#120e0a]/85 backdrop-blur-xl border border-[#e5c596]/20 luxury-card-hover flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-mono tracking-widest uppercase">PORTFOLIO VOLUME</span>
              <div className="w-8 h-8 rounded-full bg-[#e5c596]/15 flex items-center justify-center text-[#e5c596]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-serif font-bold text-white leading-none">₹2,400+ Cr</div>
              <p className="text-xs text-neutral-400 font-light mt-1.5">
                Indian ultra-luxury properties transacted across private client portfolios.
              </p>
            </div>
          </div>

          {/* Stat Card 2: Speed on Market */}
          <div className="rounded-[24px] p-6 bg-[#120e0a]/85 backdrop-blur-xl border border-[#e5c596]/20 luxury-card-hover flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-400">
              <span className="text-[11px] font-mono tracking-widest uppercase">AVG. DAYS ON MARKET</span>
              <div className="w-8 h-8 rounded-full bg-[#e5c596]/15 flex items-center justify-center text-[#e5c596]">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-3xl sm:text-4xl font-serif font-bold text-white leading-none">18 Days</div>
              <p className="text-xs text-neutral-400 font-light mt-1.5">
                Average closing cycle for off-market private acquisitions.
              </p>
            </div>
          </div>

          {/* Wide Card / Interactive Mortgage Estimator Teaser (In ₹ Cr & Lakhs) */}
          <div className="md:col-span-1 lg:col-span-2 rounded-[24px] p-6 bg-[#120e0a]/85 backdrop-blur-xl border border-[#e5c596]/20 luxury-card-hover flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#e5c596] font-semibold">
                  INVESTMENT & FINANCING ESTIMATOR
                </span>
                <h5 className="text-lg font-serif font-medium text-white mt-0.5">
                  Private Wealth & Mortgage Intelligence
                </h5>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-neutral-400">ESTIMATED EMI</span>
                <div className="text-xl font-serif font-bold text-[#e5c596]">
                  ₹{monthlyEmiLakhs.toFixed(2)} Lakh/mo
                </div>
              </div>
            </div>

            {/* Slider Controls */}
            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-neutral-300">
                <span>Property Value: <strong className="text-white">₹{propertyPriceCr} Cr</strong></span>
                <span>Down Payment: <strong className="text-white">{downPaymentPercent}% (₹{(propertyPriceCr * downPaymentPercent / 100).toFixed(2)} Cr)</strong></span>
              </div>
              <input
                type="range"
                min="5"
                max="35"
                step="0.5"
                value={propertyPriceCr}
                onChange={(e) => setPropertyPriceCr(Number(e.target.value))}
                className="w-full h-1.5 bg-white/15 rounded-lg appearance-none cursor-pointer accent-[#e5c596]"
              />
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-neutral-400">
                Lending Rate: <strong className="text-white">8.6% Prime Fixed</strong> • Appreciation: <strong className="text-emerald-400">+14.2% YoY</strong>
              </span>
              <button 
                onClick={() => setShowTourModal(true)}
                className="text-[#e5c596] hover:text-white font-medium flex items-center gap-1 transition-colors"
              >
                <span>Inquire With Private Bank</span>
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>

        </div>

        {/* ======================================================== */}
        {/* FLOATING CLIENT TESTIMONIAL BADGE                        */}
        {/* ======================================================== */}
        <div className="mt-12 flex justify-center">
          <div className="inline-flex items-center gap-3.5 px-6 py-3 rounded-full bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-xl border border-[#e5c596]/30 shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#cba05a] to-[#faead2] p-[1.5px] shrink-0">
              <div className="w-full h-full rounded-full bg-[#120e0a] flex items-center justify-center text-xs font-bold text-[#e5c596]">
                RS
              </div>
            </div>

            {/* Testimonial text */}
            <div className="flex items-center gap-3 text-xs">
              <span className="font-semibold text-white">
                Rajesh Singhania
              </span>
              <span className="text-neutral-400 hidden sm:inline">
                Managing Director, Oberoi & Singhania Estates:
              </span>
              <span className="text-neutral-300 italic hidden md:inline">
                "Glorious delivered a seamless, world-class acquisition experience for our prime family estates across Mumbai and Goa."
              </span>
              <div className="flex items-center text-[#e5c596] text-xs">
                ★★★★★
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* EXPANDED RESIDENCE SHOWCASE MODAL                        */}
      {/* ======================================================== */}
      {isFloatingWindowOpen && (
        <div 
          onClick={() => setIsFloatingWindowOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl h-[86vh] max-h-[820px] min-h-[520px] rounded-[28px] sm:rounded-[36px] bg-[#0c0907] border border-[#cca15c]/55 shadow-[0_30px_100px_rgba(0,0,0,0.95),0_0_60px_rgba(204,161,92,0.28),inset_0_1px_1px_rgba(255,255,255,0.15)] overflow-hidden flex flex-col"
          >
            {/* Window Top Titlebar / Chrome */}
            <div className="flex items-center justify-between px-5 sm:px-7 py-3.5 bg-[#14100c]/90 border-b border-[#cca15c]/25 backdrop-blur-md shrink-0">
              
              {/* Left: Window Control Jewels & Residence Index */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setIsFloatingWindowOpen(false)}
                    aria-label="Close window"
                    title="Close"
                    className="w-3 h-3 rounded-full bg-[#e5c596]/30 hover:bg-rose-500 border border-[#e5c596]/50 transition-colors"
                  />
                  <div className="w-3 h-3 rounded-full bg-[#cca15c]/30 border border-[#cca15c]/50" />
                  <div className="w-3 h-3 rounded-full bg-[#faead2]/30 border border-[#faead2]/50" />
                </div>
                <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-white/10">
                  <span className="text-[#cca15c] text-[10px]">✦</span>
                  <span className="text-[10px] font-mono tracking-widest uppercase text-[#faead2] font-semibold">
                    RESIDENCE 0{activePropertyIndex + 1} / 0{INDIAN_PROPERTIES.length}
                  </span>
                </div>
              </div>

              {/* Center: Interactive Tabs */}
              <div className="flex items-center gap-1 p-1 rounded-full bg-black/60 border border-white/10">
                {(["Overview", "Floor Plan", "Gallery"] as const).map((tab) => (
                  <button
                    key={`modal-tab-${tab}`}
                    onClick={() => setActiveCenterTab(tab)}
                    className={`px-3 sm:px-4 py-1 rounded-full text-xs transition-colors duration-200 ${
                      activeCenterTab === tab
                        ? "bg-[#e5c596] text-black font-bold shadow-md"
                        : "text-neutral-300 hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Right: Property Cycler & Close Button */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-black/50 rounded-full border border-white/10 p-0.5">
                  <button
                    onClick={() => {
                      setActivePropertyIndex((prev) => (prev === 0 ? INDIAN_PROPERTIES.length - 1 : prev - 1));
                    }}
                    title="Previous Residence"
                    aria-label="Previous residence"
                    className="w-7 h-7 rounded-full hover:bg-white/10 text-white flex items-center justify-center transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <span className="text-[11px] font-serif text-[#faead2] px-1 hidden md:inline truncate max-w-[130px]">
                    {selectedProperty.name}
                  </span>
                  <button
                    onClick={() => {
                      setActivePropertyIndex((prev) => (prev + 1) % INDIAN_PROPERTIES.length);
                    }}
                    title="Next Residence"
                    aria-label="Next residence"
                    className="w-7 h-7 rounded-full hover:bg-white/10 text-white flex items-center justify-center transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>

                <button
                  onClick={() => setIsFloatingWindowOpen(false)}
                  title="Close (Esc)"
                  aria-label="Close window"
                  className="w-8 h-8 rounded-full bg-white/[0.06] hover:bg-white/20 text-white flex items-center justify-center text-sm font-semibold transition-colors ml-1"
                >
                  ✕
                </button>
              </div>

            </div>

            {/* Window Body Viewport */}
            <div className="relative flex-1 overflow-hidden bg-black/90">
              
              {/* TAB 1: OVERVIEW */}
              {activeCenterTab === "Overview" && (
                <div className="relative w-full h-full">
                  <Image
                    src={selectedProperty.image}
                    alt={selectedProperty.name}
                    fill
                    priority
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-black/50 pointer-events-none" />

                  {/* Top Floating Badge */}
                  <div className="absolute top-5 left-6 sm:left-8 z-10 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-md border border-[#e5c596]/40 text-[10px] font-mono tracking-widest text-[#faead2] uppercase">
                      • {selectedProperty.location.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#17120e]/80 backdrop-blur-md border border-white/15 text-[10px] font-mono tracking-wider text-emerald-300">
                      LIVE ENGINE READY
                    </span>
                  </div>

                  {/* Bottom Info Bar & Quick Residence Switcher */}
                  <div className="absolute bottom-5 sm:bottom-7 left-5 sm:left-8 right-5 sm:right-8 z-20 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="max-w-xl">
                      <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white drop-shadow-lg leading-tight">
                        {selectedProperty.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-300 font-light mt-1.5 leading-relaxed drop-shadow">
                        {selectedProperty.description}
                      </p>
                      <div className="mt-3 flex items-center gap-3 sm:gap-4 flex-wrap">
                        <span className="text-xs sm:text-sm font-mono text-[#faead2] bg-white/[0.06] px-3 py-1 rounded-md border border-white/10">
                          {selectedProperty.specs}
                        </span>
                        <span className="text-sm sm:text-base font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#faead2] via-[#e5c596] to-[#cca15c]">
                          {selectedProperty.price}
                        </span>
                      </div>
                    </div>

                    {/* Quick Residence Selector Thumbnails */}
                    <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md p-2 rounded-2xl border border-white/10 shrink-0">
                      {INDIAN_PROPERTIES.map((prop, idx) => (
                        <button
                          key={`win-thumb-${prop.id}`}
                          onClick={() => setActivePropertyIndex(idx)}
                          title={prop.name}
                          className={`relative w-11 h-11 rounded-xl overflow-hidden border transition-all duration-200 ${
                            activePropertyIndex === idx
                              ? "border-[#cca15c] ring-2 ring-[#e5c596]/50 scale-105"
                              : "border-white/20 opacity-60 hover:opacity-100 hover:scale-102"
                          }`}
                        >
                          <Image
                            src={prop.image}
                            alt={prop.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: FLOOR PLAN */}
              {activeCenterTab === "Floor Plan" && (
                <div className="relative w-full h-full bg-[#0a0705] flex items-center justify-center">
                  <Image
                    src={selectedProperty.floorPlan || "/images/properties/floor-plan.png"}
                    alt={`${selectedProperty.name} Floor Plan`}
                    fill
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    className="object-contain p-6 sm:p-10 brightness-[0.92]"
                    onError={() => setFloorPlanFailed(true)}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/45 pointer-events-none" />

                  {/* Interactive Room Pins */}
                  <div className="absolute inset-0 pointer-events-auto">
                    {ROOM_PINS.map((pin) => (
                      <div
                        key={`win-pin-${pin.name}`}
                        style={{ top: pin.top, left: pin.left }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 group/pin cursor-pointer transition-all duration-300 hover:scale-115 z-20"
                      >
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/85 hover:bg-black backdrop-blur-md border border-[#cca15c]/70 shadow-2xl text-white">
                          <span className="w-2 h-2 rounded-full bg-[#e5c596] animate-pulse" />
                          <span className="text-[10px] sm:text-xs font-sans font-medium tracking-wide">
                            {pin.name}
                          </span>
                        </div>
                        <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/pin:flex flex-col items-center px-3 py-1.5 rounded-lg bg-[#14100c] border border-[#cca15c]/45 text-[10px] font-mono text-neutral-200 whitespace-nowrap shadow-2xl z-30">
                          <span className="font-semibold text-[#faead2]">{pin.details}</span>
                          <span className="text-[9px] text-neutral-400">Architectural Cad Spec</span>
                          <div className="w-2 h-2 bg-[#14100c] border-b border-r border-[#cca15c]/45 rotate-45 -mb-1" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Floor Plan Bottom Legend */}
                  <div className="absolute bottom-5 left-6 right-6 z-20 flex items-center justify-between text-xs text-neutral-300 bg-black/75 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                    <span className="font-mono text-[#faead2]">
                      {selectedProperty.name} • {selectedProperty.specs}
                    </span>
                    <span className="text-neutral-400 hidden sm:inline">
                      100% Vastu Compliant • Verified Architectural Schematic
                    </span>
                  </div>
                </div>
              )}

              {/* TAB 3: GALLERY */}
              {activeCenterTab === "Gallery" && (
                <div className="relative w-full h-full bg-[#0a0705]">
                  <Image
                    src={INDIAN_PROPERTIES[galleryIndex].image}
                    alt={INDIAN_PROPERTIES[galleryIndex].name}
                    fill
                    sizes="(max-width: 1200px) 100vw, 1200px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/50 pointer-events-none" />

                  {/* Prev / Next Buttons */}
                  <div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between z-20 pointer-events-none">
                    <button
                      onClick={handlePrevGallery}
                      aria-label="Previous image"
                      className="pointer-events-auto w-11 h-11 rounded-full bg-black/60 hover:bg-[#e5c596] hover:text-black backdrop-blur-md border border-[#cca15c]/50 text-white flex items-center justify-center transition-all duration-200 shadow-2xl"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextGallery}
                      aria-label="Next image"
                      className="pointer-events-auto w-11 h-11 rounded-full bg-black/60 hover:bg-[#e5c596] hover:text-black backdrop-blur-md border border-[#cca15c]/50 text-white flex items-center justify-center transition-all duration-200 shadow-2xl"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>

                  {/* Bottom Gallery Info Bar */}
                  <div className="absolute bottom-5 left-6 right-6 z-20 flex items-center justify-between bg-black/75 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/10">
                    <div>
                      <span className="text-[10px] font-mono tracking-widest text-[#cca15c] uppercase">
                        GALLERY VIEW {galleryIndex + 1} OF {INDIAN_PROPERTIES.length}
                      </span>
                      <h4 className="text-lg font-serif font-bold text-white mt-0.5">
                        {INDIAN_PROPERTIES[galleryIndex].name} — {INDIAN_PROPERTIES[galleryIndex].location}
                      </h4>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-mono text-[#faead2] font-semibold">
                        {INDIAN_PROPERTIES[galleryIndex].price}
                      </span>
                      <button
                        onClick={() => {
                          setActivePropertyIndex(galleryIndex);
                          setActiveCenterTab("Overview");
                        }}
                        className="px-4 py-1.5 rounded-full bg-[#cca15c] hover:bg-[#faead2] text-black text-xs font-semibold transition-colors"
                      >
                        Set as Active
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3D TOUR / INQUIRY MODAL (LAUNCHED BY CTA)                */}
      {/* ======================================================== */}
      {showTourModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-[#14100c] border border-[#e5c596]/30 p-8 shadow-2xl">
            <button
              onClick={() => setShowTourModal(false)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
            >
              ✕
            </button>

            <div className="text-[10px] font-mono tracking-widest text-[#e5c596] uppercase font-bold mb-1">
              3D VIRTUAL WALKTHROUGH
            </div>

            <h3 className="text-2xl font-serif font-bold text-white">
              {selectedProperty.name}
            </h3>
            <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">
              {selectedProperty.location} • {selectedProperty.specs} • {selectedProperty.price}
            </p>

            <div className="mt-6 relative rounded-2xl overflow-hidden h-52 border border-[#e5c596]/20">
              <Image
                src={selectedProperty.image}
                alt={selectedProperty.name}
                fill
                sizes="(max-width: 768px) 100vw, 550px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-white/30 backdrop-blur-md border border-white/50 flex items-center justify-center text-white shadow-xl animate-pulse">
                  <svg className="w-6 h-6 fill-current translate-x-0.5" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowTourModal(false)}
                className="px-5 py-2.5 rounded-full text-xs text-neutral-400 hover:text-white"
              >
                Close Preview
              </button>
              <button
                onClick={() => setShowTourModal(false)}
                className="px-6 py-2.5 rounded-full bg-[#e6c594] hover:bg-[#dfba85] text-black font-semibold text-xs shadow-lg transition-transform hover:scale-105"
              >
                Schedule Private Viewing
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}

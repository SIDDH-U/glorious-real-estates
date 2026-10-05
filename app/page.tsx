"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ScrollCanvasBackground from "@/components/ScrollCanvasBackground";
import TrustedByCarousel from "@/components/TrustedByCarousel";
import RealEstateBentoGrid from "@/components/RealEstateBentoGrid";

// Custom Hook: Count-Up animation for stats
function useCountUp(target: number, durationMs = 1800) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      setCount(target);
      return;
    }

    const startTime = performance.now();
    let frameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      // easeOutExpo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(ease * target));

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [target, durationMs]);

  return count;
}

export default function Home() {
  const [activeNav, setActiveNav] = useState("home");
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showModal, setShowModal] = useState(false);

  // Inquiry Form State & Handlers (Direct Concierge Email to siddchand246@gmail.com)
  const [inquiryForm, setInquiryForm] = useState({
    name: "",
    email: "",
    propertyCategory: "Signature Villas (₹12.8 Cr+)",
    investmentBracket: "₹10 Cr – ₹20 Cr",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Collapsible toggle for services section ("More Info" dropdown)
  const [expandedServices, setExpandedServices] = useState<{ [key: string]: boolean }>({});
  const toggleServiceInfo = (step: string) => {
    setExpandedServices((prev) => ({
      ...prev,
      [step]: !prev[step],
    }));
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/inquire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiryForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to dispatch inquiry.");
      }

      setSubmitSuccess(true);
    } catch (err: any) {
      console.error("Error submitting inquiry:", err);
      setSubmitError(err.message || "Failed to send. Please connect with Siddhu directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const heroTrackRef = useRef<HTMLDivElement | null>(null);
  const navContainerRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Animated Count-up values for stats
  const projectsCount = useCountUp(250);
  const clientsCount = useCountUp(120);
  const citiesCount = useCountUp(15);

  // Synchronize scroll-driven pinned hero sequence (0 to 100% completion before moving on)
  useEffect(() => {
    const handleScroll = () => {
      if (heroTrackRef.current) {
        const rect = heroTrackRef.current.getBoundingClientRect();
        const totalScrollable = rect.height - window.innerHeight;
        if (totalScrollable > 0) {
          const scrolled = -rect.top;
          const progress = Math.min(1, Math.max(0, scrolled / totalScrollable));
          setScrollProgress(progress);
        }
        // Only show header background after scrolling completely past the 3D hero sequence
        setScrolledPastHero(rect.bottom <= 100);
      }

      // Scroll-Spy: detect which section is currently active
      const sections = ["contact", "about", "services", "projects", "home"];
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.getBoundingClientRect().top;
          if (top <= 250) {
            setActiveNav(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Smooth scroll handler accounting for pinned hero and fixed header
  const scrollToSection = (targetId: string) => {
    setMobileMenuOpen(false);
    setActiveNav(targetId);
    window.history.pushState(null, "", `#${targetId}`);

    if (targetId === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = Math.max(0, elementPosition - headerOffset);
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // Pre-fill inquiry form and smoothly scroll to contact section
  const handleSelectService = (category: string, bracket: string) => {
    const categoryMap: { [key: string]: string } = {
      "Luxury Homes": "Luxury Homes (₹6.5 Cr+)",
      "Signature Villas": "Signature Villas (₹12.8 Cr+)",
      "Luxury Apartments": "Luxury Apartments (₹8.5 Cr+)",
      "Palatial Penthouses": "Palatial Penthouses (₹24.0 Cr+)",
    };

    setInquiryForm((prev) => ({
      ...prev,
      propertyCategory: categoryMap[category] || category,
      investmentBracket: bracket,
    }));
    scrollToSection("contact");
  };

  // Nav sliding highlight position calculations
  const [sliderStyle, setSliderStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  useEffect(() => {
    const currentKey = hoveredNav || activeNav;
    const currentEl = navItemsRef.current[currentKey];
    const containerEl = navContainerRef.current;
    if (currentEl && containerEl) {
      const elRect = currentEl.getBoundingClientRect();
      const containerRect = containerEl.getBoundingClientRect();
      setSliderStyle({
        left: elRect.left - containerRect.left,
        width: elRect.width,
        opacity: 1,
      });
    }
  }, [hoveredNav, activeNav]);

  const NAV_ITEMS = [
    { label: "Home", key: "home" },
    { label: "Projects", key: "projects" },
    { label: "Services", key: "services" },
    { label: "About", key: "about" },
    { label: "Contact", key: "contact" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#08070d] text-white select-none font-sans overflow-x-clip selection:bg-amber-500/30 selection:text-white">
      
      {/* ======================================================== */}
      {/* 1. HEADER (AS SHOWN IN THE ATTACHED IMAGE)               */}
      {/* Top-Left: G GLORIOUS REAL ESTATES                        */}
      {/* Top-Center: Frosted Navigation Capsule with Amber Glow   */}
      {/* Top-Right: Search + Start a Project CTA                  */}
      {/* ======================================================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
          scrolledPastHero
            ? "py-3 sm:py-3.5 bg-[#08070d]/75 backdrop-blur-xl border-b border-[#e5c596]/15 shadow-[0_12px_40px_rgba(0,0,0,0.8)]"
            : "py-4 sm:py-6 bg-transparent"
        }`}
      >
        <div className="w-full px-5 sm:px-8 lg:px-14 flex items-center justify-between gap-4">
          
          {/* ================= TOP-LEFT: GLORIOUS LOGO ================= */}
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("home");
            }}
            className="group relative flex items-center gap-3 cursor-pointer select-none text-left shrink-0"
            aria-label="Glorious Real Estates - Home"
          >
            {/* Monogram Box: Golden rounded square with "G" */}
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl border border-[#cca15c]/70 bg-black/40 backdrop-blur-md flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.6),0_0_15px_rgba(204,161,92,0.25)] transition-all duration-300 group-hover:scale-105 group-hover:border-[#e5c596] group-hover:shadow-[0_0_25px_rgba(229,197,150,0.4)]">
              <span className="font-serif text-2xl sm:text-[26px] font-normal text-transparent bg-clip-text bg-gradient-to-b from-white via-[#faead2] to-[#e5c596] leading-none translate-y-[-1px]">
                G
              </span>
            </div>

            {/* Vertical Divider */}
            <div className="h-7 w-[1px] bg-white/20 ml-1 mr-1 hidden sm:block" />

            {/* Wordmark & Tagline */}
            <div className="flex flex-col">
              <span className="text-sm sm:text-base font-serif font-bold tracking-[0.28em] uppercase text-white leading-none group-hover:text-[#faead2] transition-colors">
                GLORIOUS
              </span>
              <span className="text-[9px] tracking-[0.28em] text-[#cca15c] uppercase font-mono font-medium mt-1">
                REAL ESTATES
              </span>
            </div>
          </a>

          {/* ================= TOP-CENTER: CAPSULE NAVBAR ================= */}
          <nav
            ref={navContainerRef}
            role="navigation"
            aria-label="Main Navigation"
            className="hidden md:flex items-center relative p-1.5 rounded-full bg-[#16120e]/60 backdrop-blur-xl border border-[#e5c596]/40 shadow-[0_8px_30px_rgba(0,0,0,0.6),0_0_20px_rgba(229,197,150,0.15)]"
          >
            {/* Sliding Highlight Pill */}
            <div
              aria-hidden="true"
              className="absolute top-1.5 bottom-1.5 rounded-full bg-[#faead2] transition-all duration-300 ease-out shadow-[0_2px_12px_rgba(250,234,210,0.4)] pointer-events-none"
              style={{
                left: `${sliderStyle.left}px`,
                width: `${sliderStyle.width}px`,
                opacity: sliderStyle.opacity,
              }}
            />

            {NAV_ITEMS.map((item) => {
              const isActive = activeNav === item.key;
              const isHovered = hoveredNav === item.key;

              return (
                <button
                  key={item.key}
                  ref={(el) => {
                    navItemsRef.current[item.key] = el;
                  }}
                  onClick={() => scrollToSection(item.key)}
                  onMouseEnter={() => setHoveredNav(item.key)}
                  onMouseLeave={() => setHoveredNav(null)}
                  className={`relative z-10 px-4 sm:px-5 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-[#e5c596] ${
                    isActive && !hoveredNav
                      ? "text-black font-semibold"
                      : isHovered
                      ? "text-black font-semibold"
                      : "text-neutral-300 hover:text-white"
                  }`}
                >
                  {item.label}
                  {isActive && <span className="sr-only"> (current section)</span>}
                </button>
              );
            })}
          </nav>

          {/* ================= TOP-RIGHT: SEARCH & CTA ================= */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
            {/* Circular Search Button with Ambient Pulse Glow & Hover Radiance */}
            <button
              onClick={() => setShowModal(true)}
              aria-label="Search Luxury Properties"
              title="Search Luxury Properties"
              className="group relative w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#18130f]/85 hover:bg-[#cca15c]/25 text-[#faead2] hover:text-white flex items-center justify-center backdrop-blur-xl border border-[#cca15c]/45 hover:border-[#faead2] shadow-[0_0_15px_rgba(204,161,92,0.25)] hover:shadow-[0_0_28px_rgba(229,197,150,0.6),0_0_12px_rgba(204,161,92,0.4)] transition-all duration-300 hover:scale-110 active:scale-95 overflow-hidden"
            >
              {/* Subtle ambient ping beacon ring */}
              <span className="absolute inset-0 rounded-full bg-[#cca15c]/15 animate-ping opacity-30 group-hover:opacity-75 pointer-events-none" />

              <svg
                className="relative z-10 w-4 h-4 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-105"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </button>

            {/* Pill CTA Button: "Start a Project" with Continuous Shimmer & Glowing Aura */}
            <button
              onClick={() => scrollToSection("contact")}
              className="group relative inline-flex items-center gap-2.5 sm:gap-3 pl-4 sm:pl-5 pr-1.5 py-1.5 rounded-full bg-gradient-to-r from-[#1f1914]/95 via-[#292019]/95 to-[#1f1914]/95 hover:from-[#2c2219] hover:to-[#201812] text-white font-medium text-xs sm:text-sm backdrop-blur-xl border border-[#cca15c]/55 hover:border-[#faead2] shadow-[0_4px_20px_rgba(0,0,0,0.7),0_0_18px_rgba(204,161,92,0.32)] hover:shadow-[0_6px_35px_rgba(204,161,92,0.6),0_0_25px_rgba(250,234,210,0.45)] transition-all duration-300 hover:scale-[1.04] active:scale-[0.98] overflow-hidden"
            >
              {/* Continuous Light Sweep Shimmer Beam */}
              <div 
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/18 to-transparent pointer-events-none"
              />

              {/* Live Breathing Amber Beacon Dot */}
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
              </span>

              <span className="text-white font-medium tracking-wide group-hover:text-[#faead2] transition-colors">
                Start a Project
              </span>
              
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-tr from-[#cca15c] via-[#e5c596] to-[#faead2] text-black shadow-[0_2px_8px_rgba(204,161,92,0.4)] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(250,234,210,0.8)]">
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-300 group-hover:translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
              className="md:hidden w-9 h-9 rounded-full bg-black/45 hover:bg-[#e5c596]/20 text-white flex items-center justify-center backdrop-blur-xl border border-[#e5c596]/35 shadow-md ml-1"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="16" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </svg>
            </button>
          </div>

        </div>
      </header>

      {/* ======================================================== */}
      {/* MOBILE FULL-SCREEN GLASS DRAWER NAVIGATION               */}
      {/* ======================================================== */}
      {mobileMenuOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
          className="fixed inset-0 z-[100] bg-[#08070d]/95 backdrop-blur-2xl p-7 flex flex-col justify-between animate-in fade-in duration-300"
        >
          {/* Top Bar with Brand & Close Button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl border border-[#e5c596]/45 bg-[#14100c] flex items-center justify-center text-lg font-serif text-[#e5c596]">
                G
              </div>
              <span className="font-serif font-bold tracking-[0.24em] text-white uppercase text-sm">
                GLORIOUS
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              aria-label="Close Navigation Menu"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold text-lg"
            >
              ✕
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-6 my-auto text-left">
            {NAV_ITEMS.map((item, idx) => (
              <button
                key={item.key}
                onClick={() => scrollToSection(item.key)}
                className="group flex items-center justify-between text-3xl sm:text-4xl font-serif text-white hover:text-[#e5c596] transition-colors py-2 border-b border-white/10"
              >
                <span>{item.label}</span>
                <span className="text-xs font-mono text-[#e5c596] tracking-widest uppercase opacity-60 group-hover:opacity-100">
                  0{idx + 1} →
                </span>
              </button>
            ))}
          </nav>

          {/* Bottom Action in Drawer */}
          <div className="pt-6 border-t border-[#e5c596]/20">
            <button
              onClick={() => scrollToSection("contact")}
              className="w-full py-4 rounded-full bg-[#e5c596] hover:bg-[#dfba85] text-black font-bold text-xs uppercase tracking-widest shadow-xl text-center"
            >
              Start a Project
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. HERO PINNED SCROLL TRACK (PLAYS 150-FRAME SEQUENCE)   */}
      {/* ======================================================== */}
      <div 
        id="home"
        ref={heroTrackRef}
        className="relative w-full h-[220vh] bg-[#08070d]"
      >
        {/* Sticky Pinned Viewport Container */}
        <section className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between select-none">
        
          {/* 100% Sharp HTML5 Canvas Sequence with Left Atmospheric Gradient */}
          <ScrollCanvasBackground progress={scrollProgress} totalFrames={150} />

          {/* ======================================================== */}
          {/* MAIN HERO CONTENT (Left Headline + Clean Space)          */}
          {/* ======================================================== */}
          <main className="relative z-10 w-full px-6 sm:px-10 lg:px-14 flex-1 flex flex-col justify-center pointer-events-auto min-h-0 pt-16 sm:pt-20">
            
            {/* Left Editorial Section */}
            <div className="max-w-2xl flex flex-col items-start pt-2 pb-2 min-w-0">
              
              {/* Category Kicker with Fine Line: "REAL ESTATES —" */}
              <div className="flex items-center gap-3 mb-2.5 sm:mb-3.5">
                <span className="text-[10px] sm:text-[11px] font-semibold tracking-[0.32em] uppercase text-neutral-300/90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  REAL ESTATES
                </span>
                <div className="w-12 h-[1px] bg-neutral-400/50" />
              </div>

              {/* Refined Luxury-Editorial Headline: Spaces That Inspire */}
              <h1 className="select-none leading-[0.92] tracking-tight min-w-0">
                <span 
                  className="block font-serif font-semibold text-[clamp(2.5rem,5.8vw,6.2rem)] tracking-[-0.015em] text-transparent bg-clip-text bg-gradient-to-b from-white via-[#faf7fd] to-[#efe6f7]"
                  style={{
                    filter: "drop-shadow(0 0 1px rgba(255, 255, 255, 0.42)) drop-shadow(0 4px 14px rgba(0, 0, 0, 0.85)) drop-shadow(0 14px 32px rgba(0, 0, 0, 0.75))",
                  }}
                >
                  Spaces
                </span>
                <span 
                  className="block font-display italic font-normal text-[clamp(2.5rem,5.8vw,6.2rem)] tracking-[0.01em] text-transparent bg-clip-text bg-gradient-to-r from-[#faead2] via-[#e5c596] to-[#cca15c] mt-0.5 sm:mt-1.5"
                  style={{
                    filter: "drop-shadow(0 0 1px rgba(250, 234, 210, 0.35)) drop-shadow(0 4px 16px rgba(0, 0, 0, 0.9)) drop-shadow(0 14px 36px rgba(0, 0, 0, 0.8))",
                  }}
                >
                  That Inspire
                </span>
              </h1>

              {/* Updated Concise Supporting Description */}
              <p className="mt-3.5 sm:mt-4 text-[clamp(0.9rem,1.1vw,1.1rem)] text-neutral-200/90 max-w-lg leading-relaxed font-light drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] text-balance">
                We create stunning properties.
              </p>

            </div>

          </main>

          {/* ======================================================== */}
          {/* BOTTOM FLOOR BAR: BUTTONS (LEFT) & STATS (BOTTOM RIGHT)  */}
          {/* ======================================================== */}
          <div className="relative z-20 w-full px-6 sm:px-10 lg:px-14 pb-6 sm:pb-8 pt-2 flex flex-col md:flex-row items-start md:items-end justify-between gap-5 sm:gap-6 pointer-events-auto shrink-0">
            
            {/* Left-Aligned Floor CTA Buttons */}
            <div className="flex items-center gap-4 sm:gap-5 shrink-0 flex-wrap">
              
              {/* Primary Golden Pill with Rotating Circular Border Glow on Hover */}
              <div className="relative group/btn p-[1.5px] rounded-full overflow-hidden inline-flex items-center justify-center">
                {/* Rotating Conic Gradient Beam on Hover */}
                <div 
                  aria-hidden="true"
                  className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent_0_300deg,#ffffff_330deg,#e5c596_360deg)] opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300 animate-border-spin pointer-events-none"
                />

                {/* Soft Ambient Radial Underglow */}
                <div 
                  aria-hidden="true" 
                  className="absolute -inset-2 rounded-full bg-[#cca15c]/40 blur-xl opacity-0 group-hover/btn:opacity-90 transition-opacity duration-300 pointer-events-none -z-10" 
                />
                
                {/* Gold Button Body */}
                <button
                  onClick={() => scrollToSection("projects")}
                  className="relative z-10 inline-flex items-center gap-3 pl-6 sm:pl-7 pr-2 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-[#e5c596] via-[#dfba85] to-[#cca15c] hover:brightness-105 text-black text-xs sm:text-sm font-bold shadow-[0_4px_20px_rgba(0,0,0,0.5),0_0_15px_rgba(204,161,92,0.25)] transition-all duration-300 active:scale-[0.98]"
                >
                  <span className="tracking-wide">Explore Our Work</span>
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black flex items-center justify-center text-white transition-transform duration-300 group-hover/btn:translate-x-0.5 shadow-sm">
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </button>
              </div>

              {/* Watch Showreel Circle Button */}
              <button
                onClick={() => setShowModal(true)}
                className="group inline-flex items-center gap-3 text-white hover:text-amber-200 transition-colors drop-shadow"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/40 group-hover:border-[#cca15c] flex items-center justify-center bg-black/35 backdrop-blur-md transition-all duration-300 group-hover:scale-105 shadow-[0_0_15px_rgba(204,161,92,0.2)]">
                  <svg
                    className="w-3.5 h-3.5 translate-x-0.5 fill-current text-white group-hover:text-[#faead2]"
                    viewBox="0 0 24 24"
                  >
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                </div>
                <span className="font-serif italic text-sm sm:text-base tracking-wide text-neutral-100 group-hover:text-white">
                  Watch Showreel
                </span>
              </button>

            </div>

            {/* Bottom-Right Stats Panel: Sleek Frosted Glass with Champagne Glow */}
            <aside
              aria-label="Key Achievements"
              className="rounded-2xl sm:rounded-3xl px-5 sm:px-6 py-3 sm:py-3.5 bg-black/30 backdrop-blur-xl border border-[#cca15c]/40 shadow-[0_12px_40px_rgba(0,0,0,0.6),0_0_20px_rgba(204,161,92,0.12)] transition-all duration-300 hover:border-[#e5c596]/70 hover:shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_25px_rgba(229,197,150,0.25)] shrink-0 max-w-full"
            >
              <div className="flex items-center gap-3.5 sm:gap-5 sm:gap-6">
                
                {/* Stat 1: 250+ Projects Completed */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#cca15c]/60 bg-[#cca15c]/10 text-[#e5c596] flex items-center justify-center mb-1 shadow-sm">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <rect x="4" y="2" width="16" height="20" rx="2" />
                      <line x1="9" y1="6" x2="9" y2="6.01" />
                      <line x1="15" y1="6" x2="15" y2="6.01" />
                      <line x1="9" y1="10" x2="9" y2="10.01" />
                      <line x1="15" y1="10" x2="15" y2="10.01" />
                      <line x1="9" y1="14" x2="9" y2="14.01" />
                      <line x1="15" y1="14" x2="15" y2="14.01" />
                      <path d="M9 18h6v4H9z" />
                    </svg>
                  </div>
                  <span className="text-lg sm:text-xl font-serif font-bold text-white leading-none">
                    {projectsCount}+
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-mono tracking-[0.16em] uppercase text-neutral-300 font-medium mt-1 whitespace-nowrap">
                    Estates Curated
                  </span>
                </div>

                {/* Vertical Divider 1 */}
                <div className="h-9 sm:h-11 w-[1px] bg-gradient-to-b from-transparent via-[#cca15c]/40 to-transparent shrink-0" />

                {/* Stat 2: 120+ Happy Clients */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#cca15c]/60 bg-[#cca15c]/10 text-[#e5c596] flex items-center justify-center mb-1 shadow-sm">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <span className="text-lg sm:text-xl font-serif font-bold text-white leading-none">
                    {clientsCount}+
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-mono tracking-[0.16em] uppercase text-neutral-300 font-medium mt-1 whitespace-nowrap">
                    Private Clients
                  </span>
                </div>

                {/* Vertical Divider 2 */}
                <div className="h-9 sm:h-11 w-[1px] bg-gradient-to-b from-transparent via-[#cca15c]/40 to-transparent shrink-0" />

                {/* Stat 3: 15+ Cities Worldwide */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-[#cca15c]/60 bg-[#cca15c]/10 text-[#e5c596] flex items-center justify-center mb-1 shadow-sm">
                    <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  </div>
                  <span className="text-lg sm:text-xl font-serif font-bold text-white leading-none">
                    {citiesCount}+
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-mono tracking-[0.16em] uppercase text-neutral-300 font-medium mt-1 whitespace-nowrap">
                    Cities Worldwide
                  </span>
                </div>

              </div>
            </aside>

          </div>

        </section>
      </div>

      {/* ======================================================== */}
      {/* 3. TRUSTED-BY LOGO CAROUSEL SECTION                     */}
      {/* ======================================================== */}
      <TrustedByCarousel />

      {/* ======================================================== */}
      {/* 4. REAL ESTATE BENTO GRID SECTION (#projects)            */}
      {/* ======================================================== */}
      <RealEstateBentoGrid />

      {/* ======================================================== */}
      {/* 5. ARCHITECTURAL SERVICES SECTION (#services)            */}
      {/* ======================================================== */}
      <section 
        id="services"
        className="relative w-full py-24 sm:py-32 bg-[#08070d] text-white border-t border-[#e5c596]/18 overflow-hidden select-none"
      >
        {/* Dusk Architectural Villa with Infinity Pool Background (Soft Blur) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/images/services-bg.png"
            alt="Luxury Twilight Villa and Infinity Pool Overlooking Valley"
            fill
            priority
            sizes="100vw"
            style={{ filter: "blur(2.5px)" }}
            className="object-cover object-center scale-105 opacity-80 brightness-95"
          />
          {/* Subtle gradient vignette for smooth section blending and text clarity */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#08070d]/90 via-[#08070d]/45 to-[#08070d]/95 pointer-events-none" />
          <div className="absolute inset-0 bg-black/25 pointer-events-none" />

          {/* Ambient Champagne Gold Lighting */}
          <div 
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[400px] bg-[#cca15c]/12 rounded-full blur-[180px] pointer-events-none"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 relative z-10">
          <div className="flex flex-col items-center text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-[#e5c596]/30 mb-4 backdrop-blur-md shadow-[0_0_15px_rgba(204,161,92,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.28em] uppercase text-[#faead2]">
                CURATED ARCHITECTURAL SERVICES & PROPERTIES
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal tracking-tight text-white max-w-3xl leading-[1.1]">
              Bespoke Residences &{" "}
              <span className="font-display italic text-transparent bg-clip-text bg-gradient-to-r from-[#faead2] via-[#e5c596] to-[#cca15c]">
                Living Spaces
              </span>
            </h2>
            <p className="mt-4 text-sm sm:text-base text-neutral-300 max-w-2xl font-light leading-relaxed">
              From standalone custom homes and cantilevered hillside villas to prime urban sky apartments and palatial penthouses — discover tailored architectural craft and turnkey luxury acquisitions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                category: "Luxury Homes",
                typology: "Standalone Residences",
                price: "₹6.5 Cr+",
                priceLabel: "Starting Valuation",
                specs: "3–5 BHK · 3,500 – 6,200 sq ft",
                highlight: "Vastu · Private Garden",
                desc: "Artisan-crafted standalone family estates engineered with biophilic internal courtyards, soaring double-height living spaces, sustainable passive cooling, and private 3-car porticos.",
                inclusions: [
                  "Turnkey Architecture & Blueprint Curation",
                  "Turnkey Architecture & Landscape Curation",
                  "Integrated Crestron Smart Automation",
                ],
                bracket: "₹5 Cr – ₹10 Cr",
              },
              {
                step: "02",
                category: "Signature Villas",
                typology: "Hillside & Waterfront",
                price: "₹12.8 Cr+",
                priceLabel: "Starting Valuation",
                specs: "4–6 BHK · 5,800 – 9,800 sq ft",
                highlight: "Infinity Pool · Panoramas",
                desc: "Cantilevered cliffside retreats and tropical coastal sanctuaries designed with temperature-controlled vanishing-edge pools, expansive Burmese teak sundecks, and twilight outdoor lounges.",
                inclusions: [
                  "Private Sunset Grounds & Twilight Landscape Design",
                  "Vanishing-Edge Heated Infinity Pool",
                  "Private Wellness Pavilion & Wine Lounge",
                ],
                bracket: "₹10 Cr – ₹20 Cr",
              },
              {
                step: "03",
                category: "Luxury Apartments",
                typology: "Prime Metro High-Rise",
                price: "₹8.5 Cr+",
                priceLabel: "Starting Valuation",
                specs: "3–4 BHK · 2,800 – 4,500 sq ft",
                highlight: "Skyline Panoramas · Private Lift",
                desc: "Curated high-rise living in elite metropolitan enclaves offering dedicated high-speed private elevator access, Italian Statuario marble finishes, sound-insulated glass facades, and sweeping vistas.",
                inclusions: [
                  "Private Elevator Vestibule & Keycard Access",
                  "Double-Height Glass Balconies with Sea Views",
                  "24/7 White-Glove Concierge & Valet",
                ],
                bracket: "₹10 Cr – ₹20 Cr",
              },
              {
                step: "04",
                category: "Palatial Penthouses",
                typology: "Crown Duplex & Triplex",
                price: "₹24.0 Cr+",
                priceLabel: "Starting Valuation",
                specs: "Duplex & Triplex · 6,500 – 12,500 sq ft",
                highlight: "Sky Pool · Helipad Access",
                desc: "Ultra-luxury crown penthouses towering above the skyline with 360-degree glass horizons, private rooftop lap pools, personal automotive sky garages, and bespoke private banking sales suites.",
                inclusions: [
                  "Private Sky Lap Pool & Open-Fire Terrace",
                  "Acoustically Tuned Private Master Suites",
                  "Bespoke Family Office Wealth Advisory",
                ],
                bracket: "₹20 Cr – ₹50 Cr",
              },
            ].map((srv) => (
              <div
                key={srv.step}
                className="rounded-3xl p-6 sm:p-7 bg-[#110d09]/85 backdrop-blur-xl border border-[#cca15c]/25 hover:border-[#cca15c]/70 transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between shadow-2xl hover:shadow-[0_25px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(204,161,92,0.25)] group relative overflow-hidden"
              >
                {/* Subtle top golden light accent on hover */}
                <div 
                  aria-hidden="true"
                  className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#e5c596]/60 to-transparent opacity-30 group-hover:opacity-100 transition-opacity duration-300"
                />

                <div>
                  {/* Top Eyebrow / Step Indicator */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-bold text-[#cca15c] tracking-widest px-2.5 py-1 rounded-md bg-[#cca15c]/10 border border-[#cca15c]/20">
                      {srv.step}
                    </span>
                    <span className="text-[10px] font-mono tracking-[0.2em] text-[#faead2]/70 uppercase truncate">
                      {srv.typology}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-serif font-semibold text-white mt-3 group-hover:text-[#faead2] transition-colors">
                    {srv.category}
                  </h3>

                  {/* Price Banner */}
                  <div className="mt-3.5 mb-3.5 p-3 rounded-2xl bg-white/[0.03] border border-[#cca15c]/20 flex flex-col group-hover:border-[#cca15c]/45 group-hover:bg-[#cca15c]/[0.05] transition-all">
                    <span className="text-[9px] font-mono tracking-widest uppercase text-neutral-400">
                      {srv.priceLabel}
                    </span>
                    <div className="text-xl sm:text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#faead2] via-[#e5c596] to-[#cca15c] mt-0.5 tracking-tight">
                      {srv.price}
                    </div>
                  </div>

                  {/* Specifications & Highlight Tags */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] font-mono text-[#faead2]">
                      {srv.specs}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#cca15c]/15 border border-[#cca15c]/30 text-[10px] font-mono text-[#faead2]">
                      {srv.highlight}
                    </span>
                  </div>

                  {/* Dropdown Toggle Button for More Info */}
                  <button
                    type="button"
                    onClick={() => toggleServiceInfo(srv.step)}
                    className="my-2.5 inline-flex items-center gap-1.5 text-[11px] font-mono tracking-wider text-[#cca15c] hover:text-[#faead2] py-1 px-3 rounded-full bg-[#cca15c]/10 hover:bg-[#cca15c]/20 border border-[#cca15c]/25 hover:border-[#cca15c]/55 transition-all duration-200 cursor-pointer"
                  >
                    <span>{expandedServices[srv.step] ? "Hide Details" : "More Info"}</span>
                    <span className={`text-[9px] transition-transform duration-300 ${expandedServices[srv.step] ? "rotate-180" : ""}`}>
                      ▼
                    </span>
                  </button>

                  {/* Collapsible Details Dropdown */}
                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      expandedServices[srv.step]
                        ? "max-h-96 opacity-100 mt-1 mb-4"
                        : "max-h-0 opacity-0 my-0 pointer-events-none"
                    }`}
                  >
                    {/* Description */}
                    <p className="text-xs sm:text-[13px] text-neutral-300 font-light leading-relaxed mb-3">
                      {srv.desc}
                    </p>

                    {/* Architectural Inclusions */}
                    <div className="space-y-1.5 pt-2.5 border-t border-white/[0.08]">
                      {srv.inclusions.map((inc, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px] text-neutral-300 font-light">
                          <span className="text-[#cca15c] text-[10px] font-bold shrink-0 mt-0.5">✦</span>
                          <span>{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Interactive Button */}
                <button
                  type="button"
                  onClick={() => handleSelectService(srv.category, srv.bracket)}
                  className="mt-auto w-full pt-3.5 pb-1 border-t border-[#cca15c]/25 flex items-center justify-between text-xs text-[#faead2] font-mono tracking-wider group-hover:text-[#cca15c] transition-colors"
                >
                  <span className="uppercase font-semibold tracking-widest text-[11px]">INQUIRE SPECIFICATION</span>
                  <span className="text-[#cca15c] text-sm transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 6. ABOUT GLORIOUS SECTION (#about)                       */}
      {/* ======================================================== */}
      <section 
        id="about"
        className="relative w-full py-24 sm:py-32 bg-[#09070d] text-white border-t border-[#e5c596]/15 overflow-hidden select-none"
      >
        <div 
          aria-hidden="true"
          className="absolute bottom-1/4 right-1/4 w-[500px] h-[350px] bg-[#e5c596]/08 rounded-full blur-[160px] pointer-events-none"
        />

        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Editorial Philosophy */}
            <div className="lg:col-span-6 flex flex-col items-start text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-[#e5c596]/25 mb-4 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e5c596]" />
                <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.28em] uppercase text-neutral-300">
                  ABOUT GLORIOUS
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white leading-[1.1] text-balance">
                Crafting Spaces of{" "}
                <span className="font-display italic text-transparent bg-clip-text bg-gradient-to-r from-[#faead2] via-[#e5c596] to-[#cca15c]">
                  Enduring Distinction
                </span>
              </h2>
              <p className="mt-6 text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
                Founded on architectural heritage and uncompromising excellence, <strong>Glorious Real Estates</strong> curates and develops prime Indian and international residential estates for distinguished private clients and family offices.
              </p>
              <p className="mt-4 text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
                From cantilevered cliffside villas overlooking the Western Ghats to sea-facing Mumbai sky penthouses and heritage Rajasthani estates, we represent properties of rare architectural pedigree and enduring investment value.
              </p>

              <div className="mt-8 flex items-center gap-4">
                <button
                  onClick={() => scrollToSection("contact")}
                  className="px-6 py-3 rounded-full bg-[#e6c594] hover:bg-[#dfba85] text-black text-xs font-bold tracking-wider uppercase transition-transform hover:scale-105 shadow-xl"
                >
                  Acquire With Us
                </button>
                <button
                  onClick={() => scrollToSection("projects")}
                  className="px-6 py-3 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-medium tracking-wider uppercase border border-white/15 transition-colors"
                >
                  View Collection
                </button>
              </div>
            </div>

            {/* Right Pillars Box */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Prime Architectural Pedigree", desc: "Curated portfolio of master-planned villas, iconic homes, and penthouse estates." },
                { title: "Bespoke Living Environments", desc: "Engineered with biophilic courtyards, private wellness suites, and panoramic views." },
                { title: "Private HNW Advisory", desc: "Discreet advisory trusted by elite families, sovereign investors, and premier developers." },
                { title: "Title-Clear Turnkey Assets", desc: "Rigorous legal vetting, clear titles, and seamless white-glove closing processes." },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-6 bg-[#130f0c]/90 border border-[#e5c596]/20 backdrop-blur-xl shadow-lg"
                >
                  <div className="w-8 h-8 rounded-full bg-[#e5c596]/15 text-[#e5c596] font-mono text-xs flex items-center justify-center font-bold mb-3">
                    0{idx + 1}
                  </div>
                  <h4 className="text-base font-serif font-bold text-white">{item.title}</h4>
                  <p className="text-xs text-neutral-400 font-light mt-2 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* ======================================================== */}
      {/* 7. CONTACT & PRIVATE INQUIRY SECTION (#contact)          */}
      {/* ======================================================== */}
      <section 
        id="contact"
        className="relative w-full py-24 sm:py-32 bg-[#07050a] text-white border-t border-[#e5c596]/18 overflow-hidden select-none"
      >
        {/* Panoramic Luxury Hillside Estate Background with Soft Blur */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <Image
            src="/images/inquiry-bg.png"
            alt="Luxury Hillside Estate Overlooking Valley at Twilight"
            fill
            priority
            sizes="100vw"
            style={{ filter: "blur(2.5px)" }}
            className="object-cover object-center scale-105 opacity-85 brightness-95"
          />
          {/* Subtle top & bottom edge blending into page background */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#07050a]/90 via-transparent to-[#07050a]/90 pointer-events-none" />
          <div className="absolute inset-0 bg-black/20 pointer-events-none" />

          {/* Ambient Champagne Gold Lighting */}
          <div 
            aria-hidden="true"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-[#cca15c]/10 rounded-full blur-[170px]"
          />
        </div>

        <div className="max-w-5xl mx-auto px-6 sm:px-10 relative z-10">
          
          <div className="flex flex-col items-center text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-[#e5c596]/25 mb-4 backdrop-blur-md shadow-[0_0_15px_rgba(204,161,92,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-[10px] sm:text-[11px] font-mono tracking-[0.28em] uppercase text-[#faead2]">
                ACQUIRE A GLORIOUS ESTATE
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-white max-w-2xl leading-[1.1]">
              Private Client Advisory &{" "}
              <span className="font-display italic text-transparent bg-clip-text bg-gradient-to-r from-[#faead2] via-[#e5c596] to-[#cca15c]">
                Acquisitions
              </span>
            </h2>
            <p className="mt-4 text-xs sm:text-sm text-neutral-300 max-w-md font-light leading-relaxed">
              Inquire about acquiring signature luxury homes, cliffside villas, sky apartments, or scheduling a private estate tour.
            </p>
          </div>

          {/* Interactive Luxury Inquiry Form */}
          <div className="rounded-3xl p-6 sm:p-10 bg-[#120e0a]/90 backdrop-blur-2xl border border-[#cca15c]/35 shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_40px_rgba(204,161,92,0.12)]">
            
            {submitSuccess ? (
              <div className="py-8 px-4 text-center animate-in fade-in zoom-in-95 duration-400">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-tr from-[#cca15c]/25 to-[#faead2]/35 border border-[#cca15c] flex items-center justify-center text-[#faead2] text-2xl font-bold shadow-[0_0_30px_rgba(204,161,92,0.45)]">
                  ✓
                </div>
                <span className="text-[10px] font-mono tracking-[0.25em] text-[#cca15c] uppercase font-semibold">
                  DISPATCH CONFIRMED
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif font-bold text-white mt-1">
                  Inquiry Dispatched to Concierge
                </h3>
                <p className="mt-3 text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto leading-relaxed">
                  Thank you, <strong className="text-white">{inquiryForm.name}</strong>. Your private advisory brief has been dispatched directly to <strong className="text-[#faead2]">Siddhu</strong> and our senior advisory partners. We will review your architectural scope and connect with you shortly.
                </p>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-center gap-4 text-xs">
                  <span className="text-neutral-400">Category: <strong className="text-white">{inquiryForm.propertyCategory}</strong></span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-neutral-400">Investment: <strong className="text-white">{inquiryForm.investmentBracket}</strong></span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-neutral-400">Direct Concierge: <strong className="text-[#faead2]">Siddhu</strong></span>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={() => {
                      setSubmitSuccess(false);
                      setInquiryForm({
                        name: "",
                        email: "",
                        propertyCategory: "Signature Villas (₹12.8 Cr+)",
                        investmentBracket: "₹10 Cr – ₹20 Cr",
                        notes: "",
                      });
                    }}
                    className="px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold tracking-wider uppercase transition-colors"
                  >
                    Submit Another Brief
                  </button>

                  <a
                    href={`mailto:siddchand246@gmail.com?subject=Private%20Inquiry%20from%20${encodeURIComponent(inquiryForm.name || "Client")}&body=Name:%20${encodeURIComponent(inquiryForm.name)}%0AEmail:%20${encodeURIComponent(inquiryForm.email)}%0ACategory:%20${encodeURIComponent(inquiryForm.propertyCategory)}%0AInvestment:%20${encodeURIComponent(inquiryForm.investmentBracket)}%0ANotes:%20${encodeURIComponent(inquiryForm.notes)}`}
                    className="px-6 py-2.5 rounded-full bg-[#cca15c]/25 hover:bg-[#cca15c]/45 border border-[#cca15c]/60 text-[#faead2] text-xs font-semibold tracking-wider uppercase transition-colors"
                  >
                    Direct Email Fallback
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4 sm:space-y-5">
                {submitError && (
                  <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/40 text-xs text-red-200 flex items-center justify-between gap-3">
                    <span>{submitError}</span>
                    <a 
                      href={`mailto:siddchand246@gmail.com?subject=Private%20Client%20Inquiry`}
                      className="underline text-[#faead2] shrink-0 font-medium"
                    >
                      Email Direct
                    </a>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      value={inquiryForm.name}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                      placeholder="e.g. Vikramaditya Singhania"
                      className="w-full rounded-xl bg-black/60 border border-white/15 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#cca15c] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={inquiryForm.email}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                      placeholder="concierge@estate.com"
                      className="w-full rounded-xl bg-black/60 border border-white/15 px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#cca15c] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">
                      Property Category
                    </label>
                    <select 
                      value={inquiryForm.propertyCategory}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, propertyCategory: e.target.value })}
                      className="w-full rounded-xl bg-black/60 border border-white/15 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#cca15c] transition-colors"
                    >
                      <option>Luxury Homes (₹6.5 Cr+)</option>
                      <option>Signature Villas (₹12.8 Cr+)</option>
                      <option>Luxury Apartments (₹8.5 Cr+)</option>
                      <option>Palatial Penthouses (₹24.0 Cr+)</option>
                      <option>Heritage Haveli Restoration</option>
                      <option>Full Development Masterplan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">
                      Target Investment Bracket
                    </label>
                    <select 
                      value={inquiryForm.investmentBracket}
                      onChange={(e) => setInquiryForm({ ...inquiryForm, investmentBracket: e.target.value })}
                      className="w-full rounded-xl bg-black/60 border border-white/15 px-4 py-3 text-sm text-white focus:outline-none focus:border-[#cca15c] transition-colors"
                    >
                      <option>₹5 Cr – ₹10 Cr</option>
                      <option>₹10 Cr – ₹20 Cr</option>
                      <option>₹20 Cr – ₹50 Cr</option>
                      <option>₹50+ Cr Ultra-Luxury</option>
                      <option>Commercial / Institutional</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-neutral-400 uppercase tracking-widest mb-1.5">
                    Property Requirements / Acquisition Scope
                  </label>
                  <textarea
                    rows={3}
                    value={inquiryForm.notes}
                    onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                    placeholder="Outline your preferred location, property type, budget, or acquisition preferences..."
                    className="w-full rounded-xl bg-black/60 border border-white/15 p-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#cca15c] transition-colors"
                  />
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <span className="text-xs text-neutral-400 font-light text-center sm:text-left">
                    Direct Concierge: <strong className="text-[#faead2]">Siddhu</strong>
                  </span>

                  {/* Submit Button with Conic Border Spin & Iridescent Shimmer on Hover */}
                  <div className="relative p-[1.5px] rounded-full overflow-hidden group/submit inline-flex w-full sm:w-auto shadow-xl">
                    <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,#cca15c,#faead2,#e5c596,#966b2d,#faead2,#cca15c)] animate-border-spin opacity-0 group-hover/submit:opacity-100 transition-opacity duration-500 pointer-events-none" />

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="relative z-10 w-full sm:w-auto px-8 sm:px-10 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-[#e5c596] via-[#faead2] to-[#cca15c] text-black font-bold text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(204,161,92,0.35)] transition-all duration-300 group-hover/submit:shadow-[0_15px_40px_rgba(0,0,0,0.7),0_0_40px_rgba(229,197,150,0.75)] group-hover/submit:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 overflow-hidden disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      <span className="absolute inset-0 -translate-x-full group-hover/submit:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/60 to-transparent pointer-events-none" />

                      {isSubmitting ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                          <span>Dispatching to Concierge...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Private Inquiry</span>
                          <span className="text-[10px] text-black/85 transition-transform duration-300 group-hover/submit:translate-x-1">✦</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* ======================================================== */}
      {/* 8. LUXURY FOOTER                                         */}
      {/* ======================================================== */}
      <footer id="footer" className="relative w-full border-t border-[#cca15c]/25 bg-[#07050a] text-white select-none overflow-hidden">
        {/* Background Image with Blur & Cinematic Vignette */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <Image
            src="/images/footer-bg.png"
            alt="Luxury Architectural Estate Workspace"
            fill
            sizes="100vw"
            priority={false}
            style={{ filter: "blur(2.5px)" }}
            className="object-cover object-center scale-105 opacity-55 brightness-85 transition-transform duration-1000"
          />

          {/* Vignette Layers */}
          {/* 1. Top linear fade from previous dark section */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#07050a] via-[#07050a]/45 to-[#07050a]/90 pointer-events-none" />
          
          {/* 2. Radial vignette for cinematic perimeter darkening */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "radial-gradient(ellipse 95% 75% at 50% 50%, rgba(7, 5, 10, 0.15) 0%, rgba(7, 5, 10, 0.6) 65%, rgba(7, 5, 10, 0.95) 100%)"
            }}
          />

          {/* 3. Dark backdrop tint for ultra-sharp typography contrast */}
          <div className="absolute inset-0 bg-[#07050a]/25 pointer-events-none" />
        </div>

        {/* Ambient Top Golden Rim Glow */}
        <div 
          aria-hidden="true" 
          className="absolute -top-16 left-1/2 -translate-x-1/2 w-3/4 max-w-3xl h-28 bg-[#cca15c]/15 blur-3xl pointer-events-none rounded-full" 
        />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#cca15c]/50 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-14 py-14 sm:py-16 lg:py-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-8 items-start justify-between">
            
            {/* Column 1: Brand Identity & DESIGNED BY SIDDHU (Span 4) */}
            <div className="md:col-span-4 flex flex-col items-start text-left">
              <button
                onClick={() => scrollToSection("home")}
                className="group flex items-center gap-3 text-left transition-transform duration-300 hover:scale-[1.02]"
                aria-label="Glorious Real Estates - Back to Top"
              >
                <div className="relative w-10 h-10 rounded-xl border border-[#cca15c]/80 bg-black/60 backdrop-blur-md flex items-center justify-center shadow-[0_0_20px_rgba(204,161,92,0.35)] group-hover:border-[#e5c596] group-hover:shadow-[0_0_25px_rgba(229,197,150,0.5)] transition-all duration-300">
                  <span className="font-serif text-2xl font-normal text-transparent bg-clip-text bg-gradient-to-b from-white via-[#faead2] to-[#e5c596] leading-none translate-y-[-1px]">
                    G
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="font-serif font-bold text-white text-base tracking-[0.24em] uppercase group-hover:text-[#faead2] transition-colors">
                    GLORIOUS
                  </span>
                  <span className="text-[#cca15c] font-mono text-[9px] tracking-[0.28em] uppercase font-semibold">
                    REAL ESTATES
                  </span>
                </div>
              </button>

              <p className="mt-3.5 text-xs text-neutral-300 font-light max-w-sm leading-relaxed">
                Curating extraordinary living spaces, private villas, and high-value architectural acquisitions across prime destinations.
              </p>

              {/* DESIGNED BY SIDDHU Badge with rich glowing effects */}
              <div className="mt-5 inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-[#17130e]/95 via-[#231b13]/95 to-[#17130e]/95 border border-[#cca15c]/55 hover:border-[#cca15c] shadow-[0_0_20px_rgba(204,161,92,0.22)] hover:shadow-[0_0_32px_rgba(204,161,92,0.45)] transition-all duration-300 relative overflow-hidden group cursor-default">
                {/* Shimmer light sweep */}
                <div 
                  aria-hidden="true" 
                  className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" 
                />
                
                {/* Glowing live beacon dot */}
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gradient-to-tr from-amber-400 to-yellow-200 shadow-[0_0_8px_#cca15c]" />
                </span>

                <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono tracking-[0.22em] text-neutral-300 uppercase">
                  <span>DESIGNED BY</span>
                  <span className="text-gold-shimmer font-serif font-black text-xs sm:text-sm tracking-[0.26em] drop-shadow-[0_0_10px_rgba(204,161,92,0.5)]">
                    SIDDHU
                  </span>
                  <span className="text-[#cca15c] text-[10px] opacity-75 group-hover:opacity-100 group-hover:rotate-45 transition-transform duration-300 ml-0.5">
                    ✦
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: WhatsApp Advisory (Span 4) - NO visible phone number, Siddhu's name featured */}
            <div className="md:col-span-4 flex flex-col items-start md:items-center text-left md:text-center">
              <span className="text-[10px] font-mono uppercase tracking-[0.26em] text-[#cca15c] font-semibold flex items-center gap-2 mb-3.5">
                <span className="text-[9px]">✦</span>
                <span>INSTANT PRIVATE ADVISORY</span>
                <span className="text-[9px]">✦</span>
              </span>

              <a
                href="https://wa.me/918080076322?text=Hello%20Siddhu%2C%20I%20am%20interested%20in%20Glorious%20Real%20Estate%20properties."
                target="_blank"
                rel="noopener noreferrer"
                className="group relative inline-flex items-center gap-3.5 px-6 py-3 rounded-full bg-gradient-to-r from-[#0d2215]/95 via-[#133522]/95 to-[#0d2215]/95 border border-emerald-500/50 hover:border-emerald-400 text-white shadow-[0_0_25px_rgba(37,211,102,0.28),0_0_15px_rgba(204,161,92,0.15)] hover:shadow-[0_0_40px_rgba(37,211,102,0.55),0_0_25px_rgba(204,161,92,0.3)] transition-all duration-300 hover:scale-[1.04] active:scale-[0.98] overflow-hidden"
              >
                {/* Light shimmer bar */}
                <div 
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
                />

                {/* Pulsing Emerald Dot */}
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_10px_#25D366]" />
                </span>

                {/* WhatsApp Logo Icon */}
                <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shrink-0 transition-transform duration-300 group-hover:scale-110">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.54 1.777.818 2.796.819h.005c3.181 0 5.767-2.586 5.768-5.766 0-3.181-2.587-5.766-5.773-5.766zm3.385 8.163c-.145.411-.74.757-1.028.799-.288.041-.663.061-1.077-.071-.414-.132-1.056-.377-1.803-1.041-.958-.853-1.571-1.921-1.688-2.079-.117-.158-.292-.387-.292-.741 0-.354.185-.528.251-.601.066-.073.145-.092.193-.092.048 0 .097 0 .14.002.045.002.106-.017.165.124.062.146.212.518.23.555.018.037.03.08.006.128-.024.048-.036.079-.072.122-.036.042-.077.094-.11.127-.036.036-.074.075-.032.147.042.073.187.307.401.498.275.245.508.321.58.358.073.037.115.031.158-.018.042-.05.182-.213.23-.286.048-.073.097-.061.163-.036.066.024.424.2.497.236.073.037.121.055.139.085.018.031.018.177-.127.588z" />
                  </svg>
                </div>

                {/* Siddhu Name & WhatsApp Title (NO PHONE NUMBER DIGITS DISPLAYED) */}
                <div className="flex flex-col text-left">
                  <span className="font-serif font-bold text-white text-sm sm:text-base tracking-wide group-hover:text-emerald-300 transition-colors">
                    Chat with Siddhu
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400/90 tracking-[0.2em] uppercase font-semibold">
                    Direct WhatsApp Advisory
                  </span>
                </div>
              </a>

              <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-neutral-400 tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Available Daily</span>
                <span className="text-neutral-600">•</span>
                <span>Confidential Consultation</span>
              </div>
            </div>

            {/* Column 3: Navigation Section (Span 4) - Symmetrically Aligned & Clean Hierarchy */}
            <div className="md:col-span-4 flex flex-col items-start md:items-end text-left md:text-right">
              <span className="text-[10px] font-mono uppercase tracking-[0.28em] text-[#cca15c] mb-3.5 font-semibold flex items-center gap-2">
                <span>DIRECTORY</span>
                <span className="text-[9px]">✦</span>
              </span>

              {/* Clean Structured 2-Column Grid for Links */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-xs font-mono w-full max-w-xs md:max-w-none justify-items-start md:justify-items-end">
                <button 
                  onClick={() => scrollToSection("home")} 
                  className="group flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
                >
                  <span className="text-[#cca15c] text-[9px] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">✦</span>
                  <span className="group-hover:text-[#faead2] transition-colors">Home</span>
                </button>
                <button 
                  onClick={() => scrollToSection("projects")} 
                  className="group flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
                >
                  <span className="text-[#cca15c] text-[9px] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">✦</span>
                  <span className="group-hover:text-[#faead2] transition-colors">Properties</span>
                </button>
                <button 
                  onClick={() => scrollToSection("services")} 
                  className="group flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
                >
                  <span className="text-[#cca15c] text-[9px] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">✦</span>
                  <span className="group-hover:text-[#faead2] transition-colors">Services</span>
                </button>
                <button 
                  onClick={() => scrollToSection("about")} 
                  className="group flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
                >
                  <span className="text-[#cca15c] text-[9px] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">✦</span>
                  <span className="group-hover:text-[#faead2] transition-colors">About</span>
                </button>
                <button 
                  onClick={() => scrollToSection("contact")} 
                  className="group flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
                >
                  <span className="text-[#cca15c] text-[9px] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">✦</span>
                  <span className="group-hover:text-[#faead2] transition-colors">Contact</span>
                </button>
                <button 
                  onClick={() => setShowModal(true)} 
                  className="group flex items-center gap-2 text-neutral-300 hover:text-white transition-colors"
                >
                  <span className="text-[#cca15c] text-[9px] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">✦</span>
                  <span className="group-hover:text-[#faead2] transition-colors">Private Tour</span>
                </button>
              </div>

              {/* Private Client Desk Location Badge */}
              <div className="mt-4 pt-3 border-t border-white/10 w-full max-w-xs md:max-w-none flex items-center justify-start md:justify-end gap-2 text-[10px] font-mono text-neutral-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[#cca15c] tracking-widest uppercase font-medium">Prime Desks:</span>
                <span className="text-neutral-200">Mumbai • Goa • Lonavala</span>
              </div>
            </div>

          </div>

          {/* Bottom Bar: Copyright & RERA / Advisory Notice */}
          <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
            <div className="text-[11px] font-mono text-neutral-400">
              © {new Date().getFullYear()} Glorious Real Estates. All rights reserved.
            </div>

            <div className="text-[10px] font-mono text-neutral-400 text-center">
              Licensed Real Estate Advisory & Private Portfolio Management
            </div>

            <button 
              onClick={() => scrollToSection("home")} 
              className="text-xs font-mono text-[#cca15c] hover:text-[#faead2] transition-colors flex items-center gap-1.5 group"
            >
              <span>Back to Top</span>
              <span className="transition-transform duration-200 group-hover:-translate-y-0.5">↑</span>
            </button>
          </div>
        </div>
      </footer>

      {/* ======================================================== */}
      {/* 8. INQUIRY / TOUR MODAL                                  */}
      {/* ======================================================== */}
      {showModal && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div className="relative w-full max-w-lg rounded-3xl bg-[#14100c] border border-[#e5c596]/30 p-7 sm:p-8 shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              aria-label="Close modal"
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
            >
              ✕
            </button>

            <div className="text-[10px] font-mono tracking-widest text-[#e5c596] uppercase font-bold mb-1">
              GLORIOUS INQUIRY
            </div>

            <h2 className="text-2xl font-serif font-bold text-white">
              Acquire a Glorious Property
            </h2>
            <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
              Connect with our private client advisory team to explore, acquire, or develop signature luxury properties.
            </p>

            <form onSubmit={handleInquirySubmit} className="mt-5 space-y-3">
              <input
                type="text"
                required
                value={inquiryForm.name}
                onChange={(e) => setInquiryForm({ ...inquiryForm, name: e.target.value })}
                placeholder="Your Name"
                className="w-full rounded-xl bg-black/40 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#cca15c]"
              />
              <input
                type="email"
                required
                value={inquiryForm.email}
                onChange={(e) => setInquiryForm({ ...inquiryForm, email: e.target.value })}
                placeholder="Email Address"
                className="w-full rounded-xl bg-black/40 border border-white/15 px-4 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#cca15c]"
              />
              <textarea
                rows={3}
                value={inquiryForm.notes}
                onChange={(e) => setInquiryForm({ ...inquiryForm, notes: e.target.value })}
                placeholder="Property Scope (Hillside Villa, Mumbai Sky Home, Penthouse...)"
                className="w-full rounded-xl bg-black/40 border border-white/15 p-4 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#cca15c]"
              />

              <div className="pt-2 flex items-center justify-between gap-3 text-[11px] text-neutral-400">
                <span>Direct Concierge: <strong className="text-[#faead2]">Siddhu</strong></span>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-full text-xs text-neutral-400 hover:text-white"
                >
                  Close
                </button>
                <div className="relative p-[1px] rounded-full overflow-hidden group/m-sub">
                  <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,#cca15c,#faead2,#e5c596,#cca15c)] animate-border-spin opacity-0 group-hover/m-sub:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="relative z-10 px-6 py-2.5 rounded-full bg-gradient-to-r from-[#e5c596] via-[#faead2] to-[#cca15c] text-black font-semibold text-xs shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Request</span>
                        <span>✦</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

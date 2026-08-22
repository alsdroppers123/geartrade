import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { GeartradeLogo } from './GeartradeLogo';

export interface HeroSlide {
  id: string;
  taglineLeft: string;
  taglineLeftSub: string;
  website: string;
  mainHeadline: string;
  image: string;
  theme: 'light' | 'dark';
}

export const GEARTRADE_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    taglineLeft: 'STEP IN',
    taglineLeftSub: 'STAND OUT',
    website: 'www.geartradenepal.com',
    mainHeadline: 'STEP INTO THE SUN IN STYLE',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1920&q=85',
    theme: 'light',
  },
  {
    id: 'slide-2',
    taglineLeft: 'HIMALAYAN',
    taglineLeftSub: 'PERFORMANCE',
    website: 'www.geartradenepal.com',
    mainHeadline: 'ENGINEERED FOR THE WILD TRAIL',
    image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1920&q=85',
    theme: 'light',
  },
  {
    id: 'slide-3',
    taglineLeft: 'ALPINE SERIES',
    taglineLeftSub: 'SPRING SUMMER 2026',
    website: 'www.geartradenepal.com',
    mainHeadline: 'ULTRA-LIGHT EXPEDITION WEAR',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1920&q=85',
    theme: 'light',
  },
];

export const SONAM_HERO_SLIDES = GEARTRADE_HERO_SLIDES;

// For backward compatibility with existing App.tsx props
export const DEFAULT_HERO_SLIDES = GEARTRADE_HERO_SLIDES.map((s) => ({
  id: s.id,
  titleTop: s.taglineLeft,
  titleMain: s.mainHeadline,
  collection: s.taglineLeftSub,
  description: s.website,
  image: s.image,
  ctaText: 'SHOP NOW',
  targetCategory: 'mens',
}));

interface HeroBannerProps {
  onExplore?: () => void;
  onSelectCategory?: (cat: any) => void;
  featuredProducts?: any[];
  customSlides?: any[];
  isAdmin?: boolean;
  onOpenVisualStudio?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExplore,
  onSelectCategory,
  customSlides,
}) => {
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);

  const rawSlides = customSlides && customSlides.length > 0 ? customSlides : SONAM_HERO_SLIDES;
  const slides = rawSlides.map((s: any, idx: number) => ({
    id: s.id || `slide-${idx}`,
    taglineLeft: s.taglineLeft || s.titleTop || 'STEP IN',
    taglineLeftSub: s.taglineLeftSub || s.collection || 'STAND OUT',
    website: s.website || s.description || 'www.geartradenepal.com',
    mainHeadline: s.mainHeadline || s.titleMain || 'STEP INTO THE SUN IN STYLE',
    image: s.image,
    targetCategory: s.targetCategory,
    theme: s.theme || 'light',
  }));

  // Ensure currentSlideIdx is always valid when slides array changes
  const activeSlideIdx = Math.min(currentSlideIdx, Math.max(0, slides.length - 1));

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlideIdx((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => {
    setCurrentSlideIdx((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlideIdx((prev) => (prev + 1) % slides.length);
  };

  const slide = slides[activeSlideIdx];

  const handleShopNowClick = () => {
    if (slide.targetCategory && onSelectCategory) {
      onSelectCategory(slide.targetCategory);
    }
    const el = document.getElementById('catalog-section');
    el?.scrollIntoView({ behavior: 'smooth' });
    if (onExplore) onExplore();
  };

  return (
    <section className="w-full bg-white dark:bg-stone-950 select-none font-sans transition-colors duration-150">
      {/* 1. Full-Width Hero Image Slider with Banner Typography */}
      <div className="relative w-full h-[320px] sm:h-[420px] md:h-[500px] lg:h-[560px] overflow-hidden bg-stone-100 dark:bg-stone-900">
        {/* Render Slides */}
        {slides.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === activeSlideIdx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
            }`}
          >
            {/* Background Editorial Model Photography */}
            <img
              src={s.image}
              alt={s.mainHeadline}
              className="w-full h-full object-cover object-center"
            />

            {/* Subtle Gradient Overlays matching Sonam aesthetic */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Top Left Brand Typography: STEP IN STAND OUT */}
            <div className="absolute top-8 left-6 sm:top-12 sm:left-14 text-white z-20">
              <div className="space-y-0.5">
                <p className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-wider leading-none uppercase drop-shadow-md">
                  {s.taglineLeft}
                </p>
                <p className="text-xl sm:text-3xl lg:text-4xl font-extrabold tracking-wider leading-none uppercase drop-shadow-md text-stone-100">
                  {s.taglineLeftSub}
                </p>
              </div>
              <p className="text-[10px] sm:text-xs text-stone-200 tracking-widest mt-2 font-mono uppercase drop-shadow-xs">
                {s.website}
              </p>
            </div>

            {/* Top Right Geartrade Brand Watermark */}
            <div className="absolute top-8 right-6 sm:top-12 sm:right-14 z-20 hidden sm:block">
              <GeartradeLogo size="md" variant="full" theme="white" className="drop-shadow-lg opacity-90" />
            </div>

            {/* Center Bottom Headline */}
            <div className="absolute inset-x-0 bottom-12 sm:bottom-16 text-center z-20 px-4">
              <h2 className="text-xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white uppercase tracking-[0.12em] drop-shadow-lg">
                {s.mainHeadline}
              </h2>
            </div>
          </div>
        ))}

        {/* Left Directional Arrow Button */}
        <button
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/70 dark:bg-black/60 hover:bg-white dark:hover:bg-black/90 text-stone-900 dark:text-white shadow-md backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer hover:scale-105"
        >
          <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Right Directional Arrow Button */}
        <button
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/70 dark:bg-black/60 hover:bg-white dark:hover:bg-black/90 text-stone-900 dark:text-white shadow-md backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer hover:scale-105"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        {/* Bottom Slide Dots */}
        <div className="absolute bottom-4 left-6 sm:left-14 z-30 flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIdx(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all rounded-full ${
                idx === activeSlideIdx
                  ? 'w-6 h-2 bg-white'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      </div>

      {/* 2. Distinctive 'SHOP NOW' Sub-Header below hero (From Screenshot 1) */}
      <div className="text-center py-7 sm:py-9 border-b border-stone-100 dark:border-stone-900">
        <button
          onClick={handleShopNowClick}
          className="text-xs sm:text-sm font-bold uppercase tracking-[0.25em] text-black dark:text-stone-100 hover:text-[#16a34a] dark:hover:text-[#22c55e] transition-colors cursor-pointer inline-flex items-center gap-2 group"
        >
          <span>SHOP NOW</span>
        </button>
      </div>
    </section>
  );
};

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, Camera } from 'lucide-react';
import { Product, HeroSlideItem, ProductCategory } from '../types';

interface HeroBannerProps {
  onExplore: () => void;
  onSelectCategory: (cat: any) => void;
  featuredProducts?: Product[];
  customSlides?: HeroSlideItem[];
  isAdmin?: boolean;
  onOpenVisualStudio?: () => void;
}

export const DEFAULT_HERO_SLIDES: HeroSlideItem[] = [
  {
    id: 'slide-1',
    titleTop: 'HIMALAYAN PERFORMANCE LOOKBOOK',
    titleMain: 'ENGINEERED FOR THE WILD',
    collection: 'SPRING / SUMMER 2026 EDITORIAL',
    description: 'Ultra-durable technical shells, quick-dry trail layers, and alpine-grade windcheaters modeled for high-altitude resilience and urban gorpcore style.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1920&q=85',
    ctaText: 'SHOP MEN',
    targetCategory: 'mens',
  },
  {
    id: 'slide-2',
    titleTop: 'EXPEDITION & BACKCOUNTRY SERIES',
    titleMain: 'ALL-WEATHER TRAIL PERFORMANCE',
    collection: 'TECHNICAL PACKS & FOOTWEAR',
    description: 'Waterproof 45L trekking packs, carbon speedlock poles, and high-traction trail footwear modeled on demanding alpine ridges.',
    image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1920&q=85',
    ctaText: 'EXPLORE GEARS',
    targetCategory: 'bags_gears',
  },
  {
    id: 'slide-3',
    titleTop: 'LIGHTWEIGHT ALPINE MOUNTAIN WEAR',
    titleMain: 'PEAK AGILITY ON EVERY SUMMIT',
    collection: 'WOMEN’S MOUNTAIN SERIES',
    description: '4-way ergonomic stretch shells and thermal fleeces tailored for extreme comfort across Annapurna and Everest routes.',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1920&q=85',
    ctaText: 'SHOP WOMEN',
    targetCategory: 'womens',
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExplore,
  onSelectCategory,
  featuredProducts = [],
  customSlides,
  isAdmin = false,
  onOpenVisualStudio,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroProducts = featuredProducts.filter((p) => p.displaySection === 'hero_showcase');

  // Use custom slides if provided, otherwise use heroProducts if any, else default slides
  const activeSlides: HeroSlideItem[] = (customSlides && customSlides.length > 0)
    ? customSlides
    : heroProducts.length > 0
    ? heroProducts.map((p, idx) => ({
        id: p.id,
        titleTop: p.badge || p.collection || 'EXPEDITION GEAR',
        titleMain: p.name.toUpperCase(),
        collection: p.origin || 'TECHNICAL SERIES',
        description: p.description,
        image: p.images[0] || DEFAULT_HERO_SLIDES[idx % DEFAULT_HERO_SLIDES.length].image,
        ctaText: `SHOP NOW`,
        targetCategory: p.category,
      }))
    : DEFAULT_HERO_SLIDES;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [activeSlides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? activeSlides.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  const slide = activeSlides[currentSlide] || activeSlides[0];

  return (
    <div className="relative w-full bg-stone-950 overflow-hidden select-none font-sans">
      {/* Background Image Carousel */}
      <div className="relative h-[380px] sm:h-[460px] lg:h-[540px] w-full">
        {activeSlides.map((s, idx) => (
          <div
            key={s.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              idx === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
            }`}
          >
            <img
              src={s.image}
              alt={s.titleMain}
              className="w-full h-full object-cover object-center"
            />
            {/* Minimal High-End Gradient Mask */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          </div>
        ))}

        {/* Content Container */}
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl space-y-4">
              {/* Minimal Collection Eyebrow */}
              <div className="inline-flex items-center gap-2 text-stone-300 text-[10px] sm:text-[11px] font-bold tracking-[0.25em] uppercase">
                <span className="w-1.5 h-1.5 bg-white rounded-full" />
                <span>{slide.collection}</span>
              </div>

              {/* Headings */}
              <div className="space-y-1.5">
                <p className="text-[11px] sm:text-xs font-semibold tracking-[0.2em] text-stone-300 uppercase">
                  {slide.titleTop}
                </p>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-tight">
                  {slide.titleMain}
                </h1>
              </div>

              <p className="text-stone-300 text-xs sm:text-sm max-w-lg line-clamp-2 leading-relaxed font-light">
                {slide.description}
              </p>

              {/* Minimalist Action Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={() => {
                    onSelectCategory(slide.targetCategory);
                    onExplore();
                  }}
                  className="px-7 py-3 bg-white hover:bg-stone-200 text-black font-extrabold text-xs tracking-[0.18em] uppercase rounded-none transition-all shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={onExplore}
                  className="px-6 py-3 border border-white/60 hover:border-white text-white hover:bg-white/10 font-bold text-xs tracking-[0.18em] uppercase rounded-none transition-all cursor-pointer backdrop-blur-xs"
                >
                  <span>VIEW ALL</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Quick Photo Edit Trigger */}
        {isAdmin && onOpenVisualStudio && (
          <button
            onClick={onOpenVisualStudio}
            className="absolute top-4 right-4 z-30 px-3 py-1.5 bg-black/80 hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 border border-white/30 backdrop-blur-xs shadow-lg cursor-pointer transition-all"
            title="Edit hero photos & slides"
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Admin: Change Photos</span>
          </button>
        )}

        {/* Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/40 hover:bg-black text-white backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 bg-black/40 hover:bg-black text-white backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Minimal Slide Indicator Lines */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-[2px] transition-all cursor-pointer ${
                idx === currentSlide ? 'w-8 bg-white' : 'w-3 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};


import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowRight, ShieldCheck, QrCode, Sparkles } from 'lucide-react';
import { GeartradeLogo } from './GeartradeLogo';
import { Product } from '../types';

interface HeroBannerProps {
  onExplore: () => void;
  onSelectCategory: (cat: any) => void;
  featuredProducts?: Product[];
}

interface Slide {
  id: number | string;
  titleTop: string;
  titleMain: string;
  collection: string;
  description: string;
  image: string;
  ctaText: string;
  targetCategory: string;
}

const DEFAULT_SLIDES: Slide[] = [
  {
    id: 1,
    titleTop: 'HIMALAYAN PERFORMANCE WEAR',
    titleMain: 'STEP INTO THE SUN IN STYLE',
    collection: 'SPRING SUMMER 2026',
    description: 'Engineered for high altitude trails, urban commutes, and unpredictable mountain weather with ultra-durable flex nylon and DWR weather protection.',
    image: 'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1920&q=85',
    ctaText: 'Shop Collection',
    targetCategory: 'mens',
  },
  {
    id: 2,
    titleTop: 'EXPEDITION & WATERPROOF SERIES',
    titleMain: 'ALL-WEATHER TRAIL PERFORMANCE',
    collection: 'TECHNICAL PACKS & FOOTWEAR',
    description: 'Explore 45L waterproof expedition packs, carbon speedlock trekking poles, and deep-lug Vibram traction footwear.',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=85',
    ctaText: 'Explore Gears',
    targetCategory: 'bags_gears',
  },
  {
    id: 3,
    titleTop: 'LIGHTWEIGHT & AGILITY',
    titleMain: 'EMPOWER YOUR NEXT SUMMIT',
    collection: 'WOMEN’S TRAIL APPAREL',
    description: 'Ergonomic 4-way stretch jackets and quick-dry apparel crafted for peak agility across Annapurna, Langtang, and Everest trails.',
    image: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1920&q=85',
    ctaText: 'Shop Women',
    targetCategory: 'womens',
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExplore,
  onSelectCategory,
  featuredProducts = [],
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // If admin has set products with displaySection === 'hero_showcase', prioritize them as slides!
  const heroProducts = featuredProducts.filter((p) => p.displaySection === 'hero_showcase');

  const activeSlides: Slide[] = heroProducts.length > 0
    ? heroProducts.map((p, idx) => ({
        id: p.id,
        titleTop: p.badge || p.collection || 'SPOTLIGHT EXPEDITION GEAR',
        titleMain: p.name.toUpperCase(),
        collection: p.origin || 'GEARTRADE TECHNICAL',
        description: p.description,
        image: p.images[0] || DEFAULT_SLIDES[idx % DEFAULT_SLIDES.length].image,
        ctaText: `Shop ${p.name.split(' ')[0]}`,
        targetCategory: p.category,
      }))
    : DEFAULT_SLIDES;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 6500);
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
    <div className="relative w-full bg-stone-950 overflow-hidden select-none">
      {/* Background Image Carousel with Clean Minimal Overlay */}
      <div className="relative h-[340px] sm:h-[420px] lg:h-[480px] w-full">
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
            {/* Elegant Vignette Mask */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          </div>
        ))}

        {/* Content Container */}
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-xl space-y-3.5">
              {/* Minimal Collection Eyebrow */}
              <div className="inline-flex items-center gap-2 text-stone-300 text-[11px] font-bold tracking-widest uppercase">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DE4B56]" />
                <span>{slide.collection}</span>
              </div>

              {/* Headings */}
              <div className="space-y-1">
                <p className="text-xs font-bold tracking-widest text-[#F5A623] uppercase">
                  {slide.titleTop}
                </p>
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-tight">
                  {slide.titleMain}
                </h1>
              </div>

              <p className="text-slate-300 text-xs sm:text-sm max-w-lg line-clamp-2 leading-relaxed font-normal">
                {slide.description}
              </p>

              {/* Single Minimalist Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => {
                    onSelectCategory(slide.targetCategory);
                    onExplore();
                  }}
                  className="px-6 py-2.5 bg-white hover:bg-stone-100 text-stone-900 font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <span>{slide.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-900" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Carousel Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
          aria-label="Previous Slide"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/30 hover:bg-black/60 text-white backdrop-blur-xs transition-colors cursor-pointer border border-white/10"
          aria-label="Next Slide"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Minimal Slide Indicator Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
          {activeSlides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                idx === currentSlide ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

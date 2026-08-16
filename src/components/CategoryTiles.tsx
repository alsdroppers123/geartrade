import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { ProductCategory } from '../types';

interface CategoryTilesProps {
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
}

interface CategoryCardItem {
  id: ProductCategory;
  title: string;
  subtitle: string;
  image: string;
  itemCount: string;
}

const CATEGORY_CARDS: CategoryCardItem[] = [
  {
    id: 'mens',
    title: "MEN'S",
    subtitle: 'Windcheaters & Flex Pants',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
    itemCount: '18+ Items',
  },
  {
    id: 'womens',
    title: "WOMEN'S",
    subtitle: 'Trail Shells & Trekkers',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80',
    itemCount: '14+ Items',
  },
  {
    id: 'kids',
    title: "KIDS'",
    subtitle: 'Junior Adventure Gear',
    image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=600&q=80',
    itemCount: '10+ Items',
  },
  {
    id: 'bags_gears',
    title: 'BAGS&GEARS',
    subtitle: '45L Packs & Carbon Poles',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    itemCount: '16+ Items',
  },
  {
    id: 'shoes',
    title: 'SHOES',
    subtitle: 'Vibram Traction & Trail Runners',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
    itemCount: '12+ Items',
  },
];

export const CategoryTiles: React.FC<CategoryTilesProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-6">
        <div>
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#DE4B56]">
            EXPLORE COLLECTIONS
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#102A45] tracking-tight uppercase mt-0.5">
            SHOP BY CATEGORY
          </h2>
        </div>
        <button
          onClick={() => onSelectCategory('all')}
          className="text-xs font-bold text-[#102A45] hover:text-[#DE4B56] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>View All Products</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 5 Category Cards Grid matching Image 2 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {CATEGORY_CARDS.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group relative h-64 sm:h-72 rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 border ${
                isSelected
                  ? 'border-[#102A45] ring-2 ring-[#102A45] scale-[1.02]'
                  : 'border-stone-200 hover:border-stone-300'
              }`}
            >
              {/* Background Photo */}
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                loading="lazy"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 group-hover:from-black/90 transition-colors" />

              {/* Centered / Bottom Card Typography */}
              <div className="absolute inset-0 p-4 flex flex-col justify-end text-white">
                <span className="text-[10px] font-bold text-[#F5A623] tracking-widest uppercase mb-1">
                  {cat.itemCount}
                </span>

                <h3 className="text-base sm:text-lg font-black tracking-wider uppercase text-white leading-tight drop-shadow-md group-hover:text-amber-200 transition-colors">
                  {cat.title}
                </h3>

                <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5 opacity-90">
                  {cat.subtitle}
                </p>

                {/* Explore Pill Button */}
                <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between text-[11px] font-bold text-white group-hover:text-[#DE4B56] transition-colors">
                  <span>SHOP NOW</span>
                  <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

import React from 'react';
import { ArrowRight, Camera } from 'lucide-react';
import { ProductCategory, CategoryTileItem } from '../types';

interface CategoryTilesProps {
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  customCards?: CategoryTileItem[];
  isAdmin?: boolean;
  onOpenVisualStudio?: () => void;
}

export const DEFAULT_CATEGORY_CARDS: CategoryTileItem[] = [
  {
    id: 'mens',
    title: "MEN'S APPAREL",
    subtitle: 'Windcheaters, Down Jackets & Trek Pants',
    image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80',
    itemCount: 'EXPLORE',
  },
  {
    id: 'womens',
    title: "WOMEN'S COLLECTION",
    subtitle: 'Lightweight Shells, Fleeces & Trekkers',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    itemCount: 'EXPLORE',
  },
  {
    id: 'bags_gears',
    title: 'BACKPACKS & GEARS',
    subtitle: '45L-65L Packs, Carbon Poles & Tents',
    image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
    itemCount: 'EXPLORE',
  },
  {
    id: 'shoes',
    title: 'FOOTWEAR',
    subtitle: 'Traction Trail Runners & Alpine Boots',
    image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=80',
    itemCount: 'EXPLORE',
  },
  {
    id: 'kids',
    title: "JUNIOR & KIDS",
    subtitle: 'Youth Thermal Layers & Rainwear',
    image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
    itemCount: 'EXPLORE',
  },
];

export const CategoryTiles: React.FC<CategoryTilesProps> = ({
  selectedCategory,
  onSelectCategory,
  customCards,
  isAdmin = false,
  onOpenVisualStudio,
}) => {
  const cards = (customCards && customCards.length > 0) ? customCards : DEFAULT_CATEGORY_CARDS;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 font-sans">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-7 border-b border-stone-200 dark:border-stone-800 pb-4 transition-colors">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-stone-400 dark:text-stone-500 block mb-1">
            CURATED COLLECTIONS
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-black dark:text-white tracking-tight uppercase">
            SHOP BY CATEGORY
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && onOpenVisualStudio && (
            <button
              onClick={onOpenVisualStudio}
              className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border border-stone-300 dark:border-stone-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-amber-500" />
              <span>Change Photos</span>
            </button>
          )}
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs font-bold text-black dark:text-stone-300 hover:text-stone-600 dark:hover:text-white transition-colors flex items-center gap-1 cursor-pointer uppercase tracking-wider"
          >
            <span>View All Gear</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Category Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {cards.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group relative h-72 sm:h-80 overflow-hidden cursor-pointer transition-all duration-300 border ${
                isSelected
                  ? 'border-black dark:border-white ring-1 ring-black dark:ring-white scale-[1.01]'
                  : 'border-stone-200 dark:border-stone-850 hover:shadow-lg'
              }`}
            >
              {/* Background Photo */}
              <img
                src={cat.image}
                alt={cat.title}
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out"
                loading="lazy"
              />

              {/* Dark Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent group-hover:from-black/95 transition-colors" />

              {/* Card Typography */}
              <div className="absolute inset-0 p-4 sm:p-5 flex flex-col justify-end text-white">
                <span className="text-[9px] font-bold text-stone-300 tracking-[0.2em] uppercase mb-1">
                  GEARTRADE SERIES
                </span>

                <h3 className="text-sm sm:text-base font-black tracking-wide uppercase text-white leading-tight">
                  {cat.title}
                </h3>

                <p className="text-[11px] text-stone-300 font-light truncate mt-0.5 opacity-80">
                  {cat.subtitle}
                </p>

                {/* Explore Action */}
                <div className="mt-3 pt-2 border-t border-white/20 flex items-center justify-between text-[10px] font-bold tracking-widest text-white uppercase group-hover:text-stone-200 transition-colors">
                  <span>SHOP NOW</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

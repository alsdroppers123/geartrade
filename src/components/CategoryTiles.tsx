import React from 'react';
import { ProductCategory, CategoryTileItem } from '../types';

interface CategoryTilesProps {
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  customCards?: CategoryTileItem[];
  isAdmin?: boolean;
  onOpenVisualStudio?: () => void;
}

export const GEARTRADE_CATEGORY_CARDS: CategoryTileItem[] = [
  {
    id: 'mens',
    title: "MEN'S",
    subtitle: 'Jackets, Pants & Windcheaters',
    image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80',
    itemCount: 'EXPLORE',
  },
  {
    id: 'womens',
    title: "WOMEN'S",
    subtitle: 'Down Fleeces & Trail Shells',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    itemCount: 'EXPLORE',
  },
  {
    id: 'kids',
    title: "KIDS'",
    subtitle: 'Junior Layers & Rainwear',
    image: 'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
    itemCount: 'EXPLORE',
  },
  {
    id: 'bags_gears',
    title: 'BAGS&GEARS',
    subtitle: '45L-65L Packs & Poles',
    image: 'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
    itemCount: 'EXPLORE',
  },
  {
    id: 'shoes',
    title: 'SHOES',
    subtitle: 'Trail Runners & Alpine Boots',
    image: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=80',
    itemCount: 'EXPLORE',
  },
];

export const SONAM_CATEGORY_CARDS = GEARTRADE_CATEGORY_CARDS;
export const DEFAULT_CATEGORY_CARDS = GEARTRADE_CATEGORY_CARDS;

export const CategoryTiles: React.FC<CategoryTilesProps> = ({
  selectedCategory,
  onSelectCategory,
  customCards,
}) => {
  const cards = customCards && customCards.length > 0 ? customCards : SONAM_CATEGORY_CARDS;

  const handleClick = (catId: string) => {
    onSelectCategory(catId as ProductCategory);
    const el = document.getElementById('catalog-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 sm:pb-14 font-sans">
      {/* 5-Column Category Tiles Grid (Exact match to Screenshot 1) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {cards.map((card) => {
          const isSelected = selectedCategory === card.id;
          return (
            <div
              key={card.id}
              onClick={() => handleClick(card.id)}
              className={`group relative aspect-[3/4] overflow-hidden rounded-xl bg-stone-100 dark:bg-stone-900 cursor-pointer border transition-all duration-300 ${
                isSelected
                  ? 'border-[#16a34a] ring-2 ring-[#16a34a] ring-offset-2 ring-offset-white dark:ring-offset-stone-950 shadow-md'
                  : 'border-stone-200 dark:border-stone-800 hover:border-black dark:hover:border-stone-400 hover:shadow-lg'
              }`}
            >
              {/* Category Photography */}
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />

              {/* Light Overlay */}
              <div className="absolute inset-0 bg-black/25 group-hover:bg-black/35 transition-colors" />

              {/* Centered Bold Category Title */}
              <div className="absolute inset-0 flex items-center justify-center p-3 text-center">
                <h3 className="text-sm sm:text-base lg:text-lg font-black uppercase text-white tracking-widest drop-shadow-md">
                  {card.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

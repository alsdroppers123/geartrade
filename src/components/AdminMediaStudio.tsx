import React, { useState } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Layers,
  Save,
  Check,
  RefreshCw,
  Search,
  ExternalLink,
  ChevronRight,
  Sliders,
  Grid,
} from 'lucide-react';
import { HeroSlideItem, CategoryTileItem, Product, ProductCategory } from '../types';
import { ImageUploadInput } from './ImageUploadInput';
import { DEFAULT_HERO_SLIDES } from './HeroBanner';
import { DEFAULT_CATEGORY_CARDS } from './CategoryTiles';

interface AdminMediaStudioProps {
  heroSlides: HeroSlideItem[];
  onUpdateHeroSlides: (slides: HeroSlideItem[]) => void;
  categoryCards: CategoryTileItem[];
  onUpdateCategoryCards: (cards: CategoryTileItem[]) => void;
  products: Product[];
  onUpdateProduct: (product: Product) => void;
  onSaveToast: (msg: string) => void;
  onPreviewFrontPage: () => void;
}

const PRESET_EDITORIAL_HEROES = [
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1920&q=85',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1920&q=85',
];

const PRESET_CATEGORY_LOOKS = [
  'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=800&q=80',
];

export const AdminMediaStudio: React.FC<AdminMediaStudioProps> = ({
  heroSlides,
  onUpdateHeroSlides,
  categoryCards,
  onUpdateCategoryCards,
  products,
  onUpdateProduct,
  onSaveToast,
  onPreviewFrontPage,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'hero' | 'categories' | 'products'>('hero');
  const [selectedProductForGallery, setSelectedProductForGallery] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  // --- Hero Slides Operations ---
  const handleUpdateSlideField = (index: number, field: keyof HeroSlideItem, val: any) => {
    const updated = [...heroSlides];
    updated[index] = { ...updated[index], [field]: val };
    onUpdateHeroSlides(updated);
    onSaveToast(`Updated Hero Slide ${index + 1}`);
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlideItem = {
      id: `slide-${Date.now()}`,
      titleTop: 'NEW EXPEDITION COLLECTION',
      titleMain: 'TRAIL READY ADVENTURE',
      collection: 'HIMALAYA 2026',
      description: 'Engineered in Nepal with triple-reinforced technical fabric for extreme weather endurance.',
      image: PRESET_EDITORIAL_HEROES[heroSlides.length % PRESET_EDITORIAL_HEROES.length],
      ctaText: 'EXPLORE NOW',
      targetCategory: 'mens',
    };
    const updated = [...heroSlides, newSlide];
    onUpdateHeroSlides(updated);
    onSaveToast('Added new Hero Carousel Slide');
  };

  const handleDeleteSlide = (index: number) => {
    if (heroSlides.length <= 1) {
      alert('You must keep at least 1 hero banner slide.');
      return;
    }
    const updated = heroSlides.filter((_, idx) => idx !== index);
    onUpdateHeroSlides(updated);
    onSaveToast('Removed Hero Slide');
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= heroSlides.length) return;
    const updated = [...heroSlides];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onUpdateHeroSlides(updated);
    onSaveToast('Reordered Hero Slides');
  };

  const handleResetHeroSlides = () => {
    onUpdateHeroSlides(DEFAULT_HERO_SLIDES);
    onSaveToast('Reset Hero Carousel to Default Lookbook Presets');
  };

  // --- Category Cards Operations ---
  const handleUpdateCategoryCard = (index: number, field: keyof CategoryTileItem, val: any) => {
    const updated = [...categoryCards];
    updated[index] = { ...updated[index], [field]: val };
    onUpdateCategoryCards(updated);
    onSaveToast(`Updated Category Photo & Title for ${updated[index].title}`);
  };

  const handleResetCategoryCards = () => {
    onUpdateCategoryCards(DEFAULT_CATEGORY_CARDS);
    onSaveToast('Reset Category Discovery Cards to Default Presets');
  };

  // --- Product Gallery Operations ---
  const handleAddPhotoToProduct = (prod: Product, newImageUrl: string) => {
    if (!newImageUrl.trim()) return;
    const updatedImages = [...prod.images, newImageUrl.trim()];
    const updatedProduct = { ...prod, images: updatedImages };
    onUpdateProduct(updatedProduct);
    setSelectedProductForGallery(updatedProduct);
    onSaveToast(`Added new photo to ${prod.name}`);
  };

  const handleRemovePhotoFromProduct = (prod: Product, imgIndex: number) => {
    if (prod.images.length <= 1) {
      alert('Product must have at least 1 primary photo.');
      return;
    }
    const updatedImages = prod.images.filter((_, idx) => idx !== imgIndex);
    const updatedProduct = { ...prod, images: updatedImages };
    onUpdateProduct(updatedProduct);
    setSelectedProductForGallery(updatedProduct);
    onSaveToast('Photo removed');
  };

  const handleSetPrimaryProductPhoto = (prod: Product, imgIndex: number) => {
    if (imgIndex === 0) return;
    const selectedImg = prod.images[imgIndex];
    const remaining = prod.images.filter((_, idx) => idx !== imgIndex);
    const updatedImages = [selectedImg, ...remaining];
    const updatedProduct = { ...prod, images: updatedImages };
    onUpdateProduct(updatedProduct);
    setSelectedProductForGallery(updatedProduct);
    onSaveToast('Set as Primary Cover Photo');
  };

  const handleReplaceProductPhoto = (prod: Product, imgIndex: number, newUrl: string) => {
    if (!newUrl.trim()) return;
    const updatedImages = [...prod.images];
    updatedImages[imgIndex] = newUrl.trim();
    const updatedProduct = { ...prod, images: updatedImages };
    onUpdateProduct(updatedProduct);
    setSelectedProductForGallery(updatedProduct);
    onSaveToast(`Replaced photo ${imgIndex + 1} for ${prod.name}`);
  };

  // Filtered products for quick media manager
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.styleCode.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-8 font-sans pb-16">
      {/* Studio Header */}
      <div className="bg-stone-950 text-white p-6 sm:p-8 border border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-stone-400 text-xs font-mono tracking-widest uppercase">
            <Camera className="w-4 h-4 text-amber-400" />
            <span>Storefront Media & Visuals Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Photo & Lookbook Manager
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm max-w-2xl font-light">
            Upload custom photos from your device or paste web URLs for every single image across the front page, hero carousel, category cards, and product lookbooks.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onPreviewFrontPage}
            className="px-4 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-stone-200 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Preview Front Page</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-300 dark:border-stone-800 pb-3">
        <button
          onClick={() => setActiveSubTab('hero')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border ${
            activeSubTab === 'hero'
              ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
              : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:border-black dark:hover:border-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Hero Banner Carousel ({heroSlides.length} Slides)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('categories')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border ${
            activeSubTab === 'categories'
              ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
              : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:border-black dark:hover:border-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Category Discovery Tiles ({categoryCards.length} Cards)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('products')}
          className={`px-5 py-2.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer border ${
            activeSubTab === 'products'
              ? 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white'
              : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-300 border-stone-300 dark:border-stone-700 hover:border-black dark:hover:border-white'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Product Catalog Photos ({products.length} Products)</span>
        </button>
      </div>

      {/* ================= SECTION 1: HERO CAROUSEL SLIDES ================= */}
      {activeSubTab === 'hero' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-100 dark:bg-stone-900 p-4 border border-stone-200 dark:border-stone-800">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Front Page Hero Carousel Slides
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-light">
                Each slide rotates automatically on the top banner. Upload high-resolution landscape images (1920×850 recommended).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleResetHeroSlides}
                className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Presets</span>
              </button>
              <button
                onClick={handleAddSlide}
                className="px-4 py-1.5 text-xs font-bold uppercase tracking-wider bg-black dark:bg-white text-white dark:text-black hover:bg-stone-800 dark:hover:bg-stone-200 flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Slide</span>
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {heroSlides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 p-5 sm:p-6 shadow-xs space-y-5"
              >
                {/* Slide Top Bar Controls */}
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-xs font-mono font-bold">
                      {idx + 1}
                    </span>
                    <h3 className="text-sm font-bold uppercase text-stone-900 dark:text-stone-100">
                      Hero Slide #{idx + 1}: {slide.titleMain || 'Untitled'}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleMoveSlide(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1.5 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 disabled:opacity-30 cursor-pointer"
                      title="Move slide earlier"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleMoveSlide(idx, 'down')}
                      disabled={idx === heroSlides.length - 1}
                      className="p-1.5 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 disabled:opacity-30 cursor-pointer"
                      title="Move slide later"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSlide(idx)}
                      className="p-1.5 border border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 cursor-pointer ml-2"
                      title="Delete slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Photo Upload Control */}
                  <div className="lg:col-span-5 space-y-3">
                    <ImageUploadInput
                      label="Slide Photo (Upload or URL)"
                      sublabel="Upload photo from device or paste link"
                      value={slide.image}
                      onChange={(newUrl) => handleUpdateSlideField(idx, 'image', newUrl)}
                      aspectRatio="wide"
                      presetOptions={PRESET_EDITORIAL_HEROES}
                    />
                  </div>

                  {/* Right Column: Slide Text & Action Details */}
                  <div className="lg:col-span-7 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                          Eyebrow Subtitle (Top Line)
                        </label>
                        <input
                          type="text"
                          value={slide.titleTop}
                          onChange={(e) => handleUpdateSlideField(idx, 'titleTop', e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-black dark:focus:border-white font-medium"
                          placeholder="e.g. HIMALAYAN PERFORMANCE LOOKBOOK"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                          Collection Tag
                        </label>
                        <input
                          type="text"
                          value={slide.collection}
                          onChange={(e) => handleUpdateSlideField(idx, 'collection', e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-black dark:focus:border-white font-medium"
                          placeholder="e.g. SPRING / SUMMER 2026 EDITORIAL"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                        Main Display Headline (H1)
                      </label>
                      <input
                        type="text"
                        value={slide.titleMain}
                        onChange={(e) => handleUpdateSlideField(idx, 'titleMain', e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-black dark:focus:border-white font-black uppercase tracking-tight text-sm"
                        placeholder="e.g. ENGINEERED FOR THE WILD"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                        Slide Story Description
                      </label>
                      <textarea
                        rows={2}
                        value={slide.description}
                        onChange={(e) => handleUpdateSlideField(idx, 'description', e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-black dark:focus:border-white font-light leading-relaxed"
                        placeholder="Brief summary of the collection or gear shown in the photo."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                          Button CTA Text
                        </label>
                        <input
                          type="text"
                          value={slide.ctaText}
                          onChange={(e) => handleUpdateSlideField(idx, 'ctaText', e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-black dark:focus:border-white font-bold"
                          placeholder="e.g. SHOP MEN"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                          Destination Category
                        </label>
                        <select
                          value={slide.targetCategory}
                          onChange={(e) => handleUpdateSlideField(idx, 'targetCategory', e.target.value as ProductCategory)}
                          className="w-full px-3 py-2 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-black dark:focus:border-white font-bold uppercase"
                        >
                          <option value="all">All Outdoor Collections</option>
                          <option value="mens">Men's Apparel</option>
                          <option value="womens">Women's Collection</option>
                          <option value="kids">Junior & Kids</option>
                          <option value="bags_gears">Backpacks & Gears</option>
                          <option value="shoes">Footwear</option>
                          <option value="accessories">Accessories</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECTION 2: CATEGORY DISCOVERY CARDS ================= */}
      {activeSubTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-stone-100 dark:bg-stone-900 p-4 border border-stone-200 dark:border-stone-800">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Front Page Category Discovery Tiles
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-light">
                Manage the curated visual cards for Men's, Women's, Footwear, Packs, and Kids. Upload high-impact portrait photos (800×1000 recommended).
              </p>
            </div>

            <button
              onClick={handleResetCategoryCards}
              className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Category Presets</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryCards.map((card, idx) => (
              <div
                key={card.id || idx}
                className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 p-5 shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                  <span className="text-xs font-mono font-bold text-stone-400 dark:text-stone-500 uppercase">
                    SLOT {idx + 1} • {card.id}
                  </span>
                  <span className="text-[10px] bg-stone-100 dark:bg-stone-800 px-2 py-0.5 font-bold uppercase text-stone-700 dark:text-stone-300">
                    Live on Home
                  </span>
                </div>

                {/* Photo Upload Input */}
                <ImageUploadInput
                  label={`${card.title} Photo`}
                  sublabel="Upload from device or paste URL"
                  value={card.image}
                  onChange={(newUrl) => handleUpdateCategoryCard(idx, 'image', newUrl)}
                  aspectRatio="portrait"
                  presetOptions={PRESET_CATEGORY_LOOKS}
                />

                {/* Card Title & Subtitle Edit */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                      Display Title
                    </label>
                    <input
                      type="text"
                      value={card.title}
                      onChange={(e) => handleUpdateCategoryCard(idx, 'title', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-bold uppercase focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-1">
                      Subtitle / Sub-Collections
                    </label>
                    <input
                      type="text"
                      value={card.subtitle}
                      onChange={(e) => handleUpdateCategoryCard(idx, 'subtitle', e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-light focus:outline-none focus:border-black dark:focus:border-white"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= SECTION 3: PRODUCT CATALOG PHOTOS MANAGER ================= */}
      {activeSubTab === 'products' && (
        <div className="space-y-6">
          <div className="bg-stone-100 dark:bg-stone-900 p-4 border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                Direct Product Photo & Gallery Manager
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 font-light">
                Instantly upload new photos, replace covers, or reorder multi-angle lookbooks for every single product in the catalog.
              </p>
            </div>

            {/* Search & Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search gear name / SKU..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none font-medium w-48 sm:w-60"
                />
              </div>

              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 font-bold uppercase cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="mens">Men's</option>
                <option value="womens">Women's</option>
                <option value="kids">Kids</option>
                <option value="bags_gears">Bags & Gears</option>
                <option value="shoes">Footwear</option>
              </select>
            </div>
          </div>

          {/* Product Grid with Quick Photo Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-800 overflow-hidden shadow-xs hover:border-black dark:hover:border-white transition-all flex flex-col justify-between"
              >
                {/* Top Image Preview & Quick Multi-Image Thumbnails */}
                <div>
                  <div className="relative h-48 sm:h-52 bg-stone-950 overflow-hidden">
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 border border-white/20">
                      {prod.images.length} PHOTOS
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[10px] font-mono px-2 py-0.5 border border-white/20">
                      रू {prod.price}
                    </div>
                  </div>

                  {/* Thumbnail Bar */}
                  <div className="flex items-center gap-1.5 p-2 bg-stone-50 dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 overflow-x-auto">
                    {prod.images.map((img, i) => (
                      <div
                        key={i}
                        className={`relative w-8 h-8 shrink-0 border overflow-hidden ${
                          i === 0 ? 'border-amber-500 ring-1 ring-amber-500' : 'border-stone-300 dark:border-stone-700'
                        }`}
                        title={i === 0 ? 'Primary Cover Photo' : `Angle #${i + 1}`}
                      >
                        <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>

                  {/* Product Details */}
                  <div className="p-3.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 font-bold uppercase">
                        {prod.styleCode}
                      </span>
                      <span className="text-[10px] font-bold uppercase bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 text-stone-700 dark:text-stone-300">
                        {prod.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase truncate">
                      {prod.name}
                    </h4>
                  </div>
                </div>

                {/* Action Trigger: Open Gallery Studio */}
                <div className="p-3 pt-0">
                  <button
                    onClick={() => setSelectedProductForGallery(prod)}
                    className="w-full py-2 bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Manage Photos ({prod.images.length})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= PRODUCT MULTI-IMAGE GALLERY MODAL ================= */}
      {selectedProductForGallery && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 w-full max-w-4xl shadow-2xl overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-stone-950 text-white">
              <div>
                <div className="flex items-center gap-2 text-amber-400 text-[10px] font-mono tracking-widest uppercase">
                  <Camera className="w-3.5 h-3.5" />
                  <span>Product Lookbook & Photo Gallery Manager</span>
                </div>
                <h3 className="text-base sm:text-lg font-black uppercase text-white tracking-tight mt-0.5">
                  {selectedProductForGallery.name} ({selectedProductForGallery.styleCode})
                </h3>
              </div>

              <button
                onClick={() => setSelectedProductForGallery(null)}
                className="p-1.5 text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Existing Photos Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100">
                    Current Photos & Viewing Angles ({selectedProductForGallery.images.length})
                  </h4>
                  <span className="text-[11px] text-stone-500 dark:text-stone-400 font-light">
                    The 1st photo is used as the primary storefront card cover.
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {selectedProductForGallery.images.map((imgUrl, i) => (
                    <div
                      key={i}
                      className="border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 p-3 space-y-3 shadow-xs"
                    >
                      {/* Photo Thumbnail */}
                      <div className="relative aspect-square bg-stone-950 overflow-hidden">
                        <img src={imgUrl} alt={`Angle ${i + 1}`} className="w-full h-full object-cover" />
                        {i === 0 && (
                          <div className="absolute top-2 left-2 bg-amber-500 text-black font-black text-[9px] uppercase px-2 py-0.5 tracking-wider shadow-sm">
                            PRIMARY COVER
                          </div>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/75 text-white font-mono text-[9px] px-1.5 py-0.5">
                          #{i + 1}
                        </div>
                      </div>

                      {/* Photo Management Actions */}
                      <div className="space-y-2">
                        {i !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetPrimaryProductPhoto(selectedProductForGallery, i)}
                            className="w-full py-1 text-[11px] font-bold uppercase tracking-wider bg-stone-200 dark:bg-stone-800 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
                          >
                            Set as Primary Cover
                          </button>
                        )}

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const newUrl = prompt('Enter replacement image URL:', imgUrl);
                              if (newUrl) handleReplaceProductPhoto(selectedProductForGallery, i, newUrl);
                            }}
                            className="flex-1 py-1 text-[10px] font-bold uppercase tracking-wider border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 cursor-pointer"
                          >
                            Replace URL
                          </button>

                          {selectedProductForGallery.images.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemovePhotoFromProduct(selectedProductForGallery, i)}
                              className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 cursor-pointer"
                              title="Delete this photo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload & Add New Photo Section */}
              <div className="border-t border-stone-200 dark:border-stone-800 pt-6 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-red-600" />
                  <span>Upload & Add Another Photo to This Product</span>
                </h4>

                <ImageUploadInput
                  label="Select or Drag New Photo"
                  sublabel="Directly upload from your device or paste URL"
                  value=""
                  onChange={(newUrl) => {
                    if (newUrl) {
                      handleAddPhotoToProduct(selectedProductForGallery, newUrl);
                    }
                  }}
                  aspectRatio="square"
                  presetOptions={PRESET_EDITORIAL_HEROES}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-950 flex justify-end">
              <button
                onClick={() => setSelectedProductForGallery(null)}
                className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-stone-200 cursor-pointer"
              >
                Done Editing Photos
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

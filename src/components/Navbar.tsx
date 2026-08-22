import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  User,
  X,
  ChevronDown,
  ShieldCheck,
  PackageCheck,
  HelpCircle,
  Phone,
  Mail,
  MapPin,
  FileQuestion,
  Menu,
  Sun,
  Moon,
} from 'lucide-react';
import { ProductCategory, AuthUser } from '../types';
import { GeartradeLogo } from './GeartradeLogo';
import { UserAccountMenu } from './UserAccountMenu';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory, subcategory?: string) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenTracker: () => void;
  onOpenStoreLocator: () => void;
  onOpenAdmin: () => void;
  currentUser: AuthUser | null;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

// Mega Menu Definitions for all store departments
export const MEGA_MENU_DATA: Record<
  string,
  {
    title: string;
    categoryKey: ProductCategory;
    leftLinks: { label: string; action?: string; badge?: string }[];
    accessories: string[];
    columns: {
      heading: string;
      items: string[];
    }[];
  }
> = {
  mens: {
    title: "Men's",
    categoryKey: 'mens',
    leftLinks: [
      { label: "Shop All Men's", action: 'all' },
      { label: 'SALE', action: 'sale', badge: 'HOT' },
      { label: 'NEW ARRIVAL', action: 'new', badge: 'SS2026' },
    ],
    accessories: ['Gloves', 'Beanies', 'Caps', 'Neckwarmers', 'Arm Cover', 'Belts', 'Socks'],
    columns: [
      {
        heading: 'JACKETS & VESTS',
        items: [
          'Rain',
          'Windbreakers',
          'Softshell',
          'Vests',
          'Insulated',
          'Down',
          'Waterproof',
          'Primaloft',
          'Thermo Fiber',
          'Zipped',
        ],
      },
      {
        heading: 'FLEECE',
        items: ['Full Zip', 'Hoodies', 'Pullover', 'Sweatshirt', 'Half Zip', 'Highneck'],
      },
      {
        heading: 'TOPS',
        items: ['T-Shirts', 'Shirts & Polos', 'Active', 'Pajamas', 'THERMAL'],
      },
      {
        heading: 'BOTTOMS',
        items: ['Shorts', 'Pants', 'Active', 'Sweatpants & Joggers', 'THERMAL'],
      },
    ],
  },
  womens: {
    title: "Women's",
    categoryKey: 'womens',
    leftLinks: [
      { label: "Shop All Women's", action: 'all' },
      { label: 'SALE', action: 'sale', badge: 'HOT' },
      { label: 'NEW ARRIVAL', action: 'new', badge: 'SS2026' },
    ],
    accessories: ['Gloves', 'Beanies & Headbands', 'Caps', 'Scarves & Neckwarmers', 'Gaiters'],
    columns: [
      {
        heading: 'JACKETS & COATS',
        items: [
          'Rain Shells',
          'Windcheaters',
          'Down Parkas',
          'Ultra-Light Vests',
          'Softshell Jackets',
          'Waterproof 10K',
        ],
      },
      {
        heading: 'FLEECE & KNITS',
        items: ['Alpine Fleece', 'Full Zip Hoodies', 'Crop Pullovers', 'High-Neck Sweaters'],
      },
      {
        heading: 'TOPS & TEES',
        items: ['Quick-Dry Tees', 'Merino Base Layers', 'Trail Shirts', 'Active Tanks', 'THERMAL Tops'],
      },
      {
        heading: 'PANTS & TIGHTS',
        items: ['Trek Pants', 'Trail Leggings', 'Light Shorts', 'Joggers', 'THERMAL Bottoms'],
      },
    ],
  },
  kids: {
    title: "Kids'",
    categoryKey: 'kids',
    leftLinks: [
      { label: "Shop All Junior & Kids", action: 'all' },
      { label: 'SALE', action: 'sale' },
      { label: 'NEW ARRIVAL', action: 'new' },
    ],
    accessories: ['Kids Beanies', 'Sun Hats', 'Gloves & Mittens', 'Neckwarmers', 'School Packs'],
    columns: [
      {
        heading: 'JACKETS & LAYERS',
        items: ['Kids Windcheater', 'Warm Down Jacket', 'Rain Shell', 'Fleece Vests'],
      },
      {
        heading: 'SWEATSHIRTS & HOODIES',
        items: ['Full-Zip Fleece', 'Pullover Hoodies', 'Graphic Sweaters'],
      },
      {
        heading: 'TOPS',
        items: ['Active Tees', 'Long Sleeve Baselayers', 'Thermal Sets'],
      },
      {
        heading: 'BOTTOMS',
        items: ['Track Pants', 'Trail Shorts', 'Fleece Joggers'],
      },
    ],
  },
  bags_gears: {
    title: 'Bags&gears',
    categoryKey: 'bags_gears',
    leftLinks: [
      { label: 'Shop All Gear', action: 'all' },
      { label: 'EXPEDITION SERIES', action: 'expedition', badge: 'PRO' },
      { label: 'NEW ARRIVAL', action: 'new' },
    ],
    accessories: ['Water Bottles', 'Rain Covers', 'Dry Bags', 'Carabiners', 'Headlamps', 'Compression Sacks'],
    columns: [
      {
        heading: 'BACKPACKS & PACKS',
        items: ['Daypacks (20L-30L)', 'Trekking Packs (45L-65L)', 'Expedition Rucksacks (75L+)', 'Waist & Crossbody Bags'],
      },
      {
        heading: 'TREKKING EQUIPMENT',
        items: ['Carbon Trekking Poles', 'Sleeping Bags (-10°C to -25°C)', 'Camping Tents', 'Foam & Air Mats'],
      },
      {
        heading: 'CLIMBING & ALPINE',
        items: ['Harnesses', 'Helmets', 'Crampons', 'Ice Axes', 'Chalk Bags'],
      },
      {
        heading: 'TRAVEL ESSENTIALS',
        items: ['Duffel Bags', 'Packing Cubes', 'Passport Wallets', 'Toiletry Kits'],
      },
    ],
  },
  shoes: {
    title: 'Shoes',
    categoryKey: 'shoes',
    leftLinks: [
      { label: 'Shop All Footwear', action: 'all' },
      { label: 'TRAIL RUNNING', action: 'trail' },
      { label: 'NEW ARRIVAL', action: 'new' },
    ],
    accessories: ['Merino Trail Socks', 'Shoe Waterproofing Spray', 'Replacement Laces', 'Orthopedic Insoles', 'Gaiters'],
    columns: [
      {
        heading: 'TREKKING & HIKING',
        items: ['Waterproof High Ankle Boots', 'Mid-Cut Hiking Boots', 'Lightweight Trail Walkers'],
      },
      {
        heading: 'RUNNING & ACTIVE',
        items: ['Trail Running Shoes', 'Road Runners', 'Cross-Training Shoes'],
      },
      {
        heading: 'SANDALS & SLIPS',
        items: ['River Trekking Sandals', 'Camp Slip-Ons', 'Recovery Slides'],
      },
      {
        heading: 'EXPEDITION MOUNTAINEERING',
        items: ['Double Boots (6000m+)', 'Crampon-Compatible Boots', 'Insulated Snow Boots'],
      },
    ],
  },
};

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onOpenCart,
  onOpenTracker,
  onOpenStoreLocator,
  onOpenAdmin,
  currentUser,
  onOpenLoginModal,
  onLogout,
  theme = 'light',
  onToggleTheme,
}) => {
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [mobileExpandedCat, setMobileExpandedCat] = useState<string | null>(null);

  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (catKey: string) => {
    if (megaMenuTimeoutRef.current) {
      clearTimeout(megaMenuTimeoutRef.current);
    }
    setActiveMegaMenu(catKey);
  };

  const handleMouseLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 180);
  };

  const handleNavClick = (catKey: ProductCategory, subcategory?: string) => {
    onSelectCategory(catKey, subcategory);
    setActiveMegaMenu(null);
    setMobileMenuOpen(false);
    const el = document.getElementById('catalog-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 transition-colors duration-150 font-sans shadow-xs">
      {/* 1. Top Announcement Bar (Inverted with theme: black in light mode, white in dark mode) */}
      <div className="bg-black text-white dark:bg-white dark:text-black text-center py-1.5 px-4 text-xs font-semibold tracking-[0.18em] uppercase select-none transition-colors duration-150">
        SPRING SUMMER 2026 COLLECTION
      </div>

      {/* 2. Top Right Utility Header: Order Status | Help | Sign In */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-stone-100 dark:border-stone-900 hidden md:flex items-center justify-end py-1.5 text-[11px] font-normal text-stone-600 dark:text-stone-400 gap-3 tracking-wide">
        <button
          onClick={onOpenTracker}
          className="hover:text-black dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>Order Status</span>
        </button>
        <span className="text-stone-300 dark:text-stone-700">|</span>
        <button
          onClick={() => setShowHelpModal(true)}
          className="hover:text-black dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>Help</span>
        </button>
        <span className="text-stone-300 dark:text-stone-700">|</span>

        {currentUser ? (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-black dark:text-white">{currentUser.name}</span>
            {currentUser.isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-[#dc2626] font-bold text-[10px] rounded hover:bg-stone-200 dark:hover:bg-stone-700"
              >
                ADMIN
              </button>
            )}
            <button
              onClick={onLogout}
              className="text-stone-400 hover:text-rose-600 transition-colors"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenLoginModal}
            className="hover:text-black dark:hover:text-white transition-colors cursor-pointer font-medium"
          >
            <span>Sign In</span>
          </button>
        )}
      </div>

      {/* 3. Main Navigation Bar with Logo, Department Links & Icons */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Mobile Menu Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-stone-800 dark:text-stone-200 hover:text-black dark:hover:text-white focus:outline-none"
              aria-label="Open Mobile Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Left Brand Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavClick('all')}
              className="flex items-center focus:outline-none cursor-pointer"
              aria-label="GEARTRADE Home"
            >
              <GeartradeLogo size="md" variant="full" theme={theme === 'dark' ? 'white' : 'black'} />
            </button>
          </div>

          {/* Center Navigation Links with Mega-Menu triggers */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-10 text-sm font-medium text-stone-800 dark:text-stone-200">
            {/* Home Link */}
            <button
              onClick={() => handleNavClick('all')}
              className={`py-6 relative font-medium transition-colors cursor-pointer ${
                selectedCategory === 'all' && !activeMegaMenu
                  ? 'text-[#dc2626] font-semibold'
                  : 'text-stone-800 dark:text-stone-200 hover:text-[#dc2626]'
              }`}
            >
              <span>Home</span>
              {selectedCategory === 'all' && !activeMegaMenu && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#dc2626]" />
              )}
            </button>

            {/* Men's Link */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('mens')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => handleNavClick('mens')}
                className={`py-6 relative font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedCategory === 'mens' || activeMegaMenu === 'mens'
                    ? 'text-[#dc2626] font-semibold'
                    : 'text-stone-800 dark:text-stone-200 hover:text-[#dc2626]'
                }`}
              >
                <span>Men's</span>
                {(selectedCategory === 'mens' || activeMegaMenu === 'mens') && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#dc2626]" />
                )}
              </button>
            </div>

            {/* Women's Link */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('womens')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => handleNavClick('womens')}
                className={`py-6 relative font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedCategory === 'womens' || activeMegaMenu === 'womens'
                    ? 'text-[#dc2626] font-semibold'
                    : 'text-stone-800 dark:text-stone-200 hover:text-[#dc2626]'
                }`}
              >
                <span>Women's</span>
                {(selectedCategory === 'womens' || activeMegaMenu === 'womens') && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#dc2626]" />
                )}
              </button>
            </div>

            {/* Kids' Link */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('kids')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => handleNavClick('kids')}
                className={`py-6 relative font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedCategory === 'kids' || activeMegaMenu === 'kids'
                    ? 'text-[#dc2626] font-semibold'
                    : 'text-stone-800 dark:text-stone-200 hover:text-[#dc2626]'
                }`}
              >
                <span>Kids'</span>
                {(selectedCategory === 'kids' || activeMegaMenu === 'kids') && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#dc2626]" />
                )}
              </button>
            </div>

            {/* Bags & Gears Link */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('bags_gears')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => handleNavClick('bags_gears')}
                className={`py-6 relative font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedCategory === 'bags_gears' || activeMegaMenu === 'bags_gears'
                    ? 'text-[#dc2626] font-semibold'
                    : 'text-stone-800 dark:text-stone-200 hover:text-[#dc2626]'
                }`}
              >
                <span>Bags&gears</span>
                {(selectedCategory === 'bags_gears' || activeMegaMenu === 'bags_gears') && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#dc2626]" />
                )}
              </button>
            </div>

            {/* Shoes Link */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('shoes')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => handleNavClick('shoes')}
                className={`py-6 relative font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                  selectedCategory === 'shoes' || activeMegaMenu === 'shoes'
                    ? 'text-[#dc2626] font-semibold'
                    : 'text-stone-800 dark:text-stone-200 hover:text-[#dc2626]'
                }`}
              >
                <span>Shoes</span>
                {(selectedCategory === 'shoes' || activeMegaMenu === 'shoes') && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#dc2626]" />
                )}
              </button>
            </div>
          </nav>

          {/* Right Action Icons: Dark/Light Toggle, Search, User Account, Shopping Cart */}
          <div className="flex items-center gap-3 sm:gap-5 text-stone-800 dark:text-stone-200">
            {/* Theme Toggle Button */}
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-1.5 text-stone-800 dark:text-stone-200 hover:text-[#dc2626] dark:hover:text-[#ef4444] transition-colors cursor-pointer focus:outline-none rounded-full hover:bg-stone-100 dark:hover:bg-stone-900"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
                ) : (
                  <Moon className="w-5 h-5 sm:w-5.5 sm:h-5.5 text-stone-700 dark:text-stone-300 transition-transform duration-300 hover:-rotate-12" />
                )}
              </button>
            )}

            {/* Search Icon */}
            <button
              onClick={() => setShowSearchModal(true)}
              className="p-1.5 hover:text-[#dc2626] transition-colors cursor-pointer focus:outline-none"
              title="Search store catalog"
              aria-label="Search"
            >
              <Search className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
            </button>

            {/* User Profile / Sign-in Icon */}
            <button
              onClick={currentUser ? onOpenAdmin : onOpenLoginModal}
              className="p-1.5 hover:text-[#dc2626] transition-colors cursor-pointer focus:outline-none relative"
              title={currentUser ? `Logged in as ${currentUser.name}` : 'Sign In'}
              aria-label="Account"
            >
              <User className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              {currentUser?.isAdmin && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-[#dc2626] rounded-full ring-2 ring-white dark:ring-stone-900" />
              )}
            </button>

            {/* Shopping Cart Icon with Counter Badge */}
            <button
              onClick={onOpenCart}
              className="p-1.5 hover:text-[#dc2626] transition-colors cursor-pointer focus:outline-none relative"
              title="Shopping Cart"
              aria-label="Cart"
            >
              <ShoppingBag className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1.5 bg-[#dc2626] text-white text-[10px] font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4. Full Mega-Menu Dropdown */}
      {activeMegaMenu && MEGA_MENU_DATA[activeMegaMenu] && (
        <div
          className="hidden md:block absolute top-full left-0 right-0 bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 shadow-2xl z-50 animate-fadeIn"
          onMouseEnter={() => handleMouseEnter(activeMegaMenu)}
          onMouseLeave={handleMouseLeave}
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-8">
            <div className="grid grid-cols-12 gap-8">
              {/* Left Column: Shop All, Sale, New Arrival, Accessories */}
              <div className="col-span-3 border-r border-stone-100 dark:border-stone-800 pr-6 space-y-6">
                <div className="space-y-3">
                  <button
                    onClick={() => handleNavClick(MEGA_MENU_DATA[activeMegaMenu].categoryKey)}
                    className="block text-left text-base font-bold text-black dark:text-white hover:text-[#dc2626] transition-colors cursor-pointer"
                  >
                    {MEGA_MENU_DATA[activeMegaMenu].leftLinks[0].label}
                  </button>

                  <button
                    onClick={() => {
                      onSelectCategory(MEGA_MENU_DATA[activeMegaMenu].categoryKey);
                      onSearchChange('sale');
                      setActiveMegaMenu(null);
                      const el = document.getElementById('catalog-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="block text-left text-sm font-bold text-stone-900 dark:text-stone-200 hover:text-rose-600 transition-colors cursor-pointer tracking-wider"
                  >
                    SALE
                  </button>

                  <button
                    onClick={() => {
                      onSelectCategory(MEGA_MENU_DATA[activeMegaMenu].categoryKey);
                      onSearchChange('');
                      setActiveMegaMenu(null);
                      const el = document.getElementById('catalog-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="block text-left text-sm font-bold text-stone-900 dark:text-stone-200 hover:text-[#dc2626] transition-colors cursor-pointer tracking-wider"
                  >
                    NEW ARRIVAL
                  </button>
                </div>

                {/* ACCESSORIES block */}
                <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white">
                    ACCESSORIES
                  </h4>
                  <ul className="space-y-2 text-xs text-stone-600 dark:text-stone-400">
                    {MEGA_MENU_DATA[activeMegaMenu].accessories.map((acc) => (
                      <li key={acc}>
                        <button
                          onClick={() => {
                            onSearchChange(acc);
                            setActiveMegaMenu(null);
                            const el = document.getElementById('catalog-section');
                            el?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="hover:text-[#dc2626] dark:hover:text-[#ef4444] transition-colors cursor-pointer text-left block"
                        >
                          {acc}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sub-Category Columns (e.g. JACKETS & VESTS, FLEECE, TOPS, BOTTOMS) */}
              <div className="col-span-9 grid grid-cols-4 gap-6">
                {MEGA_MENU_DATA[activeMegaMenu].columns.map((col) => (
                  <div key={col.heading} className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-black dark:text-white border-b border-stone-100 dark:border-stone-800 pb-1.5">
                      {col.heading}
                    </h4>
                    <ul className="space-y-2.5 text-xs text-stone-600 dark:text-stone-400">
                      {col.items.map((item) => (
                        <li key={item}>
                          <button
                            onClick={() => {
                              onSelectCategory(MEGA_MENU_DATA[activeMegaMenu].categoryKey, item);
                              onSearchChange(item.toLowerCase());
                              setActiveMegaMenu(null);
                              const el = document.getElementById('catalog-section');
                              el?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="hover:text-[#dc2626] dark:hover:text-[#ef4444] hover:translate-x-1 transition-all cursor-pointer text-left block"
                          >
                            {item}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 backdrop-blur-xs md:hidden animate-fadeIn">
          <div className="w-4/5 max-w-sm bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 h-full flex flex-col justify-between shadow-2xl p-5 overflow-y-auto border-r border-stone-200 dark:border-stone-800">
            <div className="space-y-6">
              {/* Header inside mobile drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
                <GeartradeLogo size="sm" variant="full" theme={theme === 'dark' ? 'white' : 'black'} />
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-stone-500 hover:text-black dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Theme switch in Mobile Menu */}
              {onToggleTheme && (
                <div className="flex items-center justify-between py-2.5 px-3 bg-stone-100 dark:bg-stone-900 rounded-lg">
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? (
                      <Sun className="w-4 h-4 text-amber-400" />
                    ) : (
                      <Moon className="w-4 h-4 text-stone-600 dark:text-stone-300" />
                    )}
                    <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                      {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </span>
                  </div>
                  <button
                    onClick={onToggleTheme}
                    className="px-2.5 py-1 text-[11px] font-bold uppercase rounded bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 text-stone-800 dark:text-stone-200 hover:border-[#dc2626] transition-all"
                  >
                    Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                  </button>
                </div>
              )}

              {/* Department Links Accordion */}
              <div className="space-y-2">
                <button
                  onClick={() => handleNavClick('all')}
                  className="w-full text-left py-2.5 px-3 text-sm font-bold text-stone-900 dark:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-900 rounded"
                >
                  Home
                </button>

                {Object.entries(MEGA_MENU_DATA).map(([catKey, data]) => (
                  <div key={catKey} className="border-b border-stone-100 dark:border-stone-800 pb-1">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleNavClick(data.categoryKey)}
                        className="text-left py-2.5 px-3 text-sm font-semibold text-stone-900 dark:text-stone-100 hover:text-[#dc2626] flex-1"
                      >
                        {data.title}
                      </button>
                      <button
                        onClick={() =>
                          setMobileExpandedCat(mobileExpandedCat === catKey ? null : catKey)
                        }
                        className="p-2 text-stone-400 hover:text-black dark:hover:text-white"
                      >
                        <ChevronDown
                          className={`w-4 h-4 transition-transform ${
                            mobileExpandedCat === catKey ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    </div>

                    {mobileExpandedCat === catKey && (
                      <div className="pl-6 pr-3 py-2 space-y-3 bg-stone-50 dark:bg-stone-900 text-xs">
                        {data.columns.map((col) => (
                          <div key={col.heading} className="space-y-1">
                            <p className="font-bold text-stone-900 dark:text-stone-200 uppercase text-[10px]">
                              {col.heading}
                            </p>
                            <div className="grid grid-cols-2 gap-1 text-stone-600 dark:text-stone-400">
                              {col.items.slice(0, 6).map((item) => (
                                <button
                                  key={item}
                                  onClick={() => {
                                    onSelectCategory(data.categoryKey, item);
                                    onSearchChange(item.toLowerCase());
                                    setMobileMenuOpen(false);
                                  }}
                                  className="text-left py-0.5 hover:text-[#dc2626] dark:hover:text-[#ef4444]"
                                >
                                  {item}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Utility links inside mobile menu */}
              <div className="pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2 text-xs text-stone-600 dark:text-stone-400 font-medium">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenTracker();
                  }}
                  className="flex items-center gap-2 w-full py-2 px-3 hover:bg-stone-50 dark:hover:bg-stone-900 rounded"
                >
                  <PackageCheck className="w-4 h-4 text-[#dc2626]" />
                  <span>Order Status</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenStoreLocator();
                  }}
                  className="flex items-center gap-2 w-full py-2 px-3 hover:bg-stone-50 dark:hover:bg-stone-900 rounded"
                >
                  <MapPin className="w-4 h-4 text-[#dc2626]" />
                  <span>Find a Store</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowHelpModal(true);
                  }}
                  className="flex items-center gap-2 w-full py-2 px-3 hover:bg-stone-50 dark:hover:bg-stone-900 rounded"
                >
                  <HelpCircle className="w-4 h-4 text-[#dc2626]" />
                  <span>Customer Help</span>
                </button>
              </div>
            </div>

            {/* Bottom Auth button */}
            <div className="pt-4 border-t border-stone-200 dark:border-stone-800">
              {currentUser ? (
                <div className="space-y-2">
                  <div className="text-xs text-stone-600 dark:text-stone-400">
                    Signed in as <span className="font-bold text-black dark:text-white">{currentUser.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full py-2 text-xs font-bold text-rose-600 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-center rounded"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenLoginModal();
                  }}
                  className="w-full py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-xs uppercase tracking-wider text-center rounded"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Instant Search Popup Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 w-full max-w-2xl shadow-2xl p-6 relative animate-scaleUp text-stone-900 dark:text-stone-100">
            <button
              onClick={() => setShowSearchModal(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-black dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-[#dc2626]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">
                  Search GEARTRADE Catalog
                </h3>
              </div>

              <div className="relative">
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search jackets, down fleeces, trekking pants, backpacks, boots..."
                  className="w-full pl-4 pr-10 py-3 bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-sm text-black dark:text-white placeholder-stone-400 focus:outline-none focus:border-[#dc2626] font-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-3 text-stone-400 hover:text-black dark:hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Quick Suggestion Pills */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                  Popular Searches
                </span>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Astryx Flex Pant',
                    'Windcheater',
                    'Fleece Hoodie',
                    '45L Backpack',
                    'Down Jacket',
                    'Trail Shorts',
                    'Shoes',
                  ].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        onSearchChange(tag);
                        setShowSearchModal(false);
                        const el = document.getElementById('catalog-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3 py-1 bg-stone-100 dark:bg-stone-800 hover:bg-[#dc2626] hover:text-white text-stone-700 dark:text-stone-300 text-xs font-medium rounded-full transition-colors cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. Customer Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 w-full max-w-lg shadow-2xl p-6 relative animate-scaleUp text-stone-900 dark:text-stone-100">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-black dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-5">
              <div className="flex items-center gap-3 border-b border-stone-100 dark:border-stone-800 pb-3">
                <div className="w-10 h-10 bg-[#dc2626]/10 text-[#dc2626] rounded-full flex items-center justify-center">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-black dark:text-white uppercase tracking-tight">
                    GEARTRADE Customer Support
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400">
                    Nepal helpline, shipping assistance & store inquiries
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-stone-700 dark:text-stone-300">
                <div className="p-3 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#dc2626] mt-0.5" />
                  <div>
                    <p className="font-bold text-black dark:text-white">Customer Care Hotline</p>
                    <p className="text-stone-600 dark:text-stone-300 mt-0.5">+977-1-4412345 / 9801234567</p>
                    <p className="text-[10px] text-stone-400">Sunday - Friday: 10:00 AM - 7:00 PM NPT</p>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-start gap-3">
                  <Mail className="w-4 h-4 text-[#dc2626] mt-0.5" />
                  <div>
                    <p className="font-bold text-black dark:text-white">Email Support</p>
                    <p className="text-stone-600 dark:text-stone-300 mt-0.5">support@geartradenepal.com</p>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 flex items-start gap-3">
                  <PackageCheck className="w-4 h-4 text-[#dc2626] mt-0.5" />
                  <div>
                    <p className="font-bold text-black dark:text-white">Returns & 7-Day Exchange Policy</p>
                    <p className="text-stone-600 dark:text-stone-300 mt-0.5">
                      Items in original condition with tags can be exchanged at any GEARTRADE retail store or via postal courier.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowHelpModal(false);
                  onOpenStoreLocator();
                }}
                className="w-full py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-xs uppercase tracking-wider text-center flex items-center justify-center gap-2 cursor-pointer rounded"
              >
                <MapPin className="w-4 h-4" />
                <span>Find GEARTRADE Retail Stores</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

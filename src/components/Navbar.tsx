import React, { useState, useEffect } from 'react';
import { ShoppingBag, Search, MapPin, Heart, PackageCheck, Menu, X, User, Sliders, ShieldCheck, Sun, Moon, ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { ProductCategory, AuthUser } from '../types';
import { GeartradeLogo } from './GeartradeLogo';
import { UserAccountMenu } from './UserAccountMenu';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: ProductCategory;
  onSelectCategory: (cat: ProductCategory) => void;
  onOpenCart: () => void;
  onOpenWishlist: () => void;
  onOpenTracker: () => void;
  onOpenStoreLocator: () => void;
  onOpenAdmin: () => void;
  currentUser: AuthUser | null;
  onOpenLoginModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  wishlistCount,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  onOpenCart,
  onOpenWishlist,
  onOpenTracker,
  onOpenStoreLocator,
  onOpenAdmin,
  currentUser,
  onOpenLoginModal,
  onLogout,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isAnnouncementVisible, setIsAnnouncementVisible] = useState(true);
  const { theme, isDark, toggleTheme } = useTheme();

  // Auto-hide the announcement bar after 20 seconds
  useEffect(() => {
    if (!isAnnouncementVisible) return;
    const timer = setTimeout(() => {
      setIsAnnouncementVisible(false);
    }, 20000);

    return () => clearTimeout(timer);
  }, [isAnnouncementVisible]);

  const navCategories: { id: ProductCategory; label: string }[] = [
    { id: 'all', label: 'ALL GEAR' },
    { id: 'mens', label: 'MEN' },
    { id: 'womens', label: 'WOMEN' },
    { id: 'kids', label: 'KIDS' },
    { id: 'bags_gears', label: 'BAGS & GEARS' },
    { id: 'shoes', label: 'FOOTWEAR' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-black border-b border-stone-200 dark:border-stone-800 transition-colors duration-200 font-sans shadow-xs">
      {/* Top Minimalist Announcement Bar with 20s Auto-Disappear & Drop Slider */}
      <AnimatePresence initial={false}>
        {isAnnouncementVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="overflow-hidden bg-black dark:bg-stone-950 text-white border-b border-stone-900 dark:border-stone-800 relative group"
          >
            <div className="text-[11px] px-4 py-2 tracking-wider transition-colors">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-bold tracking-widest uppercase text-white">
                    GEARTRADE NEPAL
                  </span>
                  <span className="hidden md:inline text-stone-400 font-light">
                    — FREE DELIVERY OVER RS. 5,000 ACROSS ALL 7 PROVINCES
                  </span>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 text-[11px] uppercase tracking-wider font-semibold">
                  {/* Quick Theme Switcher in Top Bar */}
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-1.5 px-2 py-0.5 text-stone-300 hover:text-white bg-stone-900/80 hover:bg-stone-800 border border-stone-800 transition-colors cursor-pointer text-[10px] uppercase tracking-wider"
                    title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    aria-label="Toggle Dark/Light Mode"
                  >
                    {isDark ? (
                      <>
                        <Sun className="w-3 h-3 text-amber-400" />
                        <span className="hidden sm:inline">LIGHT</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-3 h-3 text-stone-300" />
                        <span className="hidden sm:inline">DARK</span>
                      </>
                    )}
                  </button>

                  <span className="text-stone-700">|</span>

                  {currentUser?.isAdmin ? (
                    <button
                      onClick={onOpenAdmin}
                      className="hover:text-stone-200 transition-colors cursor-pointer flex items-center gap-1 text-white bg-stone-900 border border-stone-700 px-2 py-0.5 text-[10px]"
                      title="Admin Management Hub"
                    >
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>Admin Hub</span>
                    </button>
                  ) : (
                    <button
                      onClick={onOpenAdmin}
                      className="text-stone-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[10px]"
                      title="Admin Access"
                    >
                      <Sliders className="w-2.5 h-2.5" />
                      <span>Admin</span>
                    </button>
                  )}
                  <span className="text-stone-700">|</span>
                  <button
                    onClick={onOpenTracker}
                    className="text-stone-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <PackageCheck className="w-3 h-3" />
                    <span className="hidden sm:inline">Track Order</span>
                  </button>
                  <span className="text-stone-700">|</span>
                  <button
                    onClick={onOpenStoreLocator}
                    className="text-stone-300 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <MapPin className="w-3 h-3" />
                    <span className="hidden sm:inline">Stores</span>
                  </button>

                  {/* Manual Collapse Handle */}
                  <span className="text-stone-700">|</span>
                  <button
                    onClick={() => setIsAnnouncementVisible(false)}
                    className="text-stone-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1 px-1 py-0.5 hover:bg-stone-900 rounded-xs"
                    title="Slide up & hide announcement bar"
                    aria-label="Hide announcement bar"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Subtle 20s Countdown Progress Indicator Bar */}
            <motion.div
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 20, ease: 'linear' }}
              style={{ originX: 0 }}
              className="h-[1.5px] bg-gradient-to-r from-amber-400/80 via-white/80 to-amber-400/80 w-full opacity-40 group-hover:opacity-80 transition-opacity"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Small Drop Slider Pull-Down Tab (Appears when bar is hidden) */}
      {!isAnnouncementVisible && (
        <div className="relative flex justify-center w-full pointer-events-none">
          <button
            onClick={() => setIsAnnouncementVisible(true)}
            className="pointer-events-auto absolute top-0 -translate-y-0.5 z-50 flex items-center gap-1 px-3 py-0.5 bg-black dark:bg-stone-900 text-stone-300 hover:text-white text-[9px] font-bold uppercase tracking-widest border-b border-x border-stone-800 shadow-md hover:bg-stone-900 transition-all cursor-pointer rounded-b-sm group"
            title="Drop down announcements & quick links"
            aria-label="Drop down announcement bar"
          >
            <span>OFFERS & NOTICE</span>
            <ChevronDown className="w-3 h-3 text-amber-400 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      )}

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectCategory('all')}
          className="cursor-pointer flex items-center gap-2 shrink-0 group"
        >
          <GeartradeLogo variant="full" theme="auto" size="md" />
        </div>

        {/* Minimal Category Links */}
        <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
          {navCategories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`relative py-1.5 text-xs font-bold tracking-[0.14em] uppercase transition-all cursor-pointer ${
                  isActive
                    ? 'text-black dark:text-white font-black'
                    : 'text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white'
                }`}
              >
                {cat.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-black dark:bg-white" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0">
          {/* Minimal Search Input */}
          <div className="relative hidden xl:block w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="SEARCH GEAR..."
              className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 text-[11px] font-medium tracking-wider pl-8 pr-3 py-1.5 focus:outline-none focus:border-black dark:focus:border-white transition-all uppercase"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-black dark:hover:text-white text-[10px]"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Trigger for Mobile/Tablet */}
          <button
            onClick={() => setShowSearchModal(!showSearchModal)}
            className="p-2 text-stone-700 dark:text-stone-300 hover:text-black dark:hover:text-white transition-colors xl:hidden cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Theme Switcher Button Icon */}
          <button
            onClick={toggleTheme}
            className="p-2 text-stone-700 dark:text-stone-300 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors cursor-pointer border border-transparent hover:border-stone-200 dark:hover:border-stone-800"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Light and Dark Mode"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-stone-800" />
            )}
          </button>

          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            className="p-2 text-stone-700 dark:text-stone-300 hover:text-black dark:hover:text-white transition-colors relative cursor-pointer"
            title="Saved Items"
            aria-label="Wishlist"
          >
            <Heart className="w-4 h-4" />
            {wishlistCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-black dark:bg-white text-white dark:text-black text-[9px] font-black w-3.5 h-3.5 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Minimal Shopping Bag Button */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 bg-black dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-black px-3.5 py-2 text-xs font-bold tracking-wider uppercase transition-all shadow-xs cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Bag</span>
            <span className="text-[11px] font-black">
              ({cartCount})
            </span>
          </button>

          {/* User Account / Google Login Menu */}
          <div className="hidden sm:block">
            <UserAccountMenu
              currentUser={currentUser}
              onOpenLoginModal={onOpenLoginModal}
              onLogout={onLogout}
              onNavigateToAdmin={onOpenAdmin}
            />
          </div>

          {/* Mobile menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-stone-800 dark:text-stone-200 hover:text-black dark:hover:text-white lg:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showSearchModal && (
        <div className="p-3 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 xl:hidden flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search gear by name, category or style code..."
            className="flex-1 bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs px-3 py-2 focus:outline-none focus:border-black dark:focus:border-white uppercase font-medium"
            autoFocus
          />
          <button
            onClick={() => setShowSearchModal(false)}
            className="px-3 py-2 bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-xs font-bold cursor-pointer"
          >
            Close
          </button>
        </div>
      )}

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 px-5 py-4 space-y-4 shadow-xl">
          <div className="space-y-1">
            {navCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full py-2.5 text-left text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-between cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'text-black dark:text-white font-black border-l-2 border-black dark:border-white pl-2'
                    : 'text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <span>{cat.label}</span>
                <span>→</span>
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex flex-col gap-2.5 text-xs">
            {/* Theme toggle in mobile menu */}
            <div className="flex items-center justify-between p-2.5 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
              <span className="font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-200">
                DISPLAY THEME
              </span>
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>DARK MODE</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-stone-800" />
                    <span>LIGHT MODE</span>
                  </>
                )}
              </button>
            </div>

            {/* Mobile User Profile / Login */}
            {currentUser ? (
              <div className="p-3 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {currentUser.picture ? (
                    <img
                      src={currentUser.picture}
                      alt={currentUser.name}
                      className="w-7 h-7 object-cover border border-stone-300 dark:border-stone-700"
                    />
                  ) : (
                    <div className="w-7 h-7 bg-stone-900 dark:bg-white text-white dark:text-black font-bold flex items-center justify-center text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-stone-900 dark:text-white text-xs block">{currentUser.name}</span>
                    <span className="text-[10px] text-stone-500 font-mono block truncate max-w-[160px]">
                      {currentUser.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white font-semibold text-xs px-2 py-1 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenLoginModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 bg-black dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Sign in with Google</span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="flex items-center justify-between p-2.5 text-white bg-stone-900 dark:bg-stone-900 border border-stone-800 font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5" />
                <span>Admin Hub & Logistics</span>
              </div>
              <span className="text-[9px] bg-white/20 px-1.5 py-0.5 font-black">
                {currentUser?.isAdmin ? 'AUTHORIZED' : 'RESTRICTED'}
              </span>
            </button>

            <div className="flex items-center justify-between text-xs text-stone-600 dark:text-stone-400 pt-2">
              <button
                onClick={() => {
                  onOpenTracker();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1 font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider text-[11px] cursor-pointer"
              >
                <PackageCheck className="w-3.5 h-3.5" />
                <span>Track Order</span>
              </button>
              <button
                onClick={() => {
                  onOpenStoreLocator();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1 font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider text-[11px] cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Store Locations</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

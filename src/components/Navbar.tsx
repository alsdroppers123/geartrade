import React, { useState } from 'react';
import { ShoppingBag, Search, MapPin, Heart, PackageCheck, Menu, X, User, HelpCircle, Code2, Sliders, ShieldCheck } from 'lucide-react';
import { ProductCategory, AuthUser } from '../types';
import { GeartradeLogo } from './GeartradeLogo';
import { UserAccountMenu } from './UserAccountMenu';

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

  const navCategories: { id: ProductCategory; label: string }[] = [
    { id: 'all', label: 'All Gear' },
    { id: 'mens', label: "Men's" },
    { id: 'womens', label: "Women's" },
    { id: 'kids', label: "Kids'" },
    { id: 'bags_gears', label: 'Bags & Gears' },
    { id: 'shoes', label: 'Footwear' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-stone-200 shadow-xs font-sans">
      {/* Top Minimal Bar */}
      <div className="bg-[#102A45] text-slate-300 text-xs px-4 py-1.5 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-[11px] tracking-wide">
              GEARTRADE NEPAL
            </span>
            <span className="hidden sm:inline text-slate-400 text-[11px]">
              • Nationwide Delivery Across 7 Provinces
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-[11px]">
            {currentUser?.isAdmin ? (
              <button
                onClick={onOpenAdmin}
                className="hover:bg-[#c93f4a] transition-colors cursor-pointer flex items-center gap-1.5 bg-[#DE4B56] text-white px-2.5 py-0.5 rounded font-bold shadow-xs border border-rose-400/40"
                title="Admin Logistics & Product Management"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>Admin Hub</span>
              </button>
            ) : (
              <button
                onClick={onOpenAdmin}
                className="hover:text-white text-slate-400 transition-colors cursor-pointer flex items-center gap-1 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded font-semibold border border-slate-700"
                title="Admin Portal (Restricted to Authorized Admins)"
              >
                <Sliders className="w-3 h-3 text-slate-400" />
                <span>Admin</span>
              </button>
            )}
            <span className="text-slate-600">|</span>
            <button
              onClick={onOpenTracker}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <PackageCheck className="w-3.5 h-3.5 text-[#F5A623]" />
              <span className="hidden sm:inline">Track Order</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={onOpenStoreLocator}
              className="hover:text-white transition-colors cursor-pointer flex items-center gap-1"
            >
              <MapPin className="w-3.5 h-3.5 text-[#DE4B56]" />
              <span className="hidden sm:inline">Stores</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-6">
        {/* Brand Logo */}
        <div
          onClick={() => onSelectCategory('all')}
          className="cursor-pointer flex items-center gap-2 shrink-0"
        >
          <GeartradeLogo variant="full" size="md" />
        </div>

        {/* Minimal Category Tabs */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-4">
          {navCategories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`relative px-3 py-1.5 text-xs lg:text-sm font-bold tracking-wider uppercase transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#102A45]'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                {cat.label}
                {isActive && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#102A45] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Search Input */}
          <div className="relative hidden xl:block w-52">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search gear..."
              className="w-full bg-stone-100 border border-stone-200 text-stone-900 placeholder-stone-400 text-xs rounded-full pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#102A45] focus:bg-white transition-all"
            />
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 text-[10px] bg-stone-200 px-1.5 py-0.5 rounded-full"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search button for smaller screens */}
          <button
            onClick={() => setShowSearchModal(!showSearchModal)}
            className="p-2 text-stone-600 hover:text-[#102A45] hover:bg-stone-100 rounded-full transition-colors xl:hidden cursor-pointer"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Wishlist Button */}
          <button
            onClick={onOpenWishlist}
            className="p-2 text-stone-600 hover:text-[#DE4B56] hover:bg-stone-100 rounded-full transition-colors relative cursor-pointer"
            title="Saved Items"
            aria-label="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#DE4B56] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Shopping Bag Button */}
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 bg-[#102A45] hover:bg-[#162B4D] text-white px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Bag</span>
            <span className="bg-[#DE4B56] text-white text-xs font-black px-1.5 py-0.2 rounded-full">
              {cartCount}
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
            className="p-2 text-stone-700 hover:text-black md:hidden cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showSearchModal && (
        <div className="p-3 bg-stone-50 border-t border-stone-200 xl:hidden flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search gear by name, category or style code..."
            className="flex-1 bg-white border border-stone-300 text-stone-900 text-xs rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#102A45]"
            autoFocus
          />
          <button
            onClick={() => setShowSearchModal(false)}
            className="px-3 py-2 bg-stone-200 text-stone-700 text-xs font-bold rounded-xl"
          >
            Close
          </button>
        </div>
      )}

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-stone-200 px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  setMobileMenuOpen(false);
                }}
                className={`p-2.5 rounded-xl text-left text-xs font-bold transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#102A45] text-white'
                    : 'bg-stone-50 text-stone-800 hover:bg-stone-100'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-stone-100 flex flex-col gap-2 text-xs">
            {/* Mobile User Profile / Login */}
            {currentUser ? (
              <div className="p-3 bg-stone-100 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {currentUser.picture ? (
                    <img
                      src={currentUser.picture}
                      alt={currentUser.name}
                      className="w-8 h-8 rounded-full object-cover border border-stone-300"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-stone-900 text-xs">{currentUser.name}</span>
                      {currentUser.isAdmin && (
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                          Admin
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-stone-500 font-mono block truncate max-w-[170px]">
                      {currentUser.email}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-stone-500 hover:text-rose-600 font-semibold text-xs px-2 py-1"
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
                className="w-full py-2.5 px-3 bg-[#102A45] hover:bg-slate-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                {/* Google Mini Icon */}
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}

            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className={`flex items-center justify-between p-2.5 text-white rounded-xl font-bold ${
                currentUser?.isAdmin ? 'bg-[#DE4B56]' : 'bg-[#102A45]'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#F5A623]" />
                <span>Admin Hub & Logistics</span>
              </div>
              <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded font-black">
                {currentUser?.isAdmin ? 'AUTHORIZED' : 'RESTRICTED'}
              </span>
            </button>

            <div className="flex items-center justify-between text-xs text-stone-600 px-1">
              <button
                onClick={() => {
                  onOpenTracker();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 font-bold text-stone-800"
              >
                <PackageCheck className="w-4 h-4 text-[#F5A623]" />
                <span>Track Order</span>
              </button>
              <button
                onClick={() => {
                  onOpenStoreLocator();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 font-bold text-stone-800"
              >
                <MapPin className="w-4 h-4 text-[#DE4B56]" />
                <span>Store Locations</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

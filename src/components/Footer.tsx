import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import { GeartradeLogo } from './GeartradeLogo';
import { ProductCategory } from '../types';

interface FooterProps {
  onSelectCategory: (cat: ProductCategory) => void;
  onOpenStoreLocator: () => void;
  onOpenTracker: () => void;
  onOpenWishlist: () => void;
  onOpenCart: () => void;
  onOpenAdmin?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenStoreLocator,
  onOpenTracker,
  onOpenWishlist,
  onOpenCart,
  onOpenAdmin,
}) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 font-sans">
      {/* Store Finder Banner */}
      <div className="bg-stone-950 border-b border-stone-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-stone-800 flex items-center justify-center text-stone-200 shrink-0">
              <MapPin className="w-4 h-4 text-[#DE4B56]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wide">
                Visit Our Retail Outlets
              </h3>
              <p className="text-xs text-stone-400">
                Experience our performance gear in Thamel, Durbar Marg, Labim Mall, & Pokhara.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenStoreLocator}
            className="px-5 py-2.5 bg-white hover:bg-stone-100 text-stone-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer shrink-0"
          >
            <span>Find a Store</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand & Summary */}
          <div className="col-span-2 md:col-span-1 space-y-3">
            <div className="cursor-pointer" onClick={() => onSelectCategory('all')}>
              <GeartradeLogo variant="full" theme="white" size="md" />
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-xs">
              Outdoor performance apparel and technical gear engineered for Himalayan trails and city commutes.
            </p>
          </div>

          {/* Shop */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold tracking-widest text-white uppercase">Shop</h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => onSelectCategory('mens')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Men's Apparel
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('womens')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Women's Shells
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('bags_gears')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Bags & Expedition
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('shoes')}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Footwear & Shoes
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold tracking-widest text-white uppercase">Customer Care</h4>
            <ul className="space-y-1.5 text-xs text-stone-400">
              <li>
                <button
                  onClick={onOpenTracker}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Track Order
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenWishlist}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Saved Items
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenStoreLocator}
                  className="hover:text-white transition-colors cursor-pointer"
                >
                  Store Locator
                </button>
              </li>
              <li>
                <span className="text-stone-500">Shipping: 7 Provinces</span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold tracking-widest text-white uppercase">Company</h4>
            <div className="space-y-1 text-xs text-stone-400">
              <p className="font-semibold text-stone-300">GEARTRADE Nepal</p>
              <p>Tridevi Marg, Thamel, Kathmandu</p>
              <p>Phone: +977-1-4428901</p>
              <p>Payments: Fonepay QR & COD</p>
              {onOpenAdmin && (
                <div className="pt-1">
                  <button
                    onClick={onOpenAdmin}
                    className="text-[#DE4B56] hover:underline font-bold text-[11px] cursor-pointer flex items-center gap-1"
                  >
                    <span>Admin Logistics Hub →</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Minimal Copyright Bottom Strip */}
        <div className="mt-8 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} GEARTRADE Nepal. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span>Accepted Payments:</span>
            <span className="font-semibold text-stone-400">Fonepay • Cash on Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

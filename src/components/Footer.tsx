import React, { useState } from 'react';
import { MapPin, ArrowRight, Truck, ShieldCheck, RefreshCw, Mail, CheckCircle2 } from 'lucide-react';
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
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-black text-stone-300 border-t border-stone-800 font-sans">
      {/* Brand Value Props Strip */}
      <div className="border-b border-stone-800 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-stone-900 border border-stone-800 flex items-center justify-center text-white shrink-0">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">NATIONWIDE DELIVERY</p>
              <p className="text-[11px] text-stone-400">Orders over Rs. 5,000</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-stone-900 border border-stone-800 flex items-center justify-center text-white shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">HIMALAYAN TESTED</p>
              <p className="text-[11px] text-stone-400">100% Genuine Gear</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-stone-900 border border-stone-800 flex items-center justify-center text-white shrink-0">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">7-DAY EXCHANGE</p>
              <p className="text-[11px] text-stone-400">Size & color replacement</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-stone-900 border border-stone-800 flex items-center justify-center text-white shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white">4 RETAIL OUTLETS</p>
              <p className="text-[11px] text-stone-400">Kathmandu & Pokhara</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand & Summary */}
          <div className="lg:col-span-2 space-y-4">
            <div className="cursor-pointer inline-block" onClick={() => onSelectCategory('all')}>
              <GeartradeLogo variant="full" theme="white" size="md" />
            </div>
            <p className="text-xs text-stone-400 leading-relaxed max-w-sm font-light">
              Nepal’s premier outdoor apparel & expedition gear specialists. Crafting precision technical wear, high-altitude backpacks, and alpine gear tailored for Himalayan landscapes.
            </p>

            {/* Newsletter form */}
            <div className="pt-2">
              <p className="text-xs font-bold uppercase tracking-widest text-white mb-2">
                NEWSLETTER SIGNUP
              </p>
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs text-white font-medium bg-stone-900 p-2 border border-stone-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Subscribed to Geartrade Nepal updates.</span>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex max-w-sm">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ENTER YOUR EMAIL"
                    className="flex-1 bg-stone-900 border border-stone-700 text-white text-xs px-3 py-2 focus:outline-none focus:border-white uppercase placeholder-stone-500 font-medium"
                  />
                  <button
                    type="submit"
                    className="bg-white text-black hover:bg-stone-200 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    JOIN
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-[0.2em] text-white uppercase">COLLECTIONS</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={() => onSelectCategory('mens')}
                  className="hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Men’s Apparel
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('womens')}
                  className="hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Women’s Collection
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('bags_gears')}
                  className="hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Bags & Expedition Gear
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('shoes')}
                  className="hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Trail & Mountain Footwear
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectCategory('kids')}
                  className="hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Junior & Kids
                </button>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-[0.2em] text-white uppercase">CUSTOMER CARE</h4>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button
                  onClick={onOpenTracker}
                  className="hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Track Order
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenWishlist}
                  className="hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Saved Wishlist
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenStoreLocator}
                  className="hover:text-white transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Store Locator
                </button>
              </li>
              <li>
                <span className="text-stone-400 uppercase tracking-wider">Exchange Policy (7 Days)</span>
              </li>
              <li>
                <span className="text-stone-400 uppercase tracking-wider">Fonepay QR & COD FAQ</span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold tracking-[0.2em] text-white uppercase">CONTACT</h4>
            <div className="space-y-2 text-xs text-stone-400 font-light">
              <p className="font-bold text-white uppercase tracking-wider">GEARTRADE NEPAL</p>
              <p>Tridevi Marg, Thamel, Kathmandu</p>
              <p>Hotline: +977-1-4428901 / 9801234567</p>
              <p>Email: info@geartrade.com.np</p>
              {onOpenAdmin && (
                <div className="pt-2">
                  <button
                    onClick={onOpenAdmin}
                    className="text-stone-300 hover:text-white font-bold text-xs uppercase tracking-wider cursor-pointer flex items-center gap-1 border-b border-stone-700 pb-0.5"
                  >
                    <span>Admin Logistics Hub →</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Copyright Bottom Strip */}
        <div className="mt-10 pt-6 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500">
          <p>© {new Date().getFullYear()} GEARTRADE NEPAL. ALL RIGHTS RESERVED.</p>
          <div className="flex items-center gap-4 text-stone-400">
            <span>CASH ON DELIVERY</span>
            <span>•</span>
            <span>FONEPAY QR</span>
            <span>•</span>
            <span>ESEWA / KHALTI</span>
          </div>
        </div>
      </div>
    </footer>
  );
};


import React, { useState } from 'react';
import {
  MapPin,
  ArrowRight,
  Shield,
  HelpCircle,
  Phone,
  Mail,
  X,
  FileText,
} from 'lucide-react';
import { ProductCategory } from '../types';
import { GeartradeLogo } from './GeartradeLogo';

interface FooterProps {
  onSelectCategory?: (cat: ProductCategory) => void;
  onOpenStoreLocator?: () => void;
  onOpenTracker?: () => void;
  onOpenAdmin?: () => void;
  onOpenLoginModal?: () => void;
  onOpenCart?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onSelectCategory,
  onOpenStoreLocator,
  onOpenTracker,
  onOpenLoginModal,
  onOpenCart,
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const handleCategoryClick = (cat: ProductCategory) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
      const el = document.getElementById('catalog-section');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-white dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 font-sans pt-12 sm:pt-16 pb-8 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-stone-100 dark:border-stone-900">
          {/* Left Column: Brand, Store Locator Callout & Social Links */}
          <div className="md:col-span-4 space-y-4">
            <GeartradeLogo size="lg" variant="full" theme="auto" />

            <p className="text-sm text-stone-600 dark:text-stone-400 font-normal">
              Explore a retail store or outlet near you.
            </p>

            {/* Vibrant Red "Find a store →" Button */}
            <div>
              <button
                onClick={onOpenStoreLocator}
                className="inline-flex items-center gap-2 bg-[#dc2626] hover:bg-[#b91c1c] text-white px-5 py-2.5 rounded-md font-bold text-xs sm:text-sm tracking-wide transition-all cursor-pointer shadow-xs hover:shadow-md active:scale-95"
              >
                <span>Find a store</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Social Icons (Facebook, Instagram, Twitter) */}
            <div className="flex items-center gap-4 pt-2 text-stone-900 dark:text-stone-100">
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-stone-300 dark:border-stone-700 hover:border-black dark:hover:border-white flex items-center justify-center transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.582 9 4.615V8z" />
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-stone-300 dark:border-stone-700 hover:border-black dark:hover:border-white flex items-center justify-center transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>

              {/* Twitter / X */}
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-full border border-stone-300 dark:border-stone-700 hover:border-black dark:hover:border-white flex items-center justify-center transition-colors"
                aria-label="Twitter"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Columns: Shop, Account, Information, Company */}
          <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-xs">
            {/* 1. Shop Column */}
            <div className="space-y-3">
              <h4 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]">
                Shop
              </h4>
              <ul className="space-y-2 text-stone-600 dark:text-stone-400">
                <li>
                  <button
                    onClick={() => handleCategoryClick('mens')}
                    className="hover:text-[#dc2626] dark:hover:text-[#ef4444] transition-colors cursor-pointer text-left"
                  >
                    Men's
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCategoryClick('womens')}
                    className="hover:text-[#dc2626] dark:hover:text-[#ef4444] transition-colors cursor-pointer text-left"
                  >
                    Women's
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCategoryClick('kids')}
                    className="hover:text-[#dc2626] dark:hover:text-[#ef4444] transition-colors cursor-pointer text-left"
                  >
                    Kids'
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCategoryClick('bags_gears')}
                    className="hover:text-[#dc2626] dark:hover:text-[#ef4444] transition-colors cursor-pointer text-left"
                  >
                    Bags&gears
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleCategoryClick('shoes')}
                    className="hover:text-[#dc2626] dark:hover:text-[#ef4444] transition-colors cursor-pointer text-left"
                  >
                    Shoes
                  </button>
                </li>
              </ul>
            </div>

            {/* 2. Account Column */}
            <div className="space-y-3">
              <h4 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]">
                Account
              </h4>
              <ul className="space-y-2 text-stone-600 dark:text-stone-400">
                <li>
                  <button
                    onClick={onOpenLoginModal}
                    className="hover:text-[#dc2626] dark:hover:text-[#ef4444] transition-colors cursor-pointer text-left"
                  >
                    Login
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenCart}
                    className="hover:text-[#dc2626] dark:hover:text-[#ef4444] transition-colors cursor-pointer text-left"
                  >
                    My Cart
                  </button>
                </li>
                <li>
                  <button
                    onClick={onOpenTracker}
                    className="hover:text-[#dc2626] dark:hover:text-[#ef4444] transition-colors cursor-pointer text-left"
                  >
                    Order Status
                  </button>
                </li>
              </ul>
            </div>

            {/* 3. Information Column */}
            <div className="space-y-3">
              <h4 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]">
                Information
              </h4>
              <ul className="space-y-2 text-stone-600 dark:text-stone-400">
                <li>
                  <button
                    onClick={() => setActiveModal('shipping')}
                    className="hover:text-[#dc2626] dark:hover:text-[#ef4444] transition-colors cursor-pointer text-left"
                  >
                    Shipping Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('returns')}
                    className="hover:text-[#dc2626] dark:hover:text-[#ef4444] transition-colors cursor-pointer text-left"
                  >
                    Returns & Refunds
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('cookies')}
                    className="hover:text-[#dc2626] dark:hover:text-[#ef4444] transition-colors cursor-pointer text-left"
                  >
                    Cookies Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('faq')}
                    className="hover:text-[#dc2626] dark:hover:text-[#ef4444] transition-colors cursor-pointer text-left"
                  >
                    Frequently asked
                  </button>
                </li>
              </ul>
            </div>

            {/* 4. Company Column */}
            <div className="space-y-3">
              <h4 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider text-[11px]">
                Company
              </h4>
              <ul className="space-y-2 text-stone-600 dark:text-stone-400">
                <li>
                  <button
                    onClick={() => setActiveModal('about')}
                    className="hover:text-[#dc2626] dark:hover:text-[#ef4444] transition-colors cursor-pointer text-left"
                  >
                    About us
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('privacy')}
                    className="hover:text-[#dc2626] dark:hover:text-[#ef4444] transition-colors cursor-pointer text-left"
                  >
                    Privacy Policy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('terms')}
                    className="hover:text-[#dc2626] dark:hover:text-[#ef4444] transition-colors cursor-pointer text-left"
                  >
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveModal('contact')}
                    className="hover:text-[#dc2626] dark:hover:text-[#ef4444] transition-colors cursor-pointer text-left"
                  >
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Text */}
        <div className="pt-6 text-center text-xs text-stone-500 dark:text-stone-500 font-normal">
          ©2026 GEARTRADE Nepal. All rights reserved.
        </div>
      </div>

      {/* Information / Policy Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 w-full max-w-lg shadow-2xl p-6 relative text-stone-900 dark:text-stone-100 rounded-lg">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-black dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-stone-100 dark:border-stone-800 pb-3">
                <FileText className="w-5 h-5 text-[#dc2626]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white">
                  {activeModal === 'shipping' && 'Shipping Policy'}
                  {activeModal === 'returns' && 'Returns & Refunds Policy'}
                  {activeModal === 'cookies' && 'Cookies Policy'}
                  {activeModal === 'faq' && 'Frequently Asked Questions'}
                  {activeModal === 'about' && 'About GEARTRADE Nepal'}
                  {activeModal === 'privacy' && 'Privacy Policy'}
                  {activeModal === 'terms' && 'Terms & Conditions'}
                  {activeModal === 'contact' && 'Contact Us'}
                </h3>
              </div>

              <div className="text-xs text-stone-600 dark:text-stone-300 space-y-2 max-h-80 overflow-y-auto pr-1">
                {activeModal === 'shipping' && (
                  <p>
                    GEARTRADE Nepal provides standard delivery across all 7 provinces in Nepal. Orders inside Kathmandu Valley are delivered within 24–48 hours. Orders across Pokhara, Chitwan, Biratnagar, Butwal, and mountain gateways arrive within 2–4 business days. Free shipping applies on orders over Rs. 5,000.
                  </p>
                )}
                {activeModal === 'returns' && (
                  <p>
                    We offer a 7-day hassle-free exchange and return policy for unworn items with original tags and packaging intact. Exchange in person at any official GEARTRADE outlet or arrange courier return.
                  </p>
                )}
                {activeModal === 'cookies' && (
                  <p>
                    We use cookies to maintain your active bag session, remember currency/province preferences, and improve storefront performance.
                  </p>
                )}
                {activeModal === 'faq' && (
                  <div className="space-y-2">
                    <p className="font-bold text-stone-800 dark:text-stone-200">Q: Are products authentic GEARTRADE?</p>
                    <p>A: Yes, every item is 100% genuine GEARTRADE gear engineered and tested for rugged Himalayan conditions.</p>
                    <p className="font-bold text-stone-800 dark:text-stone-200">Q: Which payment methods are accepted?</p>
                    <p>A: We support instant Fonepay QR dynamic payments, eSewa, Khalti, and Cash on Delivery (COD).</p>
                  </div>
                )}
                {activeModal === 'about' && (
                  <p>
                    Founded in Nepal, GEARTRADE manufactures high-performance outdoor clothing and equipment engineered for the highest peaks and everyday trails. Combining technical fabrics with modern cuts.
                  </p>
                )}
                {activeModal === 'privacy' && (
                  <p>
                    Your personal information and delivery addresses are securely processed and never shared with third parties.
                  </p>
                )}
                {activeModal === 'terms' && (
                  <p>
                    All orders are subject to stock availability. Prices are listed in Nepalese Rupees (NPR) including VAT.
                  </p>
                )}
                {activeModal === 'contact' && (
                  <div className="space-y-1">
                    <p>📍 Head Office: Jyatha, Thamel, Kathmandu, Nepal</p>
                    <p>📞 Phone: +977-1-4412345 / 9801234567</p>
                    <p>✉️ Email: info@geartradenepal.com</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="w-full py-2 bg-stone-900 dark:bg-stone-800 hover:bg-black dark:hover:bg-stone-700 text-white text-xs font-bold uppercase tracking-wider rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

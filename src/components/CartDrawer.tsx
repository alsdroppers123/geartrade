import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, ArrowRight, Tag, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { CartItem } from '../types';
import { NEPAL_PROVINCES, POPULAR_COUPONS } from '../data/nepalLocations';
import { formatNPR } from '../services/fonepayService';
import { GeartradeLogo } from './GeartradeLogo';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  selectedProvinceId: number;
  onSelectProvince: (provId: number) => void;
  appliedCoupon: string | null;
  onApplyCoupon: (code: string) => { success: boolean; message: string };
  onRemoveCoupon: () => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  selectedProvinceId,
  onSelectProvince,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  onProceedToCheckout,
}) => {
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ success?: boolean; text: string } | null>(null);

  if (!isOpen) return null;

  const currentProvince = NEPAL_PROVINCES.find((p) => p.id === selectedProvinceId) || NEPAL_PROVINCES[2];

  // Calculations
  const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  let discount = 0;
  if (appliedCoupon && POPULAR_COUPONS[appliedCoupon]) {
    const coupon = POPULAR_COUPONS[appliedCoupon];
    if (coupon.discountPercent) {
      discount = Math.round((subtotal * coupon.discountPercent) / 100);
    } else if (coupon.discountFlat) {
      discount = Math.min(subtotal, coupon.discountFlat);
    }
  }

  const deliveryCharge = items.length > 0 ? currentProvince.deliveryFee : 0;
  const taxableAmount = Math.max(0, subtotal - discount);
  const vatAmount = Math.round(taxableAmount * 0.13);
  const grandTotal = Math.max(0, taxableAmount + deliveryCharge);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = onApplyCoupon(couponInput.trim().toUpperCase());
    setCouponFeedback({ success: res.success, text: res.message });
    if (res.success) {
      setCouponInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-xs flex justify-end animate-fadeIn font-sans">
      <div
        className="w-full max-w-md bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 h-full flex flex-col shadow-2xl border-l border-stone-200 dark:border-stone-800 animate-slideLeft"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-black dark:text-white" />
            <h2 className="font-black text-xs sm:text-sm uppercase tracking-[0.16em] text-black dark:text-white">
              SHOPPING BAG ({items.length})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 flex items-center justify-center text-stone-400">
              <ShoppingBag className="w-8 h-8 text-black dark:text-white" />
            </div>
            <div>
              <p className="font-bold text-stone-900 dark:text-stone-100 text-sm uppercase tracking-wider">Your bag is empty</p>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs font-light">
                Explore GEARTRADE technical windcheaters, down jackets, flex pants, and expedition gears.
              </p>
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-black dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-black text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer"
            >
              Explore Collection
            </button>
          </div>
        ) : (
          <>
            {/* Scrollable Item List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {items.map(({ product, quantity, selectedColor, selectedSize }) => (
                <div
                  key={product.id}
                  className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-3.5 flex gap-3 items-center group transition-all"
                >
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-16 h-16 object-cover bg-stone-200 dark:bg-stone-800 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 text-[10px] text-stone-400 dark:text-stone-500 font-semibold uppercase tracking-wider">
                      <span>GEARTRADE</span>
                      <span>•</span>
                      <span className="font-mono">{product.styleCode}</span>
                    </div>
                    <h3 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-tight truncate">
                      {product.name}
                    </h3>

                    {/* Variant tags */}
                    {(selectedColor || selectedSize) && (
                      <div className="flex items-center gap-1.5 mt-1 text-[10px] text-stone-500 dark:text-stone-400">
                        {selectedColor && (
                          <span className="bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-1.5 py-0.5 font-medium uppercase text-[9px]">
                            {selectedColor}
                          </span>
                        )}
                        {selectedSize && (
                          <span className="bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-1.5 py-0.5 font-medium uppercase text-[9px]">
                            {selectedSize}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Quantity controls */}
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700">
                        <button
                          onClick={() => onUpdateQuantity(product.id, Math.max(1, quantity - 1))}
                          className="px-2 py-0.5 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold"
                        >
                          -
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold text-stone-900 dark:text-stone-100 border-x border-stone-200 dark:border-stone-700 min-w-[24px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(product.id, Math.min(product.stockCount, quantity + 1))}
                          className="px-2 py-0.5 text-xs text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 font-bold"
                        >
                          +
                        </button>
                      </div>

                      <span className="font-black text-xs text-black dark:text-white">
                        {formatNPR(product.price * quantity)}
                      </span>
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(product.id)}
                    className="text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Delivery Province Selector */}
              <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-black dark:text-white" />
                    <span>Nepal Delivery Province</span>
                  </span>
                  <span className="text-black dark:text-white font-black">
                    {formatNPR(currentProvince.deliveryFee)}
                  </span>
                </div>
                <select
                  value={selectedProvinceId}
                  onChange={(e) => onSelectProvince(Number(e.target.value))}
                  className="w-full bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs px-3 py-2 focus:outline-none focus:border-black dark:focus:border-white font-medium"
                >
                  {NEPAL_PROVINCES.map((prov) => (
                    <option key={prov.id} value={prov.id}>
                      {prov.name} ({formatNPR(prov.deliveryFee)} - {prov.estimatedDays})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 font-light">
                  Estimated Delivery: {currentProvince.estimatedDays} across Nepal.
                </p>
              </div>

              {/* Coupon Code Section */}
              <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider text-[11px]">
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-black dark:text-white" />
                    <span>Coupon / Promo Code</span>
                  </span>
                </div>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 px-3 py-2">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                      <span>{appliedCoupon} Applied ({POPULAR_COUPONS[appliedCoupon]?.description})</span>
                    </div>
                    <button
                      onClick={onRemoveCoupon}
                      className="text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white text-[10px] uppercase underline ml-2 cursor-pointer font-bold"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="e.g. FONEPAY10 or DASHAIN500"
                      className="flex-1 bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 uppercase text-xs px-3 py-2 focus:outline-none focus:border-black dark:focus:border-white font-medium"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-black dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                )}

                {couponFeedback && (
                  <p
                    className={`text-[10px] font-bold ${
                      couponFeedback.success ? 'text-red-600 dark:text-red-400' : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {couponFeedback.text}
                  </p>
                )}

                {!appliedCoupon && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {Object.keys(POPULAR_COUPONS).map((code) => (
                      <button
                        key={code}
                        onClick={() => {
                          onApplyCoupon(code);
                          setCouponFeedback({ success: true, text: `Applied code ${code}` });
                        }}
                        className="text-[10px] bg-white dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300 px-2 py-0.5 border border-stone-300 dark:border-stone-700 cursor-pointer font-medium uppercase tracking-wider"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Drawer Footer & Checkout Action */}
            <div className="p-5 border-t border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-900 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600 dark:text-stone-400 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-stone-900 dark:text-stone-100 font-bold">{formatNPR(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-red-600 dark:text-red-400 font-bold">
                    <span>Discount ({appliedCoupon})</span>
                    <span>-{formatNPR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery ({currentProvince.name.split(' ')[0]})</span>
                  <span className="text-stone-900 dark:text-stone-100 font-bold">{formatNPR(deliveryCharge)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-stone-500 dark:text-stone-500 pt-1 border-t border-stone-200 dark:border-stone-800">
                  <span>VAT (13% Included in price)</span>
                  <span>{formatNPR(vatAmount)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-black dark:text-white pt-2 border-t border-stone-300 dark:border-stone-700">
                  <span>Grand Total</span>
                  <span>{formatNPR(grandTotal)}</span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 bg-black dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-black font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 text-[10px] text-stone-500 dark:text-stone-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Secure Checkout • Fonepay & Cash on Delivery</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

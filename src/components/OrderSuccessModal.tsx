import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Printer,
  Package,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { Order } from '../types';
import { formatNPR } from '../services/fonepayService';
import { GeartradeLogo } from './GeartradeLogo';

interface OrderSuccessModalProps {
  order: Order | null;
  onClose: () => void;
  onTrackOrder: (orderId: string) => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  order,
  onClose,
  onTrackOrder,
}) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (order) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#102A45', '#DE4B56', '#F5A623', '#10b981'],
        });
      } catch (e) {
        // Safe fallback
      }
    }
  }, [order]);

  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn font-sans">
      <div
        className="w-full max-w-2xl bg-white text-stone-900 rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Header Banner */}
        <div className="bg-[#102A45] text-white p-6 text-center relative">
          <div className="w-14 h-14 bg-[#DE4B56] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg ring-4 ring-[#DE4B56]/30 text-white animate-bounce">
            <CheckCircle className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-extrabold bg-[#F5A623] text-stone-900 px-3 py-0.5 rounded-full uppercase tracking-wider">
            {order.paymentMethod.includes('fonepay') ? 'Fonepay Instant Verified' : 'Order Placed'}
          </span>

          <h2 className="text-xl sm:text-2xl font-black mt-2 uppercase tracking-wide">
            Thank You For Your GEARTRADE Order!
          </h2>

          <p className="text-xs text-slate-300 mt-1">
            Order ID: <span className="font-mono font-bold text-white">{order.id}</span> • PRN:{' '}
            <span className="font-mono text-[#F5A623] font-bold">{order.prn}</span>
          </p>

          <p className="text-[11px] text-slate-400 mt-0.5">
            Confirmation SMS & Dispatch Updates sent to{' '}
            <span className="text-slate-200 font-semibold">+977-{order.customer.phone}</span>
          </p>
        </div>

        {/* Printable Official Nepal VAT / PAN Invoice Card */}
        <div ref={invoiceRef} className="p-6 space-y-6">
          <div className="border border-stone-200 rounded-2xl p-5 bg-stone-50/70 space-y-4 print:border-none print:p-0">
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b border-stone-200 pb-3">
              <div>
                <GeartradeLogo variant="horizontal" size="sm" />
                <p className="text-[11px] text-stone-500 mt-1">GEARTRADE APPAREL & OUTDOOR PVT. LTD.</p>
                <p className="text-[11px] text-stone-600 font-mono font-semibold">
                  Seller PAN / VAT: <span className="text-stone-900">{order.merchantPan}</span>
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-[#DE4B56] uppercase tracking-wide">
                  OFFICIAL TAX INVOICE
                </span>
                <p className="text-[11px] text-stone-600 mt-0.5">Invoice Date: {order.date}</p>
                <p className="text-[11px] text-stone-600 font-medium">Order Date: {order.nepaliDate || order.date}</p>
              </div>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-2 gap-4 text-xs text-stone-700 bg-white p-3.5 rounded-xl border border-stone-200">
              <div>
                <span className="text-stone-400 text-[10px] uppercase font-bold block">Billed To:</span>
                <p className="font-bold text-stone-900">{order.customer.fullName}</p>
                <p>{order.customer.streetAddress}, Ward {order.customer.wardNumber}</p>
                <p>{order.customer.district}, {order.customer.provinceName.split(' ')[0]}</p>
                <p className="font-mono text-stone-600">Ph: +977-{order.customer.phone}</p>
              </div>

              <div>
                <span className="text-stone-400 text-[10px] uppercase font-bold block">Payment Details:</span>
                <p className="font-bold text-stone-900 uppercase">
                  {order.paymentMethod.replace('_', ' ')}
                </p>
                {order.fonepayTransactionId && (
                  <p className="font-mono text-[10px] text-emerald-700 font-semibold truncate">
                    Trx ID: {order.fonepayTransactionId}
                  </p>
                )}
                <p className="text-[11px] text-emerald-600 font-bold mt-1">
                  Status: {order.paymentStatus === 'verified' ? '✓ Verified via Fonepay' : 'Pending Payment'}
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 font-bold text-[10px] uppercase">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Unit Price</th>
                    <th className="py-2 text-right">Total (NPR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {order.items.map(({ product, quantity, selectedColor, selectedSize }) => (
                    <tr key={product.id}>
                      <td className="py-2.5 font-medium text-stone-900 pr-2">
                        <span>{product.name}</span>
                        {(selectedColor || selectedSize) && (
                          <span className="block text-[10px] text-stone-500">
                            {selectedColor && `Color: ${selectedColor} `}
                            {selectedSize && `• Size: ${selectedSize}`}
                          </span>
                        )}
                        <span className="block text-[10px] font-mono text-stone-400">Style: {product.styleCode}</span>
                      </td>
                      <td className="py-2.5 text-center font-bold">{quantity}</td>
                      <td className="py-2.5 text-right">{formatNPR(product.price)}</td>
                      <td className="py-2.5 text-right font-bold text-stone-900">
                        {formatNPR(product.price * quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice Totals */}
            <div className="border-t border-stone-200 pt-3 space-y-1.5 text-xs text-stone-600 max-w-xs ml-auto">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-stone-900">{formatNPR(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount ({order.couponCode}):</span>
                  <span>-{formatNPR(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Nepal Delivery:</span>
                <span className="font-semibold text-stone-900">{formatNPR(order.deliveryCharge)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-500">
                <span>13% VAT (Included):</span>
                <span>{formatNPR(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-stone-900 pt-1.5 border-t border-stone-200">
                <span>Grand Total:</span>
                <span className="text-[#102A45]">{formatNPR(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 border border-stone-300 hover:bg-stone-100 text-stone-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Tax Invoice</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClose();
                  onTrackOrder(order.id);
                }}
                className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Package className="w-4 h-4 text-[#F5A623]" />
                <span>Track Delivery</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-[#102A45] hover:bg-[#162B4D] text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

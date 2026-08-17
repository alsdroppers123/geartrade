import React, { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle,
  Printer,
  Package,
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
          colors: ['#000000', '#444444', '#888888', '#ffffff'],
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

  const customerName = order.customerDetails?.fullName || (order as any).customer?.fullName || 'Customer';
  const customerPhone = order.customerDetails?.phone || (order as any).customer?.phone || '';
  const streetAddress = order.customerDetails?.streetAddress || (order as any).customer?.streetAddress || '';
  const wardNumber = order.customerDetails?.wardNumber || (order as any).customer?.wardNumber || '';
  const district = order.customerDetails?.district || (order as any).customer?.district || '';
  const provinceName = order.customerDetails?.provinceName || (order as any).customer?.provinceName || '';
  const subtotal = order.subtotal || (order as any).subTotal || 0;
  const grandTotal = order.grandTotal || (order as any).totalAmount || 0;
  const taxAmount = order.vatAmount || (order as any).taxAmount || 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn font-sans">
      <div
        className="w-full max-w-2xl bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Success Header Banner */}
        <div className="bg-black dark:bg-stone-900 text-white p-6 text-center relative border-b border-stone-800">
          <div className="w-12 h-12 bg-white text-black flex items-center justify-center mx-auto mb-3 shadow-md">
            <CheckCircle className="w-7 h-7 text-black" />
          </div>

          <span className="text-[10px] font-bold bg-white text-black px-2.5 py-0.5 uppercase tracking-widest inline-block">
            {order.paymentMethod.includes('fonepay') ? 'Fonepay Instant Verified' : 'Order Placed'}
          </span>

          <h2 className="text-lg sm:text-xl font-black mt-2 uppercase tracking-[0.14em]">
            THANK YOU FOR YOUR GEARTRADE ORDER
          </h2>

          <p className="text-xs text-stone-300 mt-1 uppercase tracking-wider font-light">
            Order ID: <span className="font-mono font-bold text-white">{order.id}</span> • Tracking:{' '}
            <span className="font-mono text-white font-bold">{order.trackingCode || (order as any).prn || 'GT-NP'}</span>
          </p>

          <p className="text-[11px] text-stone-400 mt-0.5 font-light">
            Dispatch updates & receipt sent to{' '}
            <span className="text-white font-mono font-medium">+977-{customerPhone}</span>
          </p>
        </div>

        {/* Printable Official Nepal VAT / PAN Invoice Card */}
        <div ref={invoiceRef} className="p-6 space-y-6">
          <div className="border border-stone-200 dark:border-stone-800 p-5 bg-stone-50 dark:bg-stone-900/60 space-y-4 print:border-none print:p-0">
            {/* Invoice Header */}
            <div className="flex justify-between items-start border-b border-stone-200 dark:border-stone-800 pb-3">
              <div>
                <GeartradeLogo variant="full" theme="auto" size="sm" />
                <p className="text-[10px] text-stone-500 dark:text-stone-400 mt-1 uppercase tracking-wider">GEARTRADE APPAREL & OUTDOOR PVT. LTD.</p>
                <p className="text-[10px] text-stone-600 dark:text-stone-400 font-mono font-medium uppercase">
                  PAN / VAT: 609823412
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-black text-black dark:text-white uppercase tracking-widest">
                  TAX INVOICE
                </span>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono mt-0.5">Date: {order.nepaliDateBS || order.createdAt?.substring(0, 10)}</p>
              </div>
            </div>

            {/* Customer & Shipping Summary */}
            <div className="grid grid-cols-2 gap-4 text-xs text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-950 p-3.5 border border-stone-200 dark:border-stone-800">
              <div>
                <span className="text-stone-400 dark:text-stone-500 text-[9px] uppercase font-bold tracking-wider block">Billed To:</span>
                <p className="font-bold text-stone-900 dark:text-stone-100 uppercase">{customerName}</p>
                <p className="font-light">{streetAddress} {wardNumber ? `Ward ${wardNumber}` : ''}</p>
                <p className="font-light">{district}, {provinceName.split(' ')[0]}</p>
                <p className="font-mono text-stone-500 dark:text-stone-400 text-[11px]">Ph: +977-{customerPhone}</p>
              </div>

              <div>
                <span className="text-stone-400 dark:text-stone-500 text-[9px] uppercase font-bold tracking-wider block">Payment:</span>
                <p className="font-bold text-stone-900 dark:text-stone-100 uppercase">
                  {order.paymentMethod.replace('_', ' ')}
                </p>
                {order.fonepayTraceId && (
                  <p className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 truncate">
                    Trace: {order.fonepayTraceId}
                  </p>
                )}
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider mt-1">
                  Status: {order.paymentStatus === 'completed' ? '✓ Verified' : 'Pending Payment'}
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-400 dark:text-stone-500 font-bold text-[10px] uppercase tracking-wider">
                    <th className="py-2">Item Description</th>
                    <th className="py-2 text-center">Qty</th>
                    <th className="py-2 text-right">Price</th>
                    <th className="py-2 text-right">Total (NPR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300 font-medium">
                  {order.items.map(({ product, quantity, selectedColor, selectedSize }) => (
                    <tr key={product.id}>
                      <td className="py-2.5 font-bold text-stone-900 dark:text-stone-100 pr-2 uppercase">
                        <span>{product.name}</span>
                        {(selectedColor || selectedSize) && (
                          <span className="block text-[10px] text-stone-500 dark:text-stone-400 font-normal">
                            {selectedColor && `Color: ${selectedColor} `}
                            {selectedSize && `• Size: ${selectedSize}`}
                          </span>
                        )}
                        <span className="block text-[10px] font-mono text-stone-400 dark:text-stone-500">Style: {product.styleCode}</span>
                      </td>
                      <td className="py-2.5 text-center font-bold">{quantity}</td>
                      <td className="py-2.5 text-right">{formatNPR(product.price)}</td>
                      <td className="py-2.5 text-right font-bold text-stone-900 dark:text-stone-100">
                        {formatNPR(product.price * quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Invoice Totals */}
            <div className="border-t border-stone-200 dark:border-stone-800 pt-3 space-y-1.5 text-xs text-stone-600 dark:text-stone-400 max-w-xs ml-auto">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">{formatNPR(subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                  <span>Discount:</span>
                  <span>-{formatNPR(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Nepal Delivery:</span>
                <span className="font-semibold text-stone-900 dark:text-stone-100">{formatNPR(order.deliveryCharge)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-stone-500 dark:text-stone-500">
                <span>13% VAT (Included):</span>
                <span>{formatNPR(taxAmount)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-black dark:text-white pt-1.5 border-t border-stone-300 dark:border-stone-700">
                <span>Grand Total:</span>
                <span>{formatNPR(grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 border border-stone-300 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
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
                className="px-4 py-2.5 bg-stone-800 dark:bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>Track Delivery</span>
              </button>

              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-black dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-black font-black text-xs uppercase tracking-wider transition-all shadow-xs cursor-pointer"
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

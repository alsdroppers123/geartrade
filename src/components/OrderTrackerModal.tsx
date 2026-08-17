import React, { useState } from 'react';
import { X, Search, Package, CheckCircle2, PhoneCall } from 'lucide-react';
import { Order } from '../types';
import { formatNPR } from '../services/fonepayService';
import { GeartradeLogo } from './GeartradeLogo';

interface OrderTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
  targetOrderId?: string;
}

export const OrderTrackerModal: React.FC<OrderTrackerModalProps> = ({
  isOpen,
  onClose,
  orders,
  targetOrderId,
}) => {
  const [searchQuery, setSearchQuery] = useState(targetOrderId || '');
  const [activeOrder, setActiveOrder] = useState<Order | null>(() => {
    if (targetOrderId) {
      return (
        orders.find(
          (o) =>
            o.id === targetOrderId ||
            o.trackingCode === targetOrderId ||
            (o as any).prn === targetOrderId
        ) ||
        orders[0] ||
        null
      );
    }
    return orders[0] || null;
  });

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const q = searchQuery.trim().toLowerCase();
    const found = orders.find(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        (o.trackingCode && o.trackingCode.toLowerCase().includes(q)) ||
        (o.customerDetails && o.customerDetails.phone.includes(q)) ||
        ((o as any).prn && (o as any).prn.toLowerCase().includes(q))
    );
    if (found) {
      setActiveOrder(found);
    }
  };

  const steps = [
    { title: 'Payment / Order Placed', desc: 'Verified and registered in Kathmandu central hub', time: 'Day 1, 09:30 AM', done: true },
    { title: 'Technical Gear Inspection & Packing', desc: 'Inspected for alpine durability with tamper-evident seals', time: 'Day 1, 02:15 PM', done: true },
    { title: 'Handed to Logistics Partner', desc: 'Dispatched via Pathao Cargo / Nepal Postal High-Altitude Courier', time: 'Day 2, 08:45 AM', done: true },
    { title: 'Out for Delivery', desc: 'Courier dispatched to destination address', time: 'In Transit', done: activeOrder?.orderStatus === 'delivered' || activeOrder?.orderStatus === 'dispatched' },
    { title: 'Delivered & Completed', desc: 'Package signed and delivered at doorstep', time: 'Pending', done: activeOrder?.orderStatus === 'delivered' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn font-sans">
      <div
        className="w-full max-w-2xl bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden relative animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GeartradeLogo variant="full" theme="auto" size="sm" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              | Order Tracker
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ENTER ORDER ID (e.g. ORD-...), TRACKING CODE, OR PHONE..."
                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs pl-9 pr-3.5 py-2.5 focus:outline-none focus:border-black dark:focus:border-white font-medium uppercase placeholder-stone-400 dark:placeholder-stone-500"
              />
              <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-black dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Track
            </button>
          </form>

          {activeOrder ? (
            <div className="space-y-6">
              {/* Order Info Bar */}
              <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-medium">
                <div>
                  <span className="text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[10px]">Order ID: </span>
                  <span className="font-mono font-bold text-stone-900 dark:text-stone-100 ml-1">{activeOrder.id}</span>
                  <span className="block text-[10px] text-stone-500 dark:text-stone-400 mt-0.5 uppercase tracking-wider">
                    Tracking: {activeOrder.trackingCode || (activeOrder as any).prn || 'GT-NP-LIVE'} • {activeOrder.nepaliDateBS || activeOrder.createdAt?.substring(0, 10)}
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[10px]">Destination: </span>
                  <span className="font-bold text-stone-900 dark:text-stone-100 uppercase">
                    {activeOrder.customerDetails?.district || (activeOrder as any).customer?.district || 'Kathmandu'}, {(activeOrder.customerDetails?.provinceName || (activeOrder as any).customer?.provinceName || '').split(' ')[0]}
                  </span>
                </div>

                <div>
                  <span className="text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[10px]">Total: </span>
                  <span className="font-black text-black dark:text-white">{formatNPR(activeOrder.grandTotal || (activeOrder as any).totalAmount || 0)}</span>
                </div>
              </div>

              {/* Live Timeline */}
              <div className="space-y-4">
                <h3 className="font-bold text-xs text-stone-900 dark:text-stone-100 uppercase tracking-[0.14em]">
                  SHIPMENT MILESTONES (NEPAL NATIONWIDE DELIVERY)
                </h3>

                <div className="relative pl-6 border-l border-stone-300 dark:border-stone-700 space-y-6 my-2">
                  {steps.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div
                        className={`absolute -left-[31px] top-0.5 w-4 h-4 border flex items-center justify-center ${
                          step.done
                            ? 'bg-black dark:bg-white border-black dark:border-white text-white dark:text-black'
                            : 'bg-stone-200 dark:bg-stone-800 border-stone-400 dark:border-stone-600'
                        }`}
                      >
                        {step.done && <CheckCircle2 className="w-2.5 h-2.5" />}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span
                          className={`font-bold text-xs uppercase tracking-wider ${
                            step.done ? 'text-stone-900 dark:text-stone-100' : 'text-stone-400 dark:text-stone-500'
                          }`}
                        >
                          {step.title}
                        </span>
                        <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">{step.time}</span>
                      </div>
                      <p className="text-[11px] text-stone-600 dark:text-stone-400 mt-0.5 font-light">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Contact Assistance */}
              <div className="bg-stone-50 dark:bg-stone-900 p-3.5 border border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs text-stone-600 dark:text-stone-400">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-black dark:text-white" />
                  <span>Kathmandu Dispatch Hotline: +977-01-4428901 / 9801234567</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-stone-500 dark:text-stone-400 text-xs font-light">
              No orders found matching that reference. Please check your Order ID / PRN or place a test order.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

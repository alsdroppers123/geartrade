import React, { useState } from 'react';
import { X, Search, Package, Truck, CheckCircle2, Clock, MapPin, Building, PhoneCall } from 'lucide-react';
import { Order } from '../types';
import { formatNPR } from '../services/fonepayService';

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
      return orders.find((o) => o.id === targetOrderId || o.prn === targetOrderId) || orders[0] || null;
    }
    return orders[0] || null;
  });

  if (!isOpen) return null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const found = orders.find(
      (o) =>
        o.id.toLowerCase() === searchQuery.trim().toLowerCase() ||
        o.prn.toLowerCase() === searchQuery.trim().toLowerCase() ||
        o.customer.phone.includes(searchQuery.trim())
    );
    if (found) {
      setActiveOrder(found);
    }
  };

  const steps = [
    { title: 'Payment Confirmed', desc: 'Fonepay verified & merchant settlement registered', time: 'Day 1, 09:30 AM', done: true },
    { title: 'Warehouse Packing', desc: 'Packed with organic seals at Kathmandu Central Hub', time: 'Day 1, 02:15 PM', done: true },
    { title: 'Handed to Courier', desc: 'Assigned to Pathao Express / Nepal Postal Cargo', time: 'Day 2, 08:45 AM', done: true },
    { title: 'Out for Delivery', desc: 'Rider dispatched to customer destination address', time: 'In Progress', done: false },
    { title: 'Delivered & Signed', desc: 'Doorstep arrival and customer signature', time: 'Pending', done: false },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-stone-900 text-stone-100 rounded-2xl shadow-2xl border border-stone-800 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-800 bg-stone-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-rose-500" />
            <h2 className="font-bold text-base text-white">
              Nepal Order & Delivery Tracker
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
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
                placeholder="Search by Order ID (e.g. ORD-123456) or PRN or Phone"
                className="w-full bg-stone-800 border border-stone-700 text-stone-100 text-xs rounded-xl pl-9 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow cursor-pointer"
            >
              Track
            </button>
          </form>

          {activeOrder ? (
            <div className="space-y-6">
              {/* Order Info Bar */}
              <div className="bg-stone-850 border border-stone-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                <div>
                  <span className="text-stone-400">Order ID: </span>
                  <span className="font-mono font-bold text-white ml-1">{activeOrder.id}</span>
                  <span className="block text-[11px] text-stone-500 mt-0.5">
                    PRN: {activeOrder.prn} • {activeOrder.date}
                  </span>
                </div>

                <div>
                  <span className="text-stone-400">Destination: </span>
                  <span className="font-semibold text-rose-400">
                    {activeOrder.customer.district}, {activeOrder.customer.provinceName.split(' ')[0]}
                  </span>
                </div>

                <div>
                  <span className="text-stone-400">Total: </span>
                  <span className="font-bold text-white">{formatNPR(activeOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Live Timeline */}
              <div className="space-y-4">
                <h3 className="font-bold text-xs text-stone-300 uppercase tracking-wider">
                  Shipment Milestones (Nepal Nationwide Delivery)
                </h3>

                <div className="relative pl-6 border-l-2 border-stone-800 space-y-6 my-2">
                  {steps.map((step, idx) => (
                    <div key={idx} className="relative">
                      <div
                        className={`absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          step.done
                            ? 'bg-emerald-600 border-emerald-400 text-white'
                            : 'bg-stone-900 border-stone-750'
                        }`}
                      >
                        {step.done && <CheckCircle2 className="w-2.5 h-2.5" />}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <span
                          className={`font-bold text-xs ${
                            step.done ? 'text-white' : 'text-stone-500'
                          }`}
                        >
                          {step.title}
                        </span>
                        <span className="text-[10px] text-stone-400 font-mono">{step.time}</span>
                      </div>
                      <p className="text-[11px] text-stone-400 mt-0.5">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Contact Assistance */}
              <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 flex items-center justify-between text-xs text-stone-400">
                <div className="flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-emerald-400" />
                  <span>Kathmandu Dispatch Helpline: +977-01-4428901 / 9801234567</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-stone-400 text-xs">
              No orders found matching that reference. Please check your Order ID / PRN or place a test order.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Truck, X, Plus, Clock, MapPin, CheckCircle2, ShieldCheck, Phone, User } from 'lucide-react';
import { Order } from '../../types';
import { formatNPR } from '../../services/fonepayService';

interface CourierDispatchModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
  onSaveLogistics: (updatedOrder: Order) => void;
}

const NEPAL_COURIER_PARTNERS = [
  'Pathfinder Express Nepal (Air & Surface)',
  'Sundar Transport Cargo (Western Nepal)',
  'Nepal Post (EMS Express)',
  'Aramex Kathmandu (Himalayan Expedited)',
  'Garuda Inter-City Express',
  'Namche Trail Porter & Mule Logistics',
  'Local Kathmandu Same-Day Rider',
  'City Express Logistics',
];

export const CourierDispatchModal: React.FC<CourierDispatchModalProps> = ({
  isOpen,
  order,
  onClose,
  onSaveLogistics,
}) => {
  if (!isOpen || !order) return null;

  const [courierPartner, setCourierPartner] = useState(
    order.courierPartner || NEPAL_COURIER_PARTNERS[0]
  );
  const [awbNumber, setAwbNumber] = useState(
    order.awbNumber || order.trackingCode || `AWB-NP-${Math.floor(100000 + Math.random() * 900000)}`
  );
  const [riderName, setRiderName] = useState(order.riderName || '');
  const [riderPhone, setRiderPhone] = useState(order.riderPhone || '');
  const [estimatedDays, setEstimatedDays] = useState(
    order.estimatedDeliveryDays || '2-3 Business Days'
  );
  const [orderStatus, setOrderStatus] = useState<Order['orderStatus']>(order.orderStatus);
  const [paymentStatus, setPaymentStatus] = useState<Order['paymentStatus']>(order.paymentStatus);

  // New tracking checkpoint input
  const [newCheckpointStatus, setNewCheckpointStatus] = useState('In Transit');
  const [newCheckpointLocation, setNewCheckpointLocation] = useState(
    order.customer?.district ? `${order.customer.district} Hub` : 'Kathmandu Central Hub'
  );
  const [newCheckpointDesc, setNewCheckpointDesc] = useState('Package scanned and sorted for transit');

  const handleGenerateAWB = () => {
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    setAwbNumber(`AWB-NP-${randomSuffix}`);
  };

  const handleAddCheckpoint = () => {
    if (!newCheckpointDesc.trim()) return;

    const newUpdate = {
      id: `trk-${Date.now()}`,
      status: newCheckpointStatus,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      location: newCheckpointLocation.trim() || 'Kathmandu Logistics Hub',
      description: newCheckpointDesc.trim(),
      completed: true,
    };

    const updatedUpdates = [newUpdate, ...(order.trackingUpdates || [])];
    const updatedOrder: Order = {
      ...order,
      courierPartner,
      awbNumber,
      trackingCode: awbNumber,
      riderName,
      riderPhone,
      estimatedDeliveryDays: estimatedDays,
      orderStatus,
      paymentStatus,
      trackingUpdates: updatedUpdates,
    };

    onSaveLogistics(updatedOrder);
    setNewCheckpointDesc('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    let finalUpdates = order.trackingUpdates || [];
    // If status changed to shipped or out_for_delivery, add an automatic tracking milestone
    if (orderStatus !== order.orderStatus) {
      finalUpdates = [
        {
          id: `trk-${Date.now()}`,
          status:
            orderStatus === 'shipped'
              ? 'Dispatched'
              : orderStatus === 'out_for_delivery'
              ? 'Out for Delivery'
              : orderStatus === 'delivered'
              ? 'Delivered'
              : 'Processing Update',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          location: `${order.customer?.district || 'Kathmandu'} Hub`,
          description: `Consignment marked as ${orderStatus.toUpperCase()} via ${courierPartner}`,
          completed: true,
        },
        ...finalUpdates,
      ];
    }

    const updatedOrder: Order = {
      ...order,
      courierPartner,
      awbNumber,
      trackingCode: awbNumber,
      riderName,
      riderPhone,
      estimatedDeliveryDays: estimatedDays,
      orderStatus,
      paymentStatus,
      trackingUpdates: finalUpdates,
    };

    onSaveLogistics(updatedOrder);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-stone-950 border border-stone-800 text-white w-full max-w-2xl p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white text-black">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400">
                LOGISTICS & WAYBILL
              </span>
              <h3 className="text-base font-black uppercase tracking-wider text-white">
                Dispatch Order #{order.id}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white bg-stone-900 border border-stone-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Customer & Destination Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-stone-900/60 border border-stone-800 text-xs">
          <div>
            <span className="text-[10px] uppercase text-stone-500 font-bold tracking-wider">CONSIGNEE / CUSTOMER</span>
            <div className="font-bold text-white uppercase mt-0.5">{order.customer?.fullName}</div>
            <div className="text-stone-300 font-mono">{order.customer?.phone}</div>
            <div className="text-stone-400 mt-1">
              {order.customer?.streetAddress}, Ward {order.customer?.wardNumber}, {order.customer?.district}, {order.customer?.provinceName}
            </div>
          </div>
          <div>
            <span className="text-[10px] uppercase text-stone-500 font-bold tracking-wider">ORDER SUMMARY</span>
            <div className="font-mono font-bold text-white mt-0.5">
              {formatNPR(order.totalAmount || order.grandTotal || 0)}
            </div>
            <div className="text-[11px] text-stone-400 uppercase font-mono">
              PAYMENT: {order.paymentMethod.toUpperCase()} ({order.paymentStatus})
            </div>
            <div className="text-[11px] text-stone-500 mt-1">
              ITEMS: {order.items.map((it) => `${it.quantity}x ${it.product.name}`).join(', ')}
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Dispatch Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-stone-400 uppercase font-bold text-[10px] tracking-wider mb-1">
                ASSIGNED COURIER PARTNER
              </label>
              <select
                value={courierPartner}
                onChange={(e) => setCourierPartner(e.target.value)}
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-white font-medium focus:outline-none focus:border-stone-500 uppercase"
              >
                {NEPAL_COURIER_PARTNERS.map((cp) => (
                  <option key={cp} value={cp}>
                    {cp}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-stone-400 uppercase font-bold text-[10px] tracking-wider">
                  WAYBILL / AIR TRACKING NO (AWB)
                </label>
                <button
                  type="button"
                  onClick={handleGenerateAWB}
                  className="text-[10px] text-stone-400 hover:text-white underline cursor-pointer"
                >
                  Regenerate
                </button>
              </div>
              <input
                type="text"
                value={awbNumber}
                onChange={(e) => setAwbNumber(e.target.value.toUpperCase())}
                required
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-white font-mono font-bold tracking-wider"
              />
            </div>

            <div>
              <label className="block text-stone-400 uppercase font-bold text-[10px] tracking-wider mb-1">
                DELIVERY RIDER / DRIVER NAME
              </label>
              <input
                type="text"
                placeholder="E.G. RAMESH THAPA"
                value={riderName}
                onChange={(e) => setRiderName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-stone-400 uppercase font-bold text-[10px] tracking-wider mb-1">
                RIDER CONTACT NUMBER
              </label>
              <input
                type="tel"
                placeholder="E.G. 9841000000"
                value={riderPhone}
                onChange={(e) => setRiderPhone(e.target.value)}
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-stone-400 uppercase font-bold text-[10px] tracking-wider mb-1">
                ESTIMATED TRANSIT TIMELINE
              </label>
              <input
                type="text"
                value={estimatedDays}
                onChange={(e) => setEstimatedDays(e.target.value)}
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-white font-medium"
              />
            </div>

            <div>
              <label className="block text-stone-400 uppercase font-bold text-[10px] tracking-wider mb-1">
                FULFILLMENT STATUS
              </label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value as Order['orderStatus'])}
                className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-white font-bold uppercase tracking-wider"
              >
                <option value="confirmed">CONFIRMED (READY TO PACK)</option>
                <option value="processing">PROCESSING / PACKING</option>
                <option value="shipped">SHIPPED / DISPATCHED</option>
                <option value="out_for_delivery">OUT FOR DELIVERY</option>
                <option value="delivered">DELIVERED & COMPLETED</option>
              </select>
            </div>
          </div>

          {/* Quick Payment Status Toggle */}
          <div className="flex items-center justify-between p-3 bg-stone-900/60 border border-stone-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                PAYMENT SETTLEMENT
              </span>
              <div className="font-mono font-bold text-white mt-0.5">
                Status: {paymentStatus.toUpperCase()}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentStatus('completed')}
                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider border ${
                  paymentStatus === 'completed' || paymentStatus === 'verified'
                    ? 'bg-red-600 text-white border-red-500'
                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
                }`}
              >
                ✓ MARK PAID / COLLECTED
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus('cod_pending')}
                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider border ${
                  paymentStatus === 'cod_pending' || paymentStatus === 'pending'
                    ? 'bg-amber-600 text-white border-amber-500'
                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
                }`}
              >
                COD PENDING
              </button>
            </div>
          </div>

          {/* Live Checkpoint Appender */}
          <div className="p-4 bg-stone-900/40 border border-stone-800 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400">
              APPEND LIVE TRACKING CHECKPOINT
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="STATUS (E.G. IN TRANSIT)"
                value={newCheckpointStatus}
                onChange={(e) => setNewCheckpointStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-stone-950 border border-stone-800 text-white font-medium text-xs uppercase"
              />
              <input
                type="text"
                placeholder="HUB LOCATION (E.G. POKHARA HUB)"
                value={newCheckpointLocation}
                onChange={(e) => setNewCheckpointLocation(e.target.value)}
                className="px-2.5 py-1.5 bg-stone-950 border border-stone-800 text-white font-medium text-xs"
              />
              <input
                type="text"
                placeholder="NOTE (E.G. ARRIVED AT FACILITY)"
                value={newCheckpointDesc}
                onChange={(e) => setNewCheckpointDesc(e.target.value)}
                className="px-2.5 py-1.5 bg-stone-950 border border-stone-800 text-white font-medium text-xs"
              />
            </div>
            <button
              type="button"
              onClick={handleAddCheckpoint}
              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>LOG CHECKPOINT NOW</span>
            </button>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 font-bold uppercase tracking-wider cursor-pointer"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-white hover:bg-stone-200 text-black font-black uppercase tracking-wider cursor-pointer shadow-lg"
            >
              SAVE & UPDATE WAYBILL
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

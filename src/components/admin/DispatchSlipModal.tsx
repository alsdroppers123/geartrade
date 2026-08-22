import React from 'react';
import { Printer, X, Download, ShieldCheck, MapPin, Phone, Package, Calendar, CheckCircle2 } from 'lucide-react';
import { Order } from '../../types';
import { formatNPR } from '../../services/fonepayService';
import { GeartradeLogo } from '../GeartradeLogo';

interface DispatchSlipModalProps {
  isOpen: boolean;
  order: Order | null;
  onClose: () => void;
}

export const DispatchSlipModal: React.FC<DispatchSlipModalProps> = ({
  isOpen,
  order,
  onClose,
}) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const isCOD = order.paymentMethod === 'cod';
  const totalPayable = order.totalAmount || order.grandTotal || 0;
  const awbCode = order.awbNumber || order.trackingCode || `AWB-NP-${order.id.slice(-6)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-stone-950 border border-stone-800 text-white w-full max-w-3xl p-6 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
        {/* Header Action Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-800 print:hidden">
          <div className="flex items-center gap-2.5">
            <Printer className="w-5 h-5 text-white" />
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400">
                OFFICIAL CARRIER DOCUMENT
              </span>
              <h3 className="text-base font-black uppercase tracking-wider text-white">
                Dispatch Slip & Air Waybill
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-white hover:bg-stone-200 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow"
            >
              <Printer className="w-4 h-4" />
              <span>PRINT SLIP</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white bg-stone-900 border border-stone-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Official Waybill Document */}
        <div className="bg-white text-black p-6 sm:p-8 border border-stone-300 font-sans shadow-sm print:p-0 print:border-none">
          {/* Top Bar with Brand & AWB Barcode Box */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-black gap-4">
            <div>
              <GeartradeLogo variant="full" theme="black" size="md" />
              <div className="text-[10px] font-bold tracking-widest text-stone-600 mt-1 uppercase">
                EXPEDITION APPAREL & TECHNICAL MOUNTAIN GEAR
              </div>
              <div className="text-[11px] text-stone-700 mt-0.5">
                Kathmandu Central Warehouse, Durbarmarg / Thamel • Phone: +977-9801234567 • PAN: 609823412
              </div>
            </div>

            <div className="text-right sm:text-right border-2 border-black p-2.5 bg-stone-50 min-w-[200px]">
              <div className="text-[10px] font-black uppercase tracking-widest text-stone-600">
                AIR WAYBILL (AWB) NO.
              </div>
              <div className="font-mono font-black text-lg tracking-wider text-black mt-0.5">
                {awbCode}
              </div>
              {/* Pseudo Barcode lines */}
              <div className="flex justify-between items-center h-6 mt-1 px-1 opacity-80">
                {[4, 2, 6, 1, 3, 5, 2, 4, 1, 6, 3, 2, 5, 1, 4, 2, 5, 3, 1, 6, 2, 4].map((w, i) => (
                  <div key={i} className="bg-black h-full" style={{ width: `${w * 1.2}px` }} />
                ))}
              </div>
              <div className="text-[9px] font-mono text-stone-500 mt-0.5 tracking-widest">
                REF: #{order.id}
              </div>
            </div>
          </div>

          {/* Sender & Consignee Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-5 border-b border-stone-300">
            {/* Sender / Origin */}
            <div className="space-y-1">
              <div className="text-[10px] font-black uppercase tracking-widest bg-stone-200 px-2 py-0.5 text-black inline-block">
                SHIPPER / ORIGIN
              </div>
              <div className="font-bold text-sm text-black uppercase">GEARTRADE TECHNICAL STORE</div>
              <div className="text-xs text-stone-800">Kathmandu Logistics Hub, Bagmati Province</div>
              <div className="text-xs text-stone-700 font-mono">Contact: 9801234567 / info@geartrade.np</div>
              <div className="text-xs text-stone-600">Date: {order.date || new Date().toLocaleDateString()}</div>
            </div>

            {/* Consignee / Delivery Destination */}
            <div className="space-y-1 bg-stone-50 p-3 border border-stone-200">
              <div className="text-[10px] font-black uppercase tracking-widest bg-black text-white px-2 py-0.5 inline-block">
                CONSIGNEE / DESTINATION
              </div>
              <div className="font-black text-sm text-black uppercase">
                {order.customer?.fullName || 'Valued Customer'}
              </div>
              <div className="font-mono font-bold text-xs text-black">
                PHONE: {order.customer?.phone || 'N/A'}
              </div>
              <div className="text-xs text-stone-800 font-medium leading-relaxed">
                {order.customer?.streetAddress}, Ward {order.customer?.wardNumber}, {order.customer?.municipality}
              </div>
              <div className="text-xs font-bold text-black uppercase">
                {order.customer?.district}, {order.customer?.provinceName}
              </div>
              {order.customer?.deliveryNotes && (
                <div className="text-[11px] text-stone-600 italic mt-1 bg-amber-50 p-1 border border-amber-200">
                  Note: {order.customer.deliveryNotes}
                </div>
              )}
            </div>
          </div>

          {/* Payment Mode Highlight Box */}
          <div className="my-5 p-4 border-2 border-black flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-stone-100">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-600">
                PAYMENT TERMS & COLLECTION AMOUNT
              </span>
              <div className="text-base sm:text-lg font-black text-black uppercase flex items-center gap-2">
                {isCOD ? (
                  <span className="text-amber-800 font-mono">CASH ON DELIVERY (COD)</span>
                ) : (
                  <span className="text-red-800 font-mono">PAID ONLINE ({order.paymentMethod.toUpperCase()})</span>
                )}
              </div>
              <p className="text-[11px] text-stone-600 font-light">
                {isCOD
                  ? 'Courier Rider must collect the exact amount below prior to parcel handover.'
                  : 'Prepaid in full via Fonepay Gateway. Do not collect any additional payment.'}
              </p>
            </div>

            <div className="text-right sm:text-right bg-white p-3 border border-black min-w-[160px]">
              <span className="text-[10px] font-bold text-stone-500 uppercase">
                {isCOD ? 'COLLECTIBLE CASH' : 'TOTAL SETTLED'}
              </span>
              <div className="text-xl font-black font-mono text-black">
                {formatNPR(totalPayable)}
              </div>
            </div>
          </div>

          {/* Package Contents Table */}
          <div className="mb-6">
            <div className="text-[10px] font-black uppercase tracking-widest text-stone-600 mb-2">
              PACKAGE CONTENTS MANIFEST
            </div>
            <table className="w-full text-left text-xs border border-stone-300">
              <thead className="bg-stone-200 text-stone-900 font-black uppercase text-[10px]">
                <tr>
                  <th className="p-2 border-b border-stone-300">ITEM DESCRIPTION</th>
                  <th className="p-2 border-b border-stone-300">VARIANT / SIZE</th>
                  <th className="p-2 border-b border-stone-300 text-center">QTY</th>
                  <th className="p-2 border-b border-stone-300 text-right">UNIT PRICE</th>
                  <th className="p-2 border-b border-stone-300 text-right">TOTAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {order.items.map((item, i) => (
                  <tr key={i}>
                    <td className="p-2 font-medium text-black">
                      <div className="font-bold">{item.product.name}</div>
                      <div className="text-[10px] text-stone-500 font-mono">{item.product.styleCode}</div>
                    </td>
                    <td className="p-2 text-stone-700">
                      {item.selectedSize || 'Standard'} {item.selectedColor ? `/ ${item.selectedColor}` : ''}
                    </td>
                    <td className="p-2 text-center font-mono font-bold">{item.quantity}</td>
                    <td className="p-2 text-right font-mono">{formatNPR(item.product.price)}</td>
                    <td className="p-2 text-right font-mono font-bold">{formatNPR(item.product.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-stone-50 text-stone-800 font-mono text-xs">
                <tr>
                  <td colSpan={4} className="p-2 text-right font-bold uppercase">Subtotal</td>
                  <td className="p-2 text-right font-bold">{formatNPR(order.subtotal)}</td>
                </tr>
                {order.discount > 0 && (
                  <tr>
                    <td colSpan={4} className="p-2 text-right font-bold uppercase text-rose-700">Discount</td>
                    <td className="p-2 text-right font-bold text-rose-700">-{formatNPR(order.discount)}</td>
                  </tr>
                )}
                <tr>
                  <td colSpan={4} className="p-2 text-right font-bold uppercase">Delivery Charge</td>
                  <td className="p-2 text-right font-bold">{formatNPR(order.deliveryCharge)}</td>
                </tr>
                <tr className="bg-stone-200 text-black text-sm font-black">
                  <td colSpan={4} className="p-2.5 text-right uppercase">Grand Total (Incl. 13% VAT)</td>
                  <td className="p-2.5 text-right">{formatNPR(totalPayable)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Courier Handover & Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t-2 border-dashed border-stone-300">
            <div className="space-y-10">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                DISPATCH OFFICER SIGNATURE & STAMP
              </div>
              <div className="border-b border-black w-3/4" />
              <div className="text-[10px] text-stone-500 uppercase">Kathmandu Logistics Facility</div>
            </div>

            <div className="space-y-10">
              <div className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                CONSIGNEE / RECIPIENT SIGNATURE & DATE
              </div>
              <div className="border-b border-black w-3/4" />
              <div className="text-[10px] text-stone-500 uppercase">Received in Good Order & Condition</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

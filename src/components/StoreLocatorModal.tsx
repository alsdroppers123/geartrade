import React, { useState } from 'react';
import { X, MapPin, Phone, Clock, Navigation, Search, CheckCircle2 } from 'lucide-react';
import { GeartradeLogo } from './GeartradeLogo';

interface StoreLocatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StoreLocation {
  id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  hours: string;
  isFlagship?: boolean;
}

const OUTLETS: StoreLocation[] = [
  {
    id: 'thamel-flagship',
    name: 'GEARTRADE Thamel Flagship Store',
    city: 'Kathmandu',
    district: 'Kathmandu Valley',
    address: 'Tridevi Marg (Opposite Himalayan Java), Thamel',
    phone: '+977-01-4428901 / 9801234567',
    hours: 'Sun - Sat: 9:30 AM - 8:30 PM',
    isFlagship: true,
  },
  {
    id: 'durbar-marg',
    name: 'GEARTRADE Durbar Marg Premium Store',
    city: 'Kathmandu',
    district: 'Kathmandu Valley',
    address: 'Durbar Marg (Next to Narayanhiti Palace North Gate)',
    phone: '+977-01-4221144',
    hours: 'Sun - Sat: 10:00 AM - 8:00 PM',
    isFlagship: true,
  },
  {
    id: 'labim-mall',
    name: 'GEARTRADE Labim Mall Lalitpur',
    city: 'Patan',
    district: 'Lalitpur',
    address: '2nd Floor, Unit #214, Labim Mall, Pulchowk',
    phone: '+977-01-5532890',
    hours: 'Sun - Sat: 10:00 AM - 8:30 PM',
  },
  {
    id: 'city-center',
    name: 'GEARTRADE City Center Store',
    city: 'Kathmandu',
    district: 'Kathmandu Valley',
    address: '1st Floor, City Center Mall, Kamalpokhari',
    phone: '+977-01-4011500',
    hours: 'Sun - Sat: 10:00 AM - 8:00 PM',
  },
  {
    id: 'pokhara-lakeside',
    name: 'GEARTRADE Pokhara Lakeside Adventure Hub',
    city: 'Pokhara',
    district: 'Kaski / Gandaki',
    address: 'Center Point, Baidam Road, Lakeside-6, Pokhara',
    phone: '+977-61-465780 / 9856012345',
    hours: 'Sun - Sat: 9:00 AM - 9:00 PM',
    isFlagship: true,
  },
  {
    id: 'chitwan-outlet',
    name: 'GEARTRADE Chitwan Bharatpur Outlet',
    city: 'Bharatpur',
    district: 'Chitwan / Bagmati',
    address: 'Lions Chowk, Narayangarh - Bharatpur Highway',
    phone: '+977-56-571290',
    hours: 'Sun - Sat: 9:30 AM - 7:30 PM',
  },
];

export const StoreLocatorModal: React.FC<StoreLocatorModalProps> = ({ isOpen, onClose }) => {
  const [searchCity, setSearchCity] = useState('');
  const [selectedOutlet, setSelectedOutlet] = useState<StoreLocation>(OUTLETS[0]);

  if (!isOpen) return null;

  const filteredOutlets = OUTLETS.filter(
    (o) =>
      o.name.toLowerCase().includes(searchCity.toLowerCase()) ||
      o.city.toLowerCase().includes(searchCity.toLowerCase()) ||
      o.district.toLowerCase().includes(searchCity.toLowerCase()) ||
      o.address.toLowerCase().includes(searchCity.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="w-full max-w-4xl bg-white text-stone-900 rounded-3xl shadow-2xl border border-stone-200 overflow-hidden relative max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 bg-[#102A45] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GeartradeLogo variant="badge" size="sm" />
            <div>
              <h2 className="font-extrabold text-base text-white">
                GEARTRADE Store & Retail Outlets
              </h2>
              <p className="text-xs text-slate-300">
                Explore our official flagship stores & retail locations across Nepal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Outlets List (Left 5 Cols) */}
          <div className="md:col-span-5 space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                placeholder="Search Kathmandu, Pokhara, Lalitpur..."
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#102A45]"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
              {filteredOutlets.map((outlet) => {
                const isSelected = selectedOutlet.id === outlet.id;
                return (
                  <div
                    key={outlet.id}
                    onClick={() => setSelectedOutlet(outlet)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#102A45] bg-slate-50 shadow-sm ring-1 ring-[#102A45]'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-xs text-slate-900 leading-snug">{outlet.name}</h3>
                      {outlet.isFlagship && (
                        <span className="bg-[#102A45] text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase shrink-0">
                          Flagship
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#DE4B56] shrink-0" />
                      <span className="truncate">{outlet.address}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Outlet Details & Map View (Right 7 Cols) */}
          <div className="md:col-span-7 bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-[#DE4B56] tracking-wider uppercase">
                    {selectedOutlet.city} • {selectedOutlet.district}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 mt-0.5">{selectedOutlet.name}</h3>
                </div>
                {selectedOutlet.isFlagship && (
                  <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold px-2.5 py-1 rounded-full">
                    Experience Center
                  </span>
                )}
              </div>

              {/* Info Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px]">
                    <MapPin className="w-3.5 h-3.5 text-[#DE4B56]" />
                    <span>Exact Location</span>
                  </div>
                  <p className="text-slate-800 font-medium text-[11px] leading-relaxed">
                    {selectedOutlet.address}
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Contact Helpline</span>
                  </div>
                  <p className="text-slate-800 font-medium text-[11px] leading-relaxed">
                    {selectedOutlet.phone}
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-1.5 text-slate-400 font-bold text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-[#F5A623]" />
                    <span>Store Hours</span>
                  </div>
                  <p className="text-slate-800 font-semibold text-[11px]">
                    {selectedOutlet.hours} (Open All 7 Days)
                  </p>
                </div>
              </div>

              {/* In-Store Fonepay QR Support */}
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  <strong>Fonepay Dynamic QR</strong> and All Nepali Cards accepted at this store POS terminal.
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">Walk-ins and Try-ons welcome anytime</span>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-[#102A45] hover:bg-[#162B4D] text-white font-bold text-xs rounded-xl shadow cursor-pointer transition-colors"
              >
                Close Store Locator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

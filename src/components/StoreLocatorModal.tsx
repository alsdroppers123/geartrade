import React, { useState } from 'react';
import { X, MapPin, Phone, Clock, Search, CheckCircle2 } from 'lucide-react';
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
    name: 'GEARTRADE Durbar Marg Store',
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn font-sans">
      <div
        className="w-full max-w-4xl bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden relative max-h-[90vh] flex flex-col animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GeartradeLogo variant="full" theme="auto" size="sm" />
            <div>
              <h2 className="font-black text-xs sm:text-sm uppercase tracking-[0.16em] text-black dark:text-white">
                RETAIL OUTLETS & STORES
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors cursor-pointer"
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
                placeholder="SEARCH CITY OR LOCATION..."
                className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs pl-9 pr-3 py-2.5 focus:outline-none focus:border-black dark:focus:border-white uppercase font-medium placeholder-stone-400 dark:placeholder-stone-500 text-stone-900 dark:text-stone-100"
              />
              <Search className="w-4 h-4 text-stone-400 dark:text-stone-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>

            <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
              {filteredOutlets.map((outlet) => {
                const isSelected = selectedOutlet.id === outlet.id;
                return (
                  <div
                    key={outlet.id}
                    onClick={() => setSelectedOutlet(outlet)}
                    className={`p-3.5 border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-black dark:border-white bg-stone-50 dark:bg-stone-900 shadow-xs ring-1 ring-black dark:ring-white'
                        : 'border-stone-200 dark:border-stone-800 hover:border-stone-400 bg-white dark:bg-stone-950'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-xs text-stone-900 dark:text-stone-100 uppercase tracking-tight leading-snug">{outlet.name}</h3>
                      {outlet.isFlagship && (
                        <span className="bg-black dark:bg-white text-white dark:text-black text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider shrink-0">
                          Flagship
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 flex items-center gap-1 font-light">
                      <MapPin className="w-3 h-3 text-stone-700 dark:text-stone-300 shrink-0" />
                      <span className="truncate">{outlet.address}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Outlet Details & Map View (Right 7 Cols) */}
          <div className="md:col-span-7 bg-stone-50 dark:bg-stone-900 p-5 border border-stone-200 dark:border-stone-800 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 dark:text-stone-500 tracking-[0.2em] uppercase">
                    {selectedOutlet.city} • {selectedOutlet.district}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-stone-100 uppercase mt-0.5">{selectedOutlet.name}</h3>
                </div>
                {selectedOutlet.isFlagship && (
                  <span className="bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-bold px-2.5 py-1 uppercase tracking-wider text-[10px]">
                    Experience Hub
                  </span>
                )}
              </div>

              {/* Info Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-white dark:bg-stone-950 p-3.5 border border-stone-200 dark:border-stone-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-stone-400 dark:text-stone-500 font-bold text-[10px] uppercase tracking-wider">
                    <MapPin className="w-3.5 h-3.5 text-stone-800 dark:text-stone-200" />
                    <span>Exact Location</span>
                  </div>
                  <p className="text-stone-800 dark:text-stone-200 font-medium text-[11px] leading-relaxed">
                    {selectedOutlet.address}
                  </p>
                </div>

                <div className="bg-white dark:bg-stone-950 p-3.5 border border-stone-200 dark:border-stone-800 space-y-1">
                  <div className="flex items-center gap-1.5 text-stone-400 dark:text-stone-500 font-bold text-[10px] uppercase tracking-wider">
                    <Phone className="w-3.5 h-3.5 text-stone-800 dark:text-stone-200" />
                    <span>Contact Helpline</span>
                  </div>
                  <p className="text-stone-800 dark:text-stone-200 font-medium text-[11px] leading-relaxed">
                    {selectedOutlet.phone}
                  </p>
                </div>

                <div className="bg-white dark:bg-stone-950 p-3.5 border border-stone-200 dark:border-stone-800 space-y-1 sm:col-span-2">
                  <div className="flex items-center gap-1.5 text-stone-400 dark:text-stone-500 font-bold text-[10px] uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-stone-800 dark:text-stone-200" />
                    <span>Store Hours</span>
                  </div>
                  <p className="text-stone-800 dark:text-stone-200 font-semibold text-[11px]">
                    {selectedOutlet.hours} (Open All 7 Days)
                  </p>
                </div>
              </div>

              {/* In-Store Fonepay QR Support */}
              <div className="bg-stone-100 dark:bg-stone-800/60 border border-stone-300 dark:border-stone-700 p-3 flex items-center gap-2.5 text-xs text-stone-800 dark:text-stone-200">
                <CheckCircle2 className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span className="font-light">
                  <strong className="font-bold">Fonepay Dynamic QR</strong>, eSewa, and all major cards accepted at this store POS terminal.
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-light">Walk-ins & Try-ons welcome</span>
              <button
                onClick={onClose}
                className="px-5 py-2.5 bg-black dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-black font-bold text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Close Locator
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

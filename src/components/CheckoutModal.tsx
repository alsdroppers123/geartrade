import React, { useState, useEffect } from 'react';
import {
  X,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Smartphone,
  Banknote,
  Copy,
  Check,
  RefreshCw,
  Truck
} from 'lucide-react';
import { CartItem, CustomerDetails, Order, PaymentMethodType } from '../types';
import { NEPAL_PROVINCES, POPULAR_COUPONS } from '../data/nepalLocations';
import {
  generateFonepayDynamicQR,
  FonepayDynamicQRData,
  formatNPR,
  getNepaliDateBS
} from '../services/fonepayService';
import { GeartradeLogo } from './GeartradeLogo';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  selectedProvinceId: number;
  appliedCoupon: string | null;
  onOrderComplete: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  selectedProvinceId,
  appliedCoupon,
  onOrderComplete,
}) => {
  const [step, setStep] = useState<'details' | 'payment_method' | 'processing_fonepay'>('details');

  // Customer Form State
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: '',
    phone: '',
    email: '',
    provinceId: selectedProvinceId,
    provinceName: NEPAL_PROVINCES.find((p) => p.id === selectedProvinceId)?.name || NEPAL_PROVINCES[2].name,
    district: 'Kathmandu',
    municipality: '',
    wardNumber: '',
    streetAddress: '',
    deliveryNotes: '',
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethodType>('fonepay_qr');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fonepay Dynamic QR State
  const [qrData, setQrData] = useState<FonepayDynamicQRData | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(300); // 5 minutes
  const [isSimulatingBankApp, setIsSimulatingBankApp] = useState(false);
  const [copiedPRN, setCopiedPRN] = useState(false);
  const [currentPRN, setCurrentPRN] = useState<string>('');

  const currentProvince = NEPAL_PROVINCES.find((p) => p.id === customer.provinceId) || NEPAL_PROVINCES[2];

  // Financial Computations
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

  // Update district list when province changes
  useEffect(() => {
    const prov = NEPAL_PROVINCES.find((p) => p.id === customer.provinceId);
    if (prov && (!prov.districts.includes(customer.district) || customer.district === '')) {
      setCustomer((prev) => ({
        ...prev,
        provinceName: prov.name,
        district: prov.districts[0] || 'Kathmandu',
      }));
    }
  }, [customer.provinceId]);

  // QR Expiration Countdown
  useEffect(() => {
    let timer: any;
    if (step === 'processing_fonepay' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  if (!isOpen) return null;

  const validateDetails = (): boolean => {
    const errors: Record<string, string> = {};
    if (!customer.fullName.trim()) errors.fullName = 'Please enter your full name';
    if (!customer.phone.trim()) {
      errors.phone = 'Mobile number is required';
    } else if (!/^(98|97|96)\d{8}$/.test(customer.phone.replace(/[\s-]/g, ''))) {
      errors.phone = 'Please enter a valid 10-digit Nepal mobile number (e.g. 9841XXXXXX)';
    }
    if (!customer.streetAddress.trim()) errors.streetAddress = 'Delivery street address is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = async () => {
    if (!validateDetails()) {
      setStep('details');
      return;
    }

    if (selectedPaymentMethod === 'fonepay_qr') {
      const generated = await generateFonepayDynamicQR(grandTotal, 'GEARTRADE Nepal Gear Purchase');
      setQrData(generated);
      setCurrentPRN(generated.prn);
      setTimeLeft(300);
      setStep('processing_fonepay');
    } else {
      // Cash on Delivery
      finishOrder('cod', 'pending', undefined);
    }
  };

  const handleSimulateBankScan = (bankName: string) => {
    setIsSimulatingBankApp(true);
    setTimeout(() => {
      setIsSimulatingBankApp(false);
      const traceId = `FP-TRC-${Math.floor(100000 + Math.random() * 900000)}`;
      finishOrder('fonepay_qr', 'completed', traceId, bankName);
    }, 1500);
  };

  const finishOrder = (
    method: PaymentMethodType,
    payStatus: 'pending' | 'completed',
    fonepayTrace?: string,
    bankName?: string
  ) => {
    const trackingCode = `GT-NP-${Math.floor(100000 + Math.random() * 900000)}`;
    const newOrder: Order = {
      id: `ORD-${Date.now()}`,
      trackingCode,
      createdAt: new Date().toISOString(),
      nepaliDateBS: getNepaliDateBS(),
      items: [...items],
      customerDetails: { ...customer },
      paymentMethod: method,
      paymentStatus: payStatus,
      fonepayTraceId: fonepayTrace,
      fonepayBankName: bankName,
      subtotal,
      discount,
      deliveryCharge,
      vatAmount,
      grandTotal,
      orderStatus: 'order_placed',
      estimatedDeliveryDays: currentProvince.estimatedDays,
    };

    onOrderComplete(newOrder);
    onClose();
  };

  const handleCopyPRN = () => {
    if (qrData?.prn) {
      navigator.clipboard?.writeText?.(qrData.prn);
      setCopiedPRN(true);
      setTimeout(() => setCopiedPRN(false), 2000);
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-xs animate-fadeIn font-sans">
      <div
        className="bg-white dark:bg-stone-950 w-full max-w-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden flex flex-col max-h-[92vh] animate-scaleUp text-stone-900 dark:text-stone-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white dark:bg-stone-950">
          <div className="flex items-center gap-3">
            <GeartradeLogo variant="full" theme="auto" size="sm" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
              | Checkout
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Step Indicator */}
        <div className="px-6 py-3 bg-stone-50 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
          <div className={`flex items-center gap-2 ${step === 'details' ? 'text-black dark:text-white font-black' : ''}`}>
            <span className={`w-5 h-5 flex items-center justify-center border text-[10px] ${step === 'details' ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black' : 'border-stone-300 dark:border-stone-700'}`}>
              1
            </span>
            <span>Delivery</span>
          </div>
          <span>→</span>
          <div className={`flex items-center gap-2 ${step === 'payment_method' ? 'text-black dark:text-white font-black' : ''}`}>
            <span className={`w-5 h-5 flex items-center justify-center border text-[10px] ${step === 'payment_method' ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black' : 'border-stone-300 dark:border-stone-700'}`}>
              2
            </span>
            <span>Payment</span>
          </div>
          <span>→</span>
          <div className={`flex items-center gap-2 ${step === 'processing_fonepay' ? 'text-black dark:text-white font-black' : ''}`}>
            <span className={`w-5 h-5 flex items-center justify-center border text-[10px] ${step === 'processing_fonepay' ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black' : 'border-stone-300 dark:border-stone-700'}`}>
              3
            </span>
            <span>Confirm</span>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: CUSTOMER DETAILS */}
          {step === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    placeholder="e.g. Abhishek Basnet"
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs px-3.5 py-2.5 focus:outline-none focus:border-black dark:focus:border-white font-medium uppercase"
                  />
                  {formErrors.fullName && (
                    <p className="text-[10px] text-rose-500 mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                {/* Nepal Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Nepal Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 dark:text-stone-500 text-xs font-bold">
                      +977
                    </span>
                    <input
                      type="tel"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      placeholder="98XXXXXXXX"
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs pl-14 pr-3.5 py-2.5 focus:outline-none focus:border-black dark:focus:border-white font-medium font-mono"
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-[10px] text-rose-500 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Email Address <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs px-3.5 py-2.5 focus:outline-none focus:border-black dark:focus:border-white font-medium"
                  />
                </div>

                {/* Province Selection */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Province <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={customer.provinceId}
                    onChange={(e) => setCustomer({ ...customer, provinceId: Number(e.target.value) })}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs px-3.5 py-2.5 focus:outline-none focus:border-black dark:focus:border-white font-medium"
                  >
                    {NEPAL_PROVINCES.map((prov) => (
                      <option key={prov.id} value={prov.id}>
                        {prov.name} ({formatNPR(prov.deliveryFee)})
                      </option>
                    ))}
                  </select>
                </div>

                {/* District Selection */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    District <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={customer.district}
                    onChange={(e) => setCustomer({ ...customer, district: e.target.value })}
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs px-3.5 py-2.5 focus:outline-none focus:border-black dark:focus:border-white font-medium"
                  >
                    {currentProvince.districts.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Street Address / Landmark */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                    Street Address / Landmark <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customer.streetAddress}
                    onChange={(e) => setCustomer({ ...customer, streetAddress: e.target.value })}
                    placeholder="e.g. New Baneshwor, near Nabil Bank"
                    className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-xs px-3.5 py-2.5 focus:outline-none focus:border-black dark:focus:border-white font-medium uppercase"
                  />
                  {formErrors.streetAddress && (
                    <p className="text-[10px] text-rose-500 mt-1">{formErrors.streetAddress}</p>
                  )}
                </div>
              </div>

              {/* Order Summary Snapshot */}
              <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 flex items-center justify-between text-xs mt-2">
                <div>
                  <span className="text-stone-500 dark:text-stone-400 uppercase tracking-wider text-[10px]">Total Payable: </span>
                  <span className="text-black dark:text-white font-black text-base ml-1">
                    {formatNPR(grandTotal)}
                  </span>
                  <span className="text-stone-400 dark:text-stone-500 text-[11px] ml-1">({items.length} items)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (validateDetails()) {
                      setStep('payment_method');
                    }
                  }}
                  className="px-5 py-2.5 bg-black dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-black font-bold uppercase tracking-wider transition-all shadow-xs flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PAYMENT METHOD SELECTION (ONLY FONEPAY & COD) */}
          {step === 'payment_method' && (
            <div className="space-y-4">
              <div className="space-y-2.5">
                {/* 1. Fonepay QR */}
                <div
                  onClick={() => setSelectedPaymentMethod('fonepay_qr')}
                  className={`p-4 border transition-all cursor-pointer flex items-center justify-between ${
                    selectedPaymentMethod === 'fonepay_qr'
                      ? 'border-black dark:border-white bg-stone-50 dark:bg-stone-900 ring-1 ring-black dark:ring-white'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-black dark:text-white flex items-center justify-center font-bold text-sm">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                        Fonepay Dynamic QR
                      </span>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-light">
                        Pay with any Nepali mobile banking app or digital wallet via instant QR scan.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 border flex items-center justify-center ${
                      selectedPaymentMethod === 'fonepay_qr'
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                        : 'border-stone-300 dark:border-stone-700'
                    }`}
                  >
                    {selectedPaymentMethod === 'fonepay_qr' && <Check className="w-3 h-3" />}
                  </div>
                </div>

                {/* 2. Cash on Delivery (COD) */}
                <div
                  onClick={() => setSelectedPaymentMethod('cod')}
                  className={`p-4 border transition-all cursor-pointer flex items-center justify-between ${
                    selectedPaymentMethod === 'cod'
                      ? 'border-black dark:border-white bg-stone-50 dark:bg-stone-900 ring-1 ring-black dark:ring-white'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 flex items-center justify-center font-bold text-sm">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100 uppercase tracking-wider">
                        Cash on Delivery (COD)
                      </span>
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 font-light">
                        Pay cash to the delivery rider when your package arrives at your doorstep.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 border flex items-center justify-center ${
                      selectedPaymentMethod === 'cod'
                        ? 'border-black dark:border-white bg-black dark:bg-white text-white dark:text-black'
                        : 'border-stone-300 dark:border-stone-700'
                    }`}
                  >
                    {selectedPaymentMethod === 'cod' && <Check className="w-3 h-3" />}
                  </div>
                </div>
              </div>

              {/* Order Amount Summary */}
              <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-3.5 flex items-center justify-between text-xs font-medium">
                <span className="text-stone-600 dark:text-stone-400 uppercase tracking-wider text-[11px]">Grand Total Payable:</span>
                <span className="font-black text-sm text-black dark:text-white">{formatNPR(grandTotal)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Address</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="px-6 py-2.5 bg-black dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-black font-bold uppercase tracking-wider text-xs transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                >
                  <span>
                    {selectedPaymentMethod === 'fonepay_qr' ? 'Generate QR & Pay' : 'Confirm Order'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LIVE FONEPAY DYNAMIC QR PAYMENT INTERFACE */}
          {step === 'processing_fonepay' && qrData && (
            <div className="space-y-5 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                {/* QR Code Container */}
                <div className="md:col-span-6 bg-stone-50 dark:bg-stone-900 p-5 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 text-center space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-200">
                      Fonepay Dynamic QR
                    </span>
                    <span className="text-xs text-black dark:text-white font-black">
                      {formatNPR(grandTotal)}
                    </span>
                  </div>

                  {/* QR Image */}
                  <div className="relative mx-auto w-48 h-48 bg-white p-2 border border-stone-200 dark:border-stone-700 flex items-center justify-center shadow-xs">
                    <img
                      src={qrData.qrDataUrl}
                      alt="Fonepay Dynamic QR"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Countdown Timer */}
                  <div className="flex items-center justify-center gap-1.5 text-xs text-stone-600 dark:text-stone-400">
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    <span>Valid for: </span>
                    <span className="font-mono font-bold text-black dark:text-white">
                      {formatTimer(timeLeft)}
                    </span>
                  </div>

                  {/* PRN Reference */}
                  <div className="flex items-center justify-between text-[11px] bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 px-3 py-1.5">
                    <span className="text-stone-500 font-mono text-[10px]">PRN: {qrData.prn}</span>
                    <button
                      onClick={handleCopyPRN}
                      className="text-stone-700 dark:text-stone-300 hover:text-black dark:hover:text-white font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPRN ? <Check className="w-3 h-3 text-red-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPRN ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Instructions & Simulation */}
                <div className="md:col-span-6 space-y-3.5">
                  <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-4 space-y-2 text-xs">
                    <h3 className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
                      <Smartphone className="w-4 h-4 text-stone-700 dark:text-stone-300" />
                      <span>How to pay:</span>
                    </h3>
                    <ol className="list-decimal list-inside text-stone-600 dark:text-stone-400 space-y-1 text-[11px] leading-relaxed font-light">
                      <li>Open any Nepal mobile banking app (Nabil, NIC Asia, Global IME, etc.).</li>
                      <li>Tap the <strong>QR Scan</strong> icon.</li>
                      <li>Scan the QR code shown on screen.</li>
                      <li>Verify amount <strong>{formatNPR(grandTotal)}</strong> and confirm.</li>
                    </ol>
                  </div>

                  {/* Quick Demo Simulator */}
                  <div className="bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-3.5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                        Demo: Simulate App Payment
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleSimulateBankScan('Nabil SmartBank')}
                        disabled={isSimulatingBankApp}
                        className="p-2 bg-white dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-left text-xs text-stone-800 dark:text-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                      >
                        <span>🏛️</span>
                        <span className="truncate text-[11px]">Nabil Bank</span>
                      </button>

                      <button
                        onClick={() => handleSimulateBankScan('NIC Asia MoBank')}
                        disabled={isSimulatingBankApp}
                        className="p-2 bg-white dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-left text-xs text-stone-800 dark:text-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                      >
                        <span>🏦</span>
                        <span className="truncate text-[11px]">NIC Asia</span>
                      </button>

                      <button
                        onClick={() => handleSimulateBankScan('Global Smart Plus')}
                        disabled={isSimulatingBankApp}
                        className="p-2 bg-white dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-left text-xs text-stone-800 dark:text-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                      >
                        <span>💳</span>
                        <span className="truncate text-[11px]">Global IME</span>
                      </button>

                      <button
                        onClick={() => handleSimulateBankScan('eSewa Wallet')}
                        disabled={isSimulatingBankApp}
                        className="p-2 bg-white dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 text-left text-xs text-stone-800 dark:text-stone-200 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
                      >
                        <span>🟢</span>
                        <span className="truncate text-[11px]">eSewa QR</span>
                      </button>
                    </div>

                    {isSimulatingBankApp && (
                      <div className="flex items-center justify-center gap-2 py-2 text-xs font-bold text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying transaction...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                    <button
                      onClick={() => setStep('payment_method')}
                      className="hover:text-black dark:hover:text-white underline uppercase tracking-wider text-[10px] cursor-pointer"
                    >
                      Change payment method
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

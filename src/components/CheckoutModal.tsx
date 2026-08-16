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

  // Countdown timer for QR
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'processing_fonepay' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  if (!isOpen) return null;

  const validateDetails = (): boolean => {
    const errors: Record<string, string> = {};
    if (!customer.fullName.trim()) errors.fullName = 'Full name is required';
    if (!customer.phone.trim()) {
      errors.phone = 'Mobile number is required';
    } else if (!/^(98|97|96)\d{8}$/.test(customer.phone.replace(/\D/g, '')) && customer.phone.length < 10) {
      errors.phone = 'Enter a valid 10-digit Nepali mobile number (e.g. 9841XXXXXX)';
    }
    if (!customer.streetAddress.trim()) errors.streetAddress = 'Delivery address is required';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = async () => {
    if (!validateDetails()) return;

    const prn = `PRN-${Math.floor(100000 + Math.random() * 900000)}-${Date.now().toString().slice(-4)}`;
    setCurrentPRN(prn);

    if (selectedPaymentMethod === 'fonepay_qr') {
      const generated = await generateFonepayDynamicQR({
        prn,
        totalAmount: grandTotal,
        customer: { fullName: customer.fullName, phone: customer.phone },
      });
      setQrData(generated);
      setTimeLeft(300);
      setStep('processing_fonepay');
    } else if (selectedPaymentMethod === 'cod') {
      finalizeOrder('cod_pending', 'confirmed', undefined, 'CASH_ON_DELIVERY');
    }
  };

  const finalizeOrder = (
    paymentStatus: 'verified' | 'cod_pending' | 'pending' | 'failed',
    orderStatus: 'confirmed' | 'processing' = 'confirmed',
    fonepayTransactionId?: string,
    traceId?: string
  ) => {
    const newOrder: Order = {
      id: `ORD-${Date.now().toString().slice(-6)}`,
      prn: currentPRN || `PRN-${Math.floor(100000 + Math.random() * 900000)}`,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      nepaliDate: getNepaliDateBS(new Date()),
      customer,
      items,
      subtotal,
      discount,
      couponCode: appliedCoupon || undefined,
      deliveryCharge,
      taxAmount: vatAmount,
      totalAmount: grandTotal,
      paymentMethod: selectedPaymentMethod,
      paymentStatus,
      orderStatus,
      fonepayTraceId: traceId || qrData?.traceId,
      fonepayTransactionId: fonepayTransactionId || `FP-${Math.floor(100000000 + Math.random() * 900000000)}`,
      merchantPan: '609823412',
    };

    onOrderComplete(newOrder);
  };

  const handleSimulateBankScan = (bankName: string) => {
    setIsSimulatingBankApp(true);
    setTimeout(() => {
      setIsSimulatingBankApp(false);
      const randomUid = `FP-TXN-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      finalizeOrder('verified', 'confirmed', randomUid, qrData?.traceId);
    }, 1200);
  };

  const handleCopyPRN = () => {
    if (qrData?.prn) {
      navigator.clipboard?.writeText?.(qrData.prn);
      setCopiedPRN(true);
      setTimeout(() => setCopiedPRN(false), 2000);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div
        className="w-full max-w-2xl bg-white text-stone-900 rounded-2xl shadow-xl border border-stone-200 overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Minimal Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div>
            <h2 className="font-extrabold text-base text-stone-900 tracking-tight">
              {step === 'details' && 'Delivery Information'}
              {step === 'payment_method' && 'Select Payment Method'}
              {step === 'processing_fonepay' && 'Fonepay QR Payment'}
            </h2>
            <p className="text-xs text-stone-500">
              {step === 'details' && 'Enter your address for delivery across Nepal'}
              {step === 'payment_method' && 'Choose your preferred payment method'}
              {step === 'processing_fonepay' && 'Scan with any mobile banking app to complete order'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {/* STEP 1: CUSTOMER & DELIVERY DETAILS */}
          {step === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Full Name <span className="text-[#DE4B56]">*</span>
                  </label>
                  <input
                    type="text"
                    value={customer.fullName}
                    onChange={(e) => setCustomer({ ...customer, fullName: e.target.value })}
                    placeholder="e.g. Abhishek Basnet"
                    className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#102A45] focus:bg-white"
                  />
                  {formErrors.fullName && (
                    <p className="text-[10px] text-rose-500 mt-1">{formErrors.fullName}</p>
                  )}
                </div>

                {/* Nepal Mobile Number */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Nepal Mobile Number <span className="text-[#DE4B56]">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs font-bold">
                      +977
                    </span>
                    <input
                      type="tel"
                      value={customer.phone}
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                      placeholder="98XXXXXXXX"
                      className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs rounded-xl pl-14 pr-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#102A45] focus:bg-white"
                    />
                  </div>
                  {formErrors.phone && (
                    <p className="text-[10px] text-rose-500 mt-1">{formErrors.phone}</p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Email Address <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    placeholder="name@example.com"
                    className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#102A45] focus:bg-white"
                  />
                </div>

                {/* Province Selection */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Province <span className="text-[#DE4B56]">*</span>
                  </label>
                  <select
                    value={customer.provinceId}
                    onChange={(e) => setCustomer({ ...customer, provinceId: Number(e.target.value) })}
                    className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#102A45] focus:bg-white"
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
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    District <span className="text-[#DE4B56]">*</span>
                  </label>
                  <select
                    value={customer.district}
                    onChange={(e) => setCustomer({ ...customer, district: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#102A45] focus:bg-white"
                  >
                    {currentProvince.districts.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Street Address / Landmark */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Street Address / Landmark <span className="text-[#DE4B56]">*</span>
                  </label>
                  <input
                    type="text"
                    value={customer.streetAddress}
                    onChange={(e) => setCustomer({ ...customer, streetAddress: e.target.value })}
                    placeholder="e.g. New Baneshwor, near Nabil Bank"
                    className="w-full bg-stone-50 border border-stone-300 text-stone-900 text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#102A45] focus:bg-white"
                  />
                  {formErrors.streetAddress && (
                    <p className="text-[10px] text-rose-500 mt-1">{formErrors.streetAddress}</p>
                  )}
                </div>
              </div>

              {/* Order Summary Snapshot */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 flex items-center justify-between text-xs mt-2">
                <div>
                  <span className="text-stone-500">Total Payable: </span>
                  <span className="text-[#102A45] font-extrabold text-base ml-1">
                    {formatNPR(grandTotal)}
                  </span>
                  <span className="text-stone-400 text-[11px] ml-1">({items.length} items)</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (validateDetails()) {
                      setStep('payment_method');
                    }
                  }}
                  className="px-5 py-2.5 bg-[#102A45] hover:bg-[#162B4D] text-white font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer text-xs"
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
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    selectedPaymentMethod === 'fonepay_qr'
                      ? 'border-[#102A45] bg-stone-50'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 text-[#102A45] flex items-center justify-center font-bold text-sm">
                      <QrCode className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-stone-900">
                        Fonepay QR Payment
                      </span>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Pay with any Nepali mobile banking app or digital wallet via QR scan.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      selectedPaymentMethod === 'fonepay_qr'
                        ? 'border-[#102A45] bg-[#102A45] text-white'
                        : 'border-stone-300'
                    }`}
                  >
                    {selectedPaymentMethod === 'fonepay_qr' && <Check className="w-3 h-3" />}
                  </div>
                </div>

                {/* 2. Cash on Delivery (COD) */}
                <div
                  onClick={() => setSelectedPaymentMethod('cod')}
                  className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                    selectedPaymentMethod === 'cod'
                      ? 'border-[#102A45] bg-stone-50'
                      : 'border-stone-200 bg-white hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 border border-stone-200 text-stone-700 flex items-center justify-center font-bold text-sm">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-xs sm:text-sm text-stone-900">
                        Cash on Delivery (COD)
                      </span>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Pay cash to the delivery rider when your package arrives at your doorstep.
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      selectedPaymentMethod === 'cod'
                        ? 'border-[#102A45] bg-[#102A45] text-white'
                        : 'border-stone-300'
                    }`}
                  >
                    {selectedPaymentMethod === 'cod' && <Check className="w-3 h-3" />}
                  </div>
                </div>
              </div>

              {/* Order Amount Summary */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
                <span className="text-stone-600">Grand Total Payable:</span>
                <span className="font-black text-sm text-[#102A45]">{formatNPR(grandTotal)}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="px-3 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Address</span>
                </button>

                <button
                  type="button"
                  onClick={handleProceedToPayment}
                  className="px-6 py-2.5 bg-[#102A45] hover:bg-[#162B4D] text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-2 cursor-pointer"
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
                <div className="md:col-span-6 bg-stone-50 p-5 rounded-2xl border border-stone-200 text-stone-900 text-center space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="font-bold text-xs text-stone-800">
                      Fonepay Dynamic QR
                    </span>
                    <span className="text-xs text-[#102A45] font-black">
                      {formatNPR(grandTotal)}
                    </span>
                  </div>

                  {/* QR Image */}
                  <div className="relative mx-auto w-48 h-48 bg-white rounded-xl p-2 border border-stone-200 flex items-center justify-center shadow-xs">
                    <img
                      src={qrData.qrDataUrl}
                      alt="Fonepay Dynamic QR"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Countdown Timer */}
                  <div className="flex items-center justify-center gap-1.5 text-xs text-stone-600">
                    <Clock className="w-3.5 h-3.5 text-stone-500" />
                    <span>Valid for: </span>
                    <span className="font-mono font-bold text-stone-900">
                      {formatTimer(timeLeft)}
                    </span>
                  </div>

                  {/* PRN Reference */}
                  <div className="flex items-center justify-between text-[11px] bg-white border border-stone-200 px-3 py-1.5 rounded-lg">
                    <span className="text-stone-500 font-mono text-[10px]">PRN: {qrData.prn}</span>
                    <button
                      onClick={handleCopyPRN}
                      className="text-stone-700 hover:text-stone-900 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      {copiedPRN ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedPRN ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>

                {/* Instructions & Simulation */}
                <div className="md:col-span-6 space-y-3.5">
                  <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl space-y-2 text-xs">
                    <h3 className="font-bold text-stone-900 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-stone-700" />
                      <span>How to pay:</span>
                    </h3>
                    <ol className="list-decimal list-inside text-stone-600 space-y-1 text-[11px] leading-relaxed">
                      <li>Open any Nepal mobile banking app (Nabil, NIC Asia, Global IME, etc.).</li>
                      <li>Tap the <strong>QR Scan</strong> icon.</li>
                      <li>Scan the QR code shown on screen.</li>
                      <li>Verify amount <strong>{formatNPR(grandTotal)}</strong> and confirm.</li>
                    </ol>
                  </div>

                  {/* Quick Demo Simulator */}
                  <div className="bg-stone-50 border border-stone-200 p-3.5 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-stone-700">
                        Demo: Simulate App Payment
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleSimulateBankScan('Nabil SmartBank')}
                        disabled={isSimulatingBankApp}
                        className="p-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-left text-xs text-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>🏛️</span>
                        <span className="font-medium truncate text-[11px]">Nabil Bank</span>
                      </button>

                      <button
                        onClick={() => handleSimulateBankScan('NIC Asia MoBank')}
                        disabled={isSimulatingBankApp}
                        className="p-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-left text-xs text-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>🏦</span>
                        <span className="font-medium truncate text-[11px]">NIC Asia</span>
                      </button>

                      <button
                        onClick={() => handleSimulateBankScan('Global Smart Plus')}
                        disabled={isSimulatingBankApp}
                        className="p-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-left text-xs text-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>💳</span>
                        <span className="font-medium truncate text-[11px]">Global IME</span>
                      </button>

                      <button
                        onClick={() => handleSimulateBankScan('eSewa Wallet')}
                        disabled={isSimulatingBankApp}
                        className="p-2 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg text-left text-xs text-stone-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>🟢</span>
                        <span className="font-medium truncate text-[11px]">eSewa QR</span>
                      </button>
                    </div>

                    {isSimulatingBankApp && (
                      <div className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-200">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying transaction...</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                    <button
                      onClick={() => setStep('payment_method')}
                      className="hover:text-stone-900 underline cursor-pointer"
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

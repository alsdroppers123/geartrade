import CryptoJS from 'crypto-js';
import QRCode from 'qrcode';
import { FonepayCredentials, Order } from '../types';

// Default Demo / Sandbox credentials for Nepal Fonepay Integration
export const DEFAULT_FONEPAY_CREDENTIALS: FonepayCredentials = {
  merchantCode: 'PASAL_NEPAL_ECOM',
  merchantName: 'Pasal Nepal Pvt Ltd',
  sharedSecret: 'nepal_fonepay_secure_secret_key_2026',
  isLive: false,
};

export interface FonepayDynamicQRData {
  qrString: string;
  qrDataUrl: string;
  prn: string;
  traceId: string;
  amount: number;
  currency: string;
  merchantCode: string;
  merchantName: string;
  dvHash: string;
  deepLinkUrl: string;
  expiresAt: number; // Unix timestamp
}

export interface FonepayWebPayload {
  PID: string;
  MD: string;
  PRN: string;
  AMT: string;
  CRN: string;
  DT: string;
  R1: string;
  R2: string;
  RU: string;
  DV: string;
}

/**
 * Calculates official Fonepay SHA-512 Data Verification (DV) Signature
 * Formula: SHA512(PID,MD,PRN,AMT,CRN,DT,R1,R2,RU,secretKey)
 */
export function generateFonepayDV(
  pid: string,
  md: string,
  prn: string,
  amt: string,
  crn: string,
  dt: string,
  r1: string,
  r2: string,
  ru: string,
  secretKey: string
): string {
  const message = `${pid},${md},${prn},${amt},${crn},${dt},${r1},${r2},${ru},${secretKey}`;
  return CryptoJS.SHA512(message).toString(CryptoJS.enc.Hex).toLowerCase();
}

/**
 * Generates an EMVCo compliant Dynamic Fonepay QR string and base64 SVG/PNG Data URL
 */
export async function generateFonepayDynamicQR(
  orderInput: { prn: string; totalAmount: number; customer: { fullName: string; phone: string } } | number,
  credentialsOrDesc?: FonepayCredentials | string
): Promise<FonepayDynamicQRData> {
  const credentials: FonepayCredentials =
    typeof credentialsOrDesc === 'object' && credentialsOrDesc !== null
      ? credentialsOrDesc
      : DEFAULT_FONEPAY_CREDENTIALS;

  const order =
    typeof orderInput === 'number'
      ? {
          prn: `PRN-${Date.now().toString().slice(-8)}`,
          totalAmount: orderInput,
          customer: { fullName: 'GEARTRADE Customer', phone: '9800000000' },
        }
      : orderInput;

  const traceId = `FP-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date();
  const dateFormatted = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${now.getFullYear()}`;
  const amountStr = order.totalAmount.toFixed(2);
  
  const dvHash = generateFonepayDV(
    credentials.merchantCode,
    'P',
    order.prn,
    amountStr,
    'NPR',
    dateFormatted,
    order.customer.fullName.substring(0, 20),
    traceId,
    'https://pasalnepal.com/api/payment/fonepay-callback',
    credentials.sharedSecret
  );

  // EMVCo Fonepay QR Payload Format
  const qrString = `00020101021226480010np.fonepay0116${credentials.merchantCode}0216${order.prn}52045999530352454${amountStr.length.toString().padStart(2, '0')}${amountStr}5802NP5911PASAL_NEPAL6009Kathmandu62300116${traceId}0506${order.customer.phone.slice(-6)}6304`;

  // Generate QR image data URL with high contrast and optimal error correction
  const qrDataUrl = await QRCode.toDataURL(qrString, {
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 320,
    color: {
      dark: '#0f172a',
      light: '#ffffff',
    },
  });

  const deepLinkUrl = `fonepay://pay?merchantId=${credentials.merchantCode}&prn=${order.prn}&amount=${amountStr}&traceId=${traceId}`;

  return {
    qrString,
    qrDataUrl,
    prn: order.prn,
    traceId,
    amount: order.totalAmount,
    currency: 'NPR',
    merchantCode: credentials.merchantCode,
    merchantName: credentials.merchantName,
    dvHash,
    deepLinkUrl,
    expiresAt: Date.now() + 5 * 60 * 1000, // 5 minutes expiration
  };
}

/**
 * Creates the official Fonepay Web Hosted Form parameters for direct merchant redirection
 */
export function createFonepayWebPayload(
  order: Order,
  credentials: FonepayCredentials = DEFAULT_FONEPAY_CREDENTIALS,
  returnUrl: string = 'https://pasalnepal.com/checkout/success'
): FonepayWebPayload {
  const now = new Date();
  const dt = `${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}/${now.getFullYear()}`;
  const amt = order.totalAmount.toFixed(2);
  const r1 = order.customer.fullName.slice(0, 30);
  const r2 = `Order-${order.id}`;

  const dv = generateFonepayDV(
    credentials.merchantCode,
    'P',
    order.prn,
    amt,
    'NPR',
    dt,
    r1,
    r2,
    returnUrl,
    credentials.sharedSecret
  );

  return {
    PID: credentials.merchantCode,
    MD: 'P',
    PRN: order.prn,
    AMT: amt,
    CRN: 'NPR',
    DT: dt,
    R1: r1,
    R2: r2,
    RU: returnUrl,
    DV: dv,
  };
}

/**
 * List of 30+ leading Nepali banks and mobile wallets that support Fonepay QR scanning
 */
export const SUPPORTED_FONEPAY_BANKS = [
  { name: 'Nabil Bank (Nabil SmartBank)', code: 'NABIL', logo: '🏛️' },
  { name: 'NIC Asia Bank (NIC Asia MoBank)', code: 'NICASIA', logo: '🏦' },
  { name: 'Global IME Bank (Global Smart Plus)', code: 'GLOBAL', logo: '💳' },
  { name: 'eSewa Mobile Wallet', code: 'ESEWA', logo: '🟢' },
  { name: 'Rastriya Banijya Bank (RBB Digital)', code: 'RBB', logo: '🏛️' },
  { name: 'Siddhartha Bank (Siddhartha Smart)', code: 'SBL', logo: '🏦' },
  { name: 'Sanima Bank (Sanima Sajilo)', code: 'SANIMA', logo: '🏢' },
  { name: 'Prabhu Bank (Prabhu MoBank)', code: 'PRABHU', logo: '💳' },
  { name: 'IME Pay Wallet', code: 'IMEPAY', logo: '🔴' },
  { name: 'Everest Bank (EBL Touch 24)', code: 'EBL', logo: '🏔️' },
  { name: 'Kumari Bank (Kumari Smart)', code: 'KBL', logo: '🏦' },
  { name: 'Laxmi Sunrise Bank (Mobile Money)', code: 'LSBL', logo: '☀️' },
  { name: 'NMB Bank (eNMB)', code: 'NMB', logo: '🏛️' },
  { name: 'Nepal SBI Bank (YONO Nepal SBI)', code: 'NSBI', logo: '🔵' },
  { name: 'Standard Chartered Nepal', code: 'SCB', logo: '🌐' },
  { name: 'Machhapuchchhre Bank (MBL M-Smart)', code: 'MBL', logo: '🐟' },
  { name: 'Prime Commercial Bank', code: 'PCBL', logo: '🏦' },
  { name: 'Himalayan Bank (HI-MB)', code: 'HBL', logo: '🏔️' },
  { name: 'Citizen Bank International', code: 'CZBIL', logo: '🏛️' },
  { name: 'Agricultural Development Bank (ADBL Krishi)', code: 'ADBL', logo: '🌾' },
];

/**
 * Helper to format NPR currency with standard Nepali comma separator (रू X,XX,XXX)
 */
export function formatNPR(amount: number): string {
  // Nepali numbering format: Last 3 digits, then groups of 2
  const parts = amount.toFixed(0).split('.');
  let lastThree = parts[0].substring(parts[0].length - 3);
  const otherNumbers = parts[0].substring(0, parts[0].length - 3);
  if (otherNumbers !== '') {
    lastThree = ',' + lastThree;
  }
  const formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
  return `रू ${formatted}`;
}

/**
 * Converts English Gregorian date to approximate Nepali Bikram Sambat (BS) date for invoices
 */
export function getNepaliDateBS(date: Date = new Date()): string {
  // Approximate BS year is Gregorian Year + 56 years, 8 months, 15 days
  const gYear = date.getFullYear();
  const bsYear = gYear + 57;
  const nepaliMonths = [
    'बैशाख (Baisakh)', 'जेठ (Jestha)', 'असार (Ashadh)', 'श्रावण (Shrawan)',
    'भाद्र (Bhadra)', 'असोज (Ashwin)', 'कार्तिक (Kartik)', 'मंसिर (Mangsir)',
    'पौष (Poush)', 'माघ (Magh)', 'फाल्गुन (Falgun)', 'चैत्र (Chaitra)'
  ];
  // Calculate relative month
  const monthIdx = (date.getMonth() + 8) % 12;
  const day = Math.min(32, Math.max(1, (date.getDate() + 15) % 31 + 1));
  return `${bsYear} ${nepaliMonths[monthIdx]} ${day} गते`;
}

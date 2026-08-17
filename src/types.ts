export type ProductCategory = 'mens' | 'womens' | 'kids' | 'bags_gears' | 'shoes' | 'all' | 'accessories';

export interface ProductColor {
  name: string;
  hex: string;
  image?: string;
}

export type ProductSection = 'hero_showcase' | 'trending_now' | 'flash_sale' | 'regular_catalog' | 'hidden';

export interface Product {
  id: string;
  name: string;
  nepaliName: string;
  styleCode: string;
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  subcategory?: string;
  collection?: string;
  origin: string;
  originNepali: string;
  inStock: boolean;
  stockCount: number;
  rating: number;
  reviewCount: number;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  description: string;
  descriptionNepali: string;
  craftStory: string;
  features: string[];
  specifications: Record<string, string>;
  weight: string;
  tags: string[];
  badge?: string;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  isTrending?: boolean;
  // Admin Placement & Merchandising Controls
  displaySection?: ProductSection;
  displayPriority?: number; // lower number = displayed first
  featuredOnHome?: boolean;
  customRibbonText?: string;
  costPrice?: number; // for merchant profit margin calculation
  supplier?: string;
}

export interface HeroSlideItem {
  id: string | number;
  titleTop: string;
  titleMain: string;
  collection: string;
  description: string;
  image: string;
  ctaText: string;
  targetCategory: ProductCategory;
}

export interface CategoryTileItem {
  id: ProductCategory;
  title: string;
  subtitle: string;
  image: string;
  itemCount?: string;
  badge?: string;
}

export interface StorefrontPromoBanner {
  id: string;
  title: string;
  subtitle: string;
  tagline: string;
  image: string;
  buttonText: string;
  targetCategory?: ProductCategory;
  isActive: boolean;
}

export interface Coupon {
  code: string;
  discountType: 'percentage' | 'flat';
  discountValue: number;
  minSpend?: number;
  maxDiscount?: number;
  description: string;
  isActive: boolean;
  usageCount: number;
}

export interface StoreAnnouncement {
  id: string;
  text: string;
  linkText?: string;
  linkUrl?: string;
  isActive: boolean;
  backgroundColor?: string;
}

export interface StoreSettings {
  storeName: string;
  phone: string;
  email: string;
  address: string;
  vatNumber: string;
  freeShippingThreshold: number;
  standardVatRate: number; // e.g. 0.13
  currencySymbol: string;
  allowCOD: boolean;
  allowFonepay: boolean;
  announcementText: string;
  isMaintenanceMode: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  selectedVariant?: string;
}

export interface CustomerDetails {
  fullName: string;
  phone: string;
  email: string;
  provinceId: number;
  provinceName: string;
  district: string;
  municipality: string;
  wardNumber: string;
  streetAddress: string;
  deliveryNotes?: string;
}

export type PaymentMethodType = 'fonepay_qr' | 'fonepay_web' | 'esewa' | 'khalti' | 'connect_ips' | 'cod';

export interface Order {
  id: string;
  prn?: string; // Payment Reference Number
  trackingCode?: string;
  date?: string;
  createdAt?: string;
  nepaliDate?: string;
  nepaliDateBS?: string;
  customer?: CustomerDetails;
  customerDetails?: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  deliveryCharge: number;
  taxAmount?: number; // 13% VAT standard in Nepal
  vatAmount?: number;
  totalAmount?: number;
  grandTotal?: number;
  paymentMethod: PaymentMethodType;
  paymentStatus: 'pending' | 'verified' | 'failed' | 'cod_pending' | 'completed';
  orderStatus: 'confirmed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'order_placed' | 'dispatched';
  fonepayTraceId?: string;
  fonepayTransactionId?: string;
  fonepayBankName?: string;
  merchantPan?: string;
  estimatedDeliveryDays?: string;
  courierPartner?: string;
  awbNumber?: string;
  riderName?: string;
  riderPhone?: string;
  logisticsNotes?: string;
  trackingUpdates?: Array<{
    id: string;
    status: string;
    timestamp: string;
    location: string;
    description: string;
    completed: boolean;
  }>;
}

export interface Province {
  id: number;
  name: string;
  nepaliName: string;
  districts: string[];
  deliveryFee: number;
  estimatedDays: string;
}

export interface FonepayCredentials {
  merchantCode: string;
  merchantName: string;
  sharedSecret: string;
  isLive: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  role: 'admin' | 'customer';
  isAdmin: boolean;
  loginProvider: 'google' | 'guest';
  lastLoginAt: string;
}

export interface AdminWhitelistEntry {
  email: string;
  addedBy?: string;
  addedAt: string;
  note?: string;
  isMaster?: boolean;
}


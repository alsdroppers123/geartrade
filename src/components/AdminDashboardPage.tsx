import React, { useState } from 'react';
import {
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Sliders,
  Layers,
  Sparkles,
  Ticket,
  Truck,
  Settings,
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Save,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Download,
  Upload,
  BarChart3,
  Users,
  ShieldCheck,
  Store,
  HelpCircle,
  ExternalLink,
  Flame,
  Star,
  RefreshCw,
  Clock,
  MapPin,
  FileSpreadsheet,
  Image as ImageIcon,
  Camera,
  Key,
  UserPlus,
  UserCheck,
  ShieldAlert,
  LogOut,
  Mail,
  ChevronRight,
  Printer,
  FileText,
  CheckSquare,
  Square,
  Navigation,
  Copy,
} from 'lucide-react';
import {
  Product,
  ProductCategory,
  ProductColor,
  ProductSection,
  Order,
  Coupon,
  StoreSettings,
  AuthUser,
  AdminWhitelistEntry,
  HeroSlideItem,
  CategoryTileItem
} from '../types';
import { formatNPR } from '../services/fonepayService';
import { INITIAL_PRODUCTS } from '../data/products';
import { NEPAL_PROVINCES } from '../data/nepalLocations';
import {
  getAdminWhitelist,
  addAdminEmail,
  removeAdminEmail,
  getGoogleClientId,
  saveGoogleClientId,
} from '../services/authService';
import { AdminAccessGate } from './AdminAccessGate';
import { GeartradeLogo } from './GeartradeLogo';
import { DeleteConfirmModal } from './admin/DeleteConfirmModal';
import { CourierDispatchModal } from './admin/CourierDispatchModal';
import { DispatchSlipModal } from './admin/DispatchSlipModal';
import { AdminMediaStudio } from './AdminMediaStudio';
import { ImageUploadInput } from './ImageUploadInput';

interface AdminDashboardPageProps {
  products: Product[];
  orders: Order[];
  onSaveProduct: (product: Product) => void;
  onCreateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onResetDefaults: () => void;
  onUpdateOrderStatus: (orderId: string, status: Order['orderStatus'], paymentStatus?: Order['paymentStatus']) => void;
  onUpdateFullOrder?: (updatedOrder: Order) => void;
  onBackToStore: () => void;
  editingProductId?: string | null;
  currentUser?: AuthUser | null;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
  heroSlides?: HeroSlideItem[];
  onUpdateHeroSlides?: (slides: HeroSlideItem[]) => void;
  categoryCards?: CategoryTileItem[];
  onUpdateCategoryCards?: (cards: CategoryTileItem[]) => void;
  initialTab?: 'merchandising' | 'products' | 'visuals' | 'editor' | 'orders' | 'coupons' | 'shipping' | 'settings' | 'admins';
}

const CATEGORY_OPTIONS: { id: ProductCategory; label: string }[] = [
  { id: 'mens', label: "MEN'S APPAREL" },
  { id: 'womens', label: "WOMEN'S APPAREL" },
  { id: 'kids', label: "KIDS' COLLECTION" },
  { id: 'bags_gears', label: "BAGS & TECHNICAL GEARS" },
  { id: 'shoes', label: "FOOTWEAR & TRAIL SHOES" },
  { id: 'accessories', label: "ACCESSORIES & TOOLS" },
];

const SECTION_OPTIONS: { id: ProductSection; label: string; desc: string }[] = [
  { id: 'hero_showcase', label: 'Top Hero / Spotlight Showcase', desc: 'Pinned to the top carousel & primary attention area' },
  { id: 'trending_now', label: 'Featured Trending / High Demand', desc: 'Appears in priority High-Altitude & Trending section' },
  { id: 'flash_sale', label: 'Special Clearance / Deal of the Day', desc: 'Featured with hot discount highlight' },
  { id: 'regular_catalog', label: 'Main Category Grid', desc: 'Standard placement in category filters and search' },
  { id: 'hidden', label: 'Draft / Hidden (Archived)', desc: 'Hidden from customer storefront, visible only to admin' },
];

const PRESET_SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1519457431-44ccd64a579b?auto=format&fit=crop&w=800&q=80',
];

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  products,
  orders,
  onSaveProduct,
  onCreateProduct,
  onDeleteProduct,
  onResetDefaults,
  onUpdateOrderStatus,
  onUpdateFullOrder,
  onBackToStore,
  editingProductId,
  currentUser = null,
  onOpenLoginModal = () => {},
  onLogout = () => {},
  heroSlides = [],
  onUpdateHeroSlides = () => {},
  categoryCards = [],
  onUpdateCategoryCards = () => {},
  initialTab,
}) => {
  // Navigation tabs for full admin suite
  const [activeAdminTab, setActiveAdminTab] = useState<
    'merchandising' | 'products' | 'visuals' | 'editor' | 'orders' | 'coupons' | 'shipping' | 'settings' | 'admins'
  >(initialTab || (editingProductId ? 'editor' : 'merchandising'));

  // Admin Access Whitelist State
  const [adminWhitelist, setAdminWhitelist] = useState<AdminWhitelistEntry[]>(() => getAdminWhitelist());
  const [newAdminEmailInput, setNewAdminEmailInput] = useState('');
  const [newAdminNoteInput, setNewAdminNoteInput] = useState('');
  const [adminEmailToRevoke, setAdminEmailToRevoke] = useState<string | null>(null);
  const [adminClientIdInput, setAdminClientIdInput] = useState(() => getGoogleClientId());
  const [copiedOriginInAdmin, setCopiedOriginInAdmin] = useState(false);

  // Product & Merchandising State
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Selection state for bulk operations
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Deletion confirmation state (In-App Dialog, no window.confirm)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isResetDefaultsModalOpen, setIsResetDefaultsModalOpen] = useState(false);

  // Logistics & Waybill Modals
  const [selectedOrderForCourier, setSelectedOrderForCourier] = useState<Order | null>(null);
  const [orderToPrint, setOrderToPrint] = useState<Order | null>(null);

  // Logistics Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [provinceFilter, setProvinceFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');

  // Form Editor State
  const [formProduct, setFormProduct] = useState<Product | null>(() => {
    if (editingProductId) {
      return products.find((p) => p.id === editingProductId) || null;
    }
    return null;
  });
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // Form helper fields
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#111111');
  const [newSize, setNewSize] = useState('');

  // Coupons Manager State
  const [coupons, setCoupons] = useState<Coupon[]>(() => {
    try {
      const saved = localStorage.getItem('geartrade_coupons');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { code: 'DASHAIN500', discountType: 'flat', discountValue: 500, minSpend: 4000, description: 'Festival Discount', isActive: true, usageCount: 42 },
      { code: 'HIMALAYA10', discountType: 'percentage', discountValue: 10, minSpend: 3000, maxDiscount: 1500, description: '10% Off Expedition Gear', isActive: true, usageCount: 19 },
      { code: 'TREKNEPAL', discountType: 'flat', discountValue: 1000, minSpend: 8000, description: 'Trekker Special Over Rs 8k', isActive: true, usageCount: 8 },
      { code: 'FREESHIP', discountType: 'flat', discountValue: 150, minSpend: 2500, description: 'Free Express Shipping', isActive: true, usageCount: 65 },
    ];
  });

  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<'flat' | 'percentage'>('flat');
  const [newCouponValue, setNewCouponValue] = useState<number>(300);
  const [newCouponMin, setNewCouponMin] = useState<number>(2500);
  const [newCouponDesc, setNewCouponDesc] = useState('');

  // Store Settings State
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('geartrade_store_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      storeName: 'GEARTRADE NEPAL Outdoor Gear & Apparel',
      phone: '+977-1-4428901 / 9801234567',
      email: 'logistics@geartrade.com.np',
      address: 'Tridevi Marg, Thamel, Kathmandu, Nepal',
      vatNumber: '601298451',
      freeShippingThreshold: 5000,
      standardVatRate: 0.13,
      currencySymbol: 'Rs.',
      allowCOD: true,
      allowFonepay: true,
      announcementText: 'NATIONWIDE EXPEDITION DELIVERY ACROSS ALL 7 PROVINCES | 100% GENUINE HIMALAYAN GEAR',
      isMaintenanceMode: false,
    };
  });

  // Save changes feedback toast
  const [notification, setNotification] = useState<string | null>(null);
  const showAdminToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Add new admin to whitelist
  const handleAddNewAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmailInput.trim()) return;
    const res = addAdminEmail(
      newAdminEmailInput.trim(),
      currentUser?.email || 'Master Admin',
      newAdminNoteInput.trim() || 'Store Operator'
    );
    if (res.success) {
      setAdminWhitelist(res.list);
      setNewAdminEmailInput('');
      setNewAdminNoteInput('');
      showAdminToast(res.message);
    } else {
      showAdminToast(res.message);
    }
  };

  // Remove admin from whitelist
  const handleConfirmRevokeAdmin = () => {
    if (!adminEmailToRevoke) return;
    const res = removeAdminEmail(adminEmailToRevoke);
    if (res.success) {
      setAdminWhitelist(res.list);
      showAdminToast(res.message);
    } else {
      showAdminToast(res.message);
    }
    setAdminEmailToRevoke(null);
  };

  // Admin Access Security Gate
  if (!currentUser || !currentUser.isAdmin) {
    return (
      <AdminAccessGate
        currentUser={currentUser}
        onOpenGoogleLogin={onOpenLoginModal}
        onReturnToStorefront={onBackToStore}
      />
    );
  }

  // Quick placement change on product
  const handleQuickSectionChange = (productId: string, section: ProductSection) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const updated = { ...prod, displaySection: section };
    onSaveProduct(updated);
    showAdminToast(`Updated placement for "${prod.name}"`);
  };

  // Display priority adjust
  const handlePriorityChange = (productId: string, delta: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const current = prod.displayPriority ?? 50;
    const updated = { ...prod, displayPriority: Math.max(1, current + delta) };
    onSaveProduct(updated);
    showAdminToast(`Updated priority for "${prod.name}"`);
  };

  // Toggle in stock
  const handleToggleStock = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const updated = {
      ...prod,
      inStock: !prod.inStock,
      stockCount: !prod.inStock && prod.stockCount === 0 ? 10 : prod.stockCount,
    };
    onSaveProduct(updated);
    showAdminToast(`Stock status toggled for "${prod.name}"`);
  };

  // Toggle home featured
  const handleToggleHomeFeatured = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const current = prod.featuredOnHome !== false;
    const updated = { ...prod, featuredOnHome: !current };
    onSaveProduct(updated);
    showAdminToast(`Home visibility updated for "${prod.name}"`);
  };

  // Start creating new product
  const handleStartCreate = () => {
    const defaultNewProduct: Product = {
      id: `prod-${Date.now()}`,
      name: '',
      nepaliName: 'नयाँ प्राविधिक गियर',
      category: 'mens',
      price: 2500,
      originalPrice: 3500,
      description: 'Technical mountain gear designed for harsh Himalayan conditions.',
      descriptionNepali: 'कठिन हिमाली मौसमको लागि विशेष रूपमा तयार गरिएको प्राविधिक पोशाक।',
      craftStory: 'Precision engineered in Kathmandu with triple-reinforced stitching for endurance.',
      features: ['Water-resistant exterior', 'YKK Zippers', 'Reinforced stitching'],
      specifications: { Material: 'Ripstop Cordura / Nylon', Weight: '480g', Origin: 'Kathmandu, Nepal' },
      weight: '480g',
      tags: ['Expedition', 'Trekking', 'Waterproof'],
      images: [PRESET_SAMPLE_IMAGES[0]],
      inStock: true,
      stockCount: 20,
      rating: 4.9,
      reviewCount: 1,
      styleCode: `GT-NP-${Math.floor(100 + Math.random() * 900)}`,
      origin: 'Kathmandu, Nepal',
      originNepali: 'काठमाडौँ, नेपाल',
      colors: [{ name: 'Stealth Black', hex: '#1A1A1A' }, { name: 'Alpine Slate', hex: '#4A5568' }],
      sizes: ['S', 'M', 'L', 'XL'],
      isTrending: true,
      displaySection: 'regular_catalog',
      displayPriority: 50,
      featuredOnHome: true,
    };
    setFormProduct(defaultNewProduct);
    setIsCreatingNew(true);
    setActiveAdminTab('editor');
  };

  // Start editing product
  const handleStartEdit = (product: Product) => {
    setFormProduct({ ...product });
    setIsCreatingNew(false);
    setActiveAdminTab('editor');
  };

  // Delete product action (invoked from modal)
  const handleConfirmDeleteProduct = () => {
    if (!productToDelete) return;
    onDeleteProduct(productToDelete.id);
    showAdminToast(`Deleted "${productToDelete.name}" from catalog`);
    if (formProduct && formProduct.id === productToDelete.id) {
      setFormProduct(null);
      setActiveAdminTab('merchandising');
    }
    setProductToDelete(null);
  };

  // Bulk operations
  const handleToggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = (filteredList: Product[]) => {
    if (selectedProductIds.length === filteredList.length && filteredList.length > 0) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredList.map((p) => p.id));
    }
  };

  const handleConfirmBulkDelete = () => {
    selectedProductIds.forEach((id) => onDeleteProduct(id));
    showAdminToast(`Deleted ${selectedProductIds.length} products`);
    setSelectedProductIds([]);
    setIsBulkDeleteOpen(false);
  };

  const handleBulkSetSection = (section: ProductSection) => {
    selectedProductIds.forEach((id) => {
      const prod = products.find((p) => p.id === id);
      if (prod) onSaveProduct({ ...prod, displaySection: section });
    });
    showAdminToast(`Updated section for ${selectedProductIds.length} items`);
    setSelectedProductIds([]);
  };

  const handleBulkAddStock = (amount: number) => {
    selectedProductIds.forEach((id) => {
      const prod = products.find((p) => p.id === id);
      if (prod) {
        onSaveProduct({
          ...prod,
          stockCount: Math.max(0, prod.stockCount + amount),
          inStock: prod.stockCount + amount > 0,
        });
      }
    });
    showAdminToast(`Updated stock for ${selectedProductIds.length} items`);
    setSelectedProductIds([]);
  };

  // Save product form
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProduct) return;
    if (!formProduct.name.trim()) {
      showAdminToast('Please provide a product title');
      return;
    }

    if (isCreatingNew) {
      onCreateProduct(formProduct);
      showAdminToast(`Created new product "${formProduct.name}"`);
    } else {
      onSaveProduct(formProduct);
      showAdminToast(`Saved changes to "${formProduct.name}"`);
    }
    setActiveAdminTab('merchandising');
  };

  // Save logistics update from CourierDispatchModal
  const handleSaveLogisticsFromModal = (updatedOrder: Order) => {
    if (onUpdateFullOrder) {
      onUpdateFullOrder(updatedOrder);
    } else {
      onUpdateOrderStatus(updatedOrder.id, updatedOrder.orderStatus, updatedOrder.paymentStatus);
    }
    showAdminToast(`Logistics & tracking updated for Order #${updatedOrder.id}`);
  };

  // Export CSV Manifest for Logistics Handover
  const handleExportManifestCSV = () => {
    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Phone',
      'Province',
      'District',
      'Street Address',
      'Items Manifest',
      'Payment Method',
      'Payment Status',
      'Fulfillment Status',
      'Grand Total NPR',
      'Courier Partner',
      'AWB Waybill',
    ];

    const rows = filteredOrders.map((o) => [
      o.id,
      o.date || '',
      `"${(o.customer?.fullName || '').replace(/"/g, '""')}"`,
      o.customer?.phone || '',
      `"${o.customer?.provinceName || ''}"`,
      `"${o.customer?.district || ''}"`,
      `"${(o.customer?.streetAddress || '').replace(/"/g, '""')}"`,
      `"${o.items.map((it) => `${it.quantity}x ${it.product.name} (${it.selectedSize || 'Std'})`).join('; ').replace(/"/g, '""')}"`,
      o.paymentMethod,
      o.paymentStatus,
      o.orderStatus,
      o.totalAmount || o.grandTotal || 0,
      `"${o.courierPartner || 'Unassigned'}"`,
      `"${o.awbNumber || o.trackingCode || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `GEARTRADE_Logistics_Manifest_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showAdminToast('Logistics courier manifest exported successfully');
  };

  // Coupons management
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const formattedCode = newCouponCode.trim().toUpperCase().replace(/\s+/g, '');
    const newCoupon: Coupon = {
      code: formattedCode,
      discountType: newCouponType,
      discountValue: newCouponValue,
      minSpend: newCouponMin,
      description: newCouponDesc.trim() || 'Admin Promotion',
      isActive: true,
      usageCount: 0,
    };
    const updated = [newCoupon, ...coupons.filter((c) => c.code !== formattedCode)];
    setCoupons(updated);
    localStorage.setItem('geartrade_coupons', JSON.stringify(updated));
    setNewCouponCode('');
    setNewCouponDesc('');
    showAdminToast(`Coupon "${formattedCode}" published!`);
  };

  const handleToggleCoupon = (code: string) => {
    const updated = coupons.map((c) => (c.code === code ? { ...c, isActive: !c.isActive } : c));
    setCoupons(updated);
    localStorage.setItem('geartrade_coupons', JSON.stringify(updated));
  };

  const handleDeleteCoupon = (code: string) => {
    const updated = coupons.filter((c) => c.code !== code);
    setCoupons(updated);
    localStorage.setItem('geartrade_coupons', JSON.stringify(updated));
    showAdminToast(`Coupon "${code}" deleted`);
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchFilter === '' ||
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.styleCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.description.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

    let matchesSection = true;
    if (sectionFilter !== 'all') {
      if (sectionFilter === 'hero_showcase') matchesSection = p.displaySection === 'hero_showcase';
      else if (sectionFilter === 'trending_now')
        matchesSection = p.displaySection === 'trending_now' || (p.isTrending && !p.displaySection);
      else if (sectionFilter === 'flash_sale') matchesSection = p.displaySection === 'flash_sale';
      else if (sectionFilter === 'featured_home') matchesSection = p.featuredOnHome !== false;
      else if (sectionFilter === 'hidden') matchesSection = p.displaySection === 'hidden';
    }

    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = p.stockCount > 0 && p.stockCount <= 5;
    else if (stockFilter === 'out') matchesStock = !p.inStock || p.stockCount === 0;

    return matchesSearch && matchesCategory && matchesSection && matchesStock;
  });

  // Filter orders with advanced logistics criteria
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    const matchesProvince =
      provinceFilter === 'all' ||
      (o.customer?.provinceName &&
        o.customer.provinceName.toLowerCase().includes(provinceFilter.toLowerCase()));

    let matchesPayment = true;
    if (paymentMethodFilter === 'fonepay') {
      matchesPayment = o.paymentMethod.startsWith('fonepay');
    } else if (paymentMethodFilter === 'cod_pending') {
      matchesPayment = o.paymentMethod === 'cod' && o.paymentStatus !== 'completed' && o.paymentStatus !== 'verified';
    } else if (paymentMethodFilter === 'cod_collected') {
      matchesPayment = o.paymentMethod === 'cod' && (o.paymentStatus === 'completed' || o.paymentStatus === 'verified');
    }

    const q = orderSearchQuery.toLowerCase();
    const matchesSearch =
      q === '' ||
      o.id.toLowerCase().includes(q) ||
      (o.awbNumber && o.awbNumber.toLowerCase().includes(q)) ||
      (o.trackingCode && o.trackingCode.toLowerCase().includes(q)) ||
      (o.customer?.fullName && o.customer.fullName.toLowerCase().includes(q)) ||
      (o.customer?.phone && o.customer.phone.toLowerCase().includes(q)) ||
      (o.customer?.district && o.customer.district.toLowerCase().includes(q)) ||
      (o.customer?.streetAddress && o.customer.streetAddress.toLowerCase().includes(q)) ||
      (o.courierPartner && o.courierPartner.toLowerCase().includes(q));

    return matchesStatus && matchesProvince && matchesPayment && matchesSearch;
  });

  // Overall catalog metrics
  const totalCatalogCount = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stockCount || 0), 0);
  const outOfStockCount = products.filter((p) => !p.inStock || p.stockCount === 0).length;
  const lowStockCount = products.filter((p) => p.inStock && p.stockCount > 0 && p.stockCount <= 5).length;
  const heroShowcaseCount = products.filter((p) => p.displaySection === 'hero_showcase').length;
  const trendingCount = products.filter((p) => p.displaySection === 'trending_now' || p.isTrending).length;
  const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || o.grandTotal || 0), 0);

  // Logistics KPI breakdown
  const pendingPackCount = orders.filter((o) => o.orderStatus === 'confirmed' || o.orderStatus === 'order_placed').length;
  const inTransitCount = orders.filter((o) => o.orderStatus === 'shipped' || o.orderStatus === 'dispatched').length;
  const outForDeliveryCount = orders.filter((o) => o.orderStatus === 'out_for_delivery').length;
  const deliveredCount = orders.filter((o) => o.orderStatus === 'delivered').length;
  const codPendingTotal = orders
    .filter((o) => o.paymentMethod === 'cod' && o.paymentStatus !== 'completed' && o.paymentStatus !== 'verified')
    .reduce((acc, o) => acc + (o.totalAmount || o.grandTotal || 0), 0);

  return (
    <div className="min-h-screen bg-black text-stone-100 flex flex-col font-sans selection:bg-white selection:text-black">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 bg-white text-black font-bold text-xs uppercase tracking-wider shadow-2xl flex items-center gap-2 border border-stone-300 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-black" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Universal Admin Header */}
      <header className="border-b border-stone-800 bg-stone-950 px-4 sm:px-6 py-3 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBackToStore}
              className="flex items-center gap-2 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-800 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>RETURN TO STORE</span>
            </button>

            <div className="h-4 w-px bg-stone-800 hidden sm:block" />

            <div className="flex items-center gap-2.5">
              <GeartradeLogo variant="icon-only" theme="white" size="sm" />
              <div>
                <div className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-stone-400">
                  ADMIN LOGISTICS HUB
                </div>
                <div className="text-xs font-black uppercase tracking-wider text-white">
                  OPERATIONS & INVENTORY
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Operator info */}
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-stone-900 border border-stone-800 text-[11px] font-mono">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-stone-300">{currentUser?.email}</span>
            </div>

            <button
              onClick={() => setIsResetDefaultsModalOpen(true)}
              className="px-3 py-1.5 bg-stone-900 hover:bg-rose-950/40 text-stone-300 hover:text-rose-300 border border-stone-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
              title="Reset catalog to original presets"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">RESET CATALOG</span>
            </button>

            <button
              onClick={onLogout}
              className="p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Body with Sidebar Navigation */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl mx-auto w-full">
        {/* Left Navigation Sidebar */}
        <aside className="w-full md:w-64 bg-stone-950 border-r border-b md:border-b-0 border-stone-800 p-3 sm:p-4 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-y-auto shrink-0">
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 px-3 py-1.5 hidden md:block">
            NAVIGATION
          </div>

          <button
            onClick={() => setActiveAdminTab('merchandising')}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors text-left whitespace-nowrap cursor-pointer ${
              activeAdminTab === 'merchandising'
                ? 'bg-white text-black font-black'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>MERCHANDISING</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('products')}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors text-left whitespace-nowrap cursor-pointer ${
              activeAdminTab === 'products'
                ? 'bg-white text-black font-black'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>INVENTORY & STOCK</span>
            <span
              className={`ml-auto text-[10px] px-1.5 py-0.2 font-mono ${
                activeAdminTab === 'products' ? 'bg-stone-200 text-black' : 'bg-stone-900 text-stone-400'
              }`}
            >
              {totalCatalogCount}
            </span>
          </button>

          <button
            onClick={() => setActiveAdminTab('visuals')}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors text-left whitespace-nowrap cursor-pointer ${
              activeAdminTab === 'visuals'
                ? 'bg-white text-black font-black'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>PHOTOS & LOOKBOOK</span>
            <span
              className={`ml-auto text-[9px] px-1.5 py-0.2 font-bold uppercase ${
                activeAdminTab === 'visuals' ? 'bg-black text-amber-300' : 'bg-amber-950 text-amber-300'
              }`}
            >
              STUDIO
            </span>
          </button>

          <button
            onClick={handleStartCreate}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors text-left whitespace-nowrap cursor-pointer ${
              activeAdminTab === 'editor'
                ? 'bg-white text-black font-black'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{isCreatingNew ? 'CREATE PRODUCT' : 'PRODUCT EDITOR'}</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('orders')}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors text-left whitespace-nowrap cursor-pointer ${
              activeAdminTab === 'orders'
                ? 'bg-white text-black font-black'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>LOGISTICS & ORDERS</span>
            <span
              className={`ml-auto text-[10px] px-1.5 py-0.2 font-mono ${
                activeAdminTab === 'orders' ? 'bg-stone-200 text-black' : 'bg-stone-900 text-stone-400'
              }`}
            >
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveAdminTab('coupons')}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors text-left whitespace-nowrap cursor-pointer ${
              activeAdminTab === 'coupons'
                ? 'bg-white text-black font-black'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>COUPONS & DEALS</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('shipping')}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors text-left whitespace-nowrap cursor-pointer ${
              activeAdminTab === 'shipping'
                ? 'bg-white text-black font-black'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>PROVINCE LOGISTICS</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('settings')}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors text-left whitespace-nowrap cursor-pointer ${
              activeAdminTab === 'settings'
                ? 'bg-white text-black font-black'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>STORE SETTINGS</span>
          </button>

          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-500 px-3 py-1.5 pt-4 hidden md:block">
            ACCESS
          </div>

          <button
            onClick={() => setActiveAdminTab('admins')}
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors text-left whitespace-nowrap cursor-pointer ${
              activeAdminTab === 'admins'
                ? 'bg-white text-black font-black'
                : 'text-stone-400 hover:text-white hover:bg-stone-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ADMIN WHITELIST</span>
            <span
              className={`ml-auto text-[10px] px-1.5 py-0.2 font-mono ${
                activeAdminTab === 'admins' ? 'bg-stone-200 text-black' : 'bg-stone-900 text-stone-400'
              }`}
            >
              {adminWhitelist.length}
            </span>
          </button>

          <div className="mt-auto pt-6 hidden md:block">
            <div className="bg-stone-950 p-3.5 border border-stone-800 text-[11px] text-stone-400 space-y-1">
              <div className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5 text-[10px]">
                <Store className="w-3 h-3 text-white" />
                <span>LIVE STORE SYNC</span>
              </div>
              <p className="text-[10px] text-stone-500 leading-normal">
                Inventory deletions and edits update customer catalog instantly.
              </p>
            </div>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          {/* Top Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-stone-950 p-4 border border-stone-800">
              <div className="flex items-center justify-between text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                <span>ACTIVE PRODUCTS</span>
                <Package className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <div className="text-2xl font-black text-white">{totalCatalogCount}</div>
              <div className="text-[10px] text-stone-500 mt-1 uppercase tracking-wider font-mono">
                {totalStockUnits} UNITS IN STOCK
              </div>
            </div>

            <div className="bg-stone-950 p-4 border border-stone-800">
              <div className="flex items-center justify-between text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                <span>FEATURED ITEMS</span>
                <Sparkles className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {heroShowcaseCount + trendingCount}
              </div>
              <div className="text-[10px] text-stone-500 mt-1 uppercase tracking-wider">
                HERO & TRENDING SPOTLIGHTS
              </div>
            </div>

            <div className="bg-stone-950 p-4 border border-stone-800">
              <div className="flex items-center justify-between text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                <span>TOTAL ORDERS</span>
                <ShoppingCart className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <div className="text-2xl font-black text-white">{orders.length}</div>
              <div className="text-[10px] text-stone-500 mt-1 uppercase tracking-wider font-mono">
                REVENUE: {formatNPR(totalRevenue)}
              </div>
            </div>

            <div className="bg-stone-950 p-4 border border-stone-800">
              <div className="flex items-center justify-between text-stone-400 text-[10px] font-bold uppercase tracking-widest mb-1">
                <span>DISPATCH PIPELINE</span>
                <Truck className="w-3.5 h-3.5 text-stone-400" />
              </div>
              <div className="text-2xl font-black text-white">
                {pendingPackCount + inTransitCount}
              </div>
              <div className="text-[10px] text-stone-500 mt-1 uppercase tracking-wider font-mono">
                {pendingPackCount} PACKING • {inTransitCount} IN TRANSIT
              </div>
            </div>
          </div>

          {/* Sticky Bulk Operations Toolbar */}
          {selectedProductIds.length > 0 && (
            <div className="bg-stone-900 border-2 border-white p-3.5 flex flex-wrap items-center justify-between gap-3 sticky top-16 z-20 shadow-2xl">
              <div className="flex items-center gap-3">
                <span className="bg-white text-black font-black text-xs px-2.5 py-1 font-mono">
                  {selectedProductIds.length} SELECTED
                </span>
                <span className="text-xs text-stone-300 font-medium hidden sm:inline">
                  Bulk apply changes or delete simultaneously
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleBulkAddStock(10)}
                  className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  +10 STOCK TO ALL
                </button>

                <select
                  onChange={(e) => {
                    if (e.target.value) handleBulkSetSection(e.target.value as ProductSection);
                  }}
                  defaultValue=""
                  className="px-2.5 py-1.5 bg-stone-800 border border-stone-700 text-xs font-bold text-stone-200 uppercase tracking-wider cursor-pointer"
                >
                  <option value="" disabled>
                    SET SECTION...
                  </option>
                  <option value="hero_showcase">HERO SPOTLIGHT</option>
                  <option value="trending_now">TRENDING GRID</option>
                  <option value="flash_sale">FLASH SALE</option>
                  <option value="regular_catalog">STANDARD CATALOG</option>
                  <option value="hidden">DRAFT / HIDDEN</option>
                </select>

                <button
                  type="button"
                  onClick={() => setIsBulkDeleteOpen(true)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>DELETE ({selectedProductIds.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedProductIds([])}
                  className="px-2.5 py-1.5 text-stone-400 hover:text-white text-xs uppercase underline cursor-pointer"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: MERCHANDISING & PRODUCT PLACEMENT CONTROL */}
          {/* ========================================================================= */}
          {activeAdminTab === 'merchandising' && (
            <div className="space-y-6">
              <div className="bg-stone-950 p-5 border border-stone-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-stone-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400">
                      STOREFRONT ARCHITECTURE
                    </span>
                    <h2 className="text-base font-black uppercase tracking-wider text-white mt-0.5">
                      PRODUCT PLACEMENT & MERCHANDISING
                    </h2>
                    <p className="text-xs text-stone-400 mt-0.5 font-light">
                      Manage visual positions: Hero Spotlight, Trending Grid, Clearance deals, and priority order.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleStartCreate}
                      className="px-3.5 py-1.5 bg-white hover:bg-stone-200 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ADD PRODUCT</span>
                    </button>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-500" />
                    <input
                      type="text"
                      placeholder="SEARCH BY NAME, SKU (E.G. GT-JKT-882)..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-stone-900 border border-stone-800 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-stone-500 uppercase tracking-wider"
                    />
                  </div>

                  <div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-stone-500 uppercase tracking-wider"
                    >
                      <option value="all">ALL CATEGORIES</option>
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={sectionFilter}
                      onChange={(e) => setSectionFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-stone-500 uppercase tracking-wider"
                    >
                      <option value="all">ALL DISPLAY SECTIONS</option>
                      <option value="hero_showcase">TOP HERO SHOWCASE</option>
                      <option value="trending_now">TRENDING / HIGH DEMAND</option>
                      <option value="flash_sale">FLASH SALE / CLEARANCE</option>
                      <option value="featured_home">FEATURED ON HOME PAGE</option>
                      <option value="hidden">DRAFT / HIDDEN ITEMS</option>
                    </select>
                  </div>
                </div>

                {/* Products Table with Sharp Minimalist Controls */}
                <div className="overflow-x-auto border border-stone-800">
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="bg-stone-900 text-stone-400 font-bold uppercase tracking-widest text-[10px] border-b border-stone-800">
                      <tr>
                        <th className="py-3 px-3 w-10 text-center">
                          <button
                            type="button"
                            onClick={() => handleSelectAllFiltered(filteredProducts)}
                            className="text-stone-400 hover:text-white cursor-pointer"
                            title="Select all"
                          >
                            {selectedProductIds.length === filteredProducts.length &&
                            filteredProducts.length > 0 ? (
                              <CheckSquare className="w-4 h-4 text-white" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </th>
                        <th className="py-3 px-3">ITEM & SKU</th>
                        <th className="py-3 px-3">CATEGORY</th>
                        <th className="py-3 px-3">PRICE (NPR)</th>
                        <th className="py-3 px-3">DISPLAY SECTION</th>
                        <th className="py-3 px-3 text-center">ORDER</th>
                        <th className="py-3 px-3 text-center">HOME PIN</th>
                        <th className="py-3 px-3 text-center">STOCK</th>
                        <th className="py-3 px-4 text-right">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/80">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td
                            colSpan={9}
                            className="py-8 text-center text-stone-500 uppercase tracking-wider text-xs"
                          >
                            No products match the selected filters.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => {
                          const currentSection =
                            p.displaySection || (p.isTrending ? 'trending_now' : 'regular_catalog');
                          const isSelected = selectedProductIds.includes(p.id);

                          return (
                            <tr
                              key={p.id}
                              className={`transition-colors ${
                                isSelected ? 'bg-stone-900/90' : 'hover:bg-stone-900/50'
                              }`}
                            >
                              {/* Selection Checkbox */}
                              <td className="py-3 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleToggleSelectProduct(p.id)}
                                  className="text-stone-400 hover:text-white cursor-pointer"
                                >
                                  {isSelected ? (
                                    <CheckSquare className="w-4 h-4 text-white" />
                                  ) : (
                                    <Square className="w-4 h-4 text-stone-600" />
                                  )}
                                </button>
                              </td>

                              {/* Product Info */}
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={p.images[0] || PRESET_SAMPLE_IMAGES[0]}
                                    alt={p.name}
                                    className="w-12 h-12 object-cover bg-stone-900 border border-stone-800 shrink-0"
                                  />
                                  <div>
                                    <div className="font-bold text-white text-xs uppercase tracking-wider">
                                      {p.name}
                                    </div>
                                    <div className="text-[11px] text-stone-500 font-mono flex items-center gap-2 mt-0.5">
                                      <span>{p.styleCode}</span>
                                      <span>•</span>
                                      <span>{p.origin}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 bg-stone-900 border border-stone-800 text-stone-300 text-[10px] font-bold uppercase tracking-wider">
                                  {p.category.replace('_', ' ')}
                                </span>
                              </td>

                              {/* Price */}
                              <td className="py-3 px-3 font-mono">
                                <div className="font-bold text-white">{formatNPR(p.price)}</div>
                                {p.originalPrice && p.originalPrice > p.price && (
                                  <div className="text-[10px] text-stone-500 line-through">
                                    {formatNPR(p.originalPrice)}
                                  </div>
                                )}
                              </td>

                              {/* Section Placement Selector */}
                              <td className="py-3 px-3">
                                <select
                                  value={currentSection}
                                  onChange={(e) =>
                                    handleQuickSectionChange(p.id, e.target.value as ProductSection)
                                  }
                                  className="px-2 py-1 bg-stone-900 border border-stone-800 text-[11px] font-bold uppercase tracking-wider text-stone-200 focus:outline-none focus:border-stone-500 cursor-pointer"
                                >
                                  <option value="hero_showcase">HERO SPOTLIGHT</option>
                                  <option value="trending_now">TRENDING NOW</option>
                                  <option value="flash_sale">FLASH SALE</option>
                                  <option value="regular_catalog">STANDARD CATALOG</option>
                                  <option value="hidden">DRAFT / HIDDEN</option>
                                </select>
                              </td>

                              {/* Display Priority Up / Down */}
                              <td className="py-3 px-3 text-center">
                                <div className="inline-flex items-center gap-1 bg-stone-900 border border-stone-800 px-1.5 py-0.5">
                                  <button
                                    onClick={() => handlePriorityChange(p.id, -5)}
                                    className="p-1 text-stone-400 hover:text-white transition-colors cursor-pointer"
                                    title="Higher Priority"
                                  >
                                    <ArrowUp className="w-3 h-3" />
                                  </button>
                                  <span className="font-mono text-[11px] font-bold text-white min-w-[20px] text-center">
                                    {p.displayPriority ?? 50}
                                  </span>
                                  <button
                                    onClick={() => handlePriorityChange(p.id, 5)}
                                    className="p-1 text-stone-400 hover:text-white transition-colors cursor-pointer"
                                    title="Lower Priority"
                                  >
                                    <ArrowDown className="w-3 h-3" />
                                  </button>
                                </div>
                              </td>

                              {/* Home Pinned */}
                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={() => handleToggleHomeFeatured(p.id)}
                                  className={`p-1.5 transition-colors cursor-pointer border ${
                                    p.featuredOnHome !== false
                                      ? 'bg-white text-black border-white'
                                      : 'bg-stone-900 text-stone-600 border-stone-800 hover:text-stone-400'
                                  }`}
                                  title={
                                    p.featuredOnHome !== false ? 'Featured on Home' : 'Not on Home'
                                  }
                                >
                                  <Star className="w-3.5 h-3.5 fill-current" />
                                </button>
                              </td>

                              {/* Stock */}
                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={() => handleToggleStock(p.id)}
                                  className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider cursor-pointer transition-colors border font-mono ${
                                    p.inStock && p.stockCount > 0
                                      ? 'bg-stone-900 text-stone-200 border-stone-700'
                                      : 'bg-stone-900 text-stone-500 border-stone-800 line-through'
                                  }`}
                                >
                                  {p.inStock && p.stockCount > 0
                                    ? `${p.stockCount} IN STOCK`
                                    : 'OUT OF STOCK'}
                                </button>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => handleStartEdit(p)}
                                    className="p-1.5 bg-stone-900 hover:bg-white text-stone-300 hover:text-black border border-stone-800 transition-colors cursor-pointer"
                                    title="Edit Product"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setProductToDelete(p)}
                                    className="p-1.5 bg-stone-900 hover:bg-rose-600 hover:text-white text-stone-400 border border-stone-800 transition-colors cursor-pointer"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: INVENTORY & STOCK MANAGEMENT */}
          {/* ========================================================================= */}
          {activeAdminTab === 'products' && (
            <div className="space-y-6">
              <div className="bg-stone-950 p-5 border border-stone-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-stone-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400">
                      WAREHOUSE AUDIT
                    </span>
                    <h2 className="text-base font-black uppercase tracking-wider text-white mt-0.5">
                      INVENTORY & STOCK ALLOCATION
                    </h2>
                    <p className="text-xs text-stone-400 mt-0.5 font-light">
                      Adjust quantities, manage replenishment triggers, and monitor low inventory.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setStockFilter(stockFilter === 'low' ? 'all' : 'low')
                      }
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border cursor-pointer ${
                        stockFilter === 'low'
                          ? 'bg-amber-600 text-white border-amber-500'
                          : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
                      }`}
                    >
                      LOW STOCK ({lowStockCount})
                    </button>
                    <button
                      onClick={() =>
                        setStockFilter(stockFilter === 'out' ? 'all' : 'out')
                      }
                      className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border cursor-pointer ${
                        stockFilter === 'out'
                          ? 'bg-rose-600 text-white border-rose-500'
                          : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
                      }`}
                    >
                      OUT OF STOCK ({outOfStockCount})
                    </button>
                  </div>
                </div>

                {/* Stock Table */}
                <div className="overflow-x-auto border border-stone-800">
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="bg-stone-900 text-stone-400 font-bold uppercase tracking-widest text-[10px] border-b border-stone-800">
                      <tr>
                        <th className="py-3 px-3 w-10 text-center">
                          <button
                            type="button"
                            onClick={() => handleSelectAllFiltered(filteredProducts)}
                            className="text-stone-400 hover:text-white cursor-pointer"
                          >
                            {selectedProductIds.length === filteredProducts.length &&
                            filteredProducts.length > 0 ? (
                              <CheckSquare className="w-4 h-4 text-white" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </th>
                        <th className="py-3 px-4">ITEM</th>
                        <th className="py-3 px-3">SKU</th>
                        <th className="py-3 px-3">PRICE</th>
                        <th className="py-3 px-3 text-center">IN-STOCK UNITS</th>
                        <th className="py-3 px-3 text-center">STATUS</th>
                        <th className="py-3 px-4 text-right">QUICK ADJUST</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/80">
                      {filteredProducts.map((p) => {
                        const isSelected = selectedProductIds.includes(p.id);
                        return (
                          <tr
                            key={p.id}
                            className={`transition-colors ${
                              isSelected ? 'bg-stone-900/90' : 'hover:bg-stone-900/50'
                            }`}
                          >
                            <td className="py-3 px-3 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleSelectProduct(p.id)}
                                className="text-stone-400 hover:text-white cursor-pointer"
                              >
                                {isSelected ? (
                                  <CheckSquare className="w-4 h-4 text-white" />
                                ) : (
                                  <Square className="w-4 h-4 text-stone-600" />
                                )}
                              </button>
                            </td>

                            <td className="py-3 px-4">
                              <div className="font-bold text-white uppercase">{p.name}</div>
                              <div className="text-[11px] text-stone-500 font-mono">
                                {p.category.replace('_', ' ')}
                              </div>
                            </td>

                            <td className="py-3 px-3 font-mono text-stone-400">{p.styleCode}</td>
                            <td className="py-3 px-3 font-mono text-white font-bold">
                              {formatNPR(p.price)}
                            </td>

                            <td className="py-3 px-3 text-center font-mono font-bold text-sm text-white">
                              {p.stockCount}
                            </td>

                            <td className="py-3 px-3 text-center">
                              <span
                                className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                                  p.inStock && p.stockCount > 5
                                    ? 'bg-stone-900 text-stone-200 border-stone-700'
                                    : p.stockCount > 0
                                    ? 'bg-amber-950 text-amber-300 border-amber-800'
                                    : 'bg-rose-950 text-rose-300 border-rose-800'
                                }`}
                              >
                                {p.inStock && p.stockCount > 5
                                  ? 'OPTIMAL'
                                  : p.stockCount > 0
                                  ? 'LOW STOCK'
                                  : 'DEPLETED'}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => {
                                    const updated = {
                                      ...p,
                                      stockCount: Math.max(0, p.stockCount - 5),
                                      inStock: p.stockCount - 5 > 0,
                                    };
                                    onSaveProduct(updated);
                                    showAdminToast(`Reduced -5 stock for ${p.name}`);
                                  }}
                                  className="px-2.5 py-1 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-mono font-bold uppercase cursor-pointer"
                                >
                                  -5
                                </button>
                                <button
                                  onClick={() => {
                                    const updated = {
                                      ...p,
                                      stockCount: p.stockCount + 10,
                                      inStock: true,
                                    };
                                    onSaveProduct(updated);
                                    showAdminToast(`Added +10 stock for ${p.name}`);
                                  }}
                                  className="px-2.5 py-1 bg-white hover:bg-stone-200 text-black text-xs font-mono font-bold uppercase cursor-pointer"
                                >
                                  +10
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setProductToDelete(p)}
                                  className="p-1 bg-stone-900 hover:bg-rose-600 hover:text-white text-stone-500 border border-stone-800 cursor-pointer ml-1"
                                  title="Delete Product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: PHOTOS & LOOKBOOK MEDIA STUDIO */}
          {/* ========================================================================= */}
          {activeAdminTab === 'visuals' && (
            <AdminMediaStudio
              heroSlides={heroSlides}
              onUpdateHeroSlides={onUpdateHeroSlides}
              categoryCards={categoryCards}
              onUpdateCategoryCards={onUpdateCategoryCards}
              products={products}
              onUpdateProduct={onSaveProduct}
              onSaveToast={showAdminToast}
              onPreviewFrontPage={onBackToStore}
            />
          )}

          {/* ========================================================================= */}
          {/* TAB 3: PRODUCT & PHOTO EDITOR */}
          {/* ========================================================================= */}
          {activeAdminTab === 'editor' && formProduct && (
            <div className="bg-stone-950 p-6 border border-stone-800 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-stone-800">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400">
                    SPECIFICATIONS & MEDIA
                  </span>
                  <h2 className="text-base font-black uppercase tracking-wider text-white mt-0.5">
                    {isCreatingNew ? 'CREATE NEW TECHNICAL PRODUCT' : `EDITING: ${formProduct.name}`}
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5 font-light">
                    Manage high-resolution photos, NPR pricing, colorways, size matrices, and tech specs.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {!isCreatingNew && (
                    <button
                      type="button"
                      onClick={() => setProductToDelete(formProduct)}
                      className="px-3.5 py-1.5 bg-stone-900 hover:bg-rose-600 text-rose-400 hover:text-white border border-stone-800 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>DELETE PRODUCT</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setActiveAdminTab('merchandising')}
                    className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    CANCEL
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveForm}
                    className="px-4 py-1.5 bg-white hover:bg-stone-200 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>SAVE PRODUCT</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-6">
                {/* Basic Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                      PRODUCT NAME / MODEL
                    </label>
                    <input
                      type="text"
                      required
                      value={formProduct.name}
                      onChange={(e) =>
                        setFormProduct({ ...formProduct, name: e.target.value })
                      }
                      placeholder="E.G. ANNAPURNA DOWN PARKA 850FP"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-white text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-stone-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                      STYLE CODE / SKU
                    </label>
                    <input
                      type="text"
                      required
                      value={formProduct.styleCode}
                      onChange={(e) =>
                        setFormProduct({ ...formProduct, styleCode: e.target.value.toUpperCase() })
                      }
                      placeholder="GT-JKT-990"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-white text-xs font-mono font-bold tracking-wider focus:outline-none focus:border-stone-500 uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                      CATEGORY
                    </label>
                    <select
                      value={formProduct.category}
                      onChange={(e) =>
                        setFormProduct({
                          ...formProduct,
                          category: e.target.value as ProductCategory,
                        })
                      }
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-white text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-stone-500"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                      CURRENT PRICE (NPR)
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formProduct.price}
                      onChange={(e) =>
                        setFormProduct({ ...formProduct, price: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-white text-xs font-mono font-bold tracking-wider focus:outline-none focus:border-stone-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                      ORIGINAL / STRIKETHROUGH PRICE (NPR)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formProduct.originalPrice || ''}
                      onChange={(e) =>
                        setFormProduct({
                          ...formProduct,
                          originalPrice: Number(e.target.value) || undefined,
                        })
                      }
                      placeholder="OPTIONAL"
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-white text-xs font-mono tracking-wider focus:outline-none focus:border-stone-500"
                    />
                  </div>
                </div>

                {/* Merchandising & Placement Parameters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-stone-900/60 border border-stone-800">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                      STOREFRONT DISPLAY SECTION
                    </label>
                    <select
                      value={formProduct.displaySection || 'regular_catalog'}
                      onChange={(e) =>
                        setFormProduct({
                          ...formProduct,
                          displaySection: e.target.value as ProductSection,
                        })
                      }
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 text-white text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-stone-500"
                    >
                      {SECTION_OPTIONS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                      AVAILABLE STOCK UNITS
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formProduct.stockCount}
                      onChange={(e) =>
                        setFormProduct({
                          ...formProduct,
                          stockCount: Number(e.target.value),
                          inStock: Number(e.target.value) > 0,
                        })
                      }
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 text-white text-xs font-mono font-bold tracking-wider focus:outline-none focus:border-stone-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                      DISPLAY PRIORITY ORDER (1 = HIGHEST)
                    </label>
                    <input
                      type="number"
                      value={formProduct.displayPriority ?? 50}
                      onChange={(e) =>
                        setFormProduct({
                          ...formProduct,
                          displayPriority: Number(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 text-white text-xs font-mono font-bold tracking-wider focus:outline-none focus:border-stone-500"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                    TECHNICAL DESCRIPTION & FIELD UTILITY
                  </label>
                  <textarea
                    rows={3}
                    value={formProduct.description}
                    onChange={(e) =>
                      setFormProduct({ ...formProduct, description: e.target.value })
                    }
                    placeholder="Describe waterproof ratings, insulation fill power, and mountain utility..."
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-white text-xs focus:outline-none focus:border-stone-500"
                  />
                </div>

                {/* Images Manager */}
                <div className="space-y-4">
                  <label className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                    PRODUCT PHOTOGRAPHY & ASSETS ({formProduct.images.length})
                  </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                      {formProduct.images.map((img, idx) => (
                        <div
                          key={idx}
                          className="relative group bg-stone-900 border border-stone-800 aspect-square overflow-hidden"
                        >
                          <img
                            src={img}
                            alt="preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-1 text-center">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const selected = formProduct.images[idx];
                                  const rest = formProduct.images.filter((_, i) => i !== idx);
                                  setFormProduct({ ...formProduct, images: [selected, ...rest] });
                                  showAdminToast('Set as Primary Cover photo');
                                }}
                                className="px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-black text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                              >
                                Make Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formProduct.images.filter((_, i) => i !== idx);
                                setFormProduct({ ...formProduct, images: updated });
                                showAdminToast('Removed photo');
                              }}
                              className="p-1 bg-rose-600 hover:bg-rose-500 text-white cursor-pointer"
                              title="Remove photo"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          {idx === 0 ? (
                            <span className="absolute bottom-1 left-1 bg-amber-500 text-black text-[9px] font-bold px-1.5 py-0.5 uppercase tracking-wider">
                              PRIMARY
                            </span>
                          ) : (
                            <span className="absolute bottom-1 left-1 bg-black/80 text-white text-[9px] font-mono px-1">
                              #{idx + 1}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                  {/* Integrated Drag & Drop / Device Upload / URL Input */}
                  <ImageUploadInput
                    label="Upload or Paste New Product Photo"
                    sublabel="Upload from your device, drag and drop, or paste URL"
                    value=""
                    onChange={(newUrl) => {
                      if (newUrl) {
                        setFormProduct({
                          ...formProduct,
                          images: [...formProduct.images, newUrl.trim()],
                        });
                        showAdminToast('Added photo to product');
                      }
                    }}
                    aspectRatio="square"
                    presetOptions={PRESET_SAMPLE_IMAGES}
                  />
                </div>

                {/* Colors & Sizes Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 bg-stone-900/40 border border-stone-800">
                  {/* Colors */}
                  <div className="space-y-3">
                    <label className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                      COLORWAYS
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formProduct.colors.map((col, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-900 border border-stone-800 text-xs font-bold uppercase"
                        >
                          <span
                            className="w-3 h-3 border border-stone-700"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span>{col.name}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formProduct.colors.filter((_, i) => i !== idx);
                              setFormProduct({ ...formProduct, colors: updated });
                            }}
                            className="text-stone-500 hover:text-white ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-10 h-8 p-0 bg-transparent border border-stone-800 cursor-pointer"
                      />
                      <input
                        type="text"
                        placeholder="COLOR NAME (E.G. KHAKI GREEN)"
                        value={newColorName}
                        onChange={(e) => setNewColorName(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-stone-900 border border-stone-800 text-xs text-white uppercase"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newColorName.trim()) return;
                          setFormProduct({
                            ...formProduct,
                            colors: [
                              ...formProduct.colors,
                              { name: newColorName.trim(), hex: newColorHex },
                            ],
                          });
                          setNewColorName('');
                        }}
                        className="px-3 py-1.5 bg-stone-800 text-white text-xs font-bold uppercase cursor-pointer"
                      >
                        + ADD
                      </button>
                    </div>
                  </div>

                  {/* Sizes */}
                  <div className="space-y-3">
                    <label className="block text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                      SIZING OPTIONS
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {formProduct.sizes.map((sz, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-stone-900 border border-stone-800 text-xs font-mono font-bold text-white"
                        >
                          <span>{sz}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formProduct.sizes.filter((_, i) => i !== idx);
                              setFormProduct({ ...formProduct, sizes: updated });
                            }}
                            className="text-stone-500 hover:text-white ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="SIZE (E.G. S, M, L, 42, 60L)"
                        value={newSize}
                        onChange={(e) => setNewSize(e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-stone-900 border border-stone-800 text-xs text-white uppercase"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newSize.trim()) return;
                          setFormProduct({
                            ...formProduct,
                            sizes: [...formProduct.sizes, newSize.trim().toUpperCase()],
                          });
                          setNewSize('');
                        }}
                        className="px-3 py-1.5 bg-stone-800 text-white text-xs font-bold uppercase cursor-pointer"
                      >
                        + ADD
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit bar */}
                <div className="flex justify-between items-center pt-4 border-t border-stone-800">
                  <div>
                    {!isCreatingNew && (
                      <button
                        type="button"
                        onClick={() => setProductToDelete(formProduct)}
                        className="px-4 py-2 bg-stone-900 hover:bg-rose-600 text-rose-400 hover:text-white border border-stone-800 text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>DELETE THIS PRODUCT</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setActiveAdminTab('merchandising')}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      DISCARD CHANGES
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-white hover:bg-stone-200 text-black text-xs font-black uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isCreatingNew ? 'CREATE PRODUCT' : 'SAVE CHANGES'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: ADVANCED LOGISTICS & ORDER FULFILLMENT */}
          {/* ========================================================================= */}
          {activeAdminTab === 'orders' && (
            <div className="space-y-6">
              <div className="bg-stone-950 p-5 border border-stone-800">
                {/* Header & Export Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-stone-800">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400">
                      NATIONWIDE DISPATCH ENGINE
                    </span>
                    <h2 className="text-base font-black uppercase tracking-wider text-white mt-0.5">
                      LOGISTICS, WAYBILLS & FULFILLMENT
                    </h2>
                    <p className="text-xs text-stone-400 mt-0.5 font-light">
                      Manage order dispatch, assign courier waybills (AWB), print dispatch labels, and verify payments.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={handleExportManifestCSV}
                      className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow"
                      title="Download CSV Manifest for Courier Handover"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                      <span>EXPORT COURIER MANIFEST (CSV)</span>
                    </button>
                  </div>
                </div>

                {/* Logistics KPI Mini-Dashboard */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mb-6">
                  <button
                    onClick={() => {
                      setOrderStatusFilter('all');
                      setPaymentMethodFilter('all');
                    }}
                    className={`p-3 text-left border cursor-pointer transition-colors ${
                      orderStatusFilter === 'all' && paymentMethodFilter === 'all'
                        ? 'bg-stone-800 border-white text-white'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:bg-stone-900'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase">ALL ORDERS</div>
                    <div className="text-lg font-black text-white font-mono">{orders.length}</div>
                  </button>

                  <button
                    onClick={() => {
                      setOrderStatusFilter('confirmed');
                      setPaymentMethodFilter('all');
                    }}
                    className={`p-3 text-left border cursor-pointer transition-colors ${
                      orderStatusFilter === 'confirmed'
                        ? 'bg-blue-950/80 border-blue-500 text-blue-300'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:bg-stone-900'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                      <span>READY TO PACK</span>
                    </div>
                    <div className="text-lg font-black text-white font-mono">{pendingPackCount}</div>
                  </button>

                  <button
                    onClick={() => {
                      setOrderStatusFilter('shipped');
                      setPaymentMethodFilter('all');
                    }}
                    className={`p-3 text-left border cursor-pointer transition-colors ${
                      orderStatusFilter === 'shipped'
                        ? 'bg-purple-950/80 border-purple-500 text-purple-300'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:bg-stone-900'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                      <span>IN TRANSIT (AWB)</span>
                    </div>
                    <div className="text-lg font-black text-white font-mono">{inTransitCount}</div>
                  </button>

                  <button
                    onClick={() => {
                      setOrderStatusFilter('out_for_delivery');
                      setPaymentMethodFilter('all');
                    }}
                    className={`p-3 text-left border cursor-pointer transition-colors ${
                      orderStatusFilter === 'out_for_delivery'
                        ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:bg-stone-900'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                      <span>OUT FOR DELIVERY</span>
                    </div>
                    <div className="text-lg font-black text-white font-mono">
                      {outForDeliveryCount}
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setOrderStatusFilter('delivered');
                      setPaymentMethodFilter('all');
                    }}
                    className={`p-3 text-left border cursor-pointer transition-colors ${
                      orderStatusFilter === 'delivered'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:bg-stone-900'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      <span>DELIVERED</span>
                    </div>
                    <div className="text-lg font-black text-white font-mono">{deliveredCount}</div>
                  </button>

                  <button
                    onClick={() => {
                      setPaymentMethodFilter('cod_pending');
                      setOrderStatusFilter('all');
                    }}
                    className={`p-3 text-left border cursor-pointer transition-colors ${
                      paymentMethodFilter === 'cod_pending'
                        ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                        : 'bg-stone-900/60 border-stone-800 text-stone-400 hover:bg-stone-900'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase text-amber-400">COD PENDING</div>
                    <div className="text-sm font-black text-amber-300 font-mono">
                      {formatNPR(codPendingTotal)}
                    </div>
                  </button>
                </div>

                {/* Filter & Search Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
                  <div className="relative sm:col-span-2">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-500" />
                    <input
                      type="text"
                      placeholder="SEARCH ORDER ID, TRACKING AWB, CUSTOMER, PHONE, DISTRICT..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-stone-900 border border-stone-800 text-xs text-stone-100 placeholder-stone-600 focus:outline-none focus:border-stone-500 uppercase tracking-wider"
                    />
                  </div>

                  <div>
                    <select
                      value={provinceFilter}
                      onChange={(e) => setProvinceFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-xs text-stone-200 uppercase tracking-wider"
                    >
                      <option value="all">ALL 7 PROVINCES</option>
                      {NEPAL_PROVINCES.map((pr) => (
                        <option key={pr.id} value={pr.name}>
                          {pr.name.toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={paymentMethodFilter}
                      onChange={(e) => setPaymentMethodFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-xs text-stone-200 uppercase tracking-wider"
                    >
                      <option value="all">ALL PAYMENTS</option>
                      <option value="fonepay">FONEPAY PREPAID</option>
                      <option value="cod_pending">COD UNCOLLECTED</option>
                      <option value="cod_collected">COD SETTLED</option>
                    </select>
                  </div>
                </div>

                {/* Orders Fulfillment Table */}
                <div className="overflow-x-auto border border-stone-800">
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="bg-stone-900 text-stone-400 font-bold uppercase tracking-widest text-[10px] border-b border-stone-800">
                      <tr>
                        <th className="py-3 px-4">ORDER & DATE</th>
                        <th className="py-3 px-3">CONSIGNEE & ADDRESS</th>
                        <th className="py-3 px-3">CARGO MANIFEST</th>
                        <th className="py-3 px-3">COURIER & AWB</th>
                        <th className="py-3 px-3">PAYMENT</th>
                        <th className="py-3 px-3">STATUS STEPPER</th>
                        <th className="py-3 px-4 text-right">DISPATCH DOCS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/80">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="py-12 text-center text-stone-500 uppercase tracking-wider text-xs"
                          >
                            No orders match the specified logistics filters.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((o) => {
                          const isCOD = o.paymentMethod === 'cod';
                          const isPaid =
                            o.paymentStatus === 'completed' || o.paymentStatus === 'verified';
                          const totalVal = o.totalAmount || o.grandTotal || 0;

                          return (
                            <tr key={o.id} className="hover:bg-stone-900/50 transition-colors">
                              {/* Order & Date */}
                              <td className="py-3.5 px-4">
                                <div className="font-mono font-black text-white text-xs">
                                  #{o.id}
                                </div>
                                <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                                  {o.date || new Date().toLocaleDateString()}
                                </div>
                              </td>

                              {/* Consignee */}
                              <td className="py-3.5 px-3 max-w-[200px]">
                                <div className="font-bold text-white uppercase truncate">
                                  {o.customer?.fullName || 'Customer'}
                                </div>
                                <div className="text-[11px] text-stone-300 font-mono">
                                  {o.customer?.phone}
                                </div>
                                <div className="text-[10px] text-stone-400 line-clamp-2 mt-0.5">
                                  {o.customer?.streetAddress}, {o.customer?.district},{' '}
                                  {o.customer?.provinceName}
                                </div>
                              </td>

                              {/* Cargo items */}
                              <td className="py-3.5 px-3 max-w-[220px]">
                                <div className="space-y-1">
                                  {o.items.map((it, idx) => (
                                    <div
                                      key={idx}
                                      className="text-[11px] text-stone-200 flex items-center justify-between gap-2"
                                    >
                                      <span className="truncate">
                                        <span className="font-mono font-bold text-white">
                                          {it.quantity}x
                                        </span>{' '}
                                        {it.product.name}
                                      </span>
                                      <span className="text-[10px] text-stone-500 font-mono shrink-0">
                                        {it.selectedSize || 'Std'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </td>

                              {/* Assigned Courier & AWB */}
                              <td className="py-3.5 px-3">
                                {o.courierPartner || o.awbNumber ? (
                                  <div>
                                    <div className="font-bold text-white text-[11px] uppercase truncate max-w-[140px]">
                                      {o.courierPartner || 'Assigned'}
                                    </div>
                                    <div className="font-mono text-[10px] text-stone-300 mt-0.5">
                                      AWB: {o.awbNumber || o.trackingCode || 'Pending'}
                                    </div>
                                    {o.riderName && (
                                      <div className="text-[10px] text-stone-500">
                                        Rider: {o.riderName}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setSelectedOrderForCourier(o)}
                                    className="px-2 py-1 bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                  >
                                    + ASSIGN COURIER
                                  </button>
                                )}
                              </td>

                              {/* Payment status */}
                              <td className="py-3.5 px-3">
                                <div className="font-mono font-black text-white text-xs">
                                  {formatNPR(totalVal)}
                                </div>
                                <div className="mt-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const nextPaymentStatus = isPaid
                                        ? 'cod_pending'
                                        : 'completed';
                                      onUpdateOrderStatus(
                                        o.id,
                                        o.orderStatus,
                                        nextPaymentStatus
                                      );
                                      showAdminToast(
                                        `Toggled payment status for #${o.id} to ${nextPaymentStatus}`
                                      );
                                    }}
                                    className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider font-mono border cursor-pointer ${
                                      isPaid
                                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                        : isCOD
                                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                                        : 'bg-stone-900 text-stone-400 border-stone-800'
                                    }`}
                                    title="Click to toggle payment verification"
                                  >
                                    {isPaid
                                      ? '✓ PAID'
                                      : isCOD
                                      ? 'COD PENDING'
                                      : o.paymentStatus.toUpperCase()}
                                  </button>
                                </div>
                              </td>

                              {/* Status Stepper Action Chips */}
                              <td className="py-3.5 px-3">
                                <div className="flex flex-wrap items-center gap-1">
                                  {o.orderStatus === 'confirmed' ||
                                  o.orderStatus === 'order_placed' ? (
                                    <button
                                      onClick={() => {
                                        onUpdateOrderStatus(o.id, 'processing');
                                        showAdminToast(`Order #${o.id} marked as Processing`);
                                      }}
                                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                    >
                                      PACK ORDER →
                                    </button>
                                  ) : o.orderStatus === 'processing' ? (
                                    <button
                                      onClick={() => setSelectedOrderForCourier(o)}
                                      className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                    >
                                      DISPATCH / AWB →
                                    </button>
                                  ) : o.orderStatus === 'shipped' ||
                                    o.orderStatus === 'dispatched' ? (
                                    <button
                                      onClick={() => {
                                        onUpdateOrderStatus(o.id, 'out_for_delivery');
                                        showAdminToast(`Order #${o.id} is Out for Delivery`);
                                      }}
                                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                    >
                                      OUT FOR DELIVERY →
                                    </button>
                                  ) : o.orderStatus === 'out_for_delivery' ? (
                                    <button
                                      onClick={() => {
                                        onUpdateOrderStatus(o.id, 'delivered', 'completed');
                                        showAdminToast(`Order #${o.id} marked as DELIVERED & PAID`);
                                      }}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                                    >
                                      ✓ MARK DELIVERED
                                    </button>
                                  ) : (
                                    <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                                      COMPLETED
                                    </span>
                                  )}

                                  {/* Fast status dropdown */}
                                  <select
                                    value={o.orderStatus}
                                    onChange={(e) => {
                                      onUpdateOrderStatus(
                                        o.id,
                                        e.target.value as Order['orderStatus']
                                      );
                                      showAdminToast(
                                        `Order #${o.id} status updated to ${e.target.value}`
                                      );
                                    }}
                                    className="p-1 bg-stone-900 border border-stone-800 text-[10px] text-stone-300 uppercase cursor-pointer"
                                  >
                                    <option value="confirmed">CONFIRMED</option>
                                    <option value="processing">PROCESSING</option>
                                    <option value="shipped">SHIPPED</option>
                                    <option value="out_for_delivery">OUT FOR DELIVERY</option>
                                    <option value="delivered">DELIVERED</option>
                                  </select>
                                </div>
                              </td>

                              {/* Dispatch Docs & Slip */}
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => setSelectedOrderForCourier(o)}
                                    className="p-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 cursor-pointer"
                                    title="Edit Waybill & Courier Details"
                                  >
                                    <Truck className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => setOrderToPrint(o)}
                                    className="px-2.5 py-1.5 bg-white hover:bg-stone-200 text-black text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow"
                                    title="Print Dispatch Slip & Air Waybill"
                                  >
                                    <Printer className="w-3.5 h-3.5" />
                                    <span>WAYBILL SLIP</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: COUPONS & DISCOUNTS */}
          {/* ========================================================================= */}
          {activeAdminTab === 'coupons' && (
            <div className="space-y-6">
              <div className="bg-stone-950 p-5 border border-stone-800">
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400">
                    MARKETING & VOUCHERS
                  </span>
                  <h2 className="text-base font-black uppercase tracking-wider text-white mt-0.5">
                    PROMOTIONAL COUPONS & FESTIVAL VOUCHERS
                  </h2>
                </div>

                {/* Add Coupon Form */}
                <form
                  onSubmit={handleAddCoupon}
                  className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 bg-stone-900/60 border border-stone-800 mb-6"
                >
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                      CODE
                    </label>
                    <input
                      type="text"
                      placeholder="E.G. HIMALAYA10"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                      required
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 text-white font-mono font-bold text-xs uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                      DISCOUNT TYPE
                    </label>
                    <select
                      value={newCouponType}
                      onChange={(e) =>
                        setNewCouponType(e.target.value as 'flat' | 'percentage')
                      }
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 text-white text-xs uppercase"
                    >
                      <option value="flat">FLAT NPR</option>
                      <option value="percentage">PERCENTAGE (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                      VALUE
                    </label>
                    <input
                      type="number"
                      value={newCouponValue}
                      onChange={(e) => setNewCouponValue(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 text-white font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                      MIN SPEND (NPR)
                    </label>
                    <input
                      type="number"
                      value={newCouponMin}
                      onChange={(e) => setNewCouponMin(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 text-white font-mono text-xs"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 bg-white hover:bg-stone-200 text-black font-bold uppercase tracking-wider text-xs cursor-pointer"
                    >
                      + ADD COUPON
                    </button>
                  </div>
                </form>

                {/* Coupons List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {coupons.map((c) => (
                    <div
                      key={c.code}
                      className="bg-stone-900/60 p-4 border border-stone-800 flex items-center justify-between"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-white text-sm tracking-wider">
                            {c.code}
                          </span>
                          <span className="px-2 py-0.5 bg-stone-800 text-stone-300 border border-stone-700 text-[10px] font-bold font-mono">
                            {c.discountType === 'flat'
                              ? `Rs. ${c.discountValue} OFF`
                              : `${c.discountValue}% OFF`}
                          </span>
                        </div>
                        <p className="text-xs text-stone-400 mt-1">{c.description}</p>
                        <p className="text-[10px] text-stone-500 font-mono mt-0.5 uppercase tracking-wider">
                          MIN: {formatNPR(c.minSpend || 0)} • USED: {c.usageCount}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleCoupon(c.code)}
                          className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider border cursor-pointer ${
                            c.isActive
                              ? 'bg-stone-800 text-white border-stone-600'
                              : 'bg-stone-950 text-stone-600 border-stone-800'
                          }`}
                        >
                          {c.isActive ? 'ACTIVE' : 'DISABLED'}
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(c.code)}
                          className="p-1.5 bg-stone-900 hover:bg-rose-600 hover:text-white text-stone-400 border border-stone-800 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: NEPAL PROVINCE SHIPPING LOGISTICS */}
          {/* ========================================================================= */}
          {activeAdminTab === 'shipping' && (
            <div className="space-y-6">
              <div className="bg-stone-950 p-5 border border-stone-800">
                <div className="mb-4">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400">
                    NATIONAL DISTRIBUTION
                  </span>
                  <h2 className="text-base font-black uppercase tracking-wider text-white mt-0.5">
                    NEPAL 7-PROVINCE LOGISTICS & TARIFFS
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5 font-light">
                    Standard courier rates and delivery timelines across all seven provinces of Nepal.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {NEPAL_PROVINCES.map((prov) => (
                    <div
                      key={prov.id}
                      className="bg-stone-900/60 p-4 border border-stone-800 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-white text-xs uppercase tracking-wider">
                          PROVINCE #{prov.id}: {prov.name}
                        </div>
                        <div className="font-mono font-bold text-white text-xs">
                          Rs. {prov.deliveryFee}
                        </div>
                      </div>
                      <div className="text-[11px] text-stone-400">
                        Transit Time: <span className="text-white">{prov.estimatedDays}</span>
                      </div>
                      <div className="text-[10px] text-stone-500 leading-normal">
                        Districts Covered: {prov.districts.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: STORE SETTINGS */}
          {/* ========================================================================= */}
          {activeAdminTab === 'settings' && (
            <div className="bg-stone-950 p-6 border border-stone-800 space-y-6">
              <div className="pb-4 border-b border-stone-800">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400">
                  SYSTEM PREFERENCES
                </span>
                <h2 className="text-base font-black uppercase tracking-wider text-white mt-0.5">
                  STORE SETTINGS & LOGISTICS POLICY
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                    STORE TITLE
                  </label>
                  <input
                    type="text"
                    value={storeSettings.storeName}
                    onChange={(e) =>
                      setStoreSettings({ ...storeSettings, storeName: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                    OPERATIONS DISPATCH EMAIL
                  </label>
                  <input
                    type="email"
                    value={storeSettings.email}
                    onChange={(e) =>
                      setStoreSettings({ ...storeSettings, email: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                    SUPPORT & WAREHOUSE PHONE
                  </label>
                  <input
                    type="text"
                    value={storeSettings.phone}
                    onChange={(e) =>
                      setStoreSettings({ ...storeSettings, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                    FREE SHIPPING THRESHOLD (NPR)
                  </label>
                  <input
                    type="number"
                    value={storeSettings.freeShippingThreshold}
                    onChange={(e) =>
                      setStoreSettings({
                        ...storeSettings,
                        freeShippingThreshold: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-white font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                    WAREHOUSE / STORE PICKUP ADDRESS
                  </label>
                  <input
                    type="text"
                    value={storeSettings.address}
                    onChange={(e) =>
                      setStoreSettings({ ...storeSettings, address: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem(
                      'geartrade_store_settings',
                      JSON.stringify(storeSettings)
                    );
                    showAdminToast('Store settings saved successfully!');
                  }}
                  className="px-6 py-2 bg-white hover:bg-stone-200 text-black text-xs font-black uppercase tracking-wider cursor-pointer shadow"
                >
                  SAVE STORE SETTINGS
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: ADMIN ACCESS WHITELIST */}
          {/* ========================================================================= */}
          {activeAdminTab === 'admins' && (
            <div className="space-y-6">
              <div className="bg-stone-950 p-6 border border-stone-800">
                <div className="pb-4 border-b border-stone-800 mb-6">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400">
                    ACCESS CONTROL
                  </span>
                  <h2 className="text-base font-black uppercase tracking-wider text-white mt-0.5">
                    AUTHORIZED ADMIN EMAIL WHITELIST
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5 font-light">
                    Google OAuth accounts authorized to access the Admin Hub and manage orders.
                  </p>
                </div>

                {/* Add new admin form */}
                <form
                  onSubmit={handleAddNewAdmin}
                  className="p-4 bg-stone-900/60 border border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
                >
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                      GOOGLE ACCOUNT EMAIL
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="OPERATOR@GMAIL.COM"
                      value={newAdminEmailInput}
                      onChange={(e) => setNewAdminEmailInput(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 text-white text-xs font-mono lowercase"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                      OPERATOR ROLE / NOTE
                    </label>
                    <input
                      type="text"
                      placeholder="E.G. LOGISTICS LEAD"
                      value={newAdminNoteInput}
                      onChange={(e) => setNewAdminNoteInput(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-950 border border-stone-800 text-white text-xs uppercase"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 bg-white hover:bg-stone-200 text-black text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      + AUTHORIZE ADMIN
                    </button>
                  </div>
                </form>

                {/* Admin list */}
                <div className="divide-y divide-stone-800 border border-stone-800">
                  {adminWhitelist.map((adm) => (
                    <div
                      key={adm.email}
                      className="p-3.5 bg-stone-900/40 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-stone-900 border border-stone-800 flex items-center justify-center font-mono font-bold text-xs text-white">
                          {adm.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-mono font-bold text-xs text-white">
                            {adm.email}
                          </div>
                          <div className="text-[10px] text-stone-500 font-mono">
                            Role: {adm.note || 'Admin'} • Added: {adm.addedAt}
                          </div>
                        </div>
                      </div>

                      {adm.email !== 'admin@geartrade.com.np' && (
                        <button
                          onClick={() => setAdminEmailToRevoke(adm.email)}
                          className="px-2.5 py-1 text-rose-400 hover:text-white hover:bg-rose-950 text-xs font-bold uppercase tracking-wider border border-rose-900/50 cursor-pointer"
                        >
                          REVOKE
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Google OAuth Production Settings */}
              <div className="bg-stone-950 p-6 border border-stone-800 space-y-4">
                <div className="pb-4 border-b border-stone-800">
                  <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-stone-400">
                    AUTHENTICATION INFRASTRUCTURE
                  </span>
                  <h2 className="text-base font-black uppercase tracking-wider text-white mt-0.5 flex items-center gap-2">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>GOOGLE OAUTH 2.0 PRODUCTION CLIENT ID</span>
                  </h2>
                  <p className="text-xs text-stone-400 mt-0.5 font-light">
                    Connect your Google Cloud OAuth Client ID for live popup authentication with real Google accounts.
                  </p>
                </div>

                <div className="p-3.5 bg-stone-900/60 border border-stone-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">
                      Authorized JavaScript Origin URL
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (typeof navigator !== 'undefined') {
                          navigator.clipboard.writeText(window.location.origin);
                          setCopiedOriginInAdmin(true);
                          setTimeout(() => setCopiedOriginInAdmin(false), 2500);
                        }
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 bg-white text-black text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      {copiedOriginInAdmin ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedOriginInAdmin ? 'Copied' : 'Copy URL'}</span>
                    </button>
                  </div>
                  <div className="p-2 bg-stone-950 border border-stone-800 font-mono text-xs text-stone-300 select-all break-all">
                    {typeof window !== 'undefined' ? window.location.origin : ''}
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    saveGoogleClientId(adminClientIdInput);
                    showAdminToast(
                      adminClientIdInput.trim()
                        ? 'Google OAuth Client ID saved successfully!'
                        : 'Google OAuth Client ID removed.'
                    );
                  }}
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1 tracking-wider">
                      GOOGLE CLIENT ID (FROM GOOGLE CLOUD CONSOLE)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1234567890-abcdefg.apps.googleusercontent.com"
                      value={adminClientIdInput}
                      onChange={(e) => setAdminClientIdInput(e.target.value)}
                      className="w-full px-3 py-2 bg-stone-900 border border-stone-800 text-white text-xs font-mono"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-white hover:bg-stone-200 text-black text-xs font-black uppercase tracking-wider cursor-pointer"
                    >
                      SAVE GOOGLE CLIENT ID
                    </button>
                    {adminClientIdInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setAdminClientIdInput('');
                          saveGoogleClientId('');
                          showAdminToast('Google Client ID cleared.');
                        }}
                        className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-400 text-xs font-bold uppercase tracking-wider border border-stone-800 cursor-pointer"
                      >
                        CLEAR
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* IN-APP MODALS */}
      {/* ========================================================================= */}

      {/* 1. Single Product Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(productToDelete)}
        product={productToDelete}
        onConfirm={handleConfirmDeleteProduct}
        onCancel={() => setProductToDelete(null)}
        title="Confirm Product Deletion"
        description="Permanently delete this product from the store catalog and warehouse inventory? This cannot be undone."
      />

      {/* 2. Bulk Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isBulkDeleteOpen}
        bulkCount={selectedProductIds.length}
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setIsBulkDeleteOpen(false)}
        title="Confirm Bulk Deletion"
        description={`Are you sure you want to permanently delete all ${selectedProductIds.length} selected products?`}
      />

      {/* 3. Reset Factory Defaults Confirmation Modal */}
      {isResetDefaultsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-stone-950 border border-stone-800 text-white w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <RotateCcw className="w-5 h-5" />
              <h3 className="text-base font-black uppercase tracking-wider text-white">
                RESTORE FACTORY CATALOG
              </h3>
            </div>
            <p className="text-xs text-stone-300 font-light leading-relaxed">
              This will restore all original default products, prices, and stock levels. Any custom products added will be removed.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsResetDefaultsModalOpen(false)}
                className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetDefaults();
                  setIsResetDefaultsModalOpen(false);
                  showAdminToast('Restored original factory catalog');
                }}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                YES, RESTORE DEFAULTS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Revoke Admin Confirmation Modal */}
      {adminEmailToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
          <div className="bg-stone-950 border border-stone-800 text-white w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3 text-rose-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-base font-black uppercase tracking-wider text-white">
                REVOKE ADMIN ACCESS
              </h3>
            </div>
            <p className="text-xs text-stone-300 font-light leading-relaxed">
              Revoke administrative access for <span className="font-mono text-white font-bold">{adminEmailToRevoke}</span>? They will no longer be able to enter the Admin Hub.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setAdminEmailToRevoke(null)}
                className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleConfirmRevokeAdmin}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                REVOKE ACCESS
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. Courier Dispatch & Waybill Assignment Modal */}
      <CourierDispatchModal
        isOpen={Boolean(selectedOrderForCourier)}
        order={selectedOrderForCourier}
        onClose={() => setSelectedOrderForCourier(null)}
        onSaveLogistics={handleSaveLogisticsFromModal}
      />

      {/* 6. Printable Dispatch Slip & Air Waybill Modal */}
      <DispatchSlipModal
        isOpen={Boolean(orderToPrint)}
        order={orderToPrint}
        onClose={() => setOrderToPrint(null)}
      />
    </div>
  );
};

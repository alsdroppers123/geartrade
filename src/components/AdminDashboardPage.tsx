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
  Key,
  UserPlus,
  UserCheck,
  ShieldAlert,
  LogOut,
  Mail
} from 'lucide-react';
import { Product, ProductCategory, ProductColor, ProductSection, Order, Coupon, StoreSettings, AuthUser, AdminWhitelistEntry } from '../types';
import { formatNPR } from '../services/fonepayService';
import { INITIAL_PRODUCTS } from '../data/products';
import { NEPAL_PROVINCES } from '../data/nepalLocations';
import { getAdminWhitelist, addAdminEmail, removeAdminEmail } from '../services/authService';
import { AdminAccessGate } from './AdminAccessGate';

interface AdminDashboardPageProps {
  products: Product[];
  orders: Order[];
  onSaveProduct: (product: Product) => void;
  onCreateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onResetDefaults: () => void;
  onUpdateOrderStatus: (orderId: string, status: Order['orderStatus'], paymentStatus?: Order['paymentStatus']) => void;
  onBackToStore: () => void;
  editingProductId?: string | null;
  currentUser?: AuthUser | null;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
}

const CATEGORY_OPTIONS: { id: ProductCategory; label: string }[] = [
  { id: 'mens', label: "Men's Apparel" },
  { id: 'womens', label: "Women's Apparel" },
  { id: 'kids', label: "Kids' Collection" },
  { id: 'bags_gears', label: "Bags & Technical Gears" },
  { id: 'shoes', label: "Footwear & Trail Shoes" },
  { id: 'accessories', label: "Accessories & Tools" },
];

const SECTION_OPTIONS: { id: ProductSection; label: string; desc: string }[] = [
  { id: 'hero_showcase', label: 'Top Hero / Spotlight Showcase', desc: 'Pinned to the top carousel & primary attention area' },
  { id: 'trending_now', label: 'Featured Trending / High Demand', desc: 'Appears in priority High-Altitude & Trending section' },
  { id: 'flash_sale', label: 'Special Clearance / Deal of the Day', desc: 'Featured with hot flame discount highlight' },
  { id: 'regular_catalog', label: 'Main Category Grid', desc: 'Standard placement in category filters and search' },
  { id: 'hidden', label: 'Draft / Hidden (Archived)', desc: 'Hidden from customer storefront, visible only to admin' },
];

const PRESET_SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
];

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({
  products,
  orders,
  onSaveProduct,
  onCreateProduct,
  onDeleteProduct,
  onResetDefaults,
  onUpdateOrderStatus,
  onBackToStore,
  editingProductId,
  currentUser = null,
  onOpenLoginModal = () => {},
  onLogout = () => {},
}) => {
  // Navigation tabs for full admin suite
  const [activeAdminTab, setActiveAdminTab] = useState<
    'merchandising' | 'products' | 'editor' | 'orders' | 'coupons' | 'shipping' | 'settings' | 'admins' | 'analytics'
  >(editingProductId ? 'editor' : 'merchandising');

  // Admin Access Whitelist State
  const [adminWhitelist, setAdminWhitelist] = useState<AdminWhitelistEntry[]>(() => getAdminWhitelist());
  const [newAdminEmailInput, setNewAdminEmailInput] = useState('');
  const [newAdminNoteInput, setNewAdminNoteInput] = useState('');

  // Product & Merchandising State
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

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
  const [newColorHex, setNewColorHex] = useState('#102A45');
  const [newSize, setNewSize] = useState('');

  // Orders Tab Filter
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');

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
      announcementText: '🏔️ Nationwide Delivery across all 7 Provinces | 100% Genuine Himalayan Expedition Tested',
      isMaintenanceMode: false,
    };
  });

  // Save changes feedback
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
  const handleRemoveAdminEmail = (email: string) => {
    if (!window.confirm(`Are you sure you want to revoke admin permissions for ${email}?`)) return;
    const res = removeAdminEmail(email);
    if (res.success) {
      setAdminWhitelist(res.list);
      showAdminToast(res.message);
    } else {
      showAdminToast(res.message);
    }
  };

  // Admin Access Security Check
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
    showAdminToast(`Updated placement for "${prod.name}" to ${section.replace('_', ' ').toUpperCase()}`);
  };

  // Quick Priority Change
  const handlePriorityChange = (productId: string, delta: number) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const currentPriority = prod.displayPriority ?? 50;
    const newPriority = Math.max(1, currentPriority + delta);
    const updated = { ...prod, displayPriority: newPriority };
    onSaveProduct(updated);
    showAdminToast(`Priority updated for "${prod.name}" (Priority: ${newPriority})`);
  };

  // Quick Home Toggle
  const handleToggleHomeFeatured = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const updated = { ...prod, featuredOnHome: !prod.featuredOnHome };
    onSaveProduct(updated);
    showAdminToast(`${updated.featuredOnHome ? 'Pinned to' : 'Removed from'} Home Showcase`);
  };

  // Quick In-Stock Toggle
  const handleToggleStock = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const updated = { ...prod, inStock: !prod.inStock };
    onSaveProduct(updated);
    showAdminToast(`Stock status updated for ${prod.name}`);
  };

  // Start Editing
  const handleStartEdit = (product: Product) => {
    setFormProduct(JSON.parse(JSON.stringify(product)));
    setIsCreatingNew(false);
    setActiveAdminTab('editor');
  };

  // Start Creating
  const handleStartCreate = () => {
    const newId = `gt-${Date.now()}`;
    const newProd: Product = {
      id: newId,
      name: 'New Alpine Gear',
      nepaliName: 'नयाँ उच्च हिमाली गियर',
      styleCode: `GT-${Math.floor(100 + Math.random() * 900)}`,
      price: 4500,
      originalPrice: 5500,
      category: 'mens',
      subcategory: 'Jackets',
      collection: 'Himalayan Expedition',
      origin: 'Kathmandu, Nepal',
      originNepali: 'काठमाडौँ, नेपाल',
      inStock: true,
      stockCount: 25,
      rating: 4.9,
      reviewCount: 1,
      images: [PRESET_SAMPLE_IMAGES[0]],
      colors: [
        { name: 'Obsidian Navy', hex: '#102A45' },
        { name: 'Everest Red', hex: '#DE4B56' },
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      description: 'Engineered for high altitude expeditions, extreme weather resilience, and all-season alpine versatility.',
      descriptionNepali: 'उच्च हिमाली आरोहण र कडा मौसमका लागि विशेष डिजाइन गरिएको उत्कृष्ट गियर।',
      craftStory: 'Tested by veteran Sherpa mountain guides across Annapurna and Khumbu regions.',
      features: [
        '3-Layer Technical Weatherproof Fabric',
        'YKK Aquaguard Zippers with Storm Flaps',
        'Reinforced Cordura High-Abrasion Zones',
      ],
      specifications: {
        Material: 'Durable Ripstop 3-Ply GORE Grade',
        'Waterproof Rating': '20,000mm Hydrostatic Head',
        Weight: '520 grams',
        Warranty: '2-Year Expedition Repair Warranty',
      },
      weight: '520g',
      tags: ['Alpine', 'Waterproof', 'Expedition', 'New'],
      badge: 'New Arrival',
      isNewArrival: true,
      isBestSeller: false,
      isTrending: true,
      displaySection: 'regular_catalog',
      displayPriority: 50,
      featuredOnHome: true,
      costPrice: 2800,
      supplier: 'GEARTRADE Technical Workshop Kathmandu',
    };
    setFormProduct(newProd);
    setIsCreatingNew(true);
    setActiveAdminTab('editor');
  };

  // Save Form Product
  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProduct) return;
    if (isCreatingNew) {
      onCreateProduct(formProduct);
      showAdminToast(`Successfully created "${formProduct.name}"!`);
    } else {
      onSaveProduct(formProduct);
      showAdminToast(`Saved changes for "${formProduct.name}"!`);
    }
    setActiveAdminTab('merchandising');
  };

  // Add Coupon
  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;
    const newC: Coupon = {
      code: newCouponCode.trim().toUpperCase(),
      discountType: newCouponType,
      discountValue: Number(newCouponValue),
      minSpend: Number(newCouponMin),
      description: newCouponDesc.trim() || 'Store Promotion',
      isActive: true,
      usageCount: 0,
    };
    const updated = [newC, ...coupons];
    setCoupons(updated);
    localStorage.setItem('geartrade_coupons', JSON.stringify(updated));
    setNewCouponCode('');
    setNewCouponDesc('');
    showAdminToast(`Coupon ${newC.code} added!`);
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
    showAdminToast(`Coupon ${code} removed.`);
  };

  // Save Store Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('geartrade_store_settings', JSON.stringify(storeSettings));
    showAdminToast('Store settings saved successfully!');
  };

  // Calculate Metrics
  const totalCatalogCount = products.length;
  const totalStockUnits = products.reduce((acc, p) => acc + (p.stockCount || 0), 0);
  const outOfStockCount = products.filter((p) => !p.inStock || p.stockCount === 0).length;
  const lowStockCount = products.filter((p) => p.inStock && p.stockCount > 0 && p.stockCount <= 5).length;
  const heroShowcaseCount = products.filter((p) => p.displaySection === 'hero_showcase').length;
  const trendingCount = products.filter((p) => p.displaySection === 'trending_now' || p.isTrending).length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Filtered Products for Merchandising / Catalog View
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.styleCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.category.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

    const matchesSection =
      sectionFilter === 'all' ||
      (sectionFilter === 'hero_showcase' && p.displaySection === 'hero_showcase') ||
      (sectionFilter === 'trending_now' && (p.displaySection === 'trending_now' || p.isTrending)) ||
      (sectionFilter === 'flash_sale' && (p.displaySection === 'flash_sale' || (p.originalPrice && p.originalPrice > p.price))) ||
      (sectionFilter === 'featured_home' && p.featuredOnHome) ||
      (sectionFilter === 'hidden' && p.displaySection === 'hidden');

    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'low' && p.stockCount > 0 && p.stockCount <= 5) ||
      (stockFilter === 'out' && (!p.inStock || p.stockCount === 0));

    return matchesSearch && matchesCategory && matchesSection && matchesStock;
  }).sort((a, b) => (a.displayPriority ?? 50) - (b.displayPriority ?? 50));

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'all' || o.orderStatus === orderStatusFilter;
    const matchesQuery =
      o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.customer.phone.includes(orderSearchQuery) ||
      o.customer.district.toLowerCase().includes(orderSearchQuery.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 bg-[#DE4B56] text-white px-5 py-3 rounded-xl shadow-2xl font-bold flex items-center gap-2 animate-bounce border border-white/20">
          <CheckCircle2 className="w-5 h-5" />
          <span>{notification}</span>
        </div>
      )}

      {/* Top Admin Header Bar */}
      <header className="bg-slate-950 border-b border-slate-800 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToStore}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all font-semibold text-xs border border-slate-700 cursor-pointer"
            title="Return to Customer Storefront"
          >
            <ArrowLeft className="w-4 h-4 text-[#F5A623]" />
            <span>← Back to Customer Store</span>
          </button>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <span>GEARTRADE</span>
                <span className="text-[#DE4B56] text-xs bg-[#DE4B56]/20 px-2 py-0.5 rounded-md border border-[#DE4B56]/40 uppercase tracking-wider font-extrabold">
                  Admin Command Hub
                </span>
              </h1>
            </div>
            <p className="text-[11px] text-slate-400">
              Complete Store Merchandising, Section Placement, Inventory & Order Management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleStartCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#DE4B56] hover:bg-[#c83e49] text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset all catalog data to original factory defaults?')) {
                onResetDefaults();
                showAdminToast('Restored original factory catalog');
              }
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium border border-slate-700 cursor-pointer"
            title="Reset Catalog to Initial Sample"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Reset Defaults</span>
          </button>
        </div>
      </header>

      {/* Main Admin Body with Left Navigation Bar & Content Area */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Sidebar Menu */}
        <aside className="w-full md:w-64 bg-slate-950/80 border-r border-slate-800 p-4 shrink-0 flex flex-row md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1 hidden md:block">
            Merchandising & Store
          </div>

          <button
            onClick={() => setActiveAdminTab('merchandising')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
              activeAdminTab === 'merchandising'
                ? 'bg-[#102A45] text-white border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-[#F5A623]" />
            <span>Product Placement & Order</span>
            <span className="ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300 hidden md:inline">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveAdminTab('products')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
              activeAdminTab === 'products'
                ? 'bg-[#102A45] text-white border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-emerald-400" />
            <span>Inventory & Stock Control</span>
            {outOfStockCount > 0 && (
              <span className="ml-auto text-[10px] bg-red-500/30 text-red-300 px-1.5 py-0.5 rounded font-bold border border-red-500/40">
                {outOfStockCount} Out
              </span>
            )}
          </button>

          <button
            onClick={() => {
              if (!formProduct) handleStartCreate();
              else setActiveAdminTab('editor');
            }}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
              activeAdminTab === 'editor'
                ? 'bg-[#102A45] text-white border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Edit className="w-4 h-4 text-[#DE4B56]" />
            <span>Product & Photo Editor</span>
          </button>

          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1 pt-3 hidden md:block">
            Operations & Logistics
          </div>

          <button
            onClick={() => setActiveAdminTab('orders')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
              activeAdminTab === 'orders'
                ? 'bg-[#102A45] text-white border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-sky-400" />
            <span>Live Customer Orders</span>
            <span className="ml-auto text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.5 rounded font-bold">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveAdminTab('coupons')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
              activeAdminTab === 'coupons'
                ? 'bg-[#102A45] text-white border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Ticket className="w-4 h-4 text-purple-400" />
            <span>Coupons & Flash Discounts</span>
            <span className="ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 hidden md:inline">
              {coupons.length}
            </span>
          </button>

          <button
            onClick={() => setActiveAdminTab('shipping')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
              activeAdminTab === 'shipping'
                ? 'bg-[#102A45] text-white border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Nepal 7-Province Logistics</span>
          </button>

          <button
            onClick={() => setActiveAdminTab('settings')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
              activeAdminTab === 'settings'
                ? 'bg-[#102A45] text-white border border-blue-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Settings className="w-4 h-4 text-slate-300" />
            <span>Store & Tax Settings</span>
          </button>

          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-3 py-1 pt-3 hidden md:block">
            Access Control
          </div>

          <button
            onClick={() => setActiveAdminTab('admins')}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all text-left whitespace-nowrap cursor-pointer ${
              activeAdminTab === 'admins'
                ? 'bg-[#102A45] text-white border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Admin Whitelist & Permissions</span>
            <span className="ml-auto text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
              {adminWhitelist.length}
            </span>
          </button>

          <div className="mt-auto pt-4 hidden md:block">
            <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400">
              <div className="font-bold text-slate-200 mb-1 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>Live Store Sync</span>
              </div>
              <p>Changes take immediate effect across customer storefront & checkout.</p>
            </div>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {/* Top Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mb-6">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                <span>Active Products</span>
                <Package className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-2xl font-black text-white">{totalCatalogCount}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{totalStockUnits} physical units in stock</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                <span>Hero & Trending Showcases</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-2xl font-black text-amber-400">
                {heroShowcaseCount + trendingCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Top spotlight & high demand items</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                <span>Total Orders</span>
                <ShoppingCart className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-emerald-400">{orders.length}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">Revenue: {formatNPR(totalRevenue)}</div>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-1">
                <span>Inventory Alerts</span>
                <AlertTriangle className="w-4 h-4 text-[#DE4B56]" />
              </div>
              <div className="text-2xl font-black text-[#DE4B56]">
                {outOfStockCount + lowStockCount}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {outOfStockCount} out of stock, {lowStockCount} low
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: MERCHANDISING & PRODUCT PLACEMENT CONTROL */}
          {/* ========================================================================= */}
          {activeAdminTab === 'merchandising' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <Layers className="w-5 h-5 text-[#F5A623]" />
                      <span>Product Placement & Visual Merchandising</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Control where each product displays on the home page (Hero Slider, Trending Grid, Flash Deals, or Standard Catalog) and adjust display priority order.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleStartCreate}
                      className="px-3 py-1.5 bg-[#DE4B56] hover:bg-[#c83e49] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Product</span>
                    </button>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search by name, style code (e.g. GT-JKT-882)..."
                      value={searchFilter}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All Categories</option>
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
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="all">All Display Sections</option>
                      <option value="hero_showcase">Top Hero Showcase Pinned</option>
                      <option value="trending_now">Trending / High Demand Pinned</option>
                      <option value="flash_sale">Flash Sale / Clearance Highlight</option>
                      <option value="featured_home">Featured on Home Page</option>
                      <option value="hidden">Hidden / Draft Items</option>
                    </select>
                  </div>
                </div>

                {/* Products Table with Direct Placement Controls */}
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Item & Style Code</th>
                        <th className="py-3 px-3">Category</th>
                        <th className="py-3 px-3">Price (NPR)</th>
                        <th className="py-3 px-3">Storefront Display Section</th>
                        <th className="py-3 px-3 text-center">Priority / Order</th>
                        <th className="py-3 px-3 text-center">Home Pinned</th>
                        <th className="py-3 px-3 text-center">Stock</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-slate-500">
                            No products match the selected filters.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => {
                          const currentSection = p.displaySection || (p.isTrending ? 'trending_now' : 'regular_catalog');
                          return (
                            <tr key={p.id} className="hover:bg-slate-900/60 transition-colors">
                              {/* Product Info */}
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={p.images[0] || PRESET_SAMPLE_IMAGES[0]}
                                    alt={p.name}
                                    className="w-12 h-12 rounded-lg object-cover bg-slate-800 border border-slate-700 shrink-0"
                                  />
                                  <div>
                                    <div className="font-bold text-white text-xs hover:text-blue-400 transition-colors">
                                      {p.name}
                                    </div>
                                    <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                                      <span className="font-mono text-[#F5A623]">{p.styleCode}</span>
                                      <span>•</span>
                                      <span>{p.origin}</span>
                                    </div>
                                  </div>
                                </div>
                              </td>

                              {/* Category */}
                              <td className="py-3 px-3">
                                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-[11px] font-medium uppercase">
                                  {p.category.replace('_', ' ')}
                                </span>
                              </td>

                              {/* Price */}
                              <td className="py-3 px-3">
                                <div className="font-bold text-emerald-400">{formatNPR(p.price)}</div>
                                {p.originalPrice && p.originalPrice > p.price && (
                                  <div className="text-[10px] text-slate-500 line-through">
                                    {formatNPR(p.originalPrice)}
                                  </div>
                                )}
                              </td>

                              {/* Section Placement Selector */}
                              <td className="py-3 px-3">
                                <select
                                  value={currentSection}
                                  onChange={(e) => handleQuickSectionChange(p.id, e.target.value as ProductSection)}
                                  className="px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-semibold text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
                                >
                                  <option value="hero_showcase">🏔️ Top Hero Spotlight</option>
                                  <option value="trending_now">🔥 Trending / High Demand</option>
                                  <option value="flash_sale">⚡ Flash Deal Highlight</option>
                                  <option value="regular_catalog">📦 Standard Catalog</option>
                                  <option value="hidden">🚫 Hidden / Draft</option>
                                </select>
                              </td>

                              {/* Display Priority Up / Down */}
                              <td className="py-3 px-3 text-center">
                                <div className="inline-flex items-center gap-1 bg-slate-900 border border-slate-700 px-2 py-1 rounded-lg">
                                  <button
                                    onClick={() => handlePriorityChange(p.id, -5)}
                                    className="p-1 hover:text-white text-slate-400 transition-colors"
                                    title="Show Earlier (Higher Priority)"
                                  >
                                    <ArrowUp className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="font-mono text-[11px] font-bold text-amber-400 min-w-[24px] text-center">
                                    {p.displayPriority ?? 50}
                                  </span>
                                  <button
                                    onClick={() => handlePriorityChange(p.id, 5)}
                                    className="p-1 hover:text-white text-slate-400 transition-colors"
                                    title="Show Later (Lower Priority)"
                                  >
                                    <ArrowDown className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>

                              {/* Home Pinned */}
                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={() => handleToggleHomeFeatured(p.id)}
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    p.featuredOnHome !== false
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                      : 'bg-slate-800 text-slate-500'
                                  }`}
                                  title={p.featuredOnHome !== false ? 'Featured on Home' : 'Not on Home'}
                                >
                                  <Star className="w-4 h-4 fill-current" />
                                </button>
                              </td>

                              {/* Stock */}
                              <td className="py-3 px-3 text-center">
                                <button
                                  onClick={() => handleToggleStock(p.id)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                                    p.inStock && p.stockCount > 0
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                      : 'bg-red-500/20 text-red-300 border border-red-500/40'
                                  }`}
                                >
                                  {p.inStock && p.stockCount > 0 ? `${p.stockCount} In Stock` : 'Out of Stock'}
                                </button>
                              </td>

                              {/* Actions */}
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleStartEdit(p)}
                                    className="p-1.5 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                                    title="Edit Details, Photos & Specs"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Delete product "${p.name}" from inventory?`)) {
                                        onDeleteProduct(p.id);
                                        showAdminToast(`Deleted ${p.name}`);
                                      }
                                    }}
                                    className="p-1.5 bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white rounded-lg transition-colors cursor-pointer"
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
          {/* TAB 2: INVENTORY & STOCK CONTROL */}
          {/* ========================================================================= */}
          {activeAdminTab === 'products' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <Package className="w-5 h-5 text-emerald-400" />
                      <span>Inventory & Stock Management</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Monitor SKU stock counts, cost prices, profit margins, and reorder levels.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setStockFilter(stockFilter === 'low' ? 'all' : 'low')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        stockFilter === 'low'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      Low Stock (≤5)
                    </button>
                    <button
                      onClick={() => setStockFilter(stockFilter === 'out' ? 'all' : 'out')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        stockFilter === 'out'
                          ? 'bg-red-500/20 text-red-300 border-red-500'
                          : 'bg-slate-900 text-slate-300 border-slate-800'
                      }`}
                    >
                      Out of Stock
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Item & Code</th>
                        <th className="py-3 px-3">Units in Stock</th>
                        <th className="py-3 px-3">Retail Price</th>
                        <th className="py-3 px-3">Est. Cost Price</th>
                        <th className="py-3 px-3">Gross Margin</th>
                        <th className="py-3 px-3">Supplier / Workshop</th>
                        <th className="py-3 px-4 text-right">Stock Update</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {products.map((p) => {
                        const cost = p.costPrice || Math.round(p.price * 0.6);
                        const margin = Math.round(((p.price - cost) / p.price) * 100);
                        return (
                          <tr key={p.id} className="hover:bg-slate-900/60">
                            <td className="py-3 px-4">
                              <div className="font-bold text-white">{p.name}</div>
                              <div className="text-[11px] text-slate-400 font-mono">{p.styleCode}</div>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2.5 py-1 rounded-md font-bold text-xs ${
                                  p.stockCount <= 0
                                    ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                    : p.stockCount <= 5
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                }`}
                              >
                                {p.stockCount} Units
                              </span>
                            </td>
                            <td className="py-3 px-3 font-bold text-white">{formatNPR(p.price)}</td>
                            <td className="py-3 px-3 text-slate-400">{formatNPR(cost)}</td>
                            <td className="py-3 px-3">
                              <span className="text-emerald-400 font-bold">{margin}% Margin</span>
                            </td>
                            <td className="py-3 px-3 text-slate-400">{p.supplier || 'GEARTRADE Kathmandu Factory'}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    const updated = {
                                      ...p,
                                      stockCount: Math.max(0, p.stockCount - 5),
                                      inStock: Math.max(0, p.stockCount - 5) > 0,
                                    };
                                    onSaveProduct(updated);
                                    showAdminToast(`Stock reduced for ${p.name}`);
                                  }}
                                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 text-xs font-bold"
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
                                  className="px-2 py-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded text-xs font-bold"
                                >
                                  +10 Units
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
          {/* TAB 3: PRODUCT & PHOTO EDITOR */}
          {/* ========================================================================= */}
          {activeAdminTab === 'editor' && formProduct && (
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                <div>
                  <h2 className="text-lg font-black text-white flex items-center gap-2">
                    <Edit className="w-5 h-5 text-[#DE4B56]" />
                    <span>{isCreatingNew ? 'Create New Technical Product' : `Editing: ${formProduct.name}`}</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customize high-resolution photos, NPR pricing, colors, size chart, and specs.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveAdminTab('merchandising')}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveForm}
                    className="px-4 py-1.5 bg-[#DE4B56] hover:bg-[#c83e49] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-6 text-xs">
                {/* 1. Basic Info */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4">
                  <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <Package className="w-4 h-4 text-[#F5A623]" />
                    <span>1. Basic Product Information</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-slate-400 font-semibold mb-1">Product Title</label>
                      <input
                        type="text"
                        value={formProduct.name}
                        onChange={(e) => setFormProduct({ ...formProduct, name: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Style SKU Code</label>
                      <input
                        type="text"
                        value={formProduct.styleCode}
                        onChange={(e) => setFormProduct({ ...formProduct, styleCode: e.target.value })}
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-mono font-bold focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Primary Category</label>
                      <select
                        value={formProduct.category}
                        onChange={(e) => setFormProduct({ ...formProduct, category: e.target.value as ProductCategory })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      >
                        {CATEGORY_OPTIONS.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Selling Price (NPR)</label>
                      <input
                        type="number"
                        value={formProduct.price}
                        onChange={(e) => setFormProduct({ ...formProduct, price: Number(e.target.value) })}
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-bold focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Original Price (Strikethrough)</label>
                      <input
                        type="number"
                        value={formProduct.originalPrice || ''}
                        onChange={(e) => setFormProduct({ ...formProduct, originalPrice: Number(e.target.value) || undefined })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-blue-500"
                        placeholder="e.g. 6500"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Photo Gallery & Images */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4">
                  <div className="font-bold text-slate-200 text-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-sky-400" />
                      <span>2. Product Photos & Media Gallery ({formProduct.images.length} photos)</span>
                    </div>
                  </div>

                  {/* Thumbnail Previews */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                    {formProduct.images.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-950 aspect-square">
                        <img src={img} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = formProduct.images.filter((_, i) => i !== idx);
                              setFormProduct({ ...formProduct, images: updated });
                            }}
                            className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                            title="Remove Photo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {idx === 0 && (
                          <span className="absolute top-1.5 left-1.5 bg-blue-600 text-[9px] font-black text-white px-1.5 py-0.5 rounded">
                            COVER
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Image URL Input */}
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder="Paste high-res image URL (e.g. Unsplash or Cloudflare URL)..."
                      value={newImageUrl}
                      onChange={(e) => setNewImageUrl(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newImageUrl.trim()) return;
                        setFormProduct({ ...formProduct, images: [...formProduct.images, newImageUrl.trim()] });
                        setNewImageUrl('');
                      }}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold cursor-pointer"
                    >
                      Add Photo
                    </button>
                  </div>
                </div>

                {/* 3. Section Placement & Merchandising Settings */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4">
                  <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#F5A623]" />
                    <span>3. Storefront Placement & Merchandising Rules</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Target Display Section</label>
                      <select
                        value={formProduct.displaySection || 'regular_catalog'}
                        onChange={(e) => setFormProduct({ ...formProduct, displaySection: e.target.value as ProductSection })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-bold focus:outline-none focus:border-blue-500"
                      >
                        {SECTION_OPTIONS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Display Priority (1 = Top)</label>
                      <input
                        type="number"
                        value={formProduct.displayPriority ?? 50}
                        onChange={(e) => setFormProduct({ ...formProduct, displayPriority: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-amber-400 font-bold focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Custom Ribbon Badge</label>
                      <input
                        type="text"
                        value={formProduct.badge || ''}
                        onChange={(e) => setFormProduct({ ...formProduct, badge: e.target.value })}
                        placeholder="e.g. 20% OFF, SHERPA CHOICE"
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-6 pt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formProduct.featuredOnHome !== false}
                        onChange={(e) => setFormProduct({ ...formProduct, featuredOnHome: e.target.checked })}
                        className="w-4 h-4 rounded text-blue-600"
                      />
                      <span className="text-slate-300 font-semibold">Feature on Home Page Grid</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formProduct.isTrending}
                        onChange={(e) => setFormProduct({ ...formProduct, isTrending: e.target.checked })}
                        className="w-4 h-4 rounded text-amber-500"
                      />
                      <span className="text-slate-300 font-semibold">Highlight in "Trending Now"</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formProduct.inStock}
                        onChange={(e) => setFormProduct({ ...formProduct, inStock: e.target.checked })}
                        className="w-4 h-4 rounded text-emerald-500"
                      />
                      <span className="text-slate-300 font-semibold">Currently In Stock & Available for Order</span>
                    </label>
                  </div>
                </div>

                {/* 4. Description & Story */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-4">
                  <div className="font-bold text-slate-200 text-sm flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>4. Description & Craft Story</span>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Product Description</label>
                    <textarea
                      rows={3}
                      value={formProduct.description}
                      onChange={(e) => setFormProduct({ ...formProduct, description: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Submit Bar */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveAdminTab('merchandising')}
                    className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-[#DE4B56] hover:bg-[#c83e49] text-white rounded-xl font-bold shadow-lg flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save & Publish Product</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: ORDERS MANAGEMENT */}
          {/* ========================================================================= */}
          {activeAdminTab === 'orders' && (
            <div className="space-y-6">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-sky-400" />
                      <span>Customer Orders & Fonepay / COD Tracking</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Process shipments, update tracking statuses, and confirm payment settlements.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200"
                    >
                      <option value="all">All Order Statuses</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing & Packaged</option>
                      <option value="shipped">Shipped to Courier</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900 text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-3 px-4">Order ID & Date</th>
                        <th className="py-3 px-3">Customer & Location</th>
                        <th className="py-3 px-3">Ordered Items</th>
                        <th className="py-3 px-3">Payment</th>
                        <th className="py-3 px-3">Total Amount</th>
                        <th className="py-3 px-3">Status</th>
                        <th className="py-3 px-4 text-right">Update Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-8 text-center text-slate-500">
                            No orders found. When customers order through checkout, they appear here.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((o) => (
                          <tr key={o.id} className="hover:bg-slate-900/60">
                            <td className="py-3 px-4">
                              <div className="font-mono font-bold text-white">{o.id}</div>
                              <div className="text-[11px] text-slate-500">{o.date}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-200">{o.customer.fullName}</div>
                              <div className="text-[11px] text-slate-400">{o.customer.phone}</div>
                              <div className="text-[11px] text-slate-500">{o.customer.district}, {o.customer.provinceName}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="text-slate-300">
                                {o.items.map((item, i) => (
                                  <div key={i} className="text-[11px]">
                                    {item.quantity}x {item.product.name} ({item.selectedSize || 'Standard'})
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  o.paymentMethod.startsWith('fonepay')
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                }`}
                              >
                                {o.paymentMethod.toUpperCase()} ({o.paymentStatus})
                              </span>
                            </td>
                            <td className="py-3 px-3 font-bold text-emerald-400">{formatNPR(o.totalAmount)}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-[10px] font-bold uppercase">
                                {o.orderStatus}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <select
                                value={o.orderStatus}
                                onChange={(e) => {
                                  onUpdateOrderStatus(o.id, e.target.value as Order['orderStatus']);
                                  showAdminToast(`Updated order #${o.id} status to ${e.target.value}`);
                                }}
                                className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200"
                              >
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="out_for_delivery">Out for Delivery</option>
                                <option value="delivered">Delivered</option>
                              </select>
                            </td>
                          </tr>
                        ))
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
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h2 className="text-lg font-black text-white flex items-center gap-2 mb-4">
                  <Ticket className="w-5 h-5 text-purple-400" />
                  <span>Promotional Coupon Codes & Festival Vouchers</span>
                </h2>

                {/* Add Coupon Form */}
                <form onSubmit={handleAddCoupon} className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 bg-slate-900 rounded-xl border border-slate-800 mb-6">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Coupon Code</label>
                    <input
                      type="text"
                      placeholder="e.g. EVEREST20"
                      value={newCouponCode}
                      onChange={(e) => setNewCouponCode(e.target.value)}
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Discount Type</label>
                    <select
                      value={newCouponType}
                      onChange={(e) => setNewCouponType(e.target.value as 'flat' | 'percentage')}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    >
                      <option value="flat">Flat NPR Amount</option>
                      <option value="percentage">Percentage (%)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Value (Rs / %)</label>
                    <input
                      type="number"
                      value={newCouponValue}
                      onChange={(e) => setNewCouponValue(Number(e.target.value))}
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-emerald-400 font-bold text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Min Spend (NPR)</label>
                    <input
                      type="number"
                      value={newCouponMin}
                      onChange={(e) => setNewCouponMin(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs cursor-pointer shadow-md"
                    >
                      + Add Coupon
                    </button>
                  </div>
                </form>

                {/* Coupons List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {coupons.map((c) => (
                    <div key={c.code} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-amber-400 text-sm">{c.code}</span>
                          <span className="px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-[10px] font-bold">
                            {c.discountType === 'flat' ? `Rs. ${c.discountValue} OFF` : `${c.discountValue}% OFF`}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{c.description}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">Min Order: {formatNPR(c.minSpend || 0)} • Used {c.usageCount} times</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleCoupon(c.code)}
                          className={`px-2.5 py-1 rounded text-xs font-bold ${
                            c.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-500'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Disabled'}
                        </button>
                        <button
                          onClick={() => handleDeleteCoupon(c.code)}
                          className="p-1.5 bg-red-600/20 text-red-300 hover:bg-red-600 hover:text-white rounded"
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
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h2 className="text-lg font-black text-white flex items-center gap-2 mb-2">
                  <Truck className="w-5 h-5 text-amber-400" />
                  <span>Nepal 7-Province Logistics & Courier Rates</span>
                </h2>
                <p className="text-xs text-slate-400 mb-6">
                  Standard delivery charges, estimated transit durations, and major hubs across all 7 Federal Provinces of Nepal.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {NEPAL_PROVINCES.map((prov) => (
                    <div key={prov.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-white text-sm">
                          Province #{prov.id}: {prov.name}
                        </div>
                        <div className="font-bold text-emerald-400 text-sm">Rs. {prov.deliveryFee}</div>
                      </div>
                      <div className="text-xs text-amber-400/90 font-medium">{prov.nepaliName}</div>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Transit Time: {prov.estimatedDays}</span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Major Hubs: {prov.districts.slice(0, 4).join(', ')}...
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
            <div className="space-y-6">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                <h2 className="text-lg font-black text-white flex items-center gap-2 mb-4">
                  <Settings className="w-5 h-5 text-slate-300" />
                  <span>Store Profile & Fiscal Settings</span>
                </h2>

                <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Store Name</label>
                      <input
                        type="text"
                        value={storeSettings.storeName}
                        onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">VAT / PAN Registration Number</label>
                      <input
                        type="text"
                        value={storeSettings.vatNumber}
                        onChange={(e) => setStoreSettings({ ...storeSettings, vatNumber: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-amber-400 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Support Phone</label>
                      <input
                        type="text"
                        value={storeSettings.phone}
                        onChange={(e) => setStoreSettings({ ...storeSettings, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-semibold mb-1">Support Email</label>
                      <input
                        type="email"
                        value={storeSettings.email}
                        onChange={(e) => setStoreSettings({ ...storeSettings, email: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Top Announcement Marquee Banner</label>
                    <input
                      type="text"
                      value={storeSettings.announcementText}
                      onChange={(e) => setStoreSettings({ ...storeSettings, announcementText: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2 bg-[#DE4B56] hover:bg-[#c83e49] text-white rounded-xl font-bold cursor-pointer"
                    >
                      Save Store Settings
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: ADMIN ACCESS WHITELIST & GOOGLE PERMISSIONS */}
          {/* ========================================================================= */}
          {activeAdminTab === 'admins' && (
            <div className="space-y-6">
              {/* Active Admin Session Card */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
                  <div className="flex items-center gap-4">
                    {currentUser?.picture ? (
                      <img
                        src={currentUser.picture}
                        alt={currentUser.name}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/50 shadow-md"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400 font-black text-xl">
                        {currentUser?.name?.charAt(0) || 'A'}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-black text-white">{currentUser?.name}</h2>
                        <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/40 uppercase tracking-wider">
                          Active Administrator
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">{currentUser?.email}</p>
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span>Session Authenticated via Google Sign-In</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={onOpenLoginModal}
                      className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors cursor-pointer"
                    >
                      Switch Account
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        onBackToStore();
                      }}
                      className="px-3.5 py-2 bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 text-xs font-bold rounded-xl border border-rose-800/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>

                {/* Add New Authorized Admin Form */}
                <div className="pt-6">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
                    <UserPlus className="w-4 h-4 text-emerald-400" />
                    <span>Authorize New Admin Google Account</span>
                  </h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Grant full product catalog editing, price modification, order management, and coupon control to team members by their Google email.
                  </p>

                  <form onSubmit={handleAddNewAdmin} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-6">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Google Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          placeholder="e.g. colleague@pcampus.edu.np or partner@gmail.com"
                          value={newAdminEmailInput}
                          onChange={(e) => setNewAdminEmailInput(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                        Role / Department Note
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Inventory Manager, Logistics"
                        value={newAdminNoteInput}
                        onChange={(e) => setNewAdminNoteInput(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-end">
                      <button
                        type="submit"
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Authorize</span>
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Whitelisted Admins List */}
              <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span>Authorized Admin Accounts ({adminWhitelist.length})</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Only these exact Google emails are permitted to enter and perform operations in the GEARTRADE Command Hub.
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-slate-800/80">
                  {adminWhitelist.map((entry) => {
                    const isCurrentUser = currentUser?.email.toLowerCase() === entry.email.toLowerCase();
                    const isMaster = entry.isMaster || entry.email.toLowerCase() === '080bas004.abhishek@pcampus.edu.np';

                    return (
                      <div
                        key={entry.email}
                        className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${
                              isMaster
                                ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {entry.email.substring(0, 2).toUpperCase()}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white font-mono">{entry.email}</span>
                              {isMaster && (
                                <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                                  Master Admin
                                </span>
                              )}
                              {isCurrentUser && (
                                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                              <span>{entry.note || 'Authorized Administrator'}</span>
                              <span className="text-slate-600">•</span>
                              <span className="text-[11px] text-slate-500">Added: {entry.addedAt}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          {isMaster ? (
                            <span className="text-[11px] text-slate-500 font-semibold px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                              Permanent Root
                            </span>
                          ) : (
                            <button
                              onClick={() => handleRemoveAdminEmail(entry.email)}
                              className="px-3 py-1.5 bg-rose-950/30 hover:bg-rose-900/60 text-rose-300 hover:text-white rounded-xl text-xs font-semibold border border-rose-800/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Revoke Access</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

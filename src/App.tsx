import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryTiles } from './components/CategoryTiles';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { StoreLocatorModal } from './components/StoreLocatorModal';
import { AdminDashboardPage } from './components/AdminDashboardPage';
import { GoogleAuthModal } from './components/GoogleAuthModal';
import { Footer } from './components/Footer';

import { INITIAL_PRODUCTS } from './data/products';
import { CartItem, Order, Product, ProductCategory, ProductSection, AuthUser } from './types';
import { POPULAR_COUPONS } from './data/nepalLocations';
import { getCurrentUser, saveUserSession, clearUserSession } from './services/authService';
import { SlidersHorizontal, Filter, CheckCircle2, Heart, X, Flame, Sparkle, Trophy, Sliders, ArrowRight } from 'lucide-react';

export default function App() {
  // Navigation View State: 'store' vs 'admin'
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');

  // User Authentication State (Google Sign-In)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Global State with Local Persistence for Products & Logistics
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('geartrade_products');
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeBadgeFilter, setActiveBadgeFilter] = useState<'all' | 'new' | 'bestseller' | 'trending'>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price_low' | 'price_high' | 'rating'>('featured');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Cart & Wishlist State with local persistence
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('geartrade_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('geartrade_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedProvinceId, setSelectedProvinceId] = useState<number>(3); // Bagmati by default
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>('DASHAIN500');

  // Modals State
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isTrackerOpen, setIsTrackerOpen] = useState(false);
  const [isStoreLocatorOpen, setIsStoreLocatorOpen] = useState(false);
  const [isWishlistDrawerOpen, setIsWishlistDrawerOpen] = useState(false);
  const [targetTrackingId, setTargetTrackingId] = useState<string | undefined>(undefined);

  // Admin Editing Target
  const [editingProductIdForAdmin, setEditingProductIdForAdmin] = useState<string | null>(null);

  // Orders history
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('geartrade_orders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Google Login & Session Management
  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    saveUserSession(user);
    setIsLoginModalOpen(false);
    if (user.isAdmin) {
      showToast(`Welcome Admin ${user.name}!`);
    } else {
      showToast(`Welcome ${user.name}!`);
    }
  };

  const handleLogout = () => {
    clearUserSession();
    setCurrentUser(null);
    showToast('Signed out of Google session');
  };

  // Sync with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('geartrade_products', JSON.stringify(products));
    } catch {}
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('geartrade_cart', JSON.stringify(cartItems));
    } catch {}
  }, [cartItems]);

  useEffect(() => {
    try {
      localStorage.setItem('geartrade_wishlist', JSON.stringify(wishlist));
    } catch {}
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('geartrade_orders', JSON.stringify(orders));
    } catch {}
  }, [orders]);

  // Admin Product Operations
  const handleSaveProduct = (updatedProduct: Product) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    // If currently selected product in detail modal was updated, keep it in sync
    if (selectedProduct && selectedProduct.id === updatedProduct.id) {
      setSelectedProduct(updatedProduct);
    }
    showToast(`Saved ${updatedProduct.name.slice(0, 22)}...`);
  };

  const handleCreateProduct = (newProduct: Product) => {
    setProducts((prev) => [newProduct, ...prev]);
    showToast(`Created ${newProduct.name.slice(0, 22)}...`);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(null);
    }
    showToast('Product deleted from inventory');
  };

  const handleResetDefaults = () => {
    setProducts(INITIAL_PRODUCTS);
    localStorage.removeItem('geartrade_products');
    showToast('Restored original factory catalog');
  };

  const handleUpdateOrderStatus = (orderId: string, status: Order['orderStatus'], paymentStatus?: Order['paymentStatus']) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              orderStatus: status,
              paymentStatus: paymentStatus || ord.paymentStatus,
              trackingUpdates: [
                {
                  id: `trk-${Date.now()}`,
                  status: status === 'delivered' ? 'Delivered' : status === 'shipped' ? 'Dispatched' : 'Processing Update',
                  timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                  location: 'Kathmandu Logistics Hub',
                  description: `Order marked as ${status.toUpperCase()} by Operations Manager`,
                  completed: true,
                },
                ...ord.trackingUpdates,
              ],
            }
          : ord
      )
    );
    showToast(`Order ${orderId} updated to ${status}`);
  };

  const handleOpenAdminWithProduct = (productId: string) => {
    setEditingProductIdForAdmin(productId);
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart Operations
  const handleAddToCart = (product: Product, quantity = 1, selectedColor?: string, selectedSize?: string) => {
    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor === selectedColor &&
          item.selectedSize === selectedSize
      );

      if (existingIdx > -1) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          quantity: Math.min(product.stockCount, updated[existingIdx].quantity + quantity),
        };
        return updated;
      }
      return [...prev, { product, quantity, selectedColor, selectedSize }];
    });
    showToast(`Added ${product.name.slice(0, 24)}... to bag!`);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Express Buy action
  const handleExpressBuy = (product: Product, quantity = 1, selectedColor?: string, selectedSize?: string) => {
    setCartItems([{ product, quantity, selectedColor, selectedSize }]);
    setIsCheckoutOpen(true);
  };

  // Wishlist toggle
  const handleToggleWishlist = (product: Product) => {
    setWishlist((prev) => {
      const exists = prev.includes(product.id);
      if (exists) {
        showToast(`Removed from Wishlist`);
        return prev.filter((id) => id !== product.id);
      } else {
        showToast(`Saved to Wishlist`);
        return [...prev, product.id];
      }
    });
  };

  // Coupon handling
  const handleApplyCoupon = (code: string) => {
    const upper = code.trim().toUpperCase();
    if (POPULAR_COUPONS[upper]) {
      setAppliedCoupon(upper);
      showToast(`Coupon ${upper} applied!`);
    } else {
      showToast(`Invalid coupon code`);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    showToast(`Coupon removed`);
  };

  // Checkout Completion
  const handleOrderComplete = (order: Order) => {
    setOrders((prev) => [order, ...prev]);
    setCartItems([]);
    setIsCheckoutOpen(false);
    setCompletedOrder(order);
  };

  const handleTrackOrderFromSuccess = (orderId: string) => {
    setCompletedOrder(null);
    setTargetTrackingId(orderId);
    setIsTrackerOpen(true);
  };

  // Merchandising Sections from Admin Configuration
  const flashSaleProducts = useMemo(() => {
    return products
      .filter((p) => (p.displaySection === 'flash_sale' || p.displaySection === 'trending_grid') && p.displaySection !== 'hidden')
      .sort((a, b) => (b.displayPriority || 0) - (a.displayPriority || 0));
  }, [products]);

  const heroShowcaseProducts = useMemo(() => {
    return products.filter((p) => p.displaySection === 'hero_showcase');
  }, [products]);

  // Filtered and Sorted Products for Catalog
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Exclude products explicitly hidden by admin
        if (p.displaySection === 'hidden') return false;

        // Category Filter
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

        // Search Filter
        const matchesSearch =
          searchQuery === '' ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.nepaliName.includes(searchQuery) ||
          p.styleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.brand.toLowerCase().includes(searchQuery.toLowerCase());

        // Badge Filter
        let matchesBadge = true;
        if (activeBadgeFilter === 'new') matchesBadge = !!p.isNewArrival;
        if (activeBadgeFilter === 'bestseller') matchesBadge = !!p.isBestSeller;
        if (activeBadgeFilter === 'trending') matchesBadge = p.rating >= 4.7;

        // Stock Filter
        const matchesStock = !inStockOnly || p.inStock;

        return matchesCategory && matchesSearch && matchesBadge && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === 'price_low') return a.price - b.price;
        if (sortBy === 'price_high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        // Default sort respects admin displayPriority if set
        return (b.displayPriority || 0) - (a.displayPriority || 0);
      });
  }, [products, selectedCategory, searchQuery, activeBadgeFilter, inStockOnly, sortBy]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // If Admin View is active, render the dedicated Admin Dashboard Page!
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-slate-900 font-sans text-slate-100 selection:bg-[#DE4B56] selection:text-white">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-[#102A45] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-slideUp">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <AdminDashboardPage
          products={products}
          orders={orders}
          onSaveProduct={handleSaveProduct}
          onCreateProduct={handleCreateProduct}
          onDeleteProduct={handleDeleteProduct}
          onResetDefaults={handleResetDefaults}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onBackToStore={() => {
            setCurrentView('store');
            setEditingProductIdForAdmin(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          editingProductId={editingProductIdForAdmin}
          currentUser={currentUser}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] font-sans text-stone-900 selection:bg-[#DE4B56] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#102A45] text-white text-xs font-semibold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-slideUp">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistDrawerOpen(true)}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenStoreLocator={() => setIsStoreLocatorOpen(true)}
        onOpenAdmin={() => {
          setEditingProductIdForAdmin(null);
          setCurrentView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Hero Banner with Slider */}
      <HeroBanner
        onExplore={() => {
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        featuredProducts={heroShowcaseProducts}
      />

      {/* 5 Shop-by-Category Visual Tiles */}
      <CategoryTiles
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Admin Featured / Flash Sale Showcase Section (if active) */}
      {flashSaleProducts.length > 0 && selectedCategory === 'all' && searchQuery === '' && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 w-full">
          <div className="bg-gradient-to-r from-[#102A45] via-[#1b3d63] to-[#102A45] rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-700/50 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DE4B56] text-white text-[10px] font-black uppercase tracking-wider">
                    <Flame className="w-3 h-3 fill-white" />
                    Admin Curated Showcase
                  </span>
                  <span className="text-amber-400 text-xs font-bold">Fast-Moving Stock</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
                  Featured Expedition Specials & Top Picks
                </h2>
                <p className="text-xs text-slate-300">
                  Hand-selected technical gear configured via the Admin Merchandising Engine.
                </p>
              </div>

              <button
                onClick={() => {
                  const el = document.getElementById('catalog-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="self-start sm:self-auto px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer backdrop-blur-xs border border-white/20"
              >
                <span>View Full Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 relative z-10">
              {flashSaleProducts.slice(0, 4).map((product) => (
                <div key={product.id} className="bg-white rounded-2xl p-2 text-stone-900 shadow-md">
                  <ProductCard
                    product={product}
                    isWishlisted={wishlist.includes(product.id)}
                    onToggleWishlist={handleToggleWishlist}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onQuickView={(p) => setSelectedProduct(p)}
                    onExpressBuy={(p) => handleExpressBuy(p, 1)}
                    onEditProduct={(p) => handleOpenAdminWithProduct(p.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Product Catalog Section */}
      <main id="catalog-section" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Section Heading, Badge Tabs, and Sorting Filters */}
        <div className="flex flex-col gap-5 pb-5 border-b border-stone-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase text-[#DE4B56] tracking-wider">
                  Authentic Technical Gear
                </span>
                <span className="bg-stone-200 text-[#102A45] text-xs font-bold px-2 py-0.5 rounded-full">
                  {filteredProducts.length} items
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#102A45] uppercase tracking-tight mt-1">
                {selectedCategory === 'all'
                  ? 'All Outdoor Collections'
                  : selectedCategory === 'mens'
                  ? "Men's Apparel & Layers"
                  : selectedCategory === 'womens'
                  ? "Women's Mountain Gear"
                  : selectedCategory === 'kids'
                  ? "Junior & Kids Outdoor"
                  : selectedCategory === 'bags_gears'
                  ? 'Trek Backpacks & Camping'
                  : 'Trail & Hiking Footwear'}
              </h2>
            </div>

            {/* Quick Badge Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setActiveBadgeFilter('all')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  activeBadgeFilter === 'all'
                    ? 'bg-[#102A45] text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
                }`}
              >
                All Gear
              </button>
              <button
                onClick={() => setActiveBadgeFilter('bestseller')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeBadgeFilter === 'bestseller'
                    ? 'bg-[#102A45] text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>Best Seller</span>
              </button>
              <button
                onClick={() => setActiveBadgeFilter('new')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeBadgeFilter === 'new'
                    ? 'bg-[#102A45] text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
                }`}
              >
                <Sparkle className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>New Arrival</span>
              </button>
              <button
                onClick={() => setActiveBadgeFilter('trending')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeBadgeFilter === 'trending'
                    ? 'bg-[#102A45] text-white shadow-xs'
                    : 'bg-white text-stone-700 border border-stone-200 hover:border-stone-400'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-[#F5A623]" />
                <span>Trending</span>
              </button>
            </div>
          </div>

          {/* Secondary Filter & Sort Strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-stone-500 font-medium">Category:</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'mens', label: "Men's" },
                  { id: 'womens', label: "Women's" },
                  { id: 'kids', label: 'Kids' },
                  { id: 'bags_gears', label: 'Bags & Gears' },
                  { id: 'shoes', label: 'Shoes' },
                ].map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCategory(c.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      selectedCategory === c.id
                        ? 'bg-stone-200 text-[#102A45]'
                        : 'text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort & In-Stock */}
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 bg-white border border-stone-200 rounded-xl px-3 py-1.5 shadow-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-stone-500" />
                <label htmlFor="sort-select" className="text-stone-500 font-medium">Sort:</label>
                <select
                  id="sort-select"
                  aria-label="Sort products by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-transparent font-bold text-stone-800 focus:outline-none cursor-pointer"
                >
                  <option value="featured">Featured Collection</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="price_high">Price: High to Low</option>
                  <option value="rating">Highest Customer Rating</option>
                </select>
              </div>

              <button
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`px-3 py-1.5 rounded-xl border font-bold transition-colors cursor-pointer ${
                  inStockOnly
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {inStockOnly ? '✓ In Stock' : 'All Availability'}
              </button>
            </div>
          </div>
        </div>

        {/* Product Cards Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <Filter className="w-8 h-8" />
            </div>
            <p className="text-stone-800 font-bold text-base">No matching GEARTRADE products found</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Try adjusting your search terms or clearing the active category and badge filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setActiveBadgeFilter('all');
                setInStockOnly(false);
              }}
              className="px-5 py-2.5 bg-[#102A45] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pt-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlist.includes(product.id)}
                onToggleWishlist={handleToggleWishlist}
                onAddToCart={(p) => handleAddToCart(p, 1)}
                onQuickView={(p) => setSelectedProduct(p)}
                onExpressBuy={(p) => handleExpressBuy(p, 1)}
                onEditProduct={(p) => handleOpenAdminWithProduct(p.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Wishlist Drawer */}
      {isWishlistDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-xs flex justify-end animate-fadeIn font-sans">
          <div
            className="w-full max-w-md bg-white text-stone-900 h-full flex flex-col shadow-2xl border-l border-stone-200 animate-slideLeft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-stone-200 flex items-center justify-between bg-[#102A45] text-white">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-[#DE4B56] fill-[#DE4B56]" />
                <h3 className="font-extrabold text-sm uppercase tracking-wider">
                  Saved Wishlist ({wishlist.length})
                </h3>
              </div>
              <button
                onClick={() => setIsWishlistDrawerOpen(false)}
                className="p-1.5 text-stone-300 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {wishlist.length === 0 ? (
                <div className="text-center py-16 space-y-2 text-stone-500 text-xs">
                  <p className="font-bold text-stone-700">Your wishlist is currently empty.</p>
                  <p>Click the heart icon on any gear to bookmark for later.</p>
                </div>
              ) : (
                products
                  .filter((p) => wishlist.includes(p.id))
                  .map((p) => (
                    <div
                      key={p.id}
                      className="border border-stone-200 rounded-2xl p-3 flex gap-3 items-center justify-between bg-stone-50 hover:border-[#102A45]/30 transition-all"
                    >
                      <img src={p.images[0]} alt={p.name} className="w-14 h-14 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono text-[#102A45] font-bold block">{p.styleCode}</span>
                        <p className="text-xs font-bold text-stone-900 truncate">{p.name}</p>
                        <p className="text-xs font-black text-[#102A45]">रू {p.price}</p>
                      </div>
                      <button
                        onClick={() => {
                          handleAddToCart(p, 1);
                          setIsWishlistDrawerOpen(false);
                          setIsCartOpen(true);
                        }}
                        className="px-3 py-1.5 bg-[#102A45] text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
                      >
                        Add to Bag
                      </button>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isWishlisted={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
        onClose={() => setSelectedProduct(null)}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onExpressBuy={handleExpressBuy}
        onEditProduct={(p) => handleOpenAdminWithProduct(p.id)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={() => setCartItems([])}
        selectedProvinceId={selectedProvinceId}
        onSelectProvince={setSelectedProvinceId}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={handleApplyCoupon}
        onRemoveCoupon={handleRemoveCoupon}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        selectedProvinceId={selectedProvinceId}
        appliedCoupon={appliedCoupon}
        onOrderComplete={handleOrderComplete}
      />

      {/* Order Success & IRD Tax Invoice Modal */}
      <OrderSuccessModal
        order={completedOrder}
        onClose={() => setCompletedOrder(null)}
        onTrackOrder={handleTrackOrderFromSuccess}
      />

      {/* Order Tracker Modal */}
      <OrderTrackerModal
        isOpen={isTrackerOpen}
        onClose={() => {
          setIsTrackerOpen(false);
          setTargetTrackingId(undefined);
        }}
        orders={orders}
        targetOrderId={targetTrackingId}
      />

      {/* Physical Store Outlets Modal */}
      <StoreLocatorModal
        isOpen={isStoreLocatorOpen}
        onClose={() => setIsStoreLocatorOpen(false)}
      />

      {/* Google Authentication Sign-In Modal */}
      <GoogleAuthModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Global Footer */}
      <Footer
        onSelectCategory={(cat: ProductCategory) => {
          setSelectedCategory(cat);
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenStoreLocator={() => setIsStoreLocatorOpen(true)}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenWishlist={() => setIsWishlistDrawerOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={() => {
          setEditingProductIdForAdmin(null);
          setCurrentView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

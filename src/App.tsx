import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner, DEFAULT_HERO_SLIDES } from './components/HeroBanner';
import { CategoryTiles, DEFAULT_CATEGORY_CARDS } from './components/CategoryTiles';
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
import { CartItem, Order, Product, ProductCategory, ProductSection, AuthUser, HeroSlideItem, CategoryTileItem } from './types';
import { POPULAR_COUPONS } from './data/nepalLocations';
import { getCurrentUser, saveUserSession, clearUserSession } from './services/authService';
import { SlidersHorizontal, Filter, CheckCircle2, Heart, X, Flame, Sparkle, Trophy, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

export default function App() {
  // Navigation View State: 'store' vs 'admin'
  const [currentView, setCurrentView] = useState<'store' | 'admin'>('store');
  const [adminInitialTab, setAdminInitialTab] = useState<'merchandising' | 'products' | 'visuals' | 'editor' | 'orders' | 'coupons' | 'shipping' | 'settings' | 'admins'>('merchandising');

  // User Authentication State (Google Sign-In)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentUser());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Storefront Visual Assets State (Hero Carousel & Category Tiles)
  const [heroSlides, setHeroSlides] = useState<HeroSlideItem[]>(() => {
    try {
      const saved = localStorage.getItem('geartrade_hero_slides');
      return saved ? JSON.parse(saved) : DEFAULT_HERO_SLIDES;
    } catch {
      return DEFAULT_HERO_SLIDES;
    }
  });

  const [categoryCards, setCategoryCards] = useState<CategoryTileItem[]>(() => {
    try {
      const saved = localStorage.getItem('geartrade_category_cards');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORY_CARDS;
    } catch {
      return DEFAULT_CATEGORY_CARDS;
    }
  });

  // Global State with Local Persistence for Products & Logistics
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('geartrade_products_v2') || localStorage.getItem('geartrade_products');
      if (saved) return JSON.parse(saved);
      return INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [activeBadgeFilter, setActiveBadgeFilter] = useState<'all' | 'new' | 'bestseller' | 'trending'>('new');
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

  // Dark / Light Theme state with local persistence
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('geartrade_theme') || localStorage.getItem('sonam_theme');
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('geartrade_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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
      localStorage.setItem('geartrade_products_v2', JSON.stringify(products));
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

  useEffect(() => {
    try {
      localStorage.setItem('geartrade_hero_slides', JSON.stringify(heroSlides));
    } catch {}
  }, [heroSlides]);

  useEffect(() => {
    try {
      localStorage.setItem('geartrade_category_cards', JSON.stringify(categoryCards));
    } catch {}
  }, [categoryCards]);

  // Admin Storefront Visual Handlers
  const handleUpdateHeroSlides = (updated: HeroSlideItem[]) => {
    setHeroSlides(updated);
  };

  const handleUpdateCategoryCards = (updated: CategoryTileItem[]) => {
    setCategoryCards(updated);
  };

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
    setHeroSlides(DEFAULT_HERO_SLIDES);
    setCategoryCards(DEFAULT_CATEGORY_CARDS);
    localStorage.removeItem('geartrade_products');
    localStorage.removeItem('geartrade_products_v2');
    localStorage.removeItem('geartrade_hero_slides');
    localStorage.removeItem('geartrade_category_cards');
    showToast('Restored all factory catalog photos and lookbook presets');
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
                ...(ord.trackingUpdates || []),
              ],
            }
          : ord
      )
    );
    showToast(`Order ${orderId} updated to ${status}`);
  };

  const handleUpdateFullOrder = (updatedOrder: Order) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === updatedOrder.id ? updatedOrder : ord))
    );
    showToast(`Order ${updatedOrder.id} updated`);
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
      return { success: true, message: `Coupon ${upper} applied successfully!` };
    } else {
      showToast(`Invalid coupon code`);
      return { success: false, message: 'Invalid or expired promo code.' };
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

        // Subcategory Filter (e.g. from Mega Menu)
        let matchesSubcategory = true;
        if (selectedSubcategory) {
          const subLower = selectedSubcategory.toLowerCase();
          matchesSubcategory =
            (p.subcategory && p.subcategory.toLowerCase().includes(subLower)) ||
            (p.name && p.name.toLowerCase().includes(subLower)) ||
            (p.tags && p.tags.some((t) => t.toLowerCase().includes(subLower)));
        }

        // Search Filter
        const matchesSearch =
          searchQuery === '' ||
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.nepaliName.includes(searchQuery) ||
          p.styleCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()));

        // Badge Filter
        let matchesBadge = true;
        if (activeBadgeFilter === 'new') matchesBadge = !!p.isNewArrival;
        if (activeBadgeFilter === 'bestseller') matchesBadge = !!p.isBestSeller;
        if (activeBadgeFilter === 'trending') matchesBadge = p.rating >= 4.7;

        // Stock Filter
        const matchesStock = !inStockOnly || p.inStock;

        return matchesCategory && matchesSubcategory && matchesSearch && matchesBadge && matchesStock;
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
      <div className="min-h-screen bg-black font-sans text-stone-100 selection:bg-white selection:text-black">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white text-xs font-semibold px-4 py-3 border border-stone-700 flex items-center gap-2 animate-slideUp">
            <CheckCircle2 className="w-4 h-4 text-red-500" />
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
          onUpdateFullOrder={handleUpdateFullOrder}
          onBackToStore={() => {
            setCurrentView('store');
            setEditingProductIdForAdmin(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          editingProductId={editingProductIdForAdmin}
          currentUser={currentUser}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onLogout={handleLogout}
          heroSlides={heroSlides}
          onUpdateHeroSlides={handleUpdateHeroSlides}
          categoryCards={categoryCards}
          onUpdateCategoryCards={handleUpdateCategoryCards}
          initialTab={adminInitialTab}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA] dark:bg-black font-sans text-stone-900 dark:text-stone-100 selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-black dark:bg-stone-900 text-white text-xs font-semibold px-4 py-3 border border-stone-700 flex items-center gap-2 animate-slideUp shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-red-500" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setSelectedSubcategory(null);
        }}
        selectedCategory={selectedCategory as ProductCategory}
        onSelectCategory={(cat, subcat) => {
          setSelectedCategory(cat);
          setSelectedSubcategory(subcat || null);
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={() => setIsWishlistDrawerOpen(true)}
        onOpenTracker={() => setIsTrackerOpen(true)}
        onOpenStoreLocator={() => setIsStoreLocatorOpen(true)}
        onOpenAdmin={() => {
          setEditingProductIdForAdmin(null);
          setAdminInitialTab('merchandising');
          setCurrentView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        currentUser={currentUser}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Main Hero Banner with Slider */}
      <HeroBanner
        onExplore={() => {
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedSubcategory(null);
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        featuredProducts={heroShowcaseProducts}
        customSlides={heroSlides}
        isAdmin={Boolean(currentUser?.isAdmin)}
        onOpenVisualStudio={() => {
          setAdminInitialTab('visuals');
          setCurrentView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 5-Column Visual Category Tiles (Men's, Women's, Kids', Bags&Gears, Shoes) */}
      <CategoryTiles
        selectedCategory={selectedCategory as ProductCategory}
        onSelectCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedSubcategory(null);
          const el = document.getElementById('catalog-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        customCards={categoryCards}
        isAdmin={Boolean(currentUser?.isAdmin)}
        onOpenVisualStudio={() => {
          setAdminInitialTab('visuals');
          setCurrentView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Product Catalog Section */}
      <main id="catalog-section" className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 w-full font-sans">
        {/* Active subcategory indicator if selected from Mega Menu */}
        {selectedSubcategory && (
          <div className="mb-4 flex items-center justify-between p-3 bg-stone-50 border border-stone-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-500 uppercase">Filtered by Subcategory:</span>
              <span className="font-black text-[#dc2626] uppercase tracking-wide">{selectedSubcategory}</span>
            </div>
            <button
              onClick={() => setSelectedSubcategory(null)}
              className="text-stone-500 hover:text-black font-semibold uppercase flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filter</span>
            </button>
          </div>
        )}

        {/* Sonam Gear 3-Pill Filter Group (Best Seller | New Arrival | Trending) */}
        <div className="flex items-center justify-center pt-2 pb-8">
          <div className="inline-flex items-center p-1 bg-[#eceff1] rounded-lg border border-stone-200 gap-1 select-none">
            <button
              onClick={() => setActiveBadgeFilter(activeBadgeFilter === 'bestseller' ? 'all' : 'bestseller')}
              className={`px-5 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeBadgeFilter === 'bestseller'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-black'
              }`}
            >
              Best Seller
            </button>
            <button
              onClick={() => setActiveBadgeFilter(activeBadgeFilter === 'new' ? 'all' : 'new')}
              className={`px-5 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeBadgeFilter === 'new'
                  ? 'bg-white text-[#dc2626] shadow-xs font-bold'
                  : 'text-stone-600 hover:text-black'
              }`}
            >
              New Arrival
            </button>
            <button
              onClick={() => setActiveBadgeFilter(activeBadgeFilter === 'trending' ? 'all' : 'trending')}
              className={`px-5 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                activeBadgeFilter === 'trending'
                  ? 'bg-white text-stone-900 shadow-xs font-bold'
                  : 'text-stone-600 hover:text-black'
              }`}
            >
              Trending
            </button>
          </div>
        </div>

        {/* Product Cards Grid with Row Navigation Controls (Matches Screenshot 1) */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-14 h-14 bg-stone-100 flex items-center justify-center mx-auto text-stone-400">
              <Filter className="w-6 h-6" />
            </div>
            <p className="text-stone-900 font-bold text-sm uppercase tracking-wider">No matching products found</p>
            <p className="text-xs text-stone-500 max-w-sm mx-auto font-light">
              Try adjusting your search terms or clearing the active category filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedSubcategory(null);
                setActiveBadgeFilter('all');
                setInStockOnly(false);
              }}
              className="px-5 py-2.5 bg-[#dc2626] hover:bg-[#b91c1c] text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Left Directional Navigation Arrow (Matches Screenshot 1) */}
            <button
              onClick={() => {
                const grid = document.getElementById('sonam-product-grid');
                grid?.scrollBy({ left: -320, behavior: 'smooth' });
              }}
              className="hidden sm:flex absolute -left-4 top-1/3 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-stone-200 text-stone-900 items-center justify-center hover:bg-stone-50 transition-all cursor-pointer"
              aria-label="Previous products"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Directional Navigation Arrow (Matches Screenshot 1) */}
            <button
              onClick={() => {
                const grid = document.getElementById('sonam-product-grid');
                grid?.scrollBy({ left: 320, behavior: 'smooth' });
              }}
              className="hidden sm:flex absolute -right-4 top-1/3 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg border border-stone-200 text-stone-900 items-center justify-center hover:bg-stone-50 transition-all cursor-pointer"
              aria-label="Next products"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Clean 4-Column Product Grid */}
            <div
              id="sonam-product-grid"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
            >
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlist.includes(product.id)}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={(p, color, size) => handleAddToCart(p, 1, color, size)}
                  onQuickView={(p) => setSelectedProduct(p)}
                  onExpressBuy={(p, color, size) => handleExpressBuy(p, 1, color, size)}
                  onEditProduct={(p) => handleOpenAdminWithProduct(p.id)}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Wishlist Drawer */}
      {isWishlistDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/75 backdrop-blur-xs flex justify-end animate-fadeIn font-sans">
          <div
            className="w-full max-w-md bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 h-full flex flex-col shadow-2xl border-l border-stone-200 dark:border-stone-800 animate-slideLeft"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-black dark:text-white" />
                <h3 className="font-black text-xs sm:text-sm uppercase tracking-[0.16em] text-black dark:text-white">
                  SAVED WISHLIST ({wishlist.length})
                </h3>
              </div>
              <button
                onClick={() => setIsWishlistDrawerOpen(false)}
                className="p-1.5 text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {wishlist.length === 0 ? (
                <div className="text-center py-16 space-y-2 text-stone-500 dark:text-stone-400 text-xs">
                  <p className="font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wider">Your wishlist is empty</p>
                  <p className="font-light">Click the bookmark icon on any gear to save for later.</p>
                </div>
              ) : (
                products
                  .filter((p) => wishlist.includes(p.id))
                  .map((p) => (
                    <div
                      key={p.id}
                      className="border border-stone-200 dark:border-stone-800 p-3 flex gap-3 items-center justify-between bg-stone-50 dark:bg-stone-900 hover:border-black dark:hover:border-white transition-all"
                    >
                      <img src={p.images[0]} alt={p.name} className="w-14 h-14 object-cover bg-stone-200 dark:bg-stone-800" />
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 font-bold block">{p.styleCode}</span>
                        <p className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase truncate">{p.name}</p>
                        <p className="text-xs font-black text-black dark:text-white">रू {p.price}</p>
                      </div>
                      <button
                        onClick={() => {
                          handleAddToCart(p, 1);
                          setIsWishlistDrawerOpen(false);
                          setIsCartOpen(true);
                        }}
                        className="px-3 py-1.5 bg-black dark:bg-white text-white dark:text-black font-bold text-xs uppercase tracking-wider cursor-pointer"
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

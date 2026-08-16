import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit,
  Save,
  Image as ImageIcon,
  Package,
  Layers,
  Sparkles,
  AlertTriangle,
  RotateCcw,
  Search,
  Check,
  Eye,
  Sliders,
  Copy,
  Download,
  Upload,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  Tag,
  Palette,
  Ruler
} from 'lucide-react';
import { Product, ProductCategory, ProductColor } from '../types';
import { formatNPR } from '../services/fonepayService';
import { INITIAL_PRODUCTS } from '../data/products';

interface AdminProductManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSaveProduct: (product: Product) => void;
  onCreateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onResetDefaults: () => void;
  onImportProducts?: (products: Product[]) => void;
  editingProductId?: string | null;
}

const CATEGORY_OPTIONS: { id: ProductCategory; label: string }[] = [
  { id: 'mens', label: "Men's Apparel" },
  { id: 'womens', label: "Women's Apparel" },
  { id: 'kids', label: "Kids' Collection" },
  { id: 'bags_gears', label: "Bags & Technical Gears" },
  { id: 'shoes', label: "Footwear & Trail Shoes" },
  { id: 'accessories', label: "Accessories" },
];

const PRESET_SAMPLE_IMAGES = [
  'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1517824806704-9040b037703b?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=800&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80'
];

export const AdminProductManagerModal: React.FC<AdminProductManagerModalProps> = ({
  isOpen,
  onClose,
  products,
  onSaveProduct,
  onCreateProduct,
  onDeleteProduct,
  onResetDefaults,
  onImportProducts,
  editingProductId,
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'editor'>('inventory');
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Currently editing product state
  const [formProduct, setFormProduct] = useState<Product | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  // New photo input field
  const [newImageUrl, setNewImageUrl] = useState('');

  // Feature input
  const [newFeature, setNewFeature] = useState('');

  // Spec input
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');

  // Color input
  const [newColorName, setNewColorName] = useState('');
  const [newColorHex, setNewColorHex] = useState('#102A45');

  // Size input
  const [newSize, setNewSize] = useState('');

  // Success notice
  const [alertNotice, setAlertNotice] = useState<string | null>(null);

  const showAlert = (msg: string) => {
    setAlertNotice(msg);
    setTimeout(() => setAlertNotice(null), 3000);
  };

  // If passed an editingProductId on opening
  React.useEffect(() => {
    if (editingProductId) {
      const prod = products.find((p) => p.id === editingProductId);
      if (prod) {
        setFormProduct(JSON.parse(JSON.stringify(prod)));
        setIsCreatingNew(false);
        setActiveTab('editor');
      }
    }
  }, [editingProductId, products]);

  if (!isOpen) return null;

  // Logistics metrics
  const totalSkuCount = products.length;
  const totalInventoryUnits = products.reduce((acc, p) => acc + (p.stockCount || 0), 0);
  const lowStockCount = products.filter((p) => p.stockCount > 0 && p.stockCount <= 10).length;
  const outOfStockCount = products.filter((p) => p.stockCount <= 0 || !p.inStock).length;

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      searchFilter === '' ||
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.styleCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.id.toLowerCase().includes(searchFilter.toLowerCase());

    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;

    let matchesStock = true;
    if (stockFilter === 'low') matchesStock = p.stockCount > 0 && p.stockCount <= 10;
    if (stockFilter === 'out') matchesStock = p.stockCount <= 0 || !p.inStock;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const handleStartEdit = (product: Product) => {
    setFormProduct(JSON.parse(JSON.stringify(product)));
    setIsCreatingNew(false);
    setActiveTab('editor');
  };

  const handleStartNewProduct = () => {
    const newId = `gt-${Date.now().toString().slice(-6)}`;
    const freshProduct: Product = {
      id: newId,
      name: 'NEW GEARTRADE TECHNICAL ITEM',
      nepaliName: 'नयाँ गियरट्रेड उत्पादन',
      styleCode: `#${Math.floor(1000 + Math.random() * 9000)}`,
      price: 4500,
      originalPrice: 5000,
      category: 'mens',
      subcategory: 'Performance Gear',
      collection: 'Spring Summer 2026 Collection',
      origin: 'Kathmandu, Nepal',
      originNepali: 'काठमाडौँ, नेपाल',
      inStock: true,
      stockCount: 20,
      rating: 4.8,
      reviewCount: 1,
      images: [
        'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80',
      ],
      colors: [
        { name: 'Himalayan Navy', hex: '#102A45' },
        { name: 'Graphite Black', hex: '#262626' },
      ],
      sizes: ['S', 'M', 'L', 'XL'],
      description: 'Engineered for high altitude trails and technical weather protection.',
      descriptionNepali: 'उच्च हिमाली पदयात्रा र मौसम सुरक्षाका लागि तयार गरिएको।',
      craftStory: 'Designed and precision tested in Nepal.',
      features: ['DWR Water-Repellent finish', 'Articulated fit', 'Durable YKK zippers'],
      specifications: {
        'Material': '100% Ripstop Nylon',
        'Fit': 'Athletic Mountain Fit',
        'Weight': '320g',
      },
      weight: '320g',
      tags: ['New', 'Outdoor', 'Nepal'],
      isNewArrival: true,
      isBestSeller: false,
      isTrending: false,
    };

    setFormProduct(freshProduct);
    setIsCreatingNew(true);
    setActiveTab('editor');
  };

  const handleDuplicateProduct = (product: Product) => {
    const duplicate: Product = {
      ...JSON.parse(JSON.stringify(product)),
      id: `gt-${Date.now().toString().slice(-6)}`,
      name: `${product.name} (Copy)`,
      styleCode: `#${Math.floor(1000 + Math.random() * 9000)}`,
      isNewArrival: true,
    };
    onCreateProduct(duplicate);
    showAlert(`Created copy: ${duplicate.name}`);
  };

  const handleSaveCurrentProduct = () => {
    if (!formProduct) return;
    if (!formProduct.name.trim()) {
      alert('Product name is required');
      return;
    }
    if (!formProduct.images || formProduct.images.length === 0) {
      alert('At least one product photo is required');
      return;
    }

    if (isCreatingNew) {
      onCreateProduct(formProduct);
      showAlert(`Created new product: ${formProduct.name}`);
    } else {
      onSaveProduct(formProduct);
      showAlert(`Updated product: ${formProduct.name}`);
    }

    setActiveTab('inventory');
    setFormProduct(null);
  };

  // Stock quick updater
  const handleQuickStockChange = (product: Product, delta: number) => {
    const newStock = Math.max(0, (product.stockCount || 0) + delta);
    const updated: Product = {
      ...product,
      stockCount: newStock,
      inStock: newStock > 0,
    };
    onSaveProduct(updated);
  };

  // Image management
  const handleAddImage = (urlToAdd?: string) => {
    const url = urlToAdd || newImageUrl.trim();
    if (!url || !formProduct) return;
    setFormProduct({
      ...formProduct,
      images: [...formProduct.images, url],
    });
    setNewImageUrl('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (!formProduct) return;
    const updatedImages = formProduct.images.filter((_, idx) => idx !== indexToRemove);
    setFormProduct({
      ...formProduct,
      images: updatedImages.length > 0 ? updatedImages : ['https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80'],
    });
  };

  const handleMoveImageToTop = (indexToMove: number) => {
    if (!formProduct || indexToMove === 0) return;
    const current = [...formProduct.images];
    const item = current.splice(indexToMove, 1)[0];
    current.unshift(item);
    setFormProduct({ ...formProduct, images: current });
  };

  // Color management
  const handleAddColor = () => {
    if (!newColorName.trim() || !formProduct) return;
    setFormProduct({
      ...formProduct,
      colors: [...formProduct.colors, { name: newColorName.trim(), hex: newColorHex }],
    });
    setNewColorName('');
  };

  const handleRemoveColor = (idx: number) => {
    if (!formProduct) return;
    setFormProduct({
      ...formProduct,
      colors: formProduct.colors.filter((_, i) => i !== idx),
    });
  };

  // Size management
  const handleAddSize = () => {
    if (!newSize.trim() || !formProduct) return;
    if (!formProduct.sizes.includes(newSize.trim())) {
      setFormProduct({
        ...formProduct,
        sizes: [...formProduct.sizes, newSize.trim()],
      });
    }
    setNewSize('');
  };

  const handleRemoveSize = (sizeToRemove: string) => {
    if (!formProduct) return;
    setFormProduct({
      ...formProduct,
      sizes: formProduct.sizes.filter((s) => s !== sizeToRemove),
    });
  };

  // Feature management
  const handleAddFeature = () => {
    if (!newFeature.trim() || !formProduct) return;
    setFormProduct({
      ...formProduct,
      features: [...formProduct.features, newFeature.trim()],
    });
    setNewFeature('');
  };

  const handleRemoveFeature = (idx: number) => {
    if (!formProduct) return;
    setFormProduct({
      ...formProduct,
      features: formProduct.features.filter((_, i) => i !== idx),
    });
  };

  // Specification management
  const handleAddSpec = () => {
    if (!newSpecKey.trim() || !newSpecVal.trim() || !formProduct) return;
    setFormProduct({
      ...formProduct,
      specifications: {
        ...formProduct.specifications,
        [newSpecKey.trim()]: newSpecVal.trim(),
      },
    });
    setNewSpecKey('');
    setNewSpecVal('');
  };

  const handleRemoveSpec = (keyToRemove: string) => {
    if (!formProduct) return;
    const nextSpecs = { ...formProduct.specifications };
    delete nextSpecs[keyToRemove];
    setFormProduct({
      ...formProduct,
      specifications: nextSpecs,
    });
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `geartrade_products_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showAlert('Products exported to JSON file');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn font-sans text-stone-900">
      <div
        className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="bg-[#102A45] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#F5A623] border border-white/10">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base tracking-wide uppercase">
                  GEARTRADE Admin & Logistics Hub
                </h2>
                <span className="bg-[#DE4B56] text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin Mode
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Live catalog management, photo updates, stock inventory & pricing controls.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Global Alert Notification */}
        {alertNotice && (
          <div className="bg-emerald-600 text-white text-xs font-bold px-6 py-2 flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>{alertNotice}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="bg-stone-100 border-b border-stone-200 px-6 py-2 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setActiveTab('inventory');
                setFormProduct(null);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'inventory'
                  ? 'bg-white text-[#102A45] shadow-xs border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Inventory & Stock ({products.length})</span>
            </button>

            <button
              onClick={handleStartNewProduct}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'editor' && isCreatingNew
                  ? 'bg-white text-[#102A45] shadow-xs border border-stone-200'
                  : 'bg-[#102A45] text-white hover:bg-[#162B4D]'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add New Product</span>
            </button>

            {activeTab === 'editor' && formProduct && !isCreatingNew && (
              <span className="text-xs font-bold text-stone-500 bg-stone-200/70 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                <Edit className="w-3.5 h-3.5 text-[#102A45]" />
                <span className="truncate max-w-[180px]">Editing: {formProduct.name}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJSON}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Export product catalog to JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>

            <button
              onClick={() => {
                if (confirm('Reset all catalog products back to original factory defaults? Any custom added products will be replaced.')) {
                  onResetDefaults();
                  showAlert('Product catalog reset to defaults');
                }
              }}
              className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              title="Reset to factory catalog"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Defaults</span>
            </button>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: LOGISTICS & INVENTORY TABLE */}
          {activeTab === 'inventory' && (
            <div className="space-y-6">
              {/* Quick Summary Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total SKUs</span>
                  <p className="text-xl font-black text-[#102A45] mt-0.5">{totalSkuCount}</p>
                </div>
                <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5">
                  <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Stock Units</span>
                  <p className="text-xl font-black text-stone-900 mt-0.5">{totalInventoryUnits}</p>
                </div>
                <div className={`border rounded-xl p-3.5 ${lowStockCount > 0 ? 'bg-amber-50/70 border-amber-200' : 'bg-stone-50 border-stone-200'}`}>
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Low Stock (&le;10)</span>
                  <p className="text-xl font-black text-amber-900 mt-0.5">{lowStockCount} items</p>
                </div>
                <div className={`border rounded-xl p-3.5 ${outOfStockCount > 0 ? 'bg-rose-50/70 border-rose-200' : 'bg-stone-50 border-stone-200'}`}>
                  <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Out of Stock</span>
                  <p className="text-xl font-black text-rose-900 mt-0.5">{outOfStockCount} items</p>
                </div>
              </div>

              {/* Filters & Search Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    placeholder="Search by name, SKU #, or ID..."
                    className="w-full bg-white border border-stone-300 text-xs rounded-xl pl-9 pr-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#102A45]"
                  />
                  {searchFilter && (
                    <button
                      onClick={() => setSearchFilter('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                  {/* Category Filter */}
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-white border border-stone-300 text-xs font-semibold text-stone-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#102A45]"
                  >
                    <option value="all">All Categories</option>
                    {CATEGORY_OPTIONS.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </select>

                  {/* Stock Filter */}
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value as any)}
                    className="bg-white border border-stone-300 text-xs font-semibold text-stone-800 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[#102A45]"
                  >
                    <option value="all">All Stock Status</option>
                    <option value="low">Low Stock Only (&le;10)</option>
                    <option value="out">Out of Stock Only</option>
                  </select>
                </div>
              </div>

              {/* Products Table */}
              <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#102A45] text-white uppercase text-[10px] tracking-wider font-bold">
                      <tr>
                        <th className="py-3 px-4">Photo</th>
                        <th className="py-3 px-4">Product & Style Code</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Price (NPR)</th>
                        <th className="py-3 px-4">Stock & Logistics</th>
                        <th className="py-3 px-4">Badges</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 bg-white">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-12 text-center text-stone-500">
                            No products match the selected filters.
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                            {/* Photo Thumbnail */}
                            <td className="py-2.5 px-4">
                              <div className="w-12 h-12 rounded-lg bg-stone-100 border border-stone-200 overflow-hidden shrink-0 relative group">
                                <img
                                  src={p.images[0] || 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&q=80'}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                />
                                <span className="absolute bottom-0 right-0 bg-black/60 text-white text-[9px] px-1 rounded-tl font-mono">
                                  {p.images.length}
                                </span>
                              </div>
                            </td>

                            {/* Name & Code */}
                            <td className="py-2.5 px-4 max-w-[240px]">
                              <span className="font-mono text-[10px] text-[#102A45] font-extrabold block">
                                {p.styleCode}
                              </span>
                              <p className="font-bold text-stone-900 text-xs line-clamp-1">{p.name}</p>
                              <span className="text-[10px] text-stone-500 font-mono">ID: {p.id}</span>
                            </td>

                            {/* Category */}
                            <td className="py-2.5 px-4">
                              <span className="inline-block px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 font-bold text-[10px] uppercase tracking-wider">
                                {p.category.replace('_', ' & ')}
                              </span>
                            </td>

                            {/* Price */}
                            <td className="py-2.5 px-4 font-mono">
                              <span className="font-extrabold text-[#102A45] text-xs">
                                {formatNPR(p.price)}
                              </span>
                              {p.originalPrice && p.originalPrice > p.price && (
                                <span className="text-[10px] text-stone-400 line-through block">
                                  {formatNPR(p.originalPrice)}
                                </span>
                              )}
                            </td>

                            {/* Stock & Quick Adjust */}
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleQuickStockChange(p, -1)}
                                  className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center cursor-pointer"
                                  title="Decrease stock by 1"
                                >
                                  -
                                </button>
                                <span
                                  className={`font-mono font-bold text-xs min-w-[28px] text-center ${
                                    p.stockCount <= 0
                                      ? 'text-rose-600'
                                      : p.stockCount <= 10
                                      ? 'text-amber-600'
                                      : 'text-emerald-700'
                                  }`}
                                >
                                  {p.stockCount}
                                </span>
                                <button
                                  onClick={() => handleQuickStockChange(p, 1)}
                                  className="w-6 h-6 rounded bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center cursor-pointer"
                                  title="Increase stock by 1"
                                >
                                  +
                                </button>

                                <span
                                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                    p.inStock && p.stockCount > 0
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                                  }`}
                                >
                                  {p.inStock && p.stockCount > 0 ? 'Active' : 'Sold Out'}
                                </span>
                              </div>
                            </td>

                            {/* Badges */}
                            <td className="py-2.5 px-4">
                              <div className="flex flex-wrap gap-1">
                                {p.isBestSeller && (
                                  <span className="bg-[#102A45] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                    Best Seller
                                  </span>
                                )}
                                {p.isNewArrival && (
                                  <span className="bg-[#DE4B56] text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                    New
                                  </span>
                                )}
                                {p.isTrending && (
                                  <span className="bg-[#F5A623] text-stone-900 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                    Trending
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-2.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleStartEdit(p)}
                                  className="p-1.5 bg-stone-100 hover:bg-[#102A45] hover:text-white rounded-lg text-stone-700 transition-colors cursor-pointer"
                                  title="Edit Product & Photos"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDuplicateProduct(p)}
                                  className="p-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 transition-colors cursor-pointer"
                                  title="Duplicate as new product"
                                >
                                  <Copy className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                                      onDeleteProduct(p.id);
                                      showAlert(`Deleted ${p.name}`);
                                    }
                                  }}
                                  className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-lg text-rose-600 transition-colors cursor-pointer"
                                  title="Delete product"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
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

          {/* TAB 2: PRODUCT EDITOR (EDIT / CREATE) */}
          {activeTab === 'editor' && formProduct && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="flex items-center justify-between pb-4 border-b border-stone-200">
                <div>
                  <h3 className="font-extrabold text-base text-[#102A45]">
                    {isCreatingNew ? 'Create New GEARTRADE Product' : `Edit Product: ${formProduct.name}`}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Update high-resolution imagery, logistics stock counts, pricing, and mountain specs.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActiveTab('inventory');
                      setFormProduct(null);
                    }}
                    className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleSaveCurrentProduct}
                    className="px-5 py-2 bg-[#102A45] hover:bg-[#162B4D] text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#F5A623]" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>

              {/* 1. PHOTO & MEDIA MANAGEMENT */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-[#102A45]" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-[#102A45]">
                      Product Photos ({formProduct.images.length})
                    </h4>
                  </div>
                  <span className="text-[11px] text-stone-500">
                    First photo is the primary hero image in catalog.
                  </span>
                </div>

                {/* Images Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                  {formProduct.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative rounded-xl overflow-hidden border border-stone-300 bg-white group aspect-square shadow-2xs"
                    >
                      <img src={imgUrl} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <span className="absolute top-1.5 left-1.5 bg-[#102A45] text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                          Primary
                        </span>
                      )}

                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-1">
                        {idx !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleMoveImageToTop(idx)}
                            className="p-1.5 bg-white text-stone-900 rounded-md text-[10px] font-bold hover:bg-stone-200 cursor-pointer"
                            title="Make Primary"
                          >
                            Top
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="p-1.5 bg-rose-600 text-white rounded-md hover:bg-rose-700 cursor-pointer"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Photo by URL */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="url"
                    value={newImageUrl}
                    onChange={(e) => setNewImageUrl(e.target.value)}
                    placeholder="Paste image URL (e.g. https://images.unsplash.com/...)"
                    className="flex-1 bg-white border border-stone-300 text-xs rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#102A45]"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddImage()}
                    className="px-4 py-2 bg-[#102A45] text-white text-xs font-bold rounded-xl hover:bg-[#162B4D] cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Photo</span>
                  </button>
                </div>

                {/* Quick Presets for Outdoor Gear */}
                <div className="pt-2 border-t border-stone-200">
                  <span className="text-[11px] font-bold text-stone-600 block mb-1.5">
                    Quick Sample Outdoor Stock Photos:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_SAMPLE_IMAGES.map((preset, pIdx) => (
                      <button
                        key={pIdx}
                        type="button"
                        onClick={() => handleAddImage(preset)}
                        className="w-10 h-10 rounded-lg overflow-hidden border border-stone-300 hover:border-[#102A45] hover:scale-105 transition-all cursor-pointer"
                        title="Click to add photo"
                      >
                        <img src={preset} alt="Sample" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. BASIC PRODUCT DETAILS & PRICING */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#102A45] flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span>General Information & Pricing</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Product Name (English) *
                    </label>
                    <input
                      type="text"
                      value={formProduct.name}
                      onChange={(e) => setFormProduct({ ...formProduct, name: e.target.value })}
                      className="w-full bg-white border border-stone-300 text-xs rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#102A45]"
                    />
                  </div>

                  {/* Style Code */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Style Code (e.g. #2859) *
                    </label>
                    <input
                      type="text"
                      value={formProduct.styleCode}
                      onChange={(e) => setFormProduct({ ...formProduct, styleCode: e.target.value })}
                      className="w-full bg-white border border-stone-300 text-xs rounded-xl px-3 py-2 text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#102A45]"
                    />
                  </div>

                  {/* Nepali Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Nepali Name (नेपाली नाम)
                    </label>
                    <input
                      type="text"
                      value={formProduct.nepaliName}
                      onChange={(e) => setFormProduct({ ...formProduct, nepaliName: e.target.value })}
                      className="w-full bg-white border border-stone-300 text-xs rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#102A45]"
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Primary Category *
                    </label>
                    <select
                      value={formProduct.category}
                      onChange={(e) => setFormProduct({ ...formProduct, category: e.target.value as ProductCategory })}
                      className="w-full bg-white border border-stone-300 text-xs rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#102A45]"
                    >
                      {CATEGORY_OPTIONS.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Selling Price (NPR रू) *
                    </label>
                    <input
                      type="number"
                      value={formProduct.price}
                      onChange={(e) => setFormProduct({ ...formProduct, price: Number(e.target.value) })}
                      className="w-full bg-white border border-stone-300 text-xs rounded-xl px-3 py-2 text-stone-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#102A45]"
                    />
                  </div>

                  {/* Original / MSRP Price */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Original / MRP Price (NPR रू)
                    </label>
                    <input
                      type="number"
                      value={formProduct.originalPrice || ''}
                      onChange={(e) => setFormProduct({ ...formProduct, originalPrice: e.target.value ? Number(e.target.value) : undefined })}
                      placeholder="Optional strikethrough price"
                      className="w-full bg-white border border-stone-300 text-xs rounded-xl px-3 py-2 text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-[#102A45]"
                    />
                  </div>

                  {/* Subcategory */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Subcategory
                    </label>
                    <input
                      type="text"
                      value={formProduct.subcategory || ''}
                      onChange={(e) => setFormProduct({ ...formProduct, subcategory: e.target.value })}
                      placeholder="e.g. Trekking Pants"
                      className="w-full bg-white border border-stone-300 text-xs rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#102A45]"
                    />
                  </div>
                </div>
              </div>

              {/* 3. INVENTORY & LOGISTICS CONTROL */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#102A45] flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  <span>Logistics & Inventory Controls</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  {/* Stock Count */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Available Stock Units (Warehouses) *
                    </label>
                    <input
                      type="number"
                      value={formProduct.stockCount}
                      onChange={(e) => {
                        const count = Number(e.target.value);
                        setFormProduct({
                          ...formProduct,
                          stockCount: count,
                          inStock: count > 0,
                        });
                      }}
                      className="w-full bg-white border border-stone-300 text-xs rounded-xl px-3 py-2 text-stone-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#102A45]"
                    />
                  </div>

                  {/* In Stock Toggle */}
                  <div className="flex items-center gap-3 pt-4 sm:pt-0">
                    <input
                      type="checkbox"
                      id="inStockCheck"
                      checked={formProduct.inStock}
                      onChange={(e) => setFormProduct({ ...formProduct, inStock: e.target.checked })}
                      className="w-4 h-4 text-[#102A45] rounded"
                    />
                    <label htmlFor="inStockCheck" className="text-xs font-bold text-stone-800 cursor-pointer">
                      Mark as In Stock & Active for Purchase
                    </label>
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Item Weight (e.g. 360g)
                    </label>
                    <input
                      type="text"
                      value={formProduct.weight || ''}
                      onChange={(e) => setFormProduct({ ...formProduct, weight: e.target.value })}
                      placeholder="e.g. 420g"
                      className="w-full bg-white border border-stone-300 text-xs rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#102A45]"
                    />
                  </div>
                </div>

                {/* Badge Flags */}
                <div className="pt-3 border-t border-stone-200 flex flex-wrap items-center gap-6 text-xs">
                  <span className="font-bold text-stone-700">Display Badges:</span>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formProduct.isBestSeller}
                      onChange={(e) => setFormProduct({ ...formProduct, isBestSeller: e.target.checked })}
                      className="w-3.5 h-3.5 text-[#102A45]"
                    />
                    <span className="font-semibold text-stone-800">Best Seller</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formProduct.isNewArrival}
                      onChange={(e) => setFormProduct({ ...formProduct, isNewArrival: e.target.checked })}
                      className="w-3.5 h-3.5 text-[#DE4B56]"
                    />
                    <span className="font-semibold text-stone-800">New Arrival</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formProduct.isTrending}
                      onChange={(e) => setFormProduct({ ...formProduct, isTrending: e.target.checked })}
                      className="w-3.5 h-3.5 text-[#F5A623]"
                    />
                    <span className="font-semibold text-stone-800">Trending</span>
                  </label>
                </div>
              </div>

              {/* 4. COLORS & SIZES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Colors */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#102A45] flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    <span>Color Swatches</span>
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {formProduct.colors.map((c, cIdx) => (
                      <div
                        key={cIdx}
                        className="flex items-center gap-1.5 bg-white border border-stone-300 px-2.5 py-1 rounded-lg text-xs"
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-stone-300"
                          style={{ backgroundColor: c.hex }}
                        />
                        <span className="font-semibold text-stone-800">{c.name}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveColor(cIdx)}
                          className="text-stone-400 hover:text-rose-600 ml-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="color"
                      value={newColorHex}
                      onChange={(e) => setNewColorHex(e.target.value)}
                      className="w-8 h-8 rounded border border-stone-300 cursor-pointer bg-white"
                      title="Choose color hex"
                    />
                    <input
                      type="text"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      placeholder="Color name (e.g. Alpine Red)"
                      className="flex-1 bg-white border border-stone-300 text-xs rounded-xl px-3 py-1.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#102A45]"
                    />
                    <button
                      type="button"
                      onClick={handleAddColor}
                      className="px-3 py-1.5 bg-[#102A45] text-white text-xs font-bold rounded-xl hover:bg-[#162B4D] cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Sizes */}
                <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-3">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-[#102A45] flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    <span>Available Sizes</span>
                  </h4>

                  <div className="flex flex-wrap gap-2">
                    {formProduct.sizes.map((sz) => (
                      <div
                        key={sz}
                        className="flex items-center gap-1.5 bg-white border border-stone-300 px-2.5 py-1 rounded-lg text-xs"
                      >
                        <span className="font-bold text-stone-800">{sz}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSize(sz)}
                          className="text-stone-400 hover:text-rose-600 ml-1 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="text"
                      value={newSize}
                      onChange={(e) => setNewSize(e.target.value)}
                      placeholder="Size label (e.g. XXL, 35L, UK 9)"
                      className="flex-1 bg-white border border-stone-300 text-xs rounded-xl px-3 py-1.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#102A45]"
                    />
                    <button
                      type="button"
                      onClick={handleAddSize}
                      className="px-3 py-1.5 bg-[#102A45] text-white text-xs font-bold rounded-xl hover:bg-[#162B4D] cursor-pointer"
                    >
                      Add Size
                    </button>
                  </div>
                </div>
              </div>

              {/* 5. DESCRIPTIONS, FEATURES & SPECIFICATIONS */}
              <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5 space-y-4">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#102A45]">
                  Descriptions & Technical Mountain Specifications
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Short Description (English)
                    </label>
                    <textarea
                      rows={2}
                      value={formProduct.description}
                      onChange={(e) => setFormProduct({ ...formProduct, description: e.target.value })}
                      className="w-full bg-white border border-stone-300 text-xs rounded-xl p-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#102A45]"
                    />
                  </div>

                  {/* Bullet Features */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Key Highlights & Bullet Features
                    </label>
                    <div className="space-y-1.5 mb-2">
                      {formProduct.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-center justify-between bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-xs">
                          <span className="text-stone-800">• {feat}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(fIdx)}
                            className="text-stone-400 hover:text-rose-600 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newFeature}
                        onChange={(e) => setNewFeature(e.target.value)}
                        placeholder="Add feature bullet (e.g. YKK Concealed Zip Pockets)"
                        className="flex-1 bg-white border border-stone-300 text-xs rounded-xl px-3 py-1.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#102A45]"
                      />
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="px-3 py-1.5 bg-[#102A45] text-white text-xs font-bold rounded-xl hover:bg-[#162B4D] cursor-pointer"
                      >
                        Add Feature
                      </button>
                    </div>
                  </div>

                  {/* Key-Value Specifications */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Technical Specifications Table
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                      {Object.entries(formProduct.specifications || {}).map(([key, val]) => (
                        <div key={key} className="flex items-center justify-between bg-white border border-stone-200 px-3 py-1.5 rounded-lg text-xs">
                          <div>
                            <span className="font-bold text-stone-700">{key}: </span>
                            <span className="text-stone-600">{val}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveSpec(key)}
                            className="text-stone-400 hover:text-rose-600 cursor-pointer ml-2"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSpecKey}
                        onChange={(e) => setNewSpecKey(e.target.value)}
                        placeholder="Spec Name (e.g. Material)"
                        className="w-1/3 bg-white border border-stone-300 text-xs rounded-xl px-3 py-1.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#102A45]"
                      />
                      <input
                        type="text"
                        value={newSpecVal}
                        onChange={(e) => setNewSpecVal(e.target.value)}
                        placeholder="Spec Value (e.g. 100% Flex Ripstop Nylon)"
                        className="flex-1 bg-white border border-stone-300 text-xs rounded-xl px-3 py-1.5 text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#102A45]"
                      />
                      <button
                        type="button"
                        onClick={handleAddSpec}
                        className="px-3 py-1.5 bg-[#102A45] text-white text-xs font-bold rounded-xl hover:bg-[#162B4D] cursor-pointer"
                      >
                        Add Spec
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Action Strip */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('inventory');
                    setFormProduct(null);
                  }}
                  className="px-5 py-2.5 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveCurrentProduct}
                  className="px-6 py-2.5 bg-[#102A45] hover:bg-[#162B4D] text-white rounded-xl text-xs font-extrabold shadow-sm flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-[#F5A623]" />
                  <span>Save & Apply Updates</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

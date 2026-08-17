import React from 'react';
import { Trash2, AlertTriangle, X, Package } from 'lucide-react';
import { Product } from '../../types';
import { formatNPR } from '../../services/fonepayService';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  product?: Product | null;
  bulkCount?: number;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  product,
  bulkCount,
  onConfirm,
  onCancel,
  title,
  description,
}) => {
  if (!isOpen) return null;

  const isBulk = typeof bulkCount === 'number' && bulkCount > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-stone-950 border border-stone-800 text-white w-full max-w-md p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5 text-rose-500">
            <div className="p-2 bg-rose-950/60 border border-rose-800/80">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-rose-400">
                ACTION REQUIRED
              </span>
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                {title || (isBulk ? `Delete ${bulkCount} Products` : 'Delete Product')}
              </h3>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 text-stone-400 hover:text-white bg-stone-900 border border-stone-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <p className="text-xs text-stone-300 font-light leading-relaxed">
          {description ||
            (isBulk
              ? `Are you sure you want to permanently delete these ${bulkCount} selected products? This will remove them immediately from the catalog and search results.`
              : 'Are you sure you want to permanently delete this product from the inventory? This action cannot be undone.')}
        </p>

        {/* Product Card Preview (if single product) */}
        {product && !isBulk && (
          <div className="flex items-center gap-3 p-3 bg-stone-900/80 border border-stone-800">
            <div className="w-14 h-14 bg-stone-950 border border-stone-800 shrink-0 overflow-hidden">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-600">
                  <Package className="w-5 h-5" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-white text-xs uppercase tracking-wider truncate">
                {product.name}
              </div>
              <div className="text-[11px] text-stone-400 font-mono">SKU: {product.styleCode}</div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-stone-500 uppercase">{product.category}</span>
                <span className="text-xs font-bold text-white font-mono">
                  {formatNPR(product.price)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800 text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors"
          >
            CANCEL / KEEP
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg"
          >
            <Trash2 className="w-4 h-4" />
            <span>PERMANENTLY DELETE</span>
          </button>
        </div>
      </div>
    </div>
  );
};

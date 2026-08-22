import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, Image as ImageIcon, Check, X, RefreshCw } from 'lucide-react';

interface ImageUploadInputProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  sublabel?: string;
  aspectRatio?: 'video' | 'portrait' | 'square' | 'wide' | 'auto';
  presetOptions?: string[];
  className?: string;
  id?: string;
}

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  value,
  onChange,
  label,
  sublabel,
  aspectRatio = 'auto',
  presetOptions = [],
  className = '',
  id,
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resize and convert uploaded image file to Base64 data URL for fast, persistent client storage
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WEBP, AVIF).');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1600;
        const MAX_HEIGHT = 1600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height = Math.round((height * MAX_WIDTH) / width);
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width = Math.round((width * MAX_HEIGHT) / height);
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          // Export with high quality JPEG/WEBP
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          onChange(dataUrl);
          setPreviewError(false);
        } else {
          onChange(event.target?.result as string);
          setPreviewError(false);
        }
        setIsProcessing(false);
      };
      img.onerror = () => {
        onChange(event.target?.result as string);
        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleApplyUrl = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput.trim()) return;
    onChange(urlInput.trim());
    setUrlInput('');
    setPreviewError(false);
  };

  const getAspectClass = () => {
    switch (aspectRatio) {
      case 'video':
        return 'aspect-[16/9]';
      case 'wide':
        return 'aspect-[21/9] sm:aspect-[16/7]';
      case 'portrait':
        return 'aspect-[3/4]';
      case 'square':
        return 'aspect-square';
      default:
        return 'h-48 sm:h-56';
    }
  };

  return (
    <div id={id} className={`space-y-3 font-sans ${className}`}>
      {/* Header Label */}
      {(label || sublabel) && (
        <div className="flex items-center justify-between">
          <div>
            {label && <label className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 block">{label}</label>}
            {sublabel && <p className="text-[11px] text-stone-500 dark:text-stone-400 font-light">{sublabel}</p>}
          </div>
          {value && (
            <span className="text-[10px] font-mono bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 px-2 py-0.5 font-bold border border-red-300 dark:border-red-800">
              PHOTO ACTIVE
            </span>
          )}
        </div>
      )}

      {/* Image Preview & Upload Controls Card */}
      <div className="border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 overflow-hidden shadow-xs">
        {/* Preview Frame */}
        <div className={`relative w-full bg-stone-950 flex items-center justify-center overflow-hidden ${getAspectClass()}`}>
          {value && !previewError ? (
            <>
              <img
                src={value}
                alt="Preview"
                className="w-full h-full object-cover object-center"
                onError={() => setPreviewError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-[10px] font-mono bg-black/60 backdrop-blur-xs px-2.5 py-1 border border-white/15">
                <span className="truncate max-w-[200px] sm:max-w-[300px]">
                  {value.startsWith('data:') ? 'Local Upload (Device)' : value}
                </span>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="text-red-400 hover:text-red-300 font-bold uppercase ml-2 cursor-pointer flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>
            </>
          ) : (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full h-full flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-colors border-2 border-dashed ${
                isDragging
                  ? 'border-white bg-white/10 text-white'
                  : 'border-stone-700 hover:border-stone-500 text-stone-400 hover:text-stone-200'
              }`}
            >
              <Upload className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-xs font-bold uppercase tracking-wider text-stone-200">
                {isProcessing ? 'Processing Image...' : 'Click or Drag & Drop Photo Here'}
              </p>
              <p className="text-[11px] text-stone-400 font-light mt-1">
                Supports JPG, PNG, WEBP, AVIF from device
              </p>
            </div>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Action Tabs for Switching Upload Mode */}
        <div className="p-3 bg-stone-50 dark:bg-stone-950 border-t border-stone-200 dark:border-stone-800 flex flex-col gap-3">
          <div className="flex items-center gap-1.5 border-b border-stone-200 dark:border-stone-800 pb-2">
            <button
              type="button"
              onClick={() => setActiveMode('upload')}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'upload'
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <Upload className="w-3 h-3" />
              <span>Upload File</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveMode('url')}
              className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                activeMode === 'url'
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white'
              }`}
            >
              <LinkIcon className="w-3 h-3" />
              <span>Paste Image URL</span>
            </button>

            {presetOptions.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveMode('presets')}
                className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeMode === 'presets'
                    ? 'bg-black dark:bg-white text-white dark:text-black'
                    : 'text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white'
                }`}
              >
                <ImageIcon className="w-3 h-3" />
                <span>Preset Looks ({presetOptions.length})</span>
              </button>
            )}
          </div>

          {/* Mode 1: File Upload */}
          {activeMode === 'upload' && (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isProcessing ? 'Optimizing...' : 'Select Photo from Computer'}</span>
              </button>
              <span className="text-[11px] text-stone-500 dark:text-stone-400 font-light">
                Instant high-res client encoding & preview
              </span>
            </div>
          )}

          {/* Mode 2: Paste Web URL (Unsplash, Pinterest, Cloudinary, Imgur) */}
          {activeMode === 'url' && (
            <form onSubmit={handleApplyUrl} className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/... or pinterest / direct link"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-black dark:focus:border-white font-mono"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-wider hover:bg-stone-800 dark:hover:bg-stone-200 cursor-pointer"
              >
                Apply URL
              </button>
            </form>
          )}

          {/* Mode 3: Presets Gallery */}
          {activeMode === 'presets' && (
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {presetOptions.map((presetUrl, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    onChange(presetUrl);
                    setPreviewError(false);
                  }}
                  className={`relative aspect-square border overflow-hidden cursor-pointer group ${
                    value === presetUrl ? 'border-black dark:border-white ring-2 ring-black dark:ring-white' : 'border-stone-300 dark:border-stone-700'
                  }`}
                >
                  <img src={presetUrl} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  {value === presetUrl && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

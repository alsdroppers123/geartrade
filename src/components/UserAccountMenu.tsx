import React, { useState, useRef, useEffect } from 'react';
import { User, LogIn, LogOut, Shield, ShieldCheck, Check, Sparkles, ChevronDown } from 'lucide-react';
import { AuthUser } from '../types';

interface UserAccountMenuProps {
  currentUser: AuthUser | null;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  onNavigateToAdmin: () => void;
}

export const UserAccountMenu: React.FC<UserAccountMenuProps> = ({
  currentUser,
  onOpenLoginModal,
  onLogout,
  onNavigateToAdmin,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentUser) {
    return (
      <button
        onClick={onOpenLoginModal}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-900 dark:text-white text-xs font-bold transition-all border border-stone-300 dark:border-stone-700 shadow-xs cursor-pointer uppercase tracking-wider"
        title="Sign in with Google"
      >
        {/* Google Mini Icon */}
        <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
          />
          <path
            fill="#34A853"
            d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
          />
          <path
            fill="#FBBC05"
            d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
          />
          <path
            fill="#EA4335"
            d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
          />
        </svg>
        <span className="hidden sm:inline">Login</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 bg-stone-100 dark:bg-stone-900 hover:bg-stone-200 dark:hover:bg-stone-800 border border-stone-300 dark:border-stone-700 text-stone-900 dark:text-white text-xs font-semibold transition-colors cursor-pointer"
      >
        {currentUser.picture ? (
          <img
            src={currentUser.picture}
            alt={currentUser.name}
            className="w-6 h-6 object-cover border border-stone-300 dark:border-stone-700"
          />
        ) : (
          <div className="w-6 h-6 bg-black dark:bg-white text-white dark:text-black font-bold flex items-center justify-center text-[10px]">
            {currentUser.name.charAt(0)}
          </div>
        )}

        <div className="flex flex-col items-start text-left leading-tight hidden sm:block">
          <span className="font-bold text-[11px] text-stone-900 dark:text-white truncate max-w-[90px]">
            {currentUser.name.split(' ')[0]}
          </span>
          <span className="text-[9px] text-stone-500 dark:text-stone-400 font-mono uppercase tracking-wider font-bold">
            {currentUser.isAdmin ? 'ADMIN' : 'MEMBER'}
          </span>
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-stone-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-stone-950 border border-stone-300 dark:border-stone-800 shadow-2xl overflow-hidden z-50 animate-fadeIn text-stone-900 dark:text-stone-200">
          {/* Profile Header */}
          <div className="p-3.5 bg-stone-100 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800">
            <div className="flex items-center gap-3">
              {currentUser.picture ? (
                <img
                  src={currentUser.picture}
                  alt={currentUser.name}
                  className="w-10 h-10 object-cover border border-stone-300 dark:border-stone-700"
                />
              ) : (
                <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black font-bold flex items-center justify-center text-sm border border-stone-300 dark:border-stone-700">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="overflow-hidden">
                <div className="flex items-center gap-1.5">
                  <p className="font-black text-xs text-stone-900 dark:text-white uppercase tracking-wider truncate">{currentUser.name}</p>
                  {currentUser.isAdmin ? (
                    <span className="bg-stone-900 dark:bg-white text-white dark:text-black text-[9px] font-black px-1.5 py-0.2 uppercase">
                      Admin
                    </span>
                  ) : (
                    <span className="bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[9px] font-bold px-1.5 py-0.2 uppercase">
                      Member
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-stone-500 font-mono truncate">{currentUser.email}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-2 space-y-1 text-xs">
            {currentUser.isAdmin ? (
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateToAdmin();
                }}
                className="w-full text-left px-3 py-2 bg-stone-900 dark:bg-white text-white dark:text-black font-bold flex items-center gap-2 transition-colors cursor-pointer uppercase tracking-wider text-[11px]"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 dark:text-emerald-700" />
                <span>OPEN ADMIN HUB</span>
              </button>
            ) : (
              <div className="px-3 py-2 text-[10px] text-stone-500 uppercase tracking-wider bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                <span className="text-stone-900 dark:text-white font-bold block mb-0.5">Customer Account</span>
                Store Admin access is restricted to verified operators.
              </div>
            )}

            <button
              onClick={() => {
                setIsOpen(false);
                onOpenLoginModal();
              }}
              className="w-full text-left px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-700 dark:text-stone-300 hover:text-black dark:hover:text-white flex items-center gap-2 transition-colors cursor-pointer uppercase tracking-wider text-[11px]"
            >
              <LogIn className="w-3.5 h-3.5 text-stone-500" />
              <span>Switch Google Account</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="w-full text-left px-3 py-2 hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white font-bold flex items-center gap-2 transition-colors cursor-pointer uppercase tracking-wider text-[11px]"
            >
              <LogOut className="w-3.5 h-3.5 text-stone-500" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

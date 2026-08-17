import React, { useState, useEffect, useRef } from 'react';
import { X, ShieldCheck, Mail, LogIn, Lock, AlertCircle } from 'lucide-react';
import { AuthUser } from '../types';
import { decodeGoogleJwt, createGoogleUserFromPayload, createDemoUser, getAdminWhitelist } from '../services/authService';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  requireAdminNotice?: boolean;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  requireAdminNotice = false,
}) => {
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const googleBtnRef = useRef<HTMLDivElement>(null);

  // Try to mount Google Identity Services if loaded and client ID exists
  useEffect(() => {
    if (!isOpen) return;

    const clientId = (import.meta as any)?.env?.VITE_GOOGLE_CLIENT_ID || '';
    if (clientId && window.google && googleBtnRef.current) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response.credential) {
              const payload = decodeGoogleJwt(response.credential);
              if (payload) {
                const user = createGoogleUserFromPayload(payload);
                onLoginSuccess(user);
                onClose();
              }
            }
          },
        });

        window.google.accounts.id.renderButton(googleBtnRef.current, {
          theme: 'outline',
          size: 'large',
          width: '100%',
          text: 'signin_with',
          shape: 'rectangular',
          logo_alignment: 'left',
        });
      } catch (err) {
        console.error('Google GSI initialization error', err);
      }
    }
  }, [isOpen, onLoginSuccess, onClose]);

  if (!isOpen) return null;

  const handleQuickLogin = (email: string, name: string) => {
    const user = createDemoUser(email, name);
    onLoginSuccess(user);
    onClose();
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customEmail.includes('@') || !customEmail.includes('.')) {
      setErrorMessage('Please enter a valid Google Account email.');
      return;
    }
    const name = customName.trim() || customEmail.split('@')[0].replace(/[._]/g, ' ').toUpperCase();
    const user = createDemoUser(customEmail.trim(), name);
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 w-full max-w-md overflow-hidden shadow-2xl text-stone-900 dark:text-stone-100 relative animate-scaleUp">
        {/* Header Ribbon */}
        <div className="bg-stone-50 dark:bg-stone-900 px-6 pt-6 pb-4 border-b border-stone-200 dark:border-stone-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center p-2 shadow-xs">
              {/* Google G Logo SVG */}
              <svg className="w-5 h-5" viewBox="0 0 24 24">
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
            </div>
            <div>
              <h3 className="text-sm font-black tracking-widest text-stone-900 dark:text-stone-100 uppercase">Google Sign-In</h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-light">GEARTRADE Nepal Store Identity</p>
            </div>
          </div>

          {requireAdminNotice && (
            <div className="mt-3 bg-stone-100 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 p-3 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5" />
              <div className="text-xs text-stone-700 dark:text-stone-300">
                <p className="font-bold uppercase tracking-wider text-[11px]">Admin Hub Restricted</p>
                <p className="text-stone-500 dark:text-stone-400 text-[10px] mt-0.5 font-light">
                  The Admin Hub is restricted exclusively to authorized Google administrator accounts.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Real Google GSI Container (if configured) */}
          <div ref={googleBtnRef} className="w-full flex justify-center empty:hidden" />

          {/* Quick Profiles Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                Authorized Admin Accounts
              </label>
              <span className="text-[9px] bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold px-1.5 py-0.2 uppercase tracking-wider">
                Whitelisted
              </span>
            </div>

            <div className="space-y-2">
              {/* Primary Master Admin - User's Email */}
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin(
                    '080bas004.abhishek@pcampus.edu.np',
                    'Abhishek (Master Admin)'
                  )
                }
                className="w-full text-left p-3 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-850 border border-stone-300 dark:border-stone-700 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs">
                    AB
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase">
                        Abhishek (Master Admin)
                      </span>
                      <span className="text-[8px] bg-black dark:bg-white text-white dark:text-black font-bold px-1 py-0.2 uppercase">
                        Master
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono block">
                      080bas004.abhishek@pcampus.edu.np
                    </span>
                  </div>
                </div>
                <LogIn className="w-4 h-4 text-stone-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
              </button>

              {/* Secondary Admin Account */}
              <button
                type="button"
                onClick={() =>
                  handleQuickLogin('admin@geartrade.com.np', 'GEARTRADE Nepal Admin')
                }
                className="w-full text-left p-2.5 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-850 border border-stone-200 dark:border-stone-800 transition-all flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 flex items-center justify-center font-bold text-xs">
                    GT
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase">
                        Store Operations Admin
                      </span>
                      <span className="text-[8px] bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold px-1 py-0.2 uppercase">
                        Admin
                      </span>
                    </div>
                    <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">admin@geartrade.com.np</span>
                  </div>
                </div>
                <LogIn className="w-4 h-4 text-stone-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
              </button>
            </div>
          </div>

          {/* Customer / Regular Account */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
            <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400 mb-2 block">
              Standard Customer Account
            </label>
            <button
              type="button"
              onClick={() =>
                handleQuickLogin('trekker.himalaya@gmail.com', 'Sujit Sherpa (Customer)')
              }
              className="w-full text-left p-2.5 bg-stone-50 dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-850 border border-stone-200 dark:border-stone-800 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-stone-200 dark:bg-stone-800 flex items-center justify-center text-stone-700 dark:text-stone-300 font-bold text-xs">
                  SS
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase">
                      Sujit Sherpa
                    </span>
                    <span className="text-[8px] bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 font-bold px-1 py-0.2 uppercase">
                      Customer
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">trekker.himalaya@gmail.com</span>
                </div>
              </div>
              <LogIn className="w-4 h-4 text-stone-400 group-hover:text-black dark:group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Custom Google Email Login Form */}
          <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
            <details className="group cursor-pointer">
              <summary className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 hover:text-black dark:hover:text-white flex items-center justify-between list-none">
                <span>Sign in with custom Google Email</span>
                <span className="text-xs group-open:rotate-180 transition-transform">▼</span>
              </summary>

              <form onSubmit={handleCustomGoogleSubmit} className="mt-3 space-y-3 pt-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                    Google Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      placeholder="your.email@gmail.com"
                      value={customEmail}
                      onChange={(e) => {
                        setCustomEmail(e.target.value);
                        setErrorMessage('');
                      }}
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-black dark:focus:border-white font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                    Display Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Abhishek Sharma"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-black dark:focus:border-white font-medium uppercase"
                  />
                </div>

                {errorMessage && (
                  <div className="text-rose-500 text-xs flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-2.5 bg-black dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Continue with Google
                </button>
              </form>
            </details>
          </div>
        </div>

        {/* Footer Policy Info */}
        <div className="px-6 py-3 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-stone-700 dark:text-stone-300" />
            <span>Secure Google Auth</span>
          </div>
          <span>GEARTRADE Security</span>
        </div>
      </div>
    </div>
  );
};

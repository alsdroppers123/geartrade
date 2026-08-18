import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  ShieldCheck,
  Mail,
  LogIn,
  Lock,
  AlertCircle,
  User,
} from 'lucide-react';
import { AuthUser } from '../types';
import {
  decodeGoogleJwt,
  createGoogleUserFromPayload,
  createDemoUser,
  getGoogleClientId,
} from '../services/authService';

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
  const [isLoadingPopup, setIsLoadingPopup] = useState(false);
  const [hasRenderedGsi, setHasRenderedGsi] = useState(false);

  const googleBtnContainerRef = useRef<HTMLDivElement>(null);
  const tokenClientRef = useRef<any>(null);

  const currentClientId = getGoogleClientId();

  // Initialize Google Identity Services ONLY when a valid Client ID is available
  useEffect(() => {
    if (!isOpen) return;

    const clientId = getGoogleClientId();
    if (!clientId || clientId.length < 8 || !clientId.includes('.')) {
      setHasRenderedGsi(false);
      tokenClientRef.current = null;
      return;
    }

    if (window.google?.accounts?.id && window.google?.accounts?.oauth2) {
      try {
        // 1. Initialize Google ID Token flow
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response: any) => {
            if (response?.credential) {
              const payload = decodeGoogleJwt(response.credential);
              if (payload) {
                const user = createGoogleUserFromPayload(payload);
                onLoginSuccess(user);
                onClose();
              }
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render single official Google button into container
        if (googleBtnContainerRef.current) {
          googleBtnContainerRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnContainerRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
          });
          setHasRenderedGsi(true);
        }

        // 2. Initialize OAuth2 Token Client for Popup flow
        tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'email profile openid',
          callback: async (tokenResponse: any) => {
            setIsLoadingPopup(false);
            if (tokenResponse && tokenResponse.access_token) {
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: {
                    Authorization: `Bearer ${tokenResponse.access_token}`,
                  },
                });
                if (res.ok) {
                  const googleUser = await res.json();
                  const authUser = createGoogleUserFromPayload(googleUser);
                  onLoginSuccess(authUser);
                  onClose();
                } else {
                  setErrorMessage('Failed to retrieve profile from Google servers.');
                }
              } catch (fetchErr) {
                console.error('Error fetching Google userinfo', fetchErr);
                setErrorMessage('Error contacting Google API.');
              }
            } else if (tokenResponse?.error) {
              setErrorMessage(`Google Sign-In error: ${tokenResponse.error}`);
            }
          },
          error_callback: (err: any) => {
            setIsLoadingPopup(false);
            console.error('Google OAuth error', err);
            setErrorMessage('Google OAuth popup was closed or blocked.');
          },
        });
      } catch (err) {
        console.error('Google GSI initialization error', err);
        setHasRenderedGsi(false);
      }
    } else {
      setHasRenderedGsi(false);
    }
  }, [isOpen, onLoginSuccess, onClose]);

  if (!isOpen) return null;

  // Trigger Google Official OAuth Popup if fallback button is clicked
  const handleLaunchGooglePopup = () => {
    setErrorMessage('');
    const clientId = getGoogleClientId();

    if (tokenClientRef.current && clientId) {
      setIsLoadingPopup(true);
      try {
        tokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
      } catch (e) {
        setIsLoadingPopup(false);
        console.error('Error requesting Google access token', e);
        setErrorMessage('Could not open Google Sign-In popup.');
      }
    } else if (window.google?.accounts?.id && clientId) {
      window.google.accounts.id.prompt();
    } else {
      // Focus the email field if client ID not configured
      const input = document.getElementById('geartrade-email-input');
      input?.focus();
    }
  };

  // Sign in with any custom email (Customer or Admin)
  const handleCustomEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const email = customEmail.trim().toLowerCase();

    if (!email || !email.includes('@') || !email.includes('.')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    const name =
      customName.trim() ||
      email
        .split('@')[0]
        .split(/[._-]/)
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ');

    const user = createDemoUser(email, name);
    onLoginSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-fadeIn font-sans">
      <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-800 w-full max-w-md overflow-hidden shadow-2xl text-stone-900 dark:text-stone-100 relative animate-scaleUp max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-stone-50 dark:bg-stone-900 px-6 pt-5 pb-4 border-b border-stone-200 dark:border-stone-800 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-stone-500 dark:text-stone-400 hover:text-black dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center p-2 shadow-xs shrink-0">
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
              <h3 className="text-sm font-black tracking-wider text-stone-900 dark:text-stone-100 uppercase">
                Sign In to GEARTRADE Nepal
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-light">
                Member orders, wishlists, and store administration
              </p>
            </div>
          </div>

          {requireAdminNotice && (
            <div className="mt-3 bg-amber-500/10 border border-amber-500/30 p-2.5 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 dark:text-amber-200">
                <p className="font-bold uppercase tracking-wider text-[10px]">Admin Access Required</p>
                <p className="text-[11px] mt-0.5 opacity-90">
                  Please log in with an authorized email (e.g. Master Admin <span className="font-mono font-bold">080bas004.abhishek@pcampus.edu.np</span>).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Single Google Sign-In Button */}
          <div>
            {hasRenderedGsi ? (
              /* When Google GSI is rendered, show ONLY the GSI rendered button */
              <div ref={googleBtnContainerRef} className="w-full flex justify-center" />
            ) : (
              /* Fallback single styled Google Sign-In button */
              <button
                type="button"
                onClick={handleLaunchGooglePopup}
                disabled={isLoadingPopup}
                className="w-full py-2.5 px-4 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-850 text-stone-800 dark:text-stone-100 font-bold text-xs uppercase tracking-wider border border-stone-300 dark:border-stone-700 transition-all flex items-center justify-center gap-3 shadow-xs cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                <span>
                  {isLoadingPopup
                    ? 'Connecting with Google...'
                    : currentClientId
                    ? 'Sign In with Google'
                    : 'Continue with Google'}
                </span>
              </button>
            )}
            {/* Hidden container ref if not yet attached */}
            {!hasRenderedGsi && <div ref={googleBtnContainerRef} className="hidden" />}
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Or Sign In with Email
            </span>
            <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1" />
          </div>

          {/* Direct Email Login Form for ANY Customer or Admin */}
          <form onSubmit={handleCustomEmailSubmit} className="space-y-3">
            <div>
              <label className="block text-[10px] uppercase font-bold tracking-wider text-stone-600 dark:text-stone-400 mb-1">
                Your Google / Personal Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  id="geartrade-email-input"
                  type="email"
                  required
                  placeholder="e.g. user@gmail.com"
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
                Full Name (Optional)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="e.g. Abhishek Sharma"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 dark:bg-stone-900 border border-stone-300 dark:border-stone-700 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:border-black dark:focus:border-white font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-black dark:bg-white hover:bg-stone-800 dark:hover:bg-stone-200 text-white dark:text-black font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Enter Store</span>
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 uppercase tracking-wider shrink-0">
          <div className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-stone-700 dark:text-stone-300" />
            <span>Secure Authentication</span>
          </div>
          <span>GEARTRADE Nepal</span>
        </div>
      </div>
    </div>
  );
};

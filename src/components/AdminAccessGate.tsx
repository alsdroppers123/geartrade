import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, LogIn, AlertTriangle } from 'lucide-react';
import { AuthUser } from '../types';
import { GeartradeLogo } from './GeartradeLogo';

interface AdminAccessGateProps {
  currentUser: AuthUser | null;
  onOpenGoogleLogin: () => void;
  onReturnToStorefront: () => void;
}

export const AdminAccessGate: React.FC<AdminAccessGateProps> = ({
  currentUser,
  onOpenGoogleLogin,
  onReturnToStorefront,
}) => {
  return (
    <div className="min-h-screen bg-black text-stone-100 flex flex-col justify-center items-center px-4 py-12 font-sans">
      <div className="relative max-w-md w-full bg-stone-950 border border-stone-800 p-8 text-center space-y-6">
        {/* Header Brand */}
        <div className="flex justify-center">
          <GeartradeLogo variant="full" theme="white" size="md" />
        </div>

        {/* Lock / Security Icon */}
        <div className="w-12 h-12 mx-auto bg-stone-900 border border-stone-800 flex items-center justify-center text-white">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">
            INTERNAL OPERATIONS
          </span>
          <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
            ADMINISTRATOR ACCESS ONLY
          </h1>
          <p className="text-xs text-stone-400 max-w-xs mx-auto leading-relaxed font-light">
            GEARTRADE logistics and merchandising command requires an authorized administrator Google account.
          </p>
        </div>

        {/* User Status Card */}
        {currentUser ? (
          <div className="bg-stone-900 border border-stone-800 p-4 text-left space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-400 uppercase font-bold text-[10px] tracking-wider">
                CURRENT SESSION
              </span>
              <span className="bg-stone-800 text-stone-300 font-bold px-2 py-0.5 text-[10px] uppercase tracking-wider">
                CUSTOMER
              </span>
            </div>

            <div className="flex items-center gap-3">
              {currentUser.picture ? (
                <img
                  src={currentUser.picture}
                  alt={currentUser.name}
                  className="w-9 h-9 border border-stone-700 object-cover"
                />
              ) : (
                <div className="w-9 h-9 bg-stone-800 flex items-center justify-center font-bold text-stone-300 text-xs">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="font-bold text-xs text-white uppercase tracking-wider truncate">{currentUser.name}</p>
                <p className="text-[11px] text-stone-400 font-mono truncate">{currentUser.email}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-800 flex items-start gap-2 text-xs text-stone-400">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-stone-300" />
              <span className="text-[11px]">
                Account (<strong className="font-mono text-white">{currentUser.email}</strong>) is not on the admin whitelist.
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-stone-900 border border-stone-800 p-4 text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-stone-800 border border-stone-700 flex items-center justify-center text-white shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-xs text-white uppercase tracking-wider">Authentication Required</p>
                <p className="text-[11px] text-stone-400 font-light">Sign in with an authorized Google administrator email.</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="button"
            onClick={onOpenGoogleLogin}
            className="w-full py-3 px-4 bg-white text-black hover:bg-stone-200 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{currentUser ? 'SWITCH ADMIN ACCOUNT' : 'SIGN IN WITH GOOGLE'}</span>
          </button>

          <button
            type="button"
            onClick={onReturnToStorefront}
            className="w-full py-2.5 px-4 bg-transparent hover:bg-stone-900 text-stone-400 hover:text-white border border-stone-800 font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RETURN TO STOREFRONT</span>
          </button>
        </div>

        {/* Help Info Note */}
        <div className="pt-4 border-t border-stone-800 text-[11px] text-stone-500 font-light">
          <p>
            Need admin access? Contact Master Admin at{' '}
            <span className="text-stone-300 font-mono">080bas004.abhishek@pcampus.edu.np</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

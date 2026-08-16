import React from 'react';
import { ShieldAlert, Lock, ArrowLeft, LogIn, UserCheck, AlertTriangle, Mail } from 'lucide-react';
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
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col justify-center items-center px-4 py-12">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-600/10 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative max-w-lg w-full bg-stone-900/90 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md text-center">
        {/* Header Brand */}
        <div className="flex justify-center mb-4">
          <GeartradeLogo variant="badge" size="md" />
        </div>

        {/* Lock / Security Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-5 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wide text-white mb-2">
          Administrator Access Only
        </h1>

        <p className="text-xs sm:text-sm text-stone-400 max-w-sm mx-auto leading-relaxed mb-6">
          The GEARTRADE Operations & Merchandising Hub is restricted strictly to designated administrator Google accounts.
        </p>

        {/* User Status Card */}
        {currentUser ? (
          <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 text-left mb-6">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-stone-500 uppercase font-bold text-[10px] tracking-wider">
                Currently Signed In
              </span>
              <span className="bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-500/30">
                Customer Account
              </span>
            </div>

            <div className="flex items-center gap-3">
              {currentUser.picture ? (
                <img
                  src={currentUser.picture}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full border border-stone-700 object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center font-bold text-stone-300">
                  {currentUser.name.charAt(0)}
                </div>
              )}
              <div className="overflow-hidden">
                <p className="font-bold text-sm text-white truncate">{currentUser.name}</p>
                <p className="text-xs text-stone-400 font-mono truncate">{currentUser.email}</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-stone-800/80 flex items-start gap-2 text-xs text-rose-300/90">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>
                Your Google account (<strong className="font-mono text-white">{currentUser.email}</strong>) is not currently on the authorized Admin Whitelist.
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-4 text-left mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-xs text-white">Authentication Required</p>
                <p className="text-xs text-stone-400">Please sign in with an authorized Google administrator account.</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={onOpenGoogleLogin}
            className="w-full py-3 px-4 bg-[#DE4B56] hover:bg-[#c93d48] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-rose-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            {currentUser ? 'Switch to Authorized Admin Account' : 'Sign in with Google Admin'}
          </button>

          <button
            type="button"
            onClick={onReturnToStorefront}
            className="w-full py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Storefront
          </button>
        </div>

        {/* Help Info Note */}
        <div className="mt-6 pt-4 border-t border-stone-800 text-[11px] text-stone-500">
          <p>
            Need admin access? Contact Master Admin at{' '}
            <span className="text-stone-300 font-mono">080bas004.abhishek@pcampus.edu.np</span> to whitelist your Google account.
          </p>
        </div>
      </div>
    </div>
  );
};

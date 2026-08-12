import React from 'react';
import { UserProfile } from '../types';
import { Shield, Server, ExternalLink, Globe, LayoutDashboard } from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  activeView: 'app' | 'sub' | 'admin';
  onViewChange: (view: 'app' | 'sub' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({ user, activeView, onViewChange }) => {
  // Only show Admin tab if explicitly triggered via URL query parameter ?admin=true or if currently in admin view
  const isAdminAllowed = typeof window !== 'undefined' && (
    window.location.search.includes('admin=true') || activeView === 'admin'
  );

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-lg border-b border-slate-800/80 px-3 sm:px-4 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-teal-400 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-black text-base sm:text-lg text-white tracking-tight">RAS VPN</h1>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                PRO
              </span>
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 font-mono flex items-center gap-1">
              <Globe className="w-3 h-3 text-cyan-400 shrink-0" />
              <span className="truncate max-w-[120px] sm:max-w-none">
                {activeView === 'app' && 'app.rasvpna.ru'}
                {activeView === 'sub' && 'sub.rasvpna.ru'}
                {activeView === 'admin' && 'admin.rasvpna.ru'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions: View switch & User Info */}
        <div className="flex items-center gap-2">
          {/* View Mode Switcher (only if sub or admin is enabled/active) */}
          {(activeView !== 'app' || isAdminAllowed) && (
            <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => onViewChange('app')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  activeView === 'app'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mini App</span>
              </button>

              <button
                onClick={() => onViewChange('sub')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  activeView === 'sub'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Подписка</span>
              </button>

              {isAdminAllowed && (
                <button
                  onClick={() => onViewChange('admin')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                    activeView === 'admin'
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Админка</span>
                </button>
              )}
            </div>
          )}

          {/* User Telegram info badge */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-1 sm:px-3 sm:py-1 rounded-full border border-slate-800">
            {user.photoUrl ? (
              <img src={user.photoUrl} alt={user.username} className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover" />
            ) : (
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 text-white text-[10px] sm:text-xs font-bold flex items-center justify-center">
                {user.firstName[0]}
              </div>
            )}
            <span className="text-[11px] sm:text-xs font-medium text-slate-200 max-w-[80px] sm:max-w-none truncate">
              @{user.username}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

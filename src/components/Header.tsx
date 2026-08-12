import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Shield, ExternalLink, Globe, LayoutDashboard, Lock, KeyRound, X } from 'lucide-react';

interface HeaderProps {
  user: UserProfile;
  activeView: 'app' | 'sub' | 'admin';
  onViewChange: (view: 'app' | 'sub' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({ user, activeView, onViewChange }) => {
  const [clickCount, setClickCount] = useState(0);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(() => {
    return typeof window !== 'undefined' && (
      localStorage.getItem('ras_admin_unlocked') === 'true' ||
      window.location.search.includes('admin=true')
    );
  });

  const handleLogoClick = () => {
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (nextCount >= 5) {
      setClickCount(0);
      setIsPinModalOpen(true);
    }

    setTimeout(() => {
      setClickCount(0);
    }, 3000);
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === 'admin' || adminPin === '7777' || adminPin === '2026') {
      localStorage.setItem('ras_admin_unlocked', 'true');
      setIsUnlocked(true);
      setIsPinModalOpen(false);
      setAdminPin('');
      setPinError(false);
      onViewChange('admin');
    } else {
      setPinError(true);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-lg border-b border-slate-800/80 px-3 sm:px-4 py-2.5">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Brand Logo & Name with Secret Click Listener */}
        <div
          className="flex items-center gap-2.5 cursor-pointer select-none"
          onClick={handleLogoClick}
          title="RAS VPN"
        >
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
          {/* View Mode Switcher */}
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
              <span>Mini App</span>
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

            {/* Admin button is COMPLETELY HIDDEN by default */}
            {isUnlocked && (
              <button
                onClick={() => onViewChange('admin')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                  activeView === 'admin'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-purple-400 hover:text-purple-300'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Админка</span>
              </button>
            )}
          </div>

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

      {/* Secret Admin PIN Modal */}
      {isPinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <button
              onClick={() => setIsPinModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/50"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Вход для Администратора</h3>
                <p className="text-xs text-slate-400">Скрытая панель настройки Marzban</p>
              </div>
            </div>

            <form onSubmit={handlePinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                  Пароль администратора
                </label>
                <input
                  type="password"
                  value={adminPin}
                  onChange={(e) => {
                    setAdminPin(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Введите пароль..."
                  autoFocus
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-purple-500"
                />
                {pinError && (
                  <p className="text-xs text-rose-400 mt-1.5 font-medium">Неверный пароль доступа</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-purple-600/25"
              >
                Войти в админку
              </button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

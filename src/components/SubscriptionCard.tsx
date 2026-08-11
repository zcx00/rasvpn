import React from 'react';
import { VpnSubscription } from '../types';
import { ShieldCheck, Zap, HardDrive, Calendar, ArrowUpRight, Copy, Check } from 'lucide-react';

interface SubscriptionCardProps {
  subscription: VpnSubscription;
  onOpenConnectModal: () => void;
  onRenewClick: () => void;
}

export const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onOpenConnectModal,
  onRenewClick,
}) => {
  const [copied, setCopied] = React.useState(false);

  const calculateDaysLeft = (expireDateStr: string) => {
    const expire = new Date(expireDateStr).getTime();
    const now = new Date().getTime();
    const diffDays = Math.ceil((expire - now) / (1000 * 3600 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysLeft = calculateDaysLeft(subscription.expireDate);
  const trafficPercent = Math.min(100, Math.round((subscription.trafficUsedGb / subscription.trafficLimitGb) * 100));

  const handleCopyLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(subscription.subscriptionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-4 sm:p-6 border border-slate-800 shadow-xl shadow-blue-950/20">
      {/* Decorative ambient lighting */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs sm:text-sm font-semibold text-emerald-400 tracking-wide">
            Подписка активна
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {subscription.protocol && (
            <span className="text-[11px] font-semibold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-800/60">
              {subscription.protocol}
            </span>
          )}
          <div className="flex items-center gap-1.5 text-[11px] font-mono bg-slate-950/80 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-800">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>{subscription.marzbanUsername}</span>
          </div>
        </div>
      </div>

      {/* Plan Title & Devices */}
      <div className="mb-4">
        <div className="text-[11px] text-slate-400 font-medium mb-0.5">Текущий тариф</div>
        <div className="text-lg sm:text-xl font-bold text-white flex items-center justify-between gap-2">
          <span className="truncate">{subscription.planName}</span>
          <span className="text-[11px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-lg border border-blue-500/20 shrink-0 font-medium">
            {subscription.activeDevicesCount} / {subscription.maxDevices} Устройств
          </span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {/* Days Left */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <Calendar className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="truncate">Осталось дней</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {daysLeft} <span className="text-xs font-normal text-slate-400">дн.</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1 truncate">До {subscription.expireDate}</div>
        </div>

        {/* Traffic Used */}
        <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
            <HardDrive className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span className="truncate">Трафик</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {subscription.trafficUsedGb} <span className="text-xs font-normal text-slate-400">/ {subscription.trafficLimitGb} ГБ</span>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${trafficPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Connect Action Button */}
      <div className="space-y-2.5">
        <button
          onClick={onOpenConnectModal}
          className="w-full min-h-[48px] group relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 fill-amber-300 animate-pulse shrink-0" />
          <span>🔥 ПОДКЛЮЧИТЬ (ПОДПИСКА & QR)</span>
          <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform shrink-0" />
        </button>

        {/* Quick copy subscription link field */}
        <div className="flex items-center gap-1.5 bg-slate-950/90 p-2 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400 font-medium pl-1 text-[11px] shrink-0">Ссылка:</span>
          <input
            type="text"
            readOnly
            value={subscription.subscriptionUrl}
            className="bg-transparent text-cyan-300 font-mono w-full focus:outline-none truncate text-[11px]"
          />
          <button
            onClick={handleCopyLink}
            className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 text-[11px] font-medium transition-all shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Скопировано</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-300" />
                <span>Скопировать</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { VpnSubscription } from '../types';
import { CLIENT_APPS } from '../data/mockData';
import { QrCodeView } from './QrCodeView';
import { ShieldCheck, Copy, Check, ExternalLink, Download, Smartphone, Zap, ArrowRight, Shield } from 'lucide-react';

interface SubscriptionWebPageProps {
  subscription: VpnSubscription;
}

export const SubscriptionWebPage: React.FC<SubscriptionWebPageProps> = ({ subscription }) => {
  const [copied, setCopied] = useState(false);
  const [activeAppId, setActiveAppId] = useState<string>('app_karing');

  const handleCopy = () => {
    navigator.clipboard.writeText(subscription.subscriptionUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const activeApp = CLIENT_APPS.find(a => a.id === activeAppId) || CLIENT_APPS[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 flex items-center justify-center">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 mx-auto shadow-xl shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Shield className="w-8 h-8 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">RAS VPN</h2>
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ваша подписка активна</span>
          </div>
        </div>

        {/* User Info & Quota Card */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Пользователь:</span>
            <span className="font-mono font-bold text-cyan-300">{subscription.marzbanUsername}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Истекает:</span>
            <span className="font-semibold text-slate-200">{subscription.expireDate}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Использовано трафика:</span>
            <span className="font-semibold text-blue-400">
              {subscription.trafficUsedGb} / {subscription.trafficLimitGb} ГБ
            </span>
          </div>
        </div>

        {/* Subscription URL Field */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-slate-400 block">Персональная ссылка подписки:</label>
          <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
            <input
              type="text"
              readOnly
              value={subscription.subscriptionUrl}
              className="bg-transparent text-cyan-300 font-mono text-xs w-full focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Скопировано</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Копировать</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* QR Code Center */}
        <div className="text-center space-y-3 py-2">
          <div className="flex justify-center">
            <QrCodeView value={subscription.subscriptionUrl} size={180} />
          </div>
          <p className="text-[11px] text-slate-400">
            Отсканируйте камера-сканером в Karing, Happ или V2RayTun
          </p>
        </div>

        {/* App Selector Tabs */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-300">Выберите приложение для установки:</div>

          <div className="grid grid-cols-3 gap-2">
            {CLIENT_APPS.slice(0, 3).map(app => (
              <button
                key={app.id}
                onClick={() => setActiveAppId(app.id)}
                className={`p-2.5 rounded-xl border text-center text-xs font-bold transition-all ${
                  activeAppId === app.id
                    ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {app.name}
              </button>
            ))}
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-cyan-400">{activeApp.name} ({activeApp.platforms.join(', ')})</span>
              <a
                href={activeApp.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Скачать</span>
              </a>
            </div>

            <ol className="space-y-1.5 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
              {activeApp.guideSteps.map((step, idx) => (
                <li key={idx} className="pl-1">
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { VpnSubscription, ClientApp } from '../types';
import { CLIENT_APPS } from '../data/mockData';
import { QrCodeView } from './QrCodeView';
import { X, Copy, Check, Download, Shield, ExternalLink, QrCode, Smartphone, Zap, Cpu } from 'lucide-react';

interface ConnectModalProps {
  subscription: VpnSubscription;
  isOpen: boolean;
  onClose: () => void;
}

export const ConnectModal: React.FC<ConnectModalProps> = ({ subscription, isOpen, onClose }) => {
  const [selectedApp, setSelectedApp] = useState<ClientApp>(CLIENT_APPS[0]);
  const [copied, setCopied] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [showCopyNotice, setShowCopyNotice] = useState(false);
  const [tab, setTab] = useState<'quick' | 'qr' | 'instructions'>('quick');

  if (!isOpen) return null;

  const copyToClipboardFallback = (text: string) => {
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      return true;
    } catch {
      return false;
    }
  };

  const handleCopy = () => {
    if (subscription.subscriptionUrl) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(subscription.subscriptionUrl).catch(() => {
          copyToClipboardFallback(subscription.subscriptionUrl);
        });
      } else {
        copyToClipboardFallback(subscription.subscriptionUrl);
      }
      setCopied(true);
      setShowCopyNotice(true);
      setTimeout(() => setCopied(false), 3000);
      setTimeout(() => setShowCopyNotice(false), 6000);
    }
  };

  const getDeepLink = (app: ClientApp) => {
    return `${app.deepLinkScheme}${encodeURIComponent(subscription.subscriptionUrl || '')}`;
  };

  const handleLaunchApp = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!subscription.subscriptionUrl) {
      alert('Сначала нужно выбрать тариф и оформить подписку!');
      return;
    }

    // 1. Copy URL to clipboard automatically so user has it ready
    handleCopy();
    setLaunching(true);

    const deepLink = getDeepLink(selectedApp);

    setTimeout(() => {
      setLaunching(false);
    }, 2500);

    // 2. Try launching deep link or redirecting
    try {
      const tgWebApp = window.Telegram?.WebApp as any;
      if (tgWebApp?.openLink && deepLink.startsWith('https://')) {
        tgWebApp.openLink(deepLink);
      } else {
        // Direct deep link launch attempt
        window.location.href = deepLink;
      }
    } catch {
      window.open(deepLink, '_system');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">Подключение VPN</h3>
              <p className="text-[11px] sm:text-xs text-slate-400">VLESS + Reality (Happ, Karing, V2RayTun)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-3 sm:px-5 pt-2.5 gap-1 sm:gap-2 shrink-0">
          <button
            onClick={() => setTab('quick')}
            className={`pb-2.5 px-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              tab === 'quick'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Импорт</span>
          </button>

          <button
            onClick={() => setTab('qr')}
            className={`pb-2.5 px-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              tab === 'qr'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR-код</span>
          </button>

          <button
            onClick={() => setTab('instructions')}
            className={`pb-2.5 px-2.5 text-xs font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              tab === 'instructions'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Инструкция</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto grow">
          {/* TAB 1: QUICK IMPORT & LINK */}
          {tab === 'quick' && (
            <div className="space-y-4">
              {showCopyNotice && (
                <div className="bg-cyan-950/80 border border-cyan-500/50 rounded-xl p-3 text-xs text-cyan-200 animate-fade-in shadow-lg space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-cyan-300">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Ссылка подписки скопирована в буфер обмена!</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Если приложение <strong>{selectedApp.name}</strong> не открылось автоматически на вашем телефоне: откройте {selectedApp.name} вручную ➔ нажмите <strong>«+» / «Импорт из буфера»</strong>.
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">
                  Ваша персональная подписка (1-Click)
                </label>
                <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <input
                    type="text"
                    readOnly
                    value={subscription.subscriptionUrl}
                    className="bg-transparent text-cyan-300 font-mono text-xs w-full focus:outline-none"
                  />
                  <button
                    onClick={handleCopy}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-md shadow-blue-600/20"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Скопировано!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Скопировать</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xs font-medium text-slate-400 mb-2">Выберите ваше VPN-приложение:</div>
                <div className="grid grid-cols-2 gap-2.5">
                  {CLIENT_APPS.map(app => (
                    <button
                      key={app.id}
                      onClick={() => setSelectedApp(app)}
                      className={`p-3 rounded-xl border text-left flex items-start gap-3 transition-all ${
                        selectedApp.id === app.id
                          ? 'bg-blue-600/10 border-cyan-500/50 text-white shadow-md shadow-cyan-500/10'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-slate-800 text-cyan-400 shrink-0 mt-0.5">
                        {app.id === 'app_karing' && <Shield className="w-4 h-4" />}
                        {app.id === 'app_happ' && <Zap className="w-4 h-4" />}
                        {app.id === 'app_v2raytun' && <Cpu className="w-4 h-4" />}
                        {app.id === 'app_streisand' && <Smartphone className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold flex items-center gap-1">
                          <span>{app.name}</span>
                          {app.recommended && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">
                              Топ
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{app.platforms.join(', ')}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Direct Launch Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLaunchApp}
                  className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 text-sm shadow-lg shadow-cyan-500/25 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 shrink-0" />
                  <span>
                    {launching
                      ? `Скопировано! Запуск ${selectedApp.name}...`
                      : `Открыть и импортировать в ${selectedApp.name}`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: QR CODE */}
          {tab === 'qr' && (
            <div className="text-center space-y-4 py-2">
              <p className="text-xs text-slate-300">
                Откройте <strong>Karing</strong>, <strong>Happ</strong> или <strong>V2RayTun</strong> на вашем устройстве и отсканируйте этот QR-код для моментального добавления профиля RAS VPN:
              </p>

              <div className="flex justify-center">
                <QrCodeView value={subscription.subscriptionUrl} size={220} />
              </div>

              <div className="text-[11px] text-slate-400 font-mono bg-slate-950 p-2 rounded-lg border border-slate-800 truncate max-w-sm mx-auto">
                {subscription.subscriptionUrl}
              </div>
            </div>
          )}

          {/* TAB 3: STEP BY STEP INSTRUCTIONS */}
          {tab === 'instructions' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Инструкция для:</span>
                <select
                  value={selectedApp.id}
                  onChange={e => {
                    const found = CLIENT_APPS.find(a => a.id === e.target.value);
                    if (found) setSelectedApp(found);
                  }}
                  className="bg-slate-950 text-white text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500"
                >
                  {CLIENT_APPS.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.platforms.join(', ')})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="font-bold text-sm text-cyan-400">{selectedApp.name}</span>
                  <a
                    href={selectedApp.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Скачать приложение</span>
                  </a>
                </div>

                <ol className="space-y-2 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
                  {selectedApp.guideSteps.map((step, idx) => (
                    <li key={idx} className="pl-1">
                      <span className="text-slate-200">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Поддерживаемые форматы: V2Ray, Sing-box, Clash</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

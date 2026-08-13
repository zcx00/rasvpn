import React, { useState } from 'react';
import { EntryNode, ExitNode, CascadeRoute, SystemStats } from '../types';
import { generateDockerComposeSnippet } from '../utils/xrayGenerator';
import { Server, Cpu, Activity, Plus, FileCode, Check, Copy, Shield, Network, RefreshCw, Terminal, CreditCard, Wallet, Users } from 'lucide-react';

interface AdminPanelProps {
  entryNodes: EntryNode[];
  exitNodes: ExitNode[];
  cascadeRoutes: CascadeRoute[];
  stats: SystemStats;
  onAddNode: (type: 'entry' | 'exit', node: Omit<EntryNode, 'id'>) => void;
  onAddRoute: (name: string, entryNodeId: string, exitNodeId: string) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  entryNodes,
  exitNodes,
  cascadeRoutes,
  stats,
  onAddNode,
  onAddRoute,
}) => {
  const [tab, setTab] = useState<'marzban' | 'users' | 'payments'>('marzban');
  const [marzbanData, setMarzbanData] = useState<any>(null);
  
  React.useEffect(() => {
    fetch('/api/v1/admin/marzban/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
           setMarzbanData(data);
        }
      })
      .catch(() => {});
  }, []);


  // Payment Settings State
  const [cardlinkShopId, setCardlinkShopId] = useState('');
  const [cardlinkApiKey, setCardlinkApiKey] = useState('');
  const [cryptoBotToken, setCryptoBotToken] = useState('');
  const [walletTrc20, setWalletTrc20] = useState('TQn9Y2khEsLJW1ChV3o4e94J84k9L0m1aX');
  const [walletTon, setWalletTon] = useState('EQD12aX9vK8z_ExampleTonAddressForRASVPN');
  const [alfaAccount, setAlfaAccount] = useState('40817810505901273664');
  const [alfaRecipient, setAlfaRecipient] = useState('Баймурзаева Нурьяна Мурадовна');
  const [isSavingPayment, setIsSavingPayment] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState<string | null>(null);

  // New Node Form State
  const [nodeType, setNodeType] = useState<'entry' | 'exit'>('entry');
  const [nodeName, setNodeName] = useState('');
  const [nodeCode, setNodeCode] = useState('');
  const [nodeLocation, setNodeLocation] = useState('');
  const [nodeFlag, setNodeFlag] = useState('🇷🇺');
  const [nodeIp, setNodeIp] = useState('');
  const [nodePort, setNodePort] = useState(443);

  // New Route Form State
  const [routeName, setRouteName] = useState('');
  const [selectedEntryId, setSelectedEntryId] = useState(entryNodes[0]?.id || '');
  const [selectedExitId, setSelectedExitId] = useState(exitNodes[0]?.id || '');

  // Xray Config Generator State
  const [xrayEntryId, setXrayEntryId] = useState(entryNodes[0]?.id || '');
  const [xrayExitId, setXrayExitId] = useState(exitNodes[0]?.id || '');
  const [generatedEntryJson, setGeneratedEntryJson] = useState<string>('');
  const [generatedExitJson, setGeneratedExitJson] = useState<string>('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Marzban State
  const [marzbanUrl, setMarzbanUrl] = useState('http://89.22.225.206:8080');
  const [marzbanUser, setMarzbanUser] = useState('admin');
  const [marzbanPass, setMarzbanPass] = useState('');
  const [marzbanStatus, setMarzbanStatus] = useState<string | null>(null);
  const [isTestingMarzban, setIsTestingMarzban] = useState(false);

  React.useEffect(() => {
    fetch('/api/v1/admin/marzban')
      .then(res => res.json())
      .then(data => {
        if (data.url) setMarzbanUrl(data.url);
        if (data.username) setMarzbanUser(data.username);
        if (data.password) setMarzbanPass(data.password);
      })
      .catch(() => {});
  }, []);

  const handleSaveMarzban = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/v1/admin/marzban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: marzbanUrl, username: marzbanUser, password: marzbanPass })
      });
      setMarzbanStatus('Настройки сохранены');
      setTimeout(() => setMarzbanStatus(null), 3000);
    } catch {}
  };

  const handleTestMarzban = async () => {
    setIsTestingMarzban(true);
    setMarzbanStatus(null);
    try {
      const res = await fetch('/api/v1/admin/marzban/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: marzbanUrl, username: marzbanUser, password: marzbanPass })
      });
      const data = await res.json();
      if (data.success) {
        setMarzbanStatus('Успешное подключение к Marzban!');
      } else {
        setMarzbanStatus(data.error || 'Ошибка подключения');
      }
    } catch {
      setMarzbanStatus('Сбой запроса');
    }
    setIsTestingMarzban(false);
  };

  const handleCopyCode = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nodeName || !nodeIp) return;
    onAddNode(nodeType, {
      name: nodeName,
      code: nodeCode || (nodeType === 'entry' ? 'RU-NEW' : 'EU-NEW'),
      location: nodeLocation || 'Новый узел',
      flag: nodeFlag,
      ip: nodeIp,
      port: nodePort,
      status: 'online',
      loadPercent: 10,
      pingMs: 25,
    });
    setNodeName('');
    setNodeIp('');
  };

  const handleCreateRoute = (e: React.FormEvent) => {
    e.preventDefault();
    onAddRoute(routeName, selectedEntryId, selectedExitId);
    setRouteName('');
  };

  const fetchXrayConfigs = async () => {
    try {
      const res = await fetch(`/api/v1/admin/xray-config?entryId=${xrayEntryId}&exitId=${xrayExitId}`);
      const data = await res.json();
      setGeneratedEntryJson(data.entryConfigJson);
      setGeneratedExitJson(data.exitConfigJson);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      const res = await fetch('/api/v1/payment/settings');
      const data = await res.json();
      if (data) {
        if (data.cardlinkShopId) setCardlinkShopId(data.cardlinkShopId);
        if (data.walletTrc20) setWalletTrc20(data.walletTrc20);
        if (data.walletTon) setWalletTon(data.walletTon);
        if (data.alfaAccount) setAlfaAccount(data.alfaAccount);
        if (data.alfaRecipient) setAlfaRecipient(data.alfaRecipient);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPayment(true);
    try {
      const res = await fetch('/api/v1/admin/payment-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardlinkShopId,
          cardlinkApiKey,
          cryptoBotToken,
          walletTrc20,
          walletTon,
          alfaAccount,
          alfaRecipient,
        }),
      });
      const data = await res.json();
      setPaymentNotice(data.message || 'Настройки сохранены!');
      setTimeout(() => setPaymentNotice(null), 3500);
    } catch {
      setPaymentNotice('Ошибка при сохранении настроек');
      setTimeout(() => setPaymentNotice(null), 3000);
    } finally {
      setIsSavingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
            {/* Overview Stats Header */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Активных пользователей</div>
          <div className="text-xl font-bold text-cyan-400 mt-1">{marzbanData ? marzbanData.system.users_active : 0} / {marzbanData ? marzbanData.system.total_user : 0}</div>
        </div>
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Передано трафика (Marzban)</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {marzbanData ? (marzbanData.system.outgoing_bandwidth / 1073741824).toFixed(2) : 0} GB
          </div>
        </div>
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Узлов в сети</div>
          <div className="text-xl font-bold text-blue-400 mt-1">{marzbanData ? marzbanData.nodes.length : 0}</div>
        </div>
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Память сервера</div>
          <div className="text-xl font-bold text-purple-400 mt-1">
            {marzbanData ? ((marzbanData.system.mem_used / marzbanData.system.mem_total)*100).toFixed(1) : 0}%
          </div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 p-2 rounded-xl gap-2 text-xs font-semibold">
        <button
          onClick={() => setTab("marzban")}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            tab === "marzban" ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Marzban Integration</span>
        </button>
        <button
          onClick={() => setTab("users")}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            tab === "users" ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Пользователи (VLESS)</span>
        </button>
        <button
          onClick={() => {
            setTab('payments');
            fetchPaymentSettings();
          }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            tab === 'payments' ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Wallet className="w-4 h-4 text-emerald-400" />
          <span>💳 Оплата & Кошельки</span>
        </button>
      </div>


      
      {tab === 'users' && (
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-4">
            <Users className="w-5 h-5" />
            <span>Управление пользователями Marzban</span>
          </div>
          <p className="text-xs text-slate-400">
            Здесь отображаются пользователи, созданные в Marzban (включая тех, кто купил подписку через WebApp). Вы можете просматривать их лимиты и ссылки.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="px-4 py-3 rounded-tl-xl">Username</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3">Истекает</th>
                  <th className="px-4 py-3">Трафик</th>
                  <th className="px-4 py-3 rounded-tr-xl">Ссылки</th>
                </tr>
              </thead>
              <tbody>
                {marzbanData && marzbanData.users ? (
                  marzbanData.users.map((u: any) => (
                    <tr key={u.username} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                      <td className="px-4 py-3 font-mono text-cyan-400">{u.username}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${u.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">{u.expire ? new Date(u.expire * 1000).toLocaleDateString() : '∞'}</td>
                      <td className="px-4 py-3">{(u.used_traffic / 1073741824).toFixed(2)} GB / {u.data_limit ? (u.data_limit / 1073741824).toFixed(2) + ' GB' : '∞'}</td>
                      <td className="px-4 py-3">
                        {u.links && u.links.length > 0 ? (
                          <button 
                            onClick={() => {
                               navigator.clipboard.writeText(u.links.join('\n'));
                               alert('Ссылки скопированы!');
                            }}
                            className="bg-purple-600/20 text-purple-400 px-3 py-1 rounded-lg text-xs hover:bg-purple-600/40 transition-colors"
                          >
                            Копировать ({u.links.length})
                          </button>
                        ) : 'Нет'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                      Нет данных или панель Marzban не подключена
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'payments' && (
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white text-base flex items-center gap-2">
                <Wallet className="w-5 h-5 text-emerald-400" />
                <span>Настройка приема платежей & Крипто-кошельков</span>
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Укажите ваши реквизиты и API токены для прямого зачисления денег за подписки на ваш криптокошелек.
              </p>
            </div>
          </div>

          {paymentNotice && (
            <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-3 text-xs text-emerald-200 animate-fade-in flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{paymentNotice}</span>
            </div>
          )}

          <form onSubmit={handleSavePaymentSettings} className="space-y-4">
            {/* Cardlink Payment Gateway Integration */}
            <div className="bg-slate-950 p-4 rounded-xl border border-blue-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>💳 Платежный эквайринг Cardlink (https://cardlink.link)</span>
                </label>
                <a
                  href="https://cardlink.link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                >
                  Личный кабинет Cardlink ➔
                </a>
              </div>
              <p className="text-[11px] text-slate-400">
                Прием банковских карт (РФ, СБП, Visa/Mastercard, Мир, Криптовалюта). Автоматическое перенаправление клиентов на форму оплаты Cardlink.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Cardlink Shop ID (Идентификатор магазина)</label>
                  <input
                    type="text"
                    placeholder="Например: 12948"
                    value={cardlinkShopId}
                    onChange={e => setCardlinkShopId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono focus:border-cyan-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Cardlink API Secret Key (Секретный ключ)</label>
                  <input
                    type="password"
                    placeholder="Ваш секретный API ключ Cardlink"
                    value={cardlinkApiKey}
                    onChange={e => setCardlinkApiKey(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono focus:border-cyan-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Telegram CryptoBot Token */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <span>🤖 Telegram @CryptoBot API Token (CryptoPay)</span>
                </label>
                <a
                  href="https://t.me/CryptoBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Получить токен в @CryptoBot ➔
                </a>
              </div>
              <input
                type="text"
                placeholder="Например: 104928:AAFd83920193810293810"
                value={cryptoBotToken}
                onChange={e => setCryptoBotToken(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-white font-mono focus:border-cyan-500 outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Оплата покупателей зачисляется мгновенно на ваш баланс в Telegram @CryptoBot без комиссии сервиса!
              </p>
            </div>

            {/* Direct USDT TRC-20 Wallet */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-200 block">
                🪙 Ваш личный USDT TRC-20 Кошелек (Tron Network)
              </label>
              <input
                type="text"
                placeholder="TQn9Y2khEsLJW1ChV3o4e94J84k9L0m1aX"
                value={walletTrc20}
                onChange={e => setWalletTrc20(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-cyan-300 font-mono focus:border-cyan-500 outline-none"
              />
              <p className="text-[11px] text-slate-400">
                Сюда будут отправлять прямые переводы пользователи Trust Wallet, OKX, Binance и др.
              </p>
            </div>

            {/* Direct TON Wallet */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
              <label className="text-xs font-bold text-slate-200 block">
                💎 Ваш личный TON Кошелек (Tonkeeper / Telegram Wallet)
              </label>
              <input
                type="text"
                placeholder="EQD12aX9vK8z_ExampleTonAddressForRASVPN"
                value={walletTon}
                onChange={e => setWalletTon(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-xs text-cyan-300 font-mono focus:border-cyan-500 outline-none"
              />
            </div>

            {/* Alfa-Bank Requisites */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <div className="text-xs font-bold text-slate-200">🏦 Реквизиты Альфа-Банка для рублевых переводов</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">ФИО Получателя</label>
                  <input
                    type="text"
                    value={alfaRecipient}
                    onChange={e => setAlfaRecipient(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 mb-1 block">Номер счёта</label>
                  <input
                    type="text"
                    value={alfaAccount}
                    onChange={e => setAlfaAccount(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-cyan-300 font-mono"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingPayment}
              className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
            >
              {isSavingPayment ? (
                <span>Сохранение...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Сохранить настройки платежей</span>
                </>
              )}
            </button>
          </form>
        </div>
      )}
      {tab === 'marzban' && (
        <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-4">
            <Server className="w-5 h-5" />
            <span>Интеграция с Marzban Panel</span>
          </div>
          <p className="text-xs text-slate-400">
            Подключите веб-приложение к вашей панели Marzban для автоматической выдачи подписок (VLESS + Reality) и синхронизации серверов. 
            После настройки все узлы из Marzban могут автоматически добавляться в клиентские приложения.
          </p>

          <form onSubmit={handleSaveMarzban} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                URL панели Marzban (например: http://89.22.225.206:8080)
              </label>
              <input
                type="text"
                value={marzbanUrl}
                onChange={(e) => setMarzbanUrl(e.target.value)}
                placeholder="http://89.22.225.206:8080"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Логин администратора
                </label>
                <input
                  type="text"
                  value={marzbanUser}
                  onChange={(e) => setMarzbanUser(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Пароль администратора
                </label>
                <input
                  type="password"
                  value={marzbanPass}
                  onChange={(e) => setMarzbanPass(e.target.value)}
                  placeholder="Введите пароль..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all shadow-lg shadow-cyan-600/20"
              >
                Сохранить настройки
              </button>
              <button
                type="button"
                onClick={handleTestMarzban}
                disabled={isTestingMarzban}
                className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isTestingMarzban ? 'animate-spin' : ''}`} />
                <span>Проверить связь</span>
              </button>
            </div>

            {marzbanStatus && (
              <div className={`mt-3 p-3 rounded-xl border text-xs font-medium ${
                marzbanStatus.includes('Успешное') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                marzbanStatus.includes('сохранены') ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' :
                'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}>
                {marzbanStatus}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

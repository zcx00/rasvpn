import React, { useState } from 'react';
import { EntryNode, ExitNode, CascadeRoute, SystemStats } from '../types';
import { generateDockerComposeSnippet } from '../utils/xrayGenerator';
import { Server, Cpu, Activity, Plus, FileCode, Check, Copy, Shield, Network, RefreshCw, Terminal, CreditCard, Wallet } from 'lucide-react';

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
  const [tab, setTab] = useState<'nodes' | 'routes' | 'xray' | 'docker' | 'payments' | 'marzban'>('nodes');

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
        method: 'POST'
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
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Активных пользователей</div>
          <div className="text-xl font-bold text-cyan-400 mt-1">{stats.activeUsers}</div>
        </div>
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Передано трафика</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">{stats.totalTrafficTb} ТБ</div>
        </div>
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Каскадных маршрутов</div>
          <div className="text-xl font-bold text-amber-400 mt-1">{cascadeRoutes.length}</div>
        </div>
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
          <div className="text-xs text-slate-400">Узлов в сети</div>
          <div className="text-xl font-bold text-blue-400 mt-1">{entryNodes.length + exitNodes.length}</div>
        </div>
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 col-span-2 sm:col-span-1">
          <div className="text-xs text-slate-400">Средняя нагрузка</div>
          <div className="text-xl font-bold text-purple-400 mt-1">{stats.serverLoadAverage}%</div>
        </div>
      </div>

      {/* Admin Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/50 p-2 rounded-xl gap-2 text-xs font-semibold">
        <button
          onClick={() => setTab('nodes')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            tab === 'nodes' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Узлы (RU/EU Nodes)</span>
        </button>

        <button
          onClick={() => setTab('routes')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            tab === 'routes' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Каскады (RU ➔ EU)</span>
        </button>

        <button
          onClick={() => {
            setTab('xray');
            fetchXrayConfigs();
          }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            tab === 'xray' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
        <button
          onClick={() => setTab("marzban")}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            tab === "marzban" ? "bg-purple-600 text-white shadow-md" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Marzban Integration</span>
        </button>

          <FileCode className="w-4 h-4" />
          <span>Xray JSON Конфиги</span>
        </button>

        <button
          onClick={() => setTab('docker')}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            tab === 'docker' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Docker Compose</span>
        </button>

        <button
          onClick={() => {
            setTab('payments');
            fetchPaymentSettings();
          }}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all ${
            tab === 'payments' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wallet className="w-4 h-4 text-emerald-400" />
          <span>💳 Прием оплаты & Кошельки</span>
        </button>
      </div>

      {/* TAB 1: NODES MANAGEMENT */}
      {tab === 'nodes' && (
        <div className="space-y-6">
          {/* Node Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Entry Nodes */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <span>🇷🇺 Входные узлы (RU Entry Nodes)</span>
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono">
                  {entryNodes.length}
                </span>
              </h4>

              <div className="space-y-2">
                {entryNodes.map(node => (
                  <div key={node.id} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{node.flag}</span>
                        <span>{node.name}</span>
                        <span className="text-[10px] text-cyan-400 font-mono">({node.code})</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">{node.ip}:{node.port}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold block">🟢 Online</span>
                      <span className="text-slate-500 text-[10px]">{node.loadPercent}% load</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exit Nodes */}
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <span>🇪🇺 Выходные узлы (EU Exit Nodes)</span>
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono">
                  {exitNodes.length}
                </span>
              </h4>

              <div className="space-y-2">
                {exitNodes.map(node => (
                  <div key={node.id} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{node.flag}</span>
                        <span>{node.name}</span>
                        <span className="text-[10px] text-emerald-400 font-mono">({node.code})</span>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">{node.ip}:{node.port}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-400 font-bold block">🟢 Online</span>
                      <span className="text-slate-500 text-[10px]">{node.loadPercent}% load</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Node Form */}
          <form onSubmit={handleCreateNode} className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-400" />
              <span>Добавить новый серверный узел</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-slate-400 mb-1 block">Тип узла:</label>
                <select
                  value={nodeType}
                  onChange={e => {
                    const t = e.target.value as 'entry' | 'exit';
                    setNodeType(t);
                    setNodeFlag(t === 'entry' ? '🇷🇺' : '🇩🇪');
                  }}
                  className="w-full bg-slate-950 text-white p-2 rounded-lg border border-slate-800"
                >
                  <option value="entry">🇷🇺 RU Entry (Вход)</option>
                  <option value="exit">🇪🇺 EU Exit (Выход)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Название:</label>
                <input
                  type="text"
                  placeholder="e.g. Москва-04"
                  value={nodeName}
                  onChange={e => setNodeName(e.target.value)}
                  className="w-full bg-slate-950 text-white p-2 rounded-lg border border-slate-800"
                />
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Код (ID):</label>
                <input
                  type="text"
                  placeholder="e.g. RU-04"
                  value={nodeCode}
                  onChange={e => setNodeCode(e.target.value)}
                  className="w-full bg-slate-950 text-white p-2 rounded-lg border border-slate-800"
                />
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">IP Адрес:</label>
                <input
                  type="text"
                  placeholder="185.xxx.xxx.xxx"
                  value={nodeIp}
                  onChange={e => setNodeIp(e.target.value)}
                  className="w-full bg-slate-950 text-white p-2 rounded-lg border border-slate-800"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors"
            >
              Сохранить узел
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: ROUTE CASCADE BUILDER */}
      {tab === 'routes' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Network className="w-5 h-5 text-purple-400" />
              <span>Конструктор маршрутов каскадирования (RU ➔ EU)</span>
            </h4>

            <form onSubmit={handleCreateRoute} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-slate-400 mb-1 block">Название каскада:</label>
                <input
                  type="text"
                  placeholder="e.g. Германия 2"
                  value={routeName}
                  onChange={e => setRouteName(e.target.value)}
                  className="w-full bg-slate-950 text-white p-2.5 rounded-lg border border-slate-800"
                />
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Входной узел (RU):</label>
                <select
                  value={selectedEntryId}
                  onChange={e => setSelectedEntryId(e.target.value)}
                  className="w-full bg-slate-950 text-white p-2.5 rounded-lg border border-slate-800"
                >
                  {entryNodes.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.flag} {e.name} ({e.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 mb-1 block">Выходной узел (EU):</label>
                <select
                  value={selectedExitId}
                  onChange={e => setSelectedExitId(e.target.value)}
                  className="w-full bg-slate-950 text-white p-2.5 rounded-lg border border-slate-800"
                >
                  {exitNodes.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.flag} {e.name} ({e.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-4 rounded-lg text-xs transition-colors"
                >
                  Создать каскад
                </button>
              </div>
            </form>
          </div>

          {/* Active Routes Table */}
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-3">
            <h4 className="font-bold text-white text-sm">Активные каскадные цепочки</h4>
            <div className="space-y-2">
              {cascadeRoutes.map(route => {
                const entry = entryNodes.find(e => e.id === route.entryNodeId) || entryNodes[0];
                const exit = exitNodes.find(e => e.id === route.exitNodeId) || exitNodes[0];

                return (
                  <div key={route.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>{route.flag}</span>
                        <span>{route.name}</span>
                        <span className="text-slate-400 font-mono text-xs">({route.code})</span>
                      </div>
                      <div className="text-slate-400 mt-1 font-mono text-[11px]">
                        Вход: <span className="text-cyan-400">{entry.name} ({entry.ip})</span> ➔ Выход: <span className="text-emerald-400">{exit.name} ({exit.ip})</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-mono font-bold">
                        {route.totalPingMs} ms
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: XRAY JSON CONFIG GENERATOR */}
      {tab === 'xray' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 p-5 rounded-2xl border border-slate-800 space-y-4">
            <h4 className="font-bold text-white text-sm">Генератор конфигурационных файлов Xray</h4>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Выберите RU Entry узел:</label>
                <select
                  value={xrayEntryId}
                  onChange={e => setXrayEntryId(e.target.value)}
                  className="bg-slate-950 text-white p-2 rounded-lg border border-slate-800"
                >
                  {entryNodes.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.flag} {e.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Выберите EU Exit узел:</label>
                <select
                  value={xrayExitId}
                  onChange={e => setXrayExitId(e.target.value)}
                  className="bg-slate-950 text-white p-2 rounded-lg border border-slate-800"
                >
                  {exitNodes.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.flag} {e.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-5">
                <button
                  onClick={fetchXrayConfigs}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Сгенерировать</span>
                </button>
              </div>
            </div>

            {/* Generated Code Blocks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Entry Node Config */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-cyan-400 font-mono">/etc/xray/config.json (RU ENTRY)</span>
                  <button
                    onClick={() => handleCopyCode(generatedEntryJson, 'entry_json')}
                    className="text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'entry_json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Копировать</span>
                  </button>
                </div>
                <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 max-h-96 overflow-y-auto leading-tight">
                  {generatedEntryJson || 'Загрузка...' }
                </pre>
              </div>

              {/* Exit Node Config */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-400 font-mono">/etc/xray/config.json (EU EXIT)</span>
                  <button
                    onClick={() => handleCopyCode(generatedExitJson, 'exit_json')}
                    className="text-slate-400 hover:text-white flex items-center gap-1"
                  >
                    {copiedKey === 'exit_json' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>Копировать</span>
                  </button>
                </div>
                <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-emerald-300 max-h-96 overflow-y-auto leading-tight">
                  {generatedExitJson || 'Загрузка...' }
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DOCKER COMPOSE */}
      {tab === 'docker' && (
        <div className="space-y-4 bg-slate-900/90 p-5 rounded-2xl border border-slate-800">
          <h4 className="font-bold text-white text-sm">Docker Compose Развертывание (Ubuntu 24.04)</h4>
          <p className="text-xs text-slate-400">Скопируйте эти docker-compose файлы для развертывания Marzban + Backend и Xray Nodes:</p>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-amber-400 font-bold">docker-compose.yml (Management VPS)</span>
                <button
                  onClick={() => handleCopyCode(generateDockerComposeSnippet('master'), 'master_docker')}
                  className="text-slate-400 hover:text-white flex items-center gap-1 text-xs"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Копировать</span>
                </button>
              </div>
              <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 leading-tight">
                {generateDockerComposeSnippet('master')}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: PAYMENT SETTINGS & WALLETS */}
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

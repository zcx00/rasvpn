import React, { useState, useEffect } from 'react';
import { UserProfile, VpnSubscription, EntryNode, ExitNode, CascadeRoute, TariffPlan, ReferralStat, SystemStats } from './types';
import { 
  INITIAL_USER, 
  INITIAL_SUBSCRIPTION, 
  ENTRY_NODES, 
  EXIT_NODES, 
  CASCADE_ROUTES, 
  INITIAL_REFERRAL, 
  SYSTEM_STATS 
} from './data/mockData';
import { Header } from './components/Header';
import { SubscriptionCard } from './components/SubscriptionCard';
import { ConnectModal } from './components/ConnectModal';
import { CascadeServerList } from './components/CascadeServerList';
import { TariffsSection } from './components/TariffsSection';
import { ReferralProgram } from './components/ReferralProgram';
import { AdminPanel } from './components/AdminPanel';
import { SubscriptionWebPage } from './components/SubscriptionWebPage';
import { Shield, Server, CreditCard, Gift, Smartphone, Check, Zap, AlertCircle, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeView, setActiveView] = useState<'app' | 'sub' | 'admin'>('app');
  const [appTab, setAppTab] = useState<'main' | 'servers' | 'plans' | 'referrals'>('main');

  // Application state
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [subscription, setSubscription] = useState<VpnSubscription>(INITIAL_SUBSCRIPTION);
  const [entryNodes, setEntryNodes] = useState<EntryNode[]>(ENTRY_NODES);
  const [exitNodes, setExitNodes] = useState<ExitNode[]>(EXIT_NODES);
  const [cascadeRoutes, setCascadeRoutes] = useState<CascadeRoute[]>(CASCADE_ROUTES);
  const [referral, setReferral] = useState<ReferralStat>(INITIAL_REFERRAL);
  const [stats, setStats] = useState<SystemStats>(SYSTEM_STATS);

  // Modals
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch initial state from backend API if available
  useEffect(() => {
    fetch('/api/v1/user')
      .then(res => res.json())
      .then(data => {
        if (data.user) setUser(data.user);
        if (data.subscription) setSubscription(data.subscription);
        if (data.referral) setReferral(data.referral);
      })
      .catch(() => {
        // Fallback to local mock state if server is loading
      });

    fetch('/api/v1/servers')
      .then(res => res.json())
      .then(data => {
        if (data.entryNodes) setEntryNodes(data.entryNodes);
        if (data.exitNodes) setExitNodes(data.exitNodes);
        if (data.cascadeRoutes) setCascadeRoutes(data.cascadeRoutes);
      })
      .catch(() => {});
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectPlan = async (plan: TariffPlan, paymentMethod: string) => {
    try {
      const res = await fetch('/api/v1/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, paymentMethod }),
      });
      const data = await res.json();
      if (data.success && data.subscription) {
        setSubscription(data.subscription);
        showToast(`🎉 ${data.message}`);
        setAppTab('main');
      }
    } catch {
      // Local fallback
      const now = new Date();
      const expire = new Date(now.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
      setSubscription(prev => ({
        ...prev,
        planName: `Премиум VPN (${plan.name})`,
        expireDate: expire.toISOString().split('T')[0],
        trafficLimitGb: plan.trafficLimitGb,
        trafficUsedGb: 0,
      }));
      showToast(`🎉 Подписка на ${plan.name} успешно обновлена!`);
      setAppTab('main');
    }
  };

  const handleAddNode = async (type: 'entry' | 'exit', node: Omit<EntryNode, 'id'>) => {
    try {
      const res = await fetch('/api/v1/admin/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, node }),
      });
      const data = await res.json();
      if (data.success && data.node) {
        if (type === 'entry') setEntryNodes(prev => [...prev, data.node]);
        else setExitNodes(prev => [...prev, data.node]);
        showToast(`Узел ${node.name} добавлен!`);
      }
    } catch {
      const newNode = { ...node, id: `node_${Date.now()}` };
      if (type === 'entry') setEntryNodes(prev => [...prev, newNode]);
      else setExitNodes(prev => [...prev, newNode as ExitNode]);
      showToast(`Узел ${node.name} добавлен!`);
    }
  };

  const handleAddRoute = async (name: string, entryNodeId: string, exitNodeId: string) => {
    try {
      const res = await fetch('/api/v1/admin/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, entryNodeId, exitNodeId }),
      });
      const data = await res.json();
      if (data.success && data.route) {
        setCascadeRoutes(prev => [...prev, data.route]);
        showToast(`Маршрут каскада создан!`);
      }
    } catch {
      const entry = entryNodes.find(e => e.id === entryNodeId) || entryNodes[0];
      const exit = exitNodes.find(e => e.id === exitNodeId) || exitNodes[0];
      const newRoute: CascadeRoute = {
        id: `route_${Date.now()}`,
        name: name || exit.location,
        code: `RAS VPN ${exit.flag} ${exit.code}`,
        entryNodeId: entry.id,
        exitNodeId: exit.id,
        flag: exit.flag,
        totalPingMs: entry.pingMs + exit.pingMs,
        status: 'active',
      };
      setCascadeRoutes(prev => [...prev, newRoute]);
      showToast(`Маршрут каскада создан!`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Top Header Navigation */}
      <Header user={user} activeView={activeView} onViewChange={setActiveView} />

      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-slate-950 font-bold px-4 py-2 rounded-xl shadow-xl flex items-center gap-2 text-xs animate-bounce">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* VIEW 1: TELEGRAM MINI APP (app.rasvpna.ru) */}
      {activeView === 'app' && (
        <main className="max-w-2xl mx-auto px-3 sm:px-4 py-3 sm:py-6 space-y-4 sm:space-y-6 pb-10">
          {/* Active Subscription Status Card */}
          <SubscriptionCard
            subscription={subscription}
            onOpenConnectModal={() => setIsConnectModalOpen(true)}
            onRenewClick={() => setAppTab('plans')}
          />

          {/* Mini App Bottom Navigation Tabs */}
          <div className="grid grid-cols-4 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-[11px] sm:text-xs font-semibold">
            <button
              onClick={() => setAppTab('main')}
              className={`py-2.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
                appTab === 'main' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Главная</span>
            </button>

            <button
              onClick={() => setAppTab('servers')}
              className={`py-2.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
                appTab === 'servers' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Серверы</span>
            </button>

            <button
              onClick={() => setAppTab('plans')}
              className={`py-2.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
                appTab === 'plans' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Тарифы</span>
            </button>

            <button
              onClick={() => setAppTab('referrals')}
              className={`py-2.5 px-1 rounded-xl flex items-center justify-center gap-1 transition-all ${
                appTab === 'referrals' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Gift className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Рефералы</span>
            </button>
          </div>

          {/* TAB CONTENT */}
          {appTab === 'main' && (
            <div className="space-y-6">
              <CascadeServerList
                cascadeRoutes={cascadeRoutes}
                entryNodes={entryNodes}
                exitNodes={exitNodes}
              />
            </div>
          )}

          {appTab === 'servers' && (
            <CascadeServerList
              cascadeRoutes={cascadeRoutes}
              entryNodes={entryNodes}
              exitNodes={exitNodes}
            />
          )}

          {appTab === 'plans' && (
            <TariffsSection onSelectPlan={handleSelectPlan} />
          )}

          {appTab === 'referrals' && (
            <ReferralProgram referral={referral} />
          )}

          {/* Connect Modal */}
          <ConnectModal
            subscription={subscription}
            isOpen={isConnectModalOpen}
            onClose={() => setIsConnectModalOpen(false)}
          />
        </main>
      )}

      {/* VIEW 2: SUB LANDING WEB PAGE (sub.rasvpna.ru) */}
      {activeView === 'sub' && (
        <SubscriptionWebPage subscription={subscription} />
      )}

      {/* VIEW 3: ADMIN PANEL (admin.rasvpna.ru) */}
      {activeView === 'admin' && (
        <main className="max-w-5xl mx-auto px-4 py-6">
          <AdminPanel
            entryNodes={entryNodes}
            exitNodes={exitNodes}
            cascadeRoutes={cascadeRoutes}
            stats={stats}
            onAddNode={handleAddNode}
            onAddRoute={handleAddRoute}
          />
        </main>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { CascadeRoute, EntryNode, ExitNode } from '../types';
import { Server, ArrowRight, ShieldCheck, Sparkles, RefreshCw, Zap, CheckCircle2, Globe } from 'lucide-react';

interface CascadeServerListProps {
  cascadeRoutes: CascadeRoute[];
  entryNodes: EntryNode[];
  exitNodes: ExitNode[];
  onConnectClick?: () => void;
}

export const CascadeServerList: React.FC<CascadeServerListProps> = ({
  cascadeRoutes,
  entryNodes,
  exitNodes,
  onConnectClick,
}) => {
  const [activeTab, setActiveTab] = useState<'cascade' | 'standard'>('cascade');
  const [testingPing, setTestingPing] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(cascadeRoutes[0]?.id || '');

  const handleTestLatency = () => {
    setTestingPing(true);
    setTimeout(() => {
      setTestingPing(false);
    }, 1200);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
            <Server className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
            <span>Серверы и Серверные Локации</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Высокоскоростное <span className="text-cyan-300 font-semibold">Защищенное Соединение</span>
          </p>
        </div>

        <button
          onClick={handleTestLatency}
          disabled={testingPing}
          className="bg-slate-800 hover:bg-slate-700 active:scale-95 text-[11px] sm:text-xs text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-1.5 font-medium transition-all shrink-0 ml-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${testingPing ? 'animate-spin' : ''}`} />
          <span>{testingPing ? 'Измерение...' : 'Проверить пинг'}</span>
        </button>
      </div>

      {/* Subscription Type Switcher Tabs */}
      <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
        <button
          onClick={() => setActiveTab('cascade')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'cascade'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300 shrink-0" />
          <span>Обход глушилок (Каскад)</span>
        </button>

        <button
          onClick={() => setActiveTab('standard')}
          className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'standard'
              ? 'bg-gradient-to-r from-cyan-600 to-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
          <span>Обычная подписка</span>
        </button>
      </div>

      {/* Info Notice Banner */}
      <div className="text-xs p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-300">
        {activeTab === 'cascade' ? (
          <p className="leading-relaxed">
            🛡️ <strong className="text-amber-300">Каскадная подписка «Обход глушилок»:</strong> Подключение идет через <strong className="text-white">1 Российский сервер (Москва)</strong> с двойным шифрованным туннелем VLESS на <strong className="text-white">2 Зарубежных сервера</strong> (Нидерланды и Германия). Полная защита от блокировок ТСПУ РКН.
          </p>
        ) : (
          <p className="leading-relaxed">
            🌍 <strong className="text-cyan-300">Обычная подписка:</strong> Прямой доступ к <strong className="text-white">2 Зарубежным серверам</strong> (Нидерланды и Германия). Минимальный пинг для зарубежного трафика.
          </p>
        )}
      </div>

      {/* Server List */}
      {activeTab === 'cascade' ? (
        <div className="space-y-3">
          {cascadeRoutes.map(route => {
            const entry = entryNodes.find(e => e.id === route.entryNodeId) || entryNodes[0];
            const exit = exitNodes.find(e => e.id === route.exitNodeId) || exitNodes[0];
            const isSelected = selectedRouteId === route.id;

            return (
              <div
                key={route.id}
                onClick={() => setSelectedRouteId(route.id)}
                className={`group cursor-pointer rounded-2xl p-3.5 sm:p-4 border transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-blue-950/70 via-slate-900 to-slate-950 border-cyan-500/60 shadow-lg shadow-cyan-950/25'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl sm:text-3xl leading-none">🇷🇺 ➔ {exit.flag}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-white text-sm sm:text-base group-hover:text-cyan-300 transition-colors">
                          {route.name}
                        </h4>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>Каскад VLESS</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-cyan-300">Вход: Москва 🇷🇺</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-emerald-300">Выход: {exit.location.split(',')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                      {testingPing ? '⌛ ...' : `🟢 ${route.totalPingMs} ms`}
                    </span>
                  </div>
                </div>

                {/* Cascade Flow Diagram */}
                <div className="bg-slate-950/90 rounded-xl p-2.5 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                    <span>Маршрут VLESS Reality</span>
                    <span className="text-amber-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Обход ТСПУ
                    </span>
                  </div>

                  <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-medium">
                    <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                      <div className="text-xs">👤</div>
                      <div className="font-bold text-slate-200">Вы</div>
                      <div className="text-[8px] text-slate-500">Клиент</div>
                    </div>

                    <div className="bg-blue-950/40 p-1.5 rounded-lg border border-blue-800/40">
                      <div className="text-xs">🇷🇺</div>
                      <div className="font-bold text-blue-300">Москва</div>
                      <div className="text-[8px] text-blue-400">Вход РФ</div>
                    </div>

                    <div className="bg-indigo-950/40 p-1.5 rounded-lg border border-indigo-800/40">
                      <div className="text-xs">🔒</div>
                      <div className="font-bold text-indigo-300">Каскад</div>
                      <div className="text-[8px] text-indigo-400">VLESS</div>
                    </div>

                    <div className="bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-800/40">
                      <div className="text-xs">{exit.flag}</div>
                      <div className="font-bold text-emerald-300 truncate">{exit.location.split(',')[0]}</div>
                      <div className="text-[8px] text-emerald-400">Зарубеж</div>
                    </div>
                  </div>
                </div>

                {onConnectClick && (
                  <div className="flex justify-end mt-2 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onConnectClick();
                      }}
                      className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>Подключить</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Standard Direct Foreign Servers List */
        <div className="space-y-3">
          {exitNodes.map(node => (
            <div
              key={node.id}
              className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{node.flag}</span>
                  <div>
                    <h4 className="font-bold text-white text-base">{node.name}</h4>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      Стандартный доступ • {node.location}
                    </div>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  🟢 {node.pingMs} ms
                </span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
                <span>Скоростной канал</span>
                <span className="text-cyan-400 font-semibold">Прямое подключение</span>
              </div>

              {onConnectClick && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={onConnectClick}
                    className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Подключить</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

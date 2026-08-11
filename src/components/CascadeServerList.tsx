import React, { useState } from 'react';
import { CascadeRoute, EntryNode, ExitNode } from '../types';
import { Server, ArrowRight, ShieldCheck, Sparkles, RefreshCw, Zap, CheckCircle2 } from 'lucide-react';

interface CascadeServerListProps {
  cascadeRoutes: CascadeRoute[];
  entryNodes: EntryNode[];
  exitNodes: ExitNode[];
}

export const CascadeServerList: React.FC<CascadeServerListProps> = ({
  cascadeRoutes,
  entryNodes,
  exitNodes,
}) => {
  const [testingPing, setTestingPing] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string>(cascadeRoutes[0]?.id || '');
  const [filterTag, setFilterTag] = useState<string>('all');

  const handleTestLatency = () => {
    setTestingPing(true);
    setTimeout(() => {
      setTestingPing(false);
    }, 1200);
  };

  const filteredRoutes = cascadeRoutes.filter(route => {
    if (filterTag === 'fast') return route.totalPingMs < 45;
    if (filterTag === 'media') return route.recommendedFor.some(r => r.includes('YouTube') || r.includes('Instagram') || r.includes('Игры'));
    return true;
  });

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
            Защищенный протокол <span className="text-cyan-300 font-semibold">VLESS + Reality (XTLS-Vision)</span>
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => setFilterTag('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            filterTag === 'all'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
              : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          Все серверы ({cascadeRoutes.length})
        </button>
        <button
          onClick={() => setFilterTag('fast')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            filterTag === 'fast'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
              : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          ⚡ Низкий пинг (&lt;45 ms)
        </button>
        <button
          onClick={() => setFilterTag('media')}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            filterTag === 'media'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
              : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200'
          }`}
        >
          🎬 Видео & Игры
        </button>
      </div>

      {/* Server Cards List */}
      <div className="space-y-3">
        {filteredRoutes.map(route => {
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
              {/* Card Header Info */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl sm:text-3xl leading-none">{route.flag}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-white text-sm sm:text-base group-hover:text-cyan-300 transition-colors">
                        {route.name}
                      </h4>
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{route.code}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-300 font-sans">{exit.location.split(',')[0]}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[11px] sm:text-xs font-mono font-bold px-2.5 py-0.5 sm:py-1 rounded-full border ${
                      testingPing
                        ? 'bg-slate-800 text-slate-400 border-slate-700 animate-pulse'
                        : route.totalPingMs < 40
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : route.totalPingMs < 60
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {testingPing ? '⌛ ...' : `🟢 ${route.totalPingMs} ms`}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Нагрузка: {Math.floor(25 + Math.random() * 30)}%
                  </span>
                </div>
              </div>

              {/* Interactive VLESS Connection Path Flow Diagram */}
              <div className="bg-slate-950/90 rounded-xl p-2.5 border border-slate-800/90 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                  <span>Схема VLESS + Reality</span>
                  <span className="text-cyan-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    Зашифровано
                  </span>
                </div>

                {/* Flow Diagram Stage Boxes */}
                <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] sm:text-xs font-medium">
                  {/* Stage 1: User */}
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-xs">👤</span>
                    <span className="font-bold text-slate-200">Вы</span>
                    <span className="text-[9px] text-slate-500 font-mono">Устройство</span>
                  </div>

                  {/* Stage 2: VLESS Tunnel */}
                  <div className="bg-cyan-950/30 p-2 rounded-lg border border-cyan-800/40 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-xs">🔒</span>
                    <span className="font-bold text-cyan-300">VLESS</span>
                    <span className="text-[9px] text-cyan-400/80 font-mono">XTLS-Vision</span>
                  </div>

                  {/* Stage 3: Server Location Exit */}
                  <div className="bg-emerald-950/30 p-2 rounded-lg border border-emerald-800/40 flex flex-col items-center justify-center gap-0.5">
                    <span className="text-xs">{exit.flag}</span>
                    <span className="font-bold text-emerald-300 truncate max-w-full">
                      {exit.location.split(',')[0]}
                    </span>
                    <span className="text-[9px] text-emerald-400/80 font-mono">Интернет</span>
                  </div>
                </div>
              </div>

              {/* Recommended Tags */}
              {route.recommendedFor && route.recommendedFor.length > 0 && (
                <div className="flex items-center gap-1.5 mt-2.5 pt-2 border-t border-slate-800/60">
                  <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                  <span className="text-[10px] text-slate-400 font-medium shrink-0">Для:</span>
                  <div className="flex flex-wrap gap-1">
                    {route.recommendedFor.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded-md border border-slate-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

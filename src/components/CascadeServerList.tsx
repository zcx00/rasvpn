import React, { useState } from 'react';
import { ExitNode } from '../types';
import { Server, RefreshCw, Zap } from 'lucide-react';

interface CascadeServerListProps {
  exitNodes: ExitNode[];
  onConnectClick?: () => void;
}

export const CascadeServerList: React.FC<CascadeServerListProps> = ({
  exitNodes,
  onConnectClick,
}) => {
  const [testingPing, setTestingPing] = useState(false);

  const handleTestLatency = () => {
    setTestingPing(true);
    setTimeout(() => {
      setTestingPing(false);
    }, 1200);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
      {/* Title Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/60 pb-4">
        <div>
          <h3 className="font-bold text-white text-base sm:text-lg flex items-center gap-2.5">
            <Server className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>Доступные локации (Marzban Nodes)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Высокоскоростное подключение через протокол VLESS + Reality
          </p>
        </div>

        <button
          onClick={handleTestLatency}
          disabled={testingPing}
          className="bg-slate-800/80 hover:bg-slate-700/80 active:scale-95 text-xs text-slate-200 px-3.5 py-2 rounded-xl border border-slate-700 flex items-center gap-2 font-medium transition-all shrink-0 shadow-lg shadow-black/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${testingPing ? 'animate-spin' : ''}`} />
          <span>{testingPing ? 'Измерение...' : 'Проверить пинг'}</span>
        </button>
      </div>

      {/* Servers List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-1">
        {exitNodes.map(node => (
          <div
            key={node.id}
            className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800/80 rounded-2xl p-4 sm:p-5 space-y-4 hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-2xl sm:text-3xl shadow-inner group-hover:scale-105 transition-transform">
                  {node.flag}
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base group-hover:text-cyan-300 transition-colors">{node.name}</h4>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {node.location}
                  </div>
                </div>
              </div>

              <span className="text-[10px] sm:text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
                {testingPing ? '⌛ ...' : `🟢 ${node.pingMs} ms`}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950 p-2.5 rounded-xl border border-slate-800/60 shadow-inner">
              <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-slate-500" /> VLESS Reality</span>
              <span className="text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">10 Гбит/с</span>
            </div>

            {onConnectClick && (
              <div className="pt-2 border-t border-slate-800/60">
                <button
                  onClick={onConnectClick}
                  className="w-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] group-hover:bg-cyan-600 group-hover:text-white group-hover:border-cyan-500 group-hover:shadow-lg group-hover:shadow-cyan-500/20"
                >
                  <Zap className="w-4 h-4" />
                  <span>Выбрать и подключить</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

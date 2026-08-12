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
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
            <Server className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
            <span>Доступные серверы (4 локации)</span>
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
            Прямое скоростное подключение к локациям
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

      {/* 4 Servers List */}
      <div className="space-y-3">
        {exitNodes.map(node => (
          <div
            key={node.id}
            className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3.5 sm:p-4 space-y-3 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl sm:text-3xl">{node.flag}</span>
                <div>
                  <h4 className="font-bold text-white text-sm sm:text-base">{node.name}</h4>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {node.location}
                  </div>
                </div>
              </div>

              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {testingPing ? '⌛ ...' : `🟢 ${node.pingMs} ms`}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-300">Прямое подключение</span>
              <span className="text-cyan-400 font-semibold">10 Гбит/с</span>
            </div>

            {onConnectClick && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={onConnectClick}
                  className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Подключить</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

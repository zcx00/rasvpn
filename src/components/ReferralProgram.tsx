import React, { useState } from 'react';
import { ReferralStat } from '../types';
import { Users, Copy, Check, Gift, Award, ArrowUpRight } from 'lucide-react';

interface ReferralProgramProps {
  referral: ReferralStat;
}

export const ReferralProgram: React.FC<ReferralProgramProps> = ({ referral }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referral.inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      <div>
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <Gift className="w-5 h-5 text-amber-400" />
          <span>Реферальная программа</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Приглашайте друзей и получайте <span className="text-amber-300 font-semibold">+15 дней VPN</span> за каждого друга!
        </p>
      </div>

      {/* Invite Link Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-950 to-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-2">
        <div className="text-xs font-semibold text-amber-300 flex items-center justify-between">
          <span>Ваша пригласительная ссылка:</span>
          <span className="font-mono text-[11px] bg-amber-500/20 px-2 py-0.5 rounded text-amber-200">
            {referral.referralCode}
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-xs">
          <input
            type="text"
            readOnly
            value={referral.inviteLink}
            className="bg-transparent text-amber-200 font-mono w-full focus:outline-none truncate text-[11px]"
          />
          <button
            onClick={handleCopy}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-3 py-1.5 rounded-md font-bold transition-colors shrink-0 flex items-center gap-1"
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

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 mb-1">Приглашено</div>
          <div className="text-xl font-bold text-white">{referral.totalInvited}</div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 mb-1">Активных</div>
          <div className="text-xl font-bold text-emerald-400">{referral.activeSubscribers}</div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 mb-1">Бонусных дней</div>
          <div className="text-xl font-bold text-cyan-400">+{referral.earnedBonusDays}</div>
        </div>

        <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
          <div className="text-[11px] text-slate-400 mb-1">Заработано</div>
          <div className="text-xl font-bold text-amber-400">{referral.earnedRubles} ₽</div>
        </div>
      </div>

      {/* Referral History */}
      <div>
        <div className="text-xs font-semibold text-slate-300 mb-2">История вознаграждений:</div>
        <div className="space-y-1.5">
          {referral.history.map(item => (
            <div
              key={item.id}
              className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-slate-200">@{item.username}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-500 text-[11px]">{item.date}</span>
                <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {item.reward}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { TariffPlan } from '../types';
import { TARIFF_PLANS } from '../data/mockData';
import { CreditCard, Check, Star, Lock, Globe } from 'lucide-react';

interface TariffsSectionProps {
  onSelectPlan: (plan: TariffPlan, paymentMethod: string) => void;
}

export const TariffsSection: React.FC<TariffsSectionProps> = ({ onSelectPlan }) => {
  const [selectedPlan, setSelectedPlan] = useState<TariffPlan>(TARIFF_PLANS[0]);
  const [processing, setProcessing] = useState(false);

  const handleCheckout = () => {
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      onSelectPlan(selectedPlan, 'sbp');
    }, 800);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      <div>
        <h3 className="font-bold text-white text-base flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-cyan-400" />
          <span>Тарифные планы RAS VPN</span>
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Выберите подходящий тарифный план для всех ваших устройств
        </p>
      </div>

      {/* Description Info Banner */}
      <div className="text-xs p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-300 flex items-start gap-2.5">
        <Globe className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-cyan-300">Доступ к 4 локациям:</span> Нидерланды 🇳🇱, Германия 🇩🇪, Чехия 🇨🇿, Россия 🇷🇺. Без ограничений по устройствам и трафику.
        </div>
      </div>

      {/* Tariff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TARIFF_PLANS.map(plan => {
          const isSelected = selectedPlan.id === plan.id;

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              className={`relative cursor-pointer rounded-xl p-4 border transition-all ${
                isSelected
                  ? 'bg-blue-950/40 border-cyan-400 shadow-lg shadow-cyan-950/30 ring-1 ring-cyan-400/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full shadow-md flex items-center gap-1">
                  <Star className="w-2.5 h-2.5 fill-slate-950" />
                  Популярный
                </span>
              )}

              {plan.discountPercent && !plan.popular && (
                <span className="absolute -top-2.5 right-3 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold text-[9px] px-2 py-0.5 rounded-full">
                  -{plan.discountPercent}%
                </span>
              )}

              <div className="text-sm font-bold text-white mb-1">{plan.name}</div>
              <div className="text-2xl font-black text-cyan-400 mb-2">
                {plan.priceRub} <span className="text-xs text-slate-400 font-normal">₽</span>
              </div>

              <div className="text-xs text-slate-300 space-y-1.5 border-t border-slate-800/80 pt-2.5">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{plan.trafficLimitGb} ГБ скоростного трафика</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>4 локации (NL, DE, CZ, RU)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>5 устройств одновременно</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Button */}
      <button
        onClick={handleCheckout}
        disabled={processing}
        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm mt-4"
      >
        <Lock className="w-4 h-4" />
        <span>
          {processing ? 'Обработка...' : `Оплатить через СБП (${selectedPlan.priceRub} ₽)`}
        </span>
      </button>
    </div>
  );
};

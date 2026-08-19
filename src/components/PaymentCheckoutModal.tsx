import React, { useState } from 'react';
import { TariffPlan } from '../types';
import { X, Zap, Shield, Check, Lock, ArrowRight, Info, RefreshCw } from 'lucide-react';

interface PaymentCheckoutModalProps {
  plan: TariffPlan | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (plan: TariffPlan, method: string) => void;
}

export const PaymentCheckoutModal: React.FC<PaymentCheckoutModalProps> = ({
  plan,
  isOpen,
  onClose,
  onConfirmPayment,
}) => {
  const [step, setStep] = useState<'init' | 'instructions'>('init');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !plan) return null;

  const handleOpenInstructions = () => {
    setStep('instructions');
  };

  const handleFinalizePayment = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/v1/payment/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, method: 'platega' }),
      });
      const data = await res.json();
      
      if (data.success && data.invoice) {
        if (data.invoice.plategaUrl) {
           window.location.href = data.invoice.plategaUrl;
           return;
        } else if (data.invoice.cardlinkUrl) {
           window.location.href = data.invoice.cardlinkUrl;
           return;
        }
      }
    } catch (e) {
      console.error(e);
    }
    
    // Fallback if APIs are not configured
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmPayment(plan, 'sbp');
      setStep('init');
    }, 1200);
  };

  const handleCloseModal = () => {
    setStep('init');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">Оплата через СБП</h3>
              <p className="text-[11px] text-slate-400">Система быстрых платежей • 0% комиссия</p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Order Summary Box */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-slate-400">Выбранный тариф:</div>
            <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span>{plan.name}</span>
              <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-mono">
                {plan.durationDays} дней
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400">К оплате:</div>
            <div className="text-xl font-black text-cyan-400">
              {plan.priceRub} ₽
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {step === 'init' ? (
            <div className="space-y-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Zap className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Быстрая оплата по СБП</div>
                    <div className="text-xs text-slate-400 mt-0.5">Мгновенное зачисление и активация подписки</div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleOpenInstructions}
                className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm mt-2"
              >
                <span>Оплатить через СБП ({plan.priceRub} ₽)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Instructions Placeholder Card */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-xl border border-cyan-500/30 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <Info className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">Инструкция по оплате СБП</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                      Подробная инструкция по переходу и реквизиты для оплаты через Систему быстрых платежей (СБП) последуют далее.
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-2">
                  <div className="font-semibold text-cyan-300 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    Порядок действий:
                  </div>
                  <ul className="space-y-1.5 text-slate-300 pl-1 text-[11px] leading-relaxed">
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-cyan-400">1.</span>
                      <span>Ознакомьтесь с поступающими инструкциями по платежу СБП.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-cyan-400">2.</span>
                      <span>Выполните перевод средств в банковском приложении.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="font-bold text-cyan-400">3.</span>
                      <span>Нажмите кнопку ниже для подтверждения и включения подписки.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleFinalizePayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Обработка платежа...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Я оплатил {plan.priceRub} ₽ (Подтвердить)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setStep('init')}
                  disabled={isProcessing}
                  className="w-full text-xs text-slate-400 hover:text-white py-2 transition-colors"
                >
                  ← Назад
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

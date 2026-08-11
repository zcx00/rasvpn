import React, { useState } from 'react';
import { TariffPlan } from '../types';
import { X, CreditCard, Zap, Shield, Check, QrCode, Lock, ArrowRight, ExternalLink, Wallet, Star } from 'lucide-react';

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
  const [method, setMethod] = useState<'sbp' | 'card' | 'stars' | 'crypto'>('sbp');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'pay'>('select');

  if (!isOpen || !plan) return null;

  const handleProceedToPay = () => {
    setStep('pay');
  };

  const handleFinalizePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmPayment(plan, method);
      setStep('select');
    }, 1200);
  };

  const getStarsCount = (rub: number) => Math.ceil(rub / 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
              <CreditCard className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">Оформление подписки</h3>
              <p className="text-[11px] text-slate-400">RAS VPN • VLESS + Reality</p>
            </div>
          </div>
          <button
            onClick={onClose}
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
          {step === 'select' && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-300">Выберите удобный способ оплаты:</div>

              <div className="grid grid-cols-1 gap-2.5">
                {/* SBP */}
                <button
                  onClick={() => setMethod('sbp')}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    method === 'sbp'
                      ? 'bg-blue-600/15 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⚡</span>
                    <div>
                      <div className="text-sm font-bold flex items-center gap-1.5">
                        <span>СБП (Система быстрых платежей)</span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-semibold">
                          0% комиссия
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Оплата по QR или в приложении банка</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${method === 'sbp' ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'}`}>
                    {method === 'sbp' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                  </div>
                </button>

                {/* Card */}
                <button
                  onClick={() => setMethod('card')}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    method === 'card'
                      ? 'bg-blue-600/15 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💳</span>
                    <div>
                      <div className="text-sm font-bold">Карта РФ (МИР, Visa, Mastercard)</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Мгновенное зачисление</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${method === 'card' ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'}`}>
                    {method === 'card' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                  </div>
                </button>

                {/* Telegram Stars */}
                <button
                  onClick={() => setMethod('stars')}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    method === 'stars'
                      ? 'bg-blue-600/15 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">⭐</span>
                    <div>
                      <div className="text-sm font-bold flex items-center gap-1.5">
                        <span>Telegram Stars</span>
                        <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">
                          {getStarsCount(plan.priceRub)} ⭐
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Прямо внутри Telegram в 1 клик</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${method === 'stars' ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'}`}>
                    {method === 'stars' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                  </div>
                </button>

                {/* Crypto */}
                <button
                  onClick={() => setMethod('crypto')}
                  className={`p-3.5 rounded-xl border text-left flex items-center justify-between transition-all ${
                    method === 'crypto'
                      ? 'bg-blue-600/15 border-cyan-400 text-white shadow-md shadow-cyan-500/10'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🪙</span>
                    <div>
                      <div className="text-sm font-bold">Криптовалюта (USDT / TON)</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">TRC20, TON Wallet, CryptoPay</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${method === 'crypto' ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'}`}>
                    {method === 'crypto' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                  </div>
                </button>
              </div>

              <button
                onClick={handleProceedToPay}
                className="w-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm mt-2"
              >
                <span>Перейти к оплате ({plan.priceRub} ₽)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 'pay' && (
            <div className="space-y-4">
              {/* Payment Details per Method */}
              {method === 'sbp' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-3">
                  <div className="text-xs font-semibold text-slate-300">Оплата через СБП (Система Быстрых Платежей)</div>
                  
                  {/* Simulated SBP QR */}
                  <div className="w-40 h-40 bg-white p-2 rounded-xl mx-auto flex items-center justify-center shadow-lg">
                    <div className="w-full h-full border-2 border-slate-900 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-900 p-2 text-center">
                      <QrCode className="w-16 h-16 text-slate-900 mb-1" />
                      <span className="text-[9px] font-bold">СБП {plan.priceRub} ₽</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Отсканируйте QR-код в приложении любого банка РФ или переведите {plan.priceRub} ₽ по номеру телефона СБП:
                  </p>
                  
                  <div className="bg-slate-900 p-2.5 rounded-lg text-xs font-mono text-cyan-300 flex items-center justify-between">
                    <span>+7 (999) 000-00-00 (Т-Банк / Сбер)</span>
                    <span className="text-[10px] text-slate-500">СБП</span>
                  </div>
                </div>
              )}

              {method === 'card' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Шлюз ЮKassa / Карта РФ</span>
                    <span className="text-[10px] text-emerald-400 font-mono">256-bit SSL</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[11px] text-slate-400 mb-1 block">Номер карты</label>
                      <input
                        type="text"
                        readOnly
                        value="2200 •••• •••• 4589"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-400 mb-1 block">Срок действия</label>
                        <input
                          type="text"
                          readOnly
                          value="12/28"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 mb-1 block">CVC / CWW</label>
                        <input
                          type="password"
                          readOnly
                          value="•••"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {method === 'stars' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-300 text-2xl">
                    ⭐
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Оплата Telegram Stars</div>
                    <div className="text-xs text-slate-400 mt-1">
                      Стоимость: <span className="font-bold text-amber-300">{getStarsCount(plan.priceRub)} ⭐ Stars</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Оплата спишется с вашего баланса Telegram Stars и моментально активирует подписку.
                  </p>
                </div>
              )}

              {method === 'crypto' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center space-y-3">
                  <div className="text-xs font-semibold text-slate-300">Перевод USDT TRC20 / TON</div>
                  <div className="bg-slate-900 p-2.5 rounded-lg text-xs font-mono text-cyan-300 break-all select-all text-left">
                    EQD12aX9vK8z_ExampleTonAddressForRASVPN
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Переведите эквивалент {plan.priceRub} ₽ (~{(plan.priceRub / 95).toFixed(2)} USDT) на указанный адрес.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={handleFinalizePayment}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isProcessing ? 'Проверка платежа...' : `Я оплатил ${plan.priceRub} ₽ (Подтвердить)`}
                  </span>
                </button>

                <button
                  onClick={() => setStep('select')}
                  className="w-full text-xs text-slate-400 hover:text-white py-2 transition-colors"
                >
                  ← Выбрать другой способ оплаты
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

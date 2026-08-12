import React, { useState, useEffect } from 'react';
import { TariffPlan, CryptoInvoice } from '../types';
import { X, CreditCard, Zap, Shield, Check, QrCode, Lock, ArrowRight, ExternalLink, Wallet, Star, RefreshCw, AlertCircle } from 'lucide-react';

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
  const [method, setMethod] = useState<'sbp' | 'stars' | 'crypto'>('sbp');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'select' | 'pay'>('select');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Invoice & Verification State
  const [invoice, setInvoice] = useState<CryptoInvoice | null>(null);
  const [isLoadingInvoice, setIsLoadingInvoice] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [txHashInput, setTxHashInput] = useState('');
  const [verificationNotice, setVerificationNotice] = useState<string | null>(null);

  if (!isOpen || !plan) return null;

  const copyText = (text: string, fieldName: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleProceedToPay = async () => {
    setStep('pay');
    setIsLoadingInvoice(true);
    try {
      const res = await fetch('/api/v1/payment/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan.id, method }),
      });
      const data = await res.json();
      if (data.success) {
        setInvoice(data.invoice);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingInvoice(false);
    }
  };

  const handleVerifyStatus = async () => {
    setIsVerifying(true);
    try {
      const invId = invoice?.id || `INV-${Date.now().toString().slice(-6)}`;
      const res = await fetch('/api/v1/payment/check-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId: invId, txHash: txHashInput }),
      });
      const data = await res.json();
      if (data.success) {
        setVerificationNotice('🎉 Оплата зачислена! Подписка активирована.');
        setTimeout(() => {
          setIsVerifying(false);
          onConfirmPayment(plan, method);
          setStep('select');
          setInvoice(null);
          setVerificationNotice(null);
        }, 1200);
      }
    } catch {
      setIsVerifying(false);
    }
  };

  const handleFinalizePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmPayment(plan, method);
      setStep('select');
      setInvoice(null);
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
                      <div className="text-[11px] text-slate-400 mt-0.5">Мгновенная оплата по СБП и банковским картам</div>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${method === 'sbp' ? 'border-cyan-400 bg-cyan-400' : 'border-slate-600'}`}>
                    {method === 'sbp' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
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
              {/* SBP & Cardlink Method */}
              {method === 'sbp' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/30 space-y-3.5">
                  <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                    <span>⚡ Оплата по СБП (Cardlink.link)</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                      {invoice ? invoice.id : 'Загрузка...'}
                    </span>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-teal-950/60 p-4 rounded-xl border border-emerald-500/30 text-center space-y-3">
                    <div className="flex items-center justify-center gap-2 text-white">
                      <span className="text-2xl">⚡</span>
                      <div className="text-left">
                        <div className="text-xs font-bold text-white">Система быстрых платежей (СБП)</div>
                        <div className="text-[10px] text-emerald-300">Прямой переход в ваш банк • Cardlink эквайринг</div>
                      </div>
                    </div>

                    <a
                      href={invoice?.cardlinkUrl || invoice?.payUrl || `https://cardlink.link/bill/create?amount=${plan.priceRub}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-extrabold text-xs py-3 px-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/25 active:scale-95"
                    >
                      <span>Оплатить {plan.priceRub} ₽ через Cardlink / СБП</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* SBP QR Code */}
                  <div className="w-40 h-40 bg-white p-2 rounded-xl mx-auto flex flex-col items-center justify-center shadow-xl relative group">
                    <div className="w-full h-full border-2 border-slate-900 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-900 p-2 text-center bg-slate-50">
                      <QrCode className="w-16 h-16 text-slate-900 mb-1" />
                      <span className="text-[9px] font-black tracking-wide text-slate-800 uppercase">СБП • {plan.priceRub} ₽</span>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <a
                      href={`https://qr.nspk.ru/BS1000${Math.floor(100000000000 + Math.random() * 900000000000)}?type=01&bank=100000000005&sum=${plan.priceRub * 100}&cur=RUB&crc=8423`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-bold py-2.5 px-3 rounded-lg border border-slate-800 flex items-center justify-center gap-2 transition-colors"
                    >
                      <span>Открыть приложение банка (СБП НСПК)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    После завершения оплаты нажмите <span className="text-emerald-400 font-bold">«Я оплатил»</span> ниже для автоматической проверки зачисления.
                  </p>
                </div>
              )}

              {/* Bank Requisites (Alfa-Bank) */}
              {method === 'card' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                    <span>💳 Оплата по реквизитам счета</span>
                    <span className="text-[10px] text-cyan-400 font-mono">АО «Альфа-Банк»</span>
                  </div>

                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2 text-[11px]">
                    {/* Recipient */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">Получатель:</span>
                      <span className="text-white font-semibold text-right">Баймурзаева Нурьяна Мурадовна</span>
                    </div>

                    {/* Account Number */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">Номер счёта:</span>
                      <button
                        onClick={() => copyText('40817810505901273664', 'bank_account')}
                        className="font-mono text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 active:scale-95 transition-all text-[11px]"
                      >
                        {copiedField === 'bank_account' ? (
                          <span className="text-emerald-400">Скопировано</span>
                        ) : (
                          <span>40817810505901273664</span>
                        )}
                      </button>
                    </div>

                    {/* Bank Name */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">Банк получателя:</span>
                      <span className="text-slate-200 font-medium">АО «Альфа-Банк», г. Москва</span>
                    </div>

                    {/* BIK */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">БИК:</span>
                      <button
                        onClick={() => copyText('044525593', 'bank_bik')}
                        className="font-mono text-slate-200 hover:text-cyan-300 font-medium flex items-center gap-1"
                      >
                        {copiedField === 'bank_bik' ? <span className="text-emerald-400">Скопировано</span> : <span>044525593</span>}
                      </button>
                    </div>

                    {/* INN */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">ИНН Банка:</span>
                      <span className="font-mono text-slate-300">7728168971</span>
                    </div>

                    {/* KPP */}
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
                      <span className="text-slate-400">КПП Банка:</span>
                      <span className="font-mono text-slate-300">770801001</span>
                    </div>

                    {/* Corr Account */}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Кор. счёт:</span>
                      <span className="font-mono text-slate-300">30101810200000000593</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    Переведите <span className="text-cyan-300 font-bold">{plan.priceRub} ₽</span> по указанным реквизитам Альфа-Банка и нажмите «Я оплатил».
                  </p>
                </div>
              )}

              {/* Telegram Stars */}
              {method === 'stars' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/20 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-300 text-2xl">
                    ⭐
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Оплата Telegram Stars</div>
                    <div className="text-xs text-slate-400 mt-1">
                      К списанию: <span className="font-bold text-amber-300">{getStarsCount(plan.priceRub)} ⭐ Stars</span>
                    </div>
                  </div>
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1 text-left">
                    <div className="text-[11px] text-slate-400">Реквизиты Telegram:</div>
                    <div className="font-medium text-amber-200">Официальный бот подписок RAS VPN (@ras_vpn_bot)</div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Оплата мгновенно спишется с вашего баланса Telegram Stars.
                  </p>
                </div>
              )}

              {/* Crypto via @CryptoBot & Direct Wallet */}
              {method === 'crypto' && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                    <span>🪙 Оплата на Криптокошелек / @CryptoBot</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                      {invoice ? invoice.id : 'Загрузка...'}
                    </span>
                  </div>

                  {verificationNotice && (
                    <div className="bg-emerald-950/80 border border-emerald-500/50 rounded-xl p-3 text-xs text-emerald-200 animate-fade-in flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{verificationNotice}</span>
                    </div>
                  )}

                  {/* CryptoBot Primary Action */}
                  <div className="bg-gradient-to-br from-blue-950/60 via-slate-900 to-indigo-950/60 p-3.5 rounded-xl border border-blue-500/30 text-center space-y-2.5">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl">🤖</span>
                      <div className="text-left">
                        <div className="text-xs font-bold text-white">Автоматический счет в Telegram @CryptoBot</div>
                        <div className="text-[10px] text-blue-300">
                          {invoice ? `${invoice.amountUsdt} USDT • ${invoice.amountTon} TON` : 'Расчет суммы...'}
                        </div>
                      </div>
                    </div>

                    <a
                      href={invoice?.payUrl || `https://t.me/CryptoBot?start=pay_${plan.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                    >
                      <span>
                        Открыть @CryptoBot (~{invoice ? invoice.amountUsdt : (plan.priceRub / 95).toFixed(2)} USDT)
                      </span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Direct Wallet Options */}
                  <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] font-semibold text-slate-300">Прямой перевод на личный кошелек:</div>
                      {invoice?.memoCode && (
                        <div className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                          Код заказа: {invoice.memoCode}
                        </div>
                      )}
                    </div>

                    {/* USDT TRC-20 */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 text-[11px]">USDT (TRC-20 Tron):</span>
                        <button
                          onClick={() => copyText(invoice?.walletTrc20 || 'TQn9Y2khEsLJW1ChV3o4e94J84k9L0m1aX', 'crypto_usdt')}
                          className="text-[10px] text-cyan-300 font-bold bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-0.5 rounded transition-all"
                        >
                          {copiedField === 'crypto_usdt' ? 'Скопировано!' : 'Скопировать TRC20'}
                        </button>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[10px] text-cyan-300 break-all select-all">
                        {invoice?.walletTrc20 || 'TQn9Y2khEsLJW1ChV3o4e94J84k9L0m1aX'}
                      </div>
                    </div>

                    {/* TON Wallet */}
                    <div className="pt-2 border-t border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-slate-400 text-[11px]">TON Wallet (Tonkeeper / TG):</span>
                        <button
                          onClick={() => copyText(invoice?.walletTon || 'EQD12aX9vK8z_ExampleTonAddressForRASVPN', 'crypto_ton')}
                          className="text-[10px] text-cyan-300 font-bold bg-cyan-500/10 hover:bg-cyan-500/20 px-2 py-0.5 rounded transition-all"
                        >
                          {copiedField === 'crypto_ton' ? 'Скопировано!' : 'Скопировать TON'}
                        </button>
                      </div>
                      <div className="bg-slate-950 p-2 rounded border border-slate-800 font-mono text-[10px] text-cyan-300 break-all select-all">
                        {invoice?.walletTon || 'EQD12aX9vK8z_ExampleTonAddressForRASVPN'}
                      </div>
                    </div>
                  </div>

                  {/* Transaction Hash / Verification input */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] text-slate-400 block">Хэш транзакции (опционально для ручной проверки):</label>
                    <input
                      type="text"
                      placeholder="Например: 0x82f... или b9a2..."
                      value={txHashInput}
                      onChange={e => setTxHashInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs text-white font-mono focus:border-cyan-500 outline-none"
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                    После перевода средств нажмите <span className="text-emerald-400 font-bold">«Проверить зачисление»</span> для немедленного включения подписки.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={method === 'crypto' ? handleVerifyStatus : handleFinalizePayment}
                  disabled={isProcessing || isVerifying}
                  className="w-full bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-400 hover:to-cyan-500 text-white font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Проверка поступления средств...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>
                        {method === 'crypto' ? 'Проверить зачисление / Я оплатил' : `Я оплатил ${plan.priceRub} ₽ (Подтвердить)`}
                      </span>
                    </>
                  )}
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

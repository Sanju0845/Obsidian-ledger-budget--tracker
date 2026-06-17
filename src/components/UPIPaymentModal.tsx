import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight, Smartphone, Wallet, CreditCard, Check, Zap, Plus } from 'lucide-react';
import { Card, UPIAccount } from '../types';
import { cn } from '../lib/utils';
import { UPI_APPS } from './constants';

interface UPIPaymentModalProps {
  upiData: { upiId: string; name?: string; amount?: string };
  accounts: UPIAccount[];
  cards: Card[];
  usedUPIApps: string[];
  upiAppBalances: Record<string, number>;
  onContinue: (amount: string, accountId: string, appPackage?: string) => void;
  onClose: () => void;
  onAddAccount: () => void;
  currency: string;
}

export const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({ 
  upiData, 
  accounts, 
  cards,
  usedUPIApps,
  upiAppBalances,
  onContinue,
  onClose,
  onAddAccount,
  currency 
}) => {
  const [amount, setAmount] = useState(upiData.amount || '');
  const [selectedAccountId, setSelectedAccountId] = useState(
    accounts.find(a => a.isDefault)?.id || 
    accounts[0]?.id || 
    cards[0]?.id || 
    (usedUPIApps.length > 0 ? usedUPIApps[0] : '')
  );
  const [activeTab, setActiveTab] = useState<'internal' | 'apps'>('apps');

  const handlePay = (appPackage?: string) => {
    if (!amount) return;
    if (!selectedAccountId && activeTab === 'internal') {
      onAddAccount();
      return;
    }
    
    // If we're in the internal tab and selected an app package as accountId
    if (activeTab === 'internal' && usedUPIApps.includes(selectedAccountId)) {
      onContinue(amount, 'app_wallet', selectedAccountId);
    } else {
      onContinue(amount, selectedAccountId || 'direct', appPackage);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-2">
        <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
          <ArrowUpRight size={28} className="text-primary" />
        </div>
        <h3 className="font-headline text-lg font-bold">{upiData.name || 'Paying to'}</h3>
        <p className="text-on-surface-variant text-xs">{upiData.upiId}</p>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest ml-1">Amount</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-primary">
            {currency === 'INR' ? '₹' : '$'}
          </span>
          <input 
            type="number" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-surface-container h-14 rounded-2xl pl-12 pr-4 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="flex bg-surface-container rounded-full p-1 border border-white/5">
        <button 
          onClick={() => setActiveTab('apps')}
          className={cn(
            "flex-1 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
            activeTab === 'apps' ? "bg-primary text-surface shadow-lg" : "text-on-surface-variant"
          )}
        >
          <Smartphone size={14} />
          UPI Apps
        </button>
        <button 
          onClick={() => setActiveTab('internal')}
          className={cn(
            "flex-1 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
            activeTab === 'internal' ? "bg-primary text-surface shadow-lg" : "text-on-surface-variant"
          )}
        >
          <Wallet size={14} />
          Accounts & Cards
        </button>
      </div>

      <div className="relative overflow-hidden min-h-[280px]">
        <AnimatePresence mode="wait">
          {activeTab === 'apps' ? (
            <motion.div 
              key="apps"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -50) setActiveTab('internal');
              }}
              className="grid grid-cols-2 gap-3"
            >
              {UPI_APPS.map(app => (
                <button 
                  key={app.package}
                  disabled={!amount}
                  onClick={() => handlePay(app.package)}
                  className={cn(
                    "p-4 rounded-2xl bg-surface-container border border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-surface-container-high transition-all active:scale-95",
                    !amount && "opacity-50 grayscale"
                  )}
                >
                  <div className="w-12 h-12 rounded-xl bg-white p-2 flex items-center justify-center overflow-hidden">
                    <img src={app.icon} alt={app.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <span className="font-bold text-[10px] uppercase tracking-wider">{app.name}</span>
                </button>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="internal"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x > 50) setActiveTab('apps');
              }}
              className="space-y-2"
            >
              <div className="max-h-[200px] overflow-y-auto no-scrollbar space-y-2">
                {accounts.length === 0 && cards.length === 0 ? (
                  <button 
                    onClick={onAddAccount}
                    className="w-full p-6 rounded-2xl bg-surface-container border border-white/5 flex flex-col items-center justify-center gap-2 text-primary hover:bg-surface-container-high transition-all active:scale-95"
                  >
                    <Plus size={24} />
                    <span className="font-bold text-sm">Link Account or Card</span>
                  </button>
                ) : (
                  <>
                    {/* UPI Apps as Wallets */}
                    {usedUPIApps.map(pkg => {
                      const app = UPI_APPS.find(a => a.package === pkg);
                      const balance = upiAppBalances[pkg] || 0;
                      return (
                        <button 
                          key={pkg}
                          onClick={() => setSelectedAccountId(pkg)}
                          className={cn(
                            "w-full p-4 rounded-2xl border transition-all flex items-center justify-between",
                            selectedAccountId === pkg ? "bg-primary/10 border-primary shadow-lg" : "bg-surface-container border-white/5 hover:bg-surface-container-high"
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/5 p-1.5 flex items-center justify-center">
                              <img src={app?.icon} alt={app?.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            </div>
                            <div className="text-left">
                              <p className="font-bold text-sm">{app?.name || 'App Wallet'}</p>
                              <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Wallet / App Balance</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm">₹{(balance || 0).toLocaleString()}</p>
                            {selectedAccountId === pkg && <div className="w-2 h-2 rounded-full bg-primary ml-auto mt-1" />}
                          </div>
                        </button>
                      );
                    })}

                    {accounts.map(acc => (
                      <button 
                        key={acc.id}
                        onClick={() => setSelectedAccountId(acc.id)}
                        className={cn(
                          "w-full p-3 rounded-xl border flex items-center justify-between transition-all",
                          selectedAccountId === acc.id ? "bg-primary/10 border-primary" : "bg-surface-container border-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                            <Wallet size={16} className="text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-xs">{acc.bankName}</p>
                            <p className="text-[10px] text-on-surface-variant">{acc.upiId}</p>
                          </div>
                        </div>
                        {selectedAccountId === acc.id && <Check size={14} className="text-primary" />}
                      </button>
                    ))}
                    {cards.map(card => (
                      <button 
                        key={card.id}
                        onClick={() => setSelectedAccountId(card.id)}
                        className={cn(
                          "w-full p-3 rounded-xl border flex items-center justify-between transition-all",
                          selectedAccountId === card.id ? "bg-primary/10 border-primary" : "bg-surface-container border-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                            <CreditCard size={16} className="text-secondary" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-xs">{card.bank}</p>
                            <p className="text-[10px] text-on-surface-variant">•••• {card.last4}</p>
                          </div>
                        </div>
                        {selectedAccountId === card.id && <Check size={14} className="text-primary" />}
                      </button>
                    ))}
                  </>
                )}
              </div>
              
              <button 
                disabled={!amount}
                onClick={() => handlePay()}
                className={cn(
                  "w-full h-14 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-95 mt-4",
                  !amount ? "bg-white/5 text-white/20 grayscale" : "bg-primary text-surface shadow-lg"
                )}
              >
                <Zap size={18} />
                Continue to Payment
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

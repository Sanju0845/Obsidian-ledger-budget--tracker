import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Wallet, 
  Upload, 
  PlusCircle, 
  CreditCard, 
  Plus, 
  Scan, 
  Sparkles,
  TrendingUp,
  TrendingDown,
  LayoutGrid
} from 'lucide-react';
import { Card, Transaction, Budget, UPIAccount, UserProfile } from '../types';
import { CardStack } from './CardStack';
import { TransactionItem, formatCurrency } from './TransactionItem';
import { cn } from '../lib/utils';

interface HomeViewProps {
  profile: UserProfile;
  cards: Card[];
  transactions: Transaction[];
  budgets: Budget[];
  upiAccounts: UPIAccount[];
  usedUPIApps: string[];
  upiAppBalances: Record<string, number>;
  activeCardIndex: number;
  handleSwipe: (dir: number) => void;
  displayCards: Card[];
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  onTabChange: (tab: string) => void;
  setShowSmsModal: (show: boolean) => void;
  setShowAddModal: (show: boolean) => void;
  setShowManageCardsModal: (show: boolean) => void;
  setScannedUPI: (data: { upiId: string, name?: string, amount?: string } | null) => void;
  setShowUPIPaymentModal: (show: boolean) => void;
  handleDeleteTransaction: (id: string) => void;
  latestScannedUPI: { upiId: string; name?: string } | null;
}

export const HomeView: React.FC<HomeViewProps> = ({
  profile,
  cards,
  transactions,
  budgets,
  upiAccounts,
  usedUPIApps,
  upiAppBalances,
  activeCardIndex,
  handleSwipe,
  displayCards,
  totalBalance,
  totalIncome,
  totalExpense,
  onTabChange,
  setShowSmsModal,
  setShowAddModal,
  setShowManageCardsModal,
  setScannedUPI,
  setShowUPIPaymentModal,
  handleDeleteTransaction,
  latestScannedUPI
}) => {
  const activeCard = displayCards[activeCardIndex];
  const filteredTransactions = activeCard 
    ? transactions.filter(t => t.cardId === activeCard.id)
    : [];

  return (
    <div className="space-y-8 animate-none">
      {/* Hero Liquidity Display with Glassy Ambient Backdrop */}
      <section className="relative overflow-hidden rounded-[36px] bg-white/[0.04] backdrop-blur-2xl p-8 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-secondary/10 blur-[60px] pointer-events-none" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Active Balance</span>
            </div>
            <span className="text-[10px] text-primary font-bold uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              {profile.currency} Balance
            </span>
          </div>

          <div className="space-y-1">
            <p className="text-on-surface-variant font-medium text-xs uppercase tracking-widest pl-1">Total Liquidity</p>
            <h1 className="font-headline text-5xl md:text-6xl font-bold mt-1 tracking-tight text-white drop-shadow-[0_4px_12px_rgba(255,255,255,0.05)]">
              {formatCurrency(totalBalance, profile.currency)}
            </h1>
          </div>

          {/* Stat Cards Row */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div className="flex items-center gap-3.5 bg-white/[0.03] backdrop-blur-md p-3 rounded-2xl border border-white/5 group hover:bg-white/[0.06] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary transition-transform group-hover:scale-105">
                <TrendingUp size={18} />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider">Income Cashflow</p>
                <p className="text-[13px] font-bold text-secondary mt-0.5">+{formatCurrency(totalIncome, profile.currency)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 bg-white/[0.03] backdrop-blur-md p-3 rounded-2xl border border-white/5 group hover:bg-white/[0.06] transition-colors">
              <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center text-error transition-transform group-hover:scale-105">
                <TrendingDown size={18} />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-on-surface-variant tracking-wider">Expenses Outflow</p>
                <p className="text-[13px] font-bold text-error mt-0.5">-{formatCurrency(totalExpense, profile.currency)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Credit Cards & wallets slider */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-white">Cards & Accounts</h2>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Swipe cards</span>
        </div>
        {displayCards.length > 0 ? (
          <CardStack cards={displayCards} activeIndex={activeCardIndex} onSwipe={handleSwipe} currency={profile.currency} />
        ) : (
          <div 
            onClick={() => onTabChange('upi')}
            className="h-52 rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 text-on-surface-variant hover:text-white hover:border-white/20 transition-all cursor-pointer bg-surface-container-low"
          >
            <Plus size={32} className="text-primary animate-pulse" />
            <p className="font-headline text-sm font-bold">Link accounts or app wallets</p>
          </div>
        )}
      </section>

      {/* Bento Grid Action Keys */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button 
          onClick={() => onTabChange('upi')}
          className="relative overflow-hidden group rounded-2xl p-5 bg-white/[0.03] backdrop-blur-xl border border-primary/20 hover:border-primary/40 text-left transition-all hover:translate-y-[-2px] active:translate-y-0"
        >
          <div className="absolute right-[-10px] bottom-[-10px] text-primary/15 group-hover:scale-110 transition-transform">
            <Wallet size={72} />
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3">
            <Wallet size={18} />
          </div>
          <span className="block font-headline text-xs font-bold text-white uppercase tracking-wider">UPI Accounts</span>
          <span className="text-[9px] font-bold text-primary tracking-wide">Manage Accounts</span>
        </button>

        <button 
          onClick={() => setShowSmsModal(true)}
          className="relative overflow-hidden group rounded-2xl p-5 bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/20 text-left transition-all hover:translate-y-[-2px] active:translate-y-0"
        >
          <div className="absolute right-[-10px] bottom-[-10px] text-secondary/15 group-hover:scale-110 transition-transform">
            <Upload size={72} />
          </div>
          <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-3">
            <Upload size={18} />
          </div>
          <span className="block font-headline text-xs font-bold text-white uppercase tracking-wider">Sync SMS</span>
          <span className="text-[9px] font-bold text-on-surface-variant tracking-wide">AI Parse</span>
        </button>

        <button 
          onClick={() => setShowAddModal(true)}
          className="relative overflow-hidden group rounded-2xl p-5 bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/20 text-left transition-all hover:translate-y-[-2px] active:translate-y-0"
        >
          <div className="absolute right-[-10px] bottom-[-10px] text-tertiary/15 group-hover:scale-110 transition-transform">
            <PlusCircle size={72} />
          </div>
          <div className="w-10 h-10 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary mb-3">
            <PlusCircle size={18} />
          </div>
          <span className="block font-headline text-xs font-bold text-white uppercase tracking-wider">Add Tx</span>
          <span className="text-[9px] font-bold text-on-surface-variant tracking-wide">Manual entry</span>
        </button>

        <button 
          onClick={() => setShowManageCardsModal(true)}
          className="relative overflow-hidden group rounded-2xl p-5 bg-white/[0.03] backdrop-blur-xl border border-white/10 hover:border-white/20 text-left transition-all hover:translate-y-[-2px] active:translate-y-0"
        >
          <div className="absolute right-[-10px] bottom-[-10px] text-emerald-400/15 group-hover:scale-110 transition-transform">
            <CreditCard size={72} />
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-400/10 flex items-center justify-center text-emerald-400 mb-3">
            <CreditCard size={18} />
          </div>
          <span className="block font-headline text-xs font-bold text-white uppercase tracking-wider">Manage Cards</span>
          <span className="text-[9px] font-bold text-on-surface-variant tracking-wide">Settings</span>
        </button>
      </section>

      {/* Quick Transfer Contacts Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-2">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-white border-none">Quick Transfer</h2>
          <span className="text-xs text-primary font-bold cursor-pointer hover:underline" onClick={() => onTabChange('transactions')}>See All</span>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-3">
          {latestScannedUPI && (
            <button 
              onClick={() => {
                setScannedUPI({ upiId: latestScannedUPI.upiId, name: latestScannedUPI.name });
                setShowUPIPaymentModal(true);
              }}
              className="flex flex-col items-center gap-2 group transition-transform active:scale-95 min-w-[76px]"
            >
              <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-primary to-pink-400 group-hover:rotate-12 transition-transform">
                <div className="w-full h-full rounded-full border-2 border-surface overflow-hidden flex items-center justify-center bg-surface-container-high text-primary">
                  <Scan size={20} className="animate-pulse" />
                </div>
              </div>
              <span className="text-[10px] font-bold text-primary truncate w-16 text-center">Re-entry</span>
            </button>
          )}

          {transactions
            .filter(t => t.category === 'UPI Payment' || t.upiApp)
            .reduce((acc, t) => {
              const recipientUpi = t.description?.split('to ')[1] || t.merchant;
              if (recipientUpi && !acc.find(x => x.upi === recipientUpi)) {
                acc.push({ 
                  name: t.merchant.split(' ')[0], 
                  upi: recipientUpi,
                  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${recipientUpi}&backgroundColor=ba9eff&mood[]=happy`
                });
              }
              return acc;
            }, [] as { name: string, upi: string, avatar: string }[])
            .slice(0, 6)
            .map((contact, i) => (
              <button 
                key={i} 
                onClick={() => {
                  setScannedUPI({ upiId: contact.upi, name: contact.name });
                  setShowUPIPaymentModal(true);
                }}
                className="flex flex-col items-center gap-2 group transition-transform active:scale-95 min-w-[76px]"
              >
                <div className="w-14 h-14 rounded-full p-[2px] bg-gradient-to-tr from-surface-container-high to-white/10 group-hover:border-primary border-transparent border transition-colors">
                  <div className="w-full h-full rounded-full border-2 border-surface overflow-hidden">
                    <img src={contact.avatar} alt={contact.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant group-hover:text-white truncate w-16 text-center transition-colors">{contact.name}</span>
              </button>
            ))}
        </div>
      </section>

      {/* Mini Ledger Preview on Homescreen */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h2 className="font-headline text-2xl font-bold tracking-tight text-white border-none">Ledger</h2>
          <span 
            className="text-xs text-primary font-bold cursor-pointer hover:underline" 
            onClick={() => onTabChange('transactions')}
          >
            See All
          </span>
        </div>
        <div className="space-y-1.5 rounded-3xl overflow-hidden border border-white/10 bg-white/[0.03] backdrop-blur-xl p-2.5">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.slice(0, 4).map(tx => (
              <TransactionItem 
                key={tx.id} 
                transaction={tx} 
                onDelete={handleDeleteTransaction}
                currency={profile.currency}
              />
            ))
          ) : (
            <div className="text-center py-12 text-on-surface-variant text-sm font-semibold">
              No transactions for this card
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Upload, 
  Trash2, 
  Calendar, 
  ListFilter,
  Sparkles,
  Info
} from 'lucide-react';
import { Transaction, UserProfile } from '../types';
import { TransactionItem, formatCurrency } from './TransactionItem';
import { cn } from '../lib/utils';

interface LedgerViewProps {
  transactions: Transaction[];
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  cards: any[];
  setCards: any;
  profile: UserProfile;
  handleDeleteTransaction: (id: string) => void;
  handleImportCSV: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setShowImportModal: (show: boolean) => void;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  transactions,
  setTransactions,
  cards,
  setCards,
  profile,
  handleDeleteTransaction,
  handleImportCSV,
  setShowImportModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = 
        t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = filterType === 'all' || t.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [transactions, searchQuery, filterType]);

  // Group transactions by Date (Today, Yesterday, DateString)
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    
    filteredTransactions.forEach(t => {
      const date = new Date(t.date);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let key = '';
      if (date.toDateString() === today.toDateString()) {
        key = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = 'Yesterday';
      } else {
        key = date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(t);
    });

    return Object.entries(groups);
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 animate-none">
      {/* Title + Action buttons */}
      <div className="flex justify-between items-center bg-gradient-to-r from-surface-container-high/40 to-transparent p-4 rounded-3xl border border-white/5">
        <div>
          <h1 className="font-headline text-3xl font-bold tracking-tight text-white">Ledger Auditing</h1>
          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest mt-0.5">Chronological record</p>
        </div>
        
        <div className="flex gap-2.5">
          {/* Magic Import Modal launcher */}
          <button 
            onClick={() => setShowImportModal(true)}
            className="p-3 bg-surface-container rounded-2xl border border-white/5 text-primary hover:bg-surface-container-high active:scale-95 transition-all shadow-sm"
            title="AI PDF statement extractor"
          >
            <Sparkles size={18} />
          </button>

          {/* Import CSV */}
          <label className="p-3 bg-surface-container rounded-2xl border border-white/5 text-secondary hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer shadow-sm">
            <Upload size={18} />
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>

          {/* Clear Database history */}
          <button 
            onClick={() => {
              if (confirm("Clear your entire ledger transaction history? All linked balances will reset.")) {
                setTransactions([]);
                setCards((prev: any[]) => prev.map(c => ({ ...c, balance: 0 })));
              }
            }}
            className="p-3 bg-surface-container rounded-2xl border border-white/5 text-error hover:bg-surface-container-high active:scale-95 transition-all shadow-sm"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Modern Search bar + Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline" size={18} />
          <input 
            type="text" 
            placeholder="Filter by merchant name or spending categories..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container rounded-2xl py-4 pl-12 pr-4 text-xs focus:outline-none border border-white/5 text-white placeholder-on-surface-variant/40"
          />
        </div>

        {/* Tab Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {['all', 'income', 'expense'].map(type => (
            <button 
              key={type}
              onClick={() => setFilterType(type as any)}
              className={cn(
                "px-5 py-2.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border",
                filterType === type 
                  ? "bg-primary text-surface border-primary font-bold shadow-lg shadow-primary/10" 
                  : "bg-surface-container text-on-surface-variant border-white/5 hover:text-white"
              )}
            >
              {type} entries
            </button>
          ))}
        </div>
      </div>

      {/* Transaction Feed Grouped */}
      <div className="space-y-6">
        {groupedTransactions.length > 0 ? (
          groupedTransactions.map(([dateKey, items]) => (
            <div key={dateKey} className="space-y-2">
              <div className="flex items-center gap-2 px-2">
                <Calendar size={12} className="text-on-surface-variant/60" />
                <h3 className="text-[10px] font-headline font-bold text-on-surface-variant uppercase tracking-[0.15em]">
                  {dateKey}
                </h3>
              </div>
              
              <div className="space-y-1.5 rounded-3xl overflow-hidden border border-white/5 bg-surface-container-low/40 p-1.5">
                {items.map(tx => (
                  <TransactionItem 
                    key={tx.id} 
                    transaction={tx} 
                    onDelete={handleDeleteTransaction}
                    currency={profile.currency}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-surface-container-low/30 rounded-3xl border border-dashed border-white/5 p-8">
            <Info size={36} className="mx-auto text-outline mb-3" />
            <p className="text-on-surface-variant text-xs font-semibold">No transactions match your criteria</p>
            <p className="text-[10px] text-on-surface-variant/60 mt-1">Try refining search terms or category triggers</p>
          </div>
        )}
      </div>
    </div>
  );
};

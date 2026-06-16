import React from 'react';
import { ReceiptText } from 'lucide-react';
import { cn } from '../lib/utils';
import { Transaction } from '../types';
import { SwipeableItem } from './SwipeableItem';
import { CATEGORY_ICONS, UPI_APPS } from './constants';

export const formatCurrency = (amount: number | undefined, currency: string) => {
  if (amount === undefined || amount === null) return '₹0.00';
  const symbol = currency === 'INR' ? '₹' : '$';
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

interface TransactionItemProps {
  transaction: Transaction;
  onDelete?: (id: string) => void;
  currency: string;
}

export const TransactionItem: React.FC<TransactionItemProps> = ({ 
  transaction, 
  onDelete, 
  currency 
}) => {
  const upiApp = transaction.upiApp ? UPI_APPS.find(a => a.package === transaction.upiApp) : null;
  const Icon = CATEGORY_ICONS[transaction.category] || ReceiptText;
  const isExpense = transaction.type === 'expense';

  const content = (
    <div className="bg-surface-container-low hover:bg-surface-container p-4 flex items-center transition-colors group relative overflow-hidden">
      <div className={cn(
        "w-12 h-12 rounded-lg flex items-center justify-center relative",
        isExpense ? "bg-error/10 text-error" : "bg-secondary/10 text-secondary"
      )}>
        <Icon size={24} />
        {upiApp && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full p-1 border border-white/10 shadow-sm overflow-hidden">
            <img src={upiApp.icon} alt={upiApp.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
          </div>
        )}
      </div>
      <div className="ml-4 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-bold text-on-surface tracking-tight">{transaction.merchant}</p>
          {upiApp && <span className="text-[8px] font-bold text-primary px-1.5 py-0.5 bg-primary/10 rounded-full uppercase tracking-tighter">{upiApp.name}</span>}
        </div>
        <p className="text-[11px] text-on-surface-variant font-medium">{transaction.category}</p>
      </div>
      <div className="text-right flex items-center gap-3">
        <div>
          <p className={cn("text-sm font-bold", isExpense ? "text-on-surface" : "text-secondary")}>
            {isExpense ? '-' : '+'}{formatCurrency(transaction.amount, currency)}
          </p>
          <p className="text-[10px] text-outline font-medium">
            {new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );

  if (onDelete) {
    return (
      <SwipeableItem onDelete={() => onDelete(transaction.id)} className="mb-2">
        {content}
      </SwipeableItem>
    );
  }

  return <div className="mb-2 rounded-xl overflow-hidden">{content}</div>;
};

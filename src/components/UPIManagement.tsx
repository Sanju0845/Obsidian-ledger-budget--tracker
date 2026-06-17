import React from 'react';
import { Wallet, Settings, Check, Trash2, Plus } from 'lucide-react';
import { UPIAccount, Transaction } from '../types';
import { TransactionItem } from './TransactionItem';
import { UPI_APPS } from './constants';

interface UPIManagementProps {
  accounts: UPIAccount[];
  transactions: Transaction[];
  onAdd: () => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string) => void;
  currency: string;
  usedUPIApps: string[];
  upiAppBalances: Record<string, number>;
  onUpdateAppBalance: (pkg: string, balance: number) => void;
  onUpdateBalance: (id: string, balance: number) => void;
  onDeleteApp: (pkg: string) => void;
}

export const UPIManagement: React.FC<UPIManagementProps> = ({ 
  accounts, 
  transactions, 
  onAdd, 
  onDelete, 
  onSetDefault, 
  currency,
  usedUPIApps,
  upiAppBalances,
  onUpdateAppBalance,
  onUpdateBalance,
  onDeleteApp
}) => {
  const upiTransactions = transactions.filter(t => t.cardId === 'upi').slice(0, 5);

  return (
    <div className="space-y-8 pb-32">
      <div>
        <h1 className="font-headline text-4xl font-bold">UPI Accounts</h1>
        <p className="text-on-surface-variant text-sm">Manage your linked bank accounts and apps</p>
      </div>

      <div className="space-y-4">
        {/* Bank Accounts Section */}
        <div className="space-y-2">
          <h2 className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest px-2">Bank Accounts</h2>
          {accounts.map(acc => (
            <div key={acc.id} className="bg-surface-container-low p-6 rounded-[32px] border border-white/5 shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <Wallet size={24} />
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-lg">{acc.bankName}</h3>
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">{acc.upiId}</p>
                  </div>
                </div>
                {acc.isDefault && (
                  <span className="bg-primary/20 text-primary text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">Default</span>
                )}
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">Balance</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xl font-bold">₹{(acc.balance || 0).toLocaleString()}</p>
                    <button 
                      onClick={() => {
                        const newBalance = prompt(`Enter new balance for ${acc.bankName}`, acc.balance.toString());
                        if (newBalance !== null) {
                          onUpdateBalance(acc.id, Number(newBalance) || 0);
                        }
                      }}
                      className="p-1 rounded-full bg-white/5 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <Settings size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  {!acc.isDefault && (
                    <button 
                      onClick={() => onSetDefault(acc.id)}
                      className="p-2 rounded-full bg-white/5 text-on-surface-variant hover:text-primary transition-colors"
                    >
                      <Check size={20} />
                    </button>
                  )}
                  <button 
                    onClick={() => onDelete(acc.id)}
                    className="p-2 rounded-full bg-white/5 text-on-surface-variant hover:text-error transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* UPI Apps Section */}
        {usedUPIApps.length > 0 && (
          <div className="space-y-2 mt-8">
            <h2 className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest px-2">UPI Apps & Wallets</h2>
            {usedUPIApps.map(pkg => {
              const app = UPI_APPS.find(a => a.package === pkg);
              const balance = upiAppBalances[pkg] || 0;
              
              return (
                <div key={pkg} className="bg-surface-container-low p-6 rounded-[32px] border border-white/5 shadow-xl">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white/5 p-2 flex items-center justify-center">
                        <img src={app?.icon} alt={app?.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <h3 className="font-headline font-bold text-lg">{app?.name || 'UPI App'}</h3>
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">{pkg}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-1">Balance</p>
                      <div className="flex items-center gap-2">
                        <p className="text-xl font-bold">₹{(balance || 0).toLocaleString()}</p>
                        <button 
                          onClick={() => {
                            const newBalance = prompt('Enter new balance for ' + (app?.name || 'App'), balance.toString());
                            if (newBalance !== null) {
                              onUpdateAppBalance(pkg, Number(newBalance) || 0);
                            }
                          }}
                          className="p-1 rounded-full bg-white/5 text-on-surface-variant hover:text-primary transition-colors"
                        >
                          <Settings size={14} />
                        </button>
                      </div>
                    </div>
                    <button 
                      onClick={() => onDeleteApp(pkg)}
                      className="p-2 rounded-full bg-white/5 text-on-surface-variant hover:text-error transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button 
          onClick={onAdd}
          className="w-full h-32 rounded-[32px] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:text-white hover:border-white/20 transition-all"
        >
          <Plus size={24} />
          <span className="font-bold">Link New Bank Account</span>
        </button>
      </div>

      {upiTransactions.length > 0 && (
        <div className="mt-10">
          <h2 className="font-headline text-2xl font-bold mb-4">Recent UPI Payments</h2>
          <div className="space-y-2">
            {upiTransactions.map(tx => (
              <TransactionItem key={tx.id} transaction={tx} currency={currency} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

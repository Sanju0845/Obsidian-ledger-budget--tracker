import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon, 
  DollarSign, 
  Activity,
  AlertTriangle,
  Briefcase
} from 'lucide-react';
import { Transaction, Budget, UserProfile } from '../types';
import { formatCurrency } from './TransactionItem';
import { cn } from '../lib/utils';
import { SMOOTH_TRANSITION } from './constants';
import { motion } from 'motion/react';

interface BudgetViewProps {
  transactions: Transaction[];
  profile: UserProfile;
  budgets: Budget[];
  setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>;
  setEditingBudget: (budget: Budget | null) => void;
  setShowBudgetModal: (show: boolean) => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({ 
  transactions, 
  profile, 
  budgets,
  setBudgets,
  setEditingBudget,
  setShowBudgetModal
}) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const chartData = useMemo(() => {
    const groups: Record<string, { date: string, income: number, expense: number }> = {};
    
    // Sort transactions by date ascending
    const sorted = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sorted.forEach(t => {
      const date = new Date(t.date);
      const key = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!groups[key]) groups[key] = { date: key, income: 0, expense: 0 };
      if (t.type === 'income') groups[key].income += t.amount;
      else groups[key].expense += t.amount;
    });

    return Object.values(groups).slice(-7);
  }, [transactions]);

  const categoryPieData = useMemo(() => {
    const data: Record<string, number> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      data[t.category] = (data[t.category] || 0) + t.amount;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const totalBudgetSpent = useMemo(() => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const totalIncomeValue = useMemo(() => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
  }, [transactions]);

  const limitSum = useMemo(() => {
    return budgets.reduce((acc, b) => acc + b.limit, 0);
  }, [budgets]);

  const COLORS = ['#ba9eff', '#699cff', '#ff86c3', '#ff6e84', '#4ade80', '#fbbf24'];

  return (
    <div className="space-y-8 pb-10">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight">Budget & Analysis</h1>
          <p className="text-on-surface-variant text-sm mt-1 font-medium">Empower your wallet with precise metrics</p>
        </div>
        
        {/* Toggle Range */}
        <div className="flex bg-surface-container-high rounded-full p-1 border border-white/5 shadow-inner">
          {['week', 'month', 'year'].map(r => (
            <button 
              key={r}
              onClick={() => setTimeRange(r as any)}
              className={cn(
                "px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                timeRange === r ? "bg-primary text-surface shadow-md" : "text-on-surface-variant hover:text-white"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main Graph Grid Glow */}
      <div className="relative overflow-hidden bg-gradient-to-b from-surface-container-high/60 to-surface-container-low/40 p-6 rounded-[32px] border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-secondary/5 blur-[50px] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <Activity size={16} className="text-secondary" />
              <h3 className="font-headline font-bold text-base tracking-tight text-white">Cash Flow Liquidity</h3>
            </div>
            
            <div className="flex gap-4">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[9px] uppercase font-bold text-on-surface-variant">Expense</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span className="text-[9px] uppercase font-bold text-on-surface-variant">Income</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ba9eff" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#ba9eff" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#699cff" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#699cff" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff03" vertical={false} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#a1a1a1', fontSize: 9 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666666', fontSize: 9 }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0e0e0e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="expense" stroke="#ba9eff" strokeWidth={2.5} fillOpacity={1} fill="url(#colorExpense)" />
                  <Area type="monotone" dataKey="income" stroke="#699cff" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIncome)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-on-surface-variant text-xs font-semibold">
                Waiting for transaction history...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grid: category Pie + budgets limit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Category distribution graph */}
        <div className="bg-gradient-to-b from-surface-container-high/40 to-surface-container-low/20 p-6 rounded-[32px] border border-white/5 space-y-4">
          <div className="flex items-center gap-2">
            <PieIcon size={16} className="text-tertiary" />
            <h3 className="font-headline font-bold text-base tracking-tight">Category Outlays</h3>
          </div>
          
          <div className="h-56 w-full flex items-center justify-center relative">
            {categoryPieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="40%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0e0e0e', border: 'none', borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Total Counter inside Donut hole */}
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                  <span className="text-[9px] uppercase tracking-widest font-bold text-on-surface-variant">Total Spend</span>
                  <p className="text-lg font-bold text-white mt-0.5">{formatCurrency(totalBudgetSpent, profile.currency)}</p>
                </div>
              </>
            ) : (
              <div className="text-center text-on-surface-variant text-xs font-semibold">
                No expense transactions found.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 max-h-[100px] overflow-y-auto no-scrollbar">
            {categoryPieData.map((entry, index) => (
              <div key={`${entry.name}-${index}`} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] font-bold text-on-surface-variant truncate">{entry.name}</span>
                <span className="text-[10px] font-bold ml-auto text-white">{formatCurrency(entry.value, profile.currency)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Budgets Performance Limit indicators */}
        <div className="bg-gradient-to-b from-surface-container-high/40 to-surface-container-low/20 p-6 rounded-[32px] border border-white/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle size={16} className="text-primary" />
                <h3 className="font-headline font-bold text-base tracking-tight">Active Budgets</h3>
              </div>
              <span className="text-[10px] font-bold text-primary-dim uppercase tracking-wider">
                Total Limit: {formatCurrency(limitSum, profile.currency)}
              </span>
            </div>

            <div className="space-y-4 max-h-[220px] overflow-y-auto no-scrollbar pr-1">
              {budgets.map(b => {
                const spent = transactions
                  .filter(t => t.category === b.category && t.type === 'expense')
                  .reduce((acc, t) => acc + t.amount, 0);
                
                const ratio = b.limit > 0 ? spent / b.limit : 0;
                const percent = Math.min(ratio * 100, 100);

                return (
                  <div 
                    key={b.id} 
                    className="space-y-1 bg-white/5 hover:bg-white/10 p-3 rounded-2xl border border-white/5 transition-colors cursor-pointer group"
                    onClick={() => {
                      setEditingBudget({ ...b, spent });
                      setShowBudgetModal(true);
                    }}
                  >
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      <span className="group-hover:text-white transition-colors">{b.category}</span>
                      <div className="text-right">
                        <span className="text-white font-bold">{formatCurrency(spent, profile.currency)} </span> 
                        <span className="text-outline">/ {formatCurrency(b.limit, profile.currency)}</span>
                      </div>
                    </div>
                    
                    <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden relative">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={SMOOTH_TRANSITION}
                        className={cn("h-full rounded-full", percent > 90 ? "bg-error" : percent > 75 ? "bg-amber-400" : "bg-primary")}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <button 
            onClick={() => {
              const catName = prompt("Enter new budget category (e.g. Dining, Fun):");
              if (!catName) return;
              const limVal = prompt("Enter monthly limit in currency units:", "5000");
              if (!limVal) return;
              const limit = parseFloat(limVal) || 0;
              
              const newB: Budget = {
                id: Math.random().toString(36).substr(2, 9),
                category: catName,
                limit,
                spent: 0
              };
              setBudgets(prev => [...prev, newB]);
            }}
            className="w-full mt-4 bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold py-3.5 rounded-2xl border border-primary/25 active:scale-[0.98] transition-transform"
          >
            Create Category Allocation
          </button>
        </div>
      </div>
    </div>
  );
};

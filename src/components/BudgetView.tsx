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
} from 'recharts';
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  Activity,
  AlertTriangle,
  ChevronLeft,
  MoreVertical,
  Info,
  Coffee,
  Bus,
  ShoppingCart,
  Globe,
  FileText,
  GraduationCap,
  Compass,
  Briefcase,
  Gift,
  PlusCircle,
  Plus,
  Trash2,
  Sliders
} from 'lucide-react';
import { Transaction, Budget, UserProfile } from '../types';
import { formatCurrency } from './TransactionItem';
import { cn } from '../lib/utils';
import { SMOOTH_TRANSITION, QUICK_TRANSITION } from './constants';
import { motion, AnimatePresence } from 'motion/react';
import { CATEGORY_ICON_PRESESTS, CATEGORY_COLORS } from './CategoriesView';

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
  
  // Local state to track currently selected Detailed Budget view (Image 3)
  const [selectedDetailCat, setSelectedDetailCat] = useState<string | null>(null);
  const [showOptionsId, setShowOptionsId] = useState<string | null>(null);

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

  const limitSum = useMemo(() => {
    return budgets.reduce((acc, b) => acc + b.limit, 0);
  }, [budgets]);

  const COLORS = ['#ba9eff', '#699cff', '#ff86c3', '#ff6e84', '#4ade80', '#fbbf24'];

  // Detail Budget information helper
  const detailBudgetWithStats = useMemo(() => {
    if (!selectedDetailCat) return null;
    const budget = budgets.find(b => b.category === selectedDetailCat) || {
      id: 'temp',
      category: selectedDetailCat,
      limit: 10000,
      spent: 0
    };
    
    const spent = transactions
      .filter(t => t.category === selectedDetailCat && t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
      
    return {
      ...budget,
      spent
    };
  }, [selectedDetailCat, budgets, transactions]);

  // Detail Category Transactions grouped by Date
  const detailTransactionsGrouped = useMemo(() => {
    if (!selectedDetailCat) return [];
    const filtered = transactions.filter(t => t.category === selectedDetailCat);
    
    // Sort descending
    const sorted = [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Group
    const groups: { dateLabel: string; items: Transaction[] }[] = [];
    sorted.forEach(item => {
      let label = 'Other Days';
      const itemDateStr = new Date(item.date).toDateString();
      const todayStr = new Date().toDateString();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();
      
      if (itemDateStr === todayStr) {
        label = 'Today';
      } else if (itemDateStr === yesterdayStr) {
        label = 'Yesterday';
      } else {
        label = new Date(item.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
      }
      
      const existing = groups.find(g => g.dateLabel === label);
      if (existing) {
        existing.items.push(item);
      } else {
        groups.push({ dateLabel: label, items: [item] });
      }
    });
    
    return groups;
  }, [selectedDetailCat, transactions]);


  // Icon mapping resolver
  const getCategoryIcon = (cat: string) => {
    return CATEGORY_ICON_PRESESTS[cat] || PlusCircle;
  };

  const getCategoryColorStyles = (cat: string) => {
    return CATEGORY_COLORS[cat] || 'text-primary bg-primary/10 border-primary/20';
  };

  // Render the detailed view of a budget
  if (selectedDetailCat && detailBudgetWithStats) {
    const budget = detailBudgetWithStats;
    const spent = budget.spent;
    const limit = budget.limit;
    const ratio = limit > 0 ? spent / limit : 0;
    const percent = Math.min(Math.round(ratio * 100), 100);
    const remaining = limit - spent;
    
    const IconComp = getCategoryIcon(budget.category);
    const colorClasses = getCategoryColorStyles(budget.category);

    // Segmented layout calculations (4 horizontal dashes)
    const segmentCount = 4;
    const filledSegments = Math.min(Math.round((percent / 100) * segmentCount), segmentCount);
    const segmentColor = percent > 90 ? "bg-error" : percent > 75 ? "bg-amber-400" : "bg-[#4ade80]";

    return (
      <div className="space-y-6 pb-24 animate-none select-none">
        {/* Detail Budget Header Bar */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => {
              setSelectedDetailCat(null);
              setShowOptionsId(null);
            }}
            className="w-10 h-10 rounded-xl bg-surface-container-high border border-white/5 shadow-md flex items-center justify-center text-on-surface-variant hover:text-white transition-colors active:scale-95"
          >
            <ChevronLeft size={20} />
          </button>
          
          <h1 className="font-headline text-lg font-bold text-white tracking-wide">Detail Budget</h1>
          
          <div className="relative">
            <button 
              onClick={() => setShowOptionsId(prev => prev ? null : budget.id)}
              className="w-10 h-10 rounded-xl bg-surface-container-high border border-white/5 shadow-md flex items-center justify-center text-on-surface-variant hover:text-white transition-colors active:scale-95"
            >
              <MoreVertical size={20} />
            </button>

            {showOptionsId === budget.id && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowOptionsId(null)} />
                <div className="absolute right-0 mt-2 w-36 bg-[#161616] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden py-1.5">
                  <button 
                    onClick={() => {
                      setEditingBudget({ ...budget });
                      setShowBudgetModal(true);
                      setShowOptionsId(null);
                    }}
                    className="w-full text-left px-5 py-2.5 text-xs text-white hover:bg-white/5 font-semibold flex items-center gap-2"
                  >
                    <Sliders size={12} className="text-primary" />
                    Edit Limit
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm("Remove budget rule? All transactions will remain intact.")) {
                        setBudgets(prev => prev.filter(b => b.id !== budget.id));
                        setSelectedDetailCat(null);
                      }
                      setShowOptionsId(null);
                    }}
                    className="w-full text-left px-5 py-2.5 text-xs text-error hover:bg-error/5 font-semibold flex items-center gap-2"
                  >
                    <Trash2 size={12} className="text-error" />
                    Remove
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Detailed Budget Progress Card styled EXACTLY like Image 3 */}
        <div className="bg-[#121212] border border-white/[0.04] rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-emerald-500/5 blur-[50px] pointer-events-none" />

          {/* Header row offset with Coffee Icon & Text content */}
          <div className="flex items-center gap-4">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border", colorClasses)}>
              <IconComp size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">{budget.category} Budget</h3>
              <p className="text-xs text-on-surface-variant font-medium mt-0.5">
                Your spending {budget.category.toLowerCase()} for this month
              </p>
            </div>
          </div>

          {/* Amount Large Display */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-black text-white tracking-tight">
                {formatCurrency(spent, profile.currency)}
              </span>
              <span className="text-sm font-medium text-on-surface-variant">
                of {formatCurrency(limit, profile.currency)}
              </span>
            </div>

            {/* Segmented Dash Progress Bar (exactly as in Image 3) */}
            <div className="flex gap-2 w-full h-2.5">
              {Array.from({ length: segmentCount }).map((_, idx) => {
                const isFilled = idx < filledSegments;
                return (
                  <div 
                    key={idx}
                    className={cn(
                      "flex-1 h-full rounded-full transition-all duration-500",
                      isFilled ? segmentColor : "bg-white/10"
                    )}
                  />
                );
              })}
            </div>

            {/* Metrics Subtitle */}
            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              <span>Remaining {formatCurrency(remaining >= 0 ? remaining : 0, profile.currency)}</span>
              <span className="font-mono text-[10px] bg-white/5 px-2 py-0.5 rounded-md border border-white/5">{percent}%</span>
            </div>
          </div>

          {/* Alert Callout box */}
          <div className="bg-[#181818] rounded-2xl p-4 border border-white/5 flex items-start gap-3">
            <Info size={16} className="text-on-surface-variant mt-0.5" />
            <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
              You used {percent}% of your budget this month
            </p>
          </div>
        </div>

        {/* Recent Transactions List within Detail View */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white tracking-wide">Recent Transactions</h3>
          
          <div className="space-y-5">
            {detailTransactionsGrouped.length > 0 ? (
              detailTransactionsGrouped.map((grp) => (
                <div key={grp.dateLabel} className="space-y-2">
                  <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">
                    {grp.dateLabel}
                  </div>
                  
                  <div className="space-y-1.5">
                    {grp.items.map(tx => {
                      return (
                        <div 
                          key={tx.id}
                          className="bg-surface-container-high/40 rounded-2xl p-4 flex items-center justify-between border border-white/[0.02]"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", colorClasses)}>
                              <IconComp size={18} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-white">{tx.description || tx.merchant}</h4>
                              <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">
                                {tx.category} • {new Date(tx.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-sm font-bold text-emerald-400 font-mono">
                              -{formatCurrency(tx.amount, profile.currency)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-10 text-center rounded-3xl border border-dashed border-white/5 text-on-surface-variant text-sm">
                No purchases captured under this budget rule.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Fallback: Standard Active Budgets Dashboard list view
  return (
    <div className="space-y-8 pb-10 select-none">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
        <div>
          <h1 className="font-headline text-4xl font-bold tracking-tight text-white">Budgets & Spend</h1>
          <p className="text-on-surface-variant text-sm mt-1 font-medium">Control and manage your regular spending accounts</p>
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
              <h3 className="font-headline font-bold text-base tracking-tight text-white">Cash Flows</h3>
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
            <h3 className="font-headline font-bold text-base tracking-tight text-white">Metrics Layout</h3>
          </div>
          
          <div className="h-56 w-full flex items-center justify-center relative">
            {categoryPieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryPieData}
                      cx="50%"
                      cy="45%"
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
                <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
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
                <h3 className="font-headline font-bold text-base tracking-tight text-white">Active Budgets</h3>
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

                const IconComponent = getCategoryIcon(b.category);
                const colorClasses = getCategoryColorStyles(b.category);

                // Split progress indicator design matching Image 3 (4 horizontal dash/segment cards)
                const budgetSegments = 4;
                const activeSegments = Math.min(Math.round((percent / 100) * budgetSegments), budgetSegments);
                const progressFillColor = percent > 90 ? "bg-error" : percent > 75 ? "bg-amber-400" : "bg-[#4ade80]";

                return (
                  <div 
                    key={b.id} 
                    className="space-y-3 bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/5 transition-colors cursor-pointer group"
                    onClick={() => {
                      setSelectedDetailCat(b.category);
                    }}
                  >
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-on-surface-variant">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center border", colorClasses)}>
                          <IconComponent size={14} />
                        </div>
                        <span className="group-hover:text-white transition-colors text-xs font-semibold">{b.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-bold">{formatCurrency(spent, profile.currency)} </span> 
                        <span className="text-outline">/ {formatCurrency(b.limit, profile.currency)}</span>
                      </div>
                    </div>
                    
                    {/* Segmented Dash progress bar */}
                    <div className="flex gap-1.5 w-full h-1.5 pl-0.5">
                      {Array.from({ length: budgetSegments }).map((_, idx) => (
                        <div 
                          key={idx}
                          className={cn(
                            "flex-1 h-full rounded-full transition-all duration-300",
                            idx < activeSegments ? progressFillColor : "bg-white/10"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <button 
            onClick={() => {
              const catName = prompt("Enter new budget category (e.g. Food, Transport, Shopping):");
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

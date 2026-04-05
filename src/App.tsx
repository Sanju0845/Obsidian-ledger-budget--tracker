import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation, useDragControls } from 'motion/react';
import { 
  Search, 
  Plus, 
  Minus,
  Home, 
  Wallet, 
  ReceiptText, 
  LayoutGrid, 
  Bell, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ChevronRight,
  Utensils,
  ShoppingBag,
  Zap,
  Film,
  Fuel,
  Dumbbell,
  X,
  Scan,
  PlusCircle,
  Plane,
  PartyPopper,
  Heart,
  GraduationCap,
  Sparkles,
  User,
  Settings,
  LogOut,
  ChevronLeft,
  Trash2,
  Edit2,
  Check,
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  BarChart3,
  Calendar,
  Filter,
  Download,
  Upload,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  MoreVertical,
  Target,
  ArrowRightLeft,
  Users,
  HandCoins,
  Search as SearchIcon
} from 'lucide-react';
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
  BarChart, 
  Bar,
  Legend
} from 'recharts';
import { cn } from './lib/utils';
import { Transaction, Card, Budget, UserProfile, Notification, BANK_LOGOS, CARD_COLORS, SavingsGoal, UPIAccount, Bank } from './types';
import { GoogleGenAI } from "@google/genai";
import { Html5Qrcode } from "html5-qrcode";

// --- Constants & Mock Data ---
const INITIAL_CARDS: Card[] = [];
const INITIAL_TRANSACTIONS: Transaction[] = [];
const INITIAL_BUDGETS: Budget[] = [
  { id: '1', category: 'Dining', limit: 5000, spent: 0 },
  { id: '2', category: 'Shopping', limit: 10000, spent: 0 },
  { id: '3', category: 'Tech', limit: 20000, spent: 0 },
  { id: '4', category: 'Utilities', limit: 3000, spent: 0 },
  { id: '5', category: 'Transport', limit: 2000, spent: 0 },
  { id: '6', category: 'Health', limit: 5000, spent: 0 },
  { id: '7', category: 'Entertainment', limit: 4000, spent: 0 },
];

const INITIAL_PROFILE: UserProfile = {
  name: 'Sanju',
  email: 'sanju@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sanju&backgroundColor=ba9eff&mood[]=happy',
  currency: 'INR',
  theme: 'dark'
};

const INITIAL_SAVINGS: SavingsGoal[] = [
  { id: '1', name: 'New iPhone', targetAmount: 80000, currentAmount: 15000, color: '#ba9eff', icon: 'ShoppingBag' },
  { id: '2', name: 'Europe Trip', targetAmount: 250000, currentAmount: 45000, color: '#699cff', icon: 'Plane' },
];

const AVAILABLE_BANKS: Bank[] = [
  { id: 'sbi', name: 'State Bank of India', logo: BANK_LOGOS.sbi },
  { id: 'hdfc', name: 'HDFC Bank', logo: BANK_LOGOS.hdfc },
  { id: 'icici', name: 'ICICI Bank', logo: BANK_LOGOS.icici },
  { id: 'axis', name: 'Axis Bank', logo: BANK_LOGOS.axis },
  { id: 'kotak', name: 'Kotak Mahindra Bank', logo: BANK_LOGOS.kotak },
];

const CATEGORY_ICONS: Record<string, any> = {
  Dining: Utensils,
  Tech: ShoppingBag,
  Income: ArrowUpRight,
  Utilities: Zap,
  Entertainment: Film,
  Transport: Fuel,
  Health: Dumbbell,
  Shopping: ShoppingBag,
  Food: Utensils,
  Travel: Plane,
  Fun: PartyPopper,
  Study: GraduationCap,
};

// --- Animation Constants ---
const SMOOTH_TRANSITION = { type: 'tween' as const, ease: 'easeOut' as const, duration: 0.2 };
const QUICK_TRANSITION = { type: 'tween' as const, ease: 'linear' as const, duration: 0.15 };

// --- Bottom Sheet Component ---
const BottomSheet = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  height = "auto"
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  title?: string, 
  children: React.ReactNode,
  height?: string 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            transition={QUICK_TRANSITION}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div 
            initial={{ y: '100%' }} 
            animate={{ y: 0 }} 
            exit={{ y: '100%' }}
            transition={SMOOTH_TRANSITION}
            className="relative w-full max-w-md bg-surface-container-high rounded-t-[32px] p-6 pb-12 shadow-2xl border-t border-white/10 overflow-hidden"
            style={{ maxHeight: '90vh', height }}
          >
            <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
            {title && (
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline text-2xl font-bold">{title}</h3>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-on-surface-variant">
                  <X size={20} />
                </button>
              </div>
            )}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] no-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// --- App Lock Component ---
const AppLock = ({ onUnlock, savedPin }: { onUnlock: () => void, savedPin: string }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleNumber = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      if (newPin.length === 4) {
        if (newPin === savedPin) {
          onUnlock();
        } else {
          setError(true);
          setTimeout(() => {
            setPin('');
            setError(false);
          }, 500);
        }
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={SMOOTH_TRANSITION}
      className="fixed inset-0 z-[200] bg-surface flex flex-col items-center justify-center p-8"
    >
      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={32} className="text-primary" />
        </div>
        <h1 className="font-headline text-3xl font-bold mb-2">Obsidian Ledger</h1>
        <p className="text-on-surface-variant text-sm">Enter your 4-digit PIN</p>
      </div>

      <div className="flex gap-4 mb-16">
        {[0, 1, 2, 3].map((i) => (
          <motion.div 
            key={i}
            animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
            transition={QUICK_TRANSITION}
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-all duration-300",
              pin.length > i ? "bg-primary border-primary scale-125" : "border-white/20"
            )}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-xs">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'].map((val, i) => (
          <button
            key={i}
            onClick={() => {
              if (val === 'back') setPin(pin.slice(0, -1));
              else if (val !== '') handleNumber(val);
            }}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all active:scale-90",
              val === '' ? "invisible" : "bg-surface-container hover:bg-surface-container-high"
            )}
          >
            {val === 'back' ? <X size={24} /> : val}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

// --- Savings View Component ---
const SavingsView = ({ goals, currency }: { goals: SavingsGoal[], currency: string }) => {
  return (
    <div className="space-y-8 pb-32">
      <div>
        <h1 className="font-headline text-4xl font-bold">Savings</h1>
        <p className="text-on-surface-variant text-sm">Track your progress towards goals</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {goals.map(goal => {
          const percent = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
          return (
            <div key={goal.id} className="bg-surface-container-low p-6 rounded-[32px] border border-white/5 shadow-xl relative overflow-hidden">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${goal.color}20`, color: goal.color }}>
                    {goal.icon === 'ShoppingBag' ? <ShoppingBag size={24} /> : <Plane size={24} />}
                  </div>
                  <div>
                    <h3 className="font-headline font-bold text-lg">{goal.name}</h3>
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">
                      {formatCurrency(goal.currentAmount, currency)} of {formatCurrency(goal.targetAmount, currency)}
                    </p>
                  </div>
                </div>
                <span className="text-primary font-bold text-lg">{percent.toFixed(0)}%</span>
              </div>

              <div className="h-2 w-full bg-surface-container-highest rounded-full overflow-hidden mb-4">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={SMOOTH_TRANSITION}
                  className="h-full bg-primary"
                  style={{ backgroundColor: goal.color }}
                />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-surface bg-surface-container-high overflow-hidden">
                      <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${goal.id}${i}`} alt="Contributor" />
                    </div>
                  ))}
                  <div className="w-6 h-6 rounded-full border-2 border-surface bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
                    +12
                  </div>
                </div>
                <button className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors">
                  Add Funds
                </button>
              </div>
            </div>
          );
        })}

        <button className="w-full h-32 rounded-[32px] border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 text-on-surface-variant hover:text-white hover:border-white/20 transition-all">
          <Plus size={24} />
          <span className="font-bold">Create New Goal</span>
        </button>
      </div>
    </div>
  );
};

// --- Analytics View Component ---
const AnalyticsView = ({ transactions, profile, budgets }: { transactions: Transaction[], profile: any, budgets: Budget[] }) => {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const chartData = useMemo(() => {
    // Group transactions by date
    const groups: Record<string, { date: string, income: number, expense: number }> = {};
    const now = new Date();
    
    transactions.forEach(t => {
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

  const COLORS = ['#ba9eff', '#699cff', '#ff86c3', '#ff6e84', '#4ade80', '#fbbf24'];

  return (
    <div className="space-y-8 pb-32">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="font-headline text-4xl font-bold">Analytics</h1>
          <p className="text-on-surface-variant text-sm">Review your financial health</p>
        </div>
        <div className="flex bg-surface-container rounded-full p-1 border border-white/5">
          {['week', 'month', 'year'].map(r => (
            <button 
              key={r}
              onClick={() => setTimeRange(r as any)}
              className={cn(
                "px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                timeRange === r ? "bg-primary text-surface" : "text-on-surface-variant"
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Main Trend Chart */}
      <div className="bg-surface-container-low p-6 rounded-[32px] border border-white/5 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-headline font-bold text-lg">Cash Flow</h3>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">Expense</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary" />
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">Income</span>
            </div>
          </div>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ba9eff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ba9eff" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#699cff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#699cff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#a1a1a1', fontSize: 10 }} dy={10} />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="expense" stroke="#ba9eff" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              <Area type="monotone" dataKey="income" stroke="#699cff" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Category Distribution */}
        <div className="bg-surface-container-low p-6 rounded-[32px] border border-white/5">
          <h3 className="font-headline font-bold text-lg mb-6">Spending by Category</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1a1a1a', border: 'none', borderRadius: '16px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {categoryPieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span className="text-[10px] font-bold truncate">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Budget Performance */}
        <div className="bg-surface-container-low p-6 rounded-[32px] border border-white/5">
          <h3 className="font-headline font-bold text-lg mb-6">Budget vs Actual</h3>
          <div className="space-y-4">
            {budgets.slice(0, 4).map(b => {
              const spent = transactions
                .filter(t => t.category === b.category && t.type === 'expense')
                .reduce((acc, t) => acc + t.amount, 0);
              const percent = Math.min((spent / b.limit) * 100, 100);
              return (
                <div key={b.id} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span>{b.category}</span>
                    <span className={percent > 90 ? "text-error" : "text-primary"}>{percent.toFixed(0)}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-highest rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${percent}%` }}
                      transition={SMOOTH_TRANSITION}
                      className={cn("h-full", percent > 90 ? "bg-error" : "bg-primary")}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const SwipeableItem = ({ children, onDelete, onEdit, className }: { children: React.ReactNode, onDelete?: () => void, onEdit?: () => void, className?: string, key?: any }) => {
  const [isOpen, setIsOpen] = useState<string | null>(null);
  const controls = useAnimation();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  const handleDragEnd = (_: any, info: any) => {
    if (info.offset.x < -50) {
      if (isMounted.current) controls.start({ x: -80, transition: SMOOTH_TRANSITION });
      setIsOpen('delete');
    } else if (info.offset.x > 50) {
      if (isMounted.current) controls.start({ x: 80, transition: SMOOTH_TRANSITION });
      setIsOpen('edit');
    } else {
      if (isMounted.current) controls.start({ x: 0, transition: SMOOTH_TRANSITION });
      setIsOpen(null);
    }
  };

  return (
    <div className={cn("relative overflow-hidden rounded-xl", className)}>
      {/* Background Actions */}
      <div className="absolute inset-0 flex justify-between items-center">
        <div 
          onClick={() => {
            if (onEdit) onEdit();
            else onDelete?.();
            controls.start({ x: 0 });
            setIsOpen(null);
          }}
          className={cn(
            "h-full w-20 flex items-center justify-center cursor-pointer",
            onEdit ? "bg-primary text-[#39008c]" : "bg-error text-white"
          )}
        >
          {onEdit ? <Edit2 size={20} /> : <Trash2 size={20} />}
        </div>
        <div 
          onClick={() => {
            onDelete?.();
            controls.start({ x: 0 });
            setIsOpen(null);
          }}
          className="h-full w-20 bg-error text-white flex items-center justify-center cursor-pointer"
        >
          <Trash2 size={20} />
        </div>
      </div>

      {/* Foreground Content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 80 }}
        dragElastic={0.1}
        animate={controls}
        onDragEnd={handleDragEnd}
        whileTap={{ cursor: 'grabbing' }}
        className="relative z-10"
      >
        {children}
      </motion.div>
    </div>
  );
};

// --- Helpers ---
const formatCurrency = (amount: number | undefined, currency: string) => {
  if (amount === undefined || amount === null) return '₹0.00';
  const symbol = currency === 'INR' ? '₹' : '$';
  return `${symbol}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// --- Components ---

const TopAppBar = ({ profile, onProfileClick, onNotificationsClick, unreadCount }: { profile: UserProfile, onProfileClick: () => void, onNotificationsClick: () => void, unreadCount: number }) => (
  <header className="fixed top-4 left-0 right-0 w-full flex justify-between px-6 z-50">
    <div 
      onClick={onProfileClick}
      className="glass-header rounded-full h-12 px-2 flex items-center shadow-[0px_0px_32px_rgba(186,158,255,0.08)] cursor-pointer active:scale-95 transition-transform"
    >
      <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20">
        <img 
          alt={profile.name} 
          className="w-full h-full object-cover" 
          src={profile.avatar}
          referrerPolicy="no-referrer"
        />
      </div>
      <span className="ml-3 mr-4 font-headline font-bold text-white text-sm tracking-tight">{profile.name} v1.5.</span>
    </div>
    <div className="flex gap-2">
      <button 
        onClick={onNotificationsClick}
        className="glass-header w-12 h-12 rounded-full flex items-center justify-center text-primary transition-transform active:scale-90 relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-3 right-3 w-2 h-2 bg-error rounded-full border border-surface-container-high" />
        )}
      </button>
    </div>
  </header>
);

const CardStack = React.memo(({ cards, activeIndex, onSwipe, currency }: { cards: Card[], activeIndex: number, onSwipe: (dir: number) => void, currency: string }) => {
  return (
    <section className="relative mb-12 h-64 px-6">
      <div className="relative h-full w-full max-w-md mx-auto flex items-center justify-center">
        <AnimatePresence initial={false}>
          {cards.map((card, idx) => {
            // Calculate relative index for stacking effect
            let relIdx = (idx - activeIndex + cards.length) % cards.length;
            
            // We only show the active card and the next 2 cards in the stack
            if (relIdx > 2) return null;

            return (
              <motion.div
                key={card.id}
                layoutId={card.id}
                className={cn(
                  "absolute inset-0 h-52 rounded-2xl p-6 flex flex-col justify-between card-shadow-glow border border-white/10",
                  "bg-gradient-to-br",
                  card.color
                )}
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ 
                  scale: 1 - relIdx * 0.08, 
                  opacity: 1 - relIdx * 0.4,
                  y: relIdx * -25, // More pronounced stack
                  zIndex: cards.length - relIdx,
                  rotate: relIdx * 2
                }}
                transition={SMOOTH_TRANSITION}
                exit={{ x: -300, opacity: 0, rotate: -20, transition: { duration: 0.2 } }}
                drag={relIdx === 0 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 100) onSwipe(-1);
                  else if (info.offset.x < -100) onSwipe(1);
                }}
                style={{ cursor: relIdx === 0 ? 'grab' : 'default' }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {BANK_LOGOS[card.bank.toLowerCase().replace(/\s/g, '')] ? (
                      <div className="bg-white/90 p-1 rounded-md h-8 w-8 flex items-center justify-center overflow-hidden">
                        <img 
                          src={BANK_LOGOS[card.bank.toLowerCase().replace(/\s/g, '')]} 
                          className="h-full w-full object-contain" 
                          alt={card.bank} 
                          referrerPolicy="no-referrer" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-[10px] font-bold text-black">${card.bank.charAt(0)}</span>`;
                          }}
                        />
                      </div>
                    ) : (
                      <div className="bg-white/20 p-1 rounded-md h-8 w-8 flex items-center justify-center overflow-hidden">
                        <span className="text-[10px] font-bold text-white uppercase">{card.bank.charAt(0)}</span>
                      </div>
                    )}
                    <span className="text-white/60 text-xs font-medium">| {card.name}</span>
                  </div>
                  <CreditCard className="text-white/80" size={24} />
                </div>
                
                <div>
                  <p className="font-headline text-2xl text-white tracking-[0.2em] mb-4">
                    •••• •••• •••• {card.last4}
                  </p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] uppercase font-label text-white/60 mb-1">Balance</p>
                      <p className="font-headline text-xl text-white font-bold">{formatCurrency(card.balance, currency)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-label text-white/60">Exp {card.expiry}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
});

const TransactionItem = ({ transaction, onDelete, currency }: { transaction: Transaction, onDelete?: (id: string) => void, currency: string, key?: React.Key }) => {
  const Icon = CATEGORY_ICONS[transaction.category] || ReceiptText;
  const isExpense = transaction.type === 'expense';

  const content = (
    <div className="bg-surface-container-low hover:bg-surface-container p-4 flex items-center transition-colors group relative overflow-hidden">
      <div className={cn(
        "w-12 h-12 rounded-lg flex items-center justify-center",
        isExpense ? "bg-error/10 text-error" : "bg-secondary/10 text-secondary"
      )}>
        <Icon size={24} />
      </div>
      <div className="ml-4 flex-1">
        <p className="text-sm font-bold text-on-surface tracking-tight">{transaction.merchant}</p>
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

const BottomNavBar = ({ activeTab, onTabChange }: { activeTab: string, onTabChange: (tab: string) => void }) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'budget', label: 'Budget', icon: Wallet },
    { id: 'upi', label: 'UPI', icon: Scan },
    { id: 'transactions', label: 'Ledger', icon: ReceiptText },
    { id: 'profile', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 pointer-events-none">
      {/* Fade background to prevent accidental clicks and add depth */}
      <div className="absolute inset-x-0 bottom-0 h-32 glass-nav pointer-events-auto" />
      
      <div className="relative flex justify-around items-center px-8 pb-10 pt-4 pointer-events-none">
        <div className="glass-header rounded-full w-full max-w-md h-16 flex justify-around items-center px-4 shadow-2xl pointer-events-auto border border-white/10">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center justify-center transition-all tap-highlight-none relative flex-1",
                activeTab === tab.id ? "text-primary font-bold" : "text-on-surface-variant hover:text-white"
              )}
            >
              <motion.div
                animate={activeTab === tab.id ? { scale: 1.1, y: -1 } : { scale: 1, y: 0 }}
                transition={QUICK_TRANSITION}
              >
                <tab.icon size={18} className={cn("mb-1", activeTab === tab.id && "fill-primary/20")} />
              </motion.div>
              <span className="text-[10px] font-medium tracking-tight">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="nav-pill"
                  className="absolute -bottom-1 w-1 h-1 bg-primary rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

// --- UPI Components ---

const QRScanner = ({ onScan, onClose }: { onScan: (data: string) => void, onClose: () => void }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const html5QrCode = new Html5Qrcode("reader");
    scannerRef.current = html5QrCode;

    const startScanner = async () => {
      try {
        const devices = await Html5Qrcode.getCameras();
        const backCamera = devices.find(device => 
          device.label.toLowerCase().includes('back') || 
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        );

        const config = { fps: 10, qrbox: { width: 280, height: 280 } };
        
        if (backCamera) {
          await html5QrCode.start(
            backCamera.id,
            config,
            (decodedText) => {
              onScan(decodedText);
              html5QrCode.stop().catch(console.error);
            },
            () => {}
          );
        } else {
          // Fallback to environment facing mode if no explicit back camera found
          await html5QrCode.start(
            { facingMode: "environment" },
            config,
            (decodedText) => {
              onScan(decodedText);
              html5QrCode.stop().catch(console.error);
            },
            () => {}
          );
        }
        setIsReady(true);
      } catch (err) {
        console.error("Error starting scanner:", err);
        // Final fallback to any camera
        try {
          await html5QrCode.start(
            { facingMode: "user" },
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              onScan(decodedText);
              html5QrCode.stop().catch(console.error);
            },
            () => {}
          );
          setIsReady(true);
        } catch (err2) {
          console.error("Fallback scanner error:", err2);
        }
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-[150] bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full flex justify-between items-center mb-8">
        <h2 className="text-white font-headline text-2xl font-bold">Scan QR Code</h2>
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
          <X size={20} />
        </button>
      </div>
      <div className="relative w-full max-w-sm aspect-square rounded-3xl overflow-hidden border-2 border-primary/50 bg-surface-container shadow-[0_0_50px_rgba(186,158,255,0.2)]">
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-surface/80">
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
            />
          </div>
        )}
        <div id="reader" className="w-full h-full" />
        
        {/* Scanning Animation Overlay */}
        <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40 z-10">
          <div className="w-full h-full border-2 border-primary/50 relative">
            {/* Corner Accents */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg" />
            
            {/* Scanning Line */}
            <motion.div 
              animate={{ top: ['0%', '100%', '0%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(186,158,255,0.8)]"
            />
          </div>
        </div>
      </div>
      <p className="text-white/60 text-center mt-8 text-sm">Align the QR code within the frame to scan</p>
    </div>
  );
};

const UPI_APPS = [
  { id: 'gpay', name: 'Google Pay', package: 'com.google.android.apps.nbu.paisa.user', logo: 'https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg' },
  { id: 'phonepe', name: 'PhonePe', package: 'com.phonepe.app', logo: 'https://upload.wikimedia.org/wikipedia/commons/7/71/PhonePe_Logo.svg' },
  { id: 'paytm', name: 'Paytm', package: 'net.one97.paytm', logo: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg' },
  { id: 'amazonpay', name: 'Amazon Pay', package: 'in.amazon.mShop.android.shopping', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg' },
  { id: 'bhim', name: 'BHIM', package: 'in.org.npci.upiapp', logo: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/BHIM_Logo.png' },
];

const UPIPaymentModal = ({ 
  upiData, 
  accounts, 
  onContinue,
  onClose,
  currency 
}: { 
  upiData: { upiId: string, name?: string, amount?: string }, 
  accounts: UPIAccount[], 
  onContinue: (amount: string, accountId: string) => void,
  onClose: () => void,
  currency: string
}) => {
  const [amount, setAmount] = useState(upiData.amount || '');
  const [selectedAccountId, setSelectedAccountId] = useState(accounts.find(a => a.isDefault)?.id || accounts[0]?.id);
  const [isPaying, setIsPaying] = useState(false);

  const handlePay = () => {
    if (!amount || !selectedAccountId) return;
    onContinue(amount, selectedAccountId);
  };

  return (
    <div className="space-y-6">
      <div className="text-center py-4">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <ArrowUpRight size={32} className="text-primary" />
        </div>
        <h3 className="font-headline text-xl font-bold">{upiData.name || 'Paying to'}</h3>
        <p className="text-on-surface-variant text-sm">{upiData.upiId}</p>
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
            className="w-full bg-surface-container h-16 rounded-2xl pl-12 pr-4 text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest ml-1">Pay From</label>
        <div className="space-y-2">
          {accounts.map(acc => (
            <button 
              key={acc.id}
              onClick={() => setSelectedAccountId(acc.id)}
              className={cn(
                "w-full p-4 rounded-2xl border flex items-center justify-between transition-all",
                selectedAccountId === acc.id ? "bg-primary/10 border-primary" : "bg-surface-container border-transparent"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                  <Wallet size={20} className="text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-bold text-sm">{acc.bankName}</p>
                  <p className="text-[10px] text-on-surface-variant">{acc.upiId}</p>
                </div>
              </div>
              {selectedAccountId === acc.id && <Check size={20} className="text-primary" />}
            </button>
          ))}
        </div>
      </div>

      <button 
        disabled={!amount || isPaying}
        onClick={handlePay}
        className="w-full h-14 bg-primary text-surface rounded-2xl font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:grayscale transition-all active:scale-95"
      >
        {isPaying ? (
          <motion.div 
            animate={{ rotate: 360 }} 
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-6 h-6 border-2 border-surface border-t-transparent rounded-full"
          />
        ) : (
          <>
            <Zap size={20} />
            Continue to Payment
          </>
        )}
      </button>
    </div>
  );
};

const UPIManagement = ({ accounts, transactions, onAdd, onDelete, onSetDefault, currency }: { accounts: UPIAccount[], transactions: Transaction[], onAdd: () => void, onDelete: (id: string) => void, onSetDefault: (id: string) => void, currency: string }) => {
  const upiTransactions = transactions.filter(t => t.cardId === 'upi').slice(0, 5);

  return (
    <div className="space-y-8 pb-32">
      <div>
        <h1 className="font-headline text-4xl font-bold">UPI Accounts</h1>
        <p className="text-on-surface-variant text-sm">Manage your linked bank accounts</p>
      </div>

      <div className="space-y-4">
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
                <p className="text-xl font-bold">₹{(acc.balance || 0).toLocaleString()}</p>
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

const SplitBillModal = ({ onClose }: { onClose: () => void }) => {
  const [amount, setAmount] = useState('');
  const [people, setPeople] = useState('2');
  
  return (
    <div className="space-y-6">
      <div>
        <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2 block">Total Amount</label>
        <input 
          type="number" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full bg-surface-container-low border border-white/5 rounded-2xl p-4 text-2xl font-bold focus:border-primary outline-none transition-colors"
        />
      </div>

      <div>
        <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2 block">Number of People</label>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setPeople(Math.max(1, parseInt(people) - 1).toString())}
            className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary"
          >
            <Minus size={20} />
          </button>
          <span className="text-2xl font-bold flex-1 text-center">{people}</span>
          <button 
            onClick={() => setPeople((parseInt(people) + 1).toString())}
            className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center text-primary"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {amount && parseInt(people) > 0 && (
        <div className="bg-primary/10 p-6 rounded-3xl border border-primary/20">
          <p className="text-[10px] text-primary uppercase font-bold tracking-widest mb-1">Each Person Pays</p>
          <p className="text-3xl font-bold text-primary">₹{(parseFloat(amount) / parseInt(people)).toFixed(2)}</p>
        </div>
      )}

      <button 
        onClick={() => {
          alert(`Requesting ₹${(parseFloat(amount) / parseInt(people)).toFixed(2)} from ${parseInt(people) - 1} people`);
          onClose();
        }}
        className="w-full py-4 bg-primary text-surface font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        Send Split Request
      </button>
    </div>
  );
};

const RequestMoneyModal = ({ onClose }: { onClose: () => void }) => {
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  
  return (
    <div className="space-y-6">
      <div>
        <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2 block">Amount</label>
        <input 
          type="number" 
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="w-full bg-surface-container-low border border-white/5 rounded-2xl p-4 text-2xl font-bold focus:border-primary outline-none transition-colors"
        />
      </div>

      <div>
        <label className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest mb-2 block">Payer UPI ID</label>
        <input 
          type="text" 
          value={upiId}
          onChange={(e) => setUpiId(e.target.value)}
          placeholder="example@upi"
          className="w-full bg-surface-container-low border border-white/5 rounded-2xl p-4 font-bold focus:border-primary outline-none transition-colors"
        />
      </div>

      <button 
        onClick={() => {
          alert(`Request for ₹${amount} sent to ${upiId}`);
          onClose();
        }}
        className="w-full py-4 bg-primary text-surface font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
      >
        Send Request
      </button>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [cards, setCards] = useState<Card[]>(() => {
    const saved = localStorage.getItem('obsidian_cards');
    return saved ? JSON.parse(saved) : INITIAL_CARDS;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('obsidian_transactions');
    return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
  });
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('obsidian_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('obsidian_savings');
    return saved ? JSON.parse(saved) : INITIAL_SAVINGS;
  });
  const [upiAccounts, setUpiAccounts] = useState<UPIAccount[]>(() => {
    const saved = localStorage.getItem('obsidian_upi_accounts');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showUPIPaymentModal, setShowUPIPaymentModal] = useState(false);
  const [showUPIAppChooser, setShowUPIAppChooser] = useState(false);
  const [selectedUPIAccount, setSelectedUPIAccount] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const handleUPIContinue = (amount: string, accountId: string) => {
    setPaymentAmount(amount);
    setSelectedUPIAccount(accountId);
    setShowUPIAppChooser(true);
  };

  const executeUPIPayment = (appPackage?: string) => {
    if (!scannedUPI || !paymentAmount || !selectedUPIAccount) return;

    const baseUrl = `upi://pay?pa=${scannedUPI.upiId}&pn=${encodeURIComponent(scannedUPI.name || 'Merchant')}&am=${paymentAmount}&cu=INR`;
    const link = appPackage 
      ? `intent://pay?pa=${scannedUPI.upiId}&pn=${encodeURIComponent(scannedUPI.name || 'Merchant')}&am=${paymentAmount}&cu=INR#Intent;scheme=upi;package=${appPackage};end`
      : baseUrl;

    window.location.href = link;
    
    // Record the transaction
    setTimeout(() => {
      handleUPIPay(parseFloat(paymentAmount), selectedUPIAccount);
      setShowUPIAppChooser(false);
      setShowUPIPaymentModal(false);
      setScannedUPI(null);
    }, 2000);
  };
  const [showAddUPIModal, setShowAddUPIModal] = useState(false);
  const [scannedUPI, setScannedUPI] = useState<{ upiId: string, name?: string, amount?: string } | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [smsText, setSmsText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [smsSyncEnabled, setSmsSyncEnabled] = useState(() => {
    return localStorage.getItem('obsidian_sms_sync') === 'true';
  });

  // Profile & Notifications state
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('obsidian_profile');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...INITIAL_PROFILE, ...parsed };
    }
    return INITIAL_PROFILE;
  });
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem('obsidian_notifications');
    return saved ? JSON.parse(saved) : [];
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Category Detail state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Form states
  const [newCard, setNewCard] = useState({ bank: '', name: '', last4: '' });
  const [newTx, setNewTx] = useState({ amount: '', merchant: '', category: 'Dining', type: 'expense', cardId: '' });

  // Persistence
  useEffect(() => {
    localStorage.setItem('obsidian_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('obsidian_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('obsidian_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('obsidian_savings', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('obsidian_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('obsidian_notifications', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem('obsidian_sms_sync', String(smsSyncEnabled));
  }, [smsSyncEnabled]);

  useEffect(() => {
    localStorage.setItem('obsidian_upi_accounts', JSON.stringify(upiAccounts));
  }, [upiAccounts]);

  useEffect(() => {
    // Apply theme to document
    if (profile.theme === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
    }
  }, [profile.theme]);

  useEffect(() => {
    // Welcome notification for first-time users
    if (notifications.length === 0 && cards.length === 0) {
      const welcomeNotif: Notification = {
        id: 'welcome',
        title: 'Welcome to Obsidian Ledger',
        message: 'Get started by adding your first card or syncing an SMS transaction.',
        time: new Date().toISOString(),
        read: false,
        type: 'system'
      };
      setNotifications([welcomeNotif]);
    }
  }, []);

  const activeCard = cards[activeCardIndex];
  const filteredTransactions = useMemo(() => {
    if (!activeCard) return [];
    return transactions.filter(t => t.cardId === activeCard.id);
  }, [transactions, activeCard?.id]);

  const [isLocked, setIsLocked] = useState(true);
  const [appPin, setAppPin] = useState('1234'); // Default PIN
  const [showPinSettings, setShowPinSettings] = useState(false);
  const [newPin, setNewPin] = useState('');

  // UPI Handlers
  const handleQRScan = useCallback((data: string) => {
    // UPI QR format: upi://pay?pa=address&pn=name&am=amount&cu=currency&tn=note
    try {
      const url = new URL(data);
      if (url.protocol === 'upi:') {
        const params = new URLSearchParams(url.search);
        const upiId = params.get('pa') || '';
        const name = params.get('pn') || '';
        const amount = params.get('am') || '';
        
        if (upiId) {
          setScannedUPI({ upiId, name, amount });
          setShowQRScanner(false);
          setShowUPIPaymentModal(true);
        }
      } else {
        // Handle generic text or other formats
        setScannedUPI({ upiId: data });
        setShowQRScanner(false);
        setShowUPIPaymentModal(true);
      }
    } catch (e) {
      // Fallback for non-URL QR codes
      setScannedUPI({ upiId: data });
      setShowQRScanner(false);
      setShowUPIPaymentModal(true);
    }
  }, []);

  const handleUPIPay = (amount: number, accountId: string) => {
    const account = upiAccounts.find(a => a.id === accountId);
    if (!account || account.balance < amount) {
      // Handle error
      return;
    }

    // Deduct from UPI account
    setUpiAccounts(prev => prev.map(a => 
      a.id === accountId ? { ...a, balance: a.balance - amount } : a
    ));

    // Add transaction
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      amount,
      type: 'expense',
      category: 'UPI Payment',
      merchant: scannedUPI?.name || scannedUPI?.upiId || 'UPI Transfer',
      date: new Date().toISOString(),
      cardId: 'upi', // Special ID for UPI transactions
      description: `UPI Payment to ${scannedUPI?.upiId}`
    };
    setTransactions(prev => [newTransaction, ...prev]);

    // Add notification
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'UPI Payment Successful',
      message: `Paid ${formatCurrency(amount, profile.currency)} to ${scannedUPI?.upiId}`,
      time: new Date().toISOString(),
      read: false,
      type: 'transaction'
    };
    setNotifications(prev => [newNotif, ...prev]);

    setShowUPIPaymentModal(false);
    setScannedUPI(null);
  };

  const addUPIAccount = (bank: Bank, upiId: string) => {
    const newAccount: UPIAccount = {
      id: Math.random().toString(36).substr(2, 9),
      upiId,
      bankName: bank.name,
      accountNumber: `XXXX${Math.floor(1000 + Math.random() * 9000)}`,
      balance: 10000 + Math.floor(Math.random() * 50000), // Mock balance
      isDefault: upiAccounts.length === 0
    };
    setUpiAccounts(prev => [...prev, newAccount]);
    setShowAddUPIModal(false);
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newTransactions: Transaction[] = [];
      
      // Simple CSV parsing (Date, Category, Amount, Merchant, Type)
      lines.slice(1).forEach(line => {
        const [date, category, amount, merchant, type] = line.split(',');
        if (date && amount) {
          newTransactions.push({
            id: Math.random().toString(36).substr(2, 9),
            date,
            category: category || 'Other',
            amount: parseFloat(amount),
            merchant: merchant || 'Unknown',
            type: (type?.trim().toLowerCase() as 'income' | 'expense') || 'expense',
            cardId: cards[0].id
          });
        }
      });

      if (newTransactions.length > 0) {
        setTransactions(prev => [...newTransactions, ...prev]);
        alert(`Successfully imported ${newTransactions.length} transactions!`);
      }
    };
    reader.readAsText(file);
  };

  const totalBalance = useMemo(() => cards.reduce((acc, c) => acc + c.balance, 0), [cards]);

  const totalIncome = useMemo(() => 
    transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
  [transactions]);

  const totalExpense = useMemo(() => 
    transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
  [transactions]);

  const categoryData = useMemo(() => {
    const data: Record<string, { amount: number, count: number }> = {};
    transactions.filter(t => t.type === 'expense').forEach(t => {
      if (!data[t.category]) data[t.category] = { amount: 0, count: 0 };
      data[t.category].amount += t.amount;
      data[t.category].count += 1;
    });
    return data;
  }, [transactions]);

  const handleSwipe = (dir: number) => {
    if (cards.length === 0) return;
    setActiveCardIndex((prev) => (prev + dir + cards.length) % cards.length);
  };

  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    // Update card balance
    setCards(prev => prev.map(c => {
      if (c.id === tx.cardId) {
        return { ...c, balance: c.balance - (tx.type === 'income' ? tx.amount : -tx.amount) };
      }
      return c;
    }));

    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleDeleteCard = (id: string) => {
    if (!confirm("Are you sure you want to delete this card and all its transactions?")) return;
    
    setTransactions(prev => prev.filter(t => t.cardId !== id));
    setCards(prev => {
      const newCards = prev.filter(c => c.id !== id);
      if (activeCardIndex >= newCards.length) {
        setActiveCardIndex(Math.max(0, newCards.length - 1));
      }
      return newCards;
    });
  };

  const handleAddTransaction = (txData: any) => {
    if (!activeCard && !txData.cardId) {
      alert("Please add a card first.");
      return;
    }
    const tx: Transaction = { 
      ...txData, 
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      cardId: txData.cardId || activeCard?.id
    };
    setTransactions([tx, ...transactions]);
    
    // Update card balance
    setCards(prev => prev.map(c => {
      if (c.id === tx.cardId) {
        return { ...c, balance: c.balance + (tx.type === 'income' ? tx.amount : -tx.amount) };
      }
      return c;
    }));

    // Add notification
    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      title: tx.type === 'income' ? 'Money Received' : 'Payment Successful',
      message: `${tx.type === 'income' ? 'Received' : 'Spent'} ${formatCurrency(tx.amount, profile.currency)} at ${tx.merchant}`,
      time: new Date().toISOString(),
      read: false,
      type: 'transaction'
    };
    setNotifications([newNotif, ...notifications]);

    setShowAddModal(false);
    setNewTx({ amount: '', merchant: '', category: 'Dining', type: 'expense', cardId: '' });
  };

  const handleAddCard = () => {
    if (!newCard.bank || !newCard.last4) return;
    const card: Card = {
      id: Math.random().toString(36).substr(2, 9),
      bank: newCard.bank,
      name: newCard.name || `${newCard.bank} Card`,
      last4: newCard.last4,
      balance: 0,
      color: CARD_COLORS[cards.length % CARD_COLORS.length],
      expiry: '12/29'
    };
    setCards([...cards, card]);
    setShowAddCardModal(false);
    setNewCard({ bank: '', name: '', last4: '' });
  };

  const parseSms = async () => {
    if (!smsText.trim()) return;
    setIsParsing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Parse the following SMS text into a JSON transaction object. 
        SMS: "${smsText}"
        JSON format: { 
          "amount": number, 
          "type": "expense" | "income", 
          "merchant": string, 
          "category": string, 
          "bank": string,
          "last4": string (4 digits if found)
        }
        Context:
        - If it's a debit/payment/spent, type is expense.
        - If credit/received/deposited, type is income.
        - Categories: Dining, Tech, Utilities, Entertainment, Transport, Health, Shopping, Travel, Fun, Study.
        - Bank: Try to identify the bank name (e.g. HDFC, SBI, ICICI).
        Return ONLY the JSON.`,
      });

      const result = JSON.parse(response.text.replace(/```json|```/g, '').trim());
      
      // Find matching card by bank and last4, or just bank, or use active
      let card = cards.find(c => 
        (c.bank.toLowerCase() === result.bank?.toLowerCase() && c.last4 === result.last4) ||
        (c.bank.toLowerCase() === result.bank?.toLowerCase())
      );
      
      if (!card && activeCard) card = activeCard;
      
      if (!card) {
        // If no card exists, we might need to create one if we have bank info
        if (result.bank && result.last4) {
          const newCardObj: Card = {
            id: Math.random().toString(36).substr(2, 9),
            bank: result.bank,
            name: `${result.bank} Card`,
            last4: result.last4,
            balance: 0,
            color: CARD_COLORS[cards.length % CARD_COLORS.length],
            expiry: '12/29'
          };
          setCards([...cards, newCardObj]);
          card = newCardObj;
        } else {
          throw new Error("No card found and insufficient info to create one.");
        }
      }
      
      handleAddTransaction({
        amount: result.amount,
        type: result.type,
        category: result.category || 'Shopping',
        merchant: result.merchant || 'Unknown Merchant',
        cardId: card.id
      });
      setSmsText('');
      setShowSmsModal(false);
    } catch (error) {
      console.error("Failed to parse SMS:", error);
      alert("Could not parse SMS automatically. Please enter manually.");
    } finally {
      setIsParsing(false);
    }
  };

  const parsePdfText = async () => {
    if (!smsText.trim()) return;
    setIsParsing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Extract multiple transactions from this text (could be from a PDF or CSV export). 
        Text: "${smsText}"
        JSON format: { 
          "transactions": [
            {
              "amount": number, 
              "type": "expense" | "income", 
              "merchant": string, 
              "category": string,
              "date": "ISO string if found, else current"
            }
          ]
        }
        Categories: Dining, Tech, Utilities, Entertainment, Transport, Health, Shopping, Travel, Fun, Study.
        Return ONLY the JSON.`,
      });

      const result = JSON.parse(response.text.replace(/```json|```/g, '').trim());
      
      if (result.transactions && Array.isArray(result.transactions)) {
        result.transactions.forEach((t: any) => {
          handleAddTransaction({
            amount: t.amount,
            type: t.type || 'expense',
            category: t.category || 'Shopping',
            merchant: t.merchant || 'Unknown Merchant',
            date: t.date || new Date().toISOString()
          });
        });
        setSmsText('');
        setShowImportModal(false);
        alert(`Successfully extracted ${result.transactions.length} transactions!`);
      }
    } catch (error) {
      console.error("Failed to parse text:", error);
      alert("Could not extract transactions. Please check the text format.");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface font-sans selection:bg-primary selection:text-surface overflow-x-hidden">
      <AnimatePresence>
        {isLocked && <AppLock savedPin={appPin} onUnlock={() => setIsLocked(false)} />}
      </AnimatePresence>

      <TopAppBar 
        profile={profile}
        onProfileClick={() => setActiveTab('profile')}
        onNotificationsClick={() => setShowNotifications(true)}
        unreadCount={unreadNotifications}
      />

      <main className="pt-24 px-4 pb-40 max-w-2xl mx-auto">
        {activeTab === 'home' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={SMOOTH_TRANSITION}
          >
            <section className="mb-10 px-2">
              <span className="text-on-surface-variant font-label text-sm uppercase tracking-widest">Total Liquidity</span>
              <h1 className="font-headline text-6xl mt-2 tracking-tighter">
                {formatCurrency(totalBalance, profile.currency)}
              </h1>
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-2 text-secondary">
                  <ArrowDownLeft size={16} />
                  <span className="text-sm font-bold">+{formatCurrency(totalIncome, profile.currency)}</span>
                </div>
                <div className="flex items-center gap-2 text-error">
                  <ArrowUpRight size={16} />
                  <span className="text-sm font-bold">-{formatCurrency(totalExpense, profile.currency)}</span>
                </div>
              </div>
            </section>

            {cards.length > 0 ? (
              <CardStack cards={cards} activeIndex={activeCardIndex} onSwipe={handleSwipe} currency={profile.currency} />
            ) : (
              <div 
                onClick={() => setShowAddCardModal(true)}
                className="h-52 mb-12 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-3 text-on-surface-variant hover:text-white hover:border-white/20 transition-all cursor-pointer"
              >
                <Plus size={32} />
                <p className="font-headline text-lg font-bold">Add your first card</p>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-10">
              <button 
                onClick={() => setShowQRScanner(true)}
                className="glass-header rounded-xl py-4 flex flex-col items-center justify-center gap-2 hover:bg-surface-container transition-colors border-primary/20 border"
              >
                <Scan className="text-primary" size={20} />
                <span className="font-label text-[10px] font-bold text-on-surface uppercase tracking-wider">Scan & Pay</span>
              </button>
              <button 
                onClick={() => setShowSmsModal(true)}
                className="glass-header rounded-xl py-4 flex flex-col items-center justify-center gap-2 hover:bg-surface-container transition-colors"
              >
                <Upload className="text-secondary" size={20} />
                <span className="font-label text-[10px] font-bold text-on-surface uppercase tracking-wider">Sync SMS</span>
              </button>
              <button 
                onClick={() => setShowAddModal(true)}
                className="glass-header rounded-xl py-4 flex flex-col items-center justify-center gap-2 hover:bg-surface-container transition-colors"
              >
                <PlusCircle className="text-tertiary" size={20} />
                <span className="font-label text-[10px] font-bold text-on-surface uppercase tracking-wider">Add Tx</span>
              </button>
              <button 
                onClick={() => setShowSplitModal(true)}
                className="glass-header rounded-xl py-4 flex flex-col items-center justify-center gap-2 hover:bg-surface-container transition-colors"
              >
                <Users className="text-primary" size={20} />
                <span className="font-label text-[10px] font-bold text-on-surface uppercase tracking-wider">Split Bill</span>
              </button>
              <button 
                onClick={() => setShowRequestModal(true)}
                className="glass-header rounded-xl py-4 flex flex-col items-center justify-center gap-2 hover:bg-surface-container transition-colors"
              >
                <HandCoins className="text-error" size={20} />
                <span className="font-label text-[10px] font-bold text-on-surface uppercase tracking-wider">Request</span>
              </button>
            </div>

            <section className="mb-10">
              <div className="flex justify-between items-end mb-4 px-2">
                <h2 className="font-headline text-2xl font-bold">Savings Goals</h2>
                <span className="text-primary text-sm font-bold cursor-pointer" onClick={() => setActiveTab('budget')}>View All</span>
              </div>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                {savingsGoals.map(goal => (
                  <div key={goal.id} className="min-w-[240px] bg-surface-container-low p-6 rounded-[32px] border border-white/5 shadow-xl">
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Target size={20} />
                      </div>
                      <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{Math.round(((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100)}%</span>
                    </div>
                    <h3 className="font-headline font-bold mb-1">{goal.name}</h3>
                    <p className="text-xl font-bold mb-4">₹{(goal.currentAmount || 0).toLocaleString()} <span className="text-xs text-on-surface-variant font-normal">/ ₹{(goal.targetAmount || 0).toLocaleString()}</span></p>
                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${((goal.currentAmount || 0) / (goal.targetAmount || 1)) * 100}%` }}
                        transition={SMOOTH_TRANSITION}
                        className="h-full bg-primary"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mb-10">
              <div className="flex justify-between items-end mb-4 px-2">
                <h2 className="font-headline text-2xl font-bold">Quick Transfer</h2>
                <span className="text-primary text-sm font-bold cursor-pointer">View All</span>
              </div>
              <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer active:scale-90 transition-transform">
                    <div className="w-16 h-16 rounded-full border-2 border-primary/20 p-1 bg-surface-container-low">
                      <img 
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Contact${i}`} 
                        alt="Contact" 
                        className="w-full h-full rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <span className="text-[10px] font-bold text-on-surface-variant">Contact {i}</span>
                  </div>
                ))}
                <button className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center text-on-surface-variant flex-shrink-0">
                  <Plus size={24} />
                </button>
              </div>
            </section>

            <section>
              <div className="flex justify-between items-end mb-4 px-2">
                <h2 className="font-headline text-2xl font-bold">Ledger</h2>
                <span className="text-primary text-sm font-bold cursor-pointer" onClick={() => setActiveTab('transactions')}>See All</span>
              </div>
              <div className="space-y-2">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map(tx => (
                    <TransactionItem 
                      key={tx.id} 
                      transaction={tx} 
                      onDelete={handleDeleteTransaction}
                      currency={profile.currency}
                    />
                  ))
                ) : (
                  <div className="text-center py-10 text-on-surface-variant text-sm">No transactions for this card</div>
                )}
              </div>
              {activeCard && (
                <button 
                  onClick={() => handleDeleteCard(activeCard.id)}
                  className="w-full mt-8 py-4 text-error/60 hover:text-error text-[10px] font-bold uppercase tracking-widest transition-colors"
                >
                  Delete Current Card
                </button>
              )}
            </section>
          </motion.div>
        )}

        {activeTab === 'budget' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={SMOOTH_TRANSITION}
            className="pt-4"
          >
            <AnalyticsView transactions={transactions} profile={profile} budgets={budgets} />
          </motion.div>
        )}

        {activeTab === 'upi' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={SMOOTH_TRANSITION}
            className="pt-4"
          >
            <UPIManagement 
              accounts={upiAccounts} 
              transactions={transactions}
              onAdd={() => setShowAddUPIModal(true)} 
              onDelete={(id) => setUpiAccounts(prev => prev.filter(a => a.id !== id))}
              onSetDefault={(id) => setUpiAccounts(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))}
              currency={profile.currency}
            />
          </motion.div>
        )}

        {activeTab === 'categories' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={SMOOTH_TRANSITION}
            className="pt-4"
          >
            <div className="flex items-center gap-4 mb-8">
              {selectedCategory && (
                <button onClick={() => setSelectedCategory(null)} className="text-primary">
                  <ChevronLeft size={24} />
                </button>
              )}
              <h1 className="font-headline text-4xl font-bold">
                {selectedCategory ? selectedCategory : 'Categories'}
              </h1>
            </div>

            {!selectedCategory ? (
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(CATEGORY_ICONS).map(catName => {
                  const data = categoryData[catName] || { amount: 0, count: 0 };
                  const Icon = CATEGORY_ICONS[catName];
                  const colors = ['primary', 'secondary', 'tertiary', 'error'];
                  const color = colors[Object.keys(CATEGORY_ICONS).indexOf(catName) % colors.length];
                  
                  return (
                    <SwipeableItem
                      key={catName}
                      onDelete={() => {
                        if(confirm(`Delete category ${catName} and all its transactions?`)) {
                          setTransactions(prev => prev.filter(t => t.category !== catName));
                          setBudgets(prev => prev.filter(b => b.category !== catName));
                        }
                      }}
                    >
                      <div 
                        onClick={() => setSelectedCategory(catName)}
                        className="bg-surface-container-low rounded-xl p-5 flex flex-col justify-between aspect-square border border-white/5 relative overflow-hidden group cursor-pointer active:scale-95 transition-transform"
                      >
                        <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl opacity-10", `bg-${color}`)}></div>
                        <div className="flex justify-between items-start z-10">
                          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", `bg-${color}/10 text-${color}`)}>
                            <Icon size={20} />
                          </div>
                          <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{catName}</span>
                        </div>
                        <div className="z-10">
                          <p className="text-2xl font-headline font-bold">{formatCurrency(data.amount, profile.currency)}</p>
                          <p className="text-[10px] text-on-surface-variant font-medium">{data.count} Transactions</p>
                        </div>
                      </div>
                    </SwipeableItem>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.filter(t => t.category === selectedCategory).length > 0 ? (
                  transactions.filter(t => t.category === selectedCategory).map(tx => (
                    <TransactionItem 
                      key={tx.id} 
                      transaction={tx} 
                      onDelete={handleDeleteTransaction}
                      currency={profile.currency}
                    />
                  ))
                ) : (
                  <div className="text-center py-20 text-on-surface-variant">No transactions in this category</div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'profile' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={SMOOTH_TRANSITION}
            className="pt-4"
          >
            <h1 className="font-headline text-4xl font-bold mb-8">Settings</h1>
            
            <div className="flex flex-col items-center mb-10">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 p-1">
                  <img src={profile.avatar} className="w-full h-full rounded-full object-cover" alt="Profile" referrerPolicy="no-referrer" />
                </div>
                <button 
                  onClick={() => setProfile({...profile, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}&backgroundColor=ba9eff`})}
                  className="absolute bottom-0 right-0 bg-primary text-surface p-2 rounded-full shadow-lg active:scale-90 transition-transform"
                >
                  <Sparkles size={16} />
                </button>
              </div>
              <h2 className="mt-4 font-headline text-2xl font-bold">{profile.name}</h2>
              <p className="text-on-surface-variant text-sm">{profile.email}</p>
            </div>

            <div className="space-y-4">
              <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant">Security</h3>
                  <button 
                    onClick={() => setShowPinSettings(true)}
                    className="flex items-center gap-2 bg-surface-container p-2 px-4 rounded-full border border-white/5 text-xs font-bold"
                  >
                    <Lock size={14} className="text-primary" />
                    CHANGE PIN
                  </button>
                </div>
                
                <div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-2 block">Display Name</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={profile.name}
                      onChange={e => setProfile({...profile, name: e.target.value})}
                      className="flex-1 bg-surface-container rounded-xl p-3 text-sm focus:outline-none border border-white/5"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-2 block">Email Address</label>
                  <input 
                    type="email" 
                    value={profile.email}
                    onChange={e => setProfile({...profile, email: e.target.value})}
                    className="w-full bg-surface-container rounded-xl p-3 text-sm focus:outline-none border border-white/5"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-2 block">Currency</label>
                  <select 
                    value={profile.currency}
                    onChange={e => setProfile({...profile, currency: e.target.value})}
                    className="w-full bg-surface-container rounded-xl p-3 text-sm focus:outline-none border border-white/5 appearance-none"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>

              <div className="bg-surface-container-low p-6 rounded-2xl border border-white/5 space-y-4">
                <h3 className="font-headline font-bold text-sm uppercase tracking-widest text-on-surface-variant">Core Features</h3>
                
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-3">
                    <Scan size={18} className="text-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">Auto SMS Tracking</span>
                      <span className="text-[10px] text-on-surface-variant">Automatically log spending from bank SMS</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setSmsSyncEnabled(!smsSyncEnabled);
                    }}
                    className={cn(
                      "w-12 h-6 rounded-full transition-colors relative",
                      smsSyncEnabled ? "bg-primary" : "bg-surface-container-highest"
                    )}
                  >
                    <motion.div 
                      animate={{ x: smsSyncEnabled ? 24 : 4 }}
                      transition={QUICK_TRANSITION}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                    />
                  </button>
                </div>

                <button className="w-full flex justify-between items-center py-2 text-sm hover:text-primary transition-colors">
                  <div className="flex items-center gap-3">
                    <Settings size={18} />
                    <span>Preferences</span>
                  </div>
                  <ChevronRight size={16} />
                </button>
                <button className="w-full flex justify-between items-center py-2 text-sm hover:text-primary transition-colors">
                  <div className="flex items-center gap-3">
                    <CreditCard size={18} />
                    <span>Payment Methods</span>
                  </div>
                  <ChevronRight size={16} />
                </button>
                <button 
                  onClick={() => {
                    if(confirm("Are you sure you want to log out? All local data will be kept.")) {
                      setIsLocked(true);
                    }
                  }}
                  className="w-full flex justify-between items-center py-2 text-sm text-error hover:text-error/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <LogOut size={18} />
                    <span>Logout</span>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'transactions' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={SMOOTH_TRANSITION}
            className="pt-4"
          >
            <div className="flex justify-between items-center mb-8">
              <h1 className="font-headline text-4xl font-bold">Transactions</h1>
              <div className="flex gap-2">
                <label className="bg-surface-container p-2 rounded-xl border border-white/5 text-primary cursor-pointer active:scale-90 transition-transform">
                  <Upload size={20} />
                  <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
                </label>
                <button 
                  onClick={() => {
                    if(confirm("Clear all transaction history?")) {
                      setTransactions([]);
                      setCards(prev => prev.map(c => ({ ...c, balance: 0 })));
                    }
                  }}
                  className="bg-surface-container p-2 rounded-xl border border-white/5 text-error active:scale-90 transition-transform"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="relative">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                <input 
                  type="text" 
                  placeholder="Search transactions..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-container rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none border border-white/5"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {['all', 'income', 'expense'].map(type => (
                  <button 
                    key={type}
                    onClick={() => setFilterType(type as any)}
                    className={cn(
                      "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap",
                      filterType === type ? "bg-primary text-surface" : "bg-surface-container text-on-surface-variant border border-white/5"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-[10px] font-headline font-bold text-outline uppercase tracking-[0.2em] px-2 mb-2">History</h3>
                <div className="space-y-1">
                  {transactions
                    .filter(t => {
                      const matchesSearch = t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                          t.category.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesType = filterType === 'all' || t.type === filterType;
                      return matchesSearch && matchesType;
                    })
                    .length > 0 ? (
                    transactions
                      .filter(t => {
                        const matchesSearch = t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                            t.category.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesType = filterType === 'all' || t.type === filterType;
                        return matchesSearch && matchesType;
                      })
                      .map(tx => (
                        <TransactionItem 
                          key={tx.id} 
                          transaction={tx} 
                          onDelete={handleDeleteTransaction}
                          currency={profile.currency}
                        />
                      ))
                  ) : (
                    <div className="text-center py-20 text-on-surface-variant">No transactions found</div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>

      <BottomNavBar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Modals using BottomSheet */}
      <BottomSheet 
        isOpen={showBudgetModal} 
        onClose={() => setShowBudgetModal(false)}
        title={`Edit ${editingBudget?.category} Budget`}
      >
        {editingBudget && (
          <div className="space-y-6">
            <div>
              <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 block">Category Name</label>
              <input 
                type="text" 
                value={editingBudget.category}
                onChange={e => setEditingBudget({...editingBudget, category: e.target.value})}
                className="w-full bg-surface-container rounded-xl p-4 text-lg font-bold focus:outline-none border border-white/5" 
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 block">Monthly Limit</label>
              <input 
                type="number" 
                value={editingBudget.limit}
                onChange={e => setEditingBudget({...editingBudget, limit: parseFloat(e.target.value)})}
                className="w-full bg-surface-container rounded-xl p-4 text-2xl font-headline font-bold focus:outline-none border border-white/5" 
              />
            </div>
            <button 
              onClick={() => {
                setBudgets(budgets.map(b => b.category === (editingBudget as any)._originalCategory ? editingBudget : b));
                setShowBudgetModal(false);
              }}
              className="w-full bg-primary text-surface font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-transform"
            >
              Update Budget
            </button>
          </div>
        )}
      </BottomSheet>

      <BottomSheet 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)}
        title="Notifications"
      >
        <div className="space-y-3">
          {notifications.length > 0 ? (
            notifications.map(notif => (
              <div 
                key={notif.id} 
                className={cn(
                  "p-4 rounded-2xl border border-white/5 transition-all",
                  notif.read ? "bg-surface-container-low opacity-60" : "bg-surface-container border-l-4 border-l-primary"
                )}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-bold text-sm">{notif.title}</h4>
                  <span className="text-[10px] text-outline">{new Date(notif.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-xs text-on-surface-variant">{notif.message}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <Bell size={48} className="mx-auto text-on-surface-variant/20 mb-4" />
              <p className="text-on-surface-variant text-sm">No notifications yet</p>
            </div>
          )}
        </div>
      </BottomSheet>

      <BottomSheet 
        isOpen={showSmsModal} 
        onClose={() => setShowSmsModal(false)}
        title="Sync SMS"
      >
        <p className="text-sm text-on-surface-variant mb-4">Paste your bank SMS here to automatically track the transaction.</p>
        <textarea 
          value={smsText}
          onChange={(e) => setSmsText(e.target.value)}
          placeholder="e.g. Debited for Rs. 500 at Starbucks..."
          className="w-full h-32 bg-surface-container rounded-2xl p-4 text-sm focus:outline-none border border-white/5 resize-none mb-6"
        />
        <button 
          onClick={parseSms}
          disabled={isParsing || !smsText.trim()}
          className="w-full bg-primary text-surface font-bold py-4 rounded-2xl flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98] transition-transform"
        >
          {isParsing ? "Parsing..." : "Process SMS"}
        </button>
      </BottomSheet>

      <BottomSheet 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        title="New Transaction"
      >
        <div className="space-y-4">
          <button 
            onClick={() => {
              setShowAddModal(false);
              setShowImportModal(true);
            }}
            className="w-full bg-primary/10 text-primary p-4 rounded-2xl border border-primary/20 flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            <Sparkles size={20} />
            <span className="font-bold">Magic Import from PDF/Text</span>
          </button>
          
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-white/5"></div>
            <span className="flex-shrink mx-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">or enter manually</span>
            <div className="flex-grow border-t border-white/5"></div>
          </div>
          
          <div>
            <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 block">Amount</label>
            <input 
              type="number" 
              value={newTx.amount}
              onChange={e => setNewTx({...newTx, amount: e.target.value})}
              placeholder="0.00" 
              className="w-full bg-surface-container rounded-xl p-4 text-2xl font-headline font-bold focus:outline-none border border-white/5" 
            />
          </div>
          <div>
            <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 block">Merchant</label>
            <input 
              type="text" 
              value={newTx.merchant}
              onChange={e => setNewTx({...newTx, merchant: e.target.value})}
              placeholder="Where did you spend?" 
              className="w-full bg-surface-container rounded-xl p-4 text-sm focus:outline-none border border-white/5" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 block">Card</label>
              <select 
                value={newTx.cardId || activeCard?.id}
                onChange={e => setNewTx({...newTx, cardId: e.target.value})}
                className="w-full bg-surface-container rounded-xl p-4 text-sm focus:outline-none border border-white/5 appearance-none"
              >
                {cards.map(c => (
                  <option key={c.id} value={c.id}>{c.bank} ({c.last4})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 block">Type</label>
              <select 
                value={newTx.type}
                onChange={e => setNewTx({...newTx, type: e.target.value as any})}
                className="w-full bg-surface-container rounded-xl p-4 text-sm focus:outline-none border border-white/5 appearance-none"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>
          <button 
            onClick={() => handleAddTransaction({
              amount: parseFloat(newTx.amount),
              type: newTx.type,
              category: newTx.category,
              merchant: newTx.merchant,
            })}
            disabled={!newTx.amount || !newTx.merchant}
            className="w-full mt-4 bg-primary text-surface font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            Save Transaction
          </button>
        </div>
      </BottomSheet>

      {/* PIN Settings Modal */}
      <BottomSheet 
        isOpen={showImportModal} 
        onClose={() => setShowImportModal(false)}
        title="Magic Import"
      >
        <div className="space-y-6">
          <p className="text-sm text-on-surface-variant">Paste text from your PDF statement or CSV export. Our AI will extract all transactions automatically.</p>
          <textarea 
            value={smsText}
            onChange={e => setSmsText(e.target.value)}
            placeholder="Paste text here..."
            className="w-full h-48 bg-surface-container rounded-2xl p-4 text-sm focus:outline-none border border-white/5 resize-none font-mono"
          />
          <button 
            onClick={parsePdfText}
            disabled={isParsing || !smsText.trim()}
            className="w-full bg-primary text-surface font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {isParsing ? "Extracting..." : "Extract Transactions"}
          </button>
        </div>
      </BottomSheet>

      <BottomSheet 
        isOpen={showPinSettings} 
        onClose={() => setShowPinSettings(false)}
        title="Change Security PIN"
      >
        <div className="space-y-6">
          <p className="text-sm text-on-surface-variant">Set a new 4-digit PIN to secure your financial data.</p>
          <div className="flex justify-center gap-4">
            {[0, 1, 2, 3].map(i => (
              <div key={i} className={cn("w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center text-xl font-bold border border-white/5", newPin.length > i && "border-primary text-primary")}>
                {newPin[i] ? '•' : ''}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'OK'].map(val => (
              <button
                key={val}
                onClick={() => {
                  if (val === 'C') setNewPin('');
                  else if (val === 'OK') {
                    if (newPin.length === 4) {
                      setAppPin(newPin);
                      setNewPin('');
                      setShowPinSettings(false);
                      alert("PIN updated successfully!");
                    }
                  } else if (newPin.length < 4) {
                    setNewPin(newPin + val);
                  }
                }}
                className="h-14 rounded-2xl bg-surface-container hover:bg-surface-container-high font-bold active:scale-95 transition-transform"
              >
                {val}
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>

      <BottomSheet 
        isOpen={showSplitModal} 
        onClose={() => setShowSplitModal(false)}
        title="Split a Bill"
      >
        <SplitBillModal onClose={() => setShowSplitModal(false)} />
      </BottomSheet>

      <BottomSheet 
        isOpen={showRequestModal} 
        onClose={() => setShowRequestModal(false)}
        title="Request Money"
      >
        <RequestMoneyModal onClose={() => setShowRequestModal(false)} />
      </BottomSheet>

      {/* Add Card Modal */}
      <AnimatePresence>
        {showAddCardModal && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={QUICK_TRANSITION}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowAddCardModal(false)}
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={SMOOTH_TRANSITION}
              className="relative w-full max-w-md bg-surface-container-high rounded-t-3xl p-8 pb-12 shadow-2xl border-t border-white/10"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline text-2xl font-bold">Add New Card</h3>
                <button onClick={() => setShowAddCardModal(false)} className="text-on-surface-variant"><X size={24} /></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 block">Bank Name</label>
                  <input 
                    type="text" 
                    value={newCard.bank}
                    onChange={e => setNewCard({...newCard, bank: e.target.value})}
                    placeholder="e.g. SBI, HDFC, ICICI" 
                    className="w-full bg-surface-container rounded-xl p-4 text-sm focus:outline-none border border-white/5" 
                  />
                  {newCard.bank && BANK_LOGOS[newCard.bank.toLowerCase().replace(/\s/g, '')] && (
                    <div className="mt-2 flex items-center gap-2 text-[10px] text-primary">
                      <Sparkles size={12} /> Brand logo detected!
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 block">Card Name (Optional)</label>
                  <input 
                    type="text" 
                    value={newCard.name}
                    onChange={e => setNewCard({...newCard, name: e.target.value})}
                    placeholder="e.g. Platinum Rewards" 
                    className="w-full bg-surface-container rounded-xl p-4 text-sm focus:outline-none border border-white/5" 
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 block">Last 4 Digits</label>
                  <input 
                    type="text" 
                    maxLength={4}
                    value={newCard.last4}
                    onChange={e => setNewCard({...newCard, last4: e.target.value.replace(/\D/g, '')})}
                    placeholder="1234" 
                    className="w-full bg-surface-container rounded-xl p-4 text-sm tracking-[0.5em] focus:outline-none border border-white/5" 
                  />
                </div>
              </div>

              <button 
                onClick={handleAddCard}
                disabled={!newCard.bank || newCard.last4.length !== 4}
                className="w-full mt-8 bg-primary text-[#39008c] font-bold py-4 rounded-xl disabled:opacity-50"
              >
                Add Card
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* UPI Modals */}
      {showQRScanner && (
        <QRScanner 
          onScan={handleQRScan} 
          onClose={() => setShowQRScanner(false)} 
        />
      )}

      <BottomSheet 
        isOpen={showUPIPaymentModal} 
        onClose={() => {
          setShowUPIPaymentModal(false);
          setScannedUPI(null);
        }}
        title="UPI Payment"
      >
        {scannedUPI && (
          <UPIPaymentModal 
            upiData={scannedUPI} 
            accounts={upiAccounts} 
            onContinue={handleUPIContinue} 
            onClose={() => setShowUPIPaymentModal(false)}
            currency={profile.currency}
          />
        )}
      </BottomSheet>

      {/* UPI App Chooser Modal */}
      <AnimatePresence>
        {showUPIAppChooser && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowUPIAppChooser(false)}
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={SMOOTH_TRANSITION}
              className="relative w-full max-w-md bg-surface-container-high rounded-t-[32px] p-8 pb-12 shadow-2xl border-t border-white/10"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6" />
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-headline text-2xl font-bold">Choose UPI App</h3>
                <button onClick={() => setShowUPIAppChooser(false)} className="text-on-surface-variant"><X size={24} /></button>
              </div>
              
              <div className="grid grid-cols-3 gap-6">
                {UPI_APPS.map(app => (
                  <button 
                    key={app.id}
                    onClick={() => executeUPIPayment(app.package)}
                    className="flex flex-col items-center gap-3 active:scale-90 transition-transform"
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl p-3 flex items-center justify-center shadow-lg border border-white/5">
                      <img src={app.logo} alt={app.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <span className="text-[10px] font-bold text-center leading-tight">{app.name}</span>
                  </button>
                ))}
                <button 
                  onClick={() => executeUPIPayment()}
                  className="flex flex-col items-center gap-3 active:scale-90 transition-transform"
                >
                  <div className="w-16 h-16 bg-surface-container rounded-2xl flex items-center justify-center shadow-lg border border-white/5">
                    <LayoutGrid size={24} className="text-primary" />
                  </div>
                  <span className="text-[10px] font-bold text-center leading-tight">Other Apps</span>
                </button>
              </div>

              <div className="mt-10 p-4 bg-primary/10 rounded-2xl border border-primary/20">
                <p className="text-[10px] text-primary font-bold text-center leading-relaxed">
                  Amount: ₹{parseFloat(paymentAmount || '0').toLocaleString()} will be automatically filled in the selected app.
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <BottomSheet 
        isOpen={showAddUPIModal} 
        onClose={() => setShowAddUPIModal(false)}
        title="Link Bank Account"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {AVAILABLE_BANKS.map(bank => (
              <button 
                key={bank.id}
                onClick={() => {
                  const upiId = `${profile.name.toLowerCase().replace(/\s/g, '')}@${bank.id}`;
                  addUPIAccount(bank, upiId);
                }}
                className="bg-surface-container p-4 rounded-2xl border border-white/5 flex flex-col items-center gap-3 hover:bg-surface-container-high transition-all active:scale-95"
              >
                <div className="w-12 h-12 bg-white rounded-xl p-2 flex items-center justify-center overflow-hidden">
                  <img src={bank.logo} alt={bank.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <span className="text-[10px] font-bold text-center leading-tight">{bank.name}</span>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-on-surface-variant text-center px-4">
            By linking your account, you agree to our Terms of Service and Privacy Policy. Obsidian Ledger uses secure encryption to protect your data.
          </p>
        </div>
      </BottomSheet>
    </div>
  );
}

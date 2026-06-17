import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  Plus, 
  MoreVertical, 
  Coffee, 
  Bus, 
  ShoppingCart, 
  Globe, 
  FileText, 
  GraduationCap, 
  Compass, 
  TrendingUp, 
  Briefcase, 
  Gift, 
  PlusCircle, 
  Trash2, 
  Check, 
  X,
  ShieldAlert,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { Transaction, UserProfile, Budget } from '../types';
import { cn } from '../lib/utils';
import { QUICK_TRANSITION, SMOOTH_TRANSITION } from './constants';

interface CategoriesViewProps {
  transactions: Transaction[];
  profile: UserProfile;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
  onBack?: () => void;
  onTabChange?: (tab: string) => void;
}

// Icon mappings for dynamic category assignment
export const CATEGORY_ICON_PRESESTS: Record<string, any> = {
  Food: Coffee,
  Dining: Coffee,
  Transport: Bus,
  Shopping: ShoppingCart,
  Tech: ShoppingCart,
  Entertainment: Globe,
  Bills: FileText,
  Utilities: FileText,
  Education: GraduationCap,
  Study: GraduationCap,
  Travel: Compass,
  Salary: Briefcase,
  Investment: TrendingUp,
  Cashback: Gift,
  Others: PlusCircle,
};

// Color mapping for preset categories
export const CATEGORY_COLORS: Record<string, string> = {
  Food: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 glow-emerald',
  Dining: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 glow-emerald',
  Transport: 'text-amber-400 bg-amber-500/10 border-amber-500/20 glow-amber',
  Shopping: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 glow-cyan',
  Tech: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20 glow-cyan',
  Entertainment: 'text-purple-400 bg-purple-500/10 border-purple-500/20 glow-purple',
  Bills: 'text-pink-400 bg-pink-500/10 border-pink-500/20 glow-pink',
  Utilities: 'text-pink-400 bg-pink-500/10 border-pink-500/20 glow-pink',
  Education: 'text-orange-400 bg-orange-500/10 border-orange-500/20 glow-orange',
  Study: 'text-orange-400 bg-orange-500/10 border-orange-500/20 glow-orange',
  Travel: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 glow-indigo',
  Salary: 'text-green-400 bg-green-500/10 border-green-500/20 glow-green',
  Investment: 'text-blue-400 bg-blue-500/10 border-blue-500/20 glow-blue',
  Cashback: 'text-violet-400 bg-violet-500/10 border-violet-500/20 glow-violet',
  Others: 'text-gray-400 bg-gray-500/10 border-gray-500/20 glow-gray',
};

// Glow shadow utility
const getCardColorClass = (cat: string) => {
  return CATEGORY_COLORS[cat] || 'text-primary bg-primary/10 border-primary/20 glow-primary';
};

export const CategoriesView: React.FC<CategoriesViewProps> = ({ 
  transactions, 
  profile, 
  setTransactions,
  onBack,
  onTabChange
}) => {
  const [toggleType, setToggleType] = useState<'income' | 'expense'>('expense');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategoryDetail, setSelectedCategoryDetail] = useState<string | null>(null);
  
  // Custom toast state
  const [toast, setToast] = useState<{ show: boolean; message: string; sub: string } | null>(null);
  
  // Custom category presets
  const [customCategories, setCustomCategories] = useState<{ name: string; type: 'income' | 'expense'; icon: string }[]>([
    { name: 'Food', type: 'expense', icon: 'Food' },
    { name: 'Transport', type: 'expense', icon: 'Transport' },
    { name: 'Shopping', type: 'expense', icon: 'Shopping' },
    { name: 'Entertainment', type: 'expense', icon: 'Entertainment' },
    { name: 'Bills', type: 'expense', icon: 'Bills' },
    { name: 'Education', type: 'expense', icon: 'Education' },
    { name: 'Travel', type: 'expense', icon: 'Travel' },
    { name: 'Salary', type: 'income', icon: 'Salary' },
    { name: 'Investment', type: 'income', icon: 'Investment' },
    { name: 'Cashback', type: 'income', icon: 'Cashback' },
    { name: 'Others', type: 'income', icon: 'Others' },
  ]);

  // Form states
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<'income' | 'expense'>('expense');
  const [newCatIcon, setNewCatIcon] = useState('Others');

  // Trigger toast helper
  const triggerToast = (message: string, sub: string) => {
    setToast({ show: true, message, sub });
    setTimeout(() => {
      setToast(prev => prev ? { ...prev, show: false } : null);
    }, 4000);
  };

  // Add category handler
  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const exists = customCategories.some(c => c.name.toLowerCase() === newCatName.trim().toLowerCase());
    if (exists) {
      alert("Category name already exists!");
      return;
    }

    setCustomCategories(prev => [
      ...prev,
      { name: newCatName.trim(), type: newCatType, icon: newCatIcon }
    ]);
    
    setShowAddModal(false);
    triggerToast("Successfully", "Category data has been successfully added");
    
    // Clear form
    setNewCatName('');
  };

  // Delete category handler
  const handleDeleteCategory = (catName: string) => {
    if (window.confirm(`Are you sure you want to delete "${catName}"? This will untag all associated transactions.`)) {
      // Remove custom category card
      setCustomCategories(prev => prev.filter(c => c.name !== catName));
      
      // Update transactions to tag to "Others"
      setTransactions(prev => prev.map(t => {
        if (t.category === catName) {
          return { ...t, category: 'Others' };
        }
        return t;
      }));

      setSelectedCategoryDetail(null);
      triggerToast("Deleted", `Category "${catName}" has been successfully removed`);
    }
  };

  // Memoize transaction counts per category
  const categoryStats = useMemo(() => {
    const stats: Record<string, { count: number; total: number }> = {};
    transactions.forEach(t => {
      const cat = t.category;
      if (!stats[cat]) stats[cat] = { count: 0, total: 0 };
      stats[cat].count += 1;
      stats[cat].total += t.amount;
    });
    return stats;
  }, [transactions]);

  // Filter shown categories based on toggle tab
  const filteredCategories = useMemo(() => {
    return customCategories.filter(c => c.type === toggleType);
  }, [customCategories, toggleType]);

  // Context menu on Card
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  return (
    <div className="pt-2 animate-none pb-24 relative select-none">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={onBack || (() => onTabChange?.('home'))}
          className="w-10 h-10 rounded-xl bg-surface-container-high border border-white/5 shadow-md flex items-center justify-center text-on-surface-variant hover:text-white transition-colors active:scale-95"
          id="cat-back-btn"
        >
          <ChevronLeft size={20} />
        </button>
        
        <h1 className="font-headline text-lg font-bold text-white tracking-wide">
          {selectedCategoryDetail ? selectedCategoryDetail : 'Categories'}
        </h1>

        <button 
          onClick={() => {
            setNewCatType(toggleType);
            setShowAddModal(true);
          }}
          className="w-10 h-10 rounded-xl bg-surface-container-high border border-white/5 shadow-md flex items-center justify-center text-primary hover:text-white transition-colors active:scale-95"
          id="cat-add-btn"
        >
          <Plus size={20} />
        </button>
      </div>

      {!selectedCategoryDetail ? (
        <>
          {/* Custom Multi-Segment Segmented Control Toggle */}
          <div className="flex bg-surface-container-high/80 rounded-2xl p-1.5 border border-white/5 shadow-inner mb-6 relative">
            <button 
              onClick={() => setToggleType('income')}
              className={cn(
                "flex-1 py-3 text-sm font-semibold tracking-wide rounded-xl transition-all duration-300 relative z-10",
                toggleType === 'income' ? "text-black text-shadow-sm font-bold bg-white" : "text-on-surface-variant hover:text-white"
              )}
            >
              Income
            </button>
            <button 
              onClick={() => setToggleType('expense')}
              className={cn(
                "flex-1 py-3 text-sm font-semibold tracking-wide rounded-xl transition-all duration-300 relative z-10",
                toggleType === 'expense' ? "text-black text-shadow-sm font-bold bg-white" : "text-on-surface-variant hover:text-white"
              )}
            >
              Expenses
            </button>
          </div>

          {/* Grid Layout of Categories */}
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredCategories.map((cat, i) => {
                const IconComponent = CATEGORY_ICON_PRESESTS[cat.icon] || PlusCircle;
                const stats = categoryStats[cat.name] || { count: 0, total: 0 };
                const colorClasses = getCardColorClass(cat.icon);

                return (
                  <motion.div
                    key={cat.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ ...QUICK_TRANSITION, delay: i * 0.03 }}
                    layout
                    className="relative bg-surface-container-low rounded-2xl p-5 flex flex-col justify-between border border-white/[0.04] hover:border-white/10 transition-all shadow-lg select-all group aspect-[1.12]"
                  >
                    <div className="flex justify-between items-start">
                      {/* Icon with beautiful color styling */}
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", colorClasses)}>
                        <IconComponent size={22} />
                      </div>

                      {/* Three Dots Menu */}
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(activeMenuId === cat.name ? null : cat.name);
                          }}
                          className="text-on-surface-variant hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                        >
                          <MoreVertical size={18} />
                        </button>
                        
                        {/* Inline context menu drop-down */}
                        {activeMenuId === cat.name && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                            <div className="absolute right-0 mt-1 w-28 bg-[#161616] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden py-1">
                              <button 
                                onClick={() => setSelectedCategoryDetail(cat.name)}
                                className="w-full text-left px-4 py-2 text-xs text-white hover:bg-white/5 font-semibold"
                              >
                                Transactions
                              </button>
                              <button 
                                onClick={() => handleDeleteCategory(cat.name)}
                                className="w-full text-left px-4 py-2 text-xs text-error hover:bg-error/5 font-semibold flex items-center gap-1.5"
                                disabled={['Others', 'Salary', 'Food', 'Shopping'].includes(cat.name)}
                              >
                                <Trash2 size={12} />
                                Delete
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="mt-4" onClick={() => setSelectedCategoryDetail(cat.name)}>
                      <h4 className="text-base font-bold text-white tracking-tight">{cat.name}</h4>
                      <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">
                        Used in {stats.count} transactions
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </>
      ) : (
        /* Category Transactions Subview */
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-xs uppercase tracking-widest font-bold text-on-surface-variant">Transaction History</span>
            <span className="text-xs text-primary font-bold">
              Total: {transactions.filter(t => t.category === selectedCategoryDetail).length}
            </span>
          </div>

          <div className="space-y-2">
            {transactions.filter(t => t.category === selectedCategoryDetail).length > 0 ? (
              transactions.filter(t => t.category === selectedCategoryDetail).map(tx => {
                const IconComp = CATEGORY_ICON_PRESESTS[tx.category] || PlusCircle;
                const isExpense = tx.type === 'expense';
                return (
                  <div 
                    key={tx.id}
                    className="bg-surface-container-high/60 rounded-2xl p-4 flex items-center justify-between border border-white/5 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border", getCardColorClass(tx.category))}>
                        <IconComp size={18} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{tx.description || tx.merchant}</h4>
                        <p className="text-[10px] text-on-surface-variant font-mono mt-0.5">{tx.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={cn("text-sm font-bold tracking-tight", isExpense ? "text-error" : "text-green-400")}>
                        {isExpense ? '-' : '+'}{profile.currency === 'INR' ? '₹' : '$'}{tx.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center rounded-2xl border border-dashed border-white/5 text-on-surface-variant text-sm">
                No active logs listed for this category.
              </div>
            )}
          </div>

          <button 
            onClick={() => setSelectedCategoryDetail(null)}
            className="w-full bg-white/5 text-white hover:bg-white/10 border border-white/10 rounded-xl py-3.5 text-xs font-bold transition-all mt-4"
          >
            Return to categories overview
          </button>
        </div>
      )}

      {/* Add Category Modal Custom Slider Applet */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setShowAddModal(false)}
            />
            
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#121212] border border-white/10 rounded-3xl p-6 shadow-2xl z-10 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/10 blur-[50px] pointer-events-none" />

              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline font-bold text-lg text-white">Create Custom Category</h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="p-1 px-1.5 rounded-lg bg-white/5 border border-white/10 text-on-surface-variant hover:text-white"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddCategory} className="space-y-4">
                {/* Name */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant mb-2 block tracking-wider">Category Name</label>
                  <input 
                    type="text"
                    required
                    value={newCatName}
                    onChange={e => setNewCatName(e.target.value)}
                    placeholder="e.g. Subscriptions, Gaming"
                    className="w-full bg-[#1c1c1c] border border-white/5 focus:border-primary/40 rounded-xl p-3.5 text-sm text-white focus:outline-none transition-all"
                  />
                </div>

                {/* Type Selection */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant mb-2 block tracking-wider">Classification Type</label>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => setNewCatType('expense')}
                      className={cn(
                        "flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border",
                        newCatType === 'expense' ? "bg-primary/20 text-primary border-primary/40" : "bg-[#1c1c1c] border-white/5 text-on-surface-variant"
                      )}
                    >
                      Expense Ledger
                    </button>
                    <button 
                      type="button"
                      onClick={() => setNewCatType('income')}
                      className={cn(
                        "flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-xl transition-all border",
                        newCatType === 'income' ? "bg-green-400/10 text-green-400 border-green-400/20" : "bg-[#1c1c1c] border-white/5 text-on-surface-variant"
                      )}
                    >
                      Income Pipeline
                    </button>
                  </div>
                </div>

                {/* Icon selection preset */}
                <div>
                  <label className="text-[10px] font-bold uppercase text-on-surface-variant mb-2 block tracking-wider">Select Theme Icon</label>
                  <div className="grid grid-cols-5 gap-2 bg-[#161616] p-3 rounded-2xl border border-white/5">
                    {Object.keys(CATEGORY_ICON_PRESESTS).map(iconKey => {
                      const IconPres = CATEGORY_ICON_PRESESTS[iconKey];
                      return (
                        <button 
                          key={iconKey}
                          type="button"
                          onClick={() => setNewCatIcon(iconKey)}
                          className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-all",
                            newCatIcon === iconKey ? "bg-primary text-surface scale-110" : "text-on-surface-variant hover:text-white hover:bg-white/5"
                          )}
                        >
                          <IconPres size={18} />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary text-black font-bold uppercase tracking-wider text-xs py-4 rounded-xl mt-4 active:scale-95 transition-transform"
                >
                  Confirm Allocations
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Slide-Up Custom Toast Feedback styled EXACTLY like Image 1 */}
      <AnimatePresence>
        {toast?.show && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            transition={SMOOTH_TRANSITION}
            className="fixed bottom-28 left-4 right-4 z-50 max-w-sm mx-auto"
            id="categories-toast"
          >
            <div className="bg-[#121c16] border border-green-500/30 rounded-2xl p-4 shadow-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                  <Check size={16} />
                </div>
                <div>
                  <p className="text-sm font-extrabold text-white leading-tight">{toast.message}</p>
                  <p className="text-xs text-green-400/80 mt-0.5 font-medium">{toast.sub}</p>
                </div>
              </div>
              
              <button 
                onClick={() => setToast(prev => prev ? { ...prev, show: false } : null)}
                className="text-on-surface-variant hover:text-white p-1 rounded-lg"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

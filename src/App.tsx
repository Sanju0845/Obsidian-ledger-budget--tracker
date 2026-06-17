import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { 
  Bell, 
  X, 
  Smartphone, 
  CreditCard, 
  Plus, 
  Settings, 
  Trash2, 
  Sparkles, 
  Wallet,
  Check, 
  PlusCircle, 
  Smartphone as PhoneIcon,
  CreditCard as CreditCardIcon
} from 'lucide-react';
import { cn } from './lib/utils';
import { Transaction, Card, Budget, UserProfile, Notification, CARD_COLORS, UPIAccount, Bank, BANK_LOGOS } from './types';
import { GoogleGenAI } from "@google/genai";
import { Capacitor } from '@capacitor/core';

// Modular Page components
import { HomeView } from './components/HomeView';
import { BudgetView } from './components/BudgetView';
import { ScanView } from './components/ScanView';
import { LedgerView } from './components/LedgerView';
import { SettingsView } from './components/SettingsView';
import { CategoriesView } from './components/CategoriesView';
import homePng from './home.jpeg';

// Imported Extracted Sub-Components
import { BottomSheet } from './components/BottomSheet';
import { AppLock } from './components/AppLock';
import { TopAppBar, BottomNavBar } from './components/Navigation';
import { UPIPaymentModal } from './components/UPIPaymentModal';
import { UPIManagement } from './components/UPIManagement';
import { SplitBillModal, RequestMoneyModal } from './components/TransactionModals';
import { StatementImporter } from './components/StatementImporter';

// Core Helpers & Constants
import { formatCurrency } from './components/TransactionItem';
import { 
  UPI_APPS, 
  CATEGORY_ICONS, 
  AVAILABLE_BANKS, 
  SMOOTH_TRANSITION, 
  QUICK_TRANSITION 
} from './components/constants';

// --- Constants & Mock Data ---
const INITIAL_CARDS: Card[] = [];
const INITIAL_TRANSACTIONS: Transaction[] = [];
const INITIAL_UPI_ACCOUNTS: UPIAccount[] = [];

const INITIAL_BUDGETS: Budget[] = [
  { id: '1', category: 'Dining', limit: 0, spent: 0 },
  { id: '2', category: 'Shopping', limit: 0, spent: 0 },
  { id: '3', category: 'Tech', limit: 0, spent: 0 },
  { id: '4', category: 'Utilities', limit: 0, spent: 0 },
  { id: '5', category: 'Transport', limit: 0, spent: 0 },
  { id: '6', category: 'Health', limit: 0, spent: 0 },
  { id: '7', category: 'Entertainment', limit: 0, spent: 0 },
];

const INITIAL_PROFILE: UserProfile = {
  name: 'Sanju',
  email: 'sanju@example.com',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sanju&backgroundColor=ba9eff&mood[]=happy',
  currency: 'INR',
  theme: 'dark'
};

export default function App() {
  const [cards, setCards] = useState<Card[]>(() => {
    const saved = localStorage.getItem('obsidian_cards');
    const parsed = saved ? JSON.parse(saved) : null;
    return (parsed && parsed.length > 0) ? parsed : INITIAL_CARDS;
  });
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('obsidian_transactions');
    const parsed = saved ? JSON.parse(saved) : null;
    return (parsed && parsed.length > 0) ? parsed : INITIAL_TRANSACTIONS;
  });
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('obsidian_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });
  const [upiAccounts, setUpiAccounts] = useState<UPIAccount[]>(() => {
    const saved = localStorage.getItem('obsidian_upi_accounts');
    const parsed = saved ? JSON.parse(saved) : null;
    return (parsed && parsed.length > 0) ? parsed : INITIAL_UPI_ACCOUNTS;
  });

  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showManageCardsModal, setShowManageCardsModal] = useState(false);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showSplitModal, setShowSplitModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [showUPIPaymentModal, setShowUPIPaymentModal] = useState(false);
  const [selectedUPIAccount, setSelectedUPIAccount] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const [showAddUPIModal, setShowAddUPIModal] = useState(false);
  const [scannedUPI, setScannedUPI] = useState<{ upiId: string, name?: string, amount?: string } | null>(null);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [smsText, setSmsText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [smsSyncEnabled, setSmsSyncEnabled] = useState(() => {
    return localStorage.getItem('obsidian_sms_sync') === 'true';
  });

  const [usedUPIApps, setUsedUPIApps] = useState<string[]>(() => {
    const saved = localStorage.getItem('obsidian_used_upi_apps');
    return saved ? JSON.parse(saved) : [];
  });

  const [upiAppBalances, setUpiAppBalances] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('obsidian_upi_app_balances');
    return saved ? JSON.parse(saved) : {};
  });

  const [latestScannedUPI, setLatestScannedUPI] = useState<{ upiId: string, name?: string } | null>(() => {
    const saved = localStorage.getItem('obsidian_latest_scanned_upi');
    return saved ? JSON.parse(saved) : null;
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

  // Form states
  const [newCard, setNewCard] = useState({ bank: '', name: '', last4: '' });
  const [newTx, setNewTx] = useState({ 
    amount: '', 
    merchant: '', 
    category: 'Shopping', 
    type: 'expense', 
    cardId: '',
    isUPIApp: false,
    upiAppName: '',
    bankCardLast4: ''
  });

  const [isLocked, setIsLocked] = useState(true);
  const [appPin, setAppPin] = useState('1234'); // Default PIN
  const [showPinSettings, setShowPinSettings] = useState(false);
  const [newPin, setNewPin] = useState('');

  // Persistence
  useEffect(() => {
    localStorage.setItem('obsidian_cards', JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    localStorage.setItem('obsidian_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('obsidian_used_upi_apps', JSON.stringify(usedUPIApps));
  }, [usedUPIApps]);

  useEffect(() => {
    localStorage.setItem('obsidian_latest_scanned_upi', JSON.stringify(latestScannedUPI));
  }, [latestScannedUPI]);

  useEffect(() => {
    localStorage.setItem('obsidian_budgets', JSON.stringify(budgets));
  }, [budgets]);

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
    localStorage.setItem('obsidian_upi_app_balances', JSON.stringify(upiAppBalances));
  }, [upiAppBalances]);

  // Prompt camera permission on app startup if not yet granted
  useEffect(() => {
    const askCameraPermissionOnStartup = async () => {
      try {
        if (navigator.mediaDevices && typeof navigator.mediaDevices.getUserMedia === 'function') {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          stream.getTracks().forEach(track => track.stop());
          console.log('Camera permission checking/request completed successfully on launch');
        }
      } catch (err) {
        console.warn('Camera permission request on startup either denied or not supported:', err);
      }
    };

    const timer = setTimeout(() => {
      askCameraPermissionOnStartup();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Theme support
  useEffect(() => {
    if (profile.theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.style.setProperty('--color-surface', '#f8f9fa');
      document.documentElement.style.setProperty('--color-surface-container', '#ffffff');
      document.documentElement.style.setProperty('--color-surface-container-low', '#f1f3f5');
      document.documentElement.style.setProperty('--color-surface-container-high', '#e9ecef');
      document.documentElement.style.setProperty('--color-on-surface', '#212529');
      document.documentElement.style.setProperty('--color-on-surface-variant', '#495057');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.style.setProperty('--color-surface', '#000000');
      document.documentElement.style.setProperty('--color-surface-container', '#0a0a0a');
      document.documentElement.style.setProperty('--color-surface-container-low', '#050505');
      document.documentElement.style.setProperty('--color-surface-container-high', '#121212');
      document.documentElement.style.setProperty('--color-on-surface', '#ffffff');
      document.documentElement.style.setProperty('--color-on-surface-variant', '#a1a1a1');
    }
  }, [profile.theme]);

  // Back button handling
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (showQRScanner) {
        setShowQRScanner(false);
        return;
      }
      if (showUPIPaymentModal) {
        setShowUPIPaymentModal(false);
        setScannedUPI(null);
        return;
      }
      if (e.state && e.state.tab) {
        setActiveTab(e.state.tab);
      } else {
        setActiveTab('home');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showQRScanner, showUPIPaymentModal]);

  const handleTabChange = (tab: string) => {
    if (tab === 'scan') {
      setShowQRScanner(true);
      window.history.pushState({ scanner: true }, '', '#scan');
      return;
    }
    setActiveTab(tab);
    window.history.pushState({ tab }, '', `#${tab}`);
  };

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

  const displayCards = useMemo(() => {
    const bankCards = upiAccounts.map((acc, idx) => ({
      id: acc.id,
      name: acc.upiId,
      bank: acc.bankName,
      last4: acc.accountNumber.slice(-4),
      balance: acc.balance,
      color: CARD_COLORS[idx % CARD_COLORS.length],
      expiry: 'UPI',
      type: 'upi' as const
    }));

    const appCards = usedUPIApps.map((pkg, idx) => {
      const app = UPI_APPS.find(a => a.package === pkg);
      const appBalance = upiAppBalances[pkg] || 0;
      
      return {
        id: pkg,
        name: app?.name || 'UPI App',
        bank: 'UPI App',
        last4: 'APP',
        balance: appBalance,
        color: CARD_COLORS[(bankCards.length + idx) % CARD_COLORS.length],
        expiry: 'APP',
        type: 'app' as const,
        icon: app?.icon || 'https://www.gstatic.com/images/branding/product/2x/gpay_64dp.png'
      };
    });

    return [...cards, ...bankCards, ...appCards];
  }, [cards, upiAccounts, usedUPIApps, upiAppBalances]);

  const activeCard = displayCards[activeCardIndex];
  const filteredTransactions = useMemo(() => {
    if (!activeCard) return [];
    return transactions.filter(t => t.cardId === activeCard.id);
  }, [transactions, activeCard?.id]);

  // UPI Handlers
  const handleQRScan = useCallback((data: string) => {
    try {
      if (data.startsWith('upi://pay')) {
        const url = new URL(data);
        const params = new URLSearchParams(url.search);
        const upiId = params.get('pa') || '';
        const name = params.get('pn') || '';
        const amount = params.get('am') || '';
        
        if (upiId) {
          setLatestScannedUPI({ upiId, name });
          setScannedUPI({ upiId, name, amount });
          setShowQRScanner(false);
          setShowUPIPaymentModal(true);
        }
      } else {
        setLatestScannedUPI({ upiId: data });
        setScannedUPI({ upiId: data });
        setShowQRScanner(false);
        setShowUPIPaymentModal(true);
      }
    } catch (e) {
      setLatestScannedUPI({ upiId: data });
      setScannedUPI({ upiId: data });
      setShowQRScanner(false);
      setShowUPIPaymentModal(true);
    }
  }, []);

  const handleUPIContinue = (amount: string, accountId: string, appPackage?: string) => {
    setPaymentAmount(amount);
    setSelectedUPIAccount(accountId);
    setShowUPIPaymentModal(false); 
    
    setTimeout(() => {
      if (scannedUPI) {
        const tr = `OB-${Date.now()}`;
        const queryParams = `pa=${scannedUPI.upiId}&pn=${encodeURIComponent(scannedUPI.name || 'Merchant')}&am=${amount}&cu=INR&tn=${encodeURIComponent('Payment via Obsidian')}&tr=${tr}&mc=0000&mode=02&orgid=000000`;
        const upiUrl = `upi://pay?${queryParams}`;
        
        const directSchemes: Record<string, string> = {
          'com.phonepe.app': `phonepe://pay?${queryParams}`,
          'net.one97.paytm': `paytmmp://pay?${queryParams}`,
          'com.google.android.apps.nbu.paisa.user': `tez://upi/pay?${queryParams}`,
          'in.org.npci.upiapp': `bhim://pay?${queryParams}`
        };

        let link = upiUrl;
        if (appPackage) {
          if (directSchemes[appPackage]) {
            link = directSchemes[appPackage];
          } else {
            link = `intent://pay?${queryParams}#Intent;scheme=upi;package=${appPackage};end`;
          }
        }
          
        if (Capacitor.isNativePlatform()) {
          try {
            window.location.href = link;
          } catch (e) {
            console.error("Native location redirection failed:", e);
          }
          try {
            window.open(link, '_system');
          } catch (e) {
            console.error("Native system window open failed:", e);
          }

          if (appPackage) {
            setTimeout(() => {
              try {
                window.location.href = upiUrl;
              } catch (e) {
                console.error("Native location upiUrl redirection failed:", e);
              }
              try {
                window.open(upiUrl, '_system');
              } catch (e) {
                console.error("Native system upiUrl open failed:", e);
              }
            }, 500);
          }
        } else {
          const a = document.createElement('a');
          a.href = link;
          a.style.display = 'none';
          document.body.appendChild(a);
          
          try {
            a.click();
            setTimeout(() => {
              if (document.body.contains(a)) {
                window.location.href = link;
              }
            }, 100);
          } catch (err) {
            window.location.href = link;
          } finally {
            setTimeout(() => {
              if (document.body.contains(a)) {
                document.body.removeChild(a);
              }
            }, 500);
          }
        }
        
        handleUPIPay(parseFloat(amount), accountId, appPackage);
        setScannedUPI(null);
      }
    }, 300);
  };

  const handleUPIPay = (amount: number, accountId: string, appPackage?: string) => {
    if (accountId === 'app_wallet' && appPackage) {
      if (!usedUPIApps.includes(appPackage)) {
        setUsedUPIApps(prev => [...prev, appPackage]);
      }
      setUpiAppBalances(prev => {
        const currentBalance = prev[appPackage] || 0;
        return { ...prev, [appPackage]: currentBalance - amount };
      });
    } else if (appPackage) {
      if (!usedUPIApps.includes(appPackage)) {
        setUsedUPIApps(prev => [...prev, appPackage]);
      }
    }

    const account = upiAccounts.find(a => a.id === accountId);
    if (account) {
      setUpiAccounts(prev => prev.map(a => 
        a.id === accountId ? { ...a, balance: a.balance - amount } : a
      ));
    }

    const appInfo = UPI_APPS.find(a => a.package === appPackage);
    const newTransaction: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      amount,
      type: 'expense',
      category: 'UPI Payment',
      merchant: scannedUPI?.name || scannedUPI?.upiId || 'UPI Transfer',
      date: new Date().toISOString(),
      cardId: (accountId && accountId !== 'app_wallet' && accountId !== 'direct') ? accountId : (appPackage || 'upi'), 
      description: `UPI Payment via ${appInfo?.name || 'UPI App'} to ${scannedUPI?.upiId}`,
      upiApp: appPackage
    };
    setTransactions(prev => [newTransaction, ...prev]);

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
      balance: 10000 + Math.floor(Math.random() * 50000), 
      isDefault: upiAccounts.length === 0
    };
    setUpiAccounts(prev => [...prev, newAccount]);
    setShowAddUPIModal(false);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newTransactions: Transaction[] = [];
      
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
            cardId: cards[0]?.id || 'direct'
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

  const totalBalance = useMemo(() => {
    const cardsTotal = cards.reduce((acc, c) => acc + (Number(c.balance) || 0), 0);
    const upiTotal = upiAccounts.reduce((acc, a) => acc + (Number(a.balance) || 0), 0);
    const appTotal = Object.values(upiAppBalances).reduce((acc: number, b) => acc + (Number(b) || 0), 0);
    return cardsTotal + upiTotal + appTotal;
  }, [cards, upiAccounts, upiAppBalances]);

  const totalIncome = useMemo(() => 
    transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0),
  [transactions]);

  const totalExpense = useMemo(() => 
    transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0),
  [transactions]);

  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find(t => t.id === id);
    if (!tx) return;

    setCards(prev => prev.map(c => {
      if (c.id === tx.cardId) {
        return { ...c, balance: c.balance - (tx.type === 'income' ? tx.amount : -tx.amount) };
      }
      return c;
    }));

    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleAddTransaction = (txData: any) => {
    const cardId = txData.cardId || activeCard?.id;
    
    const tx: Transaction = { 
      ...txData, 
      id: Math.random().toString(36).substr(2, 9),
      date: txData.date || new Date().toISOString(),
      cardId: cardId,
      upiApp: txData.upiApp,
      description: txData.bankCardLast4 ? `Paid via ${txData.upiApp} (${txData.bankCardLast4})` : (txData.description || `Manual ${txData.type}`)
    };
    setTransactions([tx, ...transactions]);
    
    setCards(prev => prev.map(c => {
      if (c.id === cardId) {
        return { ...c, balance: c.balance + (tx.type === 'income' ? tx.amount : -tx.amount) };
      }
      return c;
    }));

    setUpiAccounts(prev => prev.map(a => {
      if (a.id === cardId) {
        return { ...a, balance: a.balance + (tx.type === 'income' ? tx.amount : -tx.amount) };
      }
      return a;
    }));

    if (txData.upiApp) {
      const app = UPI_APPS.find(a => a.name.toLowerCase() === txData.upiApp.toLowerCase());
      const pkg = app?.package || txData.upiApp.toLowerCase().replace(/\s/g, '.');
      if (!usedUPIApps.includes(pkg)) {
        setUsedUPIApps(prev => [...prev, pkg]);
      }
    }

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
    setNewTx({ amount: '', merchant: '', category: 'Shopping', type: 'expense', cardId: '', isUPIApp: false, upiAppName: '', bankCardLast4: '' });
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
          "last4": string (4 digits if found),
          "date": string (ISO format if found),
          "description": string
        }
        Context:
        - If it's a debit/payment/spent/sent/paid, type is expense.
        - If credit/received/deposited/added, type is income.
        - Categories: Dining, Tech, Utilities, Entertainment, Transport, Health, Shopping, Travel, Fun, Study.
        - Bank: Try to identify the bank name (e.g. HDFC, SBI, ICICI, AXIS, KOTAK).
        - Merchant: The person or account paid to or received from.
        Return ONLY the JSON.`,
      });

      const result = JSON.parse(response.text.replace(/```json|```/g, '').trim());
      
      let card = cards.find(c => 
        (c.bank.toLowerCase() === result.bank?.toLowerCase() && c.last4 === result.last4) ||
        (c.bank.toLowerCase() === result.bank?.toLowerCase())
      );
      
      if (!card && activeCard) card = activeCard;
      
      if (!card) {
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
      {/* Dynamic Homescreen Background with Safe Blurs */}
      {activeTab === 'home' && (
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 transform scale-[1.02]"
            style={{ backgroundImage: `url(${homePng})` }}
          />
          <div className="absolute inset-0 bg-black/55 backdrop-blur-[6px] transition-all duration-700" />
        </div>
      )}

      <AnimatePresence>
        {isLocked && <AppLock savedPin={appPin} onUnlock={() => setIsLocked(false)} />}
      </AnimatePresence>

      <TopAppBar 
        profile={profile}
        onProfileClick={() => setActiveTab('profile')}
        onNotificationsClick={() => setShowNotifications(true)}
        onScanClick={() => handleTabChange('scan')}
        unreadCount={unreadNotifications}
      />

      <main className="pt-24 px-4 pb-40 max-w-2xl mx-auto">
        {activeTab === 'home' && (
          <HomeView
            profile={profile}
            cards={cards}
            transactions={transactions}
            budgets={budgets}
            upiAccounts={upiAccounts}
            usedUPIApps={usedUPIApps}
            upiAppBalances={upiAppBalances}
            activeCardIndex={activeCardIndex}
            setActiveCardIndex={setActiveCardIndex}
            displayCards={displayCards}
            totalBalance={totalBalance}
            totalIncome={totalIncome}
            totalExpense={totalExpense}
            onTabChange={handleTabChange}
            setShowSmsModal={setShowSmsModal}
            setShowAddModal={setShowAddModal}
            setShowManageCardsModal={setShowManageCardsModal}
            setScannedUPI={setScannedUPI}
            setShowUPIPaymentModal={setShowUPIPaymentModal}
            handleDeleteTransaction={handleDeleteTransaction}
            latestScannedUPI={latestScannedUPI}
          />
        )}

        {activeTab === 'budget' && (
          <BudgetView
            transactions={transactions}
            profile={profile}
            budgets={budgets}
            setBudgets={setBudgets}
            setEditingBudget={setEditingBudget}
            setShowBudgetModal={setShowBudgetModal}
          />
        )}

        {activeTab === 'upi' && (
          <div className="pt-4 animate-none">
            <UPIManagement 
              accounts={upiAccounts} 
              transactions={transactions}
              onAdd={() => setShowAddUPIModal(true)} 
              onDelete={(id) => setUpiAccounts(prev => prev.filter(a => a.id !== id))}
              onSetDefault={(id) => setUpiAccounts(prev => prev.map(a => ({ ...a, isDefault: a.id === id })))}
              currency={profile.currency}
              usedUPIApps={usedUPIApps}
              upiAppBalances={upiAppBalances}
              onUpdateAppBalance={(pkg, balance) => setUpiAppBalances(prev => ({ ...prev, [pkg]: balance }))}
              onUpdateBalance={(id, balance) => setUpiAccounts(prev => prev.map(a => a.id === id ? { ...a, balance } : a))}
              onDeleteApp={(pkg) => {
                setUsedUPIApps(prev => prev.filter(p => p !== pkg));
                setUpiAppBalances(prev => {
                  const next = { ...prev };
                  delete next[pkg];
                  return next;
                });
              }}
            />
          </div>
        )}

        {activeTab === 'categories' && (
          <CategoriesView 
            transactions={transactions}
            profile={profile}
            setTransactions={setTransactions}
            onTabChange={handleTabChange}
          />
        )}

        {activeTab === 'profile' && (
          <SettingsView
            profile={profile}
            setProfile={setProfile}
            smsSyncEnabled={smsSyncEnabled}
            setSmsSyncEnabled={setSmsSyncEnabled}
            setShowPinSettings={setShowPinSettings}
            setIsLocked={setIsLocked}
          />
        )}

        {activeTab === 'transactions' && (
          <LedgerView
            transactions={transactions}
            setTransactions={setTransactions}
            cards={cards}
            setCards={setCards}
            profile={profile}
            handleDeleteTransaction={handleDeleteTransaction}
            handleImportCSV={handleImportCSV}
            setShowImportModal={setShowImportModal}
          />
        )}
      </main>

      <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} />

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
            type="button"
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
              <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 block">Type</label>
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setNewTx({...newTx, type: 'expense'})}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-xs font-bold transition-all border",
                    newTx.type === 'expense' ? "bg-error/10 border-error text-error" : "bg-surface-container border-transparent text-on-surface-variant"
                  )}
                >
                  SPENT
                </button>
                <button 
                  type="button"
                  onClick={() => setNewTx({...newTx, type: 'income'})}
                  className={cn(
                    "flex-1 py-3 rounded-xl text-xs font-bold transition-all border",
                    newTx.type === 'income' ? "bg-secondary/10 border-secondary text-secondary" : "bg-surface-container border-transparent text-on-surface-variant"
                  )}
                >
                  RECEIVED
                </button>
              </div>
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 block">Category</label>
              <select 
                value={newTx.category}
                onChange={e => setNewTx({...newTx, category: e.target.value})}
                className="w-full bg-surface-container rounded-xl p-3 text-sm focus:outline-none border border-white/5 appearance-none font-semibold text-on-surface"
              >
                {Object.keys(CATEGORY_ICONS).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-2">
            <input 
              type="checkbox" 
              id="isUPIApp"
              checked={newTx.isUPIApp}
              onChange={e => setNewTx({...newTx, isUPIApp: e.target.checked})}
              className="w-4 h-4 rounded border-white/10 bg-surface-container text-primary focus:ring-primary"
            />
            <label htmlFor="isUPIApp" className="text-xs font-bold text-on-surface-variant uppercase tracking-wider cursor-pointer">Paid via UPI App?</label>
          </div>

          {newTx.isUPIApp ? (
            <div className="grid grid-cols-2 gap-4 font-semibold text-on-surface">
              <div>
                <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 block">App Name</label>
                <select 
                  value={newTx.upiAppName}
                  onChange={e => setNewTx({...newTx, upiAppName: e.target.value})}
                  className="w-full bg-surface-container rounded-xl p-4 text-sm focus:outline-none border border-white/5 appearance-none"
                >
                  <option value="">Select App</option>
                  {UPI_APPS.map(app => (
                    <option key={app.name} value={app.name}>{app.name}</option>
                  ))}
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 block font-sans text-on-surface-variant">Bank Card/ID</label>
                <input 
                  type="text" 
                  value={newTx.bankCardLast4}
                  onChange={e => setNewTx({...newTx, bankCardLast4: e.target.value})}
                  placeholder="e.g. 1234 or HDFC" 
                  className="w-full bg-surface-container rounded-xl p-4 text-sm focus:outline-none border border-white/5" 
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 font-semibold text-on-surface">
              <div>
                <label className="text-[10px] uppercase font-bold text-on-surface-variant mb-1 block font-sans text-on-surface-variant">Account/Card</label>
                <select 
                  value={newTx.cardId || activeCard?.id}
                  onChange={e => setNewTx({...newTx, cardId: e.target.value})}
                  className="w-full bg-surface-container rounded-xl p-4 text-sm focus:outline-none border border-white/5 appearance-none"
                >
                  {displayCards.filter(c => c.type !== 'app').map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.last4})</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <button 
            type="button"
            onClick={() => handleAddTransaction({
              amount: parseFloat(newTx.amount),
              type: newTx.type,
              category: newTx.category,
              merchant: newTx.merchant,
              cardId: newTx.isUPIApp ? '' : (newTx.cardId || activeCard?.id),
              upiApp: newTx.isUPIApp ? newTx.upiAppName : undefined,
              bankCardLast4: newTx.isUPIApp ? newTx.bankCardLast4 : undefined
            })}
            disabled={!newTx.amount || !newTx.merchant || (newTx.isUPIApp && !newTx.upiAppName)}
            className="w-full mt-4 bg-primary text-surface font-bold py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            Save Transaction
          </button>
        </div>
      </BottomSheet>

      {/* PIN Settings Modal */}
      <StatementImporter 
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        cards={cards}
        upiAccounts={upiAccounts}
        profileCurrency={profile.currency}
        onImportComplete={(approvedTxs, targetCardId) => {
          approvedTxs.forEach((t: any) => {
            handleAddTransaction({
              amount: t.amount,
              type: t.type,
              category: t.category,
              merchant: t.merchant,
              date: t.date, // Past date kept intact!
              cardId: targetCardId,
              description: `AI Statement Import: ${t.originalNarration || t.merchant}`
            });
          });
          
          const newNotif: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            title: 'Bulk Statement Synced',
            message: `Successfully sync'ed ${approvedTxs.length} entries to your selected cards / wallets.`,
            time: new Date().toISOString(),
            read: false,
            type: 'system'
          };
          setNotifications(prev => [newNotif, ...prev]);
        }}
      />

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
                type="button"
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
                className="h-14 rounded-2xl bg-surface-container hover:bg-surface-container-high font-bold active:scale-95 transition-transform text-white"
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

      {/* Manage Cards Modal */}
      <AnimatePresence>
        {showManageCardsModal && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setShowManageCardsModal(false)}
            />
            <motion.div 
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={SMOOTH_TRANSITION}
              className="relative w-full max-w-md bg-surface-container-high rounded-t-3xl p-8 pb-12 shadow-2xl border-t border-white/10 max-h-[80vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline text-2xl font-bold">Manage Cards</h3>
                <button onClick={() => setShowManageCardsModal(false)} className="text-on-surface-variant"><X size={24} /></button>
              </div>
              
              <div className="space-y-4 mb-8">
                {displayCards.map(card => (
                  <div key={card.id} className={cn("p-4 rounded-2xl border border-white/5 flex items-center justify-between bg-gradient-to-r", card.color)}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        {card.type === 'app' ? <PhoneIcon size={20} className="text-white" /> : <CreditCardIcon size={20} className="text-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{card.name}</p>
                        <p className="text-[10px] text-white/60">{card.type === 'app' ? 'UPI App' : `•••• ${card.last4}`}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        type="button"
                        onClick={() => {
                          const newBalance = prompt(`Enter new balance for ${card.name}`, card.balance.toString());
                          if (newBalance !== null) {
                            const balanceValue = Number(newBalance) || 0;
                            if (card.type === 'app') {
                              setUpiAppBalances(prev => ({ ...prev, [card.id]: balanceValue }));
                            } else if (card.type === 'upi') {
                              setUpiAccounts(prev => prev.map(a => a.id === card.id ? { ...a, balance: balanceValue } : a));
                            } else {
                              setCards(prev => prev.map(c => c.id === card.id ? { ...c, balance: balanceValue } : c));
                            }
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary"
                      >
                        <Settings size={18} />
                      </button>
                      {card.type !== 'app' && (
                        <button 
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete ${card.name}?`)) {
                              if (card.type === 'upi') {
                                setUpiAccounts(upiAccounts.filter(a => a.id !== card.id));
                              } else {
                                setCards(cards.filter(c => c.id !== card.id));
                              }
                            }
                          }}
                          className="w-10 h-10 rounded-full bg-error/20 flex items-center justify-center text-error"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <button 
                type="button"
                onClick={() => {
                  setShowManageCardsModal(false);
                  setShowAddCardModal(true);
                }}
                className="w-full bg-primary/10 text-primary font-bold py-4 rounded-xl border border-primary/20 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add New Card
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                <h3 className="font-headline text-2xl font-bold text-white">Add New Card</h3>
                <button onClick={() => setShowAddCardModal(false)} className="text-on-surface-variant"><X size={24} /></button>
              </div>
              
              <div className="space-y-4 text-white font-semibold">
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
                type="button"
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
        <ScanView 
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
            cards={cards}
            usedUPIApps={usedUPIApps}
            upiAppBalances={upiAppBalances}
            onContinue={handleUPIContinue} 
            onClose={() => setShowUPIPaymentModal(false)}
            onAddAccount={() => {
              setShowUPIPaymentModal(false);
              setShowAddUPIModal(true);
            }}
            currency={profile.currency}
          />
        )}
      </BottomSheet>

      <BottomSheet 
        isOpen={showAddUPIModal} 
        onClose={() => setShowAddUPIModal(false)}
        title="Link Bank Account"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {AVAILABLE_BANKS.map(bank => (
              <button 
                type="button"
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
                <span className="text-[10px] font-bold text-center leading-tight text-white">{bank.name}</span>
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

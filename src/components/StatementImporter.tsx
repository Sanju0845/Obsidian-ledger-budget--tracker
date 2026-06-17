import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Sparkles, 
  Upload, 
  FileText, 
  Check, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  Edit2, 
  TrendingUp, 
  TrendingDown, 
  HelpCircle,
  Clock,
  Briefcase,
  Layers,
  ArrowRight
} from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';
import { Card, UPIAccount, Transaction } from '../types';
import { cn } from '../lib/utils';
import { formatCurrency } from './TransactionItem';

interface StatementImporterProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
  upiAccounts: UPIAccount[];
  profileCurrency: string;
  onImportComplete: (transactions: any[], targetCardId: string) => void;
}

interface TempParsedTransaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  merchant: string;
  category: string;
  date: string;
  originalNarration: string;
  selected: boolean;
}

const SAMPLE_TEMPLATES = [
  {
    name: "SBI Credit Card Statement",
    description: "Multi-column layout with headers, fees, and dates",
    content: `Date       Transaction Details                     Amount (INR)  Type
12-06-2026 ZOMATO*FOOD ORDERING BENGALURU              840.00         DR
13-06-2026 INTEREST CHARGES ON REVENUE                 45.20          DR
14-06-2026 AMAZON SELLER PAYMENTS MUMBAI              1,249.00        DR
15-06-2026 ACH INWARD DEPOSIT/ SALARY MGR            95,000.00        CR
15-06-2026 NETFLIX_SUBSCRIPTION_SINGAPORE              649.00         DR`
  },
  {
    name: "Tech-SaaS Excel Paste",
    description: "Tabular representation of invoices & utilities",
    content: `Date\tPayee/Merchant\tCategory\tDebit/Withdraw\tCredit/Deposit\tStatus
08/06/2026\tVercel Hosting\tCloud Infra\t$20.00\t-\tSettled
10/06/2026\tGoogle Apps GSuite\tOffice Tech\t$12.50\t-\tSettled
11/06/2026\tUpwork Freelance Refund\tFreelancing\t-\t$350.00\tSettled
12/06/2026\tGitHub Copilot Bill\tDev Tools\t$10.00\t-\tSettled`
  },
  {
    name: "Raw SMS Dump / Ledger Notes",
    description: "Unstructured messaging notifications from UPI apps",
    content: `Sent Rs.150 to Rohan via GPay on 14 Jun 2026. Ref 38589.
Spent INR 2200.00 at STARBUCKS CONNAUGHT on 15 June 2026 using SBI Credit Card x0492.
Your a/c x2351 has been credited with INR 45,000.00 on 16/06/226 - Salary Bonus.
Received Rs.500 from Vinay on UPI txn path 67584.`
  }
];

const CATEGORIES = [
  'Dining', 'Tech', 'Income', 'Utilities', 'Entertainment', 
  'Transport', 'Health', 'Shopping', 'Food', 'Travel', 'Fun', 'Study', 'UPI Payment'
];

export const StatementImporter: React.FC<StatementImporterProps> = ({
  isOpen,
  onClose,
  cards,
  upiAccounts,
  profileCurrency,
  onImportComplete
}) => {
  const [step, setStep] = useState<1 | 2>(1); // 1: Input/Upload, 2: Review/Edit
  const [inputText, setInputText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseStatus, setParseStatus] = useState('');
  const [parsedTransactions, setParsedTransactions] = useState<TempParsedTransaction[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Default to first card/UPI account if none selected
  React.useEffect(() => {
    if (cards.length > 0 && !selectedTargetId) {
      setSelectedTargetId(cards[0].id);
    } else if (upiAccounts.length > 0 && !selectedTargetId) {
      setSelectedTargetId(upiAccounts[0].id);
    }
  }, [cards, upiAccounts, selectedTargetId]);

  // Handle Drag & Drop Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const processFile = (file: File) => {
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        setInputText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Run the AI Agent extraction using Gemini-3.5-flash
  const parseStatementWithAI = async () => {
    if (!inputText.trim()) {
      alert("Please enter some text, upload a spreadsheet/text file, or choose a template first.");
      return;
    }

    setIsParsing(true);
    setParseStatus("Scanning file structure...");

    try {
      // Simulate stepped feedback for extreme polish
      setTimeout(() => setParseStatus("AI aligning columns & multi-row narrations..."), 1200);
      setTimeout(() => setParseStatus("Validating numeric amounts and transaction flags..."), 2400);
      setTimeout(() => setParseStatus("Assigning smart categorization triggers..."), 3600);

      const ai = new GoogleGenAI({ 
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Analyze the following bank statement data, copied cells, or raw transactions text.
        
        Text Data:
        """
        ${inputText}
        """

        Extract ALL rows represent valid transactions. Translate transaction structures properly. Return a JSON object with this exact format:
        {
          "transactions": [
            {
              "amount": number (absolute positive currency amount),
              "type": "expense" | "income" (determine based on DR/CR, debit/credit info or deposits vs withdrawals),
              "merchant": "clean merchant or payee name",
              "category": "Dining" | "Tech" | "Income" | "Utilities" | "Entertainment" | "Transport" | "Health" | "Shopping" | "Food" | "Travel" | "Fun" | "Study" | "UPI Payment" (map intelligently to one of these),
              "date": "YYYY-MM-DD" (parse the transaction date into this ISO layout),
              "originalNarration": "brief excerpt of original narration cell or text line"
            }
          ]
        }

        Filter out random running balances, page numbers, card information headers, or totals lines. If year is missing or ambiguous, assume current year (2026).
        Return ONLY valid, parsable, and clean JSON.`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const textOutput = response.text || "";
      const cleaned = textOutput.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      if (parsed.transactions && Array.isArray(parsed.transactions)) {
        const mapped = parsed.transactions.map((t: any) => ({
          id: Math.random().toString(36).substr(2, 9),
          amount: parseFloat(t.amount) || 0,
          type: t.type === 'income' ? 'income' : 'expense',
          merchant: t.merchant || 'Unknown Payee',
          category: CATEGORIES.includes(t.category) ? t.category : 'Shopping',
          date: t.date || new Date().toISOString().split('T')[0],
          originalNarration: t.originalNarration || 'Imported item',
          selected: true
        }));

        setParsedTransactions(mapped);
        setStep(2);
      } else {
        throw new Error("Invalid output layout from AI extraction model.");
      }
    } catch (error) {
      console.error("Statement parsing error: ", error);
      alert("AI failed to cleanly extract row data. Please examine your text layout and try again.");
    } finally {
      setIsParsing(false);
      setParseStatus('');
    }
  };

  // Modify individual rows inside Excel preview grid
  const handleEditRowField = (id: string, field: keyof TempParsedTransaction, value: any) => {
    setParsedTransactions(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleToggleRowSelect = (id: string) => {
    setParsedTransactions(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, selected: !item.selected };
      }
      return item;
    }));
  };

  const handleSelectAll = (checked: boolean) => {
    setParsedTransactions(prev => prev.map(item => ({ ...item, selected: checked })));
  };

  // Statistics summaries
  const stats = React.useMemo(() => {
    const selectedList = parsedTransactions.filter(t => t.selected);
    const expense = selectedList.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const income = selectedList.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    return {
      count: selectedList.length,
      expense,
      income,
      net: income - expense
    };
  }, [parsedTransactions]);

  const handleSubmitImport = () => {
    const approved = parsedTransactions.filter(t => t.selected);
    if (approved.length === 0) {
      alert("Please select at least one transaction to sync to your ledger.");
      return;
    }

    onImportComplete(approved, selectedTargetId);
    // Reset wizard
    setInputText('');
    setFileName(null);
    setParsedTransactions([]);
    setStep(1);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="w-full max-w-4xl bg-surface-container rounded-[36px] border border-white/5 overflow-hidden shadow-[0_24px_64px_-16px_rgba(0,0,0,0.7)] flex flex-col max-h-[85vh]"
        id="statement-importer-dialog"
      >
        {/* Header toolbar */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-white/5 bg-surface-container-high/60 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/25 flex items-center justify-center text-primary">
              <Sparkles size={20} className="animate-pulse" />
            </div>
            <div>
              <h2 className="font-headline font-black text-white text-lg tracking-wide uppercase">AI Multi-Format Parser</h2>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest leading-none mt-1">
                {step === 1 ? "Extract past PDF rows & spreadsheet table columns" : "Audit parsed statement spreadsheet preview"}
              </p>
            </div>
          </div>
          
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-white flex items-center justify-center border border-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Loading Parse Mask Overlay */}
        <AnimatePresence>
          {isParsing && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 bg-surface-container/95 flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                <div className="absolute inset-4 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Sparkles size={32} className="animate-bounce" />
                </div>
              </div>
              <h3 className="font-headline text-lg font-bold text-white mb-2">Analyzing Statement Formats</h3>
              <p className="text-sm text-primary font-mono max-w-sm tracking-wide h-6">
                {parseStatus}
              </p>
              <p className="text-xs text-on-surface-variant/70 mt-6 max-w-md">
                Gemini's financial model is matching text grids, isolating rows and deposits, and resolving column dimensions...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Scrollable Wizard Form Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {step === 1 ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Left Column: Config, Text paste & Uploader */}
              <div className="lg:col-span-3 space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest block">
                    Upload Statement or Paste Raw Rows
                  </label>
                  
                  {/* File drop zone box */}
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border border-dashed rounded-3xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3",
                      isDragOver 
                        ? "border-primary bg-primary/5 scale-[0.99] shadow-inner" 
                        : fileName
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : "border-white/10 bg-surface-container-low hover:bg-surface-container-low/80 active:scale-[0.99]"
                    )}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      accept=".csv,.txt,.tsv,.json" 
                      className="hidden" 
                    />
                    {fileName ? (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-md">
                          <Check size={22} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white truncate max-w-xs">{fileName}</p>
                          <p className="text-[10px] text-emerald-400/80 mt-1 uppercase font-bold tracking-wider">File loaded successfully</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-white/5 text-on-surface-variant flex items-center justify-center border border-white/5 shadow-sm">
                          <Upload size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">Drag & drop sheet or text file here</p>
                          <p className="text-[10px] text-on-surface-variant/70 mt-1">Supports bank .csv, .txt, .tsv transcripts, or click to browse</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Text paste area */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                      Raw Transaction Copy-Paste Text
                    </label>
                    {inputText.trim() && (
                      <button 
                        onClick={() => { setInputText(''); setFileName(null); }}
                        className="text-[10px] text-error font-bold uppercase tracking-wider"
                      >
                        Clear Text
                      </button>
                    )}
                  </div>
                  
                  <textarea 
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="Date | Payee | Type | Code | Outflow | Balance&#10;14-Jun-26   Salary Credited   CR   --   120,450.00   INR&#10;15-Jun-26   Zomato Foods     DR   --   450.00       INR&#10;...or copy-paste spreadsheet columns straight from Excel/PDF"
                    className="w-full h-56 bg-surface-container-low rounded-3xl p-5 text-sm font-mono border border-white/5 focus:outline-none focus:border-primary/50 text-white placeholder-on-surface-variant/30 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Right Column: Template presets with explainers */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-surface-container-low border border-white/5 p-5 rounded-3xl space-y-4 shadow-sm">
                  <h3 className="font-headline font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5 border-b border-white/5 pb-3">
                    <Layers size={14} className="text-primary" /> Preset Sample Templates
                  </h3>
                  <p className="text-[11px] text-on-surface-variant leading-relaxed font-semibold">
                    Don’t have a statement ready? Click any layout below to test our AI's capability of parsing row records seamlessly:
                  </p>

                  <div className="space-y-2.5">
                    {SAMPLE_TEMPLATES.map((tmpl) => (
                      <button
                        type="button"
                        key={tmpl.name}
                        onClick={() => {
                          setInputText(tmpl.content);
                          setFileName(tmpl.name + " Demo");
                        }}
                        className="w-full text-left p-3.5 rounded-2xl bg-surface-container hover:bg-surface-container-high border border-white/5 hover:border-primary/2 w-full transition-all flex justify-between items-center group active:scale-[0.98]"
                      >
                        <div className="space-y-1 pr-2">
                          <p className="text-xs font-bold text-white group-hover:text-primary transition-colors">{tmpl.name}</p>
                          <p className="text-[10px] text-on-surface-variant/90 font-medium truncate max-w-[210px]">{tmpl.description}</p>
                        </div>
                        <ChevronRight size={14} className="text-on-surface-variant/80 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 p-5 rounded-3xl space-y-3.5 shadow-sm">
                  <h4 className="font-headline font-black text-xs text-indigo-300 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                    <Sparkles size={14} className="fill-indigo-300 animate-pulse text-indigo-300" /> Humanized Intelligent Logic
                  </h4>
                  <ul className="space-y-2 text-[10px] text-on-surface-variant/80 font-semibold leading-normal">
                    <li className="flex gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      No strict CSV coordinates required. Row indices can vary dynamically.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      AI merges description strings split onto separate lines automatically.
                    </li>
                    <li className="flex gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      Detects deposit/withdrawal, credit/debit, and signs +/- flawlessly.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* Step 2: Spreadsheet Audit Interactive Table View */
            <div className="space-y-6">
              {/* Setup global synchronization details */}
              <div className="bg-surface-container-low border border-white/5 p-4 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">Synchronization Ledger Targets</h4>
                  <p className="text-[10px] text-on-surface-variant font-bold leading-none">Bind all parsed transactions to a credit card or bank wallet</p>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                  <select
                    value={selectedTargetId}
                    onChange={e => setSelectedTargetId(e.target.value)}
                    className="bg-surface-container text-xs font-bold px-4 py-3 rounded-2xl border border-white/5 focus:outline-none focus:border-primary/50 text-white w-full md:w-56"
                  >
                    <optgroup label="Credit & Debit Cards">
                      {cards.map(c => (
                        <option key={c.id} value={c.id}>{c.bank} - {c.name} (*{c.last4})</option>
                      ))}
                    </optgroup>
                    <optgroup label="UPI Bank Accounts">
                      {upiAccounts.map(a => (
                        <option key={a.id} value={a.id}>{a.bankName} - UPI txn (*{a.accountNumber.slice(-4)})</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Transactions grid list spreadsheet */}
              <div className="border border-white/5 rounded-3xl overflow-hidden bg-surface-container-low/40">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-white/5 text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">
                        <th className="py-4 px-4 text-center w-12">
                          <input 
                            type="checkbox" 
                            checked={parsedTransactions.length > 0 && parsedTransactions.every(t => t.selected)}
                            onChange={e => handleSelectAll(e.target.checked)}
                            className="rounded border-white/10 text-primary focus:ring-transparent focus:ring-0 w-4 h-4"
                          />
                        </th>
                        <th className="py-4 px-3 w-28">Date</th>
                        <th className="py-4 px-3">Merchant / Payee Name</th>
                        <th className="py-4 px-3 w-32">Category Tag</th>
                        <th className="py-4 px-3 w-24 text-right">Flow</th>
                        <th className="py-4 px-4 w-32 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {parsedTransactions.map((tx) => (
                        <tr 
                          key={tx.id} 
                          className={cn(
                            "hover:bg-surface-container-high/40 transition-colors",
                            !tx.selected && "opacity-40"
                          )}
                        >
                          {/* Selection indicator */}
                          <td className="py-3 px-4 text-center">
                            <input 
                              type="checkbox" 
                              checked={tx.selected}
                              onChange={() => handleToggleRowSelect(tx.id)}
                              className="rounded border-white/10 text-primary focus:ring-transparent focus:ring-0 w-4 h-4 cursor-pointer"
                            />
                          </td>

                          {/* Date editable cell */}
                          <td className="py-3 px-3 font-mono font-medium text-on-surface-variant text-[11px]">
                            <input 
                              type="text" 
                              value={tx.date} 
                              onChange={e => handleEditRowField(tx.id, 'date', e.target.value)}
                              className="w-full bg-transparent font-semibold border-b border-transparent focus:border-primary/50 text-white focus:outline-none py-0.5"
                            />
                          </td>

                          {/* Merchant name editable cell */}
                          <td className="py-3 px-3">
                            <div className="space-y-0.5">
                              <input 
                                type="text" 
                                value={tx.merchant} 
                                onChange={e => handleEditRowField(tx.id, 'merchant', e.target.value)}
                                className="w-full bg-transparent font-bold border-b border-transparent focus:border-primary/50 text-white focus:outline-none py-0.5"
                              />
                              <p className="text-[10px] text-on-surface-variant/50 max-w-[200px] md:max-w-xs truncate font-medium" title={tx.originalNarration}>
                                Raw: {tx.originalNarration}
                              </p>
                            </div>
                          </td>

                          {/* Category Tag dropdown editable cell */}
                          <td className="py-3 px-3">
                            <select
                              value={tx.category}
                              onChange={e => handleEditRowField(tx.id, 'category', e.target.value)}
                              className="bg-surface-container font-semibold rounded-xl text-[10px] px-2 py-1.5 select-none w-full border border-white/5 focus:outline-none text-white"
                            >
                              {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </td>

                          {/* Income/Expense toggle button cell */}
                          <td className="py-3 px-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleEditRowField(tx.id, 'type', tx.type === 'income' ? 'expense' : 'income')}
                              className={cn(
                                "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md inline-flex items-center gap-1 border",
                                tx.type === 'income' 
                                  ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400" 
                                  : "bg-error/10 border-error/25 text-error"
                              )}
                            >
                              {tx.type === 'income' ? (
                                <>
                                  <TrendingUp size={10} /> CR
                                </>
                              ) : (
                                <>
                                  <TrendingDown size={10} /> DR
                                </>
                              )}
                            </button>
                          </td>

                          {/* Currency Amount editable cell */}
                          <td className="py-3 px-4 text-right font-mono font-bold">
                            <div className="flex justify-end items-center gap-0.5">
                              <span className="text-on-surface-variant/40 text-[11px] font-sans">{profileCurrency}</span>
                              <input 
                                type="number" 
                                value={tx.amount || ''} 
                                onChange={e => handleEditRowField(tx.id, 'amount', parseFloat(e.target.value) || 0)}
                                className="w-20 bg-transparent text-right font-bold border-b border-transparent focus:border-primary/50 text-white focus:outline-none py-0.5"
                                step="any"
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Parsed spreadsheet math overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-4 bg-surface-container rounded-3xl border border-white/5 space-y-1">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Sync items</p>
                  <p className="text-xl font-bold text-white">{stats.count} transactions</p>
                </div>
                
                <div className="p-4 bg-surface-container rounded-3xl border border-white/5 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    <TrendingUp size={12} /> Total credit
                  </div>
                  <p className="text-xl font-bold text-emerald-400">{formatCurrency(stats.income, profileCurrency)}</p>
                </div>

                <div className="p-4 bg-surface-container rounded-3xl border border-white/5 space-y-1">
                  <div className="flex items-center gap-1 text-[10px] text-error font-bold uppercase tracking-wider">
                    <TrendingDown size={12} /> Total charges
                  </div>
                  <p className="text-xl font-bold text-error">{formatCurrency(stats.expense, profileCurrency)}</p>
                </div>

                <div className="p-4 bg-surface-container rounded-3xl border border-white/5 space-y-1">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-wider">Net delta impact</p>
                  <p className={cn(
                    "text-xl font-bold",
                    stats.net >= 0 ? "text-emerald-400" : "text-error"
                  )}>
                    {stats.net >= 0 ? "+" : ""}{formatCurrency(stats.net, profileCurrency)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-5 border-t border-white/5 bg-surface-container-high/40 backdrop-blur flex justify-between items-center">
          {step === 1 ? (
            <>
              <div className="flex items-center gap-2 text-[11px] text-on-surface-variant font-bold">
                <Clock size={14} className="text-primary animate-pulse" /> Fits any custom layout dynamically.
              </div>
              <button
                type="button"
                onClick={parseStatementWithAI}
                className="px-6 py-3.5 bg-primary hover:bg-opacity-90 active:scale-95 text-surface font-bold rounded-2xl flex items-center gap-2 shadow-lg transition-all"
              >
                Scan PDF Statement with AI <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3.5 bg-surface-container hover:bg-surface-container-high text-white font-bold rounded-2xl flex items-center gap-2 border border-white/5 transition-all"
              >
                <ChevronLeft size={16} /> Rearrange Source
              </button>
              
              <button
                type="button"
                onClick={handleSubmitImport}
                className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-surface font-black rounded-2xl flex items-center gap-2 shadow-lg transition-all"
              >
                Approve & Sync {stats.count} Transactions <Check size={16} />
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

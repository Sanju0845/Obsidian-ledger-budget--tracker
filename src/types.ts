export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  merchant: string;
  date: string;
  cardId: string;
  description?: string;
}

export interface Card {
  id: string;
  name: string;
  bank: string;
  last4: string;
  balance: number;
  color: string;
  expiry: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  currency: string;
  theme: 'dark' | 'light';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'transaction' | 'budget' | 'system';
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  color: string;
  icon: string;
  deadline?: string;
}

export const BANK_LOGOS: Record<string, string> = {
  sbi: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/sbi.png',
  statebankofindia: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/sbi.png',
  hdfc: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/hdfc.png',
  hdfcbank: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/hdfc.png',
  icici: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/icici.png',
  icicibank: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/icici.png',
  airtel: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/airtel.png',
  airtelpaymentsbank: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/airtel.png',
  fampay: 'https://fampay.in/favicon.ico',
  axis: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/axis.png',
  axisbank: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/axis.png',
  kotak: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/kotak.png',
  kotakmahindrabank: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/kotak.png',
  yesbank: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/yes.png',
  pnb: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/pnb.png',
  punjabnationalbank: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/pnb.png',
  bob: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/bob.png',
  bankofbaroda: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/bob.png',
  idfc: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/idfc.png',
  idfcfirstbank: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/idfc.png',
  rbl: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/rbl.png',
  rblbank: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/rbl.png',
  canara: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/canara.png',
  canarabank: 'https://cdn.jsdelivr.net/gh/praveenpuglia/indian-banks@master/logos/canara.png',
};

export const CARD_COLORS = [
  'from-[#ba9eff] to-[#8455ef]',
  'from-[#699cff] to-[#005ac2]',
  'from-[#ff86c3] to-[#f271b5]',
  'from-[#a27cff] to-[#6e3bd7]',
];

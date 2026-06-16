import { 
  Utensils, 
  ShoppingBag, 
  ArrowUpRight, 
  Zap, 
  Film, 
  Fuel, 
  Dumbbell, 
  Plane, 
  PartyPopper, 
  GraduationCap,
  Heart
} from 'lucide-react';
import { BANK_LOGOS } from '../types';

export const UPI_APPS = [
  { name: 'PhonePe', package: 'com.phonepe.app', icon: 'https://img.icons8.com/?size=48&id=R8eaasv58f5O&format=png' },
  { name: 'Paytm', package: 'net.one97.paytm', icon: 'https://img.icons8.com/?size=48&id=68067&format=png' },
  { name: 'Google Pay', package: 'com.google.android.apps.nbu.paisa.user', icon: 'https://img.icons8.com/?size=48&id=am4ltuIYDpQ5&format=png' },
  { name: 'Airtel', package: 'com.myairtelapp', icon: 'https://cdn.iconscout.com/icon/free/png-512/free-airtel-icon-svg-download-png-14551356.png?f=webp&w=256' },
  { name: 'FamPay', package: 'com.fampay.app', icon: 'https://play-lh.googleusercontent.com/0IkegIm8uvzIM3RiVBfj01eSlNa3r5C_GCuExyI57b9_x-qLeV8YR3SVuT8DPPYT_N0=w240-h480-rw' },
  { name: 'Amazon Pay', package: 'in.amazon.mShop.android.shopping', icon: 'https://play-lh.googleusercontent.com/urVIq3KHpF9hAm7FJpE2I4YlGfqMFpUdb5GMtQcASC1ODbWe1zuQFrF99ZPTELfE8wA=w240-h480-rw' },
  { name: 'BHIM', package: 'in.org.npci.upiapp', icon: 'https://play-lh.googleusercontent.com/B5cNBA15IxjCT-8UTXEWgiPcGkJ1C07iHKwm2Hbs8xR3PnJvZ0swTag3abdC_Fj5OfnP=w240-h480-rw' },
  { name: 'Kiwi', package: 'com.go.kiwi', icon: 'https://gokiwi.in/logo.png' },
];

export const AVAILABLE_BANKS = [
  { id: 'sbi', name: 'State Bank of India', logo: BANK_LOGOS.sbi },
  { id: 'hdfc', name: 'HDFC Bank', logo: BANK_LOGOS.hdfc },
  { id: 'icici', name: 'ICICI Bank', logo: BANK_LOGOS.icici },
  { id: 'axis', name: 'Axis Bank', logo: BANK_LOGOS.axis },
  { id: 'kotak', name: 'Kotak Mahindra Bank', logo: BANK_LOGOS.kotak },
];

export const CATEGORY_ICONS: Record<string, any> = {
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
  'UPI Payment': ArrowUpRight,
};

export const SMOOTH_TRANSITION = { type: 'tween' as const, ease: 'easeInOut' as const, duration: 0.3 };
export const QUICK_TRANSITION = { type: 'tween' as const, ease: 'linear' as const, duration: 0.1 };
export const NO_DAMPING_TRANSITION = { type: 'tween' as const, ease: 'easeOut' as const, duration: 0.15 };
export const SPRING_CONFIG = { damping: 25, stiffness: 200 };

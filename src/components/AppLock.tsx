import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Lock, X, Fingerprint } from 'lucide-react';
import { NativeBiometric } from 'capacitor-native-biometric';
import { Capacitor } from '@capacitor/core';
import { cn } from '../lib/utils';
import { QUICK_TRANSITION, SMOOTH_TRANSITION } from './constants';

interface AppLockProps {
  onUnlock: () => void;
  savedPin: string;
}

export const AppLock: React.FC<AppLockProps> = ({ onUnlock, savedPin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [biometricError, setBiometricError] = useState('');

  const handleNumber = useCallback((num: string) => {
    setPin(prev => {
      if (prev.length < 4) {
        const newPin = prev + num;
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
        return newPin;
      }
      return prev;
    });
  }, [savedPin, onUnlock]);

  const triggerBiometricUnlock = useCallback(async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        const available = await NativeBiometric.isAvailable();
        if (available.isAvailable) {
          setBiometricSupported(true);
          await NativeBiometric.verifyIdentity({
            reason: "Access your Obsidian Budget Tracker securely",
            title: "Fingerprint Unlock",
            subtitle: "Scan your fingerprint to continue",
            description: "Locate your biometric scanner to unlock",
          });
          onUnlock();
        } else {
          setBiometricSupported(false);
          console.log("Device does not support biometrics natively.", available.errorCode);
        }
      } catch (err: any) {
        console.error("Native biometric unlock failed:", err);
        setBiometricError(err?.message || "Biometric unlock failed or dismissed");
      }
    } else {
      // Mock/Simulated Biometrics for Web Previews
      setBiometricSupported(true);
      const confirmSim = window.confirm("[WEB PREVIEW] Simulate successful native Fingerprint Unlock?");
      if (confirmSim) {
        onUnlock();
      }
    }
  }, [onUnlock]);

  // Keyboard listener to keep entry screen super quick
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleNumber(e.key);
      } else if (e.key === 'Backspace') {
        setPin(prev => prev.slice(0, -1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumber]);

  // Prompt native biometrics on mount with short delay
  useEffect(() => {
    const timer = setTimeout(() => {
      triggerBiometricUnlock();
    }, 300);
    return () => clearTimeout(timer);
  }, [triggerBiometricUnlock]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      transition={SMOOTH_TRANSITION}
      className="fixed inset-0 z-[200] bg-surface flex flex-col items-center justify-center p-8 select-none"
    >
      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={32} className="text-primary animate-pulse" />
        </div>
        <h1 className="font-headline text-3xl font-bold mb-2">Obsidian Ledger</h1>
        <p className="text-on-surface-variant text-sm">
          {biometricSupported ? "Authenticating via Fingerprint / PIN" : "Enter your 4-digit PIN"}
        </p>
        {biometricError && (
          <p className="text-error/80 text-xs mt-2 bg-error/10 py-1 px-3 rounded-full inline-block">
            {biometricError}
          </p>
        )}
      </div>

      <div className="flex gap-4 mb-16">
        {[0, 1, 2, 3].map((i) => (
          <motion.div 
            key={i}
            animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
            transition={QUICK_TRANSITION}
            className={cn(
              "w-4 h-4 rounded-full border-2 transition-all duration-300",
              pin.length > i ? "bg-primary border-primary scale-125 shadow-[0_0_12px_rgba(186,158,255,0.5)]" : "border-white/20"
            )}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6 w-full max-w-xs">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'biometric', '0', 'back'].map((val, i) => (
          <button
            key={i}
            onClick={() => {
              if (val === 'back') setPin(prev => prev.slice(0, -1));
              else if (val === 'biometric') triggerBiometricUnlock();
              else if (val !== '') handleNumber(val);
            }}
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all active:scale-95 cursor-pointer touch-manipulation select-none",
              val === 'biometric' 
                ? "bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20 shadow-[0_0_15px_rgba(186,158,255,0.2)]" 
                : val === 'back'
                ? "bg-surface-container hover:bg-surface-container-high text-on-surface-variant"
                : "bg-surface-container hover:bg-surface-container-high text-on-surface"
            )}
          >
            {val === 'back' ? <X size={24} /> : val === 'biometric' ? <Fingerprint size={28} className="animate-pulse" /> : val}
          </button>
        ))}
      </div>
    </motion.div>
  );
};

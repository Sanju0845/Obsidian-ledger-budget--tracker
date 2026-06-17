import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { QUICK_TRANSITION, SMOOTH_TRANSITION } from './constants';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  height?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  height = "auto"
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

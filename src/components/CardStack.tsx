import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, CreditCard } from 'lucide-react';
import { Card } from '../types';
import { cn } from '../lib/utils';
import { BANK_LOGOS } from '../types';
import { formatCurrency } from './TransactionItem';

interface CardStackProps {
  cards: Card[];
  activeIndex: number;
  onSwipe: (dir: number) => void;
  currency: string;
}

export const CardStack: React.FC<CardStackProps> = React.memo(({ 
  cards, 
  activeIndex, 
  onSwipe, 
  currency 
}) => {
  return (
    <section className="relative mb-12 h-64 px-6">
      <div className="relative h-full w-full max-w-md mx-auto flex items-center justify-center">
        <AnimatePresence initial={false}>
          {cards.map((card, idx) => {
            let relIdx = (idx - activeIndex + cards.length) % cards.length;
            if (relIdx > 1) return null; // Only show top 2 cards for performance

            return (
              <motion.div
                key={card.id}
                className={cn(
                  "absolute inset-0 h-52 rounded-2xl p-6 flex flex-col justify-between card-shadow-glow border border-white/10",
                  "bg-gradient-to-br",
                  card.color
                )}
                initial={false}
                animate={{ 
                  scale: 1 - relIdx * 0.05, 
                  opacity: 1 - relIdx * 0.5,
                  y: relIdx * -12,
                  zIndex: cards.length - relIdx,
                  rotate: relIdx * 0.5
                }}
                transition={{ type: 'tween', ease: 'easeOut', duration: 0.2 }}
                exit={{ x: -250, opacity: 0, transition: { duration: 0.15, ease: 'easeIn' } }}
                drag={relIdx === 0 ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                onDragEnd={(_, info) => {
                  if (info.offset.x > 80) onSwipe(-1);
                  else if (info.offset.x < -80) onSwipe(1);
                }}
                style={{ 
                  cursor: relIdx === 0 ? 'grab' : 'default',
                  willChange: 'transform, opacity',
                  touchAction: relIdx === 0 ? 'pan-y' : 'auto'
                }}
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    {card.type === 'app' ? (
                      <div className="bg-white p-1 rounded-md h-8 w-8 flex items-center justify-center overflow-hidden">
                        <img src={card.icon} className="h-full w-full object-contain" alt={card.name} referrerPolicy="no-referrer" />
                      </div>
                    ) : BANK_LOGOS[card.bank.toLowerCase().replace(/\s/g, '')] ? (
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
                  {card.type === 'app' ? <Smartphone className="text-white/80" size={24} /> : <CreditCard className="text-white/80" size={24} />}
                </div>
                
                <div>
                  <p className="font-headline text-2xl text-white tracking-[0.2em] mb-4">
                    {card.type === 'app' ? 'UPI APP CARD' : `•••• •••• •••• ${card.last4}`}
                  </p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] uppercase font-label text-white/60 mb-1">Balance</p>
                      <p className="font-headline text-xl text-white font-bold">{formatCurrency(card.balance, currency)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-label text-white/60">{card.type === 'app' ? 'ACTIVE' : `Exp ${card.expiry}`}</p>
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
CardStack.displayName = 'CardStack';

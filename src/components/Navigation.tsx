import React from 'react';
import { motion } from 'motion/react';
import { Home, Wallet, LayoutGrid, ReceiptText, Settings, Bell, Scan } from 'lucide-react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { QUICK_TRANSITION } from './constants';

interface TopAppBarProps {
  profile: UserProfile;
  onProfileClick: () => void;
  onNotificationsClick: () => void;
  onScanClick: () => void;
  unreadCount: number;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ 
  profile, 
  onProfileClick, 
  onNotificationsClick, 
  onScanClick,
  unreadCount 
}) => (
  <header 
    className="fixed left-0 right-0 w-full flex justify-between px-6 z-50 will-change-transform" 
    style={{ top: 'calc(1rem + env(safe-area-inset-top, 0px))' }}
  >
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
      <span className="ml-3 mr-4 font-headline font-bold text-white text-sm tracking-tight">{profile.name} v2.1.</span>
    </div>
    <div className="flex gap-2">
      <button 
        onClick={onScanClick}
        className="glass-header w-12 h-12 rounded-full flex items-center justify-center text-primary transition-all hover:scale-105 active:scale-90 border border-primary/25 bg-primary/10 hover:bg-primary/20 relative"
        title="Scan UPI QR Code"
      >
        <Scan size={20} />
      </button>
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

interface BottomNavBarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'budget', label: 'Budget', icon: Wallet },
    { id: 'categories', label: 'Categories', icon: LayoutGrid },
    { id: 'transactions', label: 'Ledger', icon: ReceiptText },
    { id: 'profile', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 pointer-events-none will-change-transform">
      {/* Fade background to prevent accidental clicks and add depth */}
      <div className="absolute inset-x-0 bottom-0 h-32 glass-nav pointer-events-auto" />
      
      <div 
        className="relative flex justify-around items-center px-8 pt-4 pointer-events-none" 
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="glass-capsule rounded-full w-full max-w-md h-16 flex justify-around items-center px-4 shadow-2xl pointer-events-auto border border-white/10">
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

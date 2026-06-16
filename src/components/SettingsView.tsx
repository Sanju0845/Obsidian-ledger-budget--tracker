import React from 'react';
import { 
  Sparkles, 
  Lock, 
  Moon, 
  Sun, 
  Scan, 
  Settings, 
  CreditCard, 
  LogOut, 
  ChevronRight 
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '../types';
import { cn } from '../lib/utils';
import { QUICK_TRANSITION } from './constants';

interface SettingsViewProps {
  profile: UserProfile;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  smsSyncEnabled: boolean;
  setSmsSyncEnabled: (enabled: boolean) => void;
  setShowPinSettings: (show: boolean) => void;
  setIsLocked: (locked: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  setProfile,
  smsSyncEnabled,
  setSmsSyncEnabled,
  setShowPinSettings,
  setIsLocked
}) => {
  return (
    <div className="space-y-8 animate-none">
      <div>
        <h1 className="font-headline text-4xl font-bold tracking-tight">Security & Settings</h1>
        <p className="text-on-surface-variant text-sm mt-1 font-medium">Configure profile and global system behaviors</p>
      </div>
      
      {/* User Card with custom animated avatar */}
      <div className="relative overflow-hidden bg-gradient-to-b from-surface-container-high/60 to-surface-container-low/40 p-6 rounded-[28px] border border-white/5 shadow-xl flex flex-col items-center">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-primary/10 blur-[50px] pointer-events-none" />
        
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/20 p-1 bg-surface shadow-inner">
            <img 
              src={profile.avatar} 
              className="w-full h-full rounded-full object-cover" 
              alt="Profile" 
              referrerPolicy="no-referrer" 
            />
          </div>
          <button 
            onClick={() => setProfile({
              ...profile, 
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}&backgroundColor=ba9eff`
            })}
            className="absolute bottom-0 right-0 bg-primary text-surface p-2.5 rounded-full shadow-lg active:scale-90 transition-transform cursor-pointer border border-surface"
            title="Randomize avatar seed"
          >
            <Sparkles size={14} />
          </button>
        </div>
        
        <h2 className="mt-4 font-headline text-xl font-bold text-white tracking-tight">{profile.name}</h2>
        <p className="text-on-surface-variant text-[11px] font-semibold uppercase tracking-wider mt-0.5">{profile.email}</p>
      </div>

      {/* Main Form Fields Container */}
      <div className="space-y-4">
        <div className="bg-gradient-to-b from-surface-container-high/40 to-surface-container-low/20 p-6 rounded-3xl border border-white/5 space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-white/5">
            <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant">Profile metadata</h3>
            <button 
              onClick={() => setShowPinSettings(true)}
              className="flex items-center gap-1.5 bg-surface-container p-2 px-3.5 rounded-full border border-white/5 text-[10px] uppercase font-bold tracking-wider text-primary hover:bg-surface-container-high active:scale-95 transition-transform"
            >
              <Lock size={12} className="text-primary animate-pulse" />
              Change PIN
            </button>
          </div>
          
          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-on-surface-variant pl-1">Display Name</label>
            <input 
              type="text" 
              value={profile.name}
              onChange={e => setProfile({...profile, name: e.target.value})}
              className="w-full bg-surface-container rounded-xl p-3.5 text-xs font-semibold focus:outline-none border border-white/5"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-on-surface-variant pl-1">Email Address</label>
            <input 
              type="email" 
              value={profile.email}
              onChange={e => setProfile({...profile, email: e.target.value})}
              className="w-full bg-surface-container rounded-xl p-3.5 text-xs font-semibold focus:outline-none border border-white/5"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] uppercase font-bold text-on-surface-variant pl-1">Currency Symbol</label>
            <div className="relative">
              <select 
                value={profile.currency}
                onChange={e => setProfile({...profile, currency: e.target.value})}
                className="w-full bg-surface-container rounded-xl p-3.5 pr-8 text-xs font-semibold focus:outline-none border border-white/5 appearance-none"
              >
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-on-surface-variant">
                <ChevronRight size={14} className="rotate-90" />
              </div>
            </div>
          </div>
        </div>

        {/* System parameters */}
        <div className="bg-gradient-to-b from-surface-container-high/40 to-surface-container-low/20 p-6 rounded-3xl border border-white/5 space-y-4">
          <h3 className="font-headline font-bold text-xs uppercase tracking-widest text-on-surface-variant pb-1">Core variables</h3>
          
          {/* Dark Mode sliding pill */}
          <div className="flex justify-between items-center py-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                {profile.theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">System Dark Mode</span>
                <span className="text-[9px] text-on-surface-variant font-semibold uppercase tracking-wider">{profile.theme} mode enabled</span>
              </div>
            </div>
            <button 
              onClick={() => setProfile({ ...profile, theme: profile.theme === 'dark' ? 'light' : 'dark' })}
              className="w-12 h-6 rounded-full bg-surface-container-high relative transition-colors cursor-pointer"
            >
              <motion.div 
                animate={{ x: profile.theme === 'dark' ? 24 : 4 }}
                transition={QUICK_TRANSITION}
                className="absolute top-1 w-4 h-4 rounded-full bg-primary shadow-lg"
              />
            </button>
          </div>

          {/* Automatic SMS sync */}
          <div className="flex justify-between items-center py-1 border-t border-white/5 pt-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
                <Scan size={18} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white">SMS Live Tracking</span>
                <span className="text-[9px] text-on-surface-variant font-semibold uppercase tracking-wider">Intercept transaction messages</span>
              </div>
            </div>
            <button 
              onClick={() => setSmsSyncEnabled(!smsSyncEnabled)}
              className={cn(
                "w-12 h-6 rounded-full transition-colors relative cursor-pointer",
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

          {/* Menu links fallback triggers */}
          <button className="w-full flex justify-between items-center py-2.5 text-xs font-bold border-t border-white/5 pt-3 hover:text-primary transition-colors text-left">
            <div className="flex items-center gap-3">
              <Settings size={18} className="text-on-surface-variant" />
              <span>General Preferences</span>
            </div>
            <ChevronRight size={14} />
          </button>
          
          <button className="w-full flex justify-between items-center py-2.5 text-xs font-bold border-t border-white/5 pt-3 hover:text-primary transition-colors text-left">
            <div className="flex items-center gap-3">
              <CreditCard size={18} className="text-on-surface-variant" />
              <span>Linkage Schemes</span>
            </div>
            <ChevronRight size={14} />
          </button>
          
          {/* Logout */}
          <button 
            onClick={() => {
              if(confirm("Log out of current wallet profile? All local history is stored securely on device.")) {
                setIsLocked(true);
              }
            }}
            className="w-full flex justify-between items-center py-2.5 text-xs font-bold border-t border-white/5 pt-3 text-error hover:text-error/80 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} className="text-error" />
              <span>Disengage & Lock Session</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

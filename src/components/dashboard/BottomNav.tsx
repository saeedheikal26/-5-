import React from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  Trophy, 
  User 
} from 'lucide-react';
import { Tab } from '../../types';

interface BottomNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'today' as Tab, icon: Home, label: 'التحدي' },
    { id: 'leaderboard' as Tab, icon: Trophy, label: 'المتصدرين' },
    { id: 'profile' as Tab, icon: User, label: 'حسابي' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-luxgray border-t border-brand/20 px-6 py-4 flex items-center justify-around z-50 safe-bottom">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        
        return (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              // Dispatch event to keep sync if listening elsewhere
              window.dispatchEvent(new CustomEvent('changeTab', { detail: tab.id }));
            }}
            className="flex flex-col items-center gap-1 group relative outline-none py-1 px-4"
          >
            {isActive && (
              <motion.div
                layoutId="active-tab"
                className="absolute inset-x-0 -top-4 h-1 bg-gradient-to-r from-brand via-brand-light to-brand shadow-[0_2px_15px_#059669]"
              />
            )}
            <div
              className={`p-2 rounded-2xl transition-colors ${
                isActive ? 'bg-brand/10 text-brand' : 'text-slate-500 group-hover:text-brand'
              }`}
            >
              <Icon 
                size={24} 
                className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}
                fill={isActive ? 'currentColor' : 'none'}
              />
            </div>
            <span className={`text-[10px] font-bold tracking-wider transition-colors ${
              isActive ? 'text-brand' : 'text-slate-500'
            }`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

import React from 'react';
import { Sparkles, MessageSquareCode, LayoutGrid } from 'lucide-react';
import { useAppTheme } from '../context/ThemeContext';

interface MobileBottomNavProps {
  activeTab: 'chat' | 'workspace' | 'directory';
  onTabChange: (tab: 'chat' | 'workspace' | 'directory') => void;
  language?: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  language = 'roman-urdu',
}) => {
  const { themeConfig, mode } = useAppTheme();
  const isLight = mode === 'light';

  const navItems = [
    {
      id: 'chat' as const,
      label: language === 'roman-urdu' ? 'AI Chat' : language === 'urdu' ? 'چیٹ' : 'AI Chat',
      icon: Sparkles,
      description: 'Single View Chat',
    },
    {
      id: 'workspace' as const,
      label: language === 'roman-urdu' ? 'Tasks & ZIP' : language === 'urdu' ? 'ٹاسک' : 'Tasks (ZIP)',
      icon: MessageSquareCode,
      description: 'Direct ZIP & Preview',
    },
    {
      id: 'directory' as const,
      label: language === 'roman-urdu' ? '2,000 AI Agent' : language === 'urdu' ? '۲۰۰۰ ایجنٹ' : '2,000 AI Agent',
      icon: LayoutGrid,
      description: 'Full Agent Directory',
    },
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      className={`fixed bottom-0 left-0 right-0 z-30 md:hidden border-t backdrop-blur-xl transition-colors duration-200 ${
        isLight
          ? 'bg-white/95 border-slate-200 text-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]'
          : 'bg-slate-950/95 border-slate-800/80 text-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]'
      } pb-[env(safe-area-inset-bottom,0px)]`}
      aria-label="Mobile Navigation"
    >
      <div className="flex items-center justify-around h-14 px-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const IconComponent = item.icon;

          return (
            <button
              key={item.id}
              id={`mobile-tab-${item.id}`}
              onClick={() => onTabChange(item.id)}
              className={`flex-1 flex flex-col items-center justify-center h-full py-1 transition-all relative ${
                isActive
                  ? 'font-semibold'
                  : isLight
                  ? 'text-slate-500 hover:text-slate-800'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              style={{
                color: isActive ? themeConfig.primaryColor : undefined,
              }}
            >
              <div
                className={`relative flex items-center justify-center p-1 rounded-xl transition-all ${
                  isActive
                    ? isLight
                      ? 'bg-slate-100 scale-105'
                      : 'bg-slate-900/90 scale-105'
                    : ''
                }`}
              >
                <IconComponent className="h-5 w-5" />
                {isActive && (
                  <span
                    className="absolute -bottom-1 h-1 w-3 rounded-full"
                    style={{ backgroundColor: themeConfig.primaryColor }}
                  />
                )}
              </div>
              <span className="text-[11px] tracking-tight mt-0.5 whitespace-nowrap">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

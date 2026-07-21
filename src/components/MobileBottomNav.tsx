import React from 'react';

interface MobileBottomNavProps {
  currentTab: 'dashboard' | 'tasks' | 'history' | 'settings';
  onSelectTab: (tab: 'dashboard' | 'tasks' | 'history' | 'settings') => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#0b1326] border-t border-[#3c4a42] flex items-center justify-around z-50">
      <button
        onClick={() => onSelectTab('dashboard')}
        className={`flex flex-col items-center gap-0.5 text-[10px] ${
          currentTab === 'dashboard' ? 'text-[#4edea3] font-bold' : 'text-[#bbcabf]'
        }`}
      >
        <span
          className={`material-symbols-outlined ${
            currentTab === 'dashboard' ? 'material-symbols-filled' : ''
          }`}
        >
          dashboard
        </span>
        <span>Home</span>
      </button>

      <button
        onClick={() => onSelectTab('tasks')}
        className={`flex flex-col items-center gap-0.5 text-[10px] ${
          currentTab === 'tasks' ? 'text-[#4edea3] font-bold' : 'text-[#bbcabf]'
        }`}
      >
        <span
          className={`material-symbols-outlined ${
            currentTab === 'tasks' ? 'material-symbols-filled' : ''
          }`}
        >
          hourglass_empty
        </span>
        <span>Tasks</span>
      </button>

      <button
        onClick={() => onSelectTab('history')}
        className={`flex flex-col items-center gap-0.5 text-[10px] ${
          currentTab === 'history' ? 'text-[#4edea3] font-bold' : 'text-[#bbcabf]'
        }`}
      >
        <span
          className={`material-symbols-outlined ${
            currentTab === 'history' ? 'material-symbols-filled' : ''
          }`}
        >
          history
        </span>
        <span>Histórico</span>
      </button>

      <button
        onClick={() => onSelectTab('settings')}
        className={`flex flex-col items-center gap-0.5 text-[10px] ${
          currentTab === 'settings' ? 'text-[#4edea3] font-bold' : 'text-[#bbcabf]'
        }`}
      >
        <span
          className={`material-symbols-outlined ${
            currentTab === 'settings' ? 'material-symbols-filled' : ''
          }`}
        >
          settings
        </span>
        <span>Ajustes</span>
      </button>
    </nav>
  );
};

import React from 'react';

interface SidebarProps {
  currentTab: 'dashboard' | 'tasks' | 'history' | 'settings';
  onSelectTab: (tab: 'dashboard' | 'tasks' | 'history' | 'settings') => void;
  storagePercent?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  storagePercent = 82,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'tasks', label: 'Tasks', icon: 'hourglass_empty' },
    { id: 'history', label: 'History', icon: 'history' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ] as const;

  return (
    <aside className="w-[280px] h-full fixed left-0 top-0 bg-[#131b2e] border-r border-[#3c4a42] flex-col gap-2 pt-20 pb-10 px-4 z-40 hidden md:flex">
      <div className="px-4 py-4 mb-2">
        <h2 className="text-xl font-bold text-[#4edea3] tracking-wide">Automation</h2>
        <p className="text-xs font-mono text-[#bbcabf] tracking-wider">v2.4.0-stable</p>
      </div>

      <nav className="flex flex-col gap-2">
        {navItems.map((item) => {
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                isActive
                  ? 'bg-[#10b981] text-[#00422b] font-semibold emerald-glow'
                  : 'text-[#bbcabf] hover:bg-[#2d3449]/50 hover:text-[#dae2fd]'
              }`}
            >
              <span
                className={`material-symbols-outlined ${
                  isActive ? 'material-symbols-filled' : ''
                }`}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto p-4 glass-panel rounded-xl border border-[#3c4a42]/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono text-[#bbcabf]">Storage</span>
          <span className="text-xs font-mono text-[#4edea3] font-bold">{storagePercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-[#2d3449] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#10b981] transition-all duration-500 rounded-full"
            style={{ width: `${storagePercent}%` }}
          ></div>
        </div>
      </div>
    </aside>
  );
};

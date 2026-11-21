import React from 'react';
import { TabType } from '../types';
import { LayoutDashboard, Pill, History, Settings, HeartPulse, Bell } from 'lucide-react';

interface NavigationProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  pendingDueCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  pendingDueCount,
}) => {
  const navItems: { id: TabType; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'medicines', label: 'My Medicines', icon: Pill },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-slate-200 h-screen sticky top-0 shadow-sm z-30">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#138A72] text-white flex items-center justify-center shadow-md shadow-teal-700/20">
            <HeartPulse className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#138A72]">MediMate</h1>
            <p className="text-xs text-slate-500 font-medium leading-none">Never miss a dose</p>
          </div>
        </div>

        {/* Due Banner if any doses are due right now */}
        {pendingDueCount > 0 && (
          <div className="mx-4 mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-amber-800">
            <Bell className="w-5 h-5 text-amber-600 animate-bounce flex-shrink-0" />
            <div className="text-xs font-semibold">
              {pendingDueCount} {pendingDueCount === 1 ? 'dose is' : 'doses are'} due right now!
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl font-semibold text-left transition-all min-h-[50px] ${
                  isActive
                    ? 'bg-[#138A72] text-white shadow-md shadow-teal-800/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="text-lg">{item.label}</span>
                {item.id === 'dashboard' && pendingDueCount > 0 && (
                  <span className={`ml-auto px-2 py-0.5 text-xs font-bold rounded-full ${
                    isActive ? 'bg-white text-[#138A72]' : 'bg-amber-500 text-white'
                  }`}>
                    {pendingDueCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 text-xs text-slate-400 text-center">
          <p className="font-medium text-slate-500">Accessible Healthcare MVP</p>
          <p className="mt-0.5">Designed with care for all ages</p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav 
        className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 px-2 py-1 shadow-lg"
        aria-label="Mobile Navigation"
      >
        <div className="flex justify-around items-center">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-3 rounded-lg relative min-h-[52px] min-w-[64px] transition-colors ${
                  isActive ? 'text-[#138A72] font-bold' : 'text-slate-500 font-medium'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  {item.id === 'dashboard' && pendingDueCount > 0 && (
                    <span className="absolute -top-1 -right-2 bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                      {pendingDueCount}
                    </span>
                  )}
                </div>
                <span className="text-xs mt-1 leading-none">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
};

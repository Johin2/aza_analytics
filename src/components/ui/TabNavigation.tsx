import React from 'react';
import { clsx } from 'clsx';

export interface Tab {
  id: string;
  label: string;
  badge?: number;
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  return (
    <div
      className={clsx(
        'flex flex-wrap items-center gap-1 bg-gray-100 rounded-xl p-1',
        className
      )}
      role="tablist"
      aria-label="Page navigation tabs"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={clsx(
              'relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap',
              isActive
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            )}
          >
            <span>{tab.label}</span>

            {tab.badge != null && tab.badge > 0 && (
              <span
                className={clsx(
                  'ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-semibold leading-none',
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-200 text-gray-600'
                )}
              >
                {tab.badge > 99 ? '99+' : tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

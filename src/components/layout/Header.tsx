import React from 'react';
import { format } from 'date-fns';
import { Calendar, ChevronDown, Sparkles } from 'lucide-react';
import { useCommandBar } from '../CommandBar/CommandBarProvider';

interface HeaderProps {
  title: string;
  subtitle?: string;
  years?: number[];
  selectedYear?: number;
  onYearChange?: (year: number) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  years,
  selectedYear,
  onYearChange
}) => {
  const { open } = useCommandBar();

  return (
    <header className="bg-gradient-to-r from-primary-50 via-white to-secondary-50 border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Title section - add left padding on mobile for hamburger button */}
        <div className="pl-12 lg:pl-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="text-xs sm:text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>

        {/* Year selector, date display, and Ask AI */}
        <div className="flex items-center gap-4">
          {/* Year Dropdown */}
          {years && years.length > 0 && onYearChange && (
            <div className="relative">
              <select
                value={selectedYear}
                onChange={(e) => onYearChange(Number(e.target.value))}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-pointer"
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          )}

          {/* Date display */}
          <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{format(new Date(), 'dd MMM yyyy')}</span>
          </div>

          {/* Ask AI button */}
          <button
            onClick={() => open()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>
      </div>
    </header>
  );
};

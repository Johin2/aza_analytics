import React from 'react';
import { clsx } from 'clsx';
import { Calendar, MapPin } from 'lucide-react';

export interface DateFilterValue {
  year: number;
  month: number | null;
  outlet: string | null;
}

interface DateFilterBarProps {
  value: DateFilterValue;
  onChange: (value: DateFilterValue) => void;
  showOutletFilter?: boolean;
  outlets?: string[];
  className?: string;
}

const YEARS = [2022, 2023, 2024, 2025];

const MONTHS = [
  { value: null, label: 'All Months' },
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const selectBaseClasses =
  'appearance-none bg-white border border-gray-200 rounded-lg px-3 py-2 pr-8 text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors cursor-pointer hover:border-gray-300';

export const DateFilterBar: React.FC<DateFilterBarProps> = ({
  value,
  onChange,
  showOutletFilter = false,
  outlets = [],
  className,
}) => {
  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...value, year: Number(e.target.value) });
  };

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const raw = e.target.value;
    onChange({ ...value, month: raw === '' ? null : Number(raw) });
  };

  const handleOutletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const raw = e.target.value;
    onChange({ ...value, outlet: raw === '' ? null : raw });
  };

  return (
    <div
      className={clsx(
        'flex flex-wrap items-center gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-4 py-3',
        className
      )}
    >
      {/* Year selector */}
      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <div className="relative">
          <select
            value={value.year}
            onChange={handleYearChange}
            className={selectBaseClasses}
            aria-label="Select year"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <ChevronIcon />
        </div>
      </div>

      {/* Month selector */}
      <div className="relative">
        <select
          value={value.month ?? ''}
          onChange={handleMonthChange}
          className={selectBaseClasses}
          aria-label="Select month"
        >
          {MONTHS.map((m) => (
            <option key={m.label} value={m.value ?? ''}>
              {m.label}
            </option>
          ))}
        </select>
        <ChevronIcon />
      </div>

      {/* Outlet selector (optional) */}
      {showOutletFilter && outlets.length > 0 && (
        <>
          <div className="w-px h-6 bg-gray-200 hidden sm:block" />
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <div className="relative">
              <select
                value={value.outlet ?? ''}
                onChange={handleOutletChange}
                className={clsx(selectBaseClasses, 'max-w-[200px] truncate')}
                aria-label="Select outlet"
              >
                <option value="">All Outlets</option>
                {outlets.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
              <ChevronIcon />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

/** Small chevron indicator for custom select styling */
const ChevronIcon: React.FC = () => (
  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
    <svg
      className="h-4 w-4 text-gray-400"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z"
        clipRule="evenodd"
      />
    </svg>
  </div>
);

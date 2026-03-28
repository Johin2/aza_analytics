import React from 'react';
import { Calendar } from 'lucide-react';

const MONTH_LABELS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface DateFilterProps {
  selectedYear: number;
  selectedMonth: number;
  onYearChange: (year: number) => void;
  onMonthChange: (month: number) => void;
  availableYears?: number[];
}

const DateFilter: React.FC<DateFilterProps> = ({
  selectedYear,
  selectedMonth,
  onYearChange,
  onMonthChange,
  availableYears = [2025, 2024, 2023, 2022],
}) => {
  return (
    <div className="flex items-center gap-2">
      <Calendar className="w-4 h-4 text-gray-500" />
      <select
        value={selectedYear}
        onChange={(e) => onYearChange(Number(e.target.value))}
        className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
      >
        {availableYears.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <select
        value={selectedMonth}
        onChange={(e) => onMonthChange(Number(e.target.value))}
        className="bg-white border border-gray-300 rounded-lg px-3 py-1.5 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
      >
        <option value={0}>Full Year</option>
        {MONTH_LABELS.map((label, i) => (
          <option key={i + 1} value={i + 1}>{label}</option>
        ))}
      </select>
    </div>
  );
};

export default DateFilter;

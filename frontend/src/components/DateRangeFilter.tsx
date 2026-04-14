import { useMemo, useState } from 'react';

interface DateRangeFilterProps {
  onFilterChange: (startDate: string, endDate: string) => void;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

function getDefaultDates() {
  const today = new Date();
  const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
  return {
    today: today.toISOString().split('T')[0],
    thirtyDaysAgo: thirtyDaysAgo.toISOString().split('T')[0],
  };
}

export function DateRangeFilter({
  onFilterChange,
  defaultStartDate,
  defaultEndDate,
}: DateRangeFilterProps) {
  const defaults = useMemo(() => getDefaultDates(), []);
  const [startDate, setStartDate] = useState(defaultStartDate ?? defaults.thirtyDaysAgo);
  const [endDate, setEndDate] = useState(defaultEndDate ?? defaults.today);

  const isInvalid = startDate !== '' && endDate !== '' && startDate > endDate;

  const handleStartChange = (value: string) => {
    setStartDate(value);
    if (value && endDate && value <= endDate) {
      onFilterChange(value, endDate);
    }
  };

  const handleEndChange = (value: string) => {
    setEndDate(value);
    if (startDate && value && startDate <= value) {
      onFilterChange(startDate, value);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label htmlFor="start-date" className="text-sm font-medium text-gray-600">
        From
      </label>
      <input
        id="start-date"
        type="date"
        value={startDate}
        max={endDate || undefined}
        onChange={(e) => handleStartChange(e.target.value)}
        aria-invalid={isInvalid || undefined}
        className={`rounded-lg border bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
          isInvalid ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
        }`}
      />
      <label htmlFor="end-date" className="text-sm font-medium text-gray-600">
        To
      </label>
      <input
        id="end-date"
        type="date"
        value={endDate}
        min={startDate || undefined}
        onChange={(e) => handleEndChange(e.target.value)}
        aria-invalid={isInvalid || undefined}
        className={`rounded-lg border bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${
          isInvalid ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'
        }`}
      />
      {isInvalid && (
        <span role="alert" className="text-xs text-red-500">
          End date must be after start date
        </span>
      )}
    </div>
  );
}

import { useState } from 'react';

interface DateRangeFilterProps {
  onFilterChange: (startDate: string, endDate: string) => void;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

const TODAY = new Date().toISOString().split('T')[0];
const THIRTY_DAYS_AGO = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000)
  .toISOString()
  .split('T')[0];

export function DateRangeFilter({
  onFilterChange,
  defaultStartDate,
  defaultEndDate,
}: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState(defaultStartDate ?? THIRTY_DAYS_AGO);
  const [endDate, setEndDate] = useState(defaultEndDate ?? TODAY);

  const handleStartChange = (value: string) => {
    setStartDate(value);
    onFilterChange(value, endDate);
  };

  const handleEndChange = (value: string) => {
    setEndDate(value);
    onFilterChange(startDate, value);
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
        onChange={(e) => handleStartChange(e.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
      <label htmlFor="end-date" className="text-sm font-medium text-gray-600">
        To
      </label>
      <input
        id="end-date"
        type="date"
        value={endDate}
        onChange={(e) => handleEndChange(e.target.value)}
        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  );
}

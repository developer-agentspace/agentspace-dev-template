import { DateRangeFilter } from './components/DateRangeFilter';
import { logger } from './lib/logger';

export function App() {
  const handleFilterChange = (startDate: string, endDate: string) => {
    // In a real app, this would trigger data refetch via React Query
    logger.info('filter changed', { feature: 'demo-app', action: 'change-date-range', startDate, endDate });
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900">Agent Space</h1>
        <p className="mt-2 text-gray-600">Development template ready. Start building.</p>

        <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-800">Date Range Filter</h2>
          <DateRangeFilter onFilterChange={handleFilterChange} />
        </div>
      </div>
    </main>
  );
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { KpiCards } from './components/KpiCards';
import { QuarterlyChart } from './components/QuarterlyChart';
import { ProgressBars } from './components/ProgressBars';

const fetchDashboardData = async () => {
  // 1. Fetch Performance Data for 2026
  const { data: perfData, error: perfError } = await supabase
    .from('performance_data')
    .select('*')
    .eq('year', 2026);

  if (perfError) throw new Error(`Performance Data Error: ${perfError.message}`);

  // 2. Fetch Targets Data for 2026
  // Assuming temporary columns: indicator_id, year, annual_target
  const { data: targetsData, error: targetsError } = await supabase
    .from('targets')
    .select('*')
    .eq('year', 2026);

  if (targetsError) {
    // Only throw if it's NOT a 'relation does not exist' error, so the dashboard still renders without target table temporarily
    if (!targetsError.message.includes('does not exist')) {
       throw new Error(`Targets Data Error: ${targetsError.message}`);
    }
  }

  return {
    performanceData: perfData || [],
    targetsData: targetsData || [],
  };
};

export default function PerformanceDashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboard-data-2026'],
    queryFn: fetchDashboardData,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-500 font-medium animate-pulse">Aggregating Dashboard Data...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto p-4 mt-8 bg-red-50 text-red-700 rounded-xl border border-red-200 shadow-sm">
        <h3 className="font-bold text-lg mb-2">Dashboard Failed to Load</h3>
        <p className="text-sm bg-red-100 p-2 rounded">{error instanceof Error ? error.message : 'Unknown error'}</p>
        <p className="text-sm mt-4 text-red-600">
          Make sure your <strong>targets</strong> table exists in Supabase with at least `indicator_id`, `year`, and `annual_target` columns.
        </p>
      </div>
    );
  }

  const { performanceData, targetsData } = data || { performanceData: [], targetsData: [] };

  return (
    <div className="w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">CY 2026 Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your strategic targets and actual performance.</p>
        </div>
        <div className="px-3 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium rounded-full shrink-0">
          Live Data
        </div>
      </div>

      {/* KPI Cards Area */}
      <KpiCards performanceData={performanceData} targetsData={targetsData} />

      {/* Charts Area */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <QuarterlyChart performanceData={performanceData} />
        <ProgressBars performanceData={performanceData} targetsData={targetsData} />
      </div>
    </div>
  );
}

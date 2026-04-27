import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

// Define the TypeScript interface based on your database table
interface PerformanceData {
  id?: string; // Usually there's an ID
  indicator_id: string;
  year: number;
  q1: number | null;
  q2: number | null;
  q3: number | null;
  q4: number | null;
  annual: number | null;
}

// Fetch function
const fetchPerformanceData = async (): Promise<PerformanceData[]> => {
  const { data, error } = await supabase
    .from('performance_data')
    .select('*')
    .order('year', { ascending: false }); // Sort by newest year first

  if (error) {
    throw new Error(error.message);
  }

  return data || [];
};

export default function PerformanceDataTable() {
  // Use TanStack query to handle loading and error states automatically
  const { data: performanceData, isLoading, isError, error } = useQuery({
    queryKey: ['performance-data'],
    queryFn: fetchPerformanceData,
  });

  // Handle Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500 animate-pulse">Loading performance data...</p>
      </div>
    );
  }

  // Handle Error State
  if (isError) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
        <h3 className="font-semibold">Failed to load performance data</h3>
        <p className="text-sm">{error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  // Handle Empty Data State
  if (!performanceData || performanceData.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow border border-gray-200">
        <p>No performance data found in the database.</p>
      </div>
    );
  }

  // Display the data in a responsive table
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Performance Data Dashboard</h2>
      
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Indicator ID</th>
                <th className="px-6 py-3">Year</th>
                <th className="px-6 py-3 text-right">Q1</th>
                <th className="px-6 py-3 text-right">Q2</th>
                <th className="px-6 py-3 text-right">Q3</th>
                <th className="px-6 py-3 text-right">Q4</th>
                <th className="px-6 py-3 text-right font-bold">Annual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {performanceData.map((row, index) => (
                <tr key={row.id || index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{row.indicator_id}</td>
                  <td className="px-6 py-4">{row.year}</td>
                  <td className="px-6 py-4 text-right text-gray-500">{row.q1 ?? '-'}</td>
                  <td className="px-6 py-4 text-right text-gray-500">{row.q2 ?? '-'}</td>
                  <td className="px-6 py-4 text-right text-gray-500">{row.q3 ?? '-'}</td>
                  <td className="px-6 py-4 text-right text-gray-500">{row.q4 ?? '-'}</td>
                  <td className="px-6 py-4 text-right font-bold text-gray-900">{row.annual ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

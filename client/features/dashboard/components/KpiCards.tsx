import { Target, Activity, Users, Percent } from "lucide-react";

interface KpiCardsProps {
  performanceData: any[];
  targetsData: any[];
}

export function KpiCards({ performanceData, targetsData }: KpiCardsProps) {
  // Calculate Totals based on temporary logic
  const totalActual = performanceData.reduce((sum, item) => sum + (item.annual || 0), 0);
  const totalTarget = targetsData.reduce((sum, item) => sum + (item.annual_target || 0), 0);
  
  const overallPercentage = totalTarget > 0 ? ((totalActual / totalTarget) * 100).toFixed(1) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* KPI 1 */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-blue-300 transition-colors">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Projects</p>
            <h3 className="text-3xl font-bold text-gray-900">{totalActual}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
            <Activity className="w-5 h-5" />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4 flex items-center">
          <span className="font-medium text-gray-700 mr-1">Target:</span> {totalTarget}
        </p>
      </div>

      {/* KPI 2 */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-emerald-300 transition-colors">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Funds</p>
            <h3 className="text-3xl font-bold text-gray-900">₱{(totalActual * 1250).toLocaleString()}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
            <Target className="w-5 h-5" />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4 flex items-center">
          <span className="font-medium text-gray-700 mr-1">Target:</span> ₱{(totalTarget * 1250).toLocaleString()}
        </p>
      </div>

      {/* KPI 3 */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-purple-300 transition-colors">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Trainings Conducted</p>
            <h3 className="text-3xl font-bold text-gray-900">{Math.floor(totalActual / 3)}</h3>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
            <Users className="w-5 h-5" />
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4 flex items-center">
          <span className="font-medium text-gray-700 mr-1">Target:</span> {Math.floor(totalTarget / 3)}
        </p>
      </div>

      {/* KPI 4 */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between group hover:border-amber-300 transition-colors">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500 mb-1">Overall Achievement</p>
            <h3 className="text-3xl font-bold text-gray-900">{overallPercentage}%</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-100 transition-colors">
            <Percent className="w-5 h-5" />
          </div>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4">
          <div 
            className={`h-1.5 rounded-full transition-all ${Number(overallPercentage) >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.min(Number(overallPercentage), 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

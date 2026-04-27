interface ProgressBarsProps {
  performanceData: any[];
  targetsData: any[];
}

export function ProgressBars({ performanceData, targetsData }: ProgressBarsProps) {
  // Combine data by indicator_id
  const combined = performanceData.map(perf => {
    const target = targetsData.find(t => t.indicator_id === perf.indicator_id);
    const actual = perf.annual || 0;
    const goal = target?.annual_target || 100; // default to 100 if target not found to avoid div zero
    let percentage = (actual / goal) * 100;
    const displayPercentage = percentage;
    if (percentage > 100) percentage = 100; // cap width at 100%

    return {
      indicator_id: perf.indicator_id,
      actual,
      goal,
      percentage,
      displayPercentage
    };
  });

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm h-[380px] flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Annual Progress by Indicator</h3>
      <div className="flex-1 overflow-y-auto pr-2 space-y-6">
        {combined.map((item, index) => (
          <div key={item.indicator_id || index}>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-800">{item.indicator_id}</span>
              <span className="text-gray-500">
                <span className="text-gray-900 font-medium">{item.actual}</span> / {item.goal} 
                <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-semibold ${item.displayPercentage >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  {Math.round(item.displayPercentage)}%
                </span>
              </span>
            </div>
            {/* Tailwind Progress Bar */}
            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className={`h-2.5 rounded-full transition-all duration-700 ease-out ${item.displayPercentage >= 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                style={{ width: `${item.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
        {combined.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-gray-500 text-center">No indicator data available to display progress.</p>
          </div>
        )}
      </div>
    </div>
  );
}

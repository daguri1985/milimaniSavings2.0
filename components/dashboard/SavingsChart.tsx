'use client';

export interface MonthData {
  month: string;
  target: number;
  collected: number;
  status: 'Completed' | 'In Progress' | 'Pending';
}

interface SavingsChartProps {
  data?: MonthData[];
}

export default function SavingsChart({ data = [] }: SavingsChartProps) {
  console.log('[SavingsChart render] received data:', data);
  // Find the highest target dynamically to set bar scaling relative to the max month
  const maxVal = data.length > 0 
    ? Math.max(...data.map((d) => d.target)) 
    : 7800;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Savings Target Progression</h2>
          <p className="text-xs text-slate-500">Monthly breakdown for active members</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
          Aug – Dec Target
        </span>
      </div>

      <div className="space-y-4">
        {data.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-4">No progress data available yet.</p>
        ) : (
          data.map((item) => {
            const percentage = item.target > 0 ? Math.min(100, Math.round((item.collected / item.target) * 100)) : 0;
            const barWidthPercentage = maxVal > 0 ? Math.min(100, (item.collected / maxVal) * 100) : 0;

            return (
              <div key={item.month} className="space-y-1.5">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-700 font-bold">{item.month}</span>
                  <span className="text-slate-500">
                    KSh {item.collected.toLocaleString()} / KSh {item.target.toLocaleString()} ({percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      percentage >= 100 
                        ? 'bg-emerald-500' 
                        : percentage > 0 
                        ? 'bg-amber-500' 
                        : 'bg-slate-300'
                    }`}
                    style={{ width: `${barWidthPercentage}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
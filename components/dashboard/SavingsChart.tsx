'use client';

export interface MonthData {
  month: string;
  target: number;
  collected: number;
  status?: 'Completed' | 'In Progress' | 'Pending';
}

interface SavingsChartProps {
  data?: MonthData[];
}

export default function SavingsChart({ data = [] }: SavingsChartProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Savings Target Progression
          </h2>
          <p className="text-xs text-slate-500">
            Monthly breakdown for active members
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
          Aug – Dec Target
        </span>
      </div>

      <div className="space-y-5">
        {data.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-4">
            No progress data available yet.
          </p>
        ) : (
          data.map((item) => {
            const percentage =
              item.target > 0
                ? Math.min(100, Math.round((item.collected / item.target) * 100))
                : 0;

            // Bar fill width should reflect percentage towards the month's specific target
            const barWidthPercentage =
              item.target > 0
                ? Math.min(100, (item.collected / item.target) * 100)
                : 0;

            return (
              <div key={item.month} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-slate-900 font-bold">{item.month}</span>
                  <span className="text-slate-600">
                    KSh {item.collected.toLocaleString()} / KSh{' '}
                    {item.target.toLocaleString()}{' '}
                    <span
                      className={`font-bold ml-1 ${
                        percentage >= 100
                          ? 'text-emerald-600'
                          : percentage > 0
                          ? 'text-amber-600'
                          : 'text-slate-400'
                      }`}
                    >
                      ({percentage}%)
                    </span>
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
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
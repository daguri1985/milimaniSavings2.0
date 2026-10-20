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
  // Current month mapping (October = 10)
  const currentMonthNumber = 10;

  const monthMap: Record<string, number> = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
    'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12
  };

  let runningTotal = 0;
  const processedData = data.map((item) => {
    const monthNum = monthMap[item.month] || 0;
    
    // If the month is in the future (after October), do not accumulate collections
    if (monthNum > currentMonthNumber) {
      return {
        ...item,
        collected: 0,
        status: 'Pending' as const,
      };
    }

    runningTotal += item.collected;

    return {
      ...item,
      collected: runningTotal,
    };
  });

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Savings Target Progression
          </h2>
          <p className="text-xs text-slate-500">
            Monthly cumulative breakdown (Aug – Oct)
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
          Aug – Dec Target
        </span>
      </div>

      <div className="space-y-5">
        {processedData.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-4">
            No progress data available yet.
          </p>
        ) : (
          processedData.map((item) => {
            const monthNum = monthMap[item.month] || 0;
            const isFuture = monthNum > currentMonthNumber;

            const percentage =
              !isFuture && item.target > 0
                ? Math.min(100, Math.round((item.collected / item.target) * 100))
                : 0;

            const barWidthPercentage =
              !isFuture && item.target > 0
                ? Math.min(100, (item.collected / item.target) * 100)
                : 0;

            return (
              <div key={item.month} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-slate-900 font-bold flex items-center gap-1.5">
                    {item.month}
                    {isFuture && (
                      <span className="text-[10px] font-normal px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">
                        Upcoming
                      </span>
                    )}
                  </span>
                  <span className="text-slate-600">
                    {isFuture ? (
                      <span className="text-slate-400 italic">Target: KSh {item.target.toLocaleString()}</span>
                    ) : (
                      <>
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
                      </>
                    )}
                  </span>
                </div>

                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isFuture
                        ? 'bg-transparent'
                        : percentage >= 100
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
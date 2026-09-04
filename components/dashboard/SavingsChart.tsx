'use client';

interface MonthData {
  month: string;
  target: number;
  collected: number;
  status: 'Completed' | 'In Progress' | 'Pending';
}

const monthsData: MonthData[] = [
  { month: 'August', target: 5200, collected: 5200, status: 'Completed' },
  { month: 'September', target: 5200, collected: 0, status: 'In Progress' },
  { month: 'October', target: 5200, collected: 0, status: 'Pending' },
  { month: 'November', target: 5200, collected: 0, status: 'Pending' },
  { month: 'December', target: 7800, collected: 0, status: 'Pending' },
];

export default function SavingsChart() {
  const maxVal = 7800;

  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-slate-900">Savings Target Progression</h2>
          <p className="text-xs text-slate-500">Monthly breakdown for 13 members (KSh 100/week)</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md">
          Aug – Dec Target
        </span>
      </div>

      <div className="space-y-4">
        {monthsData.map((item) => {
          const percentage = item.target > 0 ? Math.round((item.collected / item.target) * 100) : 0;
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
                    percentage === 100 ? 'bg-emerald-500' : percentage > 0 ? 'bg-amber-500' : 'bg-slate-300'
                  }`}
                  style={{ width: `${(item.collected / maxVal) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
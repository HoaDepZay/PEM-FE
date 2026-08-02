import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface SpendingChartProps {
  chartData: ChartDataItem[];
  totalSpent: number;
  formatCurrency: (val: number) => string;
}

export const SpendingChart: React.FC<SpendingChartProps> = ({ chartData, totalSpent, formatCurrency }) => {
  return (
    <div className="space-y-4 pt-4">
      <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
        <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
        Cơ cấu chi tiêu
      </h3>
      
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        {chartData.length > 0 ? (
          <>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: any) => formatCurrency(Number(value))}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-6 space-y-3">
              {chartData.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="font-medium text-slate-700 text-sm">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-sm">{formatCurrency(item.value)}</span>
                    <span className="text-xs font-semibold text-slate-400 w-10 text-right">
                      {Math.round((item.value / totalSpent) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <PieChartIcon className="w-12 h-12 mb-3 opacity-20" />
            <p className="font-medium">Chưa có dữ liệu giao dịch</p>
          </div>
        )}
      </div>
    </div>
  );
};

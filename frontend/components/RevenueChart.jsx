import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const data = [
  { name: 'Appointments', value: 55 },
  { name: 'Subscriptions', value: 30 },
  { name: 'Consultations', value: 15 },
];

const COLORS = ['#0b4b67', '#475569', '#94a3b8'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 p-3 border border-gray-200 rounded-lg shadow-lg backdrop-blur-sm">
        <p className="font-semibold text-gray-800">{payload[0].name}</p>
        <p className="text-sm text-primary font-bold">{`Revenue: ${payload[0].value}%`}</p>
      </div>
    );
  }
  return null;
};


const RevenueChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-96 flex flex-col overflow-hidden">
      <h4 className="text-lg font-semibold text-gray-800">Revenue Breakdown by Source</h4>
      <div className="flex-grow flex flex-col items-center justify-center">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'transparent' }} />
          </PieChart>
        </ResponsiveContainer>
        <div className="w-full max-w-xs mx-auto space-y-2 mt-6">
          {data.map((entry, index) => (
            <div key={`item-${index}`} className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-gray-600 text-sm">{entry.name}</span>
              </div>
              <span className="font-bold text-gray-800 text-sm">{`${entry.value}%`}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;

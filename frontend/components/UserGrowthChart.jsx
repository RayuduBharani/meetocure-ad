import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const data = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  users: Math.floor(2000 + Math.sin(i / 4) * 1000 + Math.random() * 500),
}));

const UserGrowthChart = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-96 flex flex-col overflow-hidden">
      <h4 className="text-lg font-semibold mb-4 text-gray-800">User Growth Over Last 30 Days</h4>
      <div className="flex-grow">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0b4b67" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0b4b67" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
            <XAxis 
              dataKey="day" 
              tickFormatter={(tick) => `Day ${tick}`} 
              axisLine={false}
              tickLine={false}
              dy={10}
              tick={{ fill: '#6b7280' }} 
              />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280' }} 
              />
            <Tooltip 
               contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                  border: '1px solid #e0e0e0',
                  borderRadius: '0.5rem'
              }}
              />
            <Area type="monotone" dataKey="users" stroke="#0b4b67" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UserGrowthChart;

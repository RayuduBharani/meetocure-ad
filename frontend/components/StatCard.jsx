import React from 'react';

const StatCard = ({
  title,
  value,
  trendValue,
  trendPeriod,
  trendDirection,
  icon,
}) => {
  const trendColor = trendDirection === 'up' ? 'text-green-500' : 'text-red-500';

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <p className="text-sm text-gray-500 mb-2">{title}</p>
      <h3 className="text-3xl font-bold mb-3">{value}</h3>
      <div className="flex items-center text-sm">
        {icon && <div className="mr-1">{icon}</div>}
        {trendValue && <span className={`font-semibold mr-1 ${trendColor}`}>{trendValue}</span>}
        <span className="text-gray-500">{trendPeriod}</span>
      </div>
    </div>
  );
};

export default StatCard;

import React from 'react';

const healthData = [
    { service: 'API Services', status: 'Operational' },
    { service: 'Database', status: 'Operational' },
    { service: 'Payment Gateway', status: 'Monitoring' },
    { service: 'Video Consultations', status: 'Operational' },
];

const StatusIndicator = ({ status }) => {
    const color = status === 'Operational' ? 'bg-green-500' : 'bg-yellow-500';
    return <span className={`w-3 h-3 rounded-full ${color}`}></span>;
}

const SystemHealthStatus = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h4 className="text-lg font-semibold text-gray-800 mb-4">System Health Status</h4>
      <div className="space-y-3">
        {healthData.map(item => (
            <div key={item.service} className="flex justify-between items-center text-sm">
                <span className="text-gray-600">{item.service}</span>
                <div className="flex items-center gap-2">
                    <StatusIndicator status={item.status} />
                    <span className="font-semibold text-gray-700">{item.status}</span>
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};

export default SystemHealthStatus;

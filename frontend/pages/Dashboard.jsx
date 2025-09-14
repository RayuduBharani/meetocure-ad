import React from 'react';
import StatCard from '../components/StatCard.jsx';
import UserGrowthChart from '../components/UserGrowthChart.jsx';
import RevenueChart from '../components/RevenueChart.jsx';
import SystemHealthStatus from '../components/SystemHealthStatus.jsx';
import { ArrowUpIcon } from '../components/icons/ArrowUpIcon.jsx';
import { ArrowDownIcon } from '../components/icons/ArrowDownIcon.jsx';
import { UsersIcon } from '../components/icons/UsersIcon.jsx';
import { RewardIcon } from '../components/icons/RewardIcon.jsx';

const Dashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome, Admin! Here's a comprehensive overview of the platform.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Registered Users"
          value="12,345"
          trendValue="10%"
          trendPeriod="vs last month"
          trendDirection="up"
          icon={<ArrowUpIcon className="w-5 h-5 text-green-500" />}
        />
        <StatCard
          title="Appointments Booked Today"
          value="234"
          trendValue="5%"
          trendPeriod="vs yesterday"
          trendDirection="up"
          icon={<ArrowUpIcon className="w-5 h-5 text-green-500" />}
        />
        <StatCard
          title="Total Revenue This Month"
          value="$56,789"
          trendValue="2%"
          trendPeriod="vs last month"
          trendDirection="down"
          icon={<ArrowDownIcon className="w-5 h-5 text-red-500" />}
        />
         <StatCard
          title="Active Users (24h)"
          value="4,821"
          trendValue="1.2%"
          trendPeriod="vs yesterday"
          trendDirection="up"
          icon={<UsersIcon className="w-5 h-5 text-green-500" />}
        />
        <StatCard
          title="Wellness Rewards Claimed"
          value="1,256"
          trendValue="8%"
          trendPeriod="this week"
          trendDirection="up"
          icon={<RewardIcon className="w-5 h-5 text-green-500" />}
        />
        <StatCard
          title="Pending Doctor Verifications"
          value="15"
          trendPeriod="Waiting for approval"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <UserGrowthChart />
        </div>
        <div className="flex flex-col gap-6">
          <RevenueChart />
          <SystemHealthStatus />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

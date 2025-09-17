import React, { useState, useEffect } from 'react';
import StatCard from '../components/StatCard.jsx';
import { UsersIcon } from '../components/icons/UsersIcon.jsx';
import { DoctorIcon } from '../components/icons/DoctorIcon.jsx';
import { HospitalIcon } from '../components/icons/HospitalIcon.jsx';
import { AppointmentIcon } from '../components/icons/AppointmentIcon.jsx';
import { PencilIcon } from '../components/icons/PencilIcon.jsx';
import { ArrowUpIcon } from '../components/icons/ArrowUpIcon.jsx';
import { ArrowDownIcon } from '../components/icons/ArrowDownIcon.jsx';

const Dashboard = () => {
  const [stats, setStats] = useState({
    overview: {
      totalPatients: 0,
      totalDoctors: 0,
      totalHospitals: 0,
      pendingVerifications: 0
    },
    appointments: {
      today: 0,
      completed: 0,
      cancelled: 0,
      monthly: 0,
      successRate: 0
    },
    newRegistrations: {
      patients: 0,
      doctors: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8000/admin/stats/dashboard');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to fetch dashboard statistics');
        console.error('Error fetching stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-500">Welcome, Admin! Here's a comprehensive overview of the platform.</p>
      </div>
      
      {/* Platform Overview */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Platform Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Patients"
            value={stats.overview.totalPatients.toLocaleString()}
            icon={<UsersIcon className="w-5 h-5 text-blue-500" />}
            trendPeriod={`+${stats.newRegistrations.patients} today`}
          />
          <StatCard
            title="Total Doctors"
            value={stats.overview.totalDoctors.toLocaleString()}
            icon={<DoctorIcon className="w-5 h-5 text-green-500" />}
            trendPeriod={`+${stats.newRegistrations.doctors} today`}
          />
          <StatCard
            title="Total Hospitals"
            value={stats.overview.totalHospitals.toLocaleString()}
            icon={<HospitalIcon className="w-5 h-5 text-purple-500" />}
            trendPeriod="Registered Hospitals"
          />
          <StatCard
            title="Pending Verifications"
            value={stats.overview.pendingVerifications.toLocaleString()}
            icon={<PencilIcon className="w-5 h-5 text-red-500" />}
            trendPeriod="Doctor Verifications"
          />
        </div>
      </div>

      {/* Today's Activity */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Today's Activity</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Today's Appointments"
            value={stats.appointments.today.toLocaleString()}
            icon={<AppointmentIcon className="w-5 h-5 text-orange-500" />}
            trendPeriod="Total Today"
          />
          <StatCard
            title="Completed Appointments"
            value={stats.appointments.completed.toLocaleString()}
            icon={<ArrowUpIcon className="w-5 h-5 text-green-500" />}
            trendPeriod="Completed Today"
          />
          <StatCard
            title="Cancelled Appointments"
            value={stats.appointments.cancelled.toLocaleString()}
            icon={<ArrowDownIcon className="w-5 h-5 text-red-500" />}
            trendPeriod="Cancelled Today"
          />
          <StatCard
            title="Success Rate"
            value={`${stats.appointments.successRate}%`}
            icon={<AppointmentIcon className="w-5 h-5 text-blue-500" />}
            trendPeriod="Completion Rate"
          />
        </div>
      </div>


    </div>
  );
};

export default Dashboard;

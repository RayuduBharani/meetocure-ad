import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon } from './icons/HomeIcon.jsx';
import { DoctorIcon } from './icons/DoctorIcon.jsx';
import { HospitalIcon } from './icons/HospitalIcon.jsx';
import { PatientIcon } from './icons/PatientIcon.jsx';
import { AnalyticsIcon } from './icons/AnalyticsIcon.jsx';
import { ModerationIcon } from './icons/ModerationIcon.jsx';
import { SettingsIcon } from './icons/SettingsIcon.jsx';
import { AppointmentIcon } from './icons/AppointmentIcon.jsx';
import { LogoutIcon } from './icons/LogoutIcon.jsx';
import ConfirmModal from './ConfirmModal.jsx';

const navItems = [
  { name: 'Dashboard', icon: HomeIcon, path: '/dashboard' },
  { name: 'Doctors', icon: DoctorIcon, path: '/doctors' },
  { name: 'Hospitals', icon: HospitalIcon, path: '/hospitals' },
  { name: 'Patients', icon: PatientIcon, path: '/patients' },
  { name: 'Appointments', icon: AppointmentIcon, path: '/appointments' },
  // { name: 'Analytics', icon: AnalyticsIcon, path: '/analytics' },
  // { name: 'Moderation', icon: ModerationIcon, path: '/moderation' },
  { name: 'Settings', icon: SettingsIcon, path: '/settings' },
];

const NavItem = ({ name, icon: Icon, path }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const isActive = location.pathname === path;

    return (
        <li
            className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors ${
                isActive ? 'bg-sidebar-active text-white' : 'text-gray-300 hover:bg-white/10 hover:text-white'
            }`}
            onClick={() => navigate(path)}
        >
            <Icon className="w-6 h-6 mr-4" />
            <span className="font-medium">{name}</span>
        </li>
    );
};

const Sidebar = ({ onLogout }) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  const handleLogoutCancel = () => {
    setShowLogoutModal(false);
  };

  return (
    <aside className="w-64 bg-sidebar-bg text-white flex flex-col p-4">
      <div className="flex items-center mb-10 p-2">
         <div className="w-10 h-10 mr-3 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-xl">
            M
         </div>
        <h1 className="text-xl font-bold">MeetoCure</h1>
      </div>
      <nav className="flex-grow">
        <ul>
            {navItems.map((item) => (
                <NavItem 
                    key={item.name}
                    name={item.name}
                    icon={item.icon}
                    path={item.path}
                />
            ))}
        </ul>
      </nav>
      <div className="mt-auto">
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center p-3 my-1 rounded-lg cursor-pointer transition-colors text-gray-300 hover:bg-red-500/20 hover:text-red-300 border-t border-white/10 pt-4"
        >
          <LogoutIcon className="w-6 h-6 mr-4" />
          <span className="font-medium">Logout</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={handleLogoutCancel}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to sign in again to access the admin dashboard."
        confirmText="Logout"
        cancelText="Cancel"
      />
    </aside>
  );
};

export default Sidebar;

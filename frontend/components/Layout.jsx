import React, { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const currentPage = location.pathname.substring(1) || 'dashboard';

  const handleLogout = () => {
    logout();
    setSearchQuery('');
  };

  const childrenWithProps = React.Children.map(
    <Outlet />,
    (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, { searchQuery });
      }
      return child;
    }
  );

  return (
    <div className="flex h-screen bg-main-bg text-gray-800 font-sans">
      <Sidebar onLogout={handleLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} user={user} /> */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-main-bg">
          {childrenWithProps}
        </main>
      </div>
    </div>
  );
};

export default Layout;
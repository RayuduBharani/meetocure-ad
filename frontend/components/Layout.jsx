import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const [user, setUser] = useState({ name: 'Admin User', email: 'admin@meetocure.com' });
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const currentPage = location.pathname.substring(1) || 'dashboard';

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('meetocure_admin_user');
    navigate('/');
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
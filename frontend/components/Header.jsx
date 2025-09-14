import React from 'react';
import { SearchIcon } from './icons/SearchIcon.jsx';
import { NotificationBellIcon } from './icons/NotificationBellIcon.jsx';

const Header = ({ searchQuery, setSearchQuery, user }) => {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center z-10">
      <div className="relative flex-1 max-w-xl">
        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border bg-gray-50 border-gray-200 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary w-full"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="w-5 h-5 text-gray-400" />
        </div>
      </div>
      <div className="flex items-center ml-6">
        <button className="relative text-gray-500 hover:text-gray-700 focus:outline-none">
          <NotificationBellIcon className="w-6 h-6" />
          <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="ml-6 flex items-center">
            <img src="https://i.pravatar.cc/40?img=1" alt={user?.name || "Admin User"} className="w-10 h-10 rounded-full" />
            <div className="ml-3 hidden sm:block">
                <p className="text-sm font-semibold text-gray-800">{user?.name || "Admin User"}</p>
                <p className="text-xs text-gray-500">{user?.email || "admin@meetocure.com"}</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

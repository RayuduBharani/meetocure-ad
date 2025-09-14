import React from 'react';

const Badge = ({ text, type }) => {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold';
  
  const typeClasses = {
    success: 'bg-status-green-bg text-status-green-text',
    warning: 'bg-status-yellow-bg text-status-yellow-text',
    danger: 'bg-status-red-bg text-status-red-text',
    default: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={`${baseClasses} ${typeClasses[type]}`}>
      <span className={`h-2 w-2 mr-2 rounded-full ${
        type === 'success' ? 'bg-green-500' :
        type === 'warning' ? 'bg-yellow-500' :
        type === 'danger' ? 'bg-red-500' : 'bg-gray-400'
      }`}></span>
      {text}
    </span>
  );
};

export default Badge;

import React from 'react';

const InfoCard = ({ icon: Icon, label, value = 0, color = "bg-blue-500" }) => {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg bg-white/60 shadow-sm">
      <div className={`flex items-center justify-center w-8 h-8 ${color} rounded-full`}>
        {Icon && <Icon className="text-white text-lg" />}
      </div>
      <div>
        <span className="block text-lg font-bold text-gray-900">{value}</span>
        <span className="block text-xs text-gray-500">{label}</span>
      </div>
    </div>
  );
};

export default InfoCard;
import React from 'react';

export default function TenantMetrics({ totalRent, activeRentalsCount }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Monthly Rent</p>
        <h3 className="text-3xl font-bold text-gray-900">₹{totalRent.toLocaleString()}</h3>
        <p className="text-xs text-gray-400 mt-2">Across {activeRentalsCount} active rental{activeRentalsCount !== 1 && 's'}</p>
      </div>
      <div className="bg-red-50 border border-red-100 p-5 rounded-xl shadow-sm">
        <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Pending Dues</p>
        <h3 className="text-3xl font-bold text-red-700">₹0</h3>
        <p className="text-xs text-red-500/70 mt-2">All clear for this month</p>
      </div>
      <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Active Complaints</p>
        <h3 className="text-3xl font-bold text-gray-900">0</h3>
        <p className="text-xs text-gray-400 mt-2">No open maintenance tickets</p>
      </div>
    </div>
  );
}
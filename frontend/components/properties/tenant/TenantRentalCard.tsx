import React from 'react';

export default function TenantRentalCard({ rental, openPayModal, openLedgerModal }: any) {
  const isCluster = !!rental.cluster_id;
  const propertyDetails = isCluster ? rental.clusters?.properties : rental.rooms?.properties;
  const unitName = isCluster ? `Cluster: ${rental.clusters?.name}` : `Room: ${rental.rooms?.room_number}`;
  
  // Calculate next due date (1 month after start date)
  const startDate = new Date(rental.start_date);
  const nextDueDate = rental.start_date 
    ? new Date(startDate.setMonth(startDate.getMonth() + 1)).toLocaleDateString() 
    : 'N/A';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-[#1c6456]"></div>
      
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{propertyDetails?.name || 'Unknown Property'}</h2>
          <p className="text-sm text-gray-500 mt-1">{propertyDetails?.address}</p>
        </div>
        <span className="bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
          {rental.status}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-y-5 gap-x-4 border-t border-gray-100 pt-5">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Unit</p>
          <p className="font-semibold text-gray-900">{unitName}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Start Date</p>
          <p className="font-semibold text-gray-900">{new Date(rental.start_date).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Security Deposit</p>
          <p className="font-semibold text-gray-900">₹{rental.deposit_amount}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Next Due</p>
          <p className="font-semibold text-red-600">{nextDueDate}</p>
        </div>
      </div>

      {/* New Action Buttons */}
      <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
        <button 
          onClick={() => openLedgerModal(rental)}
          className="flex-1 bg-gray-50 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors border border-gray-200"
        >
          View Ledger
        </button>
        <button 
          onClick={() => openPayModal(rental)}
          className="flex-1 bg-[#1c6456] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#144f43] transition-colors shadow-sm"
        >
          Pay Rent
        </button>
      </div>
    </div>
  );
}
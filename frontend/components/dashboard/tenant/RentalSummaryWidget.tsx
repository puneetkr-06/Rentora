import React from 'react';
import Link from 'next/link';

export default function RentalSummaryWidget({ rentals }: any) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-900">My Rentals Summary</h3>
        <Link href="/properties" className="text-xs font-medium text-[#1c6456] hover:underline">
          View All Details →
        </Link>
      </div>
      
      <div className="p-5 flex-1 overflow-y-auto space-y-4">
        {rentals.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No active rentals found.</p>
        ) : (
          rentals.map((rental: any) => {
            const propertyDetails = rental.rooms?.properties;
            const unitName = `Room: ${rental.rooms?.room_number}`;
            
            const startDate = new Date(rental.start_date);
            const nextDueDate = rental.start_date 
              ? new Date(startDate.setMonth(startDate.getMonth() + 1)).toLocaleDateString() 
              : 'N/A';

            return (
              <div key={rental.id} className="flex justify-between items-center p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                <div>
                  <h4 className="font-bold text-sm text-gray-900">{propertyDetails?.name || 'Unknown Property'}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{unitName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm text-gray-900">₹{rental.deposit_amount}</p>
                  <p className="text-[10px] font-bold text-red-500 mt-0.5 uppercase tracking-wider">Due: {nextDueDate}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
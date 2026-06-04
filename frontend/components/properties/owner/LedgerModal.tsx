import React from 'react';

export default function LedgerModal({ isOpen, setIsLedgerModalOpen, selectedRoom, tenant, activeLease }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
      <div className="bg-white p-6 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Payment Ledger</h2>
            <p className="text-sm text-gray-500">Room {selectedRoom?.room_number} • Tenant: {tenant?.full_name || 'N/A'}</p>
          </div>
          <button onClick={() => setIsLedgerModalOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
           <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
             <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Due</p>
             <p className="text-lg font-bold text-gray-900">₹0</p>
           </div>
           <div className="bg-green-50 p-4 rounded-lg border border-green-200">
             <p className="text-xs text-green-700 font-bold uppercase tracking-wider mb-1">Total Paid</p>
             <p className="text-lg font-bold text-green-900">₹0</p>
           </div>
           <div className="bg-white p-4 rounded-lg border border-[#1c6456]/30">
             <p className="text-xs text-[#1c6456] font-bold uppercase tracking-wider mb-1">Next Billing Date</p>
             <p className="text-lg font-bold text-[#1c6456]">
               {activeLease?.start_date ? new Date(new Date(activeLease.start_date).setMonth(new Date(activeLease.start_date).getMonth() + 1)).toLocaleDateString() : 'N/A'}
             </p>
           </div>
        </div>
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="p-3 font-semibold">Billing Cycle</th>
                <th className="p-3 font-semibold">Due Date</th>
                <th className="p-3 font-semibold">Amount</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold">Payment Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Payment history will appear here once the first invoice is generated.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-6 flex justify-end">
           <button className="bg-[#1c6456] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#144f43]">
             + Record Manual Payment
           </button>
        </div>
      </div>
    </div>
  );
}
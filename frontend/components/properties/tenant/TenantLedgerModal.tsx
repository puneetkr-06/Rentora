import React from 'react';

export default function TenantLedgerModal({ isOpen, setIsOpen, rental }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Ledger</h2>
            <p className="text-sm text-gray-500 mt-1">Payment history and upcoming dues</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
           <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
             <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Rent Paid</p>
             <p className="text-lg font-bold text-gray-900">₹0</p>
           </div>
           <div className="bg-red-50 p-4 rounded-xl border border-red-100">
             <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1">Pending Dues</p>
             <p className="text-lg font-bold text-red-700">₹0</p>
           </div>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="p-4 font-semibold">Month</th>
                <th className="p-4 font-semibold">Due Date</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Future Mapping of actual invoices will go here */}
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500 bg-white">
                  Your billing history will appear here once the first invoice is generated.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
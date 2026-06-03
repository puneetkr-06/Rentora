import React from 'react';

export default function OwnerBilling() {
  const ledger = [
    { tenant: 'Aarav Mehta', room: 'A-204', amount: '₹18,500', due: '10 Jun' },
    { tenant: 'Priya Nair', room: 'B-118', amount: '₹21,200', due: '10 Jun' },
    { tenant: 'Ishaan Rao', room: 'C-302', amount: '₹17,900', due: '08 Jun' }
  ];

  return (
    <div className="pt-2 max-w-6xl mx-auto bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-200 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900 text-base">Invoices</h3>
        <button className="px-3.5 py-2 text-xs font-semibold bg-[#1c6456] text-white rounded-lg hover:bg-[#144f43] transition-colors shadow-sm">
          📄 Generate
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70">
              <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">Tenant</th>
              <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">Room</th>
              <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">Amount</th>
              <th className="py-3 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200">Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {ledger.map((row, index) => (
              <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-4 px-6 text-sm font-semibold text-gray-900">{row.tenant}</td>
                <td className="py-4 px-6 text-sm text-gray-500 font-medium">{row.room}</td>
                <td className="py-4 px-6 text-sm font-bold text-gray-900">{row.amount}</td>
                <td className="py-4 px-6 text-sm font-semibold text-gray-700">
                  <span className="bg-gray-100 px-2 py-1 rounded text-xs border border-gray-200/60">{row.due}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
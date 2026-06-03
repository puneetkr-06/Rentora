import React from 'react';

export default function BillingPage() {
  const invoices = [
    { id: 1, title: 'June rent', desc: 'Due 10 Jun', amount: '₹18,500', status: 'Pending' },
    { id: 2, title: 'Electricity', desc: '72 units', amount: '₹1,340', status: 'Pending' },
    { id: 3, title: 'May rent', desc: 'Paid 09 May', amount: '₹18,500', status: 'Paid' },
  ];

  return (
    <div className="pt-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payments</h1>
      
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">My invoices</h3>
          <button className="px-4 py-2 text-sm bg-[#1c6456] text-white rounded-lg hover:bg-[#144f43] font-medium transition-colors">
            Pay now
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 border-b border-gray-200">Invoice</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 border-b border-gray-200">Details</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 border-b border-gray-200">Amount</th>
                <th className="py-3 px-6 text-xs font-semibold text-gray-500 border-b border-gray-200">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6 text-sm font-medium text-gray-900">{inv.title}</td>
                  <td className="py-4 px-6 text-sm text-gray-500">{inv.desc}</td>
                  <td className="py-4 px-6 text-sm font-semibold text-gray-900">{inv.amount}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-md ${
                      inv.status === 'Paid' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-orange-50 text-orange-700 border border-orange-200'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
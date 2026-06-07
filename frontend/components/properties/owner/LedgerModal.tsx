import React, { useState, useEffect } from 'react';
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function LedgerModal({ isOpen, setIsLedgerModalOpen, selectedRoom, tenant, activeLease }: any) {
  const [ledger, setLedger] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && activeLease) {
      const fetchLedger = async () => {
        const token = localStorage.getItem('rentora_token');
        const res = await fetch(`${API_URL}/payments/ledger/${activeLease.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success') setLedger(data.ledger);
      };
      fetchLedger();
    }
  }, [isOpen, activeLease]);

  if (!isOpen) return null;

  const totalPaid = ledger.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
      <div className="bg-white p-6 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Payment Ledger</h2>
            <p className="text-sm text-gray-500">Tenant: {tenant?.full_name || 'N/A'}</p>
          </div>
          <button onClick={() => setIsLedgerModalOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
        </div>
        
        <div className="bg-green-50 p-4 rounded-xl border border-green-200 mb-6 w-1/3">
           <p className="text-xs text-green-700 font-bold uppercase tracking-wider mb-1">Total Rent Collected</p>
           <p className="text-xl font-bold text-green-900">₹{totalPaid}</p>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="p-3 font-semibold">Type</th>
                <th className="p-3 font-semibold">Billed On</th>
                <th className="p-3 font-semibold">Amount</th>
                <th className="p-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ledger.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No payment history yet.</td></tr>
              ) : (
                ledger.map((inv: any) => (
                  <tr key={inv.id}>
                    <td className="p-3 font-medium text-gray-900">{inv.type}</td>
                    <td className="p-3 text-gray-500">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="p-3 font-bold text-gray-900">₹{inv.amount}</td>
                    <td className="p-3">
                      <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
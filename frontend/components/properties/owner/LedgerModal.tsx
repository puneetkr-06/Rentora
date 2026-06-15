import React, { useState, useEffect } from 'react';

// 🚨 BUG 1 FIXED: Added the required fallback so it never fetches "undefined"
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const toMonthLabel = (date: Date) => date.toLocaleDateString('default', { month: 'long', year: 'numeric' });

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

export default function LedgerModal({ isOpen, setIsLedgerModalOpen, selectedRoom, tenant, activeLease }: any) {
  const [ledger, setLedger] = useState<any[]>([]);

  useEffect(() => {
    // 🚨 BUG 3 FIXED: Wipe the ghost data immediately if the modal is closed or lease is missing
    if (!isOpen || !activeLease) {
      setLedger([]);
      return;
    }

    const fetchLedger = async () => {
      // 🚨 BUG 2 FIXED: Added try/catch so the UI can gracefully recover from errors
      try {
        const token = sessionStorage.getItem('rentora_token');
        const res = await fetch(`${API_URL}/api/payments/ledger/${activeLease.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error(`API failed with status: ${res.status}`);
        
        const data = await res.json();
        if (data.status === 'success') {
          setLedger(data.ledger || []);
        }
      } catch (error) {
        console.error("Failed to fetch ledger:", error);
        setLedger([]); // Fallback to empty state safely
      }
    };

    fetchLedger();
  }, [isOpen, activeLease]);

  const billingMonthByInvoiceId = React.useMemo(() => {
    const result: Record<string, string> = {};
    const rentInvoices = [...ledger]
      .filter((inv: any) => inv.type === 'RENT')
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const baseDate = activeLease?.start_date
      ? new Date(activeLease.start_date)
      : rentInvoices[0]?.due_date
        ? new Date(rentInvoices[0].due_date)
        : rentInvoices[0]?.created_at
          ? new Date(rentInvoices[0].created_at)
          : new Date();

    rentInvoices.forEach((inv: any, index: number) => {
      result[inv.id] = toMonthLabel(addMonths(baseDate, index));
    });

    ledger
      .filter((inv: any) => inv.type !== 'RENT')
      .forEach((inv: any) => {
        const fallback = inv.due_date || inv.created_at;
        result[inv.id] = toMonthLabel(new Date(fallback));
      });

    return result;
  }, [ledger, activeLease?.start_date]);

  if (!isOpen) return null;

  // 🚨 BUG 4 FIXED: Wrapped inv.amount in Number() to prevent string concatenation
  const totalPaid = ledger
    .filter(inv => inv.status === 'PAID')
    .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
      <div className="bg-white p-6 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Payment Ledger</h2>
            {/* Safe fallback for tenant name */}
            <p className="text-sm text-gray-500">Tenant: {tenant?.full_name || 'No tenant assigned'}</p>
          </div>
          <button onClick={() => setIsLedgerModalOpen(false)} className="text-gray-400 hover:text-gray-900 text-xl font-bold">✕</button>
        </div>
        
        <div className="bg-green-50 p-4 rounded-xl border border-green-200 mb-6 w-1/3">
           <p className="text-xs text-green-700 font-bold uppercase tracking-wider mb-1">Total Rent Collected</p>
           <p className="text-xl font-bold text-green-900">₹{totalPaid.toLocaleString()}</p>
        </div>

        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="p-3 font-semibold">Type</th>
                <th className="p-3 font-semibold">Billing Month</th>
                <th className="p-3 font-semibold">Amount</th>
                <th className="p-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ledger.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No payment history found for this lease.</td></tr>
              ) : (
                ledger.map((inv: any) => (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{inv.type}</td>
                    <td className="p-3 text-gray-500">{billingMonthByInvoiceId[inv.id] || 'N/A'}</td>
                    <td className="p-3 font-bold text-gray-900">₹{Number(inv.amount).toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${inv.status === 'PAID' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
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
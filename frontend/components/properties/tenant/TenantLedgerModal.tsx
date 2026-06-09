import React, { useState, useEffect } from 'react';
const API_URL = process.env.NEXT_PUBLIC_API_URL;

const toMonthLabel = (date: Date) => date.toLocaleDateString('default', { month: 'long', year: 'numeric' });

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

export default function TenantLedgerModal({ isOpen, setIsOpen, rental }: any) {
  const [ledger, setLedger] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen && rental) {
      const fetchLedger = async () => {
        const token = localStorage.getItem('rentora_token');
        const res = await fetch(`${API_URL}/payments/ledger/${rental.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success') setLedger(data.ledger);
      };
      fetchLedger();
    }
  }, [isOpen, rental]);

  const billingMonthByInvoiceId = React.useMemo(() => {
    const result: Record<string, string> = {};
    const rentInvoices = [...ledger]
      .filter((inv: any) => inv.type === 'RENT')
      .sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    const baseDate = rental?.start_date
      ? new Date(rental.start_date)
      : rentInvoices[0]?.due_date
        ? new Date(rentInvoices[0].due_date)
        : rentInvoices[0]?.created_at
          ? new Date(rentInvoices[0].created_at)
          : new Date();

    rentInvoices.forEach((inv: any, index: number) => {
      result[inv.id] = toMonthLabel(addMonths(baseDate, index));
    });

    // Fallback for non-rent items.
    ledger
      .filter((inv: any) => inv.type !== 'RENT')
      .forEach((inv: any) => {
        const fallback = inv.due_date || inv.created_at;
        result[inv.id] = toMonthLabel(new Date(fallback));
      });

    return result;
  }, [ledger, rental?.start_date]);

  if (!isOpen) return null;

  const totalPaid = ledger.filter(inv => inv.status === 'PAID').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">My Ledger</h2>
            <p className="text-sm text-gray-500 mt-1">Payment history for this rental</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
        </div>

        <div className="bg-green-50 p-4 rounded-xl border border-green-200 mb-6 w-1/3">
           <p className="text-xs text-green-700 font-bold uppercase tracking-wider mb-1">Total Rent Paid</p>
           <p className="text-xl font-bold text-green-900">₹{totalPaid}</p>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="p-4 font-semibold">Type</th>
                <th className="p-4 font-semibold">Billing Month</th>
                <th className="p-4 font-semibold">Amount</th>
                <th className="p-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {ledger.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-500">No payment history yet.</td></tr>
              ) : (
                ledger.map((inv: any) => (
                  <tr key={inv.id}>
                    <td className="p-4 font-medium text-gray-900">{inv.type}</td>
                    <td className="p-4 text-gray-500">{billingMonthByInvoiceId[inv.id] || 'N/A'}</td>
                    <td className="p-4 font-bold text-gray-900">₹{inv.amount}</td>
                    <td className="p-4">
                      <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded text-xs font-bold uppercase">
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
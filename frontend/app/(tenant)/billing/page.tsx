"use client";

import React, { useState, useEffect } from 'react';

const monthLabel = (date: Date) => date.toLocaleDateString('default', { month: 'long', year: 'numeric' });

const addMonths = (date: Date, months: number) => {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
};

export default function TenantBillingPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('rentora_token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(`${API_URL}/payments/tenant-history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.status === 'success') setPayments(data.payments);
      } catch (err) {
        console.error("Error fetching payments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // Billing month rule per lease:
  // 1) first payment => lease start month
  // 2) each next payment => previous billing month + 1
  const billingMonthByPaymentId = React.useMemo(() => {
    const byLease: Record<string, any[]> = {};
    const result: Record<string, string> = {};

    for (const payment of payments) {
      const leaseId = payment.invoices?.leases?.id;
      if (!leaseId) {
        const fallbackDate = payment.invoices?.due_date || payment.payment_date;
        result[payment.id] = monthLabel(new Date(fallbackDate));
        continue;
      }

      if (!byLease[leaseId]) byLease[leaseId] = [];
      byLease[leaseId].push(payment);
    }

    Object.values(byLease).forEach((leasePayments) => {
      const sortedAsc = [...leasePayments].sort(
        (a, b) => new Date(a.payment_date).getTime() - new Date(b.payment_date).getTime()
      );

      const startDateStr = sortedAsc[0]?.invoices?.leases?.start_date;
      const baseMonth = startDateStr ? new Date(startDateStr) : new Date(sortedAsc[0]?.invoices?.due_date || sortedAsc[0]?.payment_date);

      sortedAsc.forEach((payment, index) => {
        result[payment.id] = monthLabel(addMonths(baseMonth, index));
      });
    });

    return result;
  }, [payments]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading payment history...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Payment History</h1>
        <p className="text-sm text-gray-500 mt-1">Review your past rent and utility transactions.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Property</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Billing Month</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Date Paid</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Amount</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No payment history found.</td></tr>
              ) : (
                payments.map((payment) => {
                  const isCluster = !!payment.invoices?.leases?.clusters;
                  const propertyName = isCluster 
                    ? payment.invoices?.leases?.clusters?.properties?.name 
                    : payment.invoices?.leases?.rooms?.properties?.name;
                  const billingMonth = billingMonthByPaymentId[payment.id] || 'N/A';

                  return (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{propertyName || 'N/A'}</td>
                      <td className="p-4 text-gray-600">{billingMonth}</td>
                      <td className="p-4 text-gray-500">{new Date(payment.payment_date).toLocaleDateString()}</td>
                      <td className="p-4 font-bold text-gray-900">₹{payment.amount_paid}</td>
                      <td className="p-4">
                        <span className="bg-green-50 text-green-700 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                          Successful
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
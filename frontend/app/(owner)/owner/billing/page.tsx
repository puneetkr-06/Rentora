"use client";

import React, { useState, useEffect } from 'react';

export default function OwnerBillingPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertyFilter, setPropertyFilter] = useState('ALL');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('rentora_token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
        
        const res = await fetch(`${API_URL}/payments/owner-history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.status === 'success') setPayments(data.payments);
      } catch (err) {
        console.error("Error fetching billing history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // 1. Extract Unique Property Names for the Dropdown Filter
  const uniqueProperties = Array.from(new Set(payments.map(p => {
    const isCluster = !!p.invoices?.leases?.clusters;
    return isCluster 
      ? p.invoices?.leases?.clusters?.properties?.name 
      : p.invoices?.leases?.rooms?.properties?.name;
  }))).filter(Boolean);

  // 2. Apply the Filter
  const filteredPayments = propertyFilter === 'ALL' 
    ? payments 
    : payments.filter(p => {
        const isCluster = !!p.invoices?.leases?.clusters;
        const propName = isCluster 
          ? p.invoices?.leases?.clusters?.properties?.name 
          : p.invoices?.leases?.rooms?.properties?.name;
        return propName === propertyFilter;
      });

  if (loading) return <div className="p-8 text-center text-gray-500">Loading collection history...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rent Collection</h1>
          <p className="text-sm text-gray-500 mt-1">Track all payments received across your portfolio.</p>
        </div>
        
        {/* THE PROPERTY FILTER */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filter By:</span>
          <select 
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            className="border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#1c6456]/20"
          >
            <option value="ALL">All Properties</option>
            {uniqueProperties.map((name: any) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
              <tr>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Tenant</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Unit</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Property</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Amount</th>
                <th className="p-4 font-semibold uppercase tracking-wider text-xs">Date Paid</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPayments.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-500">No payments found matching criteria.</td></tr>
              ) : (
                filteredPayments.map((payment) => {
                  const isCluster = !!payment.invoices?.leases?.clusters;
                  const propertyName = isCluster 
                    ? payment.invoices?.leases?.clusters?.properties?.name 
                    : payment.invoices?.leases?.rooms?.properties?.name;
                  const unitName = isCluster 
                    ? `Cluster: ${payment.invoices?.leases?.clusters?.name}`
                    : `Room: ${payment.invoices?.leases?.rooms?.room_number}`;
                  const tenantName = payment.invoices?.leases?.users?.full_name || 'Unknown Tenant';

                  return (
                    <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{tenantName}</td>
                      <td className="p-4 text-gray-600">{unitName}</td>
                      <td className="p-4 text-gray-500">{propertyName || 'N/A'}</td>
                      <td className="p-4 font-bold text-green-700">₹{payment.amount_paid}</td>
                      <td className="p-4 text-gray-500">{new Date(payment.payment_date).toLocaleDateString()}</td>
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
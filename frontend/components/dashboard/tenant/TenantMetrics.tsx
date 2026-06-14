"use client";
import React, { useState, useEffect } from 'react';

export default function TenantMetrics({ totalRent, activeRentalsCount, openComplaints }: any) {
  const [pendingDues, setPendingDues] = useState<number | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('rentora_token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL;
        
        const res = await fetch(`${API_URL}/api/payments/metrics/tenant`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.status === 'success') {
          setPendingDues(data.pendingDues);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchMetrics();
  }, []);

  // Determine styles based on if they owe money
  const isOwed = pendingDues !== null && pendingDues > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* 1. TOTAL RENT */}
      <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Monthly Rent</p>
        <h3 className="text-3xl font-bold text-gray-900">₹{totalRent?.toLocaleString() || 0}</h3>
        <p className="text-xs text-gray-400 mt-2">Across {activeRentalsCount || 0} active rental{activeRentalsCount !== 1 && 's'}</p>
      </div>

      {/* 2. PENDING DUES (Auto-updates color based on debt!) */}
      <div className={`${isOwed ? 'bg-red-50 border-red-100' : 'bg-green-50 border-green-100'} border p-5 rounded-xl shadow-sm transition-colors`}>
        <p className={`text-xs font-bold ${isOwed ? 'text-red-600' : 'text-green-700'} uppercase tracking-wider mb-1`}>
          Pending Dues
        </p>
        <h3 className={`text-3xl font-bold ${isOwed ? 'text-red-700' : 'text-green-800'}`}>
          {pendingDues === null ? '...' : `₹${pendingDues.toLocaleString()}`}
        </h3>
        <p className={`text-xs ${isOwed ? 'text-red-500' : 'text-green-600'} mt-2 font-medium`}>
          {pendingDues === null 
            ? 'Calculating...' 
            : isOwed 
            ? 'Historical rent calculated & pending' 
            : 'All clear for this month!'}
        </p>
      </div>

      {/* 3. COMPLAINTS */}
      <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Active Complaints</p>
        <h3 className="text-3xl font-bold text-gray-900">{openComplaints ?? 0}</h3>
        <p className="text-xs text-gray-400 mt-2">{openComplaints > 0 ? 'Open maintenance tickets' : 'No open maintenance tickets'}</p>
      </div>
    </div>
  );
}
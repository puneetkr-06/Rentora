"use client";

import React, { useState, useEffect } from 'react';
import TenantMetrics from '@/components/dashboard/tenant/TenantMetrics';
import RentalSummaryWidget from '@/components/dashboard/tenant/RentalSummaryWidget';
import NoticeBoardWidget from '@/components/dashboard/tenant/NoticeBoardWidget';
import Link from 'next/link';

export default function TenantDashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [rentals, setRentals] = useState<any[]>([]);
  const [totalRent, setTotalRent] = useState(0);

  useEffect(() => {
    const fetchRentalStatus = async () => {
      try {
        const token = localStorage.getItem('rentora_token');
        const response = await fetch('http://localhost:5001/api/leases/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('rentora_token');
          window.location.href = '/login';
          return;
        }

        const data = await response.json();
        
        if (data.hasLeases && data.leases.length > 0) {
          setRentals(data.leases);
          
          // Dynamically calculate the total monthly rent across all units
          const calculatedTotal = data.leases.reduce((sum: number, lease: any) => sum + (lease.deposit_amount || 0), 0);
          setTotalRent(calculatedTotal);
        }
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRentalStatus();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading your dashboard...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Here is a snapshot of your current rentals and dues.</p>
      </div>

      {rentals.length === 0 ? (
        // IF THEY HAVE NO RENTALS, PROMPT THEM TO JOIN
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">👋</div>
          <h2 className="text-lg font-bold mb-2">Welcome to Rentora!</h2>
          <p className="text-gray-500 mb-6">You currently have no active rentals linked to your account.</p>
          <Link href="/properties" className="bg-[#1c6456] hover:bg-[#144f43] text-white px-6 py-2.5 rounded-lg font-medium transition-colors inline-block">
            Enter Join Code
          </Link>
        </div>
      ) : (
        // DASHBOARD CONTENT
        <>
          {/* TOP METRICS */}
          <TenantMetrics totalRent={totalRent} activeRentalsCount={rentals.length} />

          {/* SPLIT WIDGET GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
            {/* Left: Summary of Rentals */}
            <RentalSummaryWidget rentals={rentals} />

            {/* Right: Notices & Complaints */}
            <NoticeBoardWidget />
          </div>
        </>
      )}

    </div>
  );
}
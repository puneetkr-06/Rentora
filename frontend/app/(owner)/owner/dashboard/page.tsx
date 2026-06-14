"use client";

import React, { useState, useEffect } from 'react';

// 🚨 1. IMPORT YOUR NEW COMPONENT HERE
import PropertyPerformanceList from '@/components/dashboard/owner/PropertyPerformanceList';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function OwnerDashboard() {
  const [loading, setLoading] = useState(true);
  
  // Dashboard Metrics State
  const [metrics, setMetrics] = useState({
    occupiedRooms: 0,
    totalRooms: 0,
    monthlyRevenue: 0, 
    pendingDues: 0,    
    openComplaints: 0  
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('rentora_token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // 🚨 2. FETCH REAL PAYMENT METRICS ALONG WITH PROPERTIES & COMPLAINTS
        const [propResponse, complaintResponse, metricsResponse] = await Promise.all([
          fetch(`${API_URL}/api/properties`, { headers }),
          fetch(`${API_URL}/api/complaints/owner`, { headers }),
          fetch(`${API_URL}/api/payments/owner-metrics`, { headers }).catch(() => null) 
        ]);

        // 🚨 THE FIX IS HERE: Notice the ".ok" checks!
        const propData = propResponse && propResponse.ok ? await propResponse.json() : { status: 'error', properties: [] };
        
        const complaintData = complaintResponse && complaintResponse.ok ? await complaintResponse.json() : { status: 'error', complaints: [] };
        
        const metricsData = metricsResponse && metricsResponse.ok ? await metricsResponse.json() : null;
        if (propData.status === 'success') {
          let total = 0;
          let occupied = 0;

          // Calculate Room Occupancy 
          propData.properties.forEach((property: any) => {
            total += property.total_rooms || 0;
            occupied += (property.total_rooms || 0) - (property.available_rooms || 0);
          });

          // Calculate Open Complaints
          const openComplaints = complaintData.status === 'success'
            ? (complaintData.complaints || []).filter((c: any) => c.status === 'OPEN' || c.status === 'PENDING').length
            : 0;

          // 🚨 3. SET REAL REVENUE AND PENDING DUES FROM YOUR JIT ENGINE
          setMetrics({
            totalRooms: total,
            occupiedRooms: occupied,
            monthlyRevenue: metricsData?.totalCollected || 0,
            pendingDues: metricsData?.totalPending || 0,
            openComplaints,
          });
        }
      } catch (error) {
        console.error("Failed to fetch dashboard metrics", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading dashboard data...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 p-6">
      
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Overview</h1>
        <p className="text-sm text-gray-500 mt-1">Here is what is happening with your properties today.</p>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Occupied Rooms */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-gray-500">Occupied Rooms</p>
            <div className="w-8 h-8 bg-[#1c6456]/10 text-[#1c6456] rounded-lg flex items-center justify-center">
              <HomeIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{metrics.occupiedRooms}</h3>
            <span className="text-sm text-gray-500 font-medium">/ {metrics.totalRooms}</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {metrics.totalRooms > 0 
              ? `${Math.round((metrics.occupiedRooms / metrics.totalRooms) * 100)}% occupancy rate` 
              : 'No rooms added yet'}
          </p>
        </div>

        {/* Metric 2: Monthly Revenue */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-gray-500">Total Collected</p>
            <div className="w-8 h-8 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
              <BanknoteIcon className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">₹{metrics.monthlyRevenue.toLocaleString()}</h3>
          <p className="text-xs text-gray-400 mt-2">Successful rent collections</p>
        </div>

        {/* Metric 3: Pending Dues */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-gray-500">Pending Dues</p>
            <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center">
              <AlertCircleIcon className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">₹{metrics.pendingDues.toLocaleString()}</h3>
          <p className="text-xs text-gray-400 mt-2">Unpaid rent and utilities</p>
        </div>

        {/* Metric 4: Open Complaints */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <p className="text-sm font-medium text-gray-500">Open Complaints</p>
            <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
              <WrenchIcon className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-3xl font-bold text-gray-900">{metrics.openComplaints}</h3>
          <p className="text-xs text-gray-400 mt-2">Tickets requiring attention</p>
        </div>

      </div>
      
      {/* 🚨 4. NEW: PROPERTY PERFORMANCE & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        
        {/* The new Property Performance List takes up 2/3 of the space */}
        <div className="lg:col-span-2">
          <PropertyPerformanceList />
        </div>

        {/* A functional Quick Actions card takes up the remaining 1/3 */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col h-full">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3 flex-1">
             <button onClick={() => window.location.href='/owner/properties'} className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-[#1c6456]/10 hover:text-[#1c6456] rounded-lg text-sm font-medium text-gray-700 transition-colors border border-gray-200">
               + Add New Property
             </button>
             <button onClick={() => window.location.href='/owner/community'} className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-[#1c6456]/10 hover:text-[#1c6456] rounded-lg text-sm font-medium text-gray-700 transition-colors border border-gray-200">
               📣 Post Notice
             </button>
             <button onClick={() => window.location.href='/owner/billing'} className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-[#1c6456]/10 hover:text-[#1c6456] rounded-lg text-sm font-medium text-gray-700 transition-colors border border-gray-200">
               💳 Manage Billing
             </button>
          </div>
        </div>

      </div>

    </div>
  );
}

// Minimal, clean SVG Icons for the cards
function HomeIcon(props: any) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function BanknoteIcon(props: any) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="12" x="2" y="6" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>; }
function AlertCircleIcon(props: any) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>; }
function WrenchIcon(props: any) { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>; }
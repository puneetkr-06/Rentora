"use client";

import React, { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PropertyPerformanceList() {
  const [stats, setStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null); // NEW: Error tracking

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('rentora_token');
        const res = await fetch(`${API_URL}/api/properties/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error(`API Error: ${res.status}`);
        
        const data = await res.json();
        
        if (data.status === 'success') {
          setStats(data.stats || []);
        } else {
          throw new Error(data.message || "Failed to load stats");
        }
      } catch (error: any) {
        console.error("Failed to load property stats", error);
        setErrorMsg(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-full text-gray-400 text-sm border border-gray-200 rounded-xl bg-white shadow-sm animate-pulse">Loading property metrics...</div>;
  }

  // 🚨 FIXED: Instead of returning 'null' and vanishing, we show a clean empty state or error!
  if (errorMsg) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex items-center justify-center h-full text-center shadow-sm">
        <p className="text-sm font-bold text-red-600">⚠️ Failed to load stats.<br/><span className="font-normal">Check your backend terminal for errors.</span></p>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center justify-center h-full text-center shadow-sm">
        <p className="text-sm text-gray-500">No property metrics available yet.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden h-full">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-900">Portfolio Performance</h2>
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
          {stats.length} Properties
        </span>
      </div>

      <div className="divide-y divide-gray-100 overflow-y-auto max-h-[300px]">
        {stats.map((prop) => (
          <div key={prop.id} className="p-5 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            {/* Property Name & Status */}
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">{prop.name}</h3>
              <div className="flex items-center gap-2 text-xs font-medium">
                {prop.occupancyPercentage === 100 ? (
                  <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">Fully Booked</span>
                ) : prop.occupancyPercentage === 0 ? (
                  <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">Completely Vacant</span>
                ) : (
                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Needs Tenants</span>
                )}
              </div>
            </div>

            {/* Occupancy Progress Bar */}
            <div className="w-full sm:w-32 md:w-48">
              <div className="flex justify-between text-xs font-bold text-gray-600 mb-1.5">
                <span>Occupancy</span>
                <span>{prop.occupiedRooms} / {prop.totalRooms}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    prop.occupancyPercentage >= 80 ? 'bg-green-500' : prop.occupancyPercentage >= 50 ? 'bg-yellow-400' : 'bg-red-500'
                  }`}
                  style={{ width: `${prop.occupancyPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Expected Revenue */}
            <div className="text-left sm:text-right sm:ml-4 min-w-[100px]">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">Est. Revenue</p>
              <p className="text-lg font-black text-[#1c6456]">
                ₹{prop.expectedRevenue.toLocaleString()}
              </p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
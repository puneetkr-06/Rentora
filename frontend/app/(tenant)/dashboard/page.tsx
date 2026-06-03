"use client";

import React, { useState, useEffect } from 'react';

export default function TenantDashboard() {
  const [loading, setLoading] = useState(true);
  const [hasLease, setHasLease] = useState(false);
  const [leaseData, setLeaseData] = useState<any>(null);
  
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // 1. Check Lease Status on Page Load
  useEffect(() => {
    const checkLeaseStatus = async () => {
      try {
        const token = localStorage.getItem('rentora_token');
        const response = await fetch('http://localhost:5001/api/leases/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await response.json();
        
        if (data.hasLease) {
          setHasLease(true);
          setLeaseData(data.lease);
        }
      } catch (error) {
        console.error("Failed to fetch lease status", error);
      } finally {
        setLoading(false);
      }
    };

    checkLeaseStatus();
  }, []);

  // 2. Handle the Join Room Form Submission
  const handleJoinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');
    setIsJoining(true);

    try {
      const token = localStorage.getItem('rentora_token');
      const response = await fetch('http://localhost:5001/api/leases/join', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ join_id: joinCode.toUpperCase() })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to join property.');
      }

      // If successful, reload the page to show the full dashboard!
      window.location.reload();

    } catch (err: any) {
      setJoinError(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  // --- UI: LOADING STATE ---
  if (loading) {
    return <div className="pt-20 flex justify-center text-gray-500 text-sm font-medium">Loading dashboard...</div>;
  }

  // --- UI: NO LEASE (JOIN ID FORM) ---
  if (!hasLease) {
    return (
      <div className="pt-10 max-w-md mx-auto">
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm text-center">
          <div className="w-12 h-12 bg-[#1c6456]/10 text-[#1c6456] rounded-full flex items-center justify-center mx-auto mb-4 text-xl">
            🏠
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Welcome to Rentora</h2>
          <p className="text-sm text-gray-500 mb-6">
            You are not currently assigned to a property. Enter the 6-character Join ID provided by your property owner to connect to your room.
          </p>

          {joinError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg text-left">
              {joinError}
            </div>
          )}

          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="e.g. X7B9P2"
              maxLength={6}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-center text-lg font-bold tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456] transition-colors"
              required
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <button
              type="submit"
              disabled={isJoining || joinCode.length < 5}
              className="w-full bg-[#1c6456] hover:bg-[#144f43] text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoining ? 'Verifying...' : 'Join Property'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- UI: HAS LEASE (FULL DASHBOARD) ---
  return (
    <div className="pt-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome home</h1>
          <p className="text-sm text-gray-500 mt-1">
            {leaseData?.rooms?.properties?.name} • Room {leaseData?.rooms?.room_number}
          </p>
        </div>
      </div>
      
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
          <span className="text-sm font-medium text-gray-500">Monthly Rent</span>
          <p className="text-2xl font-bold text-gray-900 mt-1 flex items-center gap-2">
            ₹{leaseData?.rooms?.rent_amount} <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">Active</span>
          </p>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
          <span className="text-sm font-medium text-gray-500">Security Deposit</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">₹{leaseData?.deposit_amount}</p>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
          <span className="text-sm font-medium text-gray-500">Lease Start</span>
          <p className="text-xl font-bold text-gray-900 mt-1">{new Date(leaseData?.start_date).toLocaleDateString()}</p>
        </div>
        <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm">
          <span className="text-sm font-medium text-gray-500">Open tickets</span>
          <p className="text-2xl font-bold text-gray-900 mt-1">0</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
         <h3 className="font-semibold text-gray-900 mb-4">Today's Actions</h3>
         <div className="p-4 border border-gray-100 bg-gray-50 rounded-lg text-sm text-gray-600">
           You are all caught up! No pending rent or notices.
         </div>
      </div>
    </div>
  );
}
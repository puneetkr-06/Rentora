"use client";

import React, { useState, useEffect } from 'react';

export default function TenantPropertiesPage() {
  const [loading, setLoading] = useState(true);
  const [rentals, setRentals] = useState<any[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // 1. Fetch current rental status (Now expecting an array of leases)
  const fetchRentalStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('rentora_token');
      const response = await fetch('http://localhost:5001/api/leases/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      // Update state based on the new backend structure
      if (data.hasLeases && data.leases.length > 0) {
        setRentals(data.leases);
      } else {
        setRentals([]);
      }
    } catch (err) {
      console.error("Error loading rental:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRentalStatus();
  }, []);

  // 2. Join a new property
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    setError('');

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
      if (!response.ok) throw new Error(data.error || "Invalid code");
      
      setJoinCode(''); // Clear input
      fetchRentalStatus(); // Refresh the grid to show the new room!
      
    } catch (err: any) {
      setError(err.message || "Could not join property. Please check the code.");
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your rental details...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Rentals</h1>
          <p className="text-sm text-gray-500 mt-1">Manage the properties and rooms you are currently renting.</p>
        </div>
      </div>

      {rentals.length === 0 ? (
        // --- EMPTY STATE ---
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🏠</div>
          <h2 className="text-lg font-bold mb-2">No active rentals</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Enter the Join Code provided by your property owner to link your account to a room or property.</p>
          
          <form onSubmit={handleJoin} className="max-w-sm mx-auto space-y-3">
            <div className="flex gap-2">
              <input 
                className="border border-gray-200 p-2.5 rounded-lg flex-1 uppercase tracking-widest text-center focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456] transition-all font-medium"
                placeholder="ENTER 6-DIGIT CODE" 
                value={joinCode}
                maxLength={6}
                onChange={(e) => setJoinCode(e.target.value)}
                required
              />
              <button 
                disabled={isJoining}
                className="bg-[#1c6456] hover:bg-[#144f43] text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
              >
                {isJoining ? '...' : 'Join'}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          </form>
        </div>
      ) : (
        // --- ACTIVE RENTALS GRID ---
        <div className="space-y-8">
          
          {/* Allow joining additional rooms if they already have one */}
          <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <span className="text-sm font-medium text-gray-700">Renting another space?</span>
            <form onSubmit={handleJoin} className="flex gap-2 w-full max-w-xs">
              <input 
                className="border border-gray-200 px-3 py-1.5 rounded-lg flex-1 uppercase text-sm focus:ring-2 focus:ring-[#1c6456]/20"
                placeholder="JOIN CODE" 
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value)}
                required
              />
              <button disabled={isJoining} className="bg-[#1c6456] text-white px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50">Join</button>
            </form>
          </div>
          {error && <p className="text-red-500 text-sm text-right -mt-6">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rentals.map((rental) => {
              // Determine if this lease is for a single room or a cluster group
              const isCluster = !!rental.cluster_id;
              const propertyDetails = isCluster ? rental.clusters?.properties : rental.rooms?.properties;
              const unitName = isCluster ? `Cluster: ${rental.clusters?.name}` : `Room: ${rental.rooms?.room_number}`;

              return (
                <div key={rental.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#1c6456]"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{propertyDetails?.name || 'Unknown Property'}</h2>
                      <p className="text-sm text-gray-500 mt-1">{propertyDetails?.address}</p>
                    </div>
                    <span className="bg-green-50 text-green-700 border border-green-200 text-xs font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                      {rental.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4 border-t border-gray-100 pt-5">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Unit</p>
                      <p className="font-semibold text-gray-900">{unitName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Security Deposit</p>
                      <p className="font-semibold text-gray-900">₹{rental.deposit_amount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Start Date</p>
                      <p className="font-semibold text-gray-900">{new Date(rental.start_date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Agreement</p>
                      <button className="text-[#1c6456] text-sm font-semibold hover:underline">View Document</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
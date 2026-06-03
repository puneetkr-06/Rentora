"use client";

import React, { useState, useEffect } from 'react';

export default function TenantPropertiesPage() {
  const [loading, setLoading] = useState(true);
  const [hasRental, setHasRental] = useState(false);
  const [rentalData, setRentalData] = useState<any>(null);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');

  // 1. Fetch current rental status
  useEffect(() => {
    const fetchRentalStatus = async () => {
      try {
        const token = localStorage.getItem('rentora_token');
        const response = await fetch('http://localhost:5001/api/leases/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.hasLease) {
          setHasRental(true);
          setRentalData(data.lease);
        }
      } catch (err) {
        console.error("Error loading rental:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRentalStatus();
  }, []);

  // 2. Join a new property
  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
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
      if (!response.ok) throw new Error("Invalid code");
      window.location.reload(); // Refresh to show details
    } catch (err) {
      setError("Could not join property. Please check the code.");
    }
  };

  if (loading) return <div className="p-8">Loading your rental details...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">My Rental</h1>

      {!hasRental ? (
        // --- EMPTY STATE ---
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <h2 className="text-lg font-bold mb-2">No active rental</h2>
          <p className="text-gray-500 mb-6">Enter the Join Code provided by your property owner to see your rental details.</p>
          <form onSubmit={handleJoin} className="max-w-xs mx-auto flex gap-2">
            <input 
              className="border p-2 rounded flex-1 uppercase"
              placeholder="ENTER CODE" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <button className="bg-[#1c6456] text-white px-4 py-2 rounded">Join</button>
          </form>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      ) : (
        // --- ACTIVE RENTAL STATE ---
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl font-bold">{rentalData.rooms.properties.name}</h2>
            <p className="text-gray-500">{rentalData.rooms.properties.address}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 border-t pt-4">
            <div>
              <p className="text-xs text-gray-400 uppercase">Room Number</p>
              <p className="font-semibold">{rentalData.rooms.room_number}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Monthly Rent</p>
              <p className="font-semibold">₹{rentalData.rooms.rent_amount}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Start Date</p>
              <p className="font-semibold">{new Date(rentalData.start_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase">Status</p>
              <p className="font-semibold text-[#1c6456]">{rentalData.status}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
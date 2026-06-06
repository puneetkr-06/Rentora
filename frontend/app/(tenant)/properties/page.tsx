"use client";

import React, { useState, useEffect } from 'react';
import TenantRentalCard from '@/components/properties/tenant/TenantRentalCard';
import PayRentModal from '@/components/properties/tenant/PayRentModal';
import TenantLedgerModal from '@/components/properties/tenant/TenantLedgerModal';

export default function TenantPropertiesPage() {
  const [loading, setLoading] = useState(true);
  const [rentals, setRentals] = useState<any[]>([]);
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  // New Modal States
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [selectedRental, setSelectedRental] = useState<any>(null);

const fetchRentalStatus = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('rentora_token');
      const response = await fetch('http://localhost:5001/api/leases/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // 🚨 ADD THIS: Intercept the dead token immediately
      if (response.status === 401 || response.status === 403) {
        alert("Your session has expired for security reasons. Please log in again.");
        localStorage.removeItem('rentora_token');
        localStorage.removeItem('rentora_user');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();
      
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

  useEffect(() => { fetchRentalStatus(); }, []);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    setError('');

    try {
      const token = localStorage.getItem('rentora_token');
      const response = await fetch('http://localhost:5001/api/leases/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ join_id: joinCode.toUpperCase() })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Invalid code");
      
      setJoinCode(''); 
      fetchRentalStatus(); 
      
    } catch (err: any) {
      setError(err.message || "Could not join property. Please check the code.");
    } finally {
      setIsJoining(false);
    }
  };

  const openPayModal = (rental: any) => {
    setSelectedRental(rental);
    setIsPayModalOpen(true);
  };

  const openLedgerModal = (rental: any) => {
    setSelectedRental(rental);
    setIsLedgerModalOpen(true);
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your rental details...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Rentals</h1>
        <p className="text-sm text-gray-500 mt-1">Manage the properties and rooms you are currently renting.</p>
      </div>

      {rentals.length === 0 ? (
        // --- EMPTY STATE ---
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">🏠</div>
          <h2 className="text-lg font-bold mb-2">No active rentals</h2>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Enter the Join Code provided by your property owner to link your account.</p>
          
          <form onSubmit={handleJoin} className="max-w-sm mx-auto space-y-3">
            <div className="flex gap-2">
              <input 
                className="border border-gray-200 p-2.5 rounded-lg flex-1 uppercase tracking-widest text-center focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]"
                placeholder="ENTER 6-DIGIT CODE" 
                value={joinCode} maxLength={6} required
                onChange={(e) => setJoinCode(e.target.value)}
              />
              <button disabled={isJoining} className="bg-[#1c6456] hover:bg-[#144f43] text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50">
                {isJoining ? '...' : 'Join'}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
          </form>
        </div>
      ) : (
        // --- ACTIVE RENTALS GRID ---
        <div className="space-y-8">
          <div className="bg-white border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
            <span className="text-sm font-medium text-gray-700">Renting another space?</span>
            <form onSubmit={handleJoin} className="flex gap-2 w-full max-w-xs">
              <input 
                className="border border-gray-200 px-3 py-1.5 rounded-lg flex-1 uppercase text-sm focus:ring-2 focus:ring-[#1c6456]/20"
                placeholder="JOIN CODE" value={joinCode} required
                onChange={(e) => setJoinCode(e.target.value)}
              />
              <button disabled={isJoining} className="bg-[#1c6456] text-white px-4 py-1.5 rounded-lg text-sm font-medium disabled:opacity-50">Join</button>
            </form>
          </div>
          {error && <p className="text-red-500 text-sm text-right -mt-6">{error}</p>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {rentals.map((rental) => (
              <TenantRentalCard 
                key={rental.id} 
                rental={rental} 
                openPayModal={openPayModal} 
                openLedgerModal={openLedgerModal} 
              />
            ))}
          </div>
        </div>
      )}

      {/* Render Modals */}
      <PayRentModal isOpen={isPayModalOpen} setIsOpen={setIsPayModalOpen} rental={selectedRental} />
      <TenantLedgerModal isOpen={isLedgerModalOpen} setIsOpen={setIsLedgerModalOpen} rental={selectedRental} />

    </div>
  );
}
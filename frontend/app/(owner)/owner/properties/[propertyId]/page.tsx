"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Import our new cleanly separated components
import RoomCard from '@/components/properties/owner/RoomCard';
import DangerZone from '@/components/properties/owner/DangerZone';
import AddRoomModal from '@/components/properties/owner/AddRoomModal';
import ConfigureRentModal from '@/components/properties/owner/ConfigureRentModal';
import TenantProfileModal from '@/components/properties/owner/TenantProfileModal';
import LedgerModal from '@/components/properties/owner/LedgerModal';

export default function RoomManagementPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId;

  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false); 
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  
  // New Room Creation States
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [newRoomData, setNewRoomData] = useState({ room_number: '', rent_amount: '', capacity: 1, type: 'SINGLE' });

  // Data States
  const [rentalData, setRentalData] = useState({ rentPrice: '', electricityRate: '', meterReading: '', startDate: '' });
  const [generatedJoinId, setGeneratedJoinId] = useState('');
  const [isDeallocating, setIsDeallocating] = useState(false);

  // Deletion States
  const [isDeleteRoomModalOpen, setIsDeleteRoomModalOpen] = useState(false);
  const [isDeletingRoom, setIsDeletingRoom] = useState(false);
  const [isDeletePropertyModalOpen, setIsDeletePropertyModalOpen] = useState(false);
  const [isDeletingProperty, setIsDeletingProperty] = useState(false);

  // --- API FUNCTIONS (Untouched logic) ---
// 1. Fetch Rooms
  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('rentora_token');
      const response = await fetch(`${API_URL}/api/rooms/${propertyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // 🚨 ADD THIS: Intercept the dead token before it crashes the map function
      if (response.status === 401 || response.status === 403) {
        alert("Your session has expired for security reasons. Please log in again.");
        localStorage.removeItem('rentora_token');
        localStorage.removeItem('rentora_user');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();
      if (data.status === 'success') setRooms(data.rooms);
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchRooms(); }, [propertyId]);

  const openRoomModal = (room: any) => {
    setSelectedRoom(room);
    if (room.status === 'VACANT') {
      setGeneratedJoinId('');
      setRentalData({ 
        rentPrice: room.rent_amount || '', 
        electricityRate: '', meterReading: '',
        startDate: new Date().toISOString().split('T')[0] 
      });
      setIsRoomModalOpen(true);
    } else {
      setIsTenantModalOpen(true);
    }
  };

  const openLedgerModal = (room: any) => {
    setSelectedRoom(room);
    setIsLedgerModalOpen(true);
  };

  const handleUpdateRoom = async () => {
    try {
      const token = localStorage.getItem('rentora_token');
      const response = await fetch(`${API_URL}/api/leases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          room_id: selectedRoom.id, start_date: new Date(rentalData.startDate).toISOString(), 
          deposit_amount: parseInt(rentalData.rentPrice) || 0, electricity_rate: parseFloat(rentalData.electricityRate) || null, initial_meter_reading: parseInt(rentalData.meterReading) || null,
          rent_amount: parseInt(rentalData.rentPrice) || 0
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error);
      setGeneratedJoinId(data.join_id);
      fetchRooms(); 
    } catch (error: any) { alert(error.message); }
  };

  const handleDeallocate = async () => {
    if (!window.confirm(`Are you sure you want to deallocate Room ${selectedRoom.room_number}? This will end the tenant's lease.`)) return;
    setIsDeallocating(true);
    try {
      const token = localStorage.getItem('rentora_token');
      const response = await fetch(`${API_URL}/api/rooms/${selectedRoom.id}/deallocate`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) { setIsTenantModalOpen(false); fetchRooms(); }
    } catch (error) { console.error("Failed to deallocate", error); } 
    finally { setIsDeallocating(false); }
  };

  const handleDeleteRoom = async () => {
    setIsDeletingRoom(true);
    try {
      const token = localStorage.getItem('rentora_token');
      const response = await fetch(`${API_URL}/api/rooms/${selectedRoom.id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setIsDeleteRoomModalOpen(false); setIsRoomModalOpen(false); setIsTenantModalOpen(false); fetchRooms();
      } else {
        const data = await response.json(); alert(data.error || "Failed to delete room.");
      }
    } catch (error) { console.error("Failed to delete room", error); } 
    finally { setIsDeletingRoom(false); }
  };

  const handleDeleteProperty = async () => {
    setIsDeletingProperty(true);
    try {
      const token = localStorage.getItem('rentora_token');
      const response = await fetch(`${API_URL}/api/properties/${propertyId}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) { router.push('/owner/properties'); } 
      else { const data = await response.json(); alert(data.error || "Failed to delete property."); }
    } catch (error) { console.error("Failed to delete property", error); } 
    finally { setIsDeletingProperty(false); }
  };

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingRoom(true);
    try {
      const token = localStorage.getItem('rentora_token');
      const response = await fetch(`${API_URL}/api/rooms`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          property_id: propertyId, room_number: newRoomData.room_number, type: newRoomData.type,
          rent_amount: parseInt(newRoomData.rent_amount) || 0, capacity: parseInt(newRoomData.capacity as any) || 1, status: 'VACANT'
        })
      });
      if (response.ok) {
        setIsAddRoomModalOpen(false); setNewRoomData({ room_number: '', rent_amount: '', capacity: 1, type: 'SINGLE' }); fetchRooms();
      } else { const data = await response.json(); alert(data.error || "Failed to add room."); }
    } catch (error) { console.error("Failed to add room", error); alert("An error occurred while adding the room."); } 
    finally { setIsAddingRoom(false); }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading property details...</div>;

  const activeLease = selectedRoom?.leases?.find((l: any) => l.status === 'ACTIVE');
  const tenant = activeLease?.users;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-900 transition-colors">← Back</button>
          <h1 className="text-2xl font-bold text-gray-900">Manage Rooms</h1>
        </div>
        <button onClick={() => setIsAddRoomModalOpen(true)} className="bg-[#1c6456] hover:bg-[#144f43] text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm">
          + Add Room
        </button>
      </div>

      {/* COMPONENT: ROOM CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} openRoomModal={openRoomModal} openLedgerModal={openLedgerModal} />
        ))}
      </div>

      {/* COMPONENT: DANGER ZONE */}
      <DangerZone setIsDeletePropertyModalOpen={setIsDeletePropertyModalOpen} />

      {/* COMPONENTS: MODALS */}
      <AddRoomModal isOpen={isAddRoomModalOpen} setIsAddRoomModalOpen={setIsAddRoomModalOpen} handleAddRoom={handleAddRoom} newRoomData={newRoomData} setNewRoomData={setNewRoomData} isAddingRoom={isAddingRoom} />
      
      <ConfigureRentModal isOpen={isRoomModalOpen} setIsRoomModalOpen={setIsRoomModalOpen} selectedRoom={selectedRoom} generatedJoinId={generatedJoinId} rentalData={rentalData} setRentalData={setRentalData} setIsDeleteRoomModalOpen={setIsDeleteRoomModalOpen} handleUpdateRoom={handleUpdateRoom} />
      
      <TenantProfileModal isOpen={isTenantModalOpen} setIsTenantModalOpen={setIsTenantModalOpen} selectedRoom={selectedRoom} activeLease={activeLease} tenant={tenant} setIsDeleteRoomModalOpen={setIsDeleteRoomModalOpen} handleDeallocate={handleDeallocate} isDeallocating={isDeallocating} />
      
      <LedgerModal isOpen={isLedgerModalOpen} setIsLedgerModalOpen={setIsLedgerModalOpen} selectedRoom={selectedRoom} tenant={tenant} activeLease={activeLease} />

      {/* INLINE DOUBLE CONFIRMATION: DELETE ROOM */}
      {isDeleteRoomModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm text-center space-y-4 shadow-xl border border-red-100">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl border border-red-100">⚠️</div>
            <h2 className="text-xl font-bold text-gray-900">Delete Room {selectedRoom?.room_number}?</h2>
            <p className="text-sm text-gray-500">This action <span className="font-bold text-red-600">cannot be undone</span>. This will permanently erase the room and instantly remove any tenant assigned to it.</p>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setIsDeleteRoomModalOpen(false)} className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-2.5 rounded-lg font-medium transition-colors">Cancel</button>
              <button onClick={handleDeleteRoom} disabled={isDeletingRoom} className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
                {isDeletingRoom ? 'Deleting...' : 'Yes, Delete Room'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INLINE DOUBLE CONFIRMATION: DELETE ENTIRE PROPERTY */}
      {isDeletePropertyModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm text-center space-y-4 shadow-xl border border-red-100">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl border border-red-100">🚨</div>
            <h2 className="text-xl font-bold text-gray-900">Delete Entire Property?</h2>
            <p className="text-sm text-gray-500">This action <span className="font-bold text-red-600">cannot be undone</span>. This will permanently delete the property, ALL rooms, and evict ALL tenants instantly.</p>
            <div className="flex gap-3 pt-4">
              <button onClick={() => setIsDeletePropertyModalOpen(false)} className="flex-1 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 py-2.5 rounded-lg font-medium transition-colors">Cancel</button>
              <button onClick={handleDeleteProperty} disabled={isDeletingProperty} className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50">
                {isDeletingProperty ? 'Deleting...' : 'Yes, Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
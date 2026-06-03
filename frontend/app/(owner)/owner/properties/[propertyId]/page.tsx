"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function RoomManagementPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.propertyId;

  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tenant Detail Modal State
  const [isRoomModalOpen, setIsRoomModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  
  // Room Rental Form Data
  const [rentalData, setRentalData] = useState({
    tenantName: '',
    rentPrice: '',
    electricityRate: '',
    meterReading: ''
  });

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('rentora_token');
      const response = await fetch(`http://localhost:5001/api/rooms/${propertyId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.status === 'success') setRooms(data.rooms);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRooms(); }, [propertyId]);

  const openRoomModal = (room: any) => {
    setSelectedRoom(room);
    setIsRoomModalOpen(true);
  };

  const handleUpdateRoom = async () => {
    // Here you would add a new API call to save these details to the Room/Lease table
    // For now, this is where the owner manually enters the info.
    alert(`Details saved for ${selectedRoom.room_number}! Join ID generated for tenant.`);
    setIsRoomModalOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Rooms</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {rooms.map((room) => (
          <div key={room.id} className="bg-white border p-4 rounded-xl shadow-sm">
            <h3 className="font-bold text-lg">{room.room_number}</h3>
            <p className="text-sm text-gray-500 mb-4">Status: {room.status}</p>
            <button 
              onClick={() => openRoomModal(room)}
              className="w-full bg-[#1c6456] text-white py-2 rounded-lg text-sm"
            >
              Configure / Rent Room
            </button>
          </div>
        ))}
      </div>

      {/* MODAL FOR RENTING DETAILS */}
      {isRoomModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-lg font-bold mb-4">Rent Room {selectedRoom?.room_number}</h2>
            <div className="space-y-3">
              <input placeholder="Tenant Name" className="w-full border p-2 rounded" 
                onChange={e => setRentalData({...rentalData, tenantName: e.target.value})} />
              <input placeholder="Rent Price" className="w-full border p-2 rounded" 
                onChange={e => setRentalData({...rentalData, rentPrice: e.target.value})} />
              <input placeholder="Electricity Rate/Unit (Optional)" className="w-full border p-2 rounded" 
                onChange={e => setRentalData({...rentalData, electricityRate: e.target.value})} />
              <input placeholder="Current Meter Reading (Optional)" className="w-full border p-2 rounded" 
                onChange={e => setRentalData({...rentalData, meterReading: e.target.value})} />
              
              <button onClick={handleUpdateRoom} className="w-full bg-[#1c6456] text-white py-2 rounded">
                Save & Generate Join Code
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Processing State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Wizard State - Added defaultRent here
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', address: '', floors: 1, defaultRent: '' });
  const [floorConfigs, setFloorConfigs] = useState<{ rooms: number }[]>([]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('rentora_token');
      const res = await fetch('http://localhost:5001/api/properties', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status === 'success') setProperties(data.properties);
    } catch (e) { 
      console.error(e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchProperties(); }, []);

  const handleFloorsChange = (count: number) => {
    setFormData({...formData, floors: count});
    setFloorConfigs(Array.from({ length: count }, () => ({ rooms: 1 })));
  };

  const handleCreateProperty = async () => {
    setIsCreating(true);
    try {
      const token = localStorage.getItem('rentora_token');
      
      // 1. Create Property
      const propRes = await fetch('http://localhost:5001/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: formData.name, address: formData.address })
      });
      
      const propData = await propRes.json();
      
      if (!propRes.ok) throw new Error(propData.error || 'Failed to create property');
      const pId = propData.property.id;

      // 2. Loop through floors and rooms to create them
      for (let f = 0; f < floorConfigs.length; f++) {
        for (let r = 0; r < floorConfigs[f].rooms; r++) {
          const roomRes = await fetch('http://localhost:5001/api/rooms', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              property_id: pId,
              room_number: `F${f + 1}R${r + 1}`,
              type: 'SINGLE',
              rent_amount: parseInt(formData.defaultRent as string) || 0, // <-- NO MORE HARDCODED 5000
              capacity: 1,
              status: 'VACANT'
            })
          });
          
          if (!roomRes.ok) {
             const roomData = await roomRes.json();
             console.error("Room creation failed:", roomData.error);
          }
        }
      }
      
      // 3. Reset and Refresh
      setIsModalOpen(false);
      setStep(1);
      setFormData({ name: '', address: '', floors: 1, defaultRent: '' }); // <-- Reset defaultRent as well
      fetchProperties();
      
    } catch (error: any) {
      console.error("Property creation failed", error);
      alert(error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Properties</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#1c6456] text-white px-4 py-2 rounded-lg text-sm">+ Add Property</button>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed rounded-xl">
          <p className="text-gray-500">No properties added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {properties.map((p) => (
            <Link key={p.id} href={`/owner/properties/${p.id}`}>
              <div className="bg-white border p-5 rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all group">
                <h3 className="font-bold text-lg group-hover:text-[#1c6456] transition-colors">{p.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{p.address}</p>
                <div className="grid grid-cols-2 gap-4 border-t pt-4 text-sm">
                  <div>
                    <span className="block text-gray-400 uppercase text-[10px]">Total Rooms</span>
                    <span className="font-semibold">{p.total_rooms}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 uppercase text-[10px]">Available</span>
                    <span className="font-semibold text-[#1c6456]">{p.available_rooms}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">{step === 1 ? 'Add Property' : 'Define Floors'}</h2>
              <button onClick={() => { setIsModalOpen(false); setStep(1); }} className="text-gray-400 hover:text-gray-900">✕</button>
            </div>
            
            {step === 1 ? (
              <div className="space-y-4">
                <input placeholder="Name (e.g. Lakeview)" className="w-full border p-2 rounded" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input placeholder="Address" className="w-full border p-2 rounded" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                <input type="number" placeholder="Number of Floors" className="w-full border p-2 rounded" value={formData.floors || ''} onChange={e => handleFloorsChange(parseInt(e.target.value))} />
                
                {/* NEW INPUT FOR DEFAULT BASE RENT */}
                <input 
                  type="number" 
                  placeholder="Default Base Rent per Room (₹)" 
                  className="w-full border p-2 rounded" 
                  value={formData.defaultRent} 
                  onChange={e => setFormData({...formData, defaultRent: e.target.value})} 
                />

                <button 
                  onClick={() => setStep(2)} 
                  disabled={!formData.name || !formData.address || formData.floors < 1}
                  className="w-full bg-[#1c6456] text-white py-2 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {floorConfigs.map((config, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="text-sm font-medium">Floor {i + 1} Rooms:</span>
                    <input type="number" className="w-20 border p-2 rounded text-center" value={config.rooms}
                      onChange={e => {
                        const newConfigs = [...floorConfigs];
                        newConfigs[i].rooms = parseInt(e.target.value) || 1;
                        setFloorConfigs(newConfigs);
                      }} />
                  </div>
                ))}
                <div className="pt-4 border-t flex gap-2">
                  <button onClick={() => setStep(1)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded">Back</button>
                  <button 
                    onClick={handleCreateProperty} 
                    disabled={isCreating}
                    className="flex-1 bg-[#1c6456] text-white py-2 rounded disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Create Property'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
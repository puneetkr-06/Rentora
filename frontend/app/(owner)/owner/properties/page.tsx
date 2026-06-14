"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal & Processing State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Wizard State
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>({ name: '', address: '', floors: 1, defaultRent: '' });
  const [floorConfigs, setFloorConfigs] = useState<{ rooms: number }[]>([{ rooms: 1 }]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('rentora_token');
      const res = await fetch(`${API_URL}/api/properties`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (res.status === 401 || res.status === 403) {
         localStorage.removeItem('rentora_token');
         window.location.href = '/login';
         return;
      }

      if (data.status === 'success') {
        setProperties(data.properties);
      }
    } catch (e) { 
      console.error("FETCH CRASHED:", e); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchProperties(); }, []);

  // 🚨 UPGRADED LOGIC: Safely parses numbers and preserves existing room configs!
  const handleFloorsChange = (val: number | string) => {
    setFormData({ ...formData, floors: val });

    const parsedCount = parseInt(val as string);
    if (!isNaN(parsedCount) && parsedCount > 0) {
      setFloorConfigs(prev => {
        return Array.from({ length: parsedCount }, (_, i) => ({
          // Keep existing room count if the floor already existed, otherwise default to 1
          rooms: prev[i] ? prev[i].rooms : 1 
        }));
      });
    }
  };

  const handleCreateProperty = async () => {
    setIsCreating(true);
    try {
      const token = localStorage.getItem('rentora_token');
      
      // 1. Create Property
      const propRes = await fetch(`${API_URL}/api/properties`, {
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
          const roomRes = await fetch(`${API_URL}/api/rooms`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({
              property_id: pId,
              room_number: `F${f + 1}R${r + 1}`,
              type: 'SINGLE',
              rent_amount: parseInt(formData.defaultRent as string) || 0,
              capacity: 1,
              status: 'VACANT'
            })
          });
          
          if (!roomRes.ok) console.error("Room creation failed");
        }
      }
      
      // 3. Reset and Refresh
      setIsModalOpen(false);
      setStep(1);
      setFormData({ name: '', address: '', floors: 1, defaultRent: '' });
      setFloorConfigs([{ rooms: 1 }]);
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
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Property Name</label>
                  <input placeholder="e.g. Lakeview Residency" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456] outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Address</label>
                  <input placeholder="Full Address" className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456] outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                
                {/* 🚨 NORMAL NUMBER INPUT FOR FLOORS 🚨 */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Number of Floors
                  </label>
                  <input 
                    type="number" 
                    min="1"
                    placeholder="e.g. 4" 
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456] outline-none" 
                    value={formData.floors} 
                    onChange={e => handleFloorsChange(e.target.value)}
                    onBlur={() => {
                       // Safety net: if they leave it totally empty, default back to 1
                       if (!formData.floors || parseInt(formData.floors) < 1) handleFloorsChange(1);
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Default Base Rent (₹)</label>
                  <input 
                    type="number" 
                    placeholder="e.g. 5000" 
                    className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456] outline-none" 
                    value={formData.defaultRent} 
                    onChange={e => setFormData({...formData, defaultRent: e.target.value})} 
                  />
                </div>

                <button 
                  onClick={() => setStep(2)} 
                  disabled={!formData.name || !formData.address || parseInt(formData.floors) < 1}
                  className="w-full bg-[#1c6456] text-white py-3 rounded-lg font-medium mt-2 disabled:opacity-50"
                >
                  Next: Configure Rooms
                </button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {floorConfigs.map((config, i) => (
                  <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <span className="text-sm font-bold text-gray-700">Floor {i + 1} Rooms:</span>
                    
                    {/* 🚨 NORMAL NUMBER INPUT FOR ROOMS PER FLOOR 🚨 */}
                    <input 
                      type="number" 
                      min="1" 
                      className="w-24 border border-gray-300 p-2 rounded-md text-center text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456] outline-none" 
                      value={config.rooms || ''}
                      onChange={e => {
                        const val = e.target.value;
                        const newConfigs = [...floorConfigs];
                        newConfigs[i].rooms = val === '' ? '' as any : parseInt(val);
                        setFloorConfigs(newConfigs);
                      }} 
                      onBlur={() => {
                        // Safety net: if left empty, default to 1 room
                        if (!config.rooms || config.rooms < 1) {
                           const newConfigs = [...floorConfigs];
                           newConfigs[i].rooms = 1;
                           setFloorConfigs(newConfigs);
                        }
                      }}
                    />
                  </div>
                ))}
                <div className="pt-4 border-t flex gap-3">
                  <button onClick={() => setStep(1)} className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 py-2.5 rounded-lg font-medium transition-colors">Back</button>
                  <button 
                    onClick={handleCreateProperty} 
                    disabled={isCreating}
                    className="flex-1 bg-[#1c6456] hover:bg-[#144f43] text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isCreating ? 'Creating...' : 'Finalize & Create'}
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
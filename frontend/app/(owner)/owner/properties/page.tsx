"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Property Wizard State
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', address: '', floors: 1 });
  const [floorData, setFloorData] = useState<{ floor: number; rooms: number }[]>([]);

  const fetchProperties = async () => {
    setLoading(true);
    // ... existing fetch logic ...
    setLoading(false);
  };

  useEffect(() => { fetchProperties(); }, []);

  // Update floor configurations
  const handleFloorCountChange = (count: number) => {
    const newFloors = Array.from({ length: count }, (_, i) => ({ floor: i + 1, rooms: 1 }));
    setFloorData(newFloors);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Properties</h1>
        <button onClick={() => setIsModalOpen(true)} className="bg-[#1c6456] text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Add Property
        </button>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed rounded-xl">
          <p className="text-gray-500">No properties added yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {properties.map((p) => (
            <Link key={p.id} href={`/owner/properties/${p.id}`}>
              <div className="bg-white border p-5 rounded-xl shadow-sm hover:shadow-md cursor-pointer">
                <h3 className="font-bold text-lg">{p.name}</h3>
                <p className="text-sm text-gray-500">{p.address}</p>
                <div className="mt-4 pt-4 border-t flex justify-between text-sm">
                  <span>Total Rooms: {p.total_rooms}</span>
                  <span className="text-[#1c6456] font-medium">Available: {p.available_rooms}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* MODAL WIZARD */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="font-bold text-lg">Property Details</h2>
                <input placeholder="Property Name" className="w-full border p-2 rounded" 
                  onChange={e => setFormData({...formData, name: e.target.value})} />
                <input placeholder="Address" className="w-full border p-2 rounded" 
                  onChange={e => setFormData({...formData, address: e.target.value})} />
                <input type="number" placeholder="Number of Floors" className="w-full border p-2 rounded" 
                  onChange={e => { setFormData({...formData, floors: parseInt(e.target.value)}); handleFloorCountChange(parseInt(e.target.value)); }} />
                <button onClick={() => setStep(2)} className="w-full bg-[#1c6456] text-white py-2 rounded">Next</button>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="font-bold text-lg">Define Rooms per Floor</h2>
                {floorData.map((f, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>Floor {f.floor}</span>
                    <input type="number" className="w-16 border p-1 rounded" 
                      onChange={e => {
                        const updated = [...floorData];
                        updated[index].rooms = parseInt(e.target.value);
                        setFloorData(updated);
                      }} />
                  </div>
                ))}
                <button onClick={() => { /* Final Submit Logic */ setIsModalOpen(false); setStep(1); }} className="w-full bg-[#1c6456] text-white py-2 rounded">
                  Create Property
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
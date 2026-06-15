"use client";

import React, { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function OwnerCommunityPage() {
  // --- ANNOUNCEMENT STATE (Your existing code) ---
  const [properties, setProperties] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    property_id: '',
    title: '',
    content: '',
    type: 'GENERAL'
  });

  // --- COMPLAINTS STATE (The new engine) ---
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);

  useEffect(() => {
    // 1. Fetch properties for your broadcast dropdown
    const fetchProperties = async () => {
      try {
        const token = sessionStorage.getItem('rentora_token');
        const res = await fetch(`${API_URL}/api/properties`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.status === 'success') {
          setProperties(data.properties);
        }
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      }
    };

    // 2. Fetch the maintenance tickets
    const fetchComplaints = async () => {
      try {
        const token = sessionStorage.getItem('rentora_token');
        const res = await fetch(`${API_URL}/api/complaints/owner`, { 
          headers: { 'Authorization': `Bearer ${token}` } 
        });
        const data = await res.json();
        if (data.status === 'success') setComplaints(data.complaints);
      } catch (err) { 
        console.error(err); 
      } finally { 
        setLoadingComplaints(false); 
      }
    };

    fetchProperties();
    fetchComplaints();
  }, []);

  // Your existing Broadcast Handler
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = sessionStorage.getItem('rentora_token');
      const res = await fetch(`${API_URL}/api/notices/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        alert("Notice broadcasted successfully!");
        setFormData({ property_id: '', title: '', content: '', type: 'GENERAL' });
      } else {
        alert(data.error || "Failed to broadcast notice.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // The new Maintenance Status Handler
  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const token = sessionStorage.getItem('rentora_token');
      const res = await fetch(`${API_URL}/api/complaints/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        // Update local state to reflect change instantly without full reload
        setComplaints(complaints.map(c => c.id === id ? { ...c, status: newStatus } : c));
      }
    } catch (err) { alert("Failed to update status."); }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Community & Support</h1>
        <p className="text-sm text-gray-500 mt-1">Broadcast notices to specific properties and manage tenant complaints.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        
        {/* LEFT SIDE: MAINTENANCE DESK */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Active Tenant Complaints</h2>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {loadingComplaints ? (
              <div className="p-8 text-center text-gray-500">Loading tickets...</div>
            ) : complaints.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No active complaints. Everything looks good!</div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                  <tr>
                    <th className="p-4 font-semibold uppercase tracking-wider text-xs">Tenant & Unit</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-xs">Issue Description</th>
                    <th className="p-4 font-semibold uppercase tracking-wider text-xs text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {complaints.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                     <td className="p-4 align-top w-1/4">
  {/* Show the Tenant Name */}
  <p className="font-bold text-gray-900">{c.users?.full_name || 'Unknown'}</p>
  
  {/* Show the Property Name */}
  <p className="text-xs text-gray-500 mt-0.5">{c.properties?.name}</p>
  
  {/* 🚨 Show whether it's a Room or Cluster 🚨 */}
  <p className="text-xs text-gray-500 font-medium text-[#1c6456]">
    {c.rooms?.room_number ? `Room ${c.rooms.room_number}` : c.clusters?.name ? `Cluster ${c.clusters.name}` : 'Unknown Unit'}
  </p>
  
  {/* Show the Phone Number */}
  <p className="text-xs text-gray-400 mt-1">{c.users?.phone}</p>
</td>
                      <td className="p-4 align-top w-2/4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">{c.category}</span>
                          <p className="font-bold text-gray-900">{c.title}</p>
                        </div>
                        <p className="text-gray-600 mt-1 text-xs line-clamp-3">{c.description}</p>
                        {c.image_url && (
                          <a href={c.image_url} target="_blank" rel="noreferrer" className="inline-block mt-2 text-[10px] font-bold bg-[#1c6456]/10 text-[#1c6456] px-2 py-1 rounded hover:bg-[#1c6456]/20 transition-colors">
                            View Attached Photo ↗
                          </a>
                        )}
                      </td>
                      <td className="p-4 align-top text-right w-1/4">
                        <select 
                          value={c.status}
                          onChange={(e) => handleStatusChange(c.id, e.target.value)}
                          className={`text-xs font-bold border rounded-lg px-3 py-2 cursor-pointer focus:outline-none transition-colors w-full
                            ${c.status === 'PENDING' ? 'bg-yellow-50 text-yellow-800 border-yellow-200' : 
                              c.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-800 border-blue-200' : 
                              'bg-green-50 text-green-800 border-green-200'}
                          `}
                        >
                          <option value="PENDING">Pending Review</option>
                          <option value="IN_PROGRESS">Working On It</option>
                          <option value="RESOLVED">Mark as Resolved</option>
                        </select>
                        <p className="text-[10px] text-gray-400 mt-2">{new Date(c.created_at).toLocaleDateString()}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: NOTICE BOARD CREATOR (Your existing component) */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Broadcast Notice</h2>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden sticky top-6">
            <div className="bg-[#1c6456] p-4 text-white">
              <h3 className="font-semibold text-sm">Create New Alert</h3>
            </div>
            
            <form onSubmit={handleBroadcast} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Target Property</label>
                <select 
                  required
                  className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456] bg-gray-50 outline-none"
                  value={formData.property_id}
                  onChange={e => setFormData({...formData, property_id: e.target.value})}
                >
                  <option value="" disabled>Select a property...</option>
                  {properties.map(prop => (
                    <option key={prop.id} value={prop.id}>{prop.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Notice Title</label>
                  <input 
                    type="text" required placeholder="e.g., Water Shutoff" maxLength={40}
                    className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456] outline-none"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Alert Type</label>
                  <select 
                    className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456] outline-none"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="GENERAL">General Info</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="URGENT">Urgent / Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Message</label>
                  <span className={`text-[10px] font-bold ${formData.content.length >= 250 ? 'text-red-500' : 'text-gray-400'}`}>
                    {formData.content.length} / 250
                  </span>
                </div>
                <textarea 
                  required placeholder="Keep it brief (max 50 words)..." 
                  maxLength={250} rows={4}
                  className="w-full border border-gray-200 p-2.5 rounded-lg text-sm resize-none focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456] outline-none"
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit" disabled={isSubmitting}
                className="w-full bg-[#1c6456] hover:bg-[#144f43] text-white py-3 rounded-lg text-sm font-bold tracking-wide transition-colors shadow-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Broadcasting...' : 'Send to Tenants'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
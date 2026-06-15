"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import NoticeBoardWidget from '@/components/dashboard/tenant/NoticeBoardWidget';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
const API_URL = process.env.NEXT_PUBLIC_API_URL;

// 1. Rename the main function to a sub-component
function CommunityContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'notices' | 'maintenance'>(searchParams.get('tab') === 'maintenance' ? 'maintenance' : 'notices');
  
  const [complaints, setComplaints] = useState<any[]>([]);
  const [myLeases, setMyLeases] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAuthFailure = () => {
    sessionStorage.removeItem('rentora_token');
    sessionStorage.removeItem('rentora_user');
    window.location.href = '/login';
  };
  
  const [formData, setFormData] = useState({ lease_id: '', title: '', description: '', category: 'MEDIUM', image_url: '' });

  useEffect(() => {
    if (searchParams.get('tab') === 'maintenance') {
      setActiveTab('maintenance');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchComplaintsAndLeases = async () => {
      setLoading(true);
      try {
        const token = sessionStorage.getItem('rentora_token');
        
        // --- 1. SAFE FETCH COMPLAINTS ---
        const url1 = `${API_URL}/api/complaints/tenant`;
        const resComplaints = await fetch(url1, { headers: { 'Authorization': `Bearer ${token}` } });

          if (resComplaints.status === 401 || resComplaints.status === 403) {
            handleAuthFailure();
            return;
          }
        
        if (!resComplaints.ok) {
           const errText = await resComplaints.text();
           console.error("❌ Complaints API Failed:", resComplaints.status, errText.substring(0, 100));
        } else {
           const dataComplaints = await resComplaints.json();
           if (dataComplaints.status === 'success') setComplaints(dataComplaints.complaints);
        }

        // --- 2. SAFE FETCH LEASES ---
        const url2 = `${API_URL}/api/leases/tenant`;
        const resLeases = await fetch(url2, { headers: { 'Authorization': `Bearer ${token}` } });

          if (resLeases.status === 401 || resLeases.status === 403) {
            handleAuthFailure();
            return;
          }
        
        if (!resLeases.ok) {
           const errText = await resLeases.text();
           console.error("❌ Leases API Failed:", resLeases.status, errText.substring(0, 100));
        } else {
           const dataLeases = await resLeases.json();
           if (dataLeases.status === 'success') setMyLeases(dataLeases.leases);
        }

      } catch (err) { 
        console.error("Network or parsing error:", err); 
      } finally { 
        setLoading(false); 
      }
    };

    if (activeTab === 'maintenance') fetchComplaintsAndLeases();
  }, [activeTab]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!supabase) return alert("Supabase not connected.");
      
      setUploading(true);
      
      const fileExt = file.name ? file.name.split('.').pop() : 'png';
      const filePath = `complaints/${Math.random()}.${fileExt}`; 

      const { error } = await supabase.storage.from('rentora-files').upload(filePath, file);
      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage.from('rentora-files').getPublicUrl(filePath);
      setFormData({ ...formData, image_url: publicUrl });
    } catch (error: any) { 
      alert(`Upload Error: ${error.message}`); 
    } finally { 
      setUploading(false); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = sessionStorage.getItem('rentora_token');
      const res = await fetch(`${API_URL}/api/complaints`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      if (res.status === 401 || res.status === 403) {
        handleAuthFailure();
        return;
      }
      if (res.ok) {
        setShowModal(false);
        setFormData({ lease_id: '', title: '', description: '', category: 'MEDIUM', image_url: '' });
        
        // Refresh complaints list
        const refreshRes = await fetch(`${API_URL}/api/complaints/tenant`, { headers: { 'Authorization': `Bearer ${token}` } });
        const refreshData = await refreshRes.json();
        if (refreshData.status === 'success') setComplaints(refreshData.complaints);
      } else {
        const errorData = await res.json();
        alert("Error: " + (errorData.error || errorData.message || "Unknown error occurred"));
      }
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Community Hub</h1>
        <p className="text-sm text-gray-500 mt-1">Connect with your building and report issues.</p>
      </div>

      <div className="flex border-b border-gray-200 gap-6">
        <button onClick={() => setActiveTab('notices')} className={`pb-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'notices' ? 'border-[#1c6456] text-[#1c6456]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          📣 Notice Board
        </button>
        <button onClick={() => setActiveTab('maintenance')} className={`pb-3 font-bold text-sm border-b-2 transition-colors ${activeTab === 'maintenance' ? 'border-[#1c6456] text-[#1c6456]' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          🛠️ Maintenance
        </button>
      </div>

      {activeTab === 'notices' && (
        <div>
          <NoticeBoardWidget />
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button onClick={() => setShowModal(true)} className="bg-[#1c6456] text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-[#144f43]">
              + New Request
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {loading ? <div className="p-8 text-center text-gray-500">Loading...</div> : complaints.length === 0 ? <div className="p-12 text-center text-gray-500">No active maintenance requests.</div> : (
              <div className="divide-y divide-gray-100">
                {complaints.map((c) => (
                  <div key={c.id} className="p-6 hover:bg-gray-50 flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2 py-1 rounded uppercase tracking-wider">{c.category}</span>
                        <h3 className="font-bold text-gray-900">{c.title}</h3>
                      </div>
                      
                      <p className="text-xs font-bold text-[#1c6456] mb-2 flex items-center gap-1">
                        📍 {c.rooms?.properties?.name || c.clusters?.properties?.name} - {c.rooms?.room_number ? `Room ${c.rooms.room_number}` : c.clusters?.name ? `Cluster ${c.clusters.name}` : 'Unknown Unit'}
                      </p>

                      <p className="text-sm text-gray-600 max-w-xl">{c.description}</p>
                      {c.image_url && <a href={c.image_url} target="_blank" className="text-xs font-bold text-[#1c6456] mt-2 block hover:underline">View Attached Photo ↗</a>}
                    </div>
                    <div>
                      {c.status === 'PENDING' && <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold uppercase">Pending</span>}
                      {c.status === 'IN_PROGRESS' && <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold uppercase">In Progress</span>}
                      {c.status === 'RESOLVED' && <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold uppercase">Resolved</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold">Report an Issue</h2>
              <button type="button" onClick={() => setShowModal(false)} className="text-gray-400">✕</button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Which property is this for?</label>
              <select required className="w-full border p-2.5 rounded-lg text-sm bg-gray-50" value={formData.lease_id} onChange={e => setFormData({...formData, lease_id: e.target.value})}>
                <option value="" disabled>Select your unit...</option>
                {myLeases.map(lease => (
                  <option key={lease.id} value={lease.id}>
                    {lease.rooms?.properties?.name || lease.clusters?.properties?.name} - {lease.rooms?.room_number ? `Room ${lease.rooms.room_number}` : `Cluster ${lease.clusters?.name}`}
                  </option>
                ))}
              </select>
            </div>

            <input required type="text" placeholder="Issue Title" className="w-full border p-2.5 rounded-lg text-sm" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <select className="w-full border p-2.5 rounded-lg text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
            </select>
            <textarea required rows={3} placeholder="Description..." className="w-full border p-2.5 rounded-lg text-sm" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <input type="file" accept="image/*" onChange={handleFileUpload} className="w-full border p-2 text-sm rounded-lg" />
            <button type="submit" disabled={submitting || uploading} className="w-full bg-[#1c6456] text-white py-3 rounded-lg font-bold">Submit</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function TenantCommunityPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-gray-500">Loading Community Hub...</div>}>
      <CommunityContent />
    </Suspense>
  );
}
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// SAFETY NET: This prevents the "Next.js Logo" crash if your .env file is missing!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function TenantProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingId, setUploadingId] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hardcoded to strictly guarantee it hits your backend and stops the '<' HTML error!
  const API_URL = 'http://localhost:5001/api';

  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', gender: '', date_of_birth: '',
    permanent_address: '', city: '', state: '', pin_code: '',
    occupation_type: '', company_name: '', job_title: '',
    emergency_contact_name: '', emergency_contact_relationship: '', emergency_contact_number: '',
    aadhaar_number: '', profile_photo: '', aadhaar_url: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('rentora_token');
        const res = await fetch(`${API_URL}/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        if (data.status === 'success' && data.user) {
          // Prevent React crashes by converting 'null' database values to empty strings
          const safeData = Object.fromEntries(
            Object.entries(data.user).map(([key, value]) => [key, value === null ? '' : value])
          );
          setFormData(prevData => ({ ...prevData, ...safeData }));
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'document') => {
    try {
      if (!supabase) {
        return alert("Supabase is not connected! Please check your .env.local file.");
      }

      if (!event.target.files || event.target.files.length === 0) return;
      const file = event.target.files[0];

      type === 'avatar' ? setUploadingAvatar(true) : setUploadingId(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${type}s/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('rentora-files').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('rentora-files').getPublicUrl(filePath);

      if (type === 'avatar') {
        setFormData({ ...formData, profile_photo: publicUrl });
      } else {
        setFormData({ ...formData, aadhaar_url: publicUrl });
      }

    } catch (error: any) {
      alert(`Error uploading file: ${error.message}`);
    } finally {
      type === 'avatar' ? setUploadingAvatar(false) : setUploadingId(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.full_name || !formData.full_name.trim()) {
      return alert("Full Name is strictly required!");
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('rentora_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      // 🚨 THE FIX: The Data Scrubber
      // Loop through every single field in the form.
      // If the field is an empty string, convert it to a true SQL 'null'.
      const payloadToSave: any = { ...formData };
      Object.keys(payloadToSave).forEach(key => {
        if (payloadToSave[key] === '') {
          payloadToSave[key] = null;
        }
      });

      const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payloadToSave)
      });

      const data = await res.json();

      if (res.ok) {
        alert("Profile updated successfully!");
      } else {
        alert("Database Error: " + (data.message || data.error));
      }
    } catch (err: any) {
      console.error(err);
      alert("System Crash: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your profile...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your personal information and documents securely.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">

        {/* AVATAR SECTION */}
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shadow-inner">
              {formData.profile_photo ? (
                <img src={formData.profile_photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-12 h-12 text-gray-300" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute bottom-0 right-0 bg-white text-gray-500 p-2 rounded-full border border-gray-200 shadow-sm hover:bg-gray-50 hover:text-gray-700 transition-colors disabled:opacity-50"
            >
              {uploadingAvatar ? (
                <span className="block w-4 h-4 rounded-full border-2 border-gray-300 border-t-gray-600 animate-spin"></span>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
              )}
            </button>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={(e) => handleFileUpload(e, 'avatar')} />
          </div>
        </div>

        {/* PERSONAL DETAILS */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Personal Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name <span className="text-red-500">*</span></label>
              <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
              <input type="email" disabled value={formData.email} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Phone Number</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Gender</label>
              <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]">
                <option value="">Select Gender</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Date of Birth</label>
              <input type="date" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" />
            </div>
          </div>
        </div>

        {/* ADDRESS DETAILS */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Address Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Permanent Address</label>
              <input type="text" value={formData.permanent_address} onChange={e => setFormData({...formData, permanent_address: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">City</label>
              <input type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">State</label>
              <input type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">PIN Code</label>
              <input type="text" value={formData.pin_code} onChange={e => setFormData({...formData, pin_code: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" />
            </div>
          </div>
        </div>

        {/* OCCUPATION DETAILS */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Occupation Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Occupation Type</label>
              <select value={formData.occupation_type} onChange={e => setFormData({...formData, occupation_type: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]">
                <option value="">Select Type</option>
                <option value="STUDENT">Student</option>
                <option value="WORKING_PROFESSIONAL">Working Professional</option>
                <option value="BUSINESS">Business</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Company / College Name</label>
              <input type="text" value={formData.company_name} onChange={e => setFormData({...formData, company_name: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Job Title / Course Name</label>
              <input type="text" value={formData.job_title} onChange={e => setFormData({...formData, job_title: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" />
            </div>
          </div>
        </div>

        {/* EMERGENCY CONTACT */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Emergency Contact</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Contact Name</label>
              <input type="text" value={formData.emergency_contact_name} onChange={e => setFormData({...formData, emergency_contact_name: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Relationship</label>
              <input type="text" placeholder="e.g. Father, Sister" value={formData.emergency_contact_relationship} onChange={e => setFormData({...formData, emergency_contact_relationship: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Contact Number</label>
              <input type="tel" value={formData.emergency_contact_number} onChange={e => setFormData({...formData, emergency_contact_number: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" />
            </div>
          </div>
        </div>

        {/* IDENTITY VERIFICATION */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Identity Verification</h2>
            {formData.aadhaar_url && <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-1 rounded uppercase tracking-widest">Document Securely Uploaded</span>}
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Aadhaar / ID Number</label>
              <input type="text" placeholder="XXXX XXXX XXXX" value={formData.aadhaar_number} onChange={e => setFormData({...formData, aadhaar_number: e.target.value})} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Upload ID Document</label>
              <input
                type="file"
                onChange={(e) => handleFileUpload(e, 'document')}
                disabled={uploadingId}
                className="w-full border border-gray-200 p-2 text-sm rounded-lg file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer transition-colors"
              />
              {uploadingId && <p className="text-xs text-gray-500 mt-2 flex items-center gap-2"><span className="block w-3 h-3 rounded-full border-2 border-gray-300 border-t-[#1c6456] animate-spin"></span> Uploading to secure vault...</p>}
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 pb-12">
          <button type="submit" disabled={saving || uploadingAvatar || uploadingId} className="bg-[#1c6456] hover:bg-[#144f43] text-white px-8 py-3 rounded-lg font-bold text-sm transition-colors shadow-sm disabled:opacity-50">
            {saving ? 'Saving Profile...' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

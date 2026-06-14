"use client";

import React, { useEffect, useState } from 'react';

export default function OwnerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    gender: '',
    date_of_birth: '',
    permanent_address: '',
    city: '',
    state: '',
    pin_code: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('rentora_token');
        const res = await fetch(`${API_URL}/api/users/profile`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.status === 'success' && data.user) {
          const safeData = Object.fromEntries(
            Object.entries(data.user).map(([key, value]) => [key, value === null ? '' : value])
          );
          setFormData(prev => ({ ...prev, ...safeData }));
        }
      } catch (error) {
        console.error('Fetch profile error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.full_name.trim()) {
      return alert('Full Name is required.');
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('rentora_token');
      const payload = {
        full_name: formData.full_name,
        phone: formData.phone || null,
        gender: formData.gender || null,
        date_of_birth: formData.date_of_birth || null,
        permanent_address: formData.permanent_address || null,
        city: formData.city || null,
        state: formData.state || null,
        pin_code: formData.pin_code || null,
      };

      const res = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        alert('Profile updated successfully!');
      } else {
        alert(data.message || data.error || 'Unable to save profile.');
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message || 'System error while saving profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your profile...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your personal information and address details.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Personal Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Full Name <span className="text-red-500">*</span></label>
              <input required type="text" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Email Address</label>
              <input type="email" disabled value={formData.email} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Phone Number</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Gender</label>
              <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]">
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Date of Birth</label>
              <input type="date" value={formData.date_of_birth} onChange={e => setFormData({ ...formData, date_of_birth: e.target.value })} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" />
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Address Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">Permanent Address</label>
              <input type="text" value={formData.permanent_address} onChange={e => setFormData({ ...formData, permanent_address: e.target.value })} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">City</label>
              <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">State</label>
              <input type="text" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">PIN Code</label>
              <input type="text" value={formData.pin_code} onChange={e => setFormData({ ...formData, pin_code: e.target.value })} className="w-full border border-gray-200 p-2.5 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4 pb-12">
          <button type="submit" disabled={saving} className="bg-[#1c6456] hover:bg-[#144f43] text-white px-8 py-3 rounded-lg font-bold text-sm transition-colors shadow-sm disabled:opacity-50">
            {saving ? 'Saving Profile...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
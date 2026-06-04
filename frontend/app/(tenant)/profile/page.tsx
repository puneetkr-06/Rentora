"use client";

import React, { useState, useEffect } from 'react';

export default function TenantProfilePage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    full_name: '', email: '', phone: '', gender: '', date_of_birth: '',
    permanent_address: '', city: '', state: '', pin_code: '',
    occupation_type: '', company_name: '', job_title: '',
    emergency_contact_name: '', emergency_contact_relationship: '', emergency_contact_number: '',
    aadhaar_number: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('rentora_token');
        const response = await fetch('http://localhost:5001/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.status === 'success') {
          // Merge incoming data with our default empty strings to avoid undefined errors
          setFormData(prev => ({ ...prev, ...data.user }));
        }
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('rentora_token');
      const response = await fetch('http://localhost:5001/api/users/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading profile details...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Complete your profile to share necessary verification details with your property owner.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-8">
        
        {/* 1. PERSONAL DETAILS */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-[#1c6456] border-b pb-2 mb-4">Personal Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Full Name</label>
              <input type="text" name="full_name" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" value={formData.full_name || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Email Address</label>
              <input type="email" disabled className="w-full px-4 py-2 border bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed" value={formData.email || ''} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Phone Number</label>
              <input type="tel" name="phone" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" value={formData.phone || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Gender</label>
              <select name="gender" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" value={formData.gender || ''} onChange={handleChange}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Date of Birth</label>
              <input type="date" name="date_of_birth" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" value={formData.date_of_birth || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Profile Photo</label>
              <input type="file" accept="image/*" className="w-full px-4 py-1.5 border rounded-lg text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#1c6456]/10 file:text-[#1c6456] hover:file:bg-[#1c6456]/20" />
            </div>
          </div>
        </div>

        {/* 2. ADDRESS DETAILS */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-[#1c6456] border-b pb-2 mb-4">Address Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-900 mb-1">Permanent Address</label>
              <input type="text" name="permanent_address" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" value={formData.permanent_address || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">City</label>
              <input type="text" name="city" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" value={formData.city || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">State</label>
              <input type="text" name="state" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" value={formData.state || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">PIN Code</label>
              <input type="text" name="pin_code" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" value={formData.pin_code || ''} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* 3. OCCUPATION DETAILS */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-[#1c6456] border-b pb-2 mb-4">Occupation Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Occupation Type</label>
              <select name="occupation_type" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" value={formData.occupation_type || ''} onChange={handleChange}>
                <option value="">Select Type</option>
                <option value="Student">Student</option>
                <option value="Working Professional">Working Professional</option>
                <option value="Business">Business</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Company / College Name</label>
              <input type="text" name="company_name" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" value={formData.company_name || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Job Title / Course Name</label>
              <input type="text" name="job_title" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" value={formData.job_title || ''} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* 4. EMERGENCY CONTACT */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-[#1c6456] border-b pb-2 mb-4">Emergency Contact</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Contact Name</label>
              <input type="text" name="emergency_contact_name" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" value={formData.emergency_contact_name || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Relationship</label>
              <input type="text" name="emergency_contact_relationship" placeholder="e.g. Parent, Sibling" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" value={formData.emergency_contact_relationship || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Contact Number</label>
              <input type="tel" name="emergency_contact_number" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" value={formData.emergency_contact_number || ''} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* 5. IDENTITY VERIFICATION */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-5">
          <h2 className="text-lg font-bold text-[#1c6456] border-b pb-2 mb-4">Identity Verification</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Government ID Number</label>
              <input type="text" name="aadhaar_number" placeholder="e.g., [Aadhaar Redacted]" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" value={formData.aadhaar_number || ''} onChange={handleChange} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Upload ID Document</label>
              <input type="file" accept=".pdf, image/*" className="w-full px-4 py-1.5 border rounded-lg text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#1c6456]/10 file:text-[#1c6456] hover:file:bg-[#1c6456]/20" />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button type="submit" disabled={isSaving} className="bg-[#1c6456] hover:bg-[#144f43] text-white px-8 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 shadow-sm">
            {isSaving ? 'Saving Changes...' : 'Save Complete Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
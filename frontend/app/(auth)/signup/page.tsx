"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 1. Import your brand new Modal Component
import HowItWorksModal from '@/components/auth/HowItWorksModal';

export default function SignUpPage() {
  const router = useRouter();
  
  // State to hold form data and API feedback
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'TENANT' // Default selection
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // 2. Add state to control the Tutorial Modal
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Safely use environment variables for deployment
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role.toUpperCase()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to sign up');
      }

      // If successful, send them to the login page to sign in
      router.push('/login');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 relative">
      
      {/* 3. The newly designed Header area with the Modal Trigger Button */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create a new account</h2>
        
        <button 
          onClick={() => setIsTutorialOpen(true)}
          type="button"
          className="mt-2 text-sm text-[#1c6456] font-semibold hover:text-[#144f43] transition-colors flex items-center justify-center gap-1.5 mx-auto bg-green-50 px-3 py-1.5 rounded-full border border-green-100 hover:bg-green-100"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          First time here? See how Rentora works
        </button>
      </div>
      
      {/* Display errors if they occur */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selection */}
        <div className="flex gap-4 mb-2">
          <label className={`flex-1 relative flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${formData.role === 'TENANT' ? 'bg-[#1c6456]/5 border-[#1c6456]' : 'border-gray-200 hover:bg-gray-50'}`}>
            <input 
              type="radio" 
              name="role" 
              value="TENANT" 
              className="sr-only" 
              checked={formData.role === 'TENANT'}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            />
            <span className="text-sm font-medium text-gray-900">Tenant</span>
          </label>
          <label className={`flex-1 relative flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-all ${formData.role === 'OWNER' ? 'bg-[#1c6456]/5 border-[#1c6456]' : 'border-gray-200 hover:bg-gray-50'}`}>
            <input 
              type="radio" 
              name="role" 
              value="OWNER" 
              className="sr-only" 
              checked={formData.role === 'OWNER'}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            />
            <span className="text-sm font-medium text-gray-900">Property Owner</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            placeholder="John Doe"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456] transition-colors"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456] transition-colors"
            required
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Create a strong password"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456] transition-colors"
            required
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-[#1c6456] hover:bg-[#144f43] text-white font-medium text-sm py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1c6456] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-[#1c6456] hover:underline">
          Sign in
        </Link>
      </div>

      {/* 4. Mount the Modal so it pops up securely when triggered */}
      <HowItWorksModal 
        isOpen={isTutorialOpen} 
        onClose={() => setIsTutorialOpen(false)} 
      />
    </div>
  );
}
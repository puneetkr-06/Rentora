"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log("1. Sending login request to backend...");
           const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("2. Backend responded with:", data);

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to login');
      }

      // Safely extract token regardless of what the backend named it
      const secureToken = data.token || data.access_token || data.session?.access_token;

      if (!secureToken) {
        throw new Error("Backend login succeeded, but no token was returned!");
      }

      console.log("3. Saving token to Local Storage...");
      localStorage.setItem('rentora_token', secureToken);
      localStorage.setItem('rentora_user', JSON.stringify(data.user));

      console.log("4. Redirecting to dashboard...");
      if (data.user.role === 'OWNER') {
        router.push('/owner/dashboard');
      } else {
        router.push('/dashboard');
      }

    } catch (err: any) {
      console.error("LOGIN CRASHED:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Sign in to your account</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5" htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456] transition-colors"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
            <Link href="/forgot-password" className="text-xs font-medium text-[#1c6456] hover:underline">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456] transition-colors"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-[#1c6456] hover:bg-[#144f43] text-white font-medium text-sm py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1c6456] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link href="/signup" className="font-medium text-[#1c6456] hover:underline">
          Create one
        </Link>
      </div>
    </div>
  );
}
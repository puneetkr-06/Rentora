"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Overview', href: '/dashboard', icon: '📊' },
    { name: 'My Rental', href: '/properties', icon: '🏠' },
    { name: 'Billing', href: '/billing', icon: '💳' },
    { name: 'Community', href: '/community', icon: '💬' },
    { name: 'Profile', href: '/profile', icon: '👤' },
  ];

  return (
    <div className="flex h-screen bg-transparent overflow-hidden">
      
      {/* MOBILE HEADER (Only visible on small screens) */}
      <div className="md:hidden absolute top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40 shadow-sm">
        <div className="font-bold text-xl text-[#1c6456] tracking-tight">Rentora</div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-gray-600 hover:text-gray-900 focus:outline-none"
        >
          {/* Hamburger Icon */}
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
          </svg>
        </button>
      </div>

      {/* MOBILE MENU OVERLAY (Darkens background when menu is open) */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-900/50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR (Responsive behavior) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:relative md:translate-x-0
      `}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100 justify-between">
          <div className="font-bold text-2xl text-[#1c6456] tracking-tight">Rentora</div>
          {/* Mobile close button inside sidebar */}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500 text-xl">✕</button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link 
                key={link.name} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)} // Close menu on click for mobile
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-[#1c6456]/10 text-[#1c6456]' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                {/* <span>{link.icon}</span> */}
                {link.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-100">
          <button 
            onClick={() => { localStorage.removeItem('rentora_token'); window.location.href = '/login'; }} 
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative overflow-y-auto pt-16 md:pt-0">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
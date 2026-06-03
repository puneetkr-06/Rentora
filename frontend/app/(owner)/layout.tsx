"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Overview', href: '/owner/dashboard', icon: LayoutGridIcon },
    { name: 'Properties', href: '/owner/properties', icon: BuildingIcon },
    { name: 'Billing', href: '/owner/billing', icon: CreditCardIcon },
    { name: 'Community', href: '/owner/community', icon: MessageSquareIcon },
  ];

  // Dynamically set titles to match your design screens
  const getPageTitle = () => {
    if (pathname.includes('/properties')) return 'Property operations';
    if (pathname.includes('/billing')) return 'Rent collection';
    if (pathname.includes('/community')) return 'Community moderation';
    return 'Owner command center';
  };

  return (
    <div className="flex h-screen bg-gray-50/30">
      {/* SIDEBAR */}
      <aside className="w-[260px] bg-[#fafafa] border-r border-gray-200 flex flex-col hidden md:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#111827] rounded-xl flex items-center justify-center text-white shrink-0">
            <HomeIcon />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Rentora</h1>
            <p className="text-xs text-gray-500 font-medium">Property OS</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#111827] text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <link.icon className={`w-4 h-4 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                {link.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-20 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">{getPageTitle()}</h2>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
              <SearchIcon />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors relative">
              <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              <BellIcon />
            </button>
            <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-[#111827] text-white hover:bg-gray-800 transition-colors ml-1">
              <UserIcon />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto px-8 pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}

function HomeIcon(props: any) { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>; }
function LayoutGridIcon(props: any) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>; }
function BuildingIcon(props: any) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/></svg>; }
function CreditCardIcon(props: any) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>; }
function MessageSquareIcon(props: any) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
function SearchIcon(props: any) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>; }
function BellIcon(props: any) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>; }
function UserIcon(props: any) { return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
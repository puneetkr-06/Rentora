"use client";

import React from 'react';

export default function HowItWorksModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#1c6456] p-6 text-white flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Welcome to Rentora</h2>
            <p className="text-emerald-100 text-sm mt-1">The easiest way to manage your rental experience.</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-emerald-200 text-2xl font-bold transition-colors">
            ✕
          </button>
        </div>

        {/* Content - Side by Side */}
        <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">
          
          {/* OWNER SECTION */}
          <div className="flex-1 p-8 bg-gray-50/50">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center text-xl mb-4">
              🏢
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">For Property Owners</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">1</span>
                <p className="text-sm text-gray-600"><strong>Add your property</strong> and divide it into rooms or clusters.</p>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">2</span>
                <p className="text-sm text-gray-600"><strong>Generate an Invite Code</strong> for a specific room and share it.</p>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">3</span>
                <p className="text-sm text-gray-600"><strong>Automate billing.</strong> Rentora automatically generates monthly invoices for your tenants.</p>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold shrink-0">4</span>
                <p className="text-sm text-gray-600"><strong>Track everything</strong> from rent collections to maintenance complaints in one dashboard.</p>
              </li>
            </ul>
          </div>

          {/* TENANT SECTION */}
          <div className="flex-1 p-8 bg-white">
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-xl flex items-center justify-center text-xl mb-4">
              🔑
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">For Tenants</h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold shrink-0">1</span>
                <p className="text-sm text-gray-600"><strong>Get an Invite Code</strong> directly from your landlord.</p>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold shrink-0">2</span>
                <p className="text-sm text-gray-600"><strong>Enter the code</strong> during signup to instantly join your specific room.</p>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold shrink-0">3</span>
                <p className="text-sm text-gray-600"><strong>Pay Rent securely.</strong> View your monthly dues and payment history.</p>
              </li>
              <li className="flex gap-3">
                <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold shrink-0">4</span>
                <p className="text-sm text-gray-600"><strong>Raise complaints</strong> and view digital noticeboards from your owner.</p>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-[#1c6456] text-white font-bold rounded-lg hover:bg-[#14493e] transition-colors"
          >
            Got it, let's sign up!
          </button>
        </div>
      </div>
    </div>
  );
}
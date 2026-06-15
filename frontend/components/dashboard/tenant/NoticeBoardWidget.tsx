"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NoticeBoardWidget() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const token = sessionStorage.getItem('rentora_token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL;

        const res = await fetch(`${API_URL}/api/notices/tenant`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const data = await res.json();
        
        if (data.status === 'success') {
          setNotices(data.notices);
        }
      } catch (err) {
        console.error("Failed to fetch notices:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-900">Notice Board</h3>
        <span className="text-[10px] font-bold bg-[#1c6456]/10 text-[#1c6456] px-2 py-1 rounded uppercase tracking-wider">
          Live Alerts
        </span>
      </div>
      
      <div className="p-5 flex-1 overflow-y-auto space-y-5 max-h-[400px]">
        {loading ? (
          <p className="text-sm text-gray-400 text-center py-4">Checking for alerts...</p>
        ) : notices.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2 opacity-50">📭</div>
            <p className="text-sm text-gray-500">No active notices for your properties.</p>
          </div>
        ) : (
          notices.map(notice => (
            <div key={notice.id} className={`border-l-4 pl-4 py-1 ${notice.type === 'URGENT' ? 'border-red-500' : notice.type === 'MAINTENANCE' ? 'border-orange-400' : 'border-[#1c6456]'}`}>
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-sm font-bold text-gray-900">{notice.title}</h4>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${notice.type === 'URGENT' ? 'bg-red-50 text-red-600' : notice.type === 'MAINTENANCE' ? 'bg-orange-50 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                  {notice.type}
                </span>
              </div>
              
              {/* PROPERTY TAG */}
              <div className="flex items-center gap-1 mb-2">
                <span className="text-xs text-gray-400">📍</span>
                <span className="text-[10px] font-semibold text-gray-500 tracking-wide uppercase">
                  {notice.properties?.name || 'Unknown Property'}
                </span>
                <span className="text-gray-300 mx-1">•</span>
                <span className="text-[10px] text-gray-400">
                  {new Date(notice.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <p className="text-xs text-gray-600 leading-relaxed">{notice.content}</p>
            </div>
          ))
        )}
      </div>

      <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl">
        <p className="text-xs text-gray-500 mb-3 text-center">Facing an issue in your room?</p>
        <Link href="/community?tab=maintenance" className="block w-full bg-white border border-[#1c6456] text-[#1c6456] hover:bg-[#1c6456] hover:text-white py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm text-center">
          Raise a Complaint
        </Link>
      </div>
    </div>
  );
}
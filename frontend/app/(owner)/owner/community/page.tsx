import React from 'react';

export default function OwnerCommunity() {
  return (
    <div className="pt-2 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Complaints Feed */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <h3 className="font-semibold text-gray-900 text-base">Complaints</h3>
        <div className="space-y-2.5">
          <OwnerTicketRow title="Bathroom tap leakage" status="In progress" priority="Medium" />
          <OwnerTicketRow title="Corridor light issue" status="Resolved" priority="Low" />
          <OwnerTicketRow title="Payment receipt request" status="Closed" priority="Low" />
        </div>
      </div>

      {/* Notice Board Moderation */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 text-base mb-4">Notice board</h3>
          <div className="space-y-3">
            <OwnerNoticeItem icon="🔔" title="Water tank cleaning" desc="Scheduled for Sunday, 7 AM" />
            <OwnerNoticeItem icon="📄" title="Agreement renewal" desc="Expires in 28 days" />
            <OwnerNoticeItem icon="🔑" title="Visitor pass approved" desc="Valid today until 9 PM" />
          </div>
        </div>

        {/* Broadcast System Input */}
        <div className="mt-6 flex gap-2">
          <input 
            type="text" 
            placeholder="Broadcast a notice" 
            className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]"
          />
          <button className="p-2.5 bg-[#111827] text-white rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="22" x2="11" y1="2" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
      </div>

    </div>
  );
}

function OwnerTicketRow({ title, status, priority }: any) {
  return (
    <div className="p-3.5 border border-gray-100 bg-gray-50/60 rounded-xl flex justify-between items-center">
      <div>
        <p className="text-sm font-semibold text-gray-900 leading-tight">{title}</p>
        <p className="text-xs text-gray-400 font-medium mt-1">{status}</p>
      </div>
      <span className="text-[11px] font-bold bg-white text-gray-500 px-2.5 py-1 rounded border border-gray-200/80 shadow-sm">{priority}</span>
    </div>
  );
}

function OwnerNoticeItem({ icon, title, desc }: any) {
  return (
    <div className="p-3.5 border border-gray-100 rounded-xl flex gap-3.5 items-center bg-white">
      <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-sm shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-semibold text-gray-900 leading-tight">{title}</p>
        <p className="text-xs text-gray-400 font-medium mt-0.5">{desc}</p>
      </div>
    </div>
  );
}
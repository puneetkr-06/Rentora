import React from 'react';

export default function OwnerDashboard() {
  return (
    <div className="pt-2 max-w-6xl mx-auto space-y-6">
      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard title="Monthly revenue" value="₹2,84,500" detail="+12.4%" iconColor="text-emerald-600" bgIcon="bg-emerald-50" icon="₹" />
        <SummaryCard title="Occupied rooms" value="128 / 146" detail="87.7%" iconColor="text-blue-600" bgIcon="bg-blue-50" icon="🏢" />
        <SummaryCard title="Pending dues" value="₹42,800" detail="9 invoices" iconColor="text-amber-600" bgIcon="bg-amber-50" icon="📄" />
        <SummaryCard title="Open complaints" value="14" detail="3 urgent" iconColor="text-rose-600" bgIcon="bg-rose-50" icon="🔧" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart Section */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 text-base">Revenue and occupancy</h3>
              <p className="text-xs text-gray-500 mt-0.5">Live operating snapshot for this month</p>
            </div>
            <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#1c6456] text-white rounded-lg hover:bg-[#144f43] transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
              Export
            </button>
          </div>
          
          <div className="h-52 flex items-end justify-between gap-3 pt-4">
            {[
              { m: 'Jan', h: '55%' },
              { m: 'Feb', h: '72%' },
              { m: 'Mar', h: '62%' },
              { m: 'Apr', h: '88%' },
              { m: 'May', h: '68%' },
              { m: 'Jun', h: '92%' }
            ].map((item) => (
              <div key={item.m} className="w-full flex flex-col items-center gap-2.5">
                <div className="w-full bg-[#1c6456] rounded-t-md transition-all duration-300 hover:brightness-95" style={{ height: item.h }}></div>
                <span className="text-xs font-medium text-gray-400">{item.m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights Module */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-semibold text-gray-900 text-base">AI insights</h3>
          <div className="space-y-2.5">
            <InsightRow title="Collection risk" desc="3 tenants may miss the next rent window" type="danger" />
            <InsightRow title="Vacancy forecast" desc="Palm Nest PG needs pricing review" type="info" />
            <InsightRow title="Assistant" desc="Ask: Which tenants have unpaid rent?" type="stars" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value, detail, icon, iconColor, bgIcon }: any) {
  return (
    <div className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm flex flex-col relative overflow-hidden">
      <div className="flex justify-between items-start">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{title}</span>
        <div className={`w-7 h-7 rounded-lg ${bgIcon} ${iconColor} flex items-center justify-center text-sm font-bold`}>{icon}</div>
      </div>
      <span className="text-2xl font-bold text-gray-900 tracking-tight mt-2">{value}</span>
      <span className="text-xs font-medium text-gray-500 mt-1">{detail}</span>
    </div>
  );
}

function InsightRow({ title, desc, type }: { title: string, desc: string, type: 'danger' | 'info' | 'stars' }) {
  const getIcon = () => {
    if (type === 'danger') return '⚠️';
    if (type === 'info') return '📈';
    return '✨';
  };
  return (
    <div className="p-3.5 border border-gray-100 bg-gray-50/70 rounded-xl flex gap-3 items-start">
      <div className="text-sm mt-0.5">{getIcon()}</div>
      <div>
        <p className="text-sm font-semibold text-gray-900 leading-tight">{title}</p>
        <p className="text-xs text-gray-500 mt-1 leading-normal">{desc}</p>
      </div>
    </div>
  );
}
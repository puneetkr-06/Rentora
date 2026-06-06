import React from 'react';

export default function NoticeBoardWidget() {
  // Mock notices until we build the Community API
  const mockNotices = [
    { id: 1, title: "Water Supply Interruption", date: "Today, 2:00 PM", type: "URGENT" },
    { id: 2, title: "Monthly Pest Control", date: "Oct 15, 10:00 AM", type: "GENERAL" }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-full">
      <div className="p-5 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-gray-900">Notice Board</h3>
      </div>
      
      <div className="p-5 flex-1 space-y-4">
        {mockNotices.map(notice => (
          <div key={notice.id} className="border-l-2 border-[#1c6456] pl-3 py-1">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-semibold text-gray-900">{notice.title}</h4>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ${notice.type === 'URGENT' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                {notice.type}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">{notice.date}</p>
          </div>
        ))}
      </div>

      <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-xl">
        <p className="text-xs text-gray-500 mb-3 text-center">Facing an issue in your room?</p>
        <button className="w-full bg-white border border-[#1c6456] text-[#1c6456] hover:bg-[#1c6456] hover:text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          Raise a Complaint
        </button>
      </div>
    </div>
  );
}
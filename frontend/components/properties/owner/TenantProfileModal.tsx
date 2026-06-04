import React from 'react';

export default function TenantProfileModal({ isOpen, setIsTenantModalOpen, selectedRoom, activeLease, tenant, setIsDeleteRoomModalOpen, handleDeallocate, isDeallocating }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
      <div className="bg-white p-6 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Room {selectedRoom?.room_number} Profile</h2>
            <p className="text-sm text-gray-500">Lease Started: {activeLease?.start_date ? new Date(activeLease.start_date).toLocaleDateString() : 'N/A'}</p>
          </div>
          <button onClick={() => setIsTenantModalOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
        </div>

        {tenant ? (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-[#1c6456] uppercase tracking-wider mb-3">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div><span className="block text-xs text-gray-500">Full Name</span><span className="font-semibold">{tenant.full_name || 'Not Provided'}</span></div>
                <div><span className="block text-xs text-gray-500">Phone Number</span><span className="font-semibold">{tenant.phone || 'Not Provided'}</span></div>
                <div><span className="block text-xs text-gray-500">Email</span><span className="font-semibold">{tenant.email}</span></div>
                <div><span className="block text-xs text-gray-500">Gender / DOB</span><span className="font-semibold">{tenant.gender || 'N/A'} • {tenant.date_of_birth || 'N/A'}</span></div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1c6456] uppercase tracking-wider mb-3">Identity & Occupation</h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div><span className="block text-xs text-gray-500">Government ID Number</span><span className="font-mono text-sm">{tenant.aadhaar_number || 'Not Uploaded'}</span></div>
                <div><span className="block text-xs text-gray-500">Occupation Type</span><span className="font-semibold">{tenant.occupation_type || 'Not Provided'}</span></div>
                <div className="col-span-2"><span className="block text-xs text-gray-500">Company / College</span><span className="font-semibold">{tenant.company_name || 'N/A'} - {tenant.job_title || 'N/A'}</span></div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1c6456] uppercase tracking-wider mb-3">Address & Emergency</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Permanent Address</span>
                  <p className="text-sm font-semibold">{tenant.permanent_address || 'Not Provided'}</p>
                  <p className="text-sm font-semibold">{tenant.city} {tenant.state} {tenant.pin_code}</p>
                </div>
                <div>
                  <span className="block text-xs text-gray-500 mb-1">Emergency Contact</span>
                  <p className="text-sm font-semibold">{tenant.emergency_contact_name || 'Not Provided'}</p>
                  <p className="text-sm font-semibold text-gray-600">{tenant.emergency_contact_relationship}</p>
                  <p className="text-sm font-semibold">{tenant.emergency_contact_number}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
            The tenant has joined but has not filled out their profile details yet.
          </div>
        )}

        <div className="mt-8 pt-4 border-t flex justify-between items-center">
          <button onClick={() => setIsDeleteRoomModalOpen(true)} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1">
            🗑️ Delete Room
          </button>
          <button onClick={handleDeallocate} disabled={isDeallocating} className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
            {isDeallocating ? 'Processing...' : 'Deallocate Tenant'}
          </button>
        </div>
      </div>
    </div>
  );
}
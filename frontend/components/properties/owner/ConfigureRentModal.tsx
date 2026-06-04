import React from 'react';

export default function ConfigureRentModal({ isOpen, setIsRoomModalOpen, selectedRoom, generatedJoinId, rentalData, setRentalData, setIsDeleteRoomModalOpen, handleUpdateRoom }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-40">
      <div className="bg-white p-6 rounded-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Rent Room {selectedRoom?.room_number}</h2>
          <button onClick={() => setIsRoomModalOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
        </div>
        {generatedJoinId ? (
          <div className="text-center py-6">
            <p className="text-sm text-gray-600 mb-4">Share this code with your tenant to join:</p>
            <div className="bg-gray-50 border border-gray-200 text-3xl font-mono font-bold text-[#1c6456] py-4 rounded-xl tracking-widest">{generatedJoinId}</div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-gray-500 mb-4">Set the final terms. Generating a code will lock these in.</p>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Lease Start Date</label>
              <input 
                type="date" required 
                className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" 
                value={rentalData.startDate}
                onChange={e => setRentalData({...rentalData, startDate: e.target.value})} 
              />
              <p className="text-[10px] text-gray-400 mt-1">Rent is collected in advance. Next billing cycle calculates from this date.</p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Final Base Rent (₹)</label>
              <input 
                type="number" placeholder="e.g. 6000" 
                className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" 
                value={rentalData.rentPrice}
                onChange={e => setRentalData({...rentalData, rentPrice: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Electricity (₹/unit)</label>
                <input 
                  type="number" placeholder="e.g. 8 (Optional)" 
                  className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" 
                  value={rentalData.electricityRate}
                  onChange={e => setRentalData({...rentalData, electricityRate: e.target.value})} 
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Initial Meter Reading</label>
                <input 
                  type="number" placeholder="e.g. 1450 (Optional)" 
                  className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" 
                  value={rentalData.meterReading}
                  onChange={e => setRentalData({...rentalData, meterReading: e.target.value})} 
                />
              </div>
            </div>
            <div className="pt-4 border-t flex justify-between items-center mt-4">
              <button onClick={() => setIsDeleteRoomModalOpen(true)} className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1">
                🗑️ Delete Room
              </button>
              <button onClick={handleUpdateRoom} className="bg-[#1c6456] hover:bg-[#144f43] text-white px-4 py-2.5 rounded-lg font-medium text-sm transition-colors">
                Save & Generate Code
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
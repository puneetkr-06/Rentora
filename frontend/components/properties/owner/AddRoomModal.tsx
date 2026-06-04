import React from 'react';

export default function AddRoomModal({ isOpen, setIsAddRoomModalOpen, handleAddRoom, newRoomData, setNewRoomData, isAddingRoom }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-40">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-gray-900">Add New Room</h2>
          <button onClick={() => setIsAddRoomModalOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
        </div>
        <form onSubmit={handleAddRoom} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Room Number/Name</label>
            <input 
              type="text" required placeholder="e.g. F1R6 or Shop 2" 
              className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" 
              value={newRoomData.room_number}
              onChange={e => setNewRoomData({...newRoomData, room_number: e.target.value})} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Base Rent (₹)</label>
              <input 
                type="number" required min="0" placeholder="5000" 
                className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" 
                value={newRoomData.rent_amount}
                onChange={e => setNewRoomData({...newRoomData, rent_amount: e.target.value})} 
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Room Type</label>
              <select 
                className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]"
                value={newRoomData.type}
                onChange={e => setNewRoomData({...newRoomData, type: e.target.value})}
              >
                <option value="SINGLE">Single</option>
                <option value="SHARED">Shared</option>
                <option value="COMMERCIAL">Commercial/Shop</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Capacity (Persons)</label>
            <input 
              type="number" required min="1" 
              className="w-full border p-2 rounded-lg text-sm focus:ring-2 focus:ring-[#1c6456]/20 focus:border-[#1c6456]" 
              value={newRoomData.capacity}
              onChange={e => setNewRoomData({...newRoomData, capacity: parseInt(e.target.value) || 1})} 
            />
          </div>
          <div className="pt-4 mt-2 flex gap-3 border-t border-gray-100">
            <button type="button" onClick={() => setIsAddRoomModalOpen(false)} className="flex-1 bg-gray-50 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isAddingRoom} className="flex-1 bg-[#1c6456] hover:bg-[#144f43] text-white py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
              {isAddingRoom ? 'Adding...' : 'Add Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
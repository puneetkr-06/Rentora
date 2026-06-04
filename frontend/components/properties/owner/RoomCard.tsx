import React from 'react';

export default function RoomCard({ room, openRoomModal, openLedgerModal }: any) {
  return (
    <div className={`border p-4 rounded-xl shadow-sm transition-colors flex flex-col ${room.status === 'VACANT' ? 'bg-white hover:border-[#1c6456]/40' : 'bg-gray-50 border-[#1c6456]/20'}`}>
      <div className="flex justify-between items-start mb-2">
         <h3 className="font-bold text-lg">{room.room_number}</h3>
         <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${room.status === 'VACANT' ? 'bg-green-50 text-green-700' : 'bg-[#1c6456]/10 text-[#1c6456]'}`}>
           {room.status}
         </span>
      </div>
      <p className="text-sm text-gray-500 mb-4 flex-1">Base Rent: ₹{room.rent_amount}</p>
      
      {room.status === 'VACANT' ? (
        <button 
          onClick={() => openRoomModal(room)}
          className="w-full py-2 rounded-lg text-sm font-medium transition-colors bg-[#1c6456] text-white hover:bg-[#144f43]"
        >
          Configure & Rent
        </button>
      ) : (
        <div className="flex gap-2 w-full">
          <button 
            onClick={() => openRoomModal(room)}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors bg-white border border-gray-200 text-[#1c6456] hover:bg-gray-50"
          >
            Tenant Info
          </button>
          <button 
            onClick={() => openLedgerModal(room)}
            className="flex-1 py-2 rounded-lg text-xs font-medium transition-colors bg-[#1c6456]/10 border border-[#1c6456]/20 text-[#1c6456] hover:bg-[#1c6456]/20"
          >
            Ledger
          </button>
        </div>
      )}
    </div>
  );
}
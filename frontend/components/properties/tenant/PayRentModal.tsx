import React from 'react';

export default function PayRentModal({ isOpen, setIsOpen, rental }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Pay Rent</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center mb-6">
          <p className="text-sm text-gray-500 font-medium mb-1">Amount Due</p>
          <h3 className="text-3xl font-bold text-gray-900">₹{rental?.deposit_amount || 0}</h3>
        </div>

        <div className="space-y-3 mb-6">
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border border-[#1c6456] flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-[#1c6456]"></div>
              </div>
              <span className="text-sm font-medium">UPI / Net Banking</span>
            </div>
            <span className="text-xs text-gray-400">Zero fee</span>
          </label>
          <label className="flex items-center justify-between p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors opacity-60">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full border border-gray-300"></div>
              <span className="text-sm font-medium">Credit / Debit Card</span>
            </div>
            <span className="text-xs text-gray-400">+2% fee</span>
          </label>
        </div>

        <button className="w-full bg-[#1c6456] hover:bg-[#144f43] text-white py-3 rounded-lg font-medium transition-colors shadow-sm">
          Proceed to Secure Payment
        </button>
      </div>
    </div>
  );
}
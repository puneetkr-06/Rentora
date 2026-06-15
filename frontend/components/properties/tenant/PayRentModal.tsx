import React, { useState } from 'react';
const API_URL = process.env.NEXT_PUBLIC_API_URL;
export default function PayRentModal({ isOpen, setIsOpen, rental }: any) {
  const [isPaying, setIsPaying] = useState(false);

  if (!isOpen || !rental) return null;

  const handlePayment = async () => {
    setIsPaying(true);
    try {
      const token = sessionStorage.getItem('rentora_token');
      const response = await fetch(`${API_URL}/api/payments/dummy-pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          lease_id: rental.id,
          amount: rental.deposit_amount
        })
      });

      if (response.ok) {
        alert("Payment Successful! Your ledger has been updated.");
        setIsOpen(false);
      } else {
        alert("Payment failed.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Pay Rent</h2>
          <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-900">✕</button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-center mb-6">
          <p className="text-sm text-gray-500 font-medium mb-1">Amount Due</p>
          <h3 className="text-3xl font-bold text-gray-900">₹{rental.deposit_amount || 0}</h3>
        </div>

        <button 
          onClick={handlePayment}
          disabled={isPaying}
          className="w-full bg-[#1c6456] hover:bg-[#144f43] text-white py-3 rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
        >
          {isPaying ? 'Processing...' : 'Proceed to Secure Payment (Dummy)'}
        </button>
      </div>
    </div>
  );
}
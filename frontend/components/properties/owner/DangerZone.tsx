import React from 'react';

export default function DangerZone({ setIsDeletePropertyModalOpen }: any) {
  return (
    <div className="mt-16 pt-8 border-t border-red-100">
      <h3 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h3>
      <p className="text-sm text-gray-500 mb-4">Permanently remove this property and all of its associated rooms and tenants from your portfolio.</p>
      <button 
        onClick={() => setIsDeletePropertyModalOpen(true)}
        className="bg-white border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Remove Property
      </button>
    </div>
  );
}
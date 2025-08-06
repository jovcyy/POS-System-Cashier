import React from 'react';
import { Store, Receipt } from 'lucide-react';

interface HeaderProps {
  onTransactionHistoryClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onTransactionHistoryClick }) => {
  return (
    <header className="bg-[#1F2937] text-white shadow-lg">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo and Title */}
          <div className="flex items-center">
            <Store className="h-8 w-8 mr-3" style={{ color: '#38b6ff' }} />
            <h1 className="text-xl font-bold">Afflatus POS</h1>
          </div>
          {/* Right: Cashier Info, Transaction History, Settings, User, Sign Out */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm">Sarah Johnson</span>
              <span className="text-xs text-gray-300">Cashier #001</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onTransactionHistoryClick}
                className="p-2 text-gray-300 hover:text-white transition-colors"
                title="Transaction History"
              >
                <Receipt className="w-5 h-5" />
              </button>
          
              <button
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#E5E7EB] hover:bg-red-700 transition-colors"
              >
                <span className="text-sm text-black">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
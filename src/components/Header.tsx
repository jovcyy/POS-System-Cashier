import React from 'react';
import { Store, User, Settings, Receipt } from 'lucide-react';

interface HeaderProps {
  onTransactionHistoryClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onTransactionHistoryClick }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Afflatus Food Services</h1>
              <p className="text-xs text-gray-500">Cashier Terminal</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">Sarah Johnson</p>
              <p className="text-xs text-gray-500">Cashier #001</p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onTransactionHistoryClick}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Transaction History"
              >
                <Receipt className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
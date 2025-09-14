import React, { useState, useMemo } from 'react';
import { X, Receipt, Search, Calendar, Filter, Banknote, Smartphone } from 'lucide-react';
import { Transaction } from '../types';

interface TransactionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

export const TransactionHistoryModal: React.FC<TransactionHistoryModalProps> = ({
  isOpen,
  onClose,
  transactions
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const matchesSearch = transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           transaction.items.some(item => 
                             item.product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
                           );
      
      const matchesPaymentMethod = selectedPaymentMethod === '' || 
                                  transaction.paymentMethod === selectedPaymentMethod;
      
      const matchesDate = dateFilter === '' || 
                         transaction.timestamp.toDateString() === new Date(dateFilter).toDateString();
      
      return matchesSearch && matchesPaymentMethod && matchesDate;
    });
  }, [transactions, searchTerm, selectedPaymentMethod, dateFilter]);

  const totalRevenue = filteredTransactions.reduce((sum, transaction) => sum + transaction.total, 0);
  const totalTransactions = filteredTransactions.length;

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="w-4 h-4" />;
      case 'digital':
        return <Smartphone className="w-4 h-4" />;
      default:
        return <Receipt className="w-4 h-4" />;
    }
  };

  const getPaymentColor = (method: string) => {
    switch (method) {
      case 'cash':
        return 'text-green-600 bg-green-100';
      case 'digital':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-gray-900">{totalTransactions}</div>
              <div className="text-sm text-gray-600">Total Transactions</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">₱{totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-gray-600">Total Revenue</div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                ₱{totalTransactions > 0 ? (totalRevenue / totalTransactions).toFixed(2) : '0.00'}
              </div>
              <div className="text-sm text-gray-600">Average Transaction</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none"
              >
                <option value="">All Payment Methods</option>
                <option value="cash">Cash</option>
                <option value="digital">Digital</option>
              </select>
            </div>
            
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <div className="flex-1 overflow-y-auto max-h-96">
          {filteredTransactions.length === 0 ? (
            <div className="p-8 text-center">
              <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Receipt className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          Transaction #{transaction.id.slice(-8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ₱{transaction.total.toFixed(2)}
                      </div>
                      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium capitalize ${getPaymentColor(transaction.paymentMethod)}`}>
                        {getPaymentIcon(transaction.paymentMethod)}
                        {transaction.paymentMethod}
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Items: </span>
                        <span className="font-medium">{transaction.items.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Subtotal: </span>
                        <span className="font-medium">₱{transaction.subtotal.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <div className="text-xs text-gray-600 mb-1">Items:</div>
                      <div className="flex flex-wrap gap-1">
                        {transaction.items.slice(0, 3).map((item, index) => (
                          <span key={index} className="inline-block bg-white px-2 py-1 rounded text-xs">
                            {item.product.product_name} x {item.quantity}
                          </span>
                        ))}
                        {transaction.items.length > 3 && (
                          <span className="inline-block bg-white px-2 py-1 rounded text-xs text-gray-500">
                            +{transaction.items.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-150"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
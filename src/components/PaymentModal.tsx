import React, { useState } from 'react';
import { X, Banknote, Smartphone, Check } from 'lucide-react';
// You can replace this with a real QR code image or a QR code generator
const GCASH_QR_URL = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GCASH-1234567890';
import { CartItem } from '../types';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  onPaymentComplete: (paymentMethod: 'cash' | 'digital') => void;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  items,
  total,
  onPaymentComplete
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'cash' | 'digital'>('cash');
  const [cashAmount, setCashAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  if (!isOpen) return null;

  const handlePayment = async () => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsComplete(true);

    setTimeout(() => {
      onPaymentComplete(selectedMethod);
      setIsComplete(false);
      setCashAmount('');
    }, 1500);
  };

  const cashChange = cashAmount ? Math.max(0, parseFloat(cashAmount) - total) : 0;
  const canProcessPayment = selectedMethod !== 'cash' || (cashAmount && parseFloat(cashAmount) >= total);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl max-w-md w-full mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {isComplete ? (
          <div className="p-8 text-center overflow-y-auto flex-1">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Successful!</h3>
            <p className="text-gray-600">Transaction completed successfully</p>
          </div>
        ) : (
          <>
            {/* Scrollable Content */}
            <div className="overflow-y-auto px-6 py-4 flex-1">
              {/* Order Summary */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="space-y-2">
                    {items.slice(0, 3).map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span>{item.product.name} x{item.quantity}</span>
                        <span>₱{(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    {items.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{items.length - 3} more items
                      </div>
                    )}
                  </div>
                  <div className="border-t border-gray-200 pt-2 mt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>₱{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setSelectedMethod('cash')}
                    className={`w-full p-4 rounded-lg border-2 transition-colors flex items-center gap-3 ${
                      selectedMethod === 'cash'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Banknote className="w-6 h-6 text-green-600" />
                    <span className="font-medium">Cash</span>
                  </button>

                  <button
                    onClick={() => setSelectedMethod('digital')}
                    className={`w-full p-4 rounded-lg border-2 transition-colors flex items-center gap-3 ${
                      selectedMethod === 'digital'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Smartphone className="w-6 h-6 text-purple-600" />
                    <span className="font-medium">Gcash</span>
                  </button>
                </div>
              </div>

              {/* Cash Input */}
              {selectedMethod === 'cash' && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cash Amount Received
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  {cashChange > 0 && (
                    <p className="text-sm text-green-600 mt-2 font-medium">
                      Change due: ₱{cashChange.toFixed(2)}
                    </p>
                  )}
                </div>
              )}

              {/* Gcash QR Code */}
              {selectedMethod === 'digital' && (
                <div className="mb-6 flex flex-col items-center">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scan to pay with Gcash
                  </label>
                  <img src={GCASH_QR_URL} alt="Gcash QR Code" className="w-36 h-36 rounded-lg border" />
                  <p className="text-xs text-gray-500 mt-2">Gcash Account: 1234 567 890</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200">
              <button
                onClick={handlePayment}
                disabled={!canProcessPayment || isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-150"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing...
                  </div>
                ) : (
                  `Process Payment - ₱${total.toFixed(2)}`
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

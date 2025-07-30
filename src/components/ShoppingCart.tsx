import React from 'react';
import { Minus, Plus, Trash2, ShoppingCart as CartIcon } from 'lucide-react';
import { CartItem } from '../types';

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const taxRate = 0.08; // 8% tax
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <CartIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Shopping Cart</h2>
        </div>
        <div className="text-center py-8">
          <CartIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">Your cart is empty</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <CartIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-900">Shopping Cart</h2>
          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
            {items.reduce((sum, item) => sum + item.quantity, 0)}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div key={item.product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
              {item.product.image ? (
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <CartIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{item.product.name}</h3>
              <p className="text-sm text-gray-500">₱{item.product.price.toFixed(2)} each</p>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity(item.product.id, Math.max(0, item.quantity - 1))}
                className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              
              <span className="w-8 text-center font-medium">{item.quantity}</span>
              
              <button
                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            
            <div className="text-right">
              <p className="font-bold text-gray-900">
                ₱{(item.product.price * item.quantity).toFixed(2)}
              </p>
              <button
                onClick={() => onRemoveItem(item.product.id)}
                className="text-red-500 hover:text-red-700 transition-colors mt-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">₱{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (8%):</span>
            <span className="font-medium">₱{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
            <span>Total:</span>
            <span>₱{total.toFixed(2)}</span>
          </div>
        </div>
        
        <button
          onClick={onCheckout}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-150"
        >
          Checkout - ₱{total.toFixed(2)}
        </button>
      </div>
    </div>
  );
};
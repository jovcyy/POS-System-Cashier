import React, { useState, useRef, useEffect } from 'react';
import { Minus, Plus, Trash2, ShoppingCart as CartIcon, Check, Gift } from 'lucide-react';
import { CartItem } from '../types';

interface Promo {
  code: string;
  label: string;
  discountPercent: number; // e.g., 10 for 10%
}

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onCheckout: () => void;
}

const PROMOS: Promo[] = [
  { code: 'NONE', label: 'No Promo', discountPercent: 0 },
  { code: 'WELCOME10', label: 'Welcome 10% Off', discountPercent: 10 },
  { code: 'SAVE20', label: 'Save 20%', discountPercent: 20 },
];

// --- PromoDropdown component, now inside this file ---
interface PromoDropdownProps {
  promos: Promo[];
  selected: Promo;
  onChange: (promo: Promo) => void;
}

const PromoDropdown: React.FC<PromoDropdownProps> = ({
  promos,
  selected,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="w-full px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm flex items-center justify-between gap-3 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <Gift className="w-4 h-4 text-blue-500" />
          <span>{selected.label}</span>
          {selected.discountPercent > 0 && (
            <span className="ml-2 text-green-600 text-xs font-semibold bg-green-100 rounded-full px-2 py-0.5">
              -{selected.discountPercent}%
            </span>
          )}
        </span>
        <svg className={`w-4 h-4 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <ul
          className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
          role="listbox"
        >
          {promos.map((promo) => (
            <li
              key={promo.code}
              className={`flex items-center px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                promo.code === selected.code ? 'bg-blue-100 font-semibold' : ''
              }`}
              onClick={() => {
                onChange(promo);
                setOpen(false);
              }}
              role="option"
              aria-selected={promo.code === selected.code}
            >
              <Gift className="w-4 h-4 text-blue-500 mr-2" />
              <span>{promo.label}</span>
              {promo.discountPercent > 0 && (
                <span className="ml-2 text-green-600 text-xs font-semibold bg-green-100 rounded-full px-2 py-0.5">
                  -{promo.discountPercent}%
                </span>
              )}
              {promo.code === selected.code && (
                <Check className="w-4 h-4 text-blue-700 ml-auto" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
// --- end PromoDropdown ---

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout
}) => {
  const [selectedPromo, setSelectedPromo] = useState<Promo>(PROMOS[0]);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = (subtotal * selectedPromo.discountPercent) / 100;
  const taxRate = 0.12; // 12% tax rate
  const tax = (subtotal - discount) * taxRate;
  const total = subtotal - discount + tax;

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

      <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">₱{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Promo Discount ({selectedPromo.discountPercent}%):</span>
            <span className="font-medium text-green-600">-₱{discount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax (12%):</span>
            <span className="font-medium">₱{tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
            <span>Total:</span>
            <span>₱{total.toFixed(2)}</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Choose Promo</label>
          <PromoDropdown
            promos={PROMOS}
            selected={selectedPromo}
            onChange={setSelectedPromo}
          />
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
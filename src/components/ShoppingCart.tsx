import React, { useState, useRef, useEffect } from 'react';
import { Minus, Plus, Trash2, ShoppingCart as CartIcon, Check, Gift } from 'lucide-react';
import { CartItem } from '../types';
import { Promotion, getPromotions } from '../api/promotionsAPI';
import { Product, getProducts } from '../api/productAPI';

interface ShoppingCartProps {
  items: CartItem[];
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveItem: (productId: number) => void;
  onCheckout: (checkoutData: {
    items: CartItem[];
    subtotal: number;
    discount: number;
    tax: number;
    total: number;
    promo: Promotion | null;
    bogoFreeItemId: number | null;
  }) => void;
}

interface PromoDropdownProps {
  promos: Promotion[];
  selected: Promotion | null; // allow null
  onChange: (promo: Promotion | null) => void; // also allow null
  products: Product[];
}

export const ShoppingCart: React.FC<ShoppingCartProps> = ({
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}) => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedPromo, setSelectedPromo] = useState<Promotion | null>(null);
  const [selectedBogoId, setSelectedBogoId] = useState<number | null>(null);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const taxRate = 0.12;

  // Load promotions and products
  useEffect(() => {
    async function loadData() {
      const [promotionRes, productRes] = await Promise.all([
        getPromotions(),
        getProducts(),
      ]);
      setPromotions(promotionRes);
      setProducts(productRes);
      if (promotionRes.length > 0 && !selectedPromo) setSelectedPromo(null);
    }
    loadData();
  }, [selectedPromo]);

  useEffect(() => {
    setSelectedPromo(null); // clear selected promo
    setSelectedBogoId(null); // clear selected BOGO item
  }, [items]); // runs whenever `items` changes

  // Auto-select first eligible BOGO item when promo changes
  useEffect(() => {
    if (selectedPromo?.type === 'bogo' && !selectedBogoId) {
      const eligibleItems = items.filter((item) => 
        selectedPromo.products.length === 0 || selectedPromo.products.includes(item.product.id)
      );
      if (eligibleItems.length > 0) {
        setSelectedBogoId(eligibleItems[0].product.id);
        console.log('Auto-selected BOGO item:', eligibleItems[0].product.id);
      }
    }
  }, [selectedPromo, items, selectedBogoId]);

  // --- PromoDropdown component ---
  const PromoDropdown: React.FC<PromoDropdownProps> = ({ promos, selected, onChange, products }) => {
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

    const getDiscountText = (promo: Promotion) => {
      if (promo.type === 'bogo') {
        const names = promo.products
          .map((id) => products.find((p) => p.id === id)?.product_name)
          .filter(Boolean)
          .join(', ');
        return `${promo.value} free of ${names || 'any item'}`;
      } else if (promo.type === 'percentage') {
        return `${promo.value}%`;
      } else {
        return `₱${promo.value}`;
      }
    };

    // Filter promotions by date, value & cart
    const now = new Date();
    const filteredPromos = promos.filter((promo) => {
      if (promo.value <= 0) return false;
      const start = new Date(promo.start_date);
      const end = new Date(promo.end_date);
      if (now < start || now > end) return false;

      // Time frame check
      if (promo.start_time_frame && promo.end_time_frame) {
        const [startH, startM] = promo.start_time_frame.split(':').map(Number);
        const [endH, endM] = promo.end_time_frame.split(':').map(Number);
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        if (currentMinutes < startMinutes || currentMinutes > endMinutes) return false;
      }

      // Check if promo applies to items in cart
      const cartProductIds = items.map((i) => i.product.id);
      return promo.products.length === 0 || promo.products.some((id) => cartProductIds.includes(id));
    });

    return (
      <div ref={ref} className="relative">
        <button
          type="button"
          className="w-full px-4 py-2 border border-gray-300 bg-white rounded-md shadow-sm flex items-center justify-between gap-3 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={filteredPromos.length === 0}
        >
          <span className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-blue-500" />
            <span>{selected ? selected.name : filteredPromos.length > 0 ? "Select Promo" : "No Promo Available"}</span>
            {selected && (
              <span className="ml-2 text-green-600 text-xs font-semibold bg-green-100 rounded-full px-2 py-0.5">
                {getDiscountText(selected)}
              </span>
            )}
          </span>
          <svg
            className={`w-4 h-4 ml-2 transition-transform ${open ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <ul
            className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
            role="listbox"
          >
            {filteredPromos.map((promo) => (
              <li
                key={promo.id}
                className={`flex items-center px-4 py-2 cursor-pointer hover:bg-blue-50 ${
                  selected && promo.id === selected.id ? "bg-blue-100 font-semibold" : ""
                }`}
                onClick={() => {
                  onChange(promo);
                  setOpen(false);
                }}
                role="option"
                aria-selected={selected != null && promo.id === selected.id}
              >
                <Gift className="w-4 h-4 text-blue-500 flex-shrink-0 mr-2" />
                <span className="flex-1 min-w-0 truncate">
                  {promo.name}
                </span>
                <span className="ml-2 flex-shrink-0 text-green-600 text-xs font-semibold bg-green-100 rounded-full px-2 py-0.5 max-w-[120px] truncate">
                  {getDiscountText(promo)}
                </span>
                {selected && promo.id === selected.id && (
                  <Check className="w-4 h-4 text-blue-700 ml-2 flex-shrink-0" />
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };

  // --- Calculate discount ---
  let promoDiscount = 0;
  const bogoEligibleItems = selectedPromo?.type === 'bogo'
    ? items.filter((item) => 
        selectedPromo.products.length === 0 || selectedPromo.products.includes(item.product.id)
      )
    : [];

  // Only fixed or percentage promos affect the subtotal
  if (selectedPromo) {
    if (selectedPromo.type === 'fixed') {
      promoDiscount = selectedPromo.value;
    } else if (selectedPromo.type === 'percentage') {
      promoDiscount = (subtotal * selectedPromo.value) / 100;
    }
    // BOGO does not affect subtotal
  }

  const totalAfterDiscount = subtotal - promoDiscount;
  const tax = totalAfterDiscount * taxRate;
  const total = totalAfterDiscount + tax;

  // Handle checkout with proper BOGO item selection
  const handleCheckoutClick = () => {
    let finalBogoFreeItemId = selectedBogoId;

    // If BOGO promo is selected but no free item is chosen, auto-select the first eligible item
    if (selectedPromo?.type === 'bogo' && !selectedBogoId && bogoEligibleItems.length > 0) {
      finalBogoFreeItemId = bogoEligibleItems[0].product.id;
      console.log('Auto-selecting first eligible BOGO item:', finalBogoFreeItemId);
    }

    console.log('=== ShoppingCart Checkout Debug ===');
    console.log('selectedPromo:', selectedPromo);
    console.log('selectedBogoId:', selectedBogoId);
    console.log('finalBogoFreeItemId:', finalBogoFreeItemId);
    console.log('bogoEligibleItems:', bogoEligibleItems);

    onCheckout({
      items,
      subtotal,
      discount: promoDiscount,
      tax,
      total,
      promo: selectedPromo,
      bogoFreeItemId: finalBogoFreeItemId
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center gap-3">
        <CartIcon className="w-6 h-6 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-900">Shopping Cart</h2>
        <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
          {items.reduce((sum, item) => sum + item.quantity, 0)}
        </span>
      </div>

      {/* Items */}
      <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div key={item.product.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-white rounded-lg overflow-hidden flex-shrink-0">
              {item.product.picture ? (
                <img src={item.product.picture} alt={item.product.product_name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <CartIcon className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-gray-900 truncate">{item.product.product_name}</h3>
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
              <p className="font-bold text-gray-900">₱{(item.product.price * item.quantity).toFixed(2)}</p>
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

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal:</span>
            <span className="font-medium">₱{subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Promo Discount:</span>
            <span className="font-medium text-green-600">-₱{promoDiscount.toFixed(2)}</span>
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

        {/* Promotion selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Choose Promo</label>
          {promotions.length > 0 && (
            <PromoDropdown
              promos={promotions}
              selected={selectedPromo}
              onChange={setSelectedPromo}
              products={products} // for BOGO names
            />
          )}
        </div>

        {/* BOGO selection */}
        {selectedPromo?.type === 'bogo' && bogoEligibleItems.length > 0 && (
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Choose free item:</label>
            <select
              className="w-full border border-gray-300 rounded-md px-3 py-2"
              value={selectedBogoId || ''}
              onChange={(e) => setSelectedBogoId(Number(e.target.value) || null)}
            >
              <option value="">Select free item...</option>
              {bogoEligibleItems.map((item) => (
                <option key={item.product.id} value={item.product.id}>
                  {item.product.product_name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Checkout */}
        <button
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-150"
          onClick={handleCheckoutClick}
        >
          Checkout - ₱{total.toFixed(2)}
        </button>
      </div>
    </div>
  );
};
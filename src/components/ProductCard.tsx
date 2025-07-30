import React from 'react';
import { Plus, Package } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const isLowStock = product.stock < 10;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <div className="aspect-square overflow-hidden bg-gray-100">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-gray-900 text-xs leading-tight line-clamp-2 flex-1 mr-2">
            {product.name}
          </h3>
          <div className={`text-xs px-1.5 py-0.5 rounded-full font-medium whitespace-nowrap ${
            isLowStock 
              ? 'bg-amber-100 text-amber-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {product.stock}
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-bold text-gray-900">
            ₱{product.price.toFixed(2)}
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
            {product.category}
          </span>
        </div>
        
        <button
          onClick={() => onAddToCart(product)}
          disabled={product.stock === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-2 px-3 rounded-lg transition-colors duration-150 flex items-center justify-center gap-1.5 text-xs"
        >
          <Plus className="w-3 h-3" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};
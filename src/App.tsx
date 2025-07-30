import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { ProductSearch } from './components/ProductSearch';
import { ProductCard } from './components/ProductCard';
import { ShoppingCart } from './components/ShoppingCart';
import { PaymentModal } from './components/PaymentModal';
import { TransactionHistoryModal } from './components/TransactionHistoryModal';
import { sampleProducts } from './data/products';
import { Product, CartItem, Transaction } from './types';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState('');

  // Get unique categories
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(sampleProducts.map(product => product.category))];
    return uniqueCategories.sort();
  }, []);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return sampleProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.barcode.includes(searchTerm);
      const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
      const matchesBusiness = selectedBusiness === '' || product.business === selectedBusiness;
      return matchesSearch && matchesCategory && matchesBusiness;
    });
  }, [searchTerm, selectedCategory, selectedBusiness]);

  const handleAddToCart = (product: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { product, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveItem(productId);
    } else {
      setCartItems(prevItems =>
        prevItems.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const handleBarcodeScan = () => {
    // Simulate barcode scanning - in a real app, this would integrate with a scanner
    const barcodes = sampleProducts.map(p => p.barcode);
    const randomBarcode = barcodes[Math.floor(Math.random() * barcodes.length)];
    setSearchTerm(randomBarcode);
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const taxRate = 0.08;
    const tax = subtotal * taxRate;
    return subtotal + tax;
  };

  const handlePaymentComplete = (paymentMethod: 'cash' |'digital') => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const taxRate = 0.08;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    const transaction: Transaction = {
      id: Date.now().toString(),
      items: [...cartItems],
      subtotal,
      tax,
      total,
      paymentMethod,
      timestamp: new Date()
    };

    setTransactions(prev => [transaction, ...prev]);
    setCartItems([]);
    setIsPaymentModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onTransactionHistoryClick={() => setIsTransactionHistoryOpen(true)} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Section */}
          <div className="lg:col-span-2 space-y-6">
            <ProductSearch
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              categories={categories}
              onBarcodeScan={handleBarcodeScan}
              selectedBusiness={selectedBusiness}
              onBusinessChange={setSelectedBusiness}
            />
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Products ({filteredProducts.length})
              </h2>
              
              {filteredProducts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Cart Section */}
          <div className="space-y-6">
            <ShoppingCart
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
              onCheckout={() => setIsPaymentModalOpen(true)}
            />

            {transactions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {transactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          #{transaction.id.slice(-6)}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          ${transaction.total.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{transaction.items.length} items</span>
                        <span className="capitalize">{transaction.paymentMethod}</span>
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {transaction.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        items={cartItems}
        total={calculateTotal()}
        onPaymentComplete={handlePaymentComplete}
      />

      <TransactionHistoryModal
        isOpen={isTransactionHistoryOpen}
        onClose={() => setIsTransactionHistoryOpen(false)}
        transactions={transactions}
      />
    </div>
  );
}

export default App;
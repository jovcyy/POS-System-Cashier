import { useState, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { ProductSearch } from './components/ProductSearch';
import { ProductCard } from './components/ProductCard';
import { ShoppingCart } from './components/ShoppingCart';
import { PaymentModal } from './components/PaymentModal';
import { TransactionHistoryModal } from './components/TransactionHistoryModal';
import { CartItem, Transaction } from './types';
import { getProducts, Product } from './api/productAPI';
import { Promotion } from './api/promotionsAPI';

function App() {
  const [products, setProducts] = useState<Product[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isTransactionHistoryOpen, setIsTransactionHistoryOpen] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState(0);
  const [checkoutData, setCheckoutData] = useState<{
      items: CartItem[];
      subtotal: number;
      discount: number;
      tax: number;
      total: number;
      promo: Promotion | null;
      bogoFreeItemId: number | null;
    } | null>(null);
  
  const getAvailableStock = (product: Product, cartItems: CartItem[], bogoFreeItemId?: number) => {
    const inCart = cartItems.find(item => item.product.id === product.id);
    let stock = product.stock - (inCart?.quantity || 0);

    // If this product is a BOGO free item, subtract 1 more
    if (bogoFreeItemId === product.id) {
      stock -= 1;
    }

    return Math.max(stock, 0);
  };
    
  const handleCheckout = (checkoutData: {
      items: CartItem[];
      subtotal: number;
      discount: number;
      tax: number;
      total: number;
      promo: Promotion | null;
      bogoFreeItemId: number | null;
    }) => {
    // Use the checkout data exactly as passed from ShoppingCart
    // No need to recalculate or override anything
    console.log('App - Received checkout data:', checkoutData);
    setCheckoutData(checkoutData);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentComplete = async (paymentInfo: { method: 'cash' | 'digital'; refNumber?: string }) => {
    if (!checkoutData) return;

    const payload = {
      employee_id: 1, // replace with logged-in user ID
      branch_id: 1,   // replace with selected branch
      payment_method: paymentInfo.method === 'cash' ? 'Cash' : 'E-Wallet',
      ref_number: paymentInfo.method === 'digital' ? paymentInfo.refNumber : null,
      promo_id: checkoutData.promo?.id ?? null,
      items: checkoutData.items.map(i => ({
        product_id: i.product.id,
        quantity: i.quantity,
        price: i.product.price
      })),
      bogo_free_id: checkoutData.bogoFreeItemId ?? null,
      subtotal: checkoutData.subtotal,
      discount: checkoutData.discount,
      total: checkoutData.total
    };

    try {
      const res = await fetch('http://localhost:5000/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      console.log('Transaction saved:', result);

      // Clear cart
      setCartItems([]);
      setCheckoutData(null);
      setIsPaymentModalOpen(false);

      setTransactions(prev => [
        {
          id: result.id.toString(),
          items: checkoutData.items,
          subtotal: checkoutData.subtotal,
          tax: checkoutData.tax,
          total: checkoutData.total,
          paymentMethod: paymentInfo.method,
          timestamp: new Date()
        },
        ...prev
      ]);

    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  };

  useEffect (() => {
    async function loadData () {
      const [productRes] = await Promise.all([
        getProducts()
      ]);

      setProducts(productRes);
    }
    loadData();
  }, [])

  // Get unique categories
  const categories = useMemo(() => {
    // Filter products if a specific business is selected
    const filteredProducts =
      selectedBusiness && selectedBusiness !== 0
        ? products.filter(product => product.branch_brand_id === selectedBusiness)
        : products;

    // Get unique categories
    const uniqueCategories = [...new Set(filteredProducts.map(p => p.category))];

    // Optional: sort alphabetically
    return uniqueCategories.sort();
  }, [products, selectedBusiness]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch =
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase());
    
      const matchesCategory =
        selectedCategory === '' || product.category === selectedCategory;
    
      const matchesBusiness =
        selectedBusiness === 0 || product.branch_brand_id === Number(selectedBusiness);
    
      return matchesSearch && matchesCategory && matchesBusiness;
    });
  }, [searchTerm, selectedCategory, selectedBusiness, products]);

  const handleAddToCart = (product: Product) => {
    const availableStock = getAvailableStock(product, cartItems, checkoutData?.bogoFreeItemId ?? undefined);
    
    if (availableStock <= 0) {
      alert("Product is out of stock!");
      return;
    }
  
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

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    const product = products.find(p => p.id === productId);
    const availableStock = getAvailableStock(product!, cartItems, checkoutData?.bogoFreeItemId ?? undefined);

    if (quantity > availableStock) {
      alert(`Cannot add more than ${availableStock} items`);
      return;
    }

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

  const handleRemoveItem = (productId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
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
                  {filteredProducts.map(product => {
                    const availableStock = getAvailableStock(product, cartItems, checkoutData?.bogoFreeItemId ?? undefined);
                                    
                    return (
                      <ProductCard
                        key={product.id}
                        product={{ ...product, stock: availableStock }}
                        onAddToCart={handleAddToCart}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Cart Section */}
          <div className="space-y-6">
            <div className="sticky top-6">
              <ShoppingCart
                items={cartItems}
                onUpdateQuantity={handleUpdateQuantity}
                onRemoveItem={handleRemoveItem}
                onCheckout={handleCheckout} // This will pass all the correct data
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
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        checkoutData={checkoutData} // Use the checkout data exactly as received from cart
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
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
import { BranchBrand, getBranchBrands } from './api/staticAPI';  // import the getBranchBrands API
import { getTransactions, getTransactionProducts } from './api/staticAPI';

export interface Profile {
  id: number;
  email: string;
  full_name: string;
  role: 'Owner' | 'Super Admin' | 'Admin' | 'Staff';
  branch_id: number | null;
  is_active: boolean;
  created_at: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'Owner' | 'Super Admin' | 'Admin' | 'Staff';
  branch_id: number | null;
  is_active: boolean;
  created_at: string;
  // Other user-related fields can be added here if needed
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [branchBrands, setBranchBrands] = useState<BranchBrand[]>([]); // Store the branch-brand data

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
    total: number;
    promo: Promotion | null;
    bogoFreeItemId: number | null;
  } | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profile, setProfile] = useState<any>(null); // Store the received profile data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<any>(null); // Store the received user data
  const [loading, setLoading] = useState(true); // Loading state for initial data fetch
  const [reloadFlag, setReloadFlag] = useState(false); // Flag to trigger re-fetching data

  const [pageSize, setPageSize] = useState(5); // Default page size is 5
  const [currentPage, setCurrentPage] = useState(1);


  useEffect(() => {
    async function fetchData() {
      // Fetch user data
      const response = await fetch('http://localhost:5000/getData/user_data');
      if (response.ok) {
        const { data } = await response.json();
        setUser(data.user);
        setProfile(data.profile);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('profile', JSON.stringify(data.profile));
      } else {
        const storedUser = localStorage.getItem('user');
        const storedProfile = localStorage.getItem('profile');
      
        if (storedUser && storedProfile) {
          setUser(JSON.parse(storedUser));
          setProfile(JSON.parse(storedProfile));
        } else {
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false); // Set loading to false after fetching user data
    }
  
    fetchData();
  }, []); // Empty dependency array to run once when the component mounts

  useEffect(() => {
    async function loadProducts() {
      // Fetch data (products, transactions, and transaction products)
      const [productRes, branchBrandRes, transactionRes, TPRes] = await Promise.all([
        getProducts(),
        getBranchBrands(),
        getTransactions(),
        getTransactionProducts(),
      ]);
    
      // Combine transactions with their products
      const combinedTransactions = transactionRes.map((transaction) => {
        // Group transaction products by product_id and sum quantities
        const productMap: Record<number, { quantity: number; price: number }> = {};
      
        TPRes.forEach((tp) => {
          if (tp.transaction_id === transaction.id) {
            if (productMap[tp.product_id]) {
              productMap[tp.product_id].quantity += tp.quantity;
            } else {
              productMap[tp.product_id] = { quantity: tp.quantity, price: tp.price };
            }
          }
        });
      
        // Now build CartItems by using the aggregated data from productMap
        const items: CartItem[] = Object.entries(productMap).map(([productId, { quantity }]) => {
          const product = productRes.find((prod) => prod.id === parseInt(productId));
        
          return {
            product: product!,
            quantity,
          };
        });
      
        // Calculate the subtotal and total for the transaction
        const subtotal = items.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
        const total = subtotal - transaction.discount_amount; // Assuming discount_amount is part of the transaction data
      
        // Convert payment_method to the correct value and assign to paymentMethod
        const paymentMethod: "cash" | "digital" = transaction.payment_method === "Cash" ? "cash" : "digital";
      
        return {
          ...transaction,
          items,
          subtotal,
          total,
          paymentMethod,  // Explicitly typed as "cash" or "digital"
          timestamp: new Date(transaction.created_at), // Convert timestamp to Date object
          id: String(transaction.id),                  // Convert id to string
        };
      });
    
      setProducts(productRes);
      setBranchBrands(branchBrandRes);
      setTransactions(combinedTransactions); // Use combined transaction data
      setLoading(false); // Mark loading as done
    }
    loadProducts();
  }, [reloadFlag]);


  // Redirect if there is no profile or user data and loading is done
  useEffect(() => {
    if (!loading && (!profile || !user)) {
      localStorage.clear();
      window.location.href = "http://localhost:5173/"; // Redirect to login page
    }
  }, [profile, user, loading]); // Depend on profile, user, and loading

  // Function to calculate available stock considering cart items and BOGO free item
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
    total: number;
    promo: Promotion | null;
    bogoFreeItemId: number | null;
  }) => {
    // Use the checkout data exactly as passed from ShoppingCart
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

    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
    // Trigger re-fetching of products and transactions
    setReloadFlag(prev => !prev);
  };

  // Get unique categories
  const categories = useMemo(() => {
    const filteredProducts =
      selectedBusiness && selectedBusiness !== 0
        ? products.filter(product => product.branch_brand_id === selectedBusiness)
        : products;

    const uniqueCategories = [...new Set(filteredProducts.map(p => p.category))];

    return uniqueCategories.sort();
  }, [products, selectedBusiness]);

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    const branchFilteredProducts = products.filter(product => {
      const matchesSearch =
        product.product_name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === '' || product.category === selectedCategory;

      const matchesBusiness =
        selectedBusiness === 0 || product.branch_brand_id === Number(selectedBusiness);

      // Filter based on branch_id using branch-brand relationship
      const matchesBranchBrand = branchBrands.some(
        (branchBrand) =>
          branchBrand.branch_id === profile?.branch_id && branchBrand.id === product.branch_brand_id
      );

      return matchesSearch && matchesCategory && matchesBusiness && matchesBranchBrand;
    });

    return branchFilteredProducts;
  }, [searchTerm, selectedCategory, selectedBusiness, products, profile, branchBrands]);

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

  const reversedTransactions = useMemo(() => {
    return [...transactions].reverse(); // Reverse the transactions
  }, [transactions]);

  const totalPages = useMemo(() => {
    return Math.ceil(reversedTransactions.length / pageSize);
  }, [reversedTransactions, pageSize]);

  const currentTransactions = useMemo(() => {
    return reversedTransactions.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize
    );
  }, [reversedTransactions, currentPage, pageSize]);

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setPageSize(Number(event.target.value)); // Change page size
    setCurrentPage(1); // Reset to the first page
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage); // Navigate to the new page
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onTransactionHistoryClick={() => setIsTransactionHistoryOpen(true)} profile={profile} />

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
              profile={profile}
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

              {currentTransactions.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
                  <div className="space-y-3 max-h-52 overflow-y-auto">
                    {currentTransactions.map((transaction) => (
                      <div key={transaction.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-sm font-medium text-gray-900">
                            #{transaction.id.slice(-6)}
                          </span>
                          <span className="text-sm font-bold text-gray-900">
                            ₱{transaction.total.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{transaction.items.length} items</span>
                          <span className="capitalize">{transaction.paymentMethod}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {transaction.timestamp.toLocaleString()} - {transaction.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Pagination Controls */}
                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Show</span>
                      <select
                        className="border rounded px-2 py-1 text-sm"
                        value={pageSize}
                        onChange={handlePageSizeChange}
                      >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={15}>15</option>
                        <option value={20}>20</option>
                      </select>
                      <span className="text-sm text-gray-500 ml-2">per page</span>
                    </div>
                          
                    <div className="text-sm text-gray-500">
                      <span>
                        Page {currentPage} of {totalPages}
                      </span>
                      <div className="mt-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
                        >
                          &lt; Prev
                        </button>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 ml-2"
                        >
                          Next &gt;
                        </button>
                      </div>
                    </div>
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

import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { 
  Branch,
  Brand,
  BranchBrand,
  getBranches,
  getBrands,
  getBranchBrands
} from '../api/staticAPI';

interface ProductSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categories: string[];
  selectedBusiness: number;
  onBusinessChange: (business: number) => void;
  profile: { branch_id: number }; // Profile prop to get the user's branch_id
}

export const ProductSearch: React.FC<ProductSearchProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  selectedBusiness,
  onBusinessChange,
  profile
}) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [bb, setBB] = useState<BranchBrand[]>([]);

  useEffect(() => {
    async function loadData() {
      const [branchRes, brandsRes, bbRes] = await Promise.all([
        getBranches(),
        getBrands(),
        getBranchBrands(),
      ]);
      setBranches(branchRes);
      setBrands(brandsRes);
      setBB(bbRes);
    }
    loadData();
  }, []);

  // Filter branch brands based on the user's branch_id
  const filteredBranchBrands = bb.filter(
    (branchBrand) => branchBrand.branch_id === profile.branch_id
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Search Bar and Scan Button */}
      <div className="flex gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Business Dropdown */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Business</label>
        <select
          value={selectedBusiness}
          onChange={(e) => onBusinessChange(Number(e.target.value))}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        >
          <option value={0}>Select a business</option>
          {filteredBranchBrands.map((item) => {
            const branchName = branches.find((b) => b.id === item.branch_id)?.branch_name || `Branch ${item.branch_id}`;
            const brandName = brands.find((br) => br.id === item.brand_id)?.brand_name || `Brand ${item.brand_id}`;
                    
            return (
              <option key={item.id} value={item.id}>
                {branchName} - {brandName}
              </option>
            );
          })}
        </select>
      </div>

      {/* Category Buttons */}
      <div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onCategoryChange('')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === ''
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

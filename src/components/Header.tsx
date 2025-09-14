import React, { useState, useEffect } from 'react';
import { Store, Receipt } from 'lucide-react';
import { getBranches, Branch } from '../api/staticAPI'; // Import getBranches and Branch
import { Profile } from '../App';

interface HeaderProps {
  onTransactionHistoryClick: () => void;
  profile: Profile; // Profile can be null if data is not loaded yet
}

export const Header: React.FC<HeaderProps> = ({ onTransactionHistoryClick, profile }) => {
  const [branches, setBranches] = useState<Branch[]>([]); // State to store fetched branches
  const [loading, setLoading] = useState(true); // State to handle loading state for branches

  // Fetch branches on component mount
  useEffect(() => {
    async function fetchBranches() {
      try {
        const fetchedBranches = await getBranches();
        setBranches(fetchedBranches); // Store branches
      } catch (err) {
        console.error("Error fetching branches", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBranches();
  }, []); // Only run once when the component mounts

  // Function to get branch name by ID
  const getBranchNameById = (branchId: number | null) => {
    if (!branchId) return "Unknown Branch"; // If no branch ID, return "Unknown Branch"
    const branch = branches.find(b => b.id === branchId);
    return branch ? branch.branch_name : "Unknown Branch"; // Return the branch name or fallback to "Unknown Branch"
  };

  // Handle Sign Out
  const handleSignOut = () => {
    window.location.replace("http://localhost:5173/"); // Redirect to login page
  };

  return (
    <header className="bg-[#1F2937] text-white shadow-lg">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Logo and Title */}
          <div className="flex items-center">
            <Store className="h-8 w-8 mr-3" style={{ color: '#38b6ff' }} />
            <h1 className="text-xl font-bold">Afflatus POS</h1>
          </div>

          {/* Right: Cashier Info, Transaction History, Settings, User, Sign Out */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm">{profile?.full_name || "Loading..."}</span>
              <span className="text-xs text-gray-300">
                {loading ? "Loading..." : `Cashier - ${getBranchNameById(profile?.branch_id ?? null)}`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onTransactionHistoryClick}
                className="p-2 text-gray-300 hover:text-white transition-colors"
                title="Transaction History"
              >
                <Receipt className="w-5 h-5" />
              </button>
          
              <button
                className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-[#E5E7EB] hover:bg-red-700 transition-colors"
                onClick={handleSignOut}
              >
                <span className="text-sm text-black">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

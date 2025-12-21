import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import RegisterBuyer from "./components/RegisterBuyer";
import RegisterSeller from "./components/RegisterSeller";
import PublicCatalog from "./components/PublicCatalog";
import CatalogDetail from "./components/CatalogDetail";
import SellerPage from "./components/SellerPage";
import CatalogCRUD from "./components/CatalogCRUD";
import AddCatalogItem from "./components/AddCatalogItem";
import EditCatalogItem from "./components/EditCatalogItem";
import UserCRUD from "./components/UserCRUD";
import AddUser from "./components/AddUser";
import EditUser from "./components/EditUser";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Settings from "./components/Settings";
import TransactionHistory from "./components/TransactionHistory";
import TransactionStats from "./components/TransactionStats";
import MiningPage from "./components/MiningPage";
import Leaderboard from "./components/Leaderboard";
import Navbar from "./components/Navbar";
import { useTheme } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";

const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8787';

function App() {
  const { isDark, toggleTheme } = useTheme();
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [userRole, setUserRole] = useState("");
  const [balance, setBalance] = useState(0);
  const [balanceFetched, setBalanceFetched] = useState(false);

  // Function to decode JWT token and get user role
  const getUserRole = (token) => {
    if (!token) return "";
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || "";
    } catch (error) {
      console.error("Error decoding token:", error);
      return "";
    }
  };

  // Function to get user ID from token
  const getUserId = (token) => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId || null;
    } catch {
      return null;
    }
  };

  // Function to fetch balance
  const fetchBalance = async (userId, role) => {
    if (!userId || !role || role === 'admin' || balanceFetched) return;
    try {
      setBalanceFetched(true);
      const res = await fetch(`${AUTH_URL}/auth/balance/${userId}/${role}`);
      const data = await res.json();
      setBalance(data.balance || 0);
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  useEffect(() => {
    // Initialize user role on first load
    setUserRole(getUserRole(token));
    setBalanceFetched(false); // Reset flag on mount
    const userId = getUserId(token);
    if (userId) {
      fetchBalance(userId, getUserRole(token));
    }
    
    const handleStorageChange = () => {
      const currentToken = localStorage.getItem("token") || "";
      setToken(currentToken);
      setUserRole(getUserRole(currentToken));
      setBalanceFetched(false); // Reset flag
      const currentUserId = getUserId(currentToken);
      if (currentUserId) {
        fetchBalance(currentUserId, getUserRole(currentToken));
      } else {
        setBalance(0);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    const handleBalanceChange = () => {
      setBalanceFetched(false); // Reset flag
      const currentUserId = getUserId(token);
      if (currentUserId) {
        fetchBalance(currentUserId, getUserRole(token));
      }
    };

    window.addEventListener("balanceChanged", handleBalanceChange);

    // Also check for changes within the same tab (less frequent)
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("token") || "";
      if (currentToken !== token) {
        setToken(currentToken);
        setUserRole(getUserRole(currentToken));
        setBalanceFetched(false); // Reset flag
      }
    }, 1000); // Check every 1 second instead of 100ms

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("balanceChanged", handleBalanceChange);
      clearInterval(interval);
    };
  }, [token]);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  return (
    <CartProvider>
      <Router>
        <div className={`min-h-screen pt-16 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
          <Navbar token={token} userRole={userRole} balance={balance} isDark={isDark} toggleTheme={toggleTheme} menuOpen={menuOpen} setMenuOpen={setMenuOpen} handleLogout={handleLogout} />

          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register-buyer" element={<RegisterBuyer />} />
            <Route path="/register-seller" element={<RegisterSeller />} />
            <Route path="/catalog" element={<PublicCatalog />} />
            <Route path="/catalog/:id" element={<CatalogDetail />} />
            <Route path="/seller/:userId" element={<SellerPage />} />
            <Route path="/cart" element={userRole === 'buyer' ? <Cart /> : <Navigate to="/" />} />
            <Route path="/checkout" element={userRole === 'buyer' ? <Checkout /> : <Navigate to="/" />} />
            <Route path="/dashboard" element={token && userRole === 'admin' ? <TransactionStats token={token} /> : <Navigate to="/" />} />
            <Route path="/manage-catalog" element={token && (userRole === 'admin' || userRole === 'seller') ? <CatalogCRUD token={token} userRole={userRole} /> : <Navigate to="/" />} />
            <Route path="/manage-catalog/add" element={token && (userRole === 'admin' || userRole === 'seller') ? <AddCatalogItem token={token} /> : <Navigate to="/" />} />
            <Route path="/manage-catalog/:id" element={token && (userRole === 'admin' || userRole === 'seller') ? <EditCatalogItem token={token} /> : <Navigate to="/" />} />
            <Route path="/manage-users" element={token && userRole === 'admin' ? <UserCRUD token={token} /> : <Navigate to="/" />} />
            <Route path="/manage-users/add" element={token && userRole === 'admin' ? <AddUser token={token} /> : <Navigate to="/" />} />
            <Route path="/manage-users/:id" element={token && userRole === 'admin' ? <EditUser token={token} /> : <Navigate to="/" />} />
            <Route path="/settings" element={token ? <Settings token={token} userRole={userRole} /> : <Navigate to="/" />} />
            <Route path="/transaction-history" element={token && (userRole === 'buyer' || userRole === 'seller') ? <TransactionHistory /> : <Navigate to="/" />} />
            <Route path="/mining" element={token && (userRole === 'buyer' || userRole === 'seller') ? <MiningPage token={token} /> : <Navigate to="/" />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;

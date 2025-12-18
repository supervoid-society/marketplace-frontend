import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import PublicCatalog from "./components/PublicCatalog";
import Dashboard from "./components/Dashboard";
import CatalogCRUD from "./components/CatalogCRUD";
import AddCatalogItem from "./components/AddCatalogItem";
import EditCatalogItem from "./components/EditCatalogItem";
import UserCRUD from "./components/UserCRUD";
import AddUser from "./components/AddUser";
import EditUser from "./components/EditUser";
import Cart from "./components/Cart";
import { useTheme } from "./contexts/ThemeContext";

const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL;
const CRUD_URL = import.meta.env.VITE_CRUD_SERVICE_URL;

function App() {
  const { isDark, toggleTheme } = useTheme();
  const [token, setToken] = useState(localStorage.getItem("token") || "");

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token") || "");
    };

    window.addEventListener("storage", handleStorageChange);

    // Also check for changes within the same tab
    const interval = setInterval(() => {
      const currentToken = localStorage.getItem("token") || "";
      if (currentToken !== token) {
        setToken(currentToken);
      }
    }, 100);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [token]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem("cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });
  const [images, setImages] = useState({});

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const handleLogout = () => {
    setToken("");
    localStorage.removeItem("token");
  };

  const addToCart = (item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const syncCartWithCatalog = async () => {
    try {
      const res = await fetch(`${CRUD_URL}/catalog-items`);
      const catalog = await res.json();
      setCart(prevCart => {
        return prevCart
          .map(cartItem => {
            const catalogItem = catalog.find(item => item.id === cartItem.id);
            if (catalogItem) {
              return { ...catalogItem, quantity: cartItem.quantity };
            } else {
              return null;
            }
          })
          .filter(item => item !== null);
      });
    } catch (error) {
      console.error("Error syncing cart with catalog:", error);
    }
  };

  return (
    <Router>
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
        <nav className={`backdrop-blur-md shadow-lg border-b sticky top-0 z-50 transition-colors duration-300 ${isDark ? 'bg-black/80 border-gray-900' : 'bg-white/80 border-gray-200'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Link to="/" className={`text-2xl font-bold transition-all duration-200 ${isDark ? 'text-white hover:text-gray-300' : 'text-black hover:text-gray-700'}`}>
                Ahmeng Marketplace
              </Link>
              <div className="hidden md:flex items-center space-x-8">
                <Link to="/catalog" className={`font-medium relative group transition-colors duration-200 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>
                  Katalog
                  <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-200 ${isDark ? 'bg-white' : 'bg-black'} group-hover:w-full`}></span>
                </Link>
                <Link to="/cart" className={`relative font-medium group transition-colors duration-200 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>
                  <span className="flex items-center">
                    Keranjang
                    {cart.length > 0 && (
                      <span className="ml-2 bg-gray-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg">
                        {cart.length}
                      </span>
                    )}
                  </span>
                  <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-200 ${isDark ? 'bg-white' : 'bg-black'} group-hover:w-full`}></span>
                </Link>
                {token && (
                  <>
                    <Link to="/manage-catalog" className={`font-medium relative group transition-colors duration-200 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>
                      Manage Catalog
                      <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-200 ${isDark ? 'bg-white' : 'bg-black'} group-hover:w-full`}></span>
                    </Link>
                    <Link to="/manage-users" className={`font-medium relative group transition-colors duration-200 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>
                      Manage Users
                      <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-200 ${isDark ? 'bg-white' : 'bg-black'} group-hover:w-full`}></span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className={`text-white px-6 py-2 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg font-medium ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-800 hover:bg-gray-900'}`}
                    >
                      Logout
                    </button>
                  </>
                )}
                {!token && (
                  <Link
                    to="/login"
                    className={`text-white px-6 py-2 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg font-medium ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-800 hover:bg-gray-900'}`}
                  >
                    Admin Login
                  </Link>
                )}
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-full transition-all duration-200 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}
                  title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDark ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
              </div>
              <div className="md:hidden flex items-center space-x-4">
                <button
                  onClick={toggleTheme}
                  className={`p-2 rounded-full transition-all duration-200 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'}`}
                  title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {isDark ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className={`focus:outline-none transition-colors duration-200 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {menuOpen ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </div>
            {menuOpen && (
              <div className={`md:hidden px-2 pt-2 pb-3 space-y-2 backdrop-blur-md border-t shadow-lg transition-colors duration-300 ${isDark ? 'bg-black/95 border-gray-900' : 'bg-white/95 border-gray-200'}`}>
                <Link
                  to="/catalog"
                  className={`block px-4 py-3 transition-all duration-200 font-medium rounded-lg ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-900' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}
                  onClick={() => setMenuOpen(false)}
                >
                  Katalog
                </Link>
                <Link
                  to="/cart"
                  className={`block px-4 py-3 transition-all duration-200 font-medium relative rounded-lg ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-900' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="flex items-center justify-between">
                    Keranjang
                    {cart.length > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                        {cart.length}
                      </span>
                    )}
                  </span>
                </Link>
                {token && (
                  <>
                    <Link
                      to="/manage-catalog"
                      className={`block px-4 py-3 transition-all duration-200 font-medium rounded-lg ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-900' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      Manage Catalog
                    </Link>
                    <Link
                      to="/manage-users"
                      className={`block px-4 py-3 transition-all duration-200 font-medium rounded-lg ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-900' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}
                      onClick={() => setMenuOpen(false)}
                    >
                      Manage Users
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setMenuOpen(false); }}
                      className={`block w-full text-left px-4 py-3 text-white rounded-lg transition-all duration-200 font-medium ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-800 hover:bg-gray-900'}`}
                    >
                      Logout
                    </button>
                  </>
                )}
                {!token && (
                  <Link
                    to="/login"
                    className={`block w-full text-left px-4 py-3 text-white rounded-lg transition-all duration-200 font-medium ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-800 hover:bg-gray-900'}`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Admin Login
                  </Link>
                )}
              </div>
            )}
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/catalog" element={<PublicCatalog cart={cart} addToCart={addToCart} images={images} setImages={setImages} />} />
          <Route path="/cart" element={<Cart cart={cart} setCart={setCart} images={images} />} />
          <Route path="/dashboard" element={token ? <Dashboard token={token} onLogout={handleLogout} /> : <Navigate to="/" />} />
          <Route path="/manage-catalog" element={token ? <div className="p-4 sm:p-6"><div className="max-w-7xl mx-auto"><CatalogCRUD token={token} syncCartWithCatalog={syncCartWithCatalog} /></div></div> : <Navigate to="/" />} />
          <Route path="/manage-catalog/add" element={token ? <div className="p-4 sm:p-6"><AddCatalogItem token={token} /></div> : <Navigate to="/" />} />
          <Route path="/manage-catalog/:id" element={token ? <div className="p-4 sm:p-6"><EditCatalogItem token={token} syncCartWithCatalog={syncCartWithCatalog} /></div> : <Navigate to="/" />} />
          <Route path="/manage-users" element={token ? <div className="p-4 sm:p-6"><div className="max-w-7xl mx-auto"><UserCRUD token={token} /></div></div> : <Navigate to="/" />} />
          <Route path="/manage-users/add" element={token ? <div className="p-4 sm:p-6"><AddUser token={token} /></div> : <Navigate to="/" />} />
          <Route path="/manage-users/:id" element={token ? <div className="p-4 sm:p-6"><EditUser token={token} /></div> : <Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

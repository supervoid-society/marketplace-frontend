import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const Navbar = ({ token, userRole, balance, isDark, toggleTheme, menuOpen, setMenuOpen, handleLogout }) => {
  const { cart } = useCart();

  const formatBalance = (amount) => {
    if (amount >= 1000000000000) {
      return `Rp ${(amount / 1000000000000).toFixed(1)} triliun`;
    } else if (amount >= 1000000000) {
      return `Rp ${(amount / 1000000000).toFixed(1)} miliar`;
    } else if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)} juta`;
    } else {
      return `Rp ${amount.toLocaleString('id-ID')}`;
    }
  };
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-black'} shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            Ahmeng Marketplace.
          </Link>

          {/* Desktop Navbar */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/leaderboard" className={`font-medium relative group transition-colors duration-200 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>
              🏆 Leaderboard
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-200 ${isDark ? 'bg-white' : 'bg-black'} group-hover:w-full`}></span>
            </Link>
            <Link to="/catalog" className={`font-medium relative group transition-colors duration-200 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>
              Katalog
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-200 ${isDark ? 'bg-white' : 'bg-black'} group-hover:w-full`}></span>
            </Link>
            {userRole === 'buyer' && (
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
            )}
            {token && (userRole === 'admin' || userRole === 'seller') && (
              <Link to="/manage-catalog" className={`font-medium relative group transition-colors duration-200 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>
                Manage Catalog
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-200 ${isDark ? 'bg-white' : 'bg-black'} group-hover:w-full`}></span>
              </Link>
            )}
            {!token && (
              <Link to="/login" className={`text-white px-6 py-2 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg font-medium ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-800 hover:bg-gray-900'}`}>
                Login
              </Link>
            )}
            {token && userRole === 'admin' && (
              <Link to="/manage-users" className={`font-medium relative group transition-colors duration-200 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>
                Manage Users
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-200 ${isDark ? 'bg-white' : 'bg-black'} group-hover:w-full`}></span>
              </Link>
            )}
            {token && userRole === 'admin' && (
              <Link to="/dashboard" className={`font-medium relative group transition-colors duration-200 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>
                Transaction Stats
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-200 ${isDark ? 'bg-white' : 'bg-black'} group-hover:w-full`}></span>
              </Link>
            )}
            {token && (userRole === 'buyer' || userRole === 'seller') && (
              <Link to="/transaction-history" className={`font-medium relative group transition-colors duration-200 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>
                Histori Transaksi
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-200 ${isDark ? 'bg-white' : 'bg-black'} group-hover:w-full`}></span>
              </Link>
            )}
            {token && (
              <Link to="/settings" className={`font-medium relative group transition-colors duration-200 ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-black'}`}>
                Settings
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-200 ${isDark ? 'bg-white' : 'bg-black'} group-hover:w-full`}></span>
              </Link>
            )}
            {token && userRole !== 'admin' && (
              <Link to="/mining" className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 cursor-pointer ${isDark ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">{formatBalance(balance)}</span>
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
            {token && (
              <button
                onClick={handleLogout}
                className={`text-white px-6 py-2 rounded-full transition-all duration-200 transform hover:scale-105 shadow-lg font-medium ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-800 hover:bg-gray-900'}`}
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Header */}
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

        {/* Mobile Menu */}
        {menuOpen && (
          <div className={`md:hidden px-2 pt-2 pb-3 space-y-2 backdrop-blur-md border-t shadow-lg transition-colors duration-300 ${isDark ? 'bg-black/95 border-gray-900' : 'bg-white/95 border-gray-200'}`}>
            <Link
              to="/leaderboard"
              className={`block px-4 py-3 transition-all duration-200 font-medium rounded-lg ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-900' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}
              onClick={() => setMenuOpen(false)}
            >
              🏆 Leaderboard
            </Link>
            <Link
              to="/catalog"
              className={`block px-4 py-3 transition-all duration-200 font-medium rounded-lg ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-900' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}
              onClick={() => setMenuOpen(false)}
            >
              Katalog
            </Link>
            {token && (userRole === 'admin' || userRole === 'seller') && (
              <Link
                to="/manage-catalog"
                className={`block px-4 py-3 transition-all duration-200 font-medium rounded-lg ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-900' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}
                onClick={() => setMenuOpen(false)}
              >
                Manage Catalog
              </Link>
            )}
            {token && userRole === 'admin' && (
              <Link
                to="/dashboard"
                className={`block px-4 py-3 transition-all duration-200 font-medium rounded-lg ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-900' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}
                onClick={() => setMenuOpen(false)}
              >
                Transaction Stats
              </Link>
            )}
            {token && (userRole === 'buyer' || userRole === 'seller') && (
              <Link
                to="/transaction-history"
                className={`block px-4 py-3 transition-all duration-200 font-medium rounded-lg ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-900' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}
                onClick={() => setMenuOpen(false)}
              >
                Histori Transaksi
              </Link>
            )}
            {token && (
              <Link
                to="/settings"
                className={`block px-4 py-3 transition-all duration-200 font-medium rounded-lg ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-900' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}
                onClick={() => setMenuOpen(false)}
              >
                Settings
              </Link>
            )}
            {token && userRole !== 'admin' && (
              <Link
                to="/mining"
                className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-all duration-200 ${isDark ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">{formatBalance(balance)}</span>
              </Link>
            )}
            {token && (
              <button
                onClick={() => { handleLogout(); setMenuOpen(false); }}
                className={`block w-full text-left px-4 py-3 text-white rounded-lg transition-all duration-200 font-medium ${isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-800 hover:bg-gray-900'}`}
              >
                Logout
              </button>
            )}
            {!token && (
              <Link
                to="/login"
                className={`block px-4 py-3 transition-all duration-200 font-medium rounded-lg ${isDark ? 'text-gray-300 hover:text-white hover:bg-gray-900' : 'text-gray-700 hover:text-black hover:bg-gray-50'}`}
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";

const Navbar = ({ token, userRole, balance, isDark, toggleTheme, menuOpen, setMenuOpen, handleLogout }) => {
  const { cart } = useCart();

  const formatBalance = (amount) => {
    if (amount >= 1000000000000) return `Rp ${(amount / 1000000000000).toFixed(1)}T`;
    if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}M`;
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isDark ? "bg-zinc-950/90 border-zinc-800 text-zinc-50" : "bg-white/90 border-zinc-200 text-zinc-900"} backdrop-blur-md`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-serif font-medium tracking-tight italic">
            Ahmeng Marketplace.
          </Link>

          {/* Desktop Navbar */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/leaderboard"
              className={`text-xs uppercase tracking-widest font-medium transition-colors duration-200 ${isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"}`}
            >
              Leaderboard
            </Link>
            <Link
              to="/catalog"
              className={`text-xs uppercase tracking-widest font-medium transition-colors duration-200 ${isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"}`}
            >
              Katalog
            </Link>
            {userRole === "buyer" && (
              <Link
                to="/cart"
                className={`text-xs uppercase tracking-widest font-medium transition-colors duration-200 ${isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"}`}
              >
                <span className="flex items-center">
                  Cart
                  {cart.length > 0 && (
                    <span
                      className={`ml-2 text-[10px] rounded-sm h-4 w-4 flex items-center justify-center font-bold border ${isDark ? "bg-zinc-800 border-zinc-700 text-zinc-100" : "bg-zinc-100 border-zinc-200 text-zinc-900"}`}
                    >
                      {cart.length}
                    </span>
                  )}
                </span>
              </Link>
            )}
            {token && (userRole === "admin" || userRole === "seller") && (
              <Link
                to="/manage-catalog"
                className={`text-xs uppercase tracking-widest font-medium transition-colors duration-200 ${isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"}`}
              >
                Manage
              </Link>
            )}
            {!token && (
              <Link
                to="/login"
                className={`text-xs uppercase tracking-widest px-6 py-2.5 rounded-sm border transition-all duration-200 font-medium ${isDark ? "border-zinc-700 bg-transparent hover:bg-white hover:text-black" : "border-zinc-300 bg-transparent hover:bg-black hover:text-white"}`}
              >
                Login
              </Link>
            )}
            {token && userRole === "admin" && (
              <Link
                to="/manage-users"
                className={`text-xs uppercase tracking-widest font-medium transition-colors duration-200 ${isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"}`}
              >
                Users
              </Link>
            )}
            {token && userRole === "admin" && (
              <Link
                to="/dashboard"
                className={`text-xs uppercase tracking-widest font-medium transition-colors duration-200 ${isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"}`}
              >
                Stats
              </Link>
            )}
            {token && (userRole === "buyer" || userRole === "seller") && (
              <Link
                to="/transaction-history"
                className={`text-xs uppercase tracking-widest font-medium transition-colors duration-200 ${isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"}`}
              >
                History
              </Link>
            )}
            {token && (
              <Link
                to="/settings"
                className={`text-xs uppercase tracking-widest font-medium transition-colors duration-200 ${isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"}`}
              >
                Settings
              </Link>
            )}
            {token && userRole !== "admin" && (
              <div
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-sm border text-xs tracking-widest transition-all duration-200 ${isDark ? "bg-transparent border-zinc-800 text-zinc-400" : "bg-transparent border-zinc-200 text-zinc-600"}`}
              >
                <span className="font-medium">{formatBalance(balance)}</span>
              </div>
            )}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-sm transition-all duration-200 ${isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-50" : "hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900"}`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            {token && (
              <button
                onClick={handleLogout}
                className={`text-xs uppercase tracking-widest px-6 py-2.5 rounded-sm border transition-all duration-200 font-medium ${isDark ? "border-zinc-700 bg-transparent hover:bg-white hover:text-black" : "border-zinc-300 bg-transparent hover:bg-black hover:text-white"}`}
              >
                Logout
              </button>
            )}
          </div>

          {/* Mobile Header Buttons */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-sm transition-all duration-200 ${isDark ? "hover:bg-zinc-800 text-zinc-400 hover:text-zinc-50" : "hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900"}`}
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-2 rounded-sm transition-all duration-200 ${isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-600 hover:text-zinc-900"}`}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {menuOpen && (
          <div
            className={`md:hidden absolute top-16 left-0 right-0 p-8 space-y-6 backdrop-blur-xl border-b transition-colors duration-300 ${isDark ? "bg-zinc-950/95 border-zinc-800" : "bg-white/95 border-zinc-100"}`}
          >
            {[
              { to: "/leaderboard", label: "Leaderboard" },
              { to: "/catalog", label: "Katalog" },
              ...(userRole === "buyer" ? [{ to: "/cart", label: `Cart ${cart.length > 0 ? `(${cart.length})` : ""}` }] : []),
              ...(token && (userRole === "admin" || userRole === "seller") ? [{ to: "/manage-catalog", label: "Manage" }] : []),
              ...(token && userRole === "admin"
                ? [
                    { to: "/dashboard", label: "Stats" },
                    { to: "/manage-users", label: "Users" },
                  ]
                : []),
              ...(token && (userRole === "buyer" || userRole === "seller") ? [{ to: "/transaction-history", label: "History" }] : []),
              ...(token ? [{ to: "/settings", label: "Settings" }] : []),
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block text-xs uppercase tracking-[0.2em] font-medium transition-colors duration-200 ${isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}

            {token && userRole !== "admin" && (
              <div
                className={`inline-block px-4 py-2 border text-[10px] uppercase tracking-widest font-black ${isDark ? "border-zinc-800 text-zinc-500" : "border-zinc-100 text-zinc-400"}`}
              >
                Balance / {formatBalance(balance)}
              </div>
            )}

            {token ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className={`block w-full py-4 text-xs uppercase tracking-widest border transition-all duration-300 font-bold ${isDark ? "border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-zinc-50" : "border-zinc-100 text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"}`}
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className={`block w-full text-center py-4 text-xs uppercase tracking-widest border transition-all duration-300 font-bold ${isDark ? "bg-zinc-100 text-zinc-900 border-zinc-100" : "bg-zinc-900 text-white border-zinc-900"}`}
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

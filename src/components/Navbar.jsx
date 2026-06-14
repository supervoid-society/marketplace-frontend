import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { AUTH_URL } from "../config";
import Swal from "sweetalert2";

const Navbar = ({ token, userRole, balance, isDark, toggleTheme, menuOpen, setMenuOpen, handleLogout }) => {
  const { cart } = useCart();
  const navigate = useNavigate();

  // Track open state for desktop dropdowns
  const [activeDropdown, setActiveDropdown] = useState(null); // 'account' | 'manage' | null

  // Click outside listener to close dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".nav-dropdown-trigger") && !e.target.closest(".nav-dropdown-menu")) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("click", handleOutsideClick);
    return () => document.removeEventListener("click", handleOutsideClick);
  }, []);

  const handleSwitchRole = async () => {
    const targetRole = userRole === "buyer" ? "seller" : "buyer";
    try {
      if (targetRole === "seller") {
        const profileRes = await fetch(`${AUTH_URL}/auth/sellers/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.status === 404) {
          Swal.fire({
            title: "Buka Toko Sekarang",
            text: "Anda belum memiliki profil penjual. Buka toko Anda terlebih dahulu melalui Onboarding!",
            icon: "info",
            showCancelButton: true,
            confirmButtonColor: "#000",
            confirmButtonText: "Buka Toko",
            cancelButtonText: "Batal",
          }).then((result) => {
            if (result.isConfirmed) {
              navigate("/seller-onboarding");
            }
          });
          return;
        }
      }

      const res = await fetch(`${AUTH_URL}/auth/switch-role`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: targetRole }),
      });

      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        window.dispatchEvent(new Event("storage"));
        Swal.fire({
          icon: "success",
          title: "Perubahan Peran",
          text: `Berhasil beralih ke Mode ${targetRole === "seller" ? "Penjual" : "Pembeli"}.`,
          timer: 1500,
          showConfirmButton: false,
        });
        navigate(targetRole === "seller" ? "/manage-catalog" : "/catalog");
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: data.error || "Gagal beralih peran.",
        });
      }
    } catch (error) {
      console.error("Switch role error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Terjadi kesalahan saat beralih peran.",
      });
    }
  };

  const formatBalance = (amount) => {
    if (amount >= 1000000000000) return `Rp ${(amount / 1000000000000).toFixed(1)}T`;
    if (amount >= 1000000000) return `Rp ${(amount / 1000000000).toFixed(1)}B`;
    if (amount >= 1000000) return `Rp ${(amount / 1000000).toFixed(1)}M`;
    return `Rp ${amount.toLocaleString("id-ID")}`;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
        isDark ? "bg-zinc-950/90 border-zinc-900 text-zinc-50" : "bg-white/90 border-zinc-100 text-zinc-900"
      } backdrop-blur-md`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl md:text-2xl font-serif font-medium tracking-tight italic">
            Ahmeng Marketplace.
          </Link>

          {/* Desktop Navbar */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/catalog"
              className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors duration-200 ${
                isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Katalog
            </Link>

            <Link
              to="/leaderboard"
              className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors duration-200 ${
                isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"
              }`}
            >
              Leaderboard
            </Link>

            {userRole === "buyer" && (
              <Link
                to="/cart"
                className={`text-[10px] uppercase tracking-[0.2em] font-bold transition-colors duration-200 ${
                  isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                <span className="flex items-center">
                  Cart
                  {cart.length > 0 && (
                    <span
                      className={`ml-2 text-[9px] rounded-sm h-4 w-4 flex items-center justify-center font-bold border ${
                        isDark ? "bg-zinc-850 border-zinc-700 text-zinc-100" : "bg-zinc-100 border-zinc-200 text-zinc-900"
                      }`}
                    >
                      {cart.length}
                    </span>
                  )}
                </span>
              </Link>
            )}

            {/* Desktop Dropdown: Manage Console */}
            {token && (userRole === "admin" || userRole === "seller") && (
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "manage" ? null : "manage")}
                  className={`nav-dropdown-trigger text-[10px] uppercase tracking-[0.2em] font-bold transition-colors duration-200 flex items-center space-x-1 cursor-pointer ${
                    isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  <span>Manage</span>
                  <svg
                    className={`w-3 h-3 transform transition-transform duration-200 ${activeDropdown === "manage" ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {activeDropdown === "manage" && (
                  <div
                    className={`nav-dropdown-menu absolute right-0 mt-3 w-56 rounded-none border shadow-xl transition-all duration-200 z-50 ${
                      isDark ? "bg-zinc-950/95 border-zinc-900 text-zinc-400" : "bg-white/95 border-zinc-100 text-zinc-650"
                    }`}
                  >
                    <div className="py-1 flex flex-col">
                      <Link
                        to="/manage-catalog"
                        onClick={() => setActiveDropdown(null)}
                        className={`px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-colors duration-150 text-left ${
                          isDark ? "hover:text-zinc-50 hover:bg-zinc-900/60" : "hover:text-zinc-900 hover:bg-zinc-50"
                        }`}
                      >
                        Catalog CRUD
                      </Link>
                      {userRole === "admin" && (
                        <>
                          <Link
                            to="/manage-users"
                            onClick={() => setActiveDropdown(null)}
                            className={`px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-colors duration-150 text-left border-t ${
                              isDark ? "border-zinc-900 hover:text-zinc-50 hover:bg-zinc-900/60" : "border-zinc-100 hover:text-zinc-900 hover:bg-zinc-50"
                            }`}
                          >
                            User CRUD
                          </Link>
                          <Link
                            to="/dashboard"
                            onClick={() => setActiveDropdown(null)}
                            className={`px-4 py-3 text-[10px] uppercase tracking-widest font-bold transition-colors duration-150 text-left border-t ${
                              isDark ? "border-zinc-900 hover:text-zinc-50 hover:bg-zinc-900/60" : "border-zinc-100 hover:text-zinc-900 hover:bg-zinc-50"
                            }`}
                          >
                            Platform Stats
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Desktop Dropdown: Account */}
            {token ? (
              <div className="relative">
                <button
                  onClick={() => setActiveDropdown(activeDropdown === "account" ? null : "account")}
                  className={`nav-dropdown-trigger text-[10px] uppercase tracking-[0.2em] font-bold transition-colors duration-200 flex items-center space-x-1.5 cursor-pointer ${
                    isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  <span>Account</span>
                  <svg
                    className={`w-3 h-3 transform transition-transform duration-200 ${activeDropdown === "account" ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {activeDropdown === "account" && (
                  <div
                    className={`nav-dropdown-menu absolute right-0 mt-3 w-64 rounded-none border shadow-xl transition-all duration-200 z-50 ${
                      isDark ? "bg-zinc-950/95 border-zinc-900 text-zinc-400" : "bg-white/95 border-zinc-100 text-zinc-600"
                    }`}
                  >
                    {userRole !== "admin" && (
                      <div className={`p-4 border-b flex flex-col space-y-3 ${isDark ? "border-zinc-900" : "border-zinc-100"}`}>
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[8px] uppercase tracking-widest font-black px-1.5 py-1 rounded-sm border ${
                              userRole === "seller"
                                ? isDark
                                  ? "bg-amber-950/30 border-amber-900/50 text-amber-400"
                                  : "bg-amber-50 border-amber-200 text-amber-800"
                                : isDark
                                  ? "bg-blue-950/30 border-blue-900/50 text-blue-400"
                                  : "bg-blue-50 border-blue-200 text-blue-800"
                            }`}
                          >
                            {userRole === "seller" ? "Seller Mode" : "Buyer Mode"}
                          </span>
                          <span className="text-[10px] font-mono font-bold">{formatBalance(balance)}</span>
                        </div>
                        <button
                          onClick={() => {
                            handleSwitchRole();
                            setActiveDropdown(null);
                          }}
                          className={`w-full py-2 text-[8px] uppercase tracking-widest border transition-all duration-200 font-bold active:scale-95 cursor-pointer text-center ${
                            isDark
                              ? "border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-850 hover:text-white"
                              : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100 hover:text-black"
                          }`}
                        >
                          Switch to {userRole === "buyer" ? "Seller" : "Buyer"}
                        </button>
                      </div>
                    )}

                    <div className="py-1 flex flex-col">
                      {userRole !== "admin" && (
                        <>
                          <Link
                            to="/wallet"
                            onClick={() => setActiveDropdown(null)}
                            className={`px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold transition-colors duration-150 text-left ${
                              isDark ? "hover:text-zinc-50 hover:bg-zinc-900/60" : "hover:text-zinc-900 hover:bg-zinc-50"
                            }`}
                          >
                            My Wallet
                          </Link>
                          <Link
                            to="/transaction-history"
                            onClick={() => setActiveDropdown(null)}
                            className={`px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold transition-colors duration-150 text-left border-t ${
                              isDark ? "border-zinc-900 hover:text-zinc-50 hover:bg-zinc-900/60" : "border-zinc-100 hover:text-zinc-900 hover:bg-zinc-50"
                            }`}
                          >
                            History
                          </Link>
                        </>
                      )}
                      <Link
                        to="/settings"
                        onClick={() => setActiveDropdown(null)}
                        className={`px-4 py-2.5 text-[10px] uppercase tracking-widest font-bold transition-colors duration-150 text-left border-t ${
                          isDark ? "border-zinc-900 hover:text-zinc-50 hover:bg-zinc-900/60" : "border-zinc-100 hover:text-zinc-900 hover:bg-zinc-50"
                        }`}
                      >
                        Settings
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setActiveDropdown(null);
                        }}
                        className={`px-4 py-3 text-[10px] uppercase tracking-widest font-bold text-left border-t transition-colors duration-150 cursor-pointer ${
                          isDark ? "border-zinc-900 hover:text-white hover:bg-red-950/20 text-red-400" : "border-zinc-100 hover:text-black hover:bg-red-50 text-red-650"
                        }`}
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className={`text-[10px] uppercase tracking-[0.2em] px-6 py-2.5 rounded-sm border transition-all duration-200 font-bold ${
                  isDark ? "border-zinc-700 bg-transparent hover:bg-white hover:text-black" : "border-zinc-300 bg-transparent hover:bg-black hover:text-white"
                }`}
              >
                Login
              </Link>
            )}

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-sm transition-all duration-200 cursor-pointer ${
                isDark ? "hover:bg-zinc-900 text-zinc-400 hover:text-zinc-50" : "hover:bg-zinc-100 text-zinc-650 hover:text-zinc-900"
              }`}
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
          </div>

          {/* Mobile Header Buttons */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-sm transition-all duration-200 cursor-pointer ${
                isDark ? "hover:bg-zinc-900 text-zinc-400 hover:text-zinc-50" : "hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900"
              }`}
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
              className={`p-2 rounded-sm transition-all duration-200 cursor-pointer ${isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-650 hover:text-zinc-900"}`}
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
            className={`md:hidden absolute top-16 left-0 right-0 p-8 space-y-8 backdrop-blur-xl border-b transition-all duration-300 max-h-[calc(100vh-4rem)] overflow-y-auto ${
              isDark ? "bg-zinc-950/95 border-zinc-900" : "bg-white/95 border-zinc-100"
            }`}
          >
            {/* Public Navigation Links */}
            <div className="flex flex-col space-y-4">
              <p className={`text-[8px] uppercase tracking-[0.3em] font-bold ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Navigation</p>
              <div className="flex flex-col space-y-3 pl-2">
                <Link
                  to="/catalog"
                  className={`text-xs uppercase tracking-[0.2em] font-bold transition-colors duration-200 ${
                    isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Katalog
                </Link>
                <Link
                  to="/leaderboard"
                  className={`text-xs uppercase tracking-[0.2em] font-bold transition-colors duration-200 ${
                    isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Leaderboard
                </Link>
                {userRole === "buyer" && (
                  <Link
                    to="/cart"
                    className={`text-xs uppercase tracking-[0.2em] font-bold transition-colors duration-200 ${
                      isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Cart ({cart.length})
                  </Link>
                )}
              </div>
            </div>

            {/* Console Management Links for Mobile */}
            {token && (userRole === "admin" || userRole === "seller") && (
              <div className="flex flex-col space-y-4 pt-2 border-t border-dashed border-zinc-800 dark:border-zinc-800">
                <p className={`text-[8px] uppercase tracking-[0.3em] font-bold ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Console Management</p>
                <div className="flex flex-col space-y-3 pl-2">
                  <Link
                    to="/manage-catalog"
                    className={`text-xs uppercase tracking-[0.2em] font-bold transition-colors duration-200 ${
                      isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Catalog CRUD
                  </Link>
                  {userRole === "admin" && (
                    <>
                      <Link
                        to="/manage-users"
                        className={`text-xs uppercase tracking-[0.2em] font-bold transition-colors duration-200 ${
                          isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"
                        }`}
                        onClick={() => setMenuOpen(false)}
                      >
                        User CRUD
                      </Link>
                      <Link
                        to="/dashboard"
                        className={`text-xs uppercase tracking-[0.2em] font-bold transition-colors duration-200 ${
                          isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"
                        }`}
                        onClick={() => setMenuOpen(false)}
                      >
                        Platform Stats
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Account settings for Mobile */}
            {token ? (
              <div className="space-y-6 pt-2 border-t border-dashed border-zinc-800 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <p className={`text-[8px] uppercase tracking-[0.3em] font-bold ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>My Account</p>
                  {userRole !== "admin" && (
                    <span
                      className={`text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded-sm border ${
                        userRole === "seller"
                          ? isDark
                            ? "bg-amber-950/30 border-amber-900/50 text-amber-400"
                            : "bg-amber-50 border-amber-200 text-amber-800"
                          : isDark
                            ? "bg-blue-950/30 border-blue-900/50 text-blue-400"
                            : "bg-blue-50 border-blue-200 text-blue-800"
                      }`}
                    >
                      {userRole === "seller" ? "Seller Mode" : "Buyer Mode"}
                    </span>
                  )}
                </div>

                {userRole !== "admin" && (
                  <div
                    className={`flex items-center justify-between px-3 py-2.5 border ${
                      isDark ? "border-zinc-900 bg-zinc-900/40 text-zinc-300" : "border-zinc-100 bg-zinc-50 text-zinc-700"
                    }`}
                  >
                    <span className="text-[10px] uppercase tracking-widest font-medium">Balance</span>
                    <span className="text-xs font-mono font-bold">{formatBalance(balance)}</span>
                  </div>
                )}

                <div className="flex flex-col space-y-3 pl-2">
                  {userRole !== "admin" && (
                    <>
                      <Link
                        to="/wallet"
                        className={`text-xs uppercase tracking-[0.2em] font-bold transition-colors duration-200 ${
                          isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"
                        }`}
                        onClick={() => setMenuOpen(false)}
                      >
                        My Wallet
                      </Link>
                      <Link
                        to="/transaction-history"
                        className={`text-xs uppercase tracking-[0.2em] font-bold transition-colors duration-200 ${
                          isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"
                        }`}
                        onClick={() => setMenuOpen(false)}
                      >
                        History
                      </Link>
                    </>
                  )}
                  <Link
                    to="/settings"
                    className={`text-xs uppercase tracking-[0.2em] font-bold transition-colors duration-200 ${
                      isDark ? "text-zinc-400 hover:text-zinc-50" : "text-zinc-500 hover:text-zinc-900"
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    Settings
                  </Link>
                </div>

                {userRole !== "admin" && (
                  <button
                    onClick={() => {
                      handleSwitchRole();
                      setMenuOpen(false);
                    }}
                    className={`block w-full py-4 text-xs uppercase tracking-widest border transition-all duration-300 font-bold active:scale-95 cursor-pointer ${
                      isDark
                        ? "bg-zinc-900 border-zinc-850 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                        : "bg-zinc-50 border-zinc-200 text-zinc-650 hover:bg-zinc-100 hover:text-black"
                    }`}
                  >
                    Switch to {userRole === "buyer" ? "Seller Mode" : "Buyer Mode"}
                  </button>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className={`block w-full py-4 text-xs uppercase tracking-widest border transition-all duration-300 font-bold active:scale-95 cursor-pointer ${
                    isDark ? "border-red-950/30 bg-red-950/10 text-red-400 hover:bg-red-950/20" : "border-red-100 bg-red-50 text-red-650 hover:bg-red-105 hover:bg-red-100"
                  }`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-dashed border-zinc-800 dark:border-zinc-800">
                <Link
                  to="/login"
                  className={`block w-full text-center py-4 text-xs uppercase tracking-widest border transition-all duration-300 font-bold ${
                    isDark ? "bg-zinc-100 text-zinc-900 border-zinc-100" : "bg-zinc-900 text-white border-zinc-900"
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

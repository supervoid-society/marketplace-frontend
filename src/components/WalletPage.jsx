import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { AUTH_URL } from "../config";
import Swal from "sweetalert2";

function WalletPage() {
  const { isDark } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("send");
  const [buyerBalance, setBuyerBalance] = useState(0);
  const [sellerBalance, setSellerBalance] = useState(null); // null = has no merchant account
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [pendingRequests, setPendingRequests] = useState({ incoming: [], outgoing: [] });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const [internalTransfer, setInternalTransfer] = useState({
    direction: "member_to_merchant",
    amount: "",
  });

  const token = localStorage.getItem("token");
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null;

  useEffect(() => {
    if (token && payload) {
      fetchBalances();
      fetchPendingRequests();
      fetchHistory();
    }
  }, [token]);

  const fetchBalances = async () => {
    if (!payload) return;
    try {
      // 1. Fetch buyer balance
      const buyerRes = await fetch(`${AUTH_URL}/auth/balance/${payload.userId}/buyer`);
      const buyerData = await buyerRes.json();
      setBuyerBalance(buyerData.balance || 0);

      // 2. Fetch seller balance
      const sellerRes = await fetch(`${AUTH_URL}/auth/balance/${payload.userId}/seller`);
      if (sellerRes.status === 404) {
        setSellerBalance(null);
      } else {
        const sellerData = await sellerRes.json();
        setSellerBalance(sellerData.balance ?? 0);
      }
    } catch (error) {
      console.error("Error fetching balances:", error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await fetch(`${AUTH_URL}/wallets/requests/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setPendingRequests(data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${AUTH_URL}/wallets/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setHistory(data);
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`${AUTH_URL}/wallets/search?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error searching users:", error);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!selectedUser || !amount || amount <= 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}/wallets/transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ recipientId: selectedUser.id, amount: Number(amount) }),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Transfer berhasil dikirim.",
          confirmButtonColor: "#000",
        });
        setAmount("");
        setSelectedUser(null);
        setSearchQuery("");
        fetchBalances();
        fetchHistory();
        window.dispatchEvent(new Event("balanceChanged"));
      } else {
        Swal.fire("Gagal", data.error || "Transfer gagal.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Kesalahan server", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!selectedUser || !amount || amount <= 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}/wallets/request`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ targetId: selectedUser.id, amount: Number(amount) }),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Permintaan transfer berhasil dikirim.",
          confirmButtonColor: "#000",
        });
        setAmount("");
        setSelectedUser(null);
        setSearchQuery("");
        fetchPendingRequests();
      } else {
        Swal.fire("Gagal", data.error || "Gagal mengirim permintaan.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Kesalahan server", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSwapDirection = () => {
    if (sellerBalance === null) return;
    setInternalTransfer((prev) => ({
      ...prev,
      direction: prev.direction === "member_to_merchant" ? "merchant_to_member" : "member_to_merchant",
    }));
  };

  const handleInternalTransfer = async (e) => {
    e.preventDefault();
    const { direction, amount: moveAmount } = internalTransfer;
    if (!moveAmount || moveAmount <= 0) return;

    setLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}/wallets/internal-transfer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ direction, amount: Number(moveAmount) }),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Transfer internal saldo berhasil dilaksanakan.",
          confirmButtonColor: "#000",
        });
        setInternalTransfer({ ...internalTransfer, amount: "" });
        fetchBalances();
        fetchHistory();
        window.dispatchEvent(new Event("balanceChanged"));
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: data.error || "Transfer internal gagal.",
          confirmButtonColor: "#000",
        });
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Terjadi kesalahan server", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (requestId, action) => {
    try {
      const res = await fetch(`${AUTH_URL}/wallets/requests/${requestId}/respond`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action }),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: data.message,
          confirmButtonColor: "#000",
        });
        fetchBalances();
        fetchPendingRequests();
        fetchHistory();
        window.dispatchEvent(new Event("balanceChanged"));
      } else {
        Swal.fire("Gagal", data.error || "Gagal merespons.", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Kesalahan server", "error");
    }
  };

  const formatRupiah = (angka) => {
    return "Rp " + angka.toLocaleString("id-ID");
  };

  const formatRupiahCompact = (angka) => {
    if (angka >= 1_000_000_000_000) {
      return "Rp " + (angka / 1_000_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 }) + " T";
    } else if (angka >= 1_000_000_000) {
      return "Rp " + (angka / 1_000_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 }) + " M";
    } else if (angka >= 1_000_000) {
      return "Rp " + (angka / 1_000_000).toLocaleString("id-ID", { maximumFractionDigits: 2 }) + " jt";
    }
    return formatRupiah(angka);
  };

  if (!payload) return null;

  return (
    <div className="py-12 px-6 max-w-6xl mx-auto">
      <div className="mb-12">
        <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter leading-none mb-4">Wallet.</h1>
        <p className={`text-xl ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Manage your capital and peer-to-peer transfers.</p>
      </div>

      {/* Dual Account Wallets */}
      <div className={`grid grid-cols-1 ${payload.role === "admin" ? "md:grid-cols-1" : "md:grid-cols-2"} gap-6 mb-16 w-full`}>
        {/* Member/Admin Wallet Card */}
        <div
          className={`p-6 border flex flex-col justify-between rounded-lg ${
            payload.role === "buyer"
              ? isDark
                ? "border-blue-900 bg-blue-950/10 text-zinc-100"
                : "border-blue-200 bg-blue-50/20 text-zinc-900"
              : payload.role === "admin"
                ? isDark
                  ? "border-red-900 bg-red-950/10 text-zinc-100"
                  : "border-red-200 bg-red-50/20 text-zinc-900"
                : isDark
                  ? "border-zinc-900 bg-zinc-950 text-zinc-400"
                  : "border-zinc-100 bg-zinc-50/30 text-zinc-600"
          }`}
        >
          <div className="flex justify-between items-center mb-4 gap-4">
            <span className="text-[9px] uppercase tracking-[0.2em] font-black opacity-60">{payload.role === "admin" ? "Platform Admin Wallet" : "Member Wallet (Buyer)"}</span>
            {(payload.role === "buyer" || payload.role === "admin") && (
              <span
                className={`text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded-sm border ${
                  payload.role === "admin" ? "bg-red-500/10 text-red-500 border-red-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                }`}
              >
                Active
              </span>
            )}
          </div>
          <span className="text-3xl font-black font-mono tracking-tight break-all">{formatRupiah(buyerBalance)}</span>
        </div>

        {/* Merchant Wallet Card */}
        {payload.role !== "admin" && (
          <div
            className={`p-6 border flex flex-col justify-between rounded-lg ${
              payload.role === "seller"
                ? isDark
                  ? "border-amber-900 bg-amber-950/10 text-zinc-100"
                  : "border-amber-200 bg-amber-50/20 text-zinc-900"
                : isDark
                  ? "border-zinc-900 bg-zinc-950 text-zinc-400"
                  : "border-zinc-100 bg-zinc-50/30 text-zinc-600"
            }`}
          >
            <div className="flex justify-between items-center mb-4 gap-4">
              <span className="text-[9px] uppercase tracking-[0.2em] font-black opacity-60">Merchant Wallet (Seller)</span>
              {payload.role === "seller" && (
                <span className="text-[8px] uppercase tracking-widest font-black px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-500 border border-amber-500/20">Active</span>
              )}
            </div>
            {sellerBalance === null ? (
              <div className="flex flex-col items-start space-y-2">
                <span className="text-xs italic opacity-50">Belum Buka Toko</span>
                <button
                  onClick={() => navigate("/seller-onboarding")}
                  className={`py-1.5 px-3 rounded-none text-[8px] uppercase tracking-widest font-bold border transition-all duration-200 cursor-pointer ${
                    isDark
                      ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100"
                      : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"
                  }`}
                >
                  Onboarding
                </button>
              </div>
            ) : (
              <span className="text-3xl font-black font-mono tracking-tight break-all">{formatRupiah(sellerBalance)}</span>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Actions */}
        <div className="lg:col-span-7 space-y-12">
          <div className="flex gap-8 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto whitespace-nowrap">
            {["send", "request", "internal", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-300 relative cursor-pointer ${
                  activeTab === tab ? (isDark ? "text-zinc-100" : "text-zinc-900") : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {tab === "internal" ? "internal transfer" : tab}
                {activeTab === tab && <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? "bg-zinc-100" : "bg-zinc-900"}`}></div>}
              </button>
            ))}
          </div>

          {activeTab === "history" ? (
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="italic opacity-40">No transaction history found.</p>
              ) : (
                history.map((h) => {
                  const isInternal = h.sender_id === h.receiver_id;
                  return (
                    <div key={h.id} className={`p-6 border ${isDark ? "border-zinc-900 bg-zinc-950" : "border-zinc-100 bg-white"} flex justify-between items-center gap-4`}>
                      <div className="min-w-0">
                        <p className="text-sm font-bold truncate">
                          {isInternal ? "Internal Transfer (Member ↔ Merchant)" : h.sender_id === payload.userId ? `To: ${h.receiver_name}` : `From: ${h.sender_name}`}
                        </p>
                        <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">{new Date(h.created_at).toLocaleString()}</p>
                      </div>
                      <span
                        className={`text-xl font-black tracking-tighter shrink-0 ${
                          isInternal ? "text-zinc-400 dark:text-zinc-500" : h.sender_id === payload.userId ? "text-rose-500" : "text-emerald-500"
                        }`}
                      >
                        {isInternal ? "⇅ " : h.sender_id === payload.userId ? "-" : "+"}
                        {formatRupiahCompact(h.amount)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          ) : activeTab === "internal" ? (
            <form onSubmit={handleInternalTransfer} className="space-y-6 max-w-lg">
              <div className="relative flex flex-col gap-2">
                {/* FROM CARD */}
                <div className={`p-5 border transition-colors rounded-lg ${isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-zinc-50/50 border-zinc-200"}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] uppercase tracking-widest font-black opacity-60">From</span>
                    <span className="text-[10px] font-mono opacity-60">
                      Balance: {formatRupiah(internalTransfer.direction === "member_to_merchant" ? buyerBalance : sellerBalance || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-4">
                    <span className="text-lg font-serif font-medium">{internalTransfer.direction === "member_to_merchant" ? "Member Wallet" : "Merchant Wallet"}</span>
                    <div className="flex-1 max-w-[200px]">
                      <input
                        type="number"
                        value={internalTransfer.amount}
                        onChange={(e) => setInternalTransfer({ ...internalTransfer, amount: e.target.value })}
                        placeholder="0"
                        disabled={sellerBalance === null}
                        className="w-full text-right text-3xl font-black tracking-tighter bg-transparent border-b border-transparent focus:border-zinc-900 dark:focus:border-zinc-100 focus:outline-none transition-colors font-mono py-1"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* SWAP BUTTON */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <button
                    type="button"
                    onClick={handleSwapDirection}
                    disabled={sellerBalance === null}
                    className={`w-10 h-10 rounded-full border flex items-center justify-center shadow-md active:scale-95 transition-all duration-200 cursor-pointer ${
                      isDark
                        ? "bg-zinc-950 border-zinc-800 text-zinc-100 hover:border-zinc-700 hover:bg-zinc-900"
                        : "bg-white border-zinc-200 text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50"
                    } disabled:opacity-20 disabled:cursor-not-allowed`}
                    title="Swap direction"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </button>
                </div>

                {/* TO CARD */}
                <div className={`p-5 border transition-colors rounded-lg ${isDark ? "bg-zinc-900/40 border-zinc-800" : "bg-zinc-50/50 border-zinc-200"}`}>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] uppercase tracking-widest font-black opacity-60">To</span>
                    <span className="text-[10px] font-mono opacity-60">
                      Balance: {formatRupiah(internalTransfer.direction === "member_to_merchant" ? sellerBalance || 0 : buyerBalance)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-serif font-medium">{internalTransfer.direction === "member_to_merchant" ? "Merchant Wallet" : "Member Wallet"}</span>
                    {internalTransfer.amount && Number(internalTransfer.amount) > 0 && (
                      <span className="text-sm font-mono font-bold text-emerald-500 animate-fade-in">+ {formatRupiah(Number(internalTransfer.amount))}</span>
                    )}
                  </div>
                </div>
              </div>

              {sellerBalance === null ? (
                <p className="text-[10px] text-center text-rose-500 font-bold uppercase tracking-wider">
                  * Buka toko (onboarding merchant) terlebih dahulu untuk membuka fitur transfer internal.
                </p>
              ) : (
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading || !internalTransfer.amount || Number(internalTransfer.amount) <= 0}
                    className={`w-full py-6 rounded-none font-bold text-[10px] uppercase tracking-[0.3em] transition-all duration-300 border cursor-pointer ${
                      isDark
                        ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100"
                        : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"
                    } disabled:opacity-20`}
                  >
                    {loading ? "Processing..." : "Execute Swap Transfer"}
                  </button>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={activeTab === "send" ? handleTransfer : handleRequest} className="space-y-8">
              <div className="relative">
                <label className="block text-[10px] uppercase tracking-widest font-black mb-4">Recipient / Target Username</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearch}
                  placeholder="Type at least 2 characters..."
                  className="w-full py-4 bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
                />

                {searchResults.length > 0 && !selectedUser && (
                  <div
                    className={`absolute left-0 right-0 top-full z-10 mt-1 border ${isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-white"} overflow-hidden shadow-xl`}
                  >
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          setSelectedUser(user);
                          setSearchQuery(user.username);
                          setSearchResults([]);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 flex justify-between cursor-pointer`}
                      >
                        <span>{user.username}</span>
                        <span className="text-[10px] uppercase opacity-40">{user.role}</span>
                      </button>
                    ))}
                  </div>
                )}
                {selectedUser && (
                  <div className="mt-4 flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20">
                    <span className="text-sm font-bold text-emerald-500">
                      Selected: {selectedUser.username} ({selectedUser.role})
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(null);
                        setSearchQuery("");
                      }}
                      className="text-[10px] uppercase font-black opacity-40 hover:opacity-100 cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-widest font-black mb-4">Amount (IDR)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="w-full py-4 text-4xl font-black tracking-tighter bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors font-mono"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading || !selectedUser || !amount}
                className={`w-full py-6 rounded-none font-bold text-[10px] uppercase tracking-[0.3em] transition-all duration-300 border cursor-pointer ${
                  isDark
                    ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100"
                    : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"
                } disabled:opacity-20`}
              >
                {loading ? "Processing..." : activeTab === "send" ? "Execute Transfer" : "Send Request"}
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Pending Requests */}
        <div className="lg:col-span-5 space-y-12">
          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black mb-8 opacity-40">Incoming Requests</h3>
            <div className="space-y-4">
              {pendingRequests.incoming.length === 0 ? (
                <p className="text-xs italic opacity-30">No incoming requests.</p>
              ) : (
                pendingRequests.incoming.map((req) => (
                  <div key={req.id} className={`p-6 border ${isDark ? "border-zinc-900 bg-zinc-950" : "border-zinc-100 bg-white"}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-sm font-bold">{req.requester_name} requests</p>
                        <p className="text-2xl font-black tracking-tighter mt-1 break-all font-mono">{formatRupiahCompact(req.amount)}</p>
                      </div>
                      <span className="text-[10px] uppercase font-black px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20">Pending</span>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleRespond(req.id, "accept")}
                        className={`flex-1 py-3 text-[10px] uppercase font-black border cursor-pointer ${isDark ? "bg-zinc-100 text-zinc-900 border-zinc-100" : "bg-zinc-900 text-white border-zinc-900"}`}
                      >
                        Accept & Pay
                      </button>
                      <button
                        onClick={() => handleRespond(req.id, "reject")}
                        className={`flex-1 py-3 text-[10px] uppercase font-black border border-zinc-200 dark:border-zinc-800 cursor-pointer`}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] uppercase tracking-[0.3em] font-black mb-8 opacity-40">Outgoing Requests</h3>
            <div className="space-y-4">
              {pendingRequests.outgoing.length === 0 ? (
                <p className="text-xs italic opacity-30">No outgoing requests.</p>
              ) : (
                pendingRequests.outgoing.map((req) => (
                  <div key={req.id} className={`p-6 border ${isDark ? "border-zinc-900 bg-zinc-950/50" : "border-zinc-100 bg-white/50"}`}>
                    <p className="text-sm font-bold opacity-60">Sent to {req.target_name}</p>
                    <p className="text-2xl font-black tracking-tighter mt-1 opacity-60 break-all font-mono">{formatRupiahCompact(req.amount)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WalletPage;

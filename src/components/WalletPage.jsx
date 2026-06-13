import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { AUTH_URL } from "../config";
import Swal from "sweetalert2";

function WalletPage() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("send");
  const [balance, setBalance] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [amount, setAmount] = useState("");
  const [pendingRequests, setPendingRequests] = useState({ incoming: [], outgoing: [] });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null;

  useEffect(() => {
    if (token && payload) {
      fetchBalance();
      fetchPendingRequests();
      fetchHistory();
    }
  }, [token]);

  const fetchBalance = async () => {
    try {
      const res = await fetch(`${AUTH_URL}/auth/balance/${payload.userId}/${payload.role}`);
      const data = await res.json();
      setBalance(data.balance || 0);
    } catch (error) {
      console.error("Error fetching balance:", error);
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
        Swal.fire("Success", "Transfer successful", "success");
        setAmount("");
        setSelectedUser(null);
        setSearchQuery("");
        fetchBalance();
        fetchHistory();
        window.dispatchEvent(new Event("balanceChanged"));
      } else {
        Swal.fire("Error", data.error || "Transfer failed", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Server error", "error");
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
        Swal.fire("Success", "Request sent", "success");
        setAmount("");
        setSelectedUser(null);
        setSearchQuery("");
        fetchPendingRequests();
      } else {
        Swal.fire("Error", data.error || "Request failed", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Server error", "error");
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
        Swal.fire("Success", data.message, "success");
        fetchBalance();
        fetchPendingRequests();
        fetchHistory();
        window.dispatchEvent(new Event("balanceChanged"));
      } else {
        Swal.fire("Error", data.error || "Failed to respond", "error");
      }
    } catch (error) {
      Swal.fire("Error", "Server error", "error");
    }
  };

  const formatRupiah = (angka) => {
    return "Rp " + angka.toLocaleString("id-ID");
  };

  if (!payload) return null;

  return (
    <div className="py-12 px-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
        <div>
          <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter leading-none mb-4">Wallet.</h1>
          <p className={`text-xl ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Manage your capital and peer-to-peer transfers.</p>
        </div>
        <div className={`p-8 border ${isDark ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-100 bg-zinc-50/50"}`}>
          <span className="text-[10px] uppercase tracking-[0.3em] font-black opacity-40 block mb-2">Available Capital</span>
          <span className="text-4xl font-black tracking-tighter">{formatRupiah(balance)}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Actions */}
        <div className="lg:col-span-7 space-y-12">
          <div className="flex gap-8 border-b border-zinc-200 dark:border-zinc-800">
            {["send", "request", "history"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-[10px] uppercase tracking-[0.3em] font-black transition-all duration-300 relative ${
                  activeTab === tab ? (isDark ? "text-zinc-100" : "text-zinc-900") : "text-zinc-400 hover:text-zinc-600"
                }`}
              >
                {tab}
                {activeTab === tab && <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? "bg-zinc-100" : "bg-zinc-900"}`}></div>}
              </button>
            ))}
          </div>

          {activeTab === "history" ? (
            <div className="space-y-4">
              {history.length === 0 ? (
                <p className="italic opacity-40">No transaction history found.</p>
              ) : (
                history.map((h) => (
                  <div key={h.id} className={`p-6 border ${isDark ? "border-zinc-900 bg-zinc-950" : "border-zinc-100 bg-white"} flex justify-between items-center`}>
                    <div>
                      <p className="text-sm font-bold">{h.sender_id === payload.userId ? `To: ${h.receiver_name}` : `From: ${h.sender_name}`}</p>
                      <p className="text-[10px] opacity-40 uppercase tracking-widest mt-1">{new Date(h.created_at).toLocaleString()}</p>
                    </div>
                    <span className={`text-xl font-black tracking-tighter ${h.sender_id === payload.userId ? "text-rose-500" : "text-emerald-500"}`}>
                      {h.sender_id === payload.userId ? "-" : "+"}
                      {formatRupiah(h.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>
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
                        className={`w-full text-left px-4 py-3 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 flex justify-between`}
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
                      className="text-[10px] uppercase font-black opacity-40 hover:opacity-100"
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
                  className="w-full py-4 text-4xl font-black tracking-tighter bg-transparent border-b border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !selectedUser || !amount}
                className={`w-full py-6 rounded-none font-bold text-[10px] uppercase tracking-[0.3em] transition-all duration-300 border ${
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
                        <p className="text-2xl font-black tracking-tighter mt-1">{formatRupiah(req.amount)}</p>
                      </div>
                      <span className="text-[10px] uppercase font-black px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20">Pending</span>
                    </div>
                    <div className="flex gap-4">
                      <button
                        onClick={() => handleRespond(req.id, "accept")}
                        className={`flex-1 py-3 text-[10px] uppercase font-black border ${isDark ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-white"}`}
                      >
                        Accept & Pay
                      </button>
                      <button
                        onClick={() => handleRespond(req.id, "reject")}
                        className={`flex-1 py-3 text-[10px] uppercase font-black border border-zinc-200 dark:border-zinc-800`}
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
                    <p className="text-2xl font-black tracking-tighter mt-1 opacity-60">{formatRupiah(req.amount)}</p>
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

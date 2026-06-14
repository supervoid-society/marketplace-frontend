import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { CRUD_URL } from "../config";
import Swal from "sweetalert2";

function AdminPlatformSettings() {
  const { isDark } = useTheme();
  const [settings, setSettings] = useState({
    fee_type: "percentage",
    fee_percentage: 0,
    fee_fixed: 0,
  });

  const [promoForm, setPromoForm] = useState({
    code: "",
    type: "percentage",
    value: "",
    max_uses: "",
  });

  const [promosList, setPromosList] = useState([]);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const [loadingPromo, setLoadingPromo] = useState(false);
  const [useMaxUsesLimit, setUseMaxUsesLimit] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      fetchSettings();
      fetchPromos();
    }
  }, [token]);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${CRUD_URL}/admin-features/platform-settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  };

  const fetchPromos = async () => {
    try {
      const res = await fetch(`${CRUD_URL}/admin-features/promos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPromosList(data);
      }
    } catch (error) {
      console.error("Failed to fetch promos:", error);
    }
  };

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setLoadingSettings(true);
    try {
      const res = await fetch(`${CRUD_URL}/admin-features/platform-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Settings Updated",
          text: "Platform fee configurations have been successfully saved.",
          confirmButtonColor: "#000",
          background: isDark ? "#09090b" : "#fff",
          color: isDark ? "#fff" : "#000",
        });
        fetchSettings();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: data.error || "Failed to update settings.",
          confirmButtonColor: "#000",
          background: isDark ? "#09090b" : "#fff",
          color: isDark ? "#fff" : "#000",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Terjadi kesalahan server.",
        confirmButtonColor: "#000",
        background: isDark ? "#09090b" : "#fff",
        color: isDark ? "#fff" : "#000",
      });
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleCreatePromo = async (e) => {
    e.preventDefault();
    if (!promoForm.code || !promoForm.value) return;

    setLoadingPromo(true);
    try {
      const res = await fetch(`${CRUD_URL}/admin-features/promos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: promoForm.code,
          type: promoForm.type,
          value: parseFloat(promoForm.value),
          max_uses: useMaxUsesLimit && promoForm.max_uses ? parseInt(promoForm.max_uses) : null,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        Swal.fire({
          icon: "success",
          title: "Promo Code Created",
          text: `Promo ${promoForm.code.toUpperCase()} successfully generated.`,
          confirmButtonColor: "#000",
          background: isDark ? "#09090b" : "#fff",
          color: isDark ? "#fff" : "#000",
        });
        setPromoForm({
          code: "",
          type: "percentage",
          value: "",
          max_uses: "",
        });
        setUseMaxUsesLimit(false);
        fetchPromos();
      } else {
        Swal.fire({
          icon: "error",
          title: "Failed",
          text: data.error || "Failed to create promo code.",
          confirmButtonColor: "#000",
          background: isDark ? "#09090b" : "#fff",
          color: isDark ? "#fff" : "#000",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Terjadi kesalahan server.",
        confirmButtonColor: "#000",
        background: isDark ? "#09090b" : "#fff",
        color: isDark ? "#fff" : "#000",
      });
    } finally {
      setLoadingPromo(false);
    }
  };

  const handleDeletePromo = async (id, code) => {
    Swal.fire({
      title: "Hapus Promo?",
      text: `Apakah Anda yakin ingin menghapus kode promo ${code}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000",
      cancelButtonColor: "#d33",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
      background: isDark ? "#09090b" : "#fff",
      color: isDark ? "#fff" : "#000",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch(`${CRUD_URL}/admin-features/promos/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            Swal.fire({
              icon: "success",
              title: "Deleted",
              text: "Kode promo berhasil dihapus.",
              background: isDark ? "#09090b" : "#fff",
              color: isDark ? "#fff" : "#000",
            });
            fetchPromos();
          } else {
            Swal.fire("Failed", "Gagal menghapus promo.", "error");
          }
        } catch (error) {
          Swal.fire("Error", "Terjadi kesalahan.", "error");
        }
      }
    });
  };

  const generateRandomCode = () => {
    const prefixes = ["PROMO", "SAVE", "DEAL", "DISC", "FESTIVE"];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setPromoForm((prev) => ({ ...prev, code: `${prefix}${randomNum}` }));
  };

  const formatRupiah = (angka) => {
    return "Rp " + Number(angka).toLocaleString("id-ID");
  };

  const feeTypes = [
    { value: "percentage", label: "Percent", desc: "Percentage charge calculated from purchase value." },
    { value: "fixed", label: "Fixed rate", desc: "Flat rate charge per completed transaction." },
    { value: "both", label: "Both", desc: "Combined flat rate and purchase percentage fee." },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-20 animate-fade-in">
      {/* Title Header */}
      <div className="mb-12">
        <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter leading-none mb-4">
          Platform <span className="italic">Control.</span>
        </h1>
        <p className={`text-xl max-w-xl ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
          Adjust platform acquisition fees and manage subsidized promo codes for the marketplace.
        </p>
      </div>

      {/* Top Section: Setting Cards side-by-side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 items-start">
        
        {/* Card 1: Platform settings */}
        <div className={`p-6 sm:p-8 border rounded-lg transition-all duration-300 h-full ${
          isDark ? "border-zinc-900 bg-zinc-950/20" : "border-zinc-200/60 bg-zinc-50/20"
        }`}>
          <div className="flex items-center space-x-2 mb-8">
            <div className={`w-8 h-8 flex items-center justify-center rounded border ${isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-white"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xs uppercase tracking-[0.3em] font-black">Fee Configurations</h2>
          </div>

          <form onSubmit={handleUpdateSettings} className="space-y-8">
            <div>
              <label className="block text-[8px] uppercase tracking-widest font-black opacity-60 mb-3">Platform Fee Type</label>
              <div className="grid grid-cols-3 gap-2">
                {feeTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSettings({ ...settings, fee_type: type.value })}
                    className={`p-3.5 border text-[9px] uppercase tracking-widest font-black transition-all duration-300 rounded-sm cursor-pointer ${
                      settings.fee_type === type.value
                        ? isDark
                          ? "border-zinc-100 bg-zinc-100 text-zinc-950 shadow-md shadow-white/5"
                          : "border-zinc-900 bg-zinc-900 text-white shadow-md shadow-black/5"
                        : isDark
                          ? "border-zinc-850 hover:border-zinc-700 bg-transparent text-zinc-400"
                          : "border-zinc-200 hover:border-zinc-400 bg-transparent text-zinc-650"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
              <p className={`text-[9px] italic mt-2 opacity-50 ${isDark ? "text-zinc-400" : "text-zinc-550"}`}>
                {feeTypes.find((t) => t.value === settings.fee_type)?.desc}
              </p>
            </div>

            {(settings.fee_type === "percentage" || settings.fee_type === "both") && (
              <div className="space-y-2">
                <label className="block text-[8px] uppercase tracking-widest font-black opacity-60">Fee Percentage</label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={settings.fee_percentage}
                    onChange={(e) => setSettings({ ...settings, fee_percentage: parseFloat(e.target.value) || 0 })}
                    className="w-full py-3 pr-8 bg-transparent border-b focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors text-3xl font-black font-mono tracking-tight"
                    required
                  />
                  <span className="absolute right-0 text-xl font-bold opacity-45">%</span>
                </div>
              </div>
            )}

            {(settings.fee_type === "fixed" || settings.fee_type === "both") && (
              <div className="space-y-2">
                <label className="block text-[8px] uppercase tracking-widest font-black opacity-60">Fixed Flat Fee</label>
                <div className="relative flex items-center">
                  <span className="absolute left-0 text-xs font-bold opacity-45">Rp</span>
                  <input
                    type="number"
                    min="0"
                    value={settings.fee_fixed}
                    onChange={(e) => setSettings({ ...settings, fee_fixed: parseFloat(e.target.value) || 0 })}
                    className="w-full py-3 pl-8 bg-transparent border-b focus:outline-none focus:border-zinc-900 dark:focus:border-zinc-100 transition-colors text-3xl font-black font-mono tracking-tight"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loadingSettings}
              className={`w-full py-5 rounded-none font-bold text-[10px] uppercase tracking-[0.3em] transition-all duration-300 border cursor-pointer ${
                isDark
                  ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100"
                  : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"
              } disabled:opacity-20`}
            >
              {loadingSettings ? "Processing..." : "Update Fee Structure"}
            </button>
          </form>
        </div>

        {/* Card 2: Promo generator */}
        <div className={`p-6 sm:p-8 border rounded-lg transition-all duration-300 h-full ${
          isDark ? "border-zinc-900 bg-zinc-950/20" : "border-zinc-200/60 bg-zinc-50/20"
        }`}>
          <div className="flex items-center space-x-2 mb-8">
            <div className={`w-8 h-8 flex items-center justify-center rounded border ${isDark ? "border-zinc-800 bg-zinc-900" : "border-zinc-200 bg-white"}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <h2 className="text-xs uppercase tracking-[0.3em] font-black">Generate Voucher</h2>
          </div>

          <form onSubmit={handleCreatePromo} className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[8px] uppercase tracking-widest font-black opacity-60">Promo Code Name</label>
                <button
                  type="button"
                  onClick={generateRandomCode}
                  className="text-[9px] uppercase tracking-widest font-black underline underline-offset-4 opacity-50 hover:opacity-100 cursor-pointer"
                >
                  Auto Generate
                </button>
              </div>
              <input
                type="text"
                value={promoForm.code}
                onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                placeholder="e.g. FLASH30"
                className="w-full py-2 bg-transparent border-b focus:outline-none uppercase font-black text-2xl tracking-wide font-mono"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[8px] uppercase tracking-widest font-black opacity-60">Voucher Type</label>
                <select
                  value={promoForm.type}
                  onChange={(e) => setPromoForm({ ...promoForm, type: e.target.value })}
                  className={`w-full py-3 bg-transparent border-b focus:outline-none text-[10px] uppercase font-bold tracking-widest ${
                    isDark ? "border-zinc-855 border-zinc-800 text-zinc-300" : "border-zinc-200 text-zinc-800"
                  }`}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Flat (Rp)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-[8px] uppercase tracking-widest font-black opacity-60">Discount Value</label>
                <div className="relative flex items-center">
                  {promoForm.type === "fixed" && <span className="absolute left-0 text-xs font-bold opacity-45">Rp</span>}
                  <input
                    type="number"
                    min="0"
                    value={promoForm.value}
                    onChange={(e) => setPromoForm({ ...promoForm, value: e.target.value })}
                    placeholder={promoForm.type === "percentage" ? "e.g. 15" : "e.g. 15000"}
                    className={`w-full py-2 bg-transparent border-b focus:outline-none text-2xl font-black font-mono tracking-tight ${
                      promoForm.type === "fixed" ? "pl-8" : "pr-8"
                    }`}
                    required
                  />
                  {promoForm.type === "percentage" && <span className="absolute right-0 text-lg font-bold opacity-45">%</span>}
                </div>
              </div>
            </div>

            {/* Toggle max uses limit */}
            <div className="pt-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest font-bold opacity-60">Limit Total Redemptions</span>
                <button
                  type="button"
                  onClick={() => setUseMaxUsesLimit(!useMaxUsesLimit)}
                  className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    useMaxUsesLimit ? (isDark ? "bg-zinc-100" : "bg-zinc-900") : "bg-zinc-300 dark:bg-zinc-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out ${
                      useMaxUsesLimit ? (isDark ? "translate-x-5 bg-zinc-950" : "translate-x-5 bg-white") : "translate-x-0 bg-white dark:bg-zinc-400"
                    }`}
                  />
                </button>
              </div>

              {useMaxUsesLimit && (
                <div className="mt-4 space-y-2 animate-fade-in">
                  <label className="block text-[8px] uppercase tracking-widest font-black opacity-60">Maximum Uses Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={promoForm.max_uses}
                    onChange={(e) => setPromoForm({ ...promoForm, max_uses: e.target.value })}
                    placeholder="e.g. 50"
                    className="w-full py-2 bg-transparent border-b focus:outline-none font-mono text-sm"
                    required
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loadingPromo}
              className={`w-full py-5 rounded-none font-bold text-[10px] uppercase tracking-[0.3em] transition-all duration-300 border cursor-pointer ${
                isDark
                  ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100"
                  : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"
              } disabled:opacity-20`}
            >
              {loadingPromo ? "Generating..." : "Generate Voucher"}
            </button>
          </form>
        </div>

      </div>

      {/* Bottom Section: Active Coupons List (Full width with responsive multi-column grid) */}
      <div className="space-y-8">
        <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <h2 className="text-[10px] uppercase tracking-[0.3em] font-black opacity-40">Subsidized Promo Ledgers</h2>
          <span className={`text-[8px] uppercase tracking-widest font-black px-2 py-0.5 border rounded-sm ${
            isDark ? "border-zinc-800 text-zinc-400" : "border-zinc-200 text-zinc-500"
          }`}>
            {promosList.length} Active Vouchers
          </span>
        </div>

        {promosList.length === 0 ? (
          <div className={`py-20 text-center border-2 border-dashed rounded-lg transition-colors w-full ${
            isDark ? "border-zinc-900 bg-zinc-950/10" : "border-zinc-200 bg-zinc-50/10"
          }`}>
            <div className="flex justify-center mb-4 opacity-20">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <p className="text-sm font-serif italic opacity-40">No promo codes registered.</p>
            <p className="text-[9px] uppercase tracking-widest font-bold opacity-30 mt-1">Generate a voucher code on the top console.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {promosList.map((promo) => {
              const percentUsed = promo.max_uses ? (promo.used_count / promo.max_uses) * 100 : 0;
              const isExhausted = promo.max_uses !== null && promo.used_count >= promo.max_uses;

              return (
                <div
                  key={promo.id}
                  className={`p-6 border rounded-lg transition-all duration-300 hover:shadow-lg relative overflow-hidden flex flex-col justify-between ${
                    isDark 
                      ? "border-zinc-900 bg-zinc-950/40 hover:border-zinc-850" 
                      : "border-zinc-200 bg-white hover:border-zinc-350"
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    {/* Left Coupon Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Coupon Code Dashed Style */}
                        <span className={`px-3 py-1.5 border-2 border-dashed font-mono font-black text-lg tracking-wider rounded-sm ${
                          isExhausted
                            ? "opacity-30 border-zinc-500 text-zinc-500"
                            : isDark
                              ? "border-zinc-700 bg-zinc-900/40 text-zinc-100"
                              : "border-zinc-300 bg-zinc-50/50 text-zinc-900"
                        }`}>
                          {promo.code}
                        </span>
                        
                        {/* Discount Value Badge */}
                        <span className={`text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-sm border ${
                          isExhausted
                            ? "border-zinc-500/25 text-zinc-500 bg-zinc-500/5"
                              : isDark
                                ? "border-emerald-900/50 text-emerald-400 bg-emerald-950/10"
                                : "border-emerald-200 text-emerald-800 bg-emerald-50"
                        }`}>
                          {promo.type === "percentage" ? `${promo.value}% Off` : `-${formatRupiah(promo.value)}`}
                        </span>
                      </div>
                    </div>

                    {/* Right Delete Button */}
                    <button
                      onClick={() => handleDeletePromo(promo.id, promo.code)}
                      className={`shrink-0 p-3.5 border transition-all cursor-pointer rounded-sm ${
                        isDark
                          ? "border-zinc-850 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-950"
                          : "border-zinc-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                      }`}
                      title="Delete Voucher"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Progress Bar / usage detail */}
                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                    {promo.max_uses !== null ? (
                      <div className="w-full">
                        <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-black mb-1.5 opacity-50">
                          <span>Redeemed limit</span>
                          <span>{promo.used_count} / {promo.max_uses}</span>
                        </div>
                        <div className={`w-full h-1.5 rounded-full overflow-hidden ${isDark ? "bg-zinc-900" : "bg-zinc-100"}`}>
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isExhausted
                                ? "bg-rose-500/40"
                                : percentUsed >= 90
                                  ? "bg-rose-500"
                                  : percentUsed >= 70
                                    ? "bg-amber-500"
                                    : isDark
                                      ? "bg-zinc-100"
                                      : "bg-zinc-900"
                            }`}
                            style={{ width: `${Math.min(percentUsed, 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[9px] uppercase font-bold tracking-wider opacity-50">
                        <span>Redeemed: <span className="font-mono">{promo.used_count} times</span></span>
                        <span className={`px-1.5 py-0.5 rounded-sm border ${
                          isDark ? "border-zinc-800 bg-zinc-900/40 text-zinc-400" : "border-zinc-200 bg-zinc-50 text-zinc-505"
                        }`}>Unlimited Uses</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPlatformSettings;

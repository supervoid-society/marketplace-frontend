import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";
import { AUTH_URL } from "../config";
import Swal from "sweetalert2";

function SellerOnboarding() {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const token = localStorage.getItem("token") || "";

  // Decode user ID from token
  const getUserId = (tok) => {
    if (!tok) return null;
    try {
      const payload = JSON.parse(atob(tok.split(".")[1]));
      return payload.userId || null;
    } catch {
      return null;
    }
  };

  const userId = getUserId(token);

  useEffect(() => {
    if (!token || !userId) {
      Swal.fire({
        icon: "warning",
        title: "Akses Ditolak",
        text: "Silakan login terlebih dahulu untuk mendaftarkan toko.",
        confirmButtonColor: "#000",
      });
      navigate("/login");
    }
  }, [token, userId, navigate]);

  const [onboardingForm, setOnboardingForm] = useState({
    store_name: "",
    description: "",
    contact_phone: "",
  });

  const handleOnboarding = async (e) => {
    e.preventDefault();
    if (!userId) return;

    try {
      const res = await fetch(`${AUTH_URL}/auth/sellers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          store_name: onboardingForm.store_name,
          description: onboardingForm.description,
          contact_phone: onboardingForm.contact_phone,
        }),
      });

      const data = await res.json();
      if (data.token) {
        // Update local storage with the new token
        localStorage.setItem("token", data.token);

        // Dispatch storage event so App.jsx picks it up
        window.dispatchEvent(new Event("storage"));

        Swal.fire({
          icon: "success",
          title: "Selamat!",
          text: "Toko Anda berhasil dibuat! Sekarang Anda beralih ke Mode Penjual.",
          confirmButtonColor: "#000",
        });

        navigate("/manage-catalog");
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: "Gagal membuat profil penjual: " + (data.error || "Unknown error"),
        });
      }
    } catch (error) {
      console.error("Seller onboarding error:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Terjadi kesalahan saat pendaftaran toko.",
      });
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] px-4 md:px-6 py-8 flex items-center justify-center">
      <div className="w-full flex justify-center">
        <div className={`p-8 md:p-12 rounded-none border transition-all duration-200 max-w-lg w-full ${isDark ? "bg-zinc-950 border-zinc-900" : "bg-white border-zinc-100"}`}>
          <div className="mb-12 text-center">
            <h2 className="text-4xl md:text-5xl font-serif italic mb-4">Merchant Onboarding.</h2>
            <p className={`text-[10px] uppercase tracking-[0.3em] font-black ${isDark ? "text-zinc-600" : "text-zinc-300"}`}>Start Selling Your Products</p>
          </div>
          <form onSubmit={handleOnboarding} className="space-y-8 md:space-y-10">
            <div className="space-y-8">
              <div>
                <label className={`block text-[10px] uppercase tracking-[0.2em] font-black mb-3 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Store Name</label>
                <input
                  type="text"
                  placeholder="Enter Store Name"
                  value={onboardingForm.store_name}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, store_name: e.target.value })}
                  className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 ${
                    isDark ? "border-zinc-800 text-white placeholder-zinc-700 focus:border-white" : "border-zinc-100 text-black placeholder-zinc-300 focus:border-black"
                  }`}
                  required
                />
              </div>
              <div>
                <label className={`block text-[10px] uppercase tracking-[0.2em] font-black mb-3 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Contact Phone</label>
                <input
                  type="tel"
                  placeholder="Enter Contact Phone Number"
                  value={onboardingForm.contact_phone}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, contact_phone: e.target.value })}
                  className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 ${
                    isDark ? "border-zinc-800 text-white placeholder-zinc-700 focus:border-white" : "border-zinc-100 text-black placeholder-zinc-300 focus:border-black"
                  }`}
                />
              </div>
              <div>
                <label className={`block text-[10px] uppercase tracking-[0.2em] font-black mb-3 ${isDark ? "text-zinc-500" : "text-zinc-400"}`}>Store Description</label>
                <textarea
                  placeholder="Tell us about what you sell..."
                  value={onboardingForm.description}
                  onChange={(e) => setOnboardingForm({ ...onboardingForm, description: e.target.value })}
                  className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 min-h-[100px] ${
                    isDark ? "border-zinc-800 text-white placeholder-zinc-700 focus:border-white" : "border-zinc-100 text-black placeholder-zinc-300 focus:border-black"
                  }`}
                />
              </div>
            </div>
            <button
              type="submit"
              className={`w-full py-6 rounded-none transition-all duration-300 active:scale-95 font-bold text-[10px] uppercase tracking-[0.3em] border ${isDark ? "bg-zinc-100 text-zinc-900 border-zinc-100 hover:bg-transparent hover:text-zinc-100" : "bg-zinc-900 text-white border-zinc-900 hover:bg-transparent hover:text-zinc-900"}`}
            >
              Open My Store
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SellerOnboarding;

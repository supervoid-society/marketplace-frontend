import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import Swal from "sweetalert2";

const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:8787";

function Settings() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("security");
  const [userRole, setUserRole] = useState("");
  const [hasProfileImage, setHasProfileImage] = useState(false);
  const [personalForm, setPersonalForm] = useState({
    full_name: "",
    address: "",
    phone: "",
    store_name: "",
    description: "",
    contact_phone: "",
    image: null,
    imagePreview: null,
  });
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newUsername: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null;

  useEffect(() => {
    if (token) {
      setUserRole(payload.role);
      setSecurityForm((prev) => ({ ...prev, newUsername: payload.username }));
      if (payload.role === "admin") setActiveTab("security");
      loadPersonalInfo(payload.role);
    }
  }, [token]);

  const loadPersonalInfo = async (role) => {
    try {
      const endpoint = role === "buyer" ? `${AUTH_URL}/buyers/me` : `${AUTH_URL}/sellers/me`;
      const res = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setPersonalForm({
          full_name: data.full_name || "",
          address: data.address || "",
          phone: data.phone || "",
          store_name: data.store_name || "",
          description: data.description || "",
          contact_phone: data.contact_phone || "",
        });
        if (data.image_id) {
          const imgRes = await fetch(`${AUTH_URL}/users/profile-image/${payload.userId}`);
          setHasProfileImage(imgRes.ok);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handlePersonalUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = userRole === "buyer" ? `${AUTH_URL}/buyers/me` : `${AUTH_URL}/sellers/me`;
      let body =
        userRole === "buyer"
          ? {
              full_name: personalForm.full_name,
              address: personalForm.address,
              phone: personalForm.phone,
            }
          : {
              store_name: personalForm.store_name,
              description: personalForm.description,
              contact_phone: personalForm.contact_phone,
            };

      const performUpdate = async (finalBody) => {
        const res = await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(finalBody),
        });
        if (res.ok) {
          Swal.fire({ icon: "success", title: "Updated", background: isDark ? "#09090b" : "#fff", color: isDark ? "#fff" : "#000" });
          setPersonalForm((prev) => ({ ...prev, image: null, imagePreview: null }));
          loadPersonalInfo(userRole);
        }
      };

      if (personalForm.image) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          body.image_base64 = e.target.result.split(",")[1];
          body.image_content_type = personalForm.image.type;
          await performUpdate(body);
        };
        reader.readAsDataURL(personalForm.image);
      } else {
        await performUpdate(body);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityUpdate = async (e) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      Swal.fire({ icon: "error", title: "Error", text: "Passwords do not match" });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          currentPassword: securityForm.currentPassword,
          newUsername: securityForm.newUsername,
          newPassword: securityForm.newPassword,
        }),
      });
      if (res.ok) {
        Swal.fire({ icon: "success", title: "Secured" });
        if (securityForm.newUsername) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="py-8 px-4 md:px-6 max-w-5xl mx-auto">
      <div className="mb-20">
        <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter leading-none mb-4">Preferences.</h1>
        <p className={`text-xl ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>Account configuration and identity management.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-4 lg:sticky lg:top-32">
          <nav className="flex flex-col gap-px bg-zinc-200 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
            {userRole !== "admin" && (
              <button
                onClick={() => setActiveTab("personal")}
                className={`px-8 py-6 text-left font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === "personal" ? (isDark ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-white") : isDark ? "bg-zinc-950 text-zinc-600 hover:text-zinc-300" : "bg-white text-zinc-400 hover:text-zinc-900"}`}
              >
                Personal Information
              </button>
            )}
            <button
              onClick={() => setActiveTab("security")}
              className={`px-8 py-6 text-left font-bold text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${activeTab === "security" ? (isDark ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-white") : isDark ? "bg-zinc-950 text-zinc-600 hover:text-zinc-300" : "bg-white text-zinc-400 hover:text-zinc-900"}`}
            >
              Security & Access
            </button>
          </nav>
        </div>

        <div className="lg:col-span-8">
          <div className={`p-6 md:p-12 border ${isDark ? "border-zinc-900 bg-zinc-900/20" : "border-zinc-100 bg-zinc-50/20"}`}>
            {activeTab === "personal" ? (
              <form onSubmit={handlePersonalUpdate} className="space-y-12">
                <h2 className="text-3xl font-serif italic mb-12">Profile Details</h2>

                <div className="space-y-8">
                  {userRole === "buyer" ? (
                    <>
                      <div className="space-y-3">
                        <label className={`text-[10px] uppercase tracking-widest font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Full Name</label>
                        <input
                          type="text"
                          value={personalForm.full_name}
                          onChange={(e) => setPersonalForm({ ...personalForm, full_name: e.target.value })}
                          className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 ${isDark ? "border-zinc-800 text-white focus:border-white" : "border-zinc-200 text-black focus:border-black"}`}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className={`text-[10px] uppercase tracking-widest font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Primary Address</label>
                        <textarea
                          value={personalForm.address}
                          onChange={(e) => setPersonalForm({ ...personalForm, address: e.target.value })}
                          className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 min-h-[100px] ${isDark ? "border-zinc-800 text-white focus:border-white" : "border-zinc-200 text-black focus:border-black"}`}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className={`text-[10px] uppercase tracking-widest font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Contact Phone</label>
                        <input
                          type="tel"
                          value={personalForm.phone}
                          onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                          className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 ${isDark ? "border-zinc-800 text-white focus:border-white" : "border-zinc-200 text-black focus:border-black"}`}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <label className={`text-[10px] uppercase tracking-widest font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Store Designation</label>
                        <input
                          type="text"
                          value={personalForm.store_name}
                          onChange={(e) => setPersonalForm({ ...personalForm, store_name: e.target.value })}
                          className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 ${isDark ? "border-zinc-800 text-white focus:border-white" : "border-zinc-200 text-black focus:border-black"}`}
                        />
                      </div>
                      <div className="space-y-3">
                        <label className={`text-[10px] uppercase tracking-widest font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Public Description</label>
                        <textarea
                          value={personalForm.description}
                          onChange={(e) => setPersonalForm({ ...personalForm, description: e.target.value })}
                          className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 min-h-[100px] ${isDark ? "border-zinc-800 text-white focus:border-white" : "border-zinc-200 text-black focus:border-black"}`}
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-6">
                    <label className={`block text-[10px] uppercase tracking-widest font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Portrait</label>
                    <div className="flex items-center gap-10">
                      <div className={`w-24 h-32 border grayscale ${isDark ? "border-zinc-800 bg-zinc-950" : "border-zinc-100 bg-zinc-50"}`}>
                        {personalForm.imagePreview || hasProfileImage ? (
                          <img src={personalForm.imagePreview || `${AUTH_URL}/users/profile-image/${payload.userId}`} className="w-full h-full object-cover" alt="Profile" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[8px] uppercase tracking-widest opacity-20">None</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) setPersonalForm({ ...personalForm, image: file, imagePreview: URL.createObjectURL(file) });
                          }}
                          className="hidden"
                          id="profile-upload"
                        />
                        <label htmlFor="profile-upload" className="cursor-pointer text-[10px] uppercase tracking-widest font-black underline underline-offset-8">
                          Update Image
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-6 rounded-none font-bold text-[10px] uppercase tracking-[0.3em] transition-all duration-300 border ${isDark ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-white"}`}
                >
                  {loading ? "Processing..." : "Commit Profile Changes"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSecurityUpdate} className="space-y-12">
                <h2 className="text-3xl font-serif italic mb-12">Security Protocol</h2>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className={`text-[10px] uppercase tracking-widest font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Current Key</label>
                    <input
                      type="password"
                      value={securityForm.currentPassword}
                      onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                      className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 ${isDark ? "border-zinc-800 text-white focus:border-white" : "border-zinc-200 text-black focus:border-black"}`}
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className={`text-[10px] uppercase tracking-widest font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>New Identity / Username</label>
                    <input
                      type="text"
                      value={securityForm.newUsername}
                      onChange={(e) => setSecurityForm({ ...securityForm, newUsername: e.target.value })}
                      className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 ${isDark ? "border-zinc-800 text-white focus:border-white" : "border-zinc-200 text-black focus:border-black"}`}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-3">
                      <label className={`text-[10px] uppercase tracking-widest font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>New Key</label>
                      <input
                        type="password"
                        value={securityForm.newPassword}
                        onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                        className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 ${isDark ? "border-zinc-800 text-white focus:border-white" : "border-zinc-200 text-black focus:border-black"}`}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className={`text-[10px] uppercase tracking-widest font-black ${isDark ? "text-zinc-600" : "text-zinc-400"}`}>Verify Key</label>
                      <input
                        type="password"
                        value={securityForm.confirmPassword}
                        onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                        className={`w-full py-4 bg-transparent border-b focus:outline-none transition-all duration-200 ${isDark ? "border-zinc-800 text-white focus:border-white" : "border-zinc-200 text-black focus:border-black"}`}
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full py-6 rounded-none font-bold text-[10px] uppercase tracking-[0.3em] transition-all duration-300 border ${isDark ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-white"}`}
                >
                  {loading ? "Securing..." : "Apply Security Protocol"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;

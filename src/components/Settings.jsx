import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import Swal from 'sweetalert2';

const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8787';

function Settings() {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState("security"); // Default to security
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
    imagePreview: null
  });
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newUsername: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserRole(payload.role);
      if (payload.role === 'admin') {
        setActiveTab("security");
      }
      loadPersonalInfo(payload.role);
    }
  }, [token]);

  const loadPersonalInfo = async (role) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const payload = JSON.parse(atob(token.split('.')[1]));
    try {
      if (role === 'buyer') {
        const res = await fetch(`${AUTH_URL}/buyers/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPersonalForm({
            full_name: data.full_name || "",
            address: data.address || "",
            phone: data.phone || "",
            store_name: "",
            description: "",
            contact_phone: ""
          });
          
          // Load current profile image
          if (data.image_id) {
            try {
              const imgRes = await fetch(`${AUTH_URL}/users/profile-image/${payload.userId}`);
              setHasProfileImage(imgRes.ok);
            } catch (error) {
              console.error("Error loading current profile image:", error);
              setHasProfileImage(false);
            }
          } else {
            setHasProfileImage(false);
          }
        }
      } else if (role === 'seller') {
        const res = await fetch(`${AUTH_URL}/sellers/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setPersonalForm({
            full_name: "",
            address: "",
            phone: "",
            store_name: data.store_name || "",
            description: data.description || "",
            contact_phone: data.contact_phone || ""
          });
          
          // Load current profile image
          if (data.image_id) {
            try {
              const imgRes = await fetch(`${AUTH_URL}/users/profile-image/${payload.userId}`);
              setHasProfileImage(imgRes.ok);
            } catch (error) {
              console.error("Error loading current profile image:", error);
              setHasProfileImage(false);
            }
          } else {
            setHasProfileImage(false);
          }
        }
      }
    } catch (error) {
      console.error("Error loading personal info:", error);
    }
  };

  const handlePersonalUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let endpoint, body;
      if (userRole === 'buyer') {
        endpoint = `${AUTH_URL}/buyers/me`;
        body = {
          full_name: personalForm.full_name,
          address: personalForm.address,
          phone: personalForm.phone
        };
      } else if (userRole === 'seller') {
        endpoint = `${AUTH_URL}/sellers/me`;
        body = {
          store_name: personalForm.store_name,
          description: personalForm.description,
          contact_phone: personalForm.contact_phone
        };
      }

      // Add image if exists
      if (personalForm.image) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64 = e.target.result.split(',')[1];
          body.image_base64 = base64;
          body.image_content_type = personalForm.image.type;

          const res = await fetch(endpoint, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
          });

          if (res.ok) {
            Swal.fire({
              icon: 'success',
              title: 'Berhasil',
              text: 'Informasi berhasil diperbarui!',
            });
            setPersonalForm(prev => ({ ...prev, image: null, imagePreview: null }));
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Gagal',
              text: 'Gagal memperbarui informasi',
            });
          }
        };
        reader.readAsDataURL(personalForm.image);
        return;
      }

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Informasi berhasil diperbarui!',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Gagal memperbarui informasi',
        });
      }
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSecurityUpdate = async (e) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Password baru tidak cocok',
      });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${AUTH_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: securityForm.currentPassword,
          newUsername: securityForm.newUsername,
          newPassword: securityForm.newPassword
        })
      });

      if (res.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Keamanan berhasil diperbarui!',
        });
        setSecurityForm({
          currentPassword: "",
          newUsername: "",
          newPassword: "",
          confirmPassword: ""
        });
        // Update token if username changed
        if (securityForm.newUsername) {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } else {
        const error = await res.json();
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Gagal memperbarui keamanan: ' + (error.error || "Unknown error"),
        });
      }
    } catch (error) {
      console.error("Security update error:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Terjadi kesalahan',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return <div className="min-h-screen flex items-center justify-center">Please login first</div>;
  }

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300 ${isDark ? 'bg-black text-white' : 'bg-white text-black'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Pengaturan</h1>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Kelola informasi dan keamanan akun Anda</p>
        </div>

        <div className="mb-6">
          <nav className={`flex space-x-4 p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            {userRole !== 'admin' && (
              <button
                onClick={() => setActiveTab("personal")}
                className={`px-6 py-3 rounded-lg font-medium transition duration-200 ${
                  activeTab === "personal"
                    ? "bg-gray-600 text-white shadow-lg"
                    : `${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
                }`}
              >
                Informasi Pribadi
              </button>
            )}
            <button
              onClick={() => setActiveTab("security")}
              className={`px-6 py-3 rounded-lg font-medium transition duration-200 ${
                activeTab === "security"
                  ? "bg-gray-600 text-white shadow-lg"
                  : `${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
              }`}
            >
              Keamanan
            </button>
          </nav>
        </div>

        <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          {activeTab === "personal" && userRole !== 'admin' && (
            <form onSubmit={handlePersonalUpdate} className="space-y-6">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Update Informasi Pribadi
              </h2>

              {userRole === 'buyer' && (
                <>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={personalForm.full_name}
                      onChange={(e) => setPersonalForm({ ...personalForm, full_name: e.target.value })}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-gray-500'
                          : 'border-gray-300 bg-white text-black placeholder-gray-500 focus:ring-gray-500'
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Alamat
                    </label>
                    <textarea
                      value={personalForm.address}
                      onChange={(e) => setPersonalForm({ ...personalForm, address: e.target.value })}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 h-24 resize-none ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-gray-500'
                          : 'border-gray-300 bg-white text-black placeholder-gray-500 focus:ring-gray-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Telepon
                    </label>
                    <input
                      type="tel"
                      value={personalForm.phone}
                      onChange={(e) => setPersonalForm({ ...personalForm, phone: e.target.value })}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-gray-500'
                          : 'border-gray-300 bg-white text-black placeholder-gray-500 focus:ring-gray-500'
                      }`}
                    />
                  </div>
                </>
              )}

              {userRole === 'seller' && (
                <>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nama Toko
                    </label>
                    <input
                      type="text"
                      value={personalForm.store_name}
                      onChange={(e) => setPersonalForm({ ...personalForm, store_name: e.target.value })}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-gray-500'
                          : 'border-gray-300 bg-white text-black placeholder-gray-500 focus:ring-gray-500'
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Deskripsi
                    </label>
                    <textarea
                      value={personalForm.description}
                      onChange={(e) => setPersonalForm({ ...personalForm, description: e.target.value })}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 h-24 resize-none ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-gray-500'
                          : 'border-gray-300 bg-white text-black placeholder-gray-500 focus:ring-gray-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Telepon Kontak
                    </label>
                    <input
                      type="tel"
                      value={personalForm.contact_phone}
                      onChange={(e) => setPersonalForm({ ...personalForm, contact_phone: e.target.value })}
                      className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                        isDark
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-gray-500'
                          : 'border-gray-300 bg-white text-black placeholder-gray-500 focus:ring-gray-500'
                      }`}
                    />
                  </div>
                </>
              )}

              {/* Image Upload */}
              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Foto Profil
                </label>
                
                {/* Current Profile Image */}
                {hasProfileImage && (
                  <div className="mb-4">
                    <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Foto Profil Saat Ini:</p>
                    <div className="flex items-center gap-3">
                      <img
                        src={`${AUTH_URL}/users/profile-image/${payload.userId}`}
                        alt="Current Profile"
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                      />
                      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Foto profil Anda saat ini</span>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setPersonalForm({
                          ...personalForm,
                          image: file,
                          imagePreview: URL.createObjectURL(file)
                        });
                      }
                    }}
                    className={`file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:transition-colors ${
                      isDark
                        ? 'file:bg-gray-700 file:text-white file:hover:bg-gray-600'
                        : 'file:bg-gray-100 file:text-gray-700 file:hover:bg-gray-200'
                    }`}
                  />
                  {personalForm.imagePreview && (
                    <img
                      src={personalForm.imagePreview}
                      alt="Preview"
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-300"
                    />
                  )}
                </div>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {hasProfileImage ? 'Upload gambar baru untuk mengganti foto profil' : 'Pilih gambar untuk foto profil (opsional)'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition duration-200 disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          )}

          {activeTab === "security" && (
            <form onSubmit={handleSecurityUpdate} className="space-y-6">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Update Keamanan
              </h2>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password Saat Ini
                </label>
                <input
                  type="password"
                  value={securityForm.currentPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, currentPassword: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-gray-500'
                      : 'border-gray-300 bg-white text-black placeholder-gray-500 focus:ring-gray-500'
                  }`}
                  required
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Username Baru (Opsional)
                </label>
                <input
                  type="text"
                  value={securityForm.newUsername}
                  onChange={(e) => setSecurityForm({ ...securityForm, newUsername: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-gray-500'
                      : 'border-gray-300 bg-white text-black placeholder-gray-500 focus:ring-gray-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password Baru
                </label>
                <input
                  type="password"
                  value={securityForm.newPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, newPassword: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-gray-500'
                      : 'border-gray-300 bg-white text-black placeholder-gray-500 focus:ring-gray-500'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  value={securityForm.confirmPassword}
                  onChange={(e) => setSecurityForm({ ...securityForm, confirmPassword: e.target.value })}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                    isDark
                      ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400 focus:ring-gray-500'
                      : 'border-gray-300 bg-white text-black placeholder-gray-500 focus:ring-gray-500'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition duration-200 disabled:opacity-50"
              >
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
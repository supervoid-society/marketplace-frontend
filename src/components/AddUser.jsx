import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8787';

function AddUser({ token }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [form, setForm] = useState({ username: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${AUTH_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        navigate("/manage-users");
      } else {
        const error = await res.json();
        alert(error.error || "Failed to add user");
      }
    } catch (error) {
      console.error("Add error:", error);
    }
  };

  return (
    <div className={`max-w-md mx-auto p-8 rounded-xl shadow-2xl ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'}`}>
      <h2 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>Add New User</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="w-full p-3 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full p-3 mb-6 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
          required
        />
        <div className="flex gap-4">
          <button type="submit" className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-500 transition duration-200 flex-1">
            Add User
          </button>
          <button
            type="button"
            onClick={() => navigate("/manage-users")}
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition duration-200 flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddUser;
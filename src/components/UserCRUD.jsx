import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext";

const AUTH_URL = import.meta.env.VITE_AUTH_SERVICE_URL || 'http://localhost:8787';

function UserCRUD({ token }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${AUTH_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`${AUTH_URL}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchUsers();
      } else {
        alert("Failed to delete user");
      }
    } catch (error) {
      console.error("Delete user error:", error);
    }
  };

  const openEditModal = (user) => {
    navigate(`/manage-users/${user.id}`);
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
        <h2 className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-0 transition-colors duration-300 ${isDark ? 'text-white' : 'text-gray-800'}`}>User Management</h2>
        <button
          onClick={() => navigate("/manage-users/add")}
          className="bg-gray-600 text-white px-8 py-2 rounded-lg hover:bg-gray-500 transition duration-200 shadow-md text-sm sm:text-base"
        >
          Add New User
        </button>
      </div>

      <div className={`rounded-xl shadow-lg overflow-hidden ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 min-w-[600px]">
            <thead className={`${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <tr>
                <th className={`text-left p-4 sm:p-6 font-semibold border border-gray-300 whitespace-nowrap ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>ID</th>
                <th className={`text-left p-4 sm:p-6 font-semibold border border-gray-300 whitespace-nowrap ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Username</th>
                <th className={`text-left p-4 sm:p-6 font-semibold border border-gray-300 whitespace-nowrap ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Created At</th>
                <th className={`text-left p-4 sm:p-6 font-semibold border border-gray-300 whitespace-nowrap ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className={`border-b transition duration-200 ${isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-100 hover:bg-gray-50'}`}>
                  <td className={`p-4 sm:p-6 border border-gray-300 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{user.id}</td>
                  <td className={`p-4 sm:p-6 font-medium border border-gray-300 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{user.username}</td>
                  <td className={`p-4 sm:p-6 border border-gray-300 whitespace-nowrap ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="p-4 sm:p-6 border border-gray-300 whitespace-nowrap">
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                      <button
                        onClick={() => openEditModal(user)}
                        className="bg-gray-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-500 transition duration-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="bg-gray-700 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

export default UserCRUD;
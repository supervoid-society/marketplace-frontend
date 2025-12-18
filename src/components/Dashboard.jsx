import { useState } from "react";
import CatalogCRUD from "./CatalogCRUD";
import UserCRUD from "./UserCRUD";

function Dashboard({ token, onLogout }) {
  const [activeTab, setActiveTab] = useState("catalog");

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 sm:mb-0">Admin Dashboard</h1>
          <button
            onClick={onLogout}
            className="bg-gray-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-gray-600 transition duration-200 shadow-md text-sm sm:text-base"
          >
            Logout
          </button>
        </header>

        <div className="mb-6">
          <nav className={`flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 p-4 rounded-lg shadow-md ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-6 py-3 rounded-lg font-medium transition duration-200 ${
                activeTab === "catalog"
                  ? "bg-gray-600 text-white shadow-lg"
                  : `${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
              }`}
            >
              Manage Catalog
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-3 rounded-lg font-medium transition duration-200 ${
                activeTab === "users"
                  ? "bg-gray-600 text-white shadow-lg"
                  : `${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
              }`}
            >
              Manage Users
            </button>
          </nav>
        </div>

        <div className={`p-6 rounded-lg shadow-md ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
          {activeTab === "catalog" && <CatalogCRUD token={token} />}
          {activeTab === "users" && <UserCRUD token={token} />}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
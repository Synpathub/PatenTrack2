import { useAuth } from '@/context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            PatenTrack Admin Portal
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              {user?.name || user?.username} ({user?.role})
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white h-screen shadow-md">
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 rounded hover:bg-gray-200"
              >
                Users
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 rounded hover:bg-gray-200"
              >
                Customers
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 rounded hover:bg-gray-200"
              >
                Analytics
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 rounded hover:bg-gray-200"
              >
                Settings
              </a>
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Total Users
                </h3>
                <p className="text-3xl font-bold text-blue-600">0</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Active Customers
                </h3>
                <p className="text-3xl font-bold text-green-600">0</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Total Patents
                </h3>
                <p className="text-3xl font-bold text-purple-600">0</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  System Status
                </h3>
                <p className="text-3xl font-bold text-yellow-600">OK</p>
              </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Recent Activity
              </h3>
              <p className="text-gray-500">No recent activity to display.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

import { useAuth } from '@/context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            PatenTrack Shared View
          </h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-700">
              Viewing as: {user?.name || user?.username}
            </span>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Exit
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
                Overview
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 rounded hover:bg-gray-200"
              >
                Documents
              </a>
              <a
                href="#"
                className="block px-4 py-2 text-gray-700 rounded hover:bg-gray-200"
              >
                Details
              </a>
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Shared Content</h2>
            
            <div className="bg-white p-6 rounded-lg shadow mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Shared Information
              </h3>
              <p className="text-gray-600">
                This is a read-only view of shared patent information.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Document Count
                </h3>
                <p className="text-3xl font-bold text-blue-600">0</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Last Updated
                </h3>
                <p className="text-lg text-gray-600">N/A</p>
              </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Documents
              </h3>
              <p className="text-gray-500">No documents to display.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

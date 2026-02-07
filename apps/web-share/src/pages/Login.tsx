import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { code, type } = useParams<{ code: string; type: string }>();
  const { authenticateWithCode, isAuthenticated } = useAuth();
  
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (code && type && !isAuthenticated) {
      handleAuthentication(code, type);
    }
  }, [code, type, isAuthenticated]);

  const handleAuthentication = async (authCode: string, authType: string) => {
    setError('');
    setIsLoading(true);

    try {
      await authenticateWithCode(authCode, authType);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Authentication failed. Invalid or expired code.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            PatenTrack Shared View
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isLoading ? 'Authenticating...' : 'Access shared content'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {!code && !type && !isLoading && (
          <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
            <p className="text-sm">
              Please use a valid share link to access this content.
            </p>
            <p className="text-sm mt-2">
              The link should be in the format: <code>/[code]/[type]</code>
            </p>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;

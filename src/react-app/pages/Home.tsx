import { useAuth } from '@/react-app/contexts/AuthContext';
import { useNavigate } from 'react-router';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import LoginForm from '@/react-app/components/LoginForm';

export default function Home() {
  const { user, isPending } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isPending) {
      navigate('/dashboard');
    }
  }, [user, isPending, navigate]);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white">
        <div className="animate-spin mb-4">
          <Loader2 className="w-10 h-10 text-indigo-600" />
        </div>
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-white">
        <div className="animate-spin mb-4">
          <Loader2 className="w-10 h-10 text-indigo-600" />
        </div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    );
  }

  return <LoginForm />;
}

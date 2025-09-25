import { ReactNode } from 'react';
import { useAuth } from '@/react-app/contexts/AuthContext';
import { Link, useNavigate } from 'react-router';
import { 
  User, 
  LogOut, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Settings,
  GraduationCap
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export default function Layout({ children, title }: LayoutProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) {
    return <div>{children}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="flex items-center space-x-2">
                <GraduationCap className="w-8 h-8 text-indigo-600" />
                <span className="text-xl font-bold text-gray-900">EduTrack Pro</span>
              </Link>
              {title && (
                <>
                  <span className="text-gray-300">|</span>
                  <h1 className="text-lg font-semibold text-gray-800">{title}</h1>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <User className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-4">
            <div className="space-y-2">
              <Link
                to="/dashboard"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              >
                <TrendingUp className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              
              <Link
                to="/attendance"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              >
                <Calendar className="w-5 h-5" />
                <span>Attendance</span>
              </Link>
              
              <Link
                to="/performance"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                <span>Performance</span>
              </Link>
              
              <Link
                to="/admin"
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
              >
                <Settings className="w-5 h-5" />
                <span>Admin</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

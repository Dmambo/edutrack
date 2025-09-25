import { useState } from 'react';
import { useAuth } from '@/react-app/contexts/AuthContext';
import { GraduationCap, Users, BookOpen, TrendingUp, Eye, EyeOff } from 'lucide-react';

export default function LoginForm() {
  const { login, isPending } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState<'admin' | 'teacher' | 'student'>('student');

  const { register } = useAuth();

  const features = [
    {
      icon: Users,
      title: "Role-Based Access",
      description: "Separate dashboards for admins, teachers, and students"
    },
    {
      icon: BookOpen,
      title: "Attendance Tracking",
      description: "Mark and monitor daily attendance with detailed reports"
    },
    {
      icon: TrendingUp,
      title: "Performance Analytics",
      description: "Track grades, assignments, and academic progress"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLoginMode) {
      const result = await login(email, password);
      if (!result.success) {
        setError(result.error || 'Login failed');
      }
    } else {
      if (!firstName || !lastName) {
        setError('First name and last name are required');
        return;
      }
      const result = await register(email, password, firstName, lastName, role);
      if (!result.success) {
        setError(result.error || 'Registration failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="flex min-h-screen">
        {/* Left side - Features */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 text-white">
          <div className="max-w-md mx-auto">
            <div className="flex items-center space-x-3 mb-12">
              <GraduationCap className="w-10 h-10" />
              <h1 className="text-3xl font-bold">EduTrack Pro</h1>
            </div>
            
            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Comprehensive Student Management System
            </h2>
            
            <p className="text-xl mb-12 text-indigo-100">
              Track attendance, monitor performance, and drive academic excellence with our intelligent platform.
            </p>
            
            <div className="space-y-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <feature.icon className="w-6 h-6 text-indigo-200" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-indigo-100 text-sm">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Login */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-12">
          <div className="max-w-md w-full">
            {/* Mobile header */}
            <div className="lg:hidden text-center mb-12">
              <div className="flex items-center justify-center space-x-3 mb-4">
                <GraduationCap className="w-10 h-10 text-indigo-600" />
                <h1 className="text-3xl font-bold text-gray-900">EduTrack Pro</h1>
              </div>
              <p className="text-gray-600">Student Performance & Attendance Management</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  {isLoginMode ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-gray-600">
                  {isLoginMode ? 'Sign in to access your dashboard' : 'Join EduTrack Pro today'}
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLoginMode && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          placeholder="John"
                          required={!isLoginMode}
                        />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                          placeholder="Doe"
                          required={!isLoginMode}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value as 'admin' | 'teacher' | 'student')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                    placeholder="john@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {isPending ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>{isLoginMode ? 'Signing in...' : 'Creating account...'}</span>
                    </div>
                  ) : (
                    isLoginMode ? 'Sign In' : 'Create Account'
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => {
                    setIsLoginMode(!isLoginMode);
                    setError('');
                    setEmail('');
                    setPassword('');
                    setFirstName('');
                    setLastName('');
                  }}
                  className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                >
                  {isLoginMode 
                    ? "Don't have an account? Sign up" 
                    : "Already have an account? Sign in"
                  }
                </button>
              </div>

              {isLoginMode && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="text-center text-sm text-gray-500">
                    <p className="font-medium text-gray-700 mb-3">Demo Accounts:</p>
                    <div className="space-y-1 text-left bg-gray-50 p-4 rounded-lg">
                      <p><span className="font-medium">Admin:</span> admin@edutrack.com</p>
                      <p><span className="font-medium">Teacher:</span> teacher@edutrack.com</p>
                      <p><span className="font-medium">Student:</span> student@edutrack.com</p>
                    </div>
                    <p className="mt-4 text-xs">Password: password123</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

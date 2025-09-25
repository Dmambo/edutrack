import { useAuth } from '@/react-app/contexts/AuthContext';
import { useApi } from '@/react-app/hooks/useApi';
import Layout from '@/react-app/components/Layout';
import { 
  Users, 
  BookOpen, 
  Calendar,
  UserCheck,
  Award,
  Clock
} from 'lucide-react';

interface DashboardStats {
  // Admin stats
  totalStudents?: number;
  totalTeachers?: number;
  totalClasses?: number;
  todayAttendance?: number;
  
  // Student stats
  attendancePercentage?: number;
  averageGrade?: number;
  enrolledClasses?: number;
  
  // Teacher stats
  myClasses?: number;
  todayAttendanceMarked?: number;
}

export default function Dashboard() {
  const { user, isPending } = useAuth();
  const { data: stats, loading: statsLoading } = useApi<DashboardStats>('/api/dashboard/stats');

  if (isPending) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Authentication Required</h2>
          <p className="text-yellow-700">
            Please log in to access your dashboard.
          </p>
        </div>
      </Layout>
    );
  }

  const role = user.role;
  const userName = user.first_name 
    ? `${user.first_name} ${user.last_name || ''}`.trim()
    : user.email;

  const renderAdminDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Admin Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Students</p>
                <p className="text-3xl font-bold">{stats?.totalStudents || 0}</p>
              </div>
              <Users className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Teachers</p>
                <p className="text-3xl font-bold">{stats?.totalTeachers || 0}</p>
              </div>
              <UserCheck className="w-8 h-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Classes</p>
                <p className="text-3xl font-bold">{stats?.totalClasses || 0}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Today's Attendance</p>
                <p className="text-3xl font-bold">{stats?.todayAttendance || 0}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudentDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">My Progress</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Attendance Rate</p>
                <p className="text-3xl font-bold">{stats?.attendancePercentage || 0}%</p>
              </div>
              <Calendar className="w-8 h-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Average Grade</p>
                <p className="text-3xl font-bold">{stats?.averageGrade || 0}%</p>
              </div>
              <Award className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Enrolled Classes</p>
                <p className="text-3xl font-bold">{stats?.enrolledClasses || 0}</p>
              </div>
              <BookOpen className="w-8 h-8 text-purple-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTeacherDashboard = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Teaching Overview</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100 text-sm">My Classes</p>
                <p className="text-3xl font-bold">{stats?.myClasses || 0}</p>
              </div>
              <BookOpen className="w-8 h-8 text-indigo-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Total Students</p>
                <p className="text-3xl font-bold">{stats?.totalStudents || 0}</p>
              </div>
              <Users className="w-8 h-8 text-green-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Today's Attendance</p>
                <p className="text-3xl font-bold">{stats?.todayAttendanceMarked || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {userName}
              </h1>
              <p className="text-gray-600 capitalize">
                {role} Dashboard
              </p>
            </div>
            <div className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
              {role}
            </div>
          </div>
        </div>

        {statsLoading ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          </div>
        ) : (
          <>
            {role === 'admin' && renderAdminDashboard()}
            {role === 'student' && renderStudentDashboard()}
            {role === 'teacher' && renderTeacherDashboard()}
          </>
        )}
      </div>
    </Layout>
  );
}

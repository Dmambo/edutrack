import { useState, useEffect } from 'react';
import { useAuth } from '@/react-app/contexts/AuthContext';
import { useApi } from '@/react-app/hooks/useApi';
import Layout from '@/react-app/components/Layout';
import { Users, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

interface AttendanceRecord {
  id: number;
  student_id: number;
  class_id: number;
  attendance_date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes: string | null;
  first_name: string;
  last_name: string;
  class_name: string;
}

interface Class {
  id: number;
  name: string;
  code: string;
  description: string;
}

export default function Attendance() {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { data: classesData } = useApi<Class[]>('/api/classes');
  const { data: attendanceData, loading: attendanceLoading } = useApi<AttendanceRecord[]>(
    `/api/attendance?class_id=${selectedClass}&date=${selectedDate}`,
    [selectedClass, selectedDate]
  );

  useEffect(() => {
    if (classesData) {
      setClasses(classesData);
      if (classesData.length > 0 && !selectedClass) {
        setSelectedClass(classesData[0].id.toString());
      }
    }
  }, [classesData, selectedClass]);

  useEffect(() => {
    if (attendanceData) {
      setAttendanceRecords(attendanceData);
    }
  }, [attendanceData]);

  const markAttendance = async (studentId: number, status: string) => {
    if (!selectedClass) return;

    try {
      setLoading(true);
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({
          student_id: studentId,
          class_id: parseInt(selectedClass),
          attendance_date: selectedDate,
          status: status,
        }),
      });

      if (response.ok) {
        // Refresh attendance data
        window.location.reload();
      } else {
        setError('Failed to mark attendance');
      }
    } catch (err) {
      setError('Error marking attendance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'late':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'excused':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'excused':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (user?.role === 'student') {
    return (
      <Layout title="My Attendance">
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">My Attendance Records</h2>
            
            {attendanceLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {attendanceRecords.map((record) => (
                      <tr key={record.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.attendance_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.class_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                            {getStatusIcon(record.status)}
                            <span className="ml-1 capitalize">{record.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {record.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {attendanceRecords.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No attendance records found for the selected date.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Attendance Management">
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Attendance Management</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select a class</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name} ({cls.code})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {selectedClass && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Mark Attendance</h3>
              <p className="text-sm text-gray-600 mb-4">
                Click on the status buttons to mark attendance for each student.
              </p>
              
              {attendanceLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {attendanceRecords.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                      <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {record.first_name} {record.last_name}
                        </span>
                        {record.status && (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}>
                            {getStatusIcon(record.status)}
                            <span className="ml-1 capitalize">{record.status}</span>
                          </span>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => markAttendance(record.student_id, 'present')}
                          disabled={loading}
                          className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full hover:bg-green-200 disabled:opacity-50"
                        >
                          Present
                        </button>
                        <button
                          onClick={() => markAttendance(record.student_id, 'absent')}
                          disabled={loading}
                          className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-full hover:bg-red-200 disabled:opacity-50"
                        >
                          Absent
                        </button>
                        <button
                          onClick={() => markAttendance(record.student_id, 'late')}
                          disabled={loading}
                          className="px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-full hover:bg-yellow-200 disabled:opacity-50"
                        >
                          Late
                        </button>
                        <button
                          onClick={() => markAttendance(record.student_id, 'excused')}
                          disabled={loading}
                          className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full hover:bg-blue-200 disabled:opacity-50"
                        >
                          Excused
                        </button>
                      </div>
                    </div>
                  ))}
                  {attendanceRecords.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No students found for the selected class and date.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

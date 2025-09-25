// Mock API for static deployment
export const mockApi = {
  // Mock user data
  users: [
    {
      id: 1,
      email: "admin@edutrack.com",
      first_name: "Admin",
      last_name: "User",
      role: "admin" as const,
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 2,
      email: "teacher@edutrack.com", 
      first_name: "John",
      last_name: "Teacher",
      role: "teacher" as const,
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 3,
      email: "student@edutrack.com",
      first_name: "Jane",
      last_name: "Student", 
      role: "student" as const,
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    }
  ],

  // Mock classes data
  classes: [
    {
      id: 1,
      name: "Mathematics 101",
      code: "MATH101",
      description: "Introduction to Mathematics",
      teacher_id: 2,
      academic_year: "2024",
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    },
    {
      id: 2,
      name: "Science 101", 
      code: "SCI101",
      description: "Introduction to Science",
      teacher_id: 2,
      academic_year: "2024",
      is_active: true,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-01-01T00:00:00Z"
    }
  ],

  // Mock attendance data
  attendance: [
    {
      id: 1,
      student_id: 3,
      class_id: 1,
      attendance_date: "2024-01-15",
      status: "present" as const,
      notes: null,
      first_name: "Jane",
      last_name: "Student",
      class_name: "Mathematics 101"
    }
  ],

  // Mock performance data
  performance: [
    {
      id: 1,
      student_id: 3,
      class_id: 1,
      assessment_type: "exam" as const,
      assessment_name: "Midterm Exam",
      total_marks: 100,
      obtained_marks: 85,
      assessment_date: "2024-01-15",
      grade: "B+",
      remarks: "Good performance",
      first_name: "Jane",
      last_name: "Student", 
      class_name: "Mathematics 101"
    }
  ],

  // Mock dashboard stats
  dashboardStats: {
    totalStudents: 1,
    totalTeachers: 1,
    totalClasses: 2,
    totalAttendance: 1,
    recentAttendance: [
      {
        id: 1,
        student_name: "Jane Student",
        class_name: "Mathematics 101",
        status: "present",
        date: "2024-01-15"
      }
    ],
    recentPerformance: [
      {
        id: 1,
        student_name: "Jane Student",
        class_name: "Mathematics 101",
        assessment_name: "Midterm Exam",
        grade: "B+",
        date: "2024-01-15"
      }
    ]
  }
};

// Mock API functions
export const mockApiCall = async (url: string, _options?: RequestInit) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100));

  const path = url.replace('/api', '');
  
  switch (path) {
    case '/users/me':
      return { user: mockApi.users[0] };
    
    case '/users':
      return mockApi.users;
    
    case '/classes':
      return mockApi.classes;
    
    case '/attendance':
      return mockApi.attendance;
    
    case '/performance':
      return mockApi.performance;
    
    case '/dashboard/stats':
      return mockApi.dashboardStats;
    
    default:
      throw new Error(`Mock API: ${path} not found`);
  }
};

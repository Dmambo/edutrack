import { Hono } from "hono";
import { cors } from "hono/cors";
import { zValidator } from "@hono/zod-validator";
import { 
  CreateUserSchema, 
  CreateClassSchema, 
  MarkAttendanceSchema, 
  AddPerformanceSchema
} from "@/shared/types";
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  verifyToken, 
  extractTokenFromHeader,
  User 
} from "@/shared/auth";

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('/*', cors({
  origin: '*',
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

// Auth middleware
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    return c.json({ error: "No token provided" }, 401);
  }
  
  const decoded = verifyToken(token);
  if (!decoded) {
    return c.json({ error: "Invalid token" }, 401);
  }
  
  // Get user from database
  const user = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ? AND is_active = 1"
  ).bind(decoded.userId).first();
  
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }
  
  c.set('user', user);
  await next();
};

// Authentication endpoints
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }
    
    // Find user by email
    const user = await c.env.DB.prepare(
      "SELECT * FROM users WHERE email = ? AND is_active = 1"
    ).bind(email).first();
    
    if (!user) {
      return c.json({ error: "Invalid credentials" }, 401);
    }
    
    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return c.json({ error: "Invalid credentials" }, 401);
    }
    
    // Generate token
    const token = generateToken(user);
    
    return c.json({ 
      success: true, 
      token, 
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.post('/api/auth/register', async (c) => {
  try {
    const { email, password, firstName, lastName, role } = await c.req.json();
    
    if (!email || !password || !firstName || !lastName || !role) {
      return c.json({ error: "All fields are required" }, 400);
    }
    
    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      "SELECT id FROM users WHERE email = ?"
    ).bind(email).first();
    
    if (existingUser) {
      return c.json({ error: "User already exists" }, 400);
    }
    
    // Hash password
    const passwordHash = await hashPassword(password);
    
    // Create user
    const result = await c.env.DB.prepare(`
      INSERT INTO users (email, password_hash, first_name, last_name, role)
      VALUES (?, ?, ?, ?, ?)
    `).bind(email, passwordHash, firstName, lastName, role).run();
    
    // Get the created user
    const newUser = await c.env.DB.prepare(
      "SELECT * FROM users WHERE id = ?"
    ).bind(result.meta.last_row_id).first();
    
    // Generate token
    const token = generateToken(newUser);
    
    return c.json({ 
      success: true, 
      token, 
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        role: newUser.role,
        is_active: newUser.is_active,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: "Internal server error" }, 500);
  }
});

app.post('/api/auth/logout', authMiddleware, async (c) => {
  // For JWT tokens, logout is handled client-side by removing the token
  return c.json({ success: true });
});

app.get("/api/users/me", authMiddleware, async (c) => {
  const user = c.get("user");
  return c.json({ user });
});

// User management endpoints
app.post('/api/users', authMiddleware, zValidator('json', CreateUserSchema), async (c) => {
  const requestingUser = c.get("user");
  const data = c.req.valid('json');

  if (requestingUser.role !== 'admin') {
    return c.json({ error: "Unauthorized. Admin access required." }, 403);
  }

  // Hash password for new user
  const passwordHash = await hashPassword(data.password || 'defaultPassword123');

  const result = await c.env.DB.prepare(`
    INSERT INTO users (email, password_hash, first_name, last_name, role)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    data.email,
    passwordHash,
    data.first_name || null,
    data.last_name || null,
    data.role
  ).run();

  const newUser = await c.env.DB.prepare(
    "SELECT * FROM users WHERE id = ?"
  ).bind(result.meta.last_row_id).first();

  return c.json(newUser, 201);
});

app.get('/api/users', authMiddleware, async (c) => {
  const requestingUser = c.get("user");

  if (requestingUser.role !== 'admin') {
    return c.json({ error: "Unauthorized. Admin access required." }, 403);
  }

  const users = await c.env.DB.prepare(
    "SELECT id, email, first_name, last_name, role, is_active, created_at, updated_at FROM users WHERE is_active = 1 ORDER BY created_at DESC"
  ).all();

  return c.json(users.results);
});

// Class management endpoints
app.post('/api/classes', authMiddleware, zValidator('json', CreateClassSchema), async (c) => {
  const requestingUser = c.get("user");
  const data = c.req.valid('json');

  if (requestingUser.role !== 'admin') {
    return c.json({ error: "Unauthorized. Admin access required." }, 403);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO classes (name, code, description, teacher_id, academic_year)
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    data.name,
    data.code,
    data.description || null,
    data.teacher_id || null,
    data.academic_year
  ).run();

  const newClass = await c.env.DB.prepare(
    "SELECT * FROM classes WHERE id = ?"
  ).bind(result.meta.last_row_id).first();

  return c.json(newClass, 201);
});

app.get('/api/classes', authMiddleware, async (c) => {
  const requestingUser = c.get("user");
  
  let query = "SELECT * FROM classes WHERE is_active = 1";
  const params = [];

  // If teacher, only show their classes
  if (requestingUser.role === 'teacher') {
    query += " AND teacher_id = ?";
    params.push(requestingUser.id);
  }
  // If student, show enrolled classes
  else if (requestingUser.role === 'student') {
    query = `
      SELECT c.* FROM classes c
      INNER JOIN enrollments e ON c.id = e.class_id
      WHERE c.is_active = 1 AND e.is_active = 1 AND e.student_id = ?
    `;
    params.push(requestingUser.id);
  }

  query += " ORDER BY name";

  const classes = await c.env.DB.prepare(query).bind(...params).all();
  return c.json(classes.results);
});

// Attendance endpoints
app.post('/api/attendance', authMiddleware, zValidator('json', MarkAttendanceSchema), async (c) => {
  const requestingUser = c.get("user");
  const data = c.req.valid('json');

  if (requestingUser.role !== 'admin' && requestingUser.role !== 'teacher') {
    return c.json({ error: "Unauthorized. Teacher or Admin access required." }, 403);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO attendance (student_id, class_id, attendance_date, status, notes, marked_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    data.student_id,
    data.class_id,
    data.attendance_date,
    data.status,
    data.notes || null,
    requestingUser.id
  ).run();

  const newAttendance = await c.env.DB.prepare(
    "SELECT * FROM attendance WHERE id = ?"
  ).bind(result.meta.last_row_id).first();

  return c.json(newAttendance, 201);
});

app.get('/api/attendance', authMiddleware, async (c) => {
  const requestingUser = c.get("user");
  const classId = c.req.query('class_id');
  const studentId = c.req.query('student_id');
  const date = c.req.query('date');

  let query = `
    SELECT a.*, u.first_name, u.last_name, c.name as class_name
    FROM attendance a
    INNER JOIN users u ON a.student_id = u.id
    INNER JOIN classes c ON a.class_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (classId) {
    query += " AND a.class_id = ?";
    params.push(classId);
  }

  if (studentId) {
    query += " AND a.student_id = ?";
    params.push(studentId);
  }

  if (date) {
    query += " AND a.attendance_date = ?";
    params.push(date);
  }

  // If student, only show their own attendance
  if (requestingUser.role === 'student') {
    query += " AND a.student_id = ?";
    params.push(requestingUser.id);
  }

  query += " ORDER BY a.attendance_date DESC, c.name";

  const attendance = await c.env.DB.prepare(query).bind(...params).all();
  return c.json(attendance.results);
});

// Performance endpoints
app.post('/api/performance', authMiddleware, zValidator('json', AddPerformanceSchema), async (c) => {
  const requestingUser = c.get("user");
  const data = c.req.valid('json');

  if (requestingUser.role !== 'admin' && requestingUser.role !== 'teacher') {
    return c.json({ error: "Unauthorized. Teacher or Admin access required." }, 403);
  }

  const result = await c.env.DB.prepare(`
    INSERT INTO performance (student_id, class_id, assessment_type, assessment_name, total_marks, obtained_marks, assessment_date, grade, remarks, entered_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    data.student_id,
    data.class_id,
    data.assessment_type,
    data.assessment_name,
    data.total_marks,
    data.obtained_marks,
    data.assessment_date || null,
    data.grade || null,
    data.remarks || null,
    requestingUser.id
  ).run();

  const newPerformance = await c.env.DB.prepare(
    "SELECT * FROM performance WHERE id = ?"
  ).bind(result.meta.last_row_id).first();

  return c.json(newPerformance, 201);
});

app.get('/api/performance', authMiddleware, async (c) => {
  const requestingUser = c.get("user");
  const classId = c.req.query('class_id');
  const studentId = c.req.query('student_id');

  let query = `
    SELECT p.*, u.first_name, u.last_name, c.name as class_name
    FROM performance p
    INNER JOIN users u ON p.student_id = u.id
    INNER JOIN classes c ON p.class_id = c.id
    WHERE 1=1
  `;
  const params = [];

  if (classId) {
    query += " AND p.class_id = ?";
    params.push(classId);
  }

  if (studentId) {
    query += " AND p.student_id = ?";
    params.push(studentId);
  }

  // If student, only show their own performance
  if (requestingUser.role === 'student') {
    query += " AND p.student_id = ?";
    params.push(requestingUser.id);
  }

  query += " ORDER BY p.assessment_date DESC, c.name";

  const performance = await c.env.DB.prepare(query).bind(...params).all();
  return c.json(performance.results);
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', authMiddleware, async (c) => {
  const requestingUser = c.get("user");

  let stats = {};

  if (requestingUser.role === 'admin') {
    // Admin dashboard stats
    const totalStudents = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM users WHERE role = 'student' AND is_active = 1"
    ).first();

    const totalTeachers = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM users WHERE role = 'teacher' AND is_active = 1"
    ).first();

    const totalClasses = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM classes WHERE is_active = 1"
    ).first();

    const todayAttendance = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM attendance WHERE attendance_date = date('now')"
    ).first();

    stats = {
      totalStudents: totalStudents?.count || 0,
      totalTeachers: totalTeachers?.count || 0,
      totalClasses: totalClasses?.count || 0,
      todayAttendance: todayAttendance?.count || 0,
    };
  } else if (requestingUser.role === 'student') {
    // Student dashboard stats
    const attendanceStats = await c.env.DB.prepare(`
      SELECT 
        COUNT(*) as total_days,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present_days
      FROM attendance 
      WHERE student_id = ?
    `).bind(requestingUser.id).first();

    const recentGrades = await c.env.DB.prepare(`
      SELECT AVG(obtained_marks * 100.0 / total_marks) as avg_percentage
      FROM performance 
      WHERE student_id = ?
    `).bind(requestingUser.id).first();

    const enrolledClasses = await c.env.DB.prepare(`
      SELECT COUNT(*) as count 
      FROM enrollments 
      WHERE student_id = ? AND is_active = 1
    `).bind(requestingUser.id).first();

    const totalDays = (attendanceStats?.total_days as number) || 0;
    const presentDays = (attendanceStats?.present_days as number) || 0;
    const avgPercentage = (recentGrades?.avg_percentage as number) || 0;
    const classCount = (enrolledClasses?.count as number) || 0;

    stats = {
      attendancePercentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0,
      averageGrade: Math.round(avgPercentage),
      enrolledClasses: classCount,
    };
  } else if (requestingUser.role === 'teacher') {
    // Teacher dashboard stats
    const myClasses = await c.env.DB.prepare(
      "SELECT COUNT(*) as count FROM classes WHERE teacher_id = ? AND is_active = 1"
    ).bind(requestingUser.id).first();

    const studentsInMyClasses = await c.env.DB.prepare(`
      SELECT COUNT(DISTINCT e.student_id) as count
      FROM enrollments e
      INNER JOIN classes c ON e.class_id = c.id
      WHERE c.teacher_id = ? AND e.is_active = 1
    `).bind(requestingUser.id).first();

    const todayAttendanceMarked = await c.env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM attendance a
      INNER JOIN classes c ON a.class_id = c.id
      WHERE c.teacher_id = ? AND a.attendance_date = date('now')
    `).bind(requestingUser.id).first();

    stats = {
      myClasses: myClasses?.count || 0,
      totalStudents: studentsInMyClasses?.count || 0,
      todayAttendanceMarked: todayAttendanceMarked?.count || 0,
    };
  }

  return c.json(stats);
});

export default app;
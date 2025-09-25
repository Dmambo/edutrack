import z from "zod";

// User roles enum
export const UserRole = z.enum(['admin', 'teacher', 'student']);
export type UserRoleType = z.infer<typeof UserRole>;

// User schema
export const UserSchema = z.object({
  id: z.number(),
  mocha_user_id: z.string(),
  email: z.string().email(),
  first_name: z.string().nullable(),
  last_name: z.string().nullable(),
  role: UserRole,
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type UserType = z.infer<typeof UserSchema>;

// Class schema
export const ClassSchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  description: z.string().nullable(),
  teacher_id: z.number().nullable(),
  academic_year: z.string(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type ClassType = z.infer<typeof ClassSchema>;

// Enrollment schema
export const EnrollmentSchema = z.object({
  id: z.number(),
  student_id: z.number(),
  class_id: z.number(),
  enrolled_date: z.string().nullable(),
  is_active: z.boolean(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type EnrollmentType = z.infer<typeof EnrollmentSchema>;

// Attendance status enum
export const AttendanceStatus = z.enum(['present', 'absent', 'late', 'excused']);
export type AttendanceStatusType = z.infer<typeof AttendanceStatus>;

// Attendance schema
export const AttendanceSchema = z.object({
  id: z.number(),
  student_id: z.number(),
  class_id: z.number(),
  attendance_date: z.string(),
  status: AttendanceStatus,
  notes: z.string().nullable(),
  marked_by: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type AttendanceType = z.infer<typeof AttendanceSchema>;

// Assessment type enum
export const AssessmentType = z.enum(['exam', 'assignment', 'quiz', 'project', 'homework']);
export type AssessmentTypeType = z.infer<typeof AssessmentType>;

// Performance schema
export const PerformanceSchema = z.object({
  id: z.number(),
  student_id: z.number(),
  class_id: z.number(),
  assessment_type: AssessmentType,
  assessment_name: z.string(),
  total_marks: z.number(),
  obtained_marks: z.number(),
  assessment_date: z.string().nullable(),
  grade: z.string().nullable(),
  remarks: z.string().nullable(),
  entered_by: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type PerformanceType = z.infer<typeof PerformanceSchema>;

// Correction request type enum
export const CorrectionRequestType = z.enum(['attendance', 'performance']);
export const CorrectionRequestStatus = z.enum(['pending', 'approved', 'rejected']);

// Correction request schema
export const CorrectionRequestSchema = z.object({
  id: z.number(),
  student_id: z.number(),
  request_type: CorrectionRequestType,
  reference_id: z.number(),
  reason: z.string(),
  status: CorrectionRequestStatus,
  admin_notes: z.string().nullable(),
  reviewed_by: z.number().nullable(),
  reviewed_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type CorrectionRequestType = z.infer<typeof CorrectionRequestSchema>;

// API request/response schemas
export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  role: UserRole,
});

export const CreateClassSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string().optional(),
  teacher_id: z.number().optional(),
  academic_year: z.string().min(1),
});

export const MarkAttendanceSchema = z.object({
  student_id: z.number(),
  class_id: z.number(),
  attendance_date: z.string(),
  status: AttendanceStatus,
  notes: z.string().optional(),
});

export const AddPerformanceSchema = z.object({
  student_id: z.number(),
  class_id: z.number(),
  assessment_type: AssessmentType,
  assessment_name: z.string().min(1),
  total_marks: z.number().positive(),
  obtained_marks: z.number().min(0),
  assessment_date: z.string().optional(),
  grade: z.string().optional(),
  remarks: z.string().optional(),
});

export const CreateCorrectionRequestSchema = z.object({
  request_type: CorrectionRequestType,
  reference_id: z.number(),
  reason: z.string().min(1),
});

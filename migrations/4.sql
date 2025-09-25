-- Seed demo users with hashed passwords
-- Password for all demo users: password123
INSERT INTO users (email, password_hash, first_name, last_name, role, is_active) VALUES
('admin@edutrack.com', '$2a$10$EuIi8XS0RIEe/v4UMt/8BePiylFyL2WpUH9836bfTr9agio4zfynW', 'Admin', 'User', 'admin', 1),
('teacher@edutrack.com', '$2a$10$EuIi8XS0RIEe/v4UMt/8BePiylFyL2WpUH9836bfTr9agio4zfynW', 'Teacher', 'User', 'teacher', 1),
('student@edutrack.com', '$2a$10$EuIi8XS0RIEe/v4UMt/8BePiylFyL2WpUH9836bfTr9agio4zfynW', 'Student', 'User', 'student', 1),
('student1@edutrack.com', '$2a$10$EuIi8XS0RIEe/v4UMt/8BePiylFyL2WpUH9836bfTr9agio4zfynW', 'John', 'Doe', 'student', 1),
('student2@edutrack.com', '$2a$10$EuIi8XS0RIEe/v4UMt/8BePiylFyL2WpUH9836bfTr9agio4zfynW', 'Jane', 'Smith', 'student', 1);

-- Create some demo classes
INSERT INTO classes (name, code, description, teacher_id, academic_year, is_active) VALUES
('Mathematics 101', 'MATH101', 'Introduction to Algebra and Geometry', 2, '2024-2025', 1),
('English Literature', 'ENG201', 'Classic and Modern Literature', 2, '2024-2025', 1),
('Science Fundamentals', 'SCI101', 'Basic Physics and Chemistry', 2, '2024-2025', 1);

-- Enroll students in classes
INSERT INTO enrollments (student_id, class_id, enrolled_date, is_active) VALUES
(3, 1, '2024-01-15', 1),
(3, 2, '2024-01-15', 1),
(3, 3, '2024-01-15', 1),
(4, 1, '2024-01-15', 1),
(4, 2, '2024-01-15', 1),
(5, 1, '2024-01-15', 1),
(5, 3, '2024-01-15', 1);

-- National Health Career Academy — clean schema
-- Run once on OVH MySQL to set up nha_db

CREATE DATABASE IF NOT EXISTS nha_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE nha_db;

CREATE TABLE courses (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  title         VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) NOT NULL UNIQUE,
  description   TEXT,
  thumbnail     VARCHAR(500),
  category      VARCHAR(100) DEFAULT 'cybersecurity',
  level         ENUM('beginner','intermediate','advanced') DEFAULT 'beginner',
  is_published  BOOLEAN DEFAULT TRUE,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lessons (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  course_id     INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  section_title VARCHAR(255),
  title         VARCHAR(255) NOT NULL,
  slug          VARCHAR(255) NOT NULL,
  content       LONGTEXT,
  video_url     VARCHAR(500),
  sort_order    INT DEFAULT 0,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_course_slug (course_id, slug)
);

CREATE TABLE students (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(255) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  avatar        VARCHAR(500),
  role          ENUM('student','admin') DEFAULT 'student',
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE enrollments (
  student_id    INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  course_id     INT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  progress_pct  TINYINT DEFAULT 0,
  last_lesson_id INT,
  enrolled_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, course_id)
);

CREATE TABLE lesson_completions (
  student_id  INT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  lesson_id   INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, lesson_id)
);

CREATE TABLE live_classes (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  zoom_link       VARCHAR(500) NOT NULL,
  zoom_meeting_id VARCHAR(100),
  starts_at       DATETIME NOT NULL,
  duration_min    INT DEFAULT 60,
  instructor      VARCHAR(255) DEFAULT 'Instructor',
  created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── Migration v2 — 2026-04-14 ───────────────────────────────────────────────

ALTER TABLE courses
  ADD COLUMN IF NOT EXISTS price           DECIMAL(10,2)  NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS prerequisite_id INT            NULL,
  ADD COLUMN IF NOT EXISTS sort_order      INT            NOT NULL DEFAULT 0;

ALTER TABLE lessons
  ADD COLUMN IF NOT EXISTS type      ENUM('text','document','presentation','quiz') NOT NULL DEFAULT 'text',
  ADD COLUMN IF NOT EXISTS file_path VARCHAR(500) NULL;

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE enrollments
  ADD COLUMN IF NOT EXISTS granted_by_admin BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS quiz_questions (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id      INT NOT NULL,
  type           ENUM('multiple_choice','true_false','short_answer') NOT NULL,
  question       TEXT NOT NULL,
  options        JSON NULL,
  correct_answer VARCHAR(500) NULL,
  sort_order     INT NOT NULL DEFAULT 0,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

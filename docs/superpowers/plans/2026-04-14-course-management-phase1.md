# Course Management Phase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full Phase 1 NHA Academy LMS: Moodle import, admin course/lesson editor (Tiptap + file uploads + quiz builder), admin student management, and student-facing course experience with access control and payment mockup.

**Architecture:** Next.js 16 App Router with server components for data fetching and client components only where interactivity is needed. All admin mutations go through Route Handler API routes (`/api/admin/...`). Access control is checked server-side in page components using `auth()` and a shared `lib/access.ts` helper. Files are stored in `/public/uploads/` and served statically.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS 4, mysql2, NextAuth v5, Tiptap 2 (rich text), @dnd-kit (drag-to-reorder lessons), Vitest (unit tests for access logic)

**Spec:** `docs/superpowers/specs/2026-04-14-course-management-phase1-design.md`

---

## File Map

### New files
```
src/lib/moodle.ts                          Moodle DB pool + extraction queries
src/lib/access.ts                          Access control helpers (isFreeLesson, canAccess)
src/lib/upload.ts                          File upload handler (write to /public/uploads)

src/types/index.ts                         Extended with Course2, Lesson2, QuizQuestion, Student

src/components/editor/TiptapEditor.tsx     Tiptap WYSIWYG client component
src/components/admin/LessonTree.tsx        Drag-sortable lesson/section tree (client)
src/components/admin/LessonEditor.tsx      Tabbed lesson editor (text/doc/pptx/quiz)
src/components/admin/QuizBuilder.tsx       Quiz question CRUD form
src/components/admin/CourseForm.tsx        Create/edit course fields
src/components/course/LessonSidebar.tsx    Student-facing lesson sidebar with lock icons
src/components/course/LessonViewer.tsx     Renders lesson content by type

src/app/admin/courses/page.tsx             Course card dashboard
src/app/admin/courses/new/page.tsx         Create course page
src/app/admin/courses/[id]/page.tsx        Course editor (split view)
src/app/admin/courses/import/page.tsx      Moodle import wizard
src/app/admin/students/page.tsx            Student management table

src/app/api/admin/courses/route.ts         GET list, POST create
src/app/api/admin/courses/[id]/route.ts    GET, PUT, DELETE course
src/app/api/admin/lessons/route.ts         POST create lesson
src/app/api/admin/lessons/[id]/route.ts    GET, PUT, DELETE lesson
src/app/api/admin/lessons/reorder/route.ts PATCH reorder lessons
src/app/api/admin/upload/route.ts          POST file upload
src/app/api/admin/students/route.ts        GET list, POST create
src/app/api/admin/students/[id]/route.ts   PUT update, DELETE
src/app/api/admin/students/[id]/grant/route.ts POST grant course access
src/app/api/admin/import/scan/route.ts     GET scan Moodle DB
src/app/api/admin/import/run/route.ts      POST run import

src/app/courses/[slug]/page.tsx            Student course detail + lesson sidebar
src/app/courses/[slug]/enroll/page.tsx     Payment mockup placeholder

src/__tests__/access.test.ts               Unit tests for access control logic
```

### Modified files
```
src/app/courses/page.tsx                   Add price, lock icons, FREE badge
src/app/admin/page.tsx                     Add Students link
src/types/index.ts                         Extend existing types
src/lib/schema.sql                         Add migration block
```

---

## Task 1: Install dependencies

**Files:** `package.json`

- [ ] **Step 1: Install Tiptap, dnd-kit, and Vitest**

```bash
npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-table @tiptap/extension-underline
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install --save-dev vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom
```

- [ ] **Step 2: Add vitest config to `vite.config.ts` (create new file)**

```typescript
// vite.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    alias: { '@': '/src' },
  },
});
```

- [ ] **Step 3: Create test setup file**

```typescript
// src/__tests__/setup.ts
import '@testing-library/jest-dom';
```

- [ ] **Step 4: Add test script to `package.json`**

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 5: Verify vitest runs**

```bash
npx vitest run
```
Expected: "No test files found" (not an error — just no tests yet)

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vite.config.ts src/__tests__/setup.ts
git commit -m "chore: add Tiptap, dnd-kit, and Vitest"
```

---

## Task 2: DB migrations

**Files:** `src/lib/schema.sql` (modify), run on server

- [ ] **Step 1: Write the migration SQL**

Append to `src/lib/schema.sql`:

```sql
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
```

- [ ] **Step 2: Run migration on server**

SSH into the server and run:
```bash
ssh -p 2222 root@nationalhealthcareer.com
cd /var/www/nationalhealthcareer-com
mariadb -u admin_nhca -p'2u95#I7jm' nha_db < src/lib/schema.sql
```

Verify:
```bash
mariadb -u admin_nhca -p'2u95#I7jm' nha_db -e "DESCRIBE courses; DESCRIBE lessons; SHOW TABLES;"
```
Expected: `price`, `prerequisite_id`, `sort_order` columns visible on `courses`; `type`, `file_path` on `lessons`; `quiz_questions` table present.

- [ ] **Step 3: Create `/public/uploads/` directory on server**

```bash
mkdir -p /var/www/nationalhealthcareer-com/public/uploads
chmod 755 /var/www/nationalhealthcareer-com/public/uploads
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/schema.sql
git commit -m "feat: db migration v2 — add price, lesson type, quiz_questions, is_active"
```

---

## Task 3: Extended types + access control logic

**Files:** `src/types/index.ts` (modify), `src/lib/access.ts` (create), `src/__tests__/access.test.ts` (create)

- [ ] **Step 1: Write the failing tests**

```typescript
// src/__tests__/access.test.ts
import { describe, it, expect } from 'vitest';
import { isFreeLesson, canAccessLesson } from '@/lib/access';

const courses = [
  { id: 1, sort_order: 1 },
  { id: 2, sort_order: 2 },
];

const lessons = [
  { id: 10, course_id: 1, sort_order: 1, type: 'text' },
  { id: 11, course_id: 1, sort_order: 2, type: 'text' },
  { id: 20, course_id: 2, sort_order: 1, type: 'text' },
];

describe('isFreeLesson', () => {
  it('returns true for the first lesson of the first course', () => {
    expect(isFreeLesson(lessons[0], courses)).toBe(true);
  });
  it('returns false for the second lesson of the first course', () => {
    expect(isFreeLesson(lessons[1], courses)).toBe(false);
  });
  it('returns false for any lesson in course 2+', () => {
    expect(isFreeLesson(lessons[2], courses)).toBe(false);
  });
});

describe('canAccessLesson', () => {
  const enrollments = [{ course_id: 1, progress_pct: 50 }];

  it('allows admin always', () => {
    expect(canAccessLesson(lessons[1], courses, [], 'admin')).toBe(true);
  });
  it('allows free lesson without enrollment', () => {
    expect(canAccessLesson(lessons[0], courses, [], 'student')).toBe(true);
  });
  it('blocks non-free lesson when not enrolled', () => {
    expect(canAccessLesson(lessons[1], courses, [], 'student')).toBe(false);
  });
  it('allows non-free lesson when enrolled in that course', () => {
    expect(canAccessLesson(lessons[1], courses, enrollments, 'student')).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests — expect failure**

```bash
npx vitest run src/__tests__/access.test.ts
```
Expected: FAIL — `Cannot find module '@/lib/access'`

- [ ] **Step 3: Update types**

```typescript
// src/types/index.ts  — replace entire file
export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  is_published: boolean;
  price: number;
  prerequisite_id: number | null;
  sort_order: number;
  created_at: string;
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  slug: string;
  content: string | null;
  type: 'text' | 'document' | 'presentation' | 'quiz';
  file_path: string | null;
  video_url: string | null;
  sort_order: number;
  section_title: string | null;
}

export interface QuizQuestion {
  id: number;
  lesson_id: number;
  type: 'multiple_choice' | 'true_false' | 'short_answer';
  question: string;
  options: string[] | null;
  correct_answer: string | null;
  sort_order: number;
}

export interface Student {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  role: 'student' | 'admin';
  created_at: string;
}

export interface Enrollment {
  student_id: number;
  course_id: number;
  progress_pct: number;
  granted_by_admin: boolean;
  enrolled_at: string;
}

export interface LiveClass {
  id: number;
  title: string;
  description: string | null;
  zoom_link: string;
  zoom_meeting_id: string | null;
  starts_at: string;
  duration_min: number;
  instructor: string;
}
```

- [ ] **Step 4: Create access control helpers**

```typescript
// src/lib/access.ts
import type { Course, Lesson, Enrollment } from '@/types';

/** The free lesson is the lowest sort_order lesson in the lowest sort_order course. */
export function isFreeLesson(
  lesson: Pick<Lesson, 'course_id' | 'sort_order'>,
  courses: Pick<Course, 'id' | 'sort_order'>[]
): boolean {
  if (courses.length === 0) return false;
  const minSortOrder = Math.min(...courses.map((c) => c.sort_order));
  const firstCourse = courses.find((c) => c.sort_order === minSortOrder);
  if (!firstCourse || lesson.course_id !== firstCourse.id) return false;

  // Find min sort_order lesson within this course — caller must ensure lesson belongs to firstCourse
  // We check that this lesson has sort_order === 1 (or the minimum)
  // Since we only receive the single lesson here, we trust sort_order=1 means first
  return lesson.sort_order === 1;
}

/** Returns true if the user can view this lesson. */
export function canAccessLesson(
  lesson: Pick<Lesson, 'course_id' | 'sort_order'>,
  courses: Pick<Course, 'id' | 'sort_order'>[],
  enrollments: Pick<Enrollment, 'course_id' | 'progress_pct'>[],
  role: 'student' | 'admin'
): boolean {
  if (role === 'admin') return true;
  if (isFreeLesson(lesson, courses)) return true;
  return enrollments.some((e) => e.course_id === lesson.course_id);
}
```

- [ ] **Step 5: Run tests — expect pass**

```bash
npx vitest run src/__tests__/access.test.ts
```
Expected: All 6 tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/types/index.ts src/lib/access.ts src/__tests__/access.test.ts
git commit -m "feat: extended types and access control helpers with tests"
```

---

## Task 4: Moodle DB connection + env setup

**Files:** `src/lib/moodle.ts` (create), `ecosystem.config.js` on server (update)

- [ ] **Step 1: Find the Moodle DB credentials on the server**

SSH into server:
```bash
ssh -p 2222 root@nationalhealthcareer.com
grep -E "dbname|dbuser|dbpass|dbhost" /var/www/nationalhealthcareer.academy/config.php
```
Note the values for `$CFG->dbname`, `$CFG->dbuser`, `$CFG->dbpass`. These will be used as `MOODLE_DB_NAME`, `MOODLE_DB_USER`, `MOODLE_DB_PASSWORD`.

- [ ] **Step 2: Add Moodle DB vars to ecosystem.config.js on server**

Update `/var/www/nationalhealthcareer-com/ecosystem.config.js` — add inside the `env` block:
```javascript
MOODLE_DB_HOST: 'localhost',
MOODLE_DB_USER: '<value from config.php>',
MOODLE_DB_PASSWORD: '<value from config.php>',
MOODLE_DB_NAME: '<value from config.php>',
```

Then restart:
```bash
pm2 restart nha --update-env
```

- [ ] **Step 3: Create Moodle connection pool**

```typescript
// src/lib/moodle.ts
import mysql from 'mysql2/promise';

// Separate pool pointing at the Moodle DB on the same server
const moodlePool = mysql.createPool({
  host:     process.env.MOODLE_DB_HOST     || 'localhost',
  user:     process.env.MOODLE_DB_USER     || '',
  password: process.env.MOODLE_DB_PASSWORD || '',
  database: process.env.MOODLE_DB_NAME     || '',
  waitForConnections: true,
  connectionLimit: 5,
});

export interface MoodleCourse {
  id: number;
  shortname: string;
  fullname: string;
  summary: string;
}

export interface MoodleSection {
  id: number;
  course: number;
  section: number;
  name: string;
  summary: string;
}

export interface MoodleLesson {
  id: number;
  course: number;
  section: number;
  sectionName: string;
  name: string;
  content: string;
  modType: 'page' | 'quiz';
}

export interface MoodleQuestion {
  id: number;
  quizId: number;
  questionText: string;
  qtype: 'multichoice' | 'truefalse' | 'shortanswer';
  answers: { text: string; fraction: number }[];
}

/** Fetch all non-site courses from Moodle */
export async function scanMoodleCourses(): Promise<MoodleCourse[]> {
  const [rows] = await moodlePool.query<any[]>(
    "SELECT id, shortname, fullname, summary FROM mdl_course WHERE id > 1 ORDER BY sortorder"
  );
  return rows;
}

/** Fetch all sections + page/quiz modules for a given Moodle course ID */
export async function scanMoodleLessons(courseId: number): Promise<MoodleLesson[]> {
  // Get pages
  const [pageRows] = await moodlePool.query<any[]>(`
    SELECT
      p.id, cm.course, cs.section, cs.name AS sectionName, p.name, p.content, 'page' AS modType
    FROM mdl_page p
    JOIN mdl_course_modules cm ON cm.instance = p.id AND cm.module = (SELECT id FROM mdl_modules WHERE name='page')
    JOIN mdl_course_sections cs ON cs.id = cm.section
    WHERE cm.course = ?
    ORDER BY cs.section, cm.indent, cm.id
  `, [courseId]);

  // Get quizzes
  const [quizRows] = await moodlePool.query<any[]>(`
    SELECT
      q.id, cm.course, cs.section, cs.name AS sectionName, q.name, '' AS content, 'quiz' AS modType
    FROM mdl_quiz q
    JOIN mdl_course_modules cm ON cm.instance = q.id AND cm.module = (SELECT id FROM mdl_modules WHERE name='quiz')
    JOIN mdl_course_sections cs ON cs.id = cm.section
    WHERE cm.course = ?
    ORDER BY cs.section, cm.id
  `, [courseId]);

  return [...pageRows, ...quizRows] as MoodleLesson[];
}

/** Fetch quiz questions for a given Moodle quiz ID */
export async function scanMoodleQuestions(quizId: number): Promise<MoodleQuestion[]> {
  const [rows] = await moodlePool.query<any[]>(`
    SELECT
      q.id, qs.quizid AS quizId, q.questiontext AS questionText, q.qtype,
      qa.answer AS answerText, qa.fraction
    FROM mdl_quiz_slots qs
    JOIN mdl_question q ON q.id = qs.questionid
    JOIN mdl_question_answers qa ON qa.question = q.id
    WHERE qs.quizid = ?
    ORDER BY qs.slot, qa.id
  `, [quizId]);

  // Group answers by question
  const questionMap = new Map<number, MoodleQuestion>();
  for (const row of rows) {
    if (!questionMap.has(row.id)) {
      questionMap.set(row.id, {
        id: row.id,
        quizId: row.quizId,
        questionText: row.questionText,
        qtype: row.qtype,
        answers: [],
      });
    }
    questionMap.get(row.id)!.answers.push({ text: row.answerText, fraction: row.fraction });
  }
  return Array.from(questionMap.values());
}

export default moodlePool;
```

- [ ] **Step 4: Commit**

```bash
git add src/lib/moodle.ts
git commit -m "feat: Moodle DB connection pool and extraction helpers"
```

---

## Task 5: Moodle import API — scan + run

**Files:** `src/app/api/admin/import/scan/route.ts`, `src/app/api/admin/import/run/route.ts`

- [ ] **Step 1: Create scan route**

```typescript
// src/app/api/admin/import/scan/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { scanMoodleCourses, scanMoodleLessons, scanMoodleQuestions } from '@/lib/moodle';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const courses = await scanMoodleCourses();

    // Get existing slugs to flag duplicates
    const [existingRows] = await pool.query<any[]>('SELECT slug FROM courses');
    const existingSlugs = new Set((existingRows as any[]).map((r: any) => r.slug));

    const preview = await Promise.all(courses.map(async (c) => {
      const slug = c.shortname.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const lessons = await scanMoodleLessons(c.id);
      const quizLessons = lessons.filter((l) => l.modType === 'quiz');
      let questionCount = 0;
      for (const ql of quizLessons) {
        const qs = await scanMoodleQuestions(ql.id);
        questionCount += qs.length;
      }
      return {
        moodleId: c.id,
        title: c.fullname,
        slug,
        lessonCount: lessons.length,
        questionCount,
        alreadyImported: existingSlugs.has(slug),
      };
    }));

    return NextResponse.json({ courses: preview });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create run route**

```typescript
// src/app/api/admin/import/run/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { scanMoodleCourses, scanMoodleLessons, scanMoodleQuestions } from '@/lib/moodle';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { selectedMoodleIds }: { selectedMoodleIds: number[] } = await req.json();
  const results: { title: string; status: 'imported' | 'skipped' | 'error'; error?: string }[] = [];

  const allCourses = await scanMoodleCourses();
  const toImport = allCourses.filter((c) => selectedMoodleIds.includes(c.id));

  for (let i = 0; i < toImport.length; i++) {
    const mc = toImport[i];
    const slug = mc.shortname.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    try {
      // Skip if already exists
      const [existing] = await pool.query<any[]>('SELECT id FROM courses WHERE slug = ?', [slug]);
      if ((existing as any[]).length > 0) {
        results.push({ title: mc.fullname, status: 'skipped' });
        continue;
      }

      // Insert course
      const [courseResult] = await pool.query(
        'INSERT INTO courses (title, slug, description, is_published, sort_order) VALUES (?, ?, ?, 0, ?)',
        [mc.fullname, slug, mc.summary || null, i + 1]
      );
      const courseId = (courseResult as any).insertId;

      // Insert lessons
      const moodleLessons = await scanMoodleLessons(mc.id);
      for (let j = 0; j < moodleLessons.length; j++) {
        const ml = moodleLessons[j];
        const lessonSlug = ml.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + `-${j}`;
        const [lessonResult] = await pool.query(
          'INSERT INTO lessons (course_id, section_title, title, slug, content, type, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [courseId, ml.sectionName || null, ml.name, lessonSlug, ml.modType === 'page' ? ml.content : null, ml.modType === 'page' ? 'text' : 'quiz', j + 1]
        );
        const lessonId = (lessonResult as any).insertId;

        // Insert quiz questions if quiz type
        if (ml.modType === 'quiz') {
          const questions = await scanMoodleQuestions(ml.id);
          for (let k = 0; k < questions.length; k++) {
            const q = questions[k];
            const correctIdx = q.answers.findIndex((a) => a.fraction > 0);
            const type = q.qtype === 'multichoice' ? 'multiple_choice' : q.qtype === 'truefalse' ? 'true_false' : 'short_answer';
            await pool.query(
              'INSERT INTO quiz_questions (lesson_id, type, question, options, correct_answer, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
              [lessonId, type, q.questionText, JSON.stringify(q.answers.map((a) => a.text)), correctIdx >= 0 ? String(correctIdx) : null, k + 1]
            );
          }
        }
      }

      results.push({ title: mc.fullname, status: 'imported' });
    } catch (err: any) {
      results.push({ title: mc.fullname, status: 'error', error: err.message });
    }
  }

  return NextResponse.json({ results });
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/admin/import/
git commit -m "feat: Moodle import scan and run API routes"
```

---

## Task 6: Moodle import UI page

**Files:** `src/app/admin/courses/import/page.tsx`

- [ ] **Step 1: Create the import wizard page**

```tsx
// src/app/admin/courses/import/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CoursePreview {
  moodleId: number; title: string; slug: string;
  lessonCount: number; questionCount: number; alreadyImported: boolean;
}

export default function ImportPage() {
  const router = useRouter();
  const [step, setStep] = useState<'idle' | 'scanning' | 'preview' | 'importing' | 'done'>('idle');
  const [courses, setCourses] = useState<CoursePreview[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [results, setResults] = useState<{ title: string; status: string }[]>([]);
  const [error, setError] = useState('');

  async function handleScan() {
    setStep('scanning'); setError('');
    const res = await fetch('/api/admin/import/scan');
    const data = await res.json();
    if (!res.ok) { setError(data.error); setStep('idle'); return; }
    setCourses(data.courses);
    setSelected(new Set(data.courses.filter((c: CoursePreview) => !c.alreadyImported).map((c: CoursePreview) => c.moodleId)));
    setStep('preview');
  }

  async function handleImport() {
    setStep('importing');
    const res = await fetch('/api/admin/import/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ selectedMoodleIds: Array.from(selected) }),
    });
    const data = await res.json();
    setResults(data.results);
    setStep('done');
  }

  function toggleCourse(id: number) {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.push('/admin/courses')} className="text-blue-600 text-sm hover:underline">← Back to Courses</button>
        <h1 className="text-2xl font-bold">Import from Moodle</h1>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}

      {step === 'idle' && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <p className="text-gray-500 mb-6 text-sm">This will scan your Moodle database and show you a preview of all courses, lessons, and quiz questions before importing.</p>
          <button onClick={handleScan} className="bg-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-800 transition-colors">
            Scan Moodle Database
          </button>
        </div>
      )}

      {step === 'scanning' && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <p className="text-gray-500 text-sm animate-pulse">Scanning Moodle database…</p>
        </div>
      )}

      {step === 'preview' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <p className="text-sm text-gray-500">Found {courses.length} courses. Select which to import.</p>
            <button onClick={handleImport} disabled={selected.size === 0}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
              Import {selected.size} Course{selected.size !== 1 ? 's' : ''}
            </button>
          </div>
          {courses.map((c) => (
            <div key={c.moodleId} className="flex items-center gap-4 px-4 py-3 border-b border-gray-50 last:border-0">
              <input type="checkbox" checked={selected.has(c.moodleId)} onChange={() => toggleCourse(c.moodleId)}
                disabled={c.alreadyImported} className="w-4 h-4" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{c.title}</p>
                <p className="text-xs text-gray-400">{c.lessonCount} lessons · {c.questionCount} quiz questions</p>
              </div>
              {c.alreadyImported && <span className="text-xs bg-gray-100 text-gray-500 rounded px-2 py-0.5">Already imported</span>}
            </div>
          ))}
        </div>
      )}

      {step === 'importing' && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <p className="text-gray-500 text-sm animate-pulse">Importing courses… this may take a moment.</p>
        </div>
      )}

      {step === 'done' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">Import complete</p>
          </div>
          {results.map((r, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-800">{r.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                r.status === 'imported' ? 'bg-green-100 text-green-700' :
                r.status === 'skipped' ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-700'}`}>
                {r.status}
              </span>
            </div>
          ))}
          <div className="p-4">
            <button onClick={() => router.push('/admin/courses')} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
              View Courses
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/courses/import/
git commit -m "feat: Moodle import wizard UI"
```

---

## Task 7: Course + Lesson API routes

**Files:** `src/app/api/admin/courses/route.ts`, `src/app/api/admin/courses/[id]/route.ts`, `src/app/api/admin/lessons/route.ts`, `src/app/api/admin/lessons/[id]/route.ts`, `src/app/api/admin/lessons/reorder/route.ts`

- [ ] **Step 1: Course list + create route**

```typescript
// src/app/api/admin/courses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

function adminOnly(session: any) {
  return (session?.user as any)?.role === 'admin';
}

export async function GET() {
  const session = await auth();
  if (!adminOnly(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const [rows] = await pool.query('SELECT * FROM courses ORDER BY sort_order, created_at');
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!adminOnly(session)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { title, slug, description, category, level, price, prerequisite_id, sort_order, is_published } = await req.json();
  const [result] = await pool.query(
    'INSERT INTO courses (title, slug, description, category, level, price, prerequisite_id, sort_order, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [title, slug, description ?? null, category ?? 'healthcare', level ?? 'beginner', price ?? 0, prerequisite_id ?? null, sort_order ?? 0, is_published ? 1 : 0]
  );
  return NextResponse.json({ id: (result as any).insertId }, { status: 201 });
}
```

- [ ] **Step 2: Course get + update + delete route**

```typescript
// src/app/api/admin/courses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const [rows] = await pool.query('SELECT * FROM courses WHERE id = ?', [params.id]);
  const course = (rows as any[])[0];
  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const [lessons] = await pool.query('SELECT * FROM lessons WHERE course_id = ? ORDER BY sort_order', [params.id]);
  return NextResponse.json({ course, lessons });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  await pool.query(
    'UPDATE courses SET title=?, description=?, category=?, level=?, price=?, prerequisite_id=?, sort_order=?, is_published=?, thumbnail=? WHERE id=?',
    [body.title, body.description ?? null, body.category, body.level, body.price, body.prerequisite_id ?? null, body.sort_order, body.is_published ? 1 : 0, body.thumbnail ?? null, params.id]
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await pool.query('DELETE FROM courses WHERE id = ?', [params.id]);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Lesson create route**

```typescript
// src/app/api/admin/lessons/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { course_id, section_title, title, type, sort_order } = await req.json();
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  const [result] = await pool.query(
    'INSERT INTO lessons (course_id, section_title, title, slug, type, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
    [course_id, section_title ?? null, title, slug, type ?? 'text', sort_order ?? 0]
  );
  return NextResponse.json({ id: (result as any).insertId, slug }, { status: 201 });
}
```

- [ ] **Step 4: Lesson get + update + delete route**

```typescript
// src/app/api/admin/lessons/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const [rows] = await pool.query('SELECT * FROM lessons WHERE id = ?', [params.id]);
  const lesson = (rows as any[])[0];
  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const [questions] = await pool.query('SELECT * FROM quiz_questions WHERE lesson_id = ? ORDER BY sort_order', [params.id]);
  return NextResponse.json({ lesson, questions });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  await pool.query(
    'UPDATE lessons SET title=?, section_title=?, type=?, content=?, file_path=?, sort_order=? WHERE id=?',
    [body.title, body.section_title ?? null, body.type, body.content ?? null, body.file_path ?? null, body.sort_order, params.id]
  );
  // Sync quiz questions if provided
  if (body.questions !== undefined) {
    await pool.query('DELETE FROM quiz_questions WHERE lesson_id = ?', [params.id]);
    for (let i = 0; i < body.questions.length; i++) {
      const q = body.questions[i];
      await pool.query(
        'INSERT INTO quiz_questions (lesson_id, type, question, options, correct_answer, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
        [params.id, q.type, q.question, q.options ? JSON.stringify(q.options) : null, q.correct_answer ?? null, i + 1]
      );
    }
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await pool.query('DELETE FROM lessons WHERE id = ?', [params.id]);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 5: Lesson reorder route**

```typescript
// src/app/api/admin/lessons/reorder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { orderedIds }: { orderedIds: number[] } = await req.json();
  // orderedIds = [lessonId, lessonId, ...] in new order
  await Promise.all(orderedIds.map((id, idx) =>
    pool.query('UPDATE lessons SET sort_order = ? WHERE id = ?', [idx + 1, id])
  ));
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 6: Commit**

```bash
git add src/app/api/admin/courses/ src/app/api/admin/lessons/
git commit -m "feat: admin course and lesson API routes (CRUD + reorder)"
```

---

## Task 8: File upload API

**Files:** `src/app/api/admin/upload/route.ts`, `src/lib/upload.ts`

- [ ] **Step 1: Create upload helper**

```typescript
// src/lib/upload.ts
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

export async function saveUploadedFile(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only PDF and PPTX files are allowed');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('File exceeds 50 MB limit');
  }
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = file.name.endsWith('.pptx') ? '.pptx' : '.pdf';
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = `${Date.now()}-${safeName}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);
  return `/uploads/${filename}`;
}
```

- [ ] **Step 2: Create upload API route**

```typescript
// src/app/api/admin/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { saveUploadedFile } from '@/lib/upload';

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    const url = await saveUploadedFile(file);
    return NextResponse.json({ url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/upload.ts src/app/api/admin/upload/
git commit -m "feat: file upload API (PDF and PPTX, 50MB limit)"
```

---

## Task 9: Student management API routes

**Files:** `src/app/api/admin/students/route.ts`, `src/app/api/admin/students/[id]/route.ts`, `src/app/api/admin/students/[id]/grant/route.ts`

- [ ] **Step 1: Student list + create**

```typescript
// src/app/api/admin/students/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const [rows] = await pool.query(
    "SELECT id, name, email, role, is_active, created_at FROM students WHERE role = 'student' ORDER BY created_at DESC"
  );
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { name, email, password } = await req.json();
  if (!name || !email || !password) return NextResponse.json({ error: 'name, email, password required' }, { status: 400 });
  const hash = await bcrypt.hash(password, 12);
  try {
    const [result] = await pool.query(
      "INSERT INTO students (name, email, password_hash, role) VALUES (?, ?, ?, 'student')",
      [name, email, hash]
    );
    return NextResponse.json({ id: (result as any).insertId }, { status: 201 });
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    throw err;
  }
}
```

- [ ] **Step 2: Student update + delete**

```typescript
// src/app/api/admin/students/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = await req.json();
  if (body.password) {
    const hash = await bcrypt.hash(body.password, 12);
    await pool.query('UPDATE students SET password_hash = ? WHERE id = ?', [hash, params.id]);
  }
  if (body.is_active !== undefined) {
    await pool.query('UPDATE students SET is_active = ? WHERE id = ?', [body.is_active ? 1 : 0, params.id]);
  }
  if (body.name || body.email) {
    await pool.query('UPDATE students SET name = COALESCE(?, name), email = COALESCE(?, email) WHERE id = ?',
      [body.name ?? null, body.email ?? null, params.id]);
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await pool.query('DELETE FROM students WHERE id = ? AND role = ?', [params.id, 'student']);
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Grant course access route**

```typescript
// src/app/api/admin/students/[id]/grant/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import pool from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { course_id } = await req.json();
  await pool.query(
    'INSERT INTO enrollments (student_id, course_id, granted_by_admin) VALUES (?, ?, 1) ON DUPLICATE KEY UPDATE granted_by_admin = 1',
    [params.id, course_id]
  );
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/students/
git commit -m "feat: student management API routes (create, disable, reset password, grant access)"
```

---

## Task 10: Tiptap editor component

**Files:** `src/components/editor/TiptapEditor.tsx`

- [ ] **Step 1: Create the Tiptap WYSIWYG component**

```tsx
// src/components/editor/TiptapEditor.tsx
'use client';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';

interface Props {
  content: string;
  onChange: (html: string) => void;
}

const btnCls = 'px-2 py-1 rounded text-xs font-medium hover:bg-gray-200 transition-colors';
const activeCls = 'bg-gray-200';

export default function TiptapEditor({ content, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '');
    }
  }, [content]);

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <button onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${btnCls} ${editor.isActive('bold') ? activeCls : ''}`}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${btnCls} ${editor.isActive('italic') ? activeCls : ''}`}><em>I</em></button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${btnCls} ${editor.isActive('underline') ? activeCls : ''}`}><u>U</u></button>
        <div className="w-px bg-gray-300 mx-1" />
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`${btnCls} ${editor.isActive('heading', { level: 2 }) ? activeCls : ''}`}>H2</button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`${btnCls} ${editor.isActive('heading', { level: 3 }) ? activeCls : ''}`}>H3</button>
        <div className="w-px bg-gray-300 mx-1" />
        <button onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${btnCls} ${editor.isActive('bulletList') ? activeCls : ''}`}>• List</button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${btnCls} ${editor.isActive('orderedList') ? activeCls : ''}`}>1. List</button>
        <div className="w-px bg-gray-300 mx-1" />
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${btnCls} ${editor.isActive('blockquote') ? activeCls : ''}`}>&ldquo;</button>
        <button onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={btnCls}>─</button>
      </div>
      {/* Editor area */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  );
}
```

- [ ] **Step 2: Add prose styles to `globals.css` so Tiptap content renders correctly**

Add to `src/app/globals.css`:
```css
/* Tiptap prose reset */
.ProseMirror { outline: none; }
.ProseMirror h2 { font-size: 1.25rem; font-weight: 700; margin: 1rem 0 0.5rem; }
.ProseMirror h3 { font-size: 1.1rem; font-weight: 600; margin: 0.75rem 0 0.4rem; }
.ProseMirror ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
.ProseMirror ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
.ProseMirror blockquote { border-left: 3px solid #3b82f6; padding-left: 0.75rem; color: #64748b; }
.ProseMirror hr { border: none; border-top: 1px solid #e2e8f0; margin: 1rem 0; }
.ProseMirror p { margin: 0.4rem 0; }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/editor/TiptapEditor.tsx src/app/globals.css
git commit -m "feat: Tiptap WYSIWYG editor component"
```

---

## Task 11: Quiz builder component

**Files:** `src/components/admin/QuizBuilder.tsx`

- [ ] **Step 1: Create quiz builder**

```tsx
// src/components/admin/QuizBuilder.tsx
'use client';
import { useState } from 'react';
import type { QuizQuestion } from '@/types';

interface Props {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}

const BLANK_Q: Omit<QuizQuestion, 'id' | 'lesson_id' | 'sort_order'> = {
  type: 'multiple_choice', question: '', options: ['', '', '', ''], correct_answer: '0',
};

export default function QuizBuilder({ questions, onChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ ...BLANK_Q });

  function updateQuestion(idx: number, patch: Partial<QuizQuestion>) {
    const next = questions.map((q, i) => i === idx ? { ...q, ...patch } : q);
    onChange(next);
  }

  function deleteQuestion(idx: number) {
    onChange(questions.filter((_, i) => i !== idx));
  }

  function saveNew() {
    if (!draft.question.trim()) return;
    onChange([...questions, { ...draft, id: 0, lesson_id: 0, sort_order: questions.length + 1 }]);
    setDraft({ ...BLANK_Q });
    setAdding(false);
  }

  return (
    <div className="space-y-3">
      {questions.length === 0 && !adding && (
        <p className="text-sm text-gray-400 text-center py-6">No questions yet.</p>
      )}

      {questions.map((q, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-blue-600 uppercase">{q.type.replace('_', ' ')}</span>
            <button onClick={() => deleteQuestion(idx)} className="text-red-400 text-xs hover:text-red-600">Delete</button>
          </div>
          <input value={q.question} onChange={(e) => updateQuestion(idx, { question: e.target.value })}
            className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm mb-2" placeholder="Question text" />
          {(q.type === 'multiple_choice' || q.type === 'true_false') && q.options?.map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2 mb-1">
              <input type="radio" name={`correct-${idx}`} checked={q.correct_answer === String(oi)}
                onChange={() => updateQuestion(idx, { correct_answer: String(oi) })} />
              <input value={opt} onChange={(e) => {
                  const opts = [...(q.options || [])]; opts[oi] = e.target.value;
                  updateQuestion(idx, { options: opts });
                }} className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm" placeholder={`Option ${oi + 1}`} />
            </div>
          ))}
          {q.type === 'short_answer' && (
            <p className="text-xs text-gray-400 italic">Short answer — not auto-graded</p>
          )}
        </div>
      ))}

      {adding ? (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <div className="flex gap-2 mb-3">
            {(['multiple_choice', 'true_false', 'short_answer'] as const).map((t) => (
              <button key={t} onClick={() => setDraft({ ...BLANK_Q, type: t,
                  options: t === 'true_false' ? ['True', 'False'] : t === 'multiple_choice' ? ['', '', '', ''] : null })}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium ${draft.type === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                {t.replace('_', ' ')}
              </button>
            ))}
          </div>
          <input value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })}
            className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm mb-2 bg-white" placeholder="Question text" />
          {(draft.type === 'multiple_choice' || draft.type === 'true_false') && draft.options?.map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2 mb-1">
              <input type="radio" name="new-correct" checked={draft.correct_answer === String(oi)}
                onChange={() => setDraft({ ...draft, correct_answer: String(oi) })} />
              <input value={opt} onChange={(e) => {
                  const opts = [...(draft.options || [])]; opts[oi] = e.target.value;
                  setDraft({ ...draft, options: opts });
                }} className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm bg-white" placeholder={`Option ${oi + 1}`} />
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <button onClick={saveNew} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium">Add Question</button>
            <button onClick={() => setAdding(false)} className="text-gray-500 text-sm px-2">Cancel</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)}
          className="w-full border border-dashed border-gray-300 rounded-lg py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
          + Add Question
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/QuizBuilder.tsx
git commit -m "feat: quiz question builder component (MC, T/F, short answer)"
```

---

## Task 12: Lesson tree component (drag to reorder)

**Files:** `src/components/admin/LessonTree.tsx`

- [ ] **Step 1: Create sortable lesson tree**

```tsx
// src/components/admin/LessonTree.tsx
'use client';
import { useState } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Lesson } from '@/types';

interface Props {
  lessons: Lesson[];
  activeLessonId: number | null;
  onSelect: (lesson: Lesson) => void;
  onReorder: (orderedIds: number[]) => void;
  onAddLesson: (sectionTitle: string | null) => void;
  onAddSection: () => void;
}

const TYPE_ICON: Record<string, string> = {
  text: '📄', document: '📎', presentation: '📊', quiz: '📋',
};

function SortableLesson({ lesson, isActive, onSelect }: { lesson: Lesson; isActive: boolean; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer mb-0.5 ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
      onClick={onSelect}>
      <span {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500 text-xs select-none">⠿</span>
      <span className="text-sm">{TYPE_ICON[lesson.type] || '📄'}</span>
      <span className="text-xs flex-1 truncate">{lesson.title}</span>
    </div>
  );
}

export default function LessonTree({ lessons, activeLessonId, onSelect, onReorder, onAddLesson, onAddSection }: Props) {
  const [items, setItems] = useState(lessons);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Group lessons by section_title
  const sections = Array.from(new Set(items.map((l) => l.section_title ?? ''))).filter(Boolean);
  const unsectioned = items.filter((l) => !l.section_title);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = items.findIndex((l) => l.id === active.id);
      const newIdx = items.findIndex((l) => l.id === over.id);
      const next = arrayMove(items, oldIdx, newIdx);
      setItems(next);
      onReorder(next.map((l) => l.id));
    }
  }

  return (
    <div className="h-full overflow-y-auto p-3">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Lessons</span>
        <button onClick={onAddSection}
          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">+ Section</button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((l) => l.id)} strategy={verticalListSortingStrategy}>

          {sections.map((sec) => (
            <div key={sec} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide truncate">{sec}</span>
              </div>
              {items.filter((l) => l.section_title === sec).map((l) => (
                <SortableLesson key={l.id} lesson={l} isActive={l.id === activeLessonId} onSelect={() => onSelect(l)} />
              ))}
              <button onClick={() => onAddLesson(sec)}
                className="w-full mt-1 border border-dashed border-gray-200 rounded py-1 text-xs text-gray-400 hover:border-blue-300 hover:text-blue-500">
                + Add Lesson
              </button>
            </div>
          ))}

          {unsectioned.length > 0 && (
            <div className="mb-3">
              {unsectioned.map((l) => (
                <SortableLesson key={l.id} lesson={l} isActive={l.id === activeLessonId} onSelect={() => onSelect(l)} />
              ))}
            </div>
          )}

        </SortableContext>
      </DndContext>

      <button onClick={() => onAddLesson(null)}
        className="w-full border border-dashed border-gray-200 rounded py-1.5 text-xs text-gray-400 hover:border-blue-300 hover:text-blue-500 mt-2">
        + Add Lesson
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/LessonTree.tsx
git commit -m "feat: drag-to-reorder lesson tree component"
```

---

## Task 13: Lesson editor component

**Files:** `src/components/admin/LessonEditor.tsx`

- [ ] **Step 1: Create tabbed lesson editor**

```tsx
// src/components/admin/LessonEditor.tsx
'use client';
import { useState, useEffect } from 'react';
import type { Lesson, QuizQuestion } from '@/types';
import TiptapEditor from '@/components/editor/TiptapEditor';
import QuizBuilder from '@/components/admin/QuizBuilder';

interface Props {
  lesson: Lesson;
  initialQuestions: QuizQuestion[];
  onSaved: () => void;
}

type Tab = 'text' | 'document' | 'presentation' | 'quiz';

export default function LessonEditor({ lesson: initial, initialQuestions, onSaved }: Props) {
  const [lesson, setLesson] = useState(initial);
  const [questions, setQuestions] = useState(initialQuestions);
  const [activeTab, setActiveTab] = useState<Tab>(initial.type as Tab);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => { setLesson(initial); setQuestions(initialQuestions); setActiveTab(initial.type as Tab); }, [initial.id]);

  async function save() {
    setSaving(true); setMsg('');
    const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...lesson, type: activeTab, questions: activeTab === 'quiz' ? questions : undefined }),
    });
    setSaving(false);
    if (res.ok) { setMsg('Saved'); onSaved(); } else { setMsg('Save failed'); }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
    setUploading(false);
    if (res.ok) {
      const { url } = await res.json();
      setLesson((l) => ({ ...l, file_path: url }));
    }
  }

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'text', label: 'Text', icon: '📄' },
    { key: 'document', label: 'PDF', icon: '📎' },
    { key: 'presentation', label: 'Presentation', icon: '📊' },
    { key: 'quiz', label: 'Quiz', icon: '📋' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4">
      {/* Lesson title */}
      <div className="flex justify-between items-center mb-4 gap-4">
        <input value={lesson.title} onChange={(e) => setLesson((l) => ({ ...l, title: e.target.value }))}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <div className="flex items-center gap-2">
          {msg && <span className={`text-xs ${msg === 'Saved' ? 'text-green-600' : 'text-red-500'}`}>{msg}</span>}
          <button onClick={save} disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Section title */}
      <input value={lesson.section_title || ''} onChange={(e) => setLesson((l) => ({ ...l, section_title: e.target.value }))}
        placeholder="Section (optional)"
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-500 mb-4 focus:outline-none focus:ring-1 focus:ring-blue-400" />

      {/* Type tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-1.5 border-b-2 transition-colors ${activeTab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'text' && (
        <TiptapEditor content={lesson.content || ''} onChange={(html) => setLesson((l) => ({ ...l, content: html }))} />
      )}

      {(activeTab === 'document' || activeTab === 'presentation') && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-500 mb-3">
              {activeTab === 'document' ? 'Upload PDF (max 50MB)' : 'Upload PPTX file (max 50MB)'}
            </p>
            <input type="file" accept={activeTab === 'document' ? '.pdf' : '.pptx'}
              onChange={handleFileUpload} className="hidden" id="file-upload" />
            <label htmlFor="file-upload"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-blue-700">
              {uploading ? 'Uploading…' : 'Choose File'}
            </label>
          </div>
          {lesson.file_path && (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
              <span className="text-sm text-green-700 font-medium">{lesson.file_path.split('/').pop()}</span>
              <a href={lesson.file_path} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline">Preview</a>
            </div>
          )}
        </div>
      )}

      {activeTab === 'quiz' && (
        <QuizBuilder questions={questions} onChange={setQuestions} />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/admin/LessonEditor.tsx
git commit -m "feat: tabbed lesson editor (text/document/presentation/quiz)"
```

---

## Task 14: Admin course editor page

**Files:** `src/app/admin/courses/[id]/page.tsx`

- [ ] **Step 1: Create course editor page**

```tsx
// src/app/admin/courses/[id]/page.tsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Course, Lesson, QuizQuestion } from '@/types';
import LessonTree from '@/components/admin/LessonTree';
import LessonEditor from '@/components/admin/LessonEditor';

export default function CourseEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCourse = useCallback(async () => {
    const res = await fetch(`/api/admin/courses/${id}`);
    const data = await res.json();
    setCourse(data.course);
    setLessons(data.lessons);
    setLoading(false);
  }, [id]);

  useEffect(() => { loadCourse(); }, [loadCourse]);

  async function selectLesson(lesson: Lesson) {
    const res = await fetch(`/api/admin/lessons/${lesson.id}`);
    const data = await res.json();
    setActiveLesson(data.lesson);
    setActiveQuestions(data.questions || []);
  }

  async function handleAddSection() {
    const title = prompt('Section title:');
    if (!title) return;
    const res = await fetch('/api/admin/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: Number(id), section_title: title, title: 'New Lesson', type: 'text', sort_order: lessons.length + 1 }),
    });
    if (res.ok) loadCourse();
  }

  async function handleAddLesson(sectionTitle: string | null) {
    const title = prompt('Lesson title:');
    if (!title) return;
    const res = await fetch('/api/admin/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: Number(id), section_title: sectionTitle, title, type: 'text', sort_order: lessons.length + 1 }),
    });
    if (res.ok) loadCourse();
  }

  async function handleReorder(orderedIds: number[]) {
    await fetch('/api/admin/lessons/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds }),
    });
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-gray-400">Loading…</div>;

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/admin/courses')} className="text-blue-600 text-sm hover:underline">← Courses</button>
          <h1 className="text-base font-semibold text-gray-900">{course?.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${course?.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {course?.is_published ? 'Published' : 'Draft'}
          </span>
          <span className="text-sm font-semibold text-gray-700">${course?.price?.toFixed(2)}</span>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Lesson tree */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 flex-shrink-0">
          <LessonTree
            lessons={lessons}
            activeLessonId={activeLesson?.id ?? null}
            onSelect={selectLesson}
            onReorder={handleReorder}
            onAddLesson={handleAddLesson}
            onAddSection={handleAddSection}
          />
        </div>

        {/* Right: Lesson editor */}
        <div className="flex-1 overflow-y-auto">
          {activeLesson ? (
            <LessonEditor
              lesson={activeLesson}
              initialQuestions={activeQuestions}
              onSaved={loadCourse}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300 text-sm">
              Select a lesson from the left panel to edit
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/admin/courses/[id]/
git commit -m "feat: admin course editor page with split lesson tree + editor"
```

---

## Task 15: Admin course list + create pages

**Files:** `src/app/admin/courses/page.tsx`, `src/app/admin/courses/new/page.tsx`

- [ ] **Step 1: Course list dashboard**

```tsx
// src/app/admin/courses/page.tsx
export const dynamic = 'force-dynamic';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import Link from 'next/link';
import type { Course } from '@/types';

async function getCourses(): Promise<Course[]> {
  const [rows] = await pool.query('SELECT * FROM courses ORDER BY sort_order, category, created_at');
  return rows as Course[];
}

export default async function CoursesPage() {
  const session = await auth();
  if ((session?.user as any)?.role !== 'admin') redirect('/login');
  const courses = await getCourses();

  const byCategory = courses.reduce<Record<string, Course[]>>((acc, c) => {
    const cat = c.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Courses</h1>
        <div className="flex gap-3">
          <Link href="/admin/courses/import"
            className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-800 transition-colors">
            ⬇ Import from Moodle
          </Link>
          <Link href="/admin/courses/new"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
            + New Course
          </Link>
        </div>
      </div>

      {Object.entries(byCategory).map(([category, cats]) => (
        <div key={category} className="mb-10">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cats.map((course) => (
              <div key={course.id} className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col gap-3 shadow-sm">
                {course.thumbnail && (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-32 object-cover rounded-lg" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">{course.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{course.level} · ${Number(course.price).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2 mt-auto">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${course.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </span>
                  <Link href={`/admin/courses/${course.id}`}
                    className="ml-auto text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">Edit</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {courses.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <p className="mb-4">No courses yet.</p>
          <Link href="/admin/courses/import" className="text-blue-600 hover:underline text-sm">Import from Moodle</Link>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create course page**

```tsx
// src/app/admin/courses/new/page.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewCoursePage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: '', slug: '', description: '', category: 'healthcare', level: 'beginner', price: '0', sort_order: '0', is_published: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleTitle(title: string) {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setForm((f) => ({ ...f, title, slug }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    const res = await fetch('/api/admin/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, price: parseFloat(form.price), sort_order: parseInt(form.sort_order) }),
    });
    setSaving(false);
    if (res.ok) {
      const { id } = await res.json();
      router.push(`/admin/courses/${id}`);
    } else {
      setError('Failed to create course');
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.push('/admin/courses')} className="text-blue-600 text-sm hover:underline">← Back</button>
        <h1 className="text-2xl font-bold">New Course</h1>
      </div>
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <div><label className={labelCls}>Title</label><input required className={inputCls} value={form.title} onChange={(e) => handleTitle(e.target.value)} /></div>
        <div><label className={labelCls}>Slug (auto-generated)</label><input className={`${inputCls} bg-gray-50 text-gray-400`} value={form.slug} readOnly /></div>
        <div><label className={labelCls}>Description</label><textarea className={inputCls} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Category</label>
            <select className={inputCls} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              <option value="healthcare">HealthCare</option>
              <option value="medical-assistant">Medical Assistant</option>
            </select>
          </div>
          <div><label className={labelCls}>Level</label>
            <select className={inputCls} value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Price ($)</label><input type="number" step="0.01" min="0" className={inputCls} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} /></div>
          <div><label className={labelCls}>Sort Order</label><input type="number" min="0" className={inputCls} value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} /></div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="published" checked={form.is_published} onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))} className="w-4 h-4" />
          <label htmlFor="published" className="text-sm text-gray-700">Publish immediately</label>
        </div>
        <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Creating…' : 'Create Course & Add Lessons'}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/courses/page.tsx src/app/admin/courses/new/
git commit -m "feat: admin course list dashboard and create course page"
```

---

## Task 16: Admin student management page

**Files:** `src/app/admin/students/page.tsx`

- [ ] **Step 1: Create student management page**

```tsx
// src/app/admin/students/page.tsx
'use client';
import { useState, useEffect } from 'react';
import type { Student, Course } from '@/types';

interface EnrolledCourse { course_id: number; title: string; }

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', email: '', password: '' });
  const [grantModal, setGrantModal] = useState<{ studentId: number; name: string } | null>(null);
  const [grantCourseId, setGrantCourseId] = useState('');
  const [pwModal, setPwModal] = useState<{ studentId: number; name: string } | null>(null);
  const [newPw, setNewPw] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    const [sr, cr] = await Promise.all([fetch('/api/admin/students'), fetch('/api/admin/courses')]);
    setStudents(await sr.json());
    setCourses(await cr.json());
  }

  useEffect(() => { load(); }, []);

  async function createStudent(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newForm) });
    if (res.ok) { setShowCreate(false); setNewForm({ name: '', email: '', password: '' }); load(); setMsg('Student created'); }
    else { const d = await res.json(); setMsg(d.error || 'Error'); }
  }

  async function toggleActive(student: Student) {
    await fetch(`/api/admin/students/${student.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ is_active: !student.is_active }) });
    load();
  }

  async function deleteStudent(id: number) {
    if (!confirm('Delete this student? This cannot be undone.')) return;
    await fetch(`/api/admin/students/${id}`, { method: 'DELETE' });
    load();
  }

  async function grantAccess() {
    if (!grantModal || !grantCourseId) return;
    await fetch(`/api/admin/students/${grantModal.studentId}/grant`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ course_id: Number(grantCourseId) }) });
    setGrantModal(null); setGrantCourseId(''); setMsg('Access granted'); load();
  }

  async function resetPassword() {
    if (!pwModal || !newPw) return;
    await fetch(`/api/admin/students/${pwModal.studentId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: newPw }) });
    setPwModal(null); setNewPw(''); setMsg('Password updated');
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <button onClick={() => setShowCreate(true)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">+ Create Account</button>
      </div>

      {msg && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">{msg} <button onClick={() => setMsg('')} className="ml-2 text-green-500">✕</button></div>}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={createStudent} className="bg-white rounded-xl p-6 shadow-xl w-full max-w-md space-y-4">
            <h2 className="font-bold text-lg">Create Student Account</h2>
            <input required placeholder="Full Name" className={inputCls} value={newForm.name} onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))} />
            <input required type="email" placeholder="Email" className={inputCls} value={newForm.email} onChange={(e) => setNewForm((f) => ({ ...f, email: e.target.value }))} />
            <input required type="password" placeholder="Temporary Password" className={inputCls} value={newForm.password} onChange={(e) => setNewForm((f) => ({ ...f, password: e.target.value }))} />
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold">Create</button>
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 border border-gray-200 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Grant modal */}
      {grantModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-sm space-y-4">
            <h2 className="font-bold text-lg">Grant Course Access</h2>
            <p className="text-sm text-gray-500">Student: <strong>{grantModal.name}</strong></p>
            <select className={inputCls} value={grantCourseId} onChange={(e) => setGrantCourseId(e.target.value)}>
              <option value="">Select course…</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <div className="flex gap-3">
              <button onClick={grantAccess} disabled={!grantCourseId} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50">Grant Access</button>
              <button onClick={() => setGrantModal(null)} className="flex-1 border border-gray-200 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Password modal */}
      {pwModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-sm space-y-4">
            <h2 className="font-bold text-lg">Reset Password</h2>
            <p className="text-sm text-gray-500">Student: <strong>{pwModal.name}</strong></p>
            <input type="password" placeholder="New password" className={inputCls} value={newPw} onChange={(e) => setNewPw(e.target.value)} />
            <div className="flex gap-3">
              <button onClick={resetPassword} disabled={!newPw} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50">Update</button>
              <button onClick={() => setPwModal(null)} className="flex-1 border border-gray-200 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Name', 'Email', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-3 text-gray-500">{s.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setGrantModal({ studentId: s.id, name: s.name })}
                      className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">+ Grant</button>
                    <button onClick={() => setPwModal({ studentId: s.id, name: s.name })}
                      className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded hover:bg-gray-100">🔑 Reset PW</button>
                    <button onClick={() => toggleActive(s)}
                      className={`text-xs px-2 py-1 rounded ${s.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                      {s.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => deleteStudent(s.id)}
                      className="text-xs text-red-400 hover:text-red-600 px-1">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400 text-sm">No students yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add Students link to admin dashboard**

In `src/app/admin/page.tsx`, add to the quick links section:
```tsx
<AdminLink href="/admin/students" title="Manage Students" desc="Create accounts, grant access, reset passwords" />
```

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/students/ src/app/admin/page.tsx
git commit -m "feat: admin student management page with create, disable, reset, grant access"
```

---

## Task 17: Student-facing course catalog

**Files:** `src/app/courses/page.tsx` (modify)

- [ ] **Step 1: Update course catalog with lock icons, price, and FREE badge**

```tsx
// src/app/courses/page.tsx
export const dynamic = 'force-dynamic';
import { auth } from '@/auth';
import pool from '@/lib/db';
import Link from 'next/link';
import type { Course, Enrollment } from '@/types';

async function getData(userId: number | null) {
  const [courses] = await pool.query<any[]>('SELECT * FROM courses WHERE is_published = 1 ORDER BY sort_order');
  let enrollments: Enrollment[] = [];
  if (userId) {
    const [rows] = await pool.query<any[]>('SELECT * FROM enrollments WHERE student_id = ?', [userId]);
    enrollments = rows as Enrollment[];
  }
  return { courses: courses as Course[], enrollments };
}

export default async function CoursesPage() {
  const session = await auth();
  const userId = session ? Number((session.user as any).id ?? 0) : null;
  const { courses, enrollments } = await getData(userId);

  const enrolledIds = new Set(enrollments.map((e) => e.course_id));
  const minSortOrder = courses.length ? Math.min(...courses.map((c) => c.sort_order)) : 0;
  const firstCourseId = courses.find((c) => c.sort_order === minSortOrder)?.id;

  const byCategory = courses.reduce<Record<string, Course[]>>((acc, c) => {
    const cat = c.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(c);
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Course Catalog</h1>
      <p className="text-gray-500 mb-8 text-sm">Health career courses — enroll to get started</p>

      {Object.entries(byCategory).map(([category, cats]) => (
        <div key={category} className="mb-10">
          <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4 border-b border-gray-100 pb-2">{category}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cats.map((course) => {
              const enrolled = enrolledIds.has(course.id);
              const isFree = course.id === firstCourseId;
              return (
                <Link key={course.id} href={`/courses/${course.slug}`}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
                      <span className="text-4xl">📚</span>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-blue-600 transition-colors">{course.title}</h3>
                      {!enrolled && !isFree && <span className="text-gray-400 text-lg flex-shrink-0">🔒</span>}
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      {enrolled ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Enrolled</span>
                      ) : isFree ? (
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Preview Free</span>
                      ) : (
                        <span className="text-sm font-bold text-gray-900">${Number(course.price).toFixed(2)}</span>
                      )}
                      <span className="text-xs text-gray-400 capitalize">{course.level}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/courses/page.tsx
git commit -m "feat: student course catalog with lock icons, price, free badge"
```

---

## Task 18: Student course detail page with access control

**Files:** `src/app/courses/[slug]/page.tsx` (create), `src/components/course/LessonSidebar.tsx`, `src/components/course/LessonViewer.tsx`

- [ ] **Step 1: Create lesson sidebar component**

```tsx
// src/components/course/LessonSidebar.tsx
'use client';
import type { Lesson } from '@/types';

interface Props {
  lessons: Lesson[];
  activeLessonId: number;
  onSelect: (lesson: Lesson) => void;
  price: number;
  enrolled: boolean;
  freeIds: Set<number>;
}

const TYPE_ICON: Record<string, string> = { text: '📄', document: '📎', presentation: '📊', quiz: '📋' };

export default function LessonSidebar({ lessons, activeLessonId, onSelect, price, enrolled, freeIds }: Props) {
  const sections = Array.from(new Set(lessons.map((l) => l.section_title ?? ''))).filter(Boolean);
  const noSection = lessons.filter((l) => !l.section_title);

  function renderLesson(l: Lesson) {
    const accessible = enrolled || freeIds.has(l.id);
    const isActive = l.id === activeLessonId;
    return (
      <button key={l.id} onClick={() => accessible && onSelect(l)} disabled={!accessible}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs mb-0.5 transition-colors ${
          isActive ? 'bg-blue-600 text-white' :
          accessible ? 'hover:bg-gray-100 text-gray-700' : 'text-gray-300 cursor-not-allowed'
        }`}>
        <span>{TYPE_ICON[l.type] || '📄'}</span>
        <span className="flex-1 truncate">{l.title}</span>
        {freeIds.has(l.id) && <span className="text-green-400 text-xs font-bold">FREE</span>}
        {!accessible && <span>🔒</span>}
      </button>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3 flex flex-col">
      <div className="flex-1">
        {sections.map((sec) => (
          <div key={sec} className="mb-4">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2">{sec}</p>
            {lessons.filter((l) => l.section_title === sec).map(renderLesson)}
          </div>
        ))}
        {noSection.map(renderLesson)}
      </div>
      {!enrolled && (
        <div className="mt-4 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-lg font-bold text-gray-900 mb-1">${price.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mb-3">Unlock all lessons</p>
          <a href="enroll" className="block w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
            Enroll Now
          </a>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create lesson viewer component**

```tsx
// src/components/course/LessonViewer.tsx
import type { Lesson, QuizQuestion } from '@/types';

interface Props { lesson: Lesson; questions: QuizQuestion[]; }

export default function LessonViewer({ lesson, questions }: Props) {
  if (lesson.type === 'text') {
    return (
      <div className="prose prose-sm max-w-none p-6"
        dangerouslySetInnerHTML={{ __html: lesson.content || '<p class="text-gray-400">No content yet.</p>' }} />
    );
  }

  if (lesson.type === 'document') {
    const url = lesson.file_path;
    if (!url) return <p className="p-6 text-gray-400 text-sm">No document uploaded yet.</p>;
    return (
      <div className="flex flex-col h-full p-4 gap-3">
        <div className="flex justify-end">
          <a href={url} download className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">⬇ Download PDF</a>
        </div>
        <iframe src={url} className="flex-1 w-full border border-gray-200 rounded-lg min-h-[500px]" title={lesson.title} />
      </div>
    );
  }

  if (lesson.type === 'presentation') {
    const url = lesson.file_path;
    if (!url) return <p className="p-6 text-gray-400 text-sm">No presentation uploaded yet.</p>;
    const absoluteUrl = `https://nationalhealthcareer.com${url}`;
    const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteUrl)}`;
    return (
      <div className="flex flex-col h-full p-4 gap-3">
        <div className="flex justify-end">
          <a href={url} download className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">⬇ Download PPTX</a>
        </div>
        <iframe src={viewerUrl} className="flex-1 w-full border border-gray-200 rounded-lg min-h-[500px]" title={lesson.title} frameBorder="0" />
      </div>
    );
  }

  if (lesson.type === 'quiz') {
    return (
      <div className="p-6 space-y-6">
        <h2 className="font-bold text-lg">{lesson.title}</h2>
        {questions.length === 0 && <p className="text-gray-400 text-sm">No questions yet.</p>}
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="font-medium text-gray-900 mb-3 text-sm">{idx + 1}. {q.question}</p>
            {(q.type === 'multiple_choice' || q.type === 'true_false') && q.options?.map((opt, oi) => (
              <label key={oi} className="flex items-center gap-3 py-1.5 cursor-pointer group">
                <input type="radio" name={`q-${q.id}`} className="w-4 h-4" />
                <span className="text-sm text-gray-700 group-hover:text-blue-600">{opt}</span>
              </label>
            ))}
            {q.type === 'short_answer' && (
              <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your answer…" />
            )}
          </div>
        ))}
        {questions.length > 0 && (
          <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700">Submit Quiz</button>
        )}
      </div>
    );
  }

  return null;
}
```

- [ ] **Step 3: Create course detail page**

```tsx
// src/app/courses/[slug]/page.tsx
export const dynamic = 'force-dynamic';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import type { Course, Lesson, QuizQuestion, Enrollment } from '@/types';
import { isFreeLesson, canAccessLesson } from '@/lib/access';
import LessonSidebar from '@/components/course/LessonSidebar';
import LessonViewer from '@/components/course/LessonViewer';

async function getData(slug: string, userId: number | null) {
  const [courseRows] = await pool.query<any[]>('SELECT * FROM courses WHERE slug = ? LIMIT 1', [slug]);
  const course = (courseRows as Course[])[0];
  if (!course) return null;

  const [allCourses] = await pool.query<any[]>('SELECT id, sort_order FROM courses WHERE is_published = 1');
  const [lessons] = await pool.query<any[]>('SELECT * FROM lessons WHERE course_id = ? ORDER BY sort_order', [course.id]);
  let enrollments: Enrollment[] = [];
  if (userId) {
    const [rows] = await pool.query<any[]>('SELECT * FROM enrollments WHERE student_id = ?', [userId]);
    enrollments = rows as Enrollment[];
  }
  return { course, lessons: lessons as Lesson[], allCourses: allCourses as any[], enrollments };
}

export default async function CourseDetailPage({ params, searchParams }: { params: { slug: string }; searchParams: { lesson?: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const userId = Number((session.user as any).id ?? 0);
  const role = (session.user as any).role as 'admin' | 'student';

  const data = await getData(params.slug, userId);
  if (!data) redirect('/courses');

  const { course, lessons, allCourses, enrollments } = data;
  const enrolled = role === 'admin' || enrollments.some((e) => e.course_id === course.id);

  // Determine free lessons
  const freeIds = new Set(
    lessons.filter((l) => isFreeLesson(l, allCourses)).map((l) => l.id)
  );

  // Active lesson: from query param or first accessible
  const requestedId = searchParams.lesson ? parseInt(searchParams.lesson) : null;
  let activeLesson = requestedId ? lessons.find((l) => l.id === requestedId) : null;
  if (!activeLesson) activeLesson = lessons.find((l) => freeIds.has(l.id) || enrolled) ?? lessons[0];

  // Check access to active lesson
  if (activeLesson && !canAccessLesson(activeLesson, allCourses, enrollments, role)) {
    activeLesson = lessons.find((l) => freeIds.has(l.id)) ?? lessons[0];
  }

  // Fetch quiz questions for active lesson
  let questions: QuizQuestion[] = [];
  if (activeLesson?.type === 'quiz') {
    const [rows] = await pool.query<any[]>('SELECT * FROM quiz_questions WHERE lesson_id = ? ORDER BY sort_order', [activeLesson.id]);
    questions = rows as QuizQuestion[];
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 56px)' }}>
      {/* Course header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <p className="text-xs text-blue-600 font-semibold uppercase mb-0.5">{course.category}</p>
        <h1 className="text-lg font-bold text-gray-900">{course.title}</h1>
      </div>

      {/* Split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-gray-200 bg-gray-50">
          <LessonSidebar
            lessons={lessons}
            activeLessonId={activeLesson?.id ?? 0}
            onSelect={() => {}} /* client-side nav handled via URL */
            price={Number(course.price)}
            enrolled={enrolled}
            freeIds={freeIds}
          />
        </div>

        {/* Lesson content */}
        <div className="flex-1 overflow-y-auto bg-white">
          {activeLesson ? (
            <>
              {freeIds.has(activeLesson.id) && !enrolled && (
                <div className="bg-blue-50 border-b border-blue-100 px-6 py-2 flex items-center justify-between">
                  <span className="text-xs text-blue-700 font-medium">✨ Free preview lesson</span>
                  <a href="enroll" className="text-xs text-blue-600 font-semibold hover:underline">Enroll for full access →</a>
                </div>
              )}
              <LessonViewer lesson={activeLesson} questions={questions} />
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300 text-sm">No lessons available</div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/courses/[slug]/ src/components/course/
git commit -m "feat: student course detail page with access control and lesson viewer"
```

---

## Task 19: Payment mockup page

**Files:** `src/app/courses/[slug]/enroll/page.tsx`

- [ ] **Step 1: Create payment placeholder**

```tsx
// src/app/courses/[slug]/enroll/page.tsx
export const dynamic = 'force-dynamic';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import pool from '@/lib/db';
import Link from 'next/link';

export default async function EnrollPage({ params }: { params: { slug: string } }) {
  const session = await auth();
  if (!session) redirect('/login');

  const [rows] = await pool.query<any[]>('SELECT title, price FROM courses WHERE slug = ? LIMIT 1', [params.slug]);
  const course = (rows as any[])[0];
  if (!course) redirect('/courses');

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">{course.title}</h1>
          <p className="text-3xl font-bold text-blue-600 mb-2">${Number(course.price).toFixed(2)}</p>
          <p className="text-sm text-gray-500 mb-6">One-time enrollment — full course access</p>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800 mb-6">
            <strong>Payment coming soon.</strong> To enroll now, please contact us directly.
          </div>

          <a href="mailto:admin@nationalhealthcareer.com"
            className="block w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors mb-3">
            Contact Us to Enroll
          </a>
          <Link href={`/courses/${params.slug}`} className="text-sm text-gray-400 hover:text-gray-600">
            ← Back to course
          </Link>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/courses/[slug]/enroll/
git commit -m "feat: payment mockup enrollment page"
```

---

## Task 20: Update Navbar for student nav + deploy

**Files:** `src/components/layout/Navbar.tsx` (modify), deploy to server

- [ ] **Step 1: Add Students link to admin Navbar (already has Admin link)**

In `src/components/layout/Navbar.tsx`, the existing Admin link points to `/admin`. The admin dashboard already links to `/admin/courses` and `/admin/students`. No Navbar change needed — admin navigates from the dashboard.

Verify the Navbar shows correctly by checking that the `Sign In` button appears when logged out and `Sign Out` + `Admin` appear when logged in as admin. No code changes needed here.

- [ ] **Step 2: Run TypeScript check locally**

```bash
npx tsc --noEmit
```
Expected: No errors

- [ ] **Step 3: Push all commits to GitHub**

```bash
git push origin main
```

- [ ] **Step 4: Deploy to OVH server**

SSH into server:
```bash
ssh -p 2222 root@nationalhealthcareer.com
cd /var/www/nationalhealthcareer-com
git pull origin main
npm install
npm run build
pm2 restart nha --update-env
pm2 logs nha --lines 20 --nostream
```
Expected: Build succeeds with no errors, app restarts cleanly.

- [ ] **Step 5: Commit (if any minor fixes needed)**

```bash
git add -A
git commit -m "fix: any build issues from deployment"
git push origin main
```

---

## Task 21: End-to-end validation — Course 1

- [ ] **Step 1: Run Moodle import**

Log in at `https://nationalhealthcareer.com/login` as admin.
Navigate to `/admin/courses/import`.
Click "Scan Moodle Database" — verify it finds courses.
Select Course 1 only. Click "Import".
Expected: Course 1 imported with lessons and quiz questions.

- [ ] **Step 2: Verify course in admin**

Go to `/admin/courses`.
Expected: Course 1 card visible with lesson count, price $0.00, Draft status.

- [ ] **Step 3: Edit Course 1**

Click Edit on Course 1.
Set price, publish status, sort_order = 1.
Add a section, add a text lesson, type content in Tiptap editor.
Save. Expected: Lesson saved, visible in tree.

- [ ] **Step 4: Upload a PDF document lesson**

In the lesson editor, click "Document" tab.
Upload a test PDF.
Save. Expected: File path stored, preview link works.

- [ ] **Step 5: Add a quiz**

Add a new lesson, type = Quiz.
Add 3 questions (1 multiple choice, 1 true/false, 1 short answer).
Save. Expected: Questions visible in quiz builder.

- [ ] **Step 6: Test student access — free lesson**

Log out. Log in as `student1@nationalhealthcareer.com` / `VeronicaTapia1972+_)(`.
Navigate to `/courses`.
Expected: Course 1 shows "Preview Free" badge. Other courses show 🔒 and price.
Click Course 1. Expected: First lesson is accessible (no lock), other lessons show 🔒.
Read the free lesson content. Expected: Tiptap HTML renders correctly.

- [ ] **Step 7: Test locked lesson redirect**

Click a locked lesson in the sidebar.
Expected: Button is disabled (not clickable).
Check enrollment CTA in sidebar shows price and "Enroll Now" button.
Click "Enroll Now". Expected: Redirects to `/courses/[slug]/enroll` payment mockup.

- [ ] **Step 8: Test admin grants access**

Log in as admin. Go to `/admin/students`.
Find Student One. Click "+ Grant". Select Course 1. Click "Grant Access".
Log out. Log in as student1.
Navigate to Course 1. Expected: All lessons unlocked.

- [ ] **Step 9: Test admin create student**

In `/admin/students`, click "+ Create Account".
Fill in name, email, temporary password. Click Create.
Expected: New student appears in table.
Try logging in as that student. Expected: Login works.

- [ ] **Step 10: Commit any validation fixes**

```bash
git add -A && git commit -m "fix: validation fixes from Course 1 end-to-end test" && git push origin main
```

---

## Self-Review Notes

- **Spec coverage check:**
  - ✅ Pages & routes — all 9 routes implemented across tasks 6, 14, 15, 16, 17, 18, 19
  - ✅ DB migrations — Task 2
  - ✅ Lesson types (text/document/presentation/quiz) — Tasks 10, 11, 13
  - ✅ Quiz question types (MC, T/F, short answer) — Task 11
  - ✅ Access control (free lesson, enrolled, admin) — Tasks 3, 18
  - ✅ Moodle import flow (scan → preview → run) — Tasks 4, 5, 6
  - ✅ File upload (PDF + PPTX, 50MB) — Task 8
  - ✅ Student management (create, disable, reset pw, grant) — Tasks 9, 16
  - ✅ Payment mockup — Task 19
  - ✅ Build order (Course 1 first) — Task 21

- **PPTX Office Online Viewer** requires the PPTX file to be served at a public URL. Since `/public/uploads/` is served statically by Next.js at the domain root, this will work as long as the file is publicly accessible.

- **LessonSidebar uses client-side `onSelect`** but the course detail page is a server component. The sidebar receives `onSelect={() => {}}` as a placeholder — lesson navigation uses URL query params (`?lesson=ID`) via `<a href>` links in the sidebar. Update `LessonSidebar` to use `<a href={`?lesson=${l.id}`}>` instead of button click for actual navigation. The `onSelect` prop can be removed in that case.

- **`is_active` check on login**: Update `src/auth.ts` to check `is_active = 1` in the SQL query so disabled students cannot log in:
  ```typescript
  "SELECT id, name, email, password_hash, role, is_active FROM students WHERE email = ? LIMIT 1"
  // Then add: if (!user.is_active) return null;
  ```
  Add this to **Task 9 Step 2** — it is a security requirement from the spec (Section 8).

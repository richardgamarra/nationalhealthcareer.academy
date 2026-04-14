# NHA Academy — Course Management Phase 1 Design

**Date:** 2026-04-14
**Scope:** Admin course management, Moodle import, student account management, student-facing Course 1 experience, payment mockup
**Out of scope:** Real payment processing (Phase 2), Google/email OAuth registration (Phase 3), Zoom integration (Phase 3)

---

## 1. Overview

Phase 1 delivers the full admin and student-facing foundation of the NHA Academy LMS:

- Admin can import all 12 courses from the existing Moodle database, then create and edit courses and lessons (text, PDF, PPTX, quiz)
- Students log in, see Course 1 Lesson 1 for free, and see a payment mockup to unlock the rest
- Admin can create student accounts, disable them, reset passwords, and grant course access manually (bypassing payment)
- Course 1 is built and validated first before continuing to the remaining 11 courses

---

## 2. Pages & Routes

### Admin

| Route | Purpose |
|-------|---------|
| `/admin/courses` | Card dashboard — all courses grouped by category, publish toggle, price, Edit button, "+ New Course" and "Import from Moodle" |
| `/admin/courses/new` | Create course form: title, category, level, price, prerequisite course (dropdown), thumbnail upload, description |
| `/admin/courses/[id]` | Split view: left = section/lesson tree (drag to reorder); right = lesson editor with tabs |
| `/admin/courses/import` | 3-step Moodle import: Scan → Preview → Confirm |
| `/admin/students` | Student management: create accounts, disable/enable, reset passwords, grant course access |

### Student-facing

| Route | Purpose |
|-------|---------|
| `/login` | Existing login form (email + password). Links to registration (Phase 3) |
| `/courses` | Course catalog — cards with price, lock icon if not enrolled, FREE badge on Course 1 |
| `/courses/[slug]` | Course detail: lesson sidebar + content area. Lesson 1 free, rest locked with enrollment CTA |
| `/lessons/[id]` | Individual lesson view: text, PDF viewer, PPTX viewer, or quiz |

---

## 3. Database Changes

### `courses` table — new columns

```sql
ALTER TABLE courses
  ADD COLUMN price           DECIMAL(10,2) DEFAULT 0.00,
  ADD COLUMN prerequisite_id INT NULL REFERENCES courses(id),
  ADD COLUMN sort_order      INT DEFAULT 0;
```

### `lessons` table — new columns

```sql
ALTER TABLE lessons
  ADD COLUMN type      ENUM('text','document','presentation','quiz') DEFAULT 'text',
  ADD COLUMN file_path VARCHAR(500) NULL;
```

`content` (existing LONGTEXT) stores Tiptap HTML for text lessons.
`file_path` stores the server path (`/uploads/filename.pdf`) for document and presentation lessons.

### `quiz_questions` — new table

```sql
CREATE TABLE quiz_questions (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  lesson_id      INT NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  type           ENUM('multiple_choice','true_false','short_answer') NOT NULL,
  question       TEXT NOT NULL,
  options        JSON NULL,        -- ["Option A","Option B","Option C","Option D"] for MC; null for short_answer
  correct_answer VARCHAR(500) NULL, -- null for short_answer (graded manually or skipped)
  sort_order     INT DEFAULT 0,
  created_at     DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### `students` table — new column

```sql
ALTER TABLE students
  ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
```

Used by admin to disable accounts without deleting them.

### `enrollments` table — new column

```sql
ALTER TABLE enrollments
  ADD COLUMN granted_by_admin BOOLEAN DEFAULT FALSE;
```

Tracks whether enrollment was paid or manually granted by admin.

---

## 4. Lesson Types

| Type | Icon | Editor | Student View | Download |
|------|------|--------|-------------|----------|
| `text` | 📄 | Tiptap WYSIWYG (bold, headings, lists, tables) | Rendered HTML | No |
| `document` | 📎 | File upload (.pdf) | Browser PDF iframe | Yes |
| `presentation` | 📊 | File upload (.pptx) | Office Online Viewer iframe (`view.officeapps.live.com`) | Yes |
| `quiz` | 📋 | Question builder (add/edit/delete questions) | Interactive quiz form | No |

Files stored in `/public/uploads/` on the server, served at `https://nationalhealthcareer.com/uploads/filename`.

---

## 5. Quiz Question Types

| Type | Options field | correct_answer field |
|------|--------------|---------------------|
| `multiple_choice` | JSON array of 4 strings | Index as string: "0", "1", "2", or "3" |
| `true_false` | `["True","False"]` | "0" or "1" |
| `short_answer` | null | null (not auto-graded in Phase 1) |

---

## 6. Access Control

| User state | Course 1 Lesson 1 | Course 1 other lessons | Courses 2–12 |
|-----------|-------------------|----------------------|--------------|
| Not logged in | Redirect to login | Redirect to login | Redirect to login |
| Logged in, not enrolled | ✅ Free access | 🔒 Show payment mockup | 🔒 Show payment mockup |
| Enrolled (paid or admin-granted) | ✅ | ✅ | ✅ if prerequisite met |
| Admin | ✅ everything | ✅ everything | ✅ everything |

### Free lesson rule
The free lesson is the lesson with the lowest `sort_order` within the course with the lowest `sort_order` overall. No DB flag needed — the access check computes it at request time: `is_free = (course.sort_order === min) && (lesson.sort_order === min_in_course)`.

### Prerequisite rule
Course N requires `enrollments.progress_pct = 100` on course N−1 before the student can enroll in course N. `sort_order` on `courses` defines the sequence.

---

## 7. Moodle Import Flow

**Route:** `/admin/courses/import`

**Step 1 — Scan**
Server connects to the Moodle database (same OVH MariaDB server, different DB). Reads: courses, course sections, course modules (pages, quizzes), quiz questions. Returns a summary: N courses, N lessons, N quiz questions found.

**Step 2 — Preview**
Admin sees a list of all courses with lesson/quiz counts. Can deselect any course before importing. Duplicate detection: if a course slug already exists in `nha_db`, it is flagged as "already imported" and skipped by default.

**Step 3 — Import**
On confirm: courses inserted into `courses`, sections mapped to `section_title` on lessons, lesson content inserted into `lessons` (type=`text`, content = extracted HTML), quiz questions inserted into `quiz_questions`. Progress shown per course. Files (PDFs, PPTX) are NOT auto-imported — admin uploads them manually after import via the lesson editor.

---

## 8. Admin: Student Management (`/admin/students`)

**Table columns:** Name · Email · Status (Active/Disabled) · Course Access tags · Actions

**Actions per student:**
- 🔑 Reset password — admin sets a new password directly
- Disable / Enable — toggles `is_active`. Disabled students cannot log in.
- Delete — hard delete (with confirmation modal)

**Create account modal:**
Fields: Name, Email, Password (admin-set). Role defaults to `student`.

**Grant course access:**
"+ Grant" button per student opens a modal: select course from dropdown → creates an `enrollments` row with `granted_by_admin = true`, bypassing payment.

---

## 9. Payment Mockup

Shown on the course detail page when a student is not enrolled. Not functional — UI only.

**Components:**
- Price displayed prominently in the lesson sidebar (e.g., `$49.99`)
- "Enroll Now" button → navigates to `/courses/[slug]/enroll` (placeholder page)
- Placeholder page shows: course name, price, "Payment coming soon — contact us to enroll" message with admin email
- No Stripe or payment gateway integration in Phase 1

---

## 10. Lesson Editor (Admin — `/admin/courses/[id]`)

**Layout:** Split view
- **Left panel (260px):** Collapsible section/lesson tree. Drag handles (⠿) to reorder. "+ Add Section" at top. "+ Add Lesson" inside each section. Click a lesson to open it in the right panel.
- **Right panel:** Lesson title input + content type tabs

**Tabs:**
- **Text** — Tiptap editor with toolbar: bold, italic, headings, bullet list, numbered list, table, link
- **Document** — File upload area for PDF. Shows current filename if set. Preview link.
- **Presentation** — File upload area for PPTX. Shows current filename if set. Preview link.
- **Quiz** — List of questions. Add question button opens form: question text, type selector, options (for MC/TF), correct answer selector.

**Save behavior:** Each save is a `PUT /api/admin/lessons/[id]` call. File uploads use `POST /api/admin/upload`. Reorder uses `PATCH /api/admin/lessons/reorder`.

---

## 11. File Upload

**API route:** `POST /api/admin/upload`
- Accepts: `.pdf`, `.pptx` only
- Max size: 50MB
- Stored at: `/public/uploads/[timestamp]-[originalname]`
- Returns: `{ url: "/uploads/1234567890-guide.pdf" }`
- Auth: admin only

---

## 12. Build Order

1. DB migrations (schema changes)
2. Moodle import script + `/admin/courses/import` UI
3. `/admin/courses` — course list dashboard
4. `/admin/courses/new` + `/admin/courses/[id]` — course and lesson editor
5. File upload API
6. `/admin/students` — student management
7. Student-facing `/courses` and `/courses/[slug]` with access control
8. Payment mockup pages
9. **Validate Course 1 end-to-end** — admin edits, student views, access control works
10. Continue remaining 11 courses

---

## 13. Out of Scope (Future Phases)

| Feature | Phase |
|---------|-------|
| Real payment processing (Stripe) | Phase 2 |
| Student self-registration | Phase 3 |
| Email verification | Phase 3 |
| Google OAuth login | Phase 3 |
| Zoom live class integration | Phase 3 |
| Quiz auto-grading + student results | Phase 2 |
| Course completion certificates | Phase 2 |

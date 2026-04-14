/**
 * Moodle → NHA DB migration script
 * Run on OVH server with direct MySQL access:
 *   node src/lib/moodle-extract.js
 *
 * Reads from Moodle DB, writes to nha_db.
 * Set env vars before running:
 *   MOODLE_DB=moodle  NHA_DB=nha_db  DB_USER=root  DB_PASS=xxx
 */

const mysql = require('mysql2/promise');

const MOODLE = {
  host: 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.MOODLE_DB || 'moodle',
};

const NHA = {
  host: 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.NHA_DB || 'nha_db',
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

async function run() {
  const src = await mysql.createConnection(MOODLE);
  const dst = await mysql.createConnection(NHA);

  console.log('✓ Connected to both databases');

  // ── Courses ──────────────────────────────────────────────────
  const [moodleCourses] = await src.query(`
    SELECT id, fullname, shortname, summary, timecreated
    FROM mdl_course
    WHERE id > 1
    ORDER BY id
  `);

  console.log(`Found ${moodleCourses.length} Moodle courses`);

  const courseIdMap = {}; // moodle id → nha id

  for (const c of moodleCourses) {
    const slug = slugify(c.shortname || c.fullname);
    const [result] = await dst.query(
      `INSERT IGNORE INTO courses (title, slug, description, created_at)
       VALUES (?, ?, ?, FROM_UNIXTIME(?))`,
      [c.fullname, slug, c.summary || '', c.timecreated]
    );
    if (result.insertId) {
      courseIdMap[c.id] = result.insertId;
      console.log(`  course: [${result.insertId}] ${c.fullname}`);
    }
  }

  // ── Lessons (mdl_page = simple HTML pages) ───────────────────
  const [moodlePages] = await src.query(`
    SELECT p.id, p.course, p.name, p.content, p.timemodified,
           cs.name AS section_name, cm.section AS section_num
    FROM mdl_page p
    JOIN mdl_course_modules cm ON cm.instance = p.id
      AND cm.module = (SELECT id FROM mdl_modules WHERE name='page')
    JOIN mdl_course_sections cs ON cs.id = cm.section
    ORDER BY p.course, cm.section, cm.id
  `);

  console.log(`Found ${moodlePages.length} Moodle page lessons`);

  const lessonSlugs = {}; // track slugs per course to avoid duplicates

  for (const p of moodlePages) {
    const nhaId = courseIdMap[p.course];
    if (!nhaId) continue;

    if (!lessonSlugs[nhaId]) lessonSlugs[nhaId] = {};

    let slug = slugify(p.name);
    if (lessonSlugs[nhaId][slug]) slug = `${slug}-${p.id}`;
    lessonSlugs[nhaId][slug] = true;

    await dst.query(
      `INSERT IGNORE INTO lessons (course_id, section_title, title, slug, content, sort_order, created_at)
       VALUES (?, ?, ?, ?, ?, ?, FROM_UNIXTIME(?))`,
      [nhaId, p.section_name || null, p.name, slug, p.content || '', p.section_num, p.timemodified]
    );
    console.log(`  lesson: ${p.name} → course ${nhaId}`);
  }

  // ── Students ─────────────────────────────────────────────────
  const [moodleUsers] = await src.query(`
    SELECT id, firstname, lastname, email, timecreated
    FROM mdl_user
    WHERE deleted = 0 AND confirmed = 1 AND id > 1
    ORDER BY id
  `);

  console.log(`Found ${moodleUsers.length} Moodle users`);

  const studentIdMap = {};

  for (const u of moodleUsers) {
    const [result] = await dst.query(
      `INSERT IGNORE INTO students (name, email, password_hash, created_at)
       VALUES (?, ?, ?, FROM_UNIXTIME(?))`,
      [`${u.firstname} ${u.lastname}`, u.email, 'RESET_REQUIRED', u.timecreated]
    );
    if (result.insertId) {
      studentIdMap[u.id] = result.insertId;
    }
  }

  // ── Enrollments ──────────────────────────────────────────────
  const [moodleEnrollments] = await src.query(`
    SELECT DISTINCT ue.userid, e.courseid, ue.timecreated
    FROM mdl_user_enrolments ue
    JOIN mdl_enrol e ON e.id = ue.enrolid
    WHERE ue.status = 0
  `);

  for (const e of moodleEnrollments) {
    const sid = studentIdMap[e.userid];
    const cid = courseIdMap[e.courseid];
    if (!sid || !cid) continue;
    await dst.query(
      `INSERT IGNORE INTO enrollments (student_id, course_id, enrolled_at)
       VALUES (?, ?, FROM_UNIXTIME(?))`,
      [sid, cid, e.timecreated]
    );
  }

  await src.end();
  await dst.end();

  console.log('\n✅ Migration complete!');
  console.log(`   Courses:     ${Object.keys(courseIdMap).length}`);
  console.log(`   Students:    ${Object.keys(studentIdMap).length}`);
  console.log(`   Lessons:     ${moodlePages.length}`);
}

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});

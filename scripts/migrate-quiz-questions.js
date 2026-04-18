/**
 * migrate-quiz-questions.js
 *
 * One-time migration: reads quiz JSON stored in lessons.content
 * and inserts rows into the quiz_questions table.
 *
 * Applies to course IDs passed as CLI args, e.g.:
 *   node migrate-quiz-questions.js 5 9
 * Or defaults to courses 5 and 9.
 */

const mysql = require('mysql2/promise');

const DB = { host: 'localhost', user: 'admin_nhca', password: '2u95#I7jm', database: 'nha_db' };

async function main() {
  const courseIds = process.argv.slice(2).map(Number).filter(Boolean);
  const targets = courseIds.length ? courseIds : [5, 9];

  const conn = await mysql.createConnection(DB);

  for (const courseId of targets) {
    console.log(`\n── Course ${courseId} ──`);

    const [quizLessons] = await conn.execute(
      `SELECT id, title FROM lessons WHERE course_id = ? AND type = 'quiz' ORDER BY sort_order`,
      [courseId]
    );

    for (const lesson of quizLessons) {
      // Fetch content separately to avoid truncation
      const [[{ content }]] = await conn.execute(
        'SELECT content FROM lessons WHERE id = ?',
        [lesson.id]
      );

      if (!content) {
        console.log(`  [skip] ${lesson.title} — no content`);
        continue;
      }

      let questions;
      try {
        questions = JSON.parse(content);
      } catch (e) {
        console.log(`  [skip] ${lesson.title} — content is not JSON (probably HTML text lesson)`);
        continue;
      }

      if (!Array.isArray(questions)) {
        console.log(`  [skip] ${lesson.title} — parsed content is not an array`);
        continue;
      }

      // Delete any existing rows for this lesson first (idempotent)
      await conn.execute('DELETE FROM quiz_questions WHERE lesson_id = ?', [lesson.id]);

      let inserted = 0;
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];

        // Determine type
        const type = (q.options && q.options.length === 2 &&
          q.options.every(o => ['True', 'False', 'true', 'false'].includes(o)))
          ? 'true_false' : 'multiple_choice';

        // correct_answer: store the text of the correct option
        const correctAnswer = (q.options && typeof q.answer === 'number')
          ? q.options[q.answer]
          : (q.answer ?? '');

        await conn.execute(
          `INSERT INTO quiz_questions (lesson_id, type, question, options, correct_answer, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            lesson.id,
            type,
            q.q,
            JSON.stringify(q.options ?? []),
            String(correctAnswer),
            i,
          ]
        );
        inserted++;
      }

      console.log(`  ✓ ${lesson.title} — ${inserted} questions inserted (lesson id=${lesson.id})`);
    }
  }

  await conn.end();
  console.log('\nMigration complete.');
}

main().catch(err => { console.error(err); process.exit(1); });

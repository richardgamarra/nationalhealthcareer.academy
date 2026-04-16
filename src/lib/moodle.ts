import 'server-only';
import mysql, { RowDataPacket } from 'mysql2/promise';

// Separate pool pointing at the Moodle DB on the same server
const moodlePool = mysql.createPool({
  host:     process.env.MOODLE_DB_HOST     || 'localhost',
  user:     process.env.MOODLE_DB_USER     || '',
  password: process.env.MOODLE_DB_PASSWORD || '',
  database: process.env.MOODLE_DB_NAME     || '',
  charset:  'utf8mb4',
  waitForConnections: true,
  connectionLimit: 5,
});

export interface MoodleCourse {
  id: number;
  shortname: string;
  fullname: string;
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
  qtype: 'multichoice' | 'truefalse' | 'shortanswer' | string;
  answers: { text: string; fraction: number }[];
}

/** Fetch all non-site courses from Moodle */
export async function scanMoodleCourses(): Promise<MoodleCourse[]> {
  const [rows] = await moodlePool.query<RowDataPacket[]>(
    "SELECT id, shortname, fullname, summary FROM mdl_course WHERE id > 1 ORDER BY sortorder"
  );
  return rows as unknown as MoodleCourse[];
}

/** Fetch all sections + page/quiz modules for a given Moodle course ID */
export async function scanMoodleLessons(courseId: number): Promise<MoodleLesson[]> {
  // Get pages
  const [pageRows] = await moodlePool.query<RowDataPacket[]>(`
    SELECT
      p.id, cm.course, cs.section, cs.name AS sectionName, p.name, p.content, 'page' AS modType
    FROM mdl_page p
    JOIN mdl_course_modules cm ON cm.instance = p.id AND cm.module = (SELECT id FROM mdl_modules WHERE name='page')
    JOIN mdl_course_sections cs ON cs.id = cm.section
    WHERE cm.course = ?
    ORDER BY cs.section, cm.indent, cm.id
  `, [courseId]);

  // Get quizzes
  const [quizRows] = await moodlePool.query<RowDataPacket[]>(`
    SELECT
      q.id, cm.course, cs.section, cs.name AS sectionName, q.name, '' AS content, 'quiz' AS modType
    FROM mdl_quiz q
    JOIN mdl_course_modules cm ON cm.instance = q.id AND cm.module = (SELECT id FROM mdl_modules WHERE name='quiz')
    JOIN mdl_course_sections cs ON cs.id = cm.section
    WHERE cm.course = ?
    ORDER BY cs.section, cm.id
  `, [courseId]);

  return [...pageRows, ...quizRows] as unknown as MoodleLesson[];
}

/** Fetch quiz questions for a given Moodle quiz ID */
export async function scanMoodleQuestions(quizId: number): Promise<MoodleQuestion[]> {
  const [rows] = await moodlePool.query<RowDataPacket[]>(`
    SELECT
      q.id, qs.quizid AS quizId, q.questiontext AS questionText, q.qtype,
      qa.answer AS answerText, qa.fraction
    FROM mdl_quiz_slots qs
    JOIN mdl_question q ON q.id = qs.questionid
    JOIN mdl_question_answers qa ON qa.question = q.id
    WHERE qs.quizid = ?
      AND q.qtype IN ('multichoice', 'truefalse', 'shortanswer')
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
  return Array.from(questionMap.values()) as MoodleQuestion[];
}

export default moodlePool;

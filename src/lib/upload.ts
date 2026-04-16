import 'server-only';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];
const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

export async function saveUploadedFile(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only PDF and PPTX files are allowed');
  }
  if (file.size > MAX_BYTES) {
    throw new Error('File exceeds 50 MB limit');
  }
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = file.name.toLowerCase().endsWith('.pptx') ? '.pptx' : '.pdf';
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = `${Date.now()}-${safeName}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);
  return `/uploads/${filename}`;
}

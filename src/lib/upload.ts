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
  // Note: file.type is set by the browser from the file extension — it is not a verified
  // content check. A renamed malicious file could pass. Files are served statically to
  // enrolled users only and are not executed server-side, so this risk is accepted for
  // Phase 1. Consider adding magic-byte validation for Phase 2.
  if (file.size > MAX_BYTES) {
    throw new Error('File exceeds 50 MB limit');
  }
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = file.name.toLowerCase().endsWith('.pptx') ? '.pptx' : '.pdf';
  const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = `${Date.now()}-${baseName}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);
  return `/uploads/${filename}`;
}

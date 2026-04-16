import 'server-only';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const DOC_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];
const ALLOWED_TYPES = [...DOC_TYPES, ...IMAGE_TYPES];

const MAX_BYTES = 50 * 1024 * 1024; // 50 MB for docs
const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB for images

function getExtension(file: File): string {
  const name = file.name.toLowerCase();
  if (name.endsWith('.pptx')) return '.pptx';
  if (name.endsWith('.pdf')) return '.pdf';
  if (name.endsWith('.png')) return '.png';
  if (name.endsWith('.gif')) return '.gif';
  if (name.endsWith('.webp')) return '.webp';
  if (name.endsWith('.svg')) return '.svg';
  // default for jpeg variants
  return '.jpg';
}

export async function saveUploadedFile(file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Only PDF, PPTX, and image files (JPEG, PNG, GIF, WebP, SVG) are allowed');
  }
  const isImage = IMAGE_TYPES.includes(file.type);
  const maxSize = isImage ? MAX_IMAGE_BYTES : MAX_BYTES;
  if (file.size > maxSize) {
    throw new Error(isImage ? 'Image exceeds 10 MB limit' : 'File exceeds 50 MB limit');
  }
  await mkdir(UPLOAD_DIR, { recursive: true });
  const ext = getExtension(file);
  const baseName = file.name.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9._-]/g, '_');
  const filename = `${Date.now()}-${baseName}${ext}`;
  const filepath = path.join(UPLOAD_DIR, filename);
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(filepath, buffer);
  return `/uploads/${filename}`;
}

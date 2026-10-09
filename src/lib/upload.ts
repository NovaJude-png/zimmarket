// Image Upload Service
// Supports: Local filesystem (dev), Cloudinary (production)
// To enable Cloudinary: Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

export interface UploadResult {
  url: string;
  publicId?: string;
  width?: number;
  height?: number;
  format?: string;
}

const CLOUDINARY_CLOUD = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_URL = process.env.CLOUDINARY_URL;

export function isCloudinaryConfigured(): boolean {
  return !!(CLOUDINARY_URL || (CLOUDINARY_CLOUD && CLOUDINARY_KEY && CLOUDINARY_SECRET));
}

export async function uploadImage(buffer: Buffer, filename: string): Promise<UploadResult> {
  if (isCloudinaryConfigured()) {
    return uploadToCloudinary(buffer, filename);
  }
  return uploadToLocal(buffer, filename);
}

async function uploadToCloudinary(buffer: Buffer, filename: string): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', new Blob([buffer]), filename);
  formData.append('upload_preset', 'zimmarket');
  formData.append('folder', 'zimmarket/listings');

  const cloudName = CLOUDINARY_CLOUD || extractCloudName(CLOUDINARY_URL!);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error('Cloudinary upload failed:', err);
    throw new Error('Image upload failed');
  }

  const data = await res.json();
  return {
    url: data.secure_url,
    publicId: data.public_id,
    width: data.width,
    height: data.height,
    format: data.format,
  };
}

async function uploadToLocal(buffer: Buffer, filename: string): Promise<UploadResult> {
  const { writeFile, mkdir } = await import('fs/promises');
  const path = await import('path');
  const { v4: uuidv4 } = await import('uuid');

  const ext = filename.split('.').pop() || 'jpg';
  const uniqueName = `${uuidv4()}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'images');

  await mkdir(uploadDir, { recursive: true });
  await writeFile(path.join(uploadDir, uniqueName), buffer);

  return { url: `/uploads/images/${uniqueName}` };
}

function extractCloudName(url: string): string {
  const match = url.match(/cloudinary:\/\/.*?@(.+)/);
  return match ? match[1] : '';
}

export function getUploadStatus(): { provider: string; configured: boolean } {
  if (isCloudinaryConfigured()) {
    return { provider: 'Cloudinary', configured: true };
  }
  return { provider: 'Local filesystem', configured: true };
}
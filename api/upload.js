import { put } from '@vercel/blob';
import { Buffer } from 'node:buffer';
import process from 'node:process';

const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export default async function handler(request, response) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    if (request.method !== 'POST') {
      response.setHeader('Allow', 'POST');
      return response.status(405).json({ error: 'Method not allowed.' });
    }

    const body = parseBody(request.body);
    assertAdmin(body.password);

    const { filename, contentType, dataUrl, folder } = body;
    if (!filename || !contentType || !dataUrl) {
      return response.status(400).json({ error: 'Missing upload fields.' });
    }

    if (!ALLOWED_TYPES.has(contentType)) {
      return response.status(400).json({ error: 'Unsupported image type.' });
    }

    const imageBuffer = dataUrlToBuffer(dataUrl);
    if (imageBuffer.byteLength > MAX_IMAGE_BYTES) {
      return response.status(413).json({ error: 'Image must be 3MB or smaller.' });
    }

    const blob = await put(makeBlobPath(filename, folder), imageBuffer, {
      access: 'public',
      contentType,
      addRandomSuffix: true,
    });

    return response.status(200).json({ url: blob.url });
  } catch (error) {
    const status = error.status || 500;
    const message = error.message || 'Upload failed.';
    return response.status(status).json({ error: message });
  }
}

function assertAdmin(password) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) throw createHttpError(500, 'ADMIN_PASSWORD is not configured.');
  if (!password || password !== adminPassword) throw createHttpError(401, 'Unauthorized.');
}

function dataUrlToBuffer(dataUrl) {
  const [, base64Data] = dataUrl.split(',');
  if (!base64Data) throw createHttpError(400, 'Invalid image data.');

  return Buffer.from(base64Data, 'base64');
}

function makeBlobPath(filename, folder = 'archive-images') {
  const safeFolder = String(folder)
    .toLowerCase()
    .replace(/[^a-z0-9/_-]+/g, '-')
    .replace(/^\/+|\/+$/g, '')
    .slice(0, 80) || 'archive-images';
  const safeName = filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

  return `${safeFolder}/${Date.now()}-${safeName || 'image'}`;
}

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'string') return JSON.parse(body || '{}');
  return body;
}

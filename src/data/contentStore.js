import { chatbots as defaultChatbots, notes as defaultNotes, widgets as defaultWidgets } from './content';
import repositoryContent from './userContent.json';

export const CONTENT_STORAGE_KEY = 'asterism.archive.content.v1';
export const ADMIN_SESSION_KEY = 'asterism.archive.admin.session';
export const CONTENT_UPDATED_EVENT = 'asterism-content-updated';
export const DEFAULT_BACKGROUND_IMAGE = '/background.jpg';

const repositoryStoredContent = normalizeContent(repositoryContent);

export function getStoredContent() {
  if (typeof window === 'undefined') return repositoryStoredContent;

  try {
    const rawContent = window.localStorage.getItem(CONTENT_STORAGE_KEY);
    if (!rawContent) return repositoryStoredContent;

    return mergeStoredContent(normalizeContent(JSON.parse(rawContent)), repositoryStoredContent);
  } catch {
    return repositoryStoredContent;
  }
}

export function mergeWithDefaultContent(storedContent) {
  return {
    chatbots: [...storedContent.chatbots, ...defaultChatbots],
    notes: [...storedContent.notes, ...defaultNotes],
    widgets: [...storedContent.widgets, ...defaultWidgets],
    settings: storedContent.settings,
  };
}

export function getMergedContent() {
  return mergeWithDefaultContent(getStoredContent());
}

export async function loadStoredContent() {
  try {
    const response = await fetch('/api/content', { cache: 'no-store' });
    if (!response.ok) throw new Error('Remote content unavailable.');

    return normalizeContent(await response.json());
  } catch {
    return getStoredContent();
  }
}

export async function loadMergedContent() {
  return mergeWithDefaultContent(await loadStoredContent());
}

export async function saveContentItem(section, item, password) {
  const response = await fetch('/api/content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section, item, password }),
  });

  if (!response.ok) throw new Error(await getApiError(response));

  const nextContent = normalizeContent(await response.json());
  cacheLocalContent(nextContent);
  window.dispatchEvent(new CustomEvent(CONTENT_UPDATED_EVENT));

  return nextContent;
}

export async function updateContentItem(section, item, password) {
  const response = await fetch('/api/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section, item, password }),
  });

  if (!response.ok) throw new Error(await getApiError(response));

  const nextContent = normalizeContent(await response.json());
  cacheLocalContent(nextContent);
  window.dispatchEvent(new CustomEvent(CONTENT_UPDATED_EVENT));

  return nextContent;
}

export async function deleteContentItem(section, id, password) {
  const response = await fetch('/api/content', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section, id, password }),
  });

  if (!response.ok) throw new Error(await getApiError(response));

  const nextContent = normalizeContent(await response.json());
  cacheLocalContent(nextContent);
  window.dispatchEvent(new CustomEvent(CONTENT_UPDATED_EVENT));

  return nextContent;
}

export async function updateSiteSettings(settings, password) {
  const response = await fetch('/api/content', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ section: 'settings', settings, password }),
  });

  if (!response.ok) throw new Error(await getApiError(response));

  const nextContent = normalizeContent(await response.json());
  cacheLocalContent(nextContent);
  window.dispatchEvent(new CustomEvent(CONTENT_UPDATED_EVENT));

  return nextContent;
}

export async function uploadImage(file, password, folder = 'archive-images') {
  const dataUrl = await fileToDataUrl(file);
  const response = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      password,
      filename: file.name,
      contentType: file.type,
      dataUrl,
      folder,
    }),
  });

  if (!response.ok) throw new Error(await getApiError(response));

  const payload = await response.json();
  return payload.url;
}

export function getAdminPassword() {
  if (typeof window === 'undefined') return '';

  return window.sessionStorage.getItem(ADMIN_SESSION_KEY) || '';
}

export function setAdminPassword(password) {
  window.sessionStorage.setItem(ADMIN_SESSION_KEY, password);
}

export function clearAdminPassword() {
  window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export function makeContentId(title) {
  const slug = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  return `${slug || 'post'}-${Date.now()}`;
}

function cacheLocalContent(content) {
  window.localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(normalizeContent(content)));
}

function normalizeContent(content) {
  return {
    chatbots: Array.isArray(content.chatbots) ? content.chatbots : [],
    notes: Array.isArray(content.notes) ? content.notes : [],
    widgets: Array.isArray(content.widgets) ? content.widgets : [],
    settings: normalizeSettings(content.settings),
  };
}

function normalizeSettings(settings = {}) {
  return {
    backgroundImage: typeof settings.backgroundImage === 'string' && settings.backgroundImage
      ? settings.backgroundImage
      : DEFAULT_BACKGROUND_IMAGE,
  };
}

function mergeStoredContent(primaryContent, fallbackContent) {
  return {
    chatbots: mergeContentList(primaryContent.chatbots, fallbackContent.chatbots),
    notes: mergeContentList(primaryContent.notes, fallbackContent.notes),
    widgets: mergeContentList(primaryContent.widgets, fallbackContent.widgets),
    settings: mergeSettings(primaryContent.settings, fallbackContent.settings),
  };
}

function mergeSettings(primarySettings, fallbackSettings) {
  const primaryBackground = primarySettings.backgroundImage;
  return {
    backgroundImage: primaryBackground && primaryBackground !== DEFAULT_BACKGROUND_IMAGE
      ? primaryBackground
      : fallbackSettings.backgroundImage,
  };
}

function mergeContentList(primaryList, fallbackList) {
  const seenIds = new Set(primaryList.map((item) => item.id));
  return [
    ...primaryList,
    ...fallbackList.filter((item) => !seenIds.has(item.id)),
  ];
}

async function getApiError(response) {
  try {
    const payload = await response.json();
    return payload.error || 'Content API failed.';
  } catch {
    return 'Content API failed.';
  }
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read image.'));
    reader.readAsDataURL(file);
  });
}

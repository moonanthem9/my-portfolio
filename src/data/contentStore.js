import { chatbots as defaultChatbots, notes as defaultNotes, widgets as defaultWidgets } from './content';

export const CONTENT_STORAGE_KEY = 'asterism.archive.content.v1';
export const CONTENT_UPDATED_EVENT = 'asterism-content-updated';

const emptyStoredContent = {
  chatbots: [],
  notes: [],
  widgets: [],
};

export function getStoredContent() {
  if (typeof window === 'undefined') return emptyStoredContent;

  try {
    const rawContent = window.localStorage.getItem(CONTENT_STORAGE_KEY);
    if (!rawContent) return emptyStoredContent;

    return {
      ...emptyStoredContent,
      ...JSON.parse(rawContent),
    };
  } catch {
    return emptyStoredContent;
  }
}

export function getMergedContent() {
  const storedContent = getStoredContent();

  return {
    chatbots: [...storedContent.chatbots, ...defaultChatbots],
    notes: [...storedContent.notes, ...defaultNotes],
    widgets: [...storedContent.widgets, ...defaultWidgets],
  };
}

export function saveContentItem(section, item) {
  const storedContent = getStoredContent();
  const nextContent = {
    ...storedContent,
    [section]: [item, ...(storedContent[section] || [])],
  };

  window.localStorage.setItem(CONTENT_STORAGE_KEY, JSON.stringify(nextContent));
  window.dispatchEvent(new CustomEvent(CONTENT_UPDATED_EVENT));

  return nextContent;
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

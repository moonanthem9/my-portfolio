import { del } from '@vercel/blob';
import { Buffer } from 'node:buffer';
import process from 'node:process';

const CONTENT_PATH = 'src/data/userContent.json';
const VALID_SECTIONS = ['chatbots', 'notes', 'widgets'];
const EMPTY_CONTENT = {
  chatbots: [],
  notes: [],
  widgets: [],
  settings: {
    backgroundImage: '/background.jpg',
  },
};

export default async function handler(request, response) {
  setJsonHeaders(response);

  try {
    if (request.method === 'GET') {
      const { content } = await readContentFile();
      return response.status(200).json(content);
    }

    const body = parseBody(request.body);

    if (request.method === 'POST') {
      assertAdmin(body.password);

      const { section, item } = body;
      assertValidSection(section);

      const { content, sha } = await readContentFile();
      const nextContent = normalizeContent({
        ...content,
        [section]: [item, ...content[section]],
      });

      await writeContentFile(nextContent, sha, `Add ${section} entry`);
      return response.status(200).json(nextContent);
    }

    if (request.method === 'DELETE') {
      assertAdmin(body.password);

      const { section, id } = body;
      assertValidSection(section);
      if (!id) throw createHttpError(400, 'Missing item id.');

      const { content, sha } = await readContentFile();
      const deletedItem = content[section].find((item) => item.id === id);
      const nextContent = normalizeContent({
        ...content,
        [section]: content[section].filter((item) => item.id !== id),
      });

      await writeContentFile(nextContent, sha, `Delete ${section} entry`);
      await cleanupUnusedImages([deletedItem?.image], nextContent);
      return response.status(200).json(nextContent);
    }

    if (request.method === 'PUT') {
      assertAdmin(body.password);

      const { section, item } = body;
      if (section === 'settings') {
        const { content, sha } = await readContentFile();
        const previousBackground = content.settings.backgroundImage;
        const nextContent = normalizeContent({
          ...content,
          settings: normalizeSettings(body.settings),
        });

        await writeContentFile(nextContent, sha, 'Update site settings');
        await cleanupUnusedImages([previousBackground], nextContent);
        return response.status(200).json(nextContent);
      }

      assertValidSection(section);
      if (!item?.id) throw createHttpError(400, 'Missing item id.');

      const { content, sha } = await readContentFile();
      const previousItem = content[section].find((entry) => entry.id === item.id);
      if (!previousItem) throw createHttpError(404, 'Entry not found.');

      const nextContent = normalizeContent({
        ...content,
        [section]: content[section].map((entry) => entry.id === item.id ? item : entry),
      });

      await writeContentFile(nextContent, sha, `Update ${section} entry`);
      await cleanupUnusedImages([previousItem.image], nextContent);
      return response.status(200).json(nextContent);
    }

    response.setHeader('Allow', 'GET, POST, PUT, DELETE');
    return response.status(405).json({ error: 'Method not allowed.' });
  } catch (error) {
    const status = error.status || 500;
    const message = status === 500 ? 'Content API failed.' : error.message;
    return response.status(status).json({ error: message });
  }
}

function setJsonHeaders(response) {
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
}

function assertAdmin(password) {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) throw createHttpError(500, 'ADMIN_PASSWORD is not configured.');
  if (!password || password !== adminPassword) throw createHttpError(401, 'Unauthorized.');
}

function assertValidSection(section) {
  if (!VALID_SECTIONS.includes(section)) {
    throw createHttpError(400, 'Invalid content section.');
  }
}

async function readContentFile() {
  const config = getGithubConfig();
  const apiResponse = await fetch(githubContentsUrl(config, true), {
    headers: githubHeaders(config),
  });

  if (apiResponse.status === 404) {
    return { content: EMPTY_CONTENT, sha: null };
  }

  if (!apiResponse.ok) {
    throw createHttpError(500, 'Could not read content from GitHub.');
  }

  const payload = await apiResponse.json();
  const rawContent = Buffer.from(payload.content || '', 'base64').toString('utf8');

  return {
    content: normalizeContent(JSON.parse(rawContent || '{}')),
    sha: payload.sha,
  };
}

async function writeContentFile(content, sha, message) {
  const config = getGithubConfig();
  const body = {
    message,
    branch: config.branch,
    content: Buffer.from(`${JSON.stringify(content, null, 2)}\n`, 'utf8').toString('base64'),
  };

  if (sha) body.sha = sha;

  const apiResponse = await fetch(githubContentsUrl(config), {
    method: 'PUT',
    headers: githubHeaders(config),
    body: JSON.stringify(body),
  });

  if (!apiResponse.ok) {
    throw createHttpError(500, 'Could not write content to GitHub.');
  }
}

function getGithubConfig() {
  const token = process.env.GITHUB_CONTENT_TOKEN;
  if (!token) throw createHttpError(500, 'GITHUB_CONTENT_TOKEN is not configured.');

  return {
    token,
    owner: process.env.GITHUB_OWNER || process.env.VERCEL_GIT_REPO_OWNER || 'moonanthem9',
    repo: process.env.GITHUB_REPO || process.env.VERCEL_GIT_REPO_SLUG || 'my-portfolio',
    branch: process.env.GITHUB_BRANCH || 'main',
  };
}

function githubContentsUrl({ owner, repo, branch }, includeRef = false) {
  const path = encodeURIComponent(CONTENT_PATH).replace(/%2F/g, '/');
  const refQuery = includeRef ? `?ref=${branch}` : '';
  return `https://api.github.com/repos/${owner}/${repo}/contents/${path}${refQuery}`;
}

function githubHeaders({ token }) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
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
      : '/background.jpg',
  };
}

async function cleanupUnusedImages(imageUrls, content) {
  const activeImages = new Set(getAllImages(content));
  const uniqueUrls = [...new Set(imageUrls.filter(Boolean))];

  await Promise.all(uniqueUrls.map(async (url) => {
    if (!isVercelBlobUrl(url) || activeImages.has(url)) return;
    try {
      await del(url);
    } catch (error) {
      console.error(`Could not delete blob: ${url}`, error);
    }
  }));
}

function getAllImages(content) {
  return [
    content.settings.backgroundImage,
    ...VALID_SECTIONS.flatMap((section) => (
      content[section]
        .map((item) => item.image)
        .filter(Boolean)
    )),
  ].filter(Boolean);
}

function isVercelBlobUrl(url) {
  try {
    return new URL(url).hostname.endsWith('.public.blob.vercel-storage.com');
  } catch {
    return false;
  }
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'string') return JSON.parse(body || '{}');
  return body;
}

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

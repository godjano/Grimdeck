import { db } from './index';

// ─── Export/Import ───

export async function exportAllData(): Promise<string> {
  const [models, paints, links, campaigns, operatives, results] = await Promise.all([
    db.models.toArray(),
    db.paints.toArray(),
    db.modelPaintLinks.toArray(),
    db.campaigns.toArray(),
    db.operatives.toArray(),
    db.missionResults.toArray(),
  ]);
  return JSON.stringify({ models, paints, links, campaigns, operatives, results, exportedAt: Date.now() }, null, 2);
}

export async function importAllData(json: string) {
  const data = JSON.parse(json);
  await db.transaction('rw', [db.models, db.paints, db.modelPaintLinks, db.campaigns, db.operatives, db.missionResults], async () => {
    await db.models.clear(); await db.paints.clear(); await db.modelPaintLinks.clear();
    await db.campaigns.clear(); await db.operatives.clear(); await db.missionResults.clear();
    if (data.models?.length) await db.models.bulkAdd(data.models);
    if (data.paints?.length) await db.paints.bulkAdd(data.paints);
    if (data.links?.length) await db.modelPaintLinks.bulkAdd(data.links);
    if (data.campaigns?.length) await db.campaigns.bulkAdd(data.campaigns);
    if (data.operatives?.length) await db.operatives.bulkAdd(data.operatives);
    if (data.results?.length) await db.missionResults.bulkAdd(data.results);
  });
}

export function downloadJson(json: string, filename: string) {
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// ─── GitHub Gist Sync ───

const GIST_TOKEN_KEY = 'grimdeck_gh_token';
const GIST_ID_KEY = 'grimdeck_gist_id';
const GIST_FILENAME = 'grimdeck-data.json';

export function getGistToken(): string | null { return localStorage.getItem(GIST_TOKEN_KEY); }
export function setGistToken(token: string) { localStorage.setItem(GIST_TOKEN_KEY, token); }
export function getGistId(): string | null { return localStorage.getItem(GIST_ID_KEY); }
export function setGistId(id: string) { localStorage.setItem(GIST_ID_KEY, id); }
export function clearGistConfig() { localStorage.removeItem(GIST_TOKEN_KEY); localStorage.removeItem(GIST_ID_KEY); }

async function gistFetch(path: string, token: string, options: RequestInit = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json', 'Content-Type': 'application/json', ...options.headers as Record<string, string> },
  });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  return res.json();
}

export async function saveToGist(): Promise<string> {
  const token = getGistToken();
  if (!token) throw new Error('No GitHub token configured');
  const json = await exportAllData();
  const gistId = getGistId();

  if (gistId) {
    // Update existing gist
    await gistFetch(`/gists/${gistId}`, token, {
      method: 'PATCH',
      body: JSON.stringify({ files: { [GIST_FILENAME]: { content: json } } }),
    });
    return gistId;
  } else {
    // Create new gist
    const result = await gistFetch('/gists', token, {
      method: 'POST',
      body: JSON.stringify({
        description: 'Grimdeck - Miniature Hobby Data Backup',
        public: false,
        files: { [GIST_FILENAME]: { content: json } },
      }),
    });
    setGistId(result.id);
    return result.id;
  }
}

export async function loadFromGist(): Promise<void> {
  const token = getGistToken();
  const gistId = getGistId();
  if (!token || !gistId) throw new Error('No GitHub sync configured');

  const result = await gistFetch(`/gists/${gistId}`, token);
  const content = result.files?.[GIST_FILENAME]?.content;
  if (!content) throw new Error('No Grimdeck data found in this Gist');
  await importAllData(content);
}

export async function verifyToken(token: string): Promise<string> {
  const result = await gistFetch('/user', token);
  return result.login;
}

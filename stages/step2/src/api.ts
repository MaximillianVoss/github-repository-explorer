export interface Repository {
  id: number;
  full_name: string;
  html_url: string;
}

export interface SearchResult {
  items: Repository[];
  total_count: number;
  incomplete_results: boolean;
}

export const EMPTY_KEYWORD = 'Please enter a keyword.';
export const RATE_LIMIT = 'GitHub rate limit reached. Please wait before searching again.';

function isRepository(value: unknown): value is Repository {
  if (typeof value !== 'object' || value === null) return false;
  const repo = value as Record<string, unknown>;
  if (typeof repo.id !== 'number' || typeof repo.full_name !== 'string'
    || typeof repo.html_url !== 'string') return false;
  try {
    const url = new URL(repo.html_url);
    return url.protocol === 'https:' && url.hostname === 'github.com';
  } catch {
    return false;
  }
}

export async function searchRepositories(
  keyword: string,
  signal?: AbortSignal,
): Promise<SearchResult> {
  const query = keyword.trim();
  if (!query) throw new Error(EMPTY_KEYWORD);
  const response = await fetch(
    `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}`,
    {
      headers: { Accept: 'application/vnd.github+json' },
      signal: signal
        ? AbortSignal.any([signal, AbortSignal.timeout(15_000)])
        : AbortSignal.timeout(15_000),
    },
  );

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message = typeof body === 'object' && body !== null && 'message' in body
      ? String(body.message) : '';
    const rateLimited = response.status === 429 || (
      response.status === 403 && (
        response.headers.get('x-ratelimit-remaining') === '0'
        || /rate limit|secondary rate/i.test(message)
      )
    );
    if (rateLimited) throw new Error(RATE_LIMIT);
    throw new Error(`GitHub request failed (HTTP ${response.status}).`);
  }

  const payload: unknown = await response.json();
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('GitHub returned an invalid response.');
  }
  const data = payload as Record<string, unknown>;
  if (!Array.isArray(data.items) || !data.items.every(isRepository)
    || typeof data.total_count !== 'number' || typeof data.incomplete_results !== 'boolean') {
    throw new Error('GitHub returned an invalid repository list.');
  }
  return {
    items: data.items,
    total_count: data.total_count,
    incomplete_results: data.incomplete_results,
  };
}

export function filterRepositories(repositories: Repository[], text: string): Repository[] {
  const filter = text.trim().toLowerCase();
  return repositories.filter((repo) => repo.full_name.toLowerCase().includes(filter));
}


import { useState, type SubmitEvent } from 'react';
import { filterRepositories, EMPTY_KEYWORD, searchRepositories, type Repository } from './api';
import RepositoryTable from './RepositoryTable';

export default function App() {
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const visible = filterRepositories(repositories, filter);

  async function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    if (!keyword.trim()) {
      setError(EMPTY_KEYWORD);
      return;
    }
    setLoading(true);
    setError('');
    setSearched(false);
    setRepositories([]);
    setFilter('');
    try {
      const result = await searchRepositories(keyword);
      setRepositories(result.items);
      setSearched(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load repositories.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <header>
        <p className="eyebrow">Step 3 · local filtering</p>
        <h1>GitHub Repository Explorer</h1>
      </header>
      <section className="panel" aria-label="Repository search">
        <form onSubmit={handleSearch} noValidate>
          <label>
            Keyword
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} />
          </label>
          <button type="submit" disabled={loading}>{loading ? 'Loading…' : 'Search'}</button>
        </form>
        <label className="filter">
          Filter results by repository name
          <input value={filter} onChange={(event) => setFilter(event.target.value)} />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        {loading && <p className="status" role="status">Loading repositories…</p>}
        {!loading && !searched && !error && <p className="empty">Enter a keyword and click Search.</p>}
        {searched && (repositories.length === 0
          ? <p className="empty">No repositories found.</p>
          : visible.length === 0
            ? <p className="empty">No loaded repositories match the filter.</p>
            : <RepositoryTable repositories={visible} />)}
        <p className="note">Only the first API page is loaded (up to 30 items). Filtering is local.</p>
      </section>
    </main>
  );
}


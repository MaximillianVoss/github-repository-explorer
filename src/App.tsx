import { useState, type SubmitEvent } from 'react';
import { filterRepositories } from './api';
import RepositoryTable from './RepositoryTable';
import { useRepositories } from './useRepositories';

export default function App() {
  const [keyword, setKeyword] = useState('');
  const [filter, setFilter] = useState('');
  const { repositories, loading, error, searched, totalCount, incomplete, search } = useRepositories();
  const visible = filterRepositories(repositories, filter);

  function handleSearch(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    if (keyword.trim()) setFilter('');
    void search(keyword);
  }

  return (
    <main className="page">
      <header>
        <p className="eyebrow">Bonus · custom hook</p>
        <h1>GitHub Repository Explorer</h1>
        <p className="subtitle">Search public repositories, then narrow down the loaded results locally.</p>
      </header>
      <section className="panel" aria-label="Repository search">
        <form onSubmit={handleSearch} noValidate>
          <label>
            Keyword
            <input value={keyword} onChange={(event) => setKeyword(event.target.value)}
              placeholder="For example: react" autoComplete="off" />
          </label>
          <button type="submit" disabled={loading}>{loading ? 'Loading…' : 'Search'}</button>
        </form>
        <label className="filter">
          Filter results by repository name
          <input value={filter} onChange={(event) => setFilter(event.target.value)}
            placeholder="For example: facebook/" />
        </label>
        {error && <p className="error" role="alert">{error}</p>}
        <div aria-live="polite" aria-busy={loading}>
          {loading && <p className="status" role="status">Loading repositories…</p>}
          {!loading && !searched && !error && <p className="empty">Enter a keyword and click Search.</p>}
          {searched && (
            <>
              <p className="status">
                Showing {visible.length} of {repositories.length} loaded repositories.
                GitHub reports {totalCount} total matches.
              </p>
              {incomplete && <p className="note">GitHub returned incomplete results. Try a narrower search.</p>}
              {repositories.length === 0
                ? <p className="empty">No repositories found.</p>
                : visible.length === 0
                  ? <p className="empty">No loaded repositories match the filter.</p>
                  : <RepositoryTable repositories={visible} />}
            </>
          )}
        </div>
        <p className="note">Only the first API page is loaded (up to 30 items). Filtering does not contact GitHub. No API token is needed or stored.</p>
      </section>
    </main>
  );
}


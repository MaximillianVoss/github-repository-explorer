import { useEffect, useState } from 'react';
import { searchRepositories, type Repository } from './api';
import RepositoryTable from './RepositoryTable';

export default function App() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    searchRepositories('react', controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setRepositories(result.items);
      })
      .catch((cause: unknown) => {
        if (!controller.signal.aborted) {
          setError(cause instanceof Error ? cause.message : 'Could not load repositories.');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  return (
    <main className="page">
      <header>
        <p className="eyebrow">Step 1 · fetch on mount</p>
        <h1>GitHub Repository Explorer</h1>
        <p className="subtitle">Fixed keyword: react</p>
      </header>
      <section className="panel" aria-label="Repositories">
        {loading && <p className="status" role="status">Loading repositories…</p>}
        {error && <p className="error" role="alert">{error}</p>}
        {!loading && !error && (repositories.length > 0
          ? <RepositoryTable repositories={repositories} />
          : <p className="empty">No repositories found.</p>)}
        <p className="note">The first API page contains up to 30 repositories.</p>
      </section>
    </main>
  );
}


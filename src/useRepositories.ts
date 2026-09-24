import { useRef, useState } from 'react';
import { EMPTY_KEYWORD, searchRepositories, type Repository } from './api';

export function useRepositories() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [incomplete, setIncomplete] = useState(false);
  const busy = useRef(false);

  async function search(keyword: string) {
    if (busy.current) return;
    if (!keyword.trim()) {
      setError(EMPTY_KEYWORD);
      return;
    }
    busy.current = true;
    setLoading(true);
    setError('');
    setRepositories([]);
    setSearched(false);
    setIncomplete(false);
    try {
      const result = await searchRepositories(keyword);
      setRepositories(result.items);
      setTotalCount(result.total_count);
      setIncomplete(result.incomplete_results);
      setSearched(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load repositories.');
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  return { repositories, loading, error, searched, totalCount, incomplete, search };
}


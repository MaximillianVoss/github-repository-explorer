import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import Step1 from '../stages/step1/src/App';
import Step2 from '../stages/step2/src/App';
import Step3 from '../stages/step3/src/App';
import { EMPTY_KEYWORD, filterRepositories, RATE_LIMIT, searchRepositories } from './api';

const repositories = [
  { id: 1, full_name: 'facebook/react', html_url: 'https://github.com/facebook/react' },
  { id: 2, full_name: 'vitejs/vite', html_url: 'https://github.com/vitejs/vite' },
];
const result = { items: repositories, total_count: 200, incomplete_results: false };
let fetchMock: ReturnType<typeof vi.fn>;

function response(body: unknown, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extraHeaders },
  });
}

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});

describe('Final version with a custom hook', () => {
  it('does not fetch on mount or while typing', () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Keyword'), { target: { value: 'react' } });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('rejects empty and whitespace-only input without a request', async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText('Keyword'), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(EMPTY_KEYWORD);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('encodes the submitted keyword and renders names and clickable URLs', async () => {
    fetchMock.mockResolvedValue(response(result));
    render(<App />);
    fireEvent.change(screen.getByLabelText('Keyword'), { target: { value: ' React Native ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    const link = await screen.findByRole('link', { name: repositories[0]!.html_url });
    expect(link).toHaveAttribute('href', repositories[0]!.html_url);
    expect(screen.getByText('facebook/react')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/search/repositories?q=React%20Native',
      expect.any(Object),
    );
  });

  it('filters only the loaded full_name locally and case-insensitively', async () => {
    fetchMock.mockResolvedValue(response(result));
    render(<App />);
    fireEvent.change(screen.getByLabelText('Keyword'), { target: { value: 'react' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    await screen.findByText('facebook/react');
    fireEvent.change(screen.getByLabelText('Filter results by repository name'), { target: { value: 'FACEBOOK/' } });
    expect(screen.getByText('facebook/react')).toBeInTheDocument();
    expect(screen.queryByText('vitejs/vite')).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fireEvent.change(screen.getByLabelText('Filter results by repository name'), { target: { value: 'zz-no-match' } });
    expect(screen.getByText('No loaded repositories match the filter.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Filter results by repository name'), { target: { value: '' } });
    expect(screen.getByText('vitejs/vite')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('handles an empty search result', async () => {
    fetchMock.mockResolvedValue(response({ items: [], total_count: 0, incomplete_results: false }));
    render(<App />);
    fireEvent.change(screen.getByLabelText('Keyword'), { target: { value: 'nobody-has-this-name' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(await screen.findByText('No repositories found.')).toBeInTheDocument();
  });

  it('reports a network failure and re-enables search', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    render(<App />);
    fireEvent.change(screen.getByLabelText('Keyword'), { target: { value: 'react' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Failed to fetch');
    expect(screen.getByRole('button', { name: 'Search' })).toBeEnabled();
  });

  it.each([429, 403])('reports GitHub rate limit HTTP %s', async (status) => {
    fetchMock.mockResolvedValue(response({ message: 'API rate limit exceeded' }, status));
    render(<App />);
    fireEvent.change(screen.getByLabelText('Keyword'), { target: { value: 'react' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(await screen.findByRole('alert')).toHaveTextContent(RATE_LIMIT);
  });

  it('prevents duplicate searches while a request is pending', async () => {
    let finish!: (value: Response) => void;
    fetchMock.mockReturnValue(new Promise<Response>((resolve) => { finish = resolve; }));
    render(<App />);
    fireEvent.change(screen.getByLabelText('Keyword'), { target: { value: 'react' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(screen.getByRole('button')).toBeDisabled();
    fireEvent.submit(screen.getByRole('button').closest('form')!);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    finish(response(result));
    await waitFor(() => expect(screen.getByRole('button')).toBeEnabled());
  });
});

describe('Standalone stages', () => {
  it('Step 1 fetches the fixed keyword react on mount', async () => {
    fetchMock.mockResolvedValue(response(result));
    render(<Step1 />);
    expect(await screen.findByText('facebook/react')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.github.com/search/repositories?q=react',
      expect.any(Object),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('Step 2 fetches only after Search, not on mount/input', async () => {
    fetchMock.mockResolvedValue(response(result));
    render(<Step2 />);
    fireEvent.change(screen.getByLabelText('Keyword'), { target: { value: 'vite' } });
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    expect(await screen.findByText('vitejs/vite')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('Step 3 filters without another fetch', async () => {
    fetchMock.mockResolvedValue(response(result));
    render(<Step3 />);
    fireEvent.change(screen.getByLabelText('Keyword'), { target: { value: 'react' } });
    expect(fetchMock).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));
    await screen.findByText('facebook/react');
    fireEvent.change(screen.getByLabelText('Filter results by repository name'), { target: { value: 'vite' } });
    expect(screen.queryByText('facebook/react')).not.toBeInTheDocument();
    expect(screen.getByText('vitejs/vite')).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

describe('API and filtering', () => {
  it('handles ordinary HTTP errors separately from rate limits', async () => {
    fetchMock.mockResolvedValue(response({ message: 'Forbidden' }, 403));
    await expect(searchRepositories('react')).rejects.toThrow('HTTP 403');
  });

  it('rejects malformed responses and unsafe links', async () => {
    fetchMock.mockResolvedValue(response({
      ...result, items: [{ id: 1, full_name: 'bad/link', html_url: 'javascript:alert(1)' }],
    }));
    await expect(searchRepositories('react')).rejects.toThrow('invalid repository list');
  });

  it('does not mutate the original array while filtering', () => {
    const filtered = filterRepositories(repositories, ' react ');
    expect(filtered).toEqual([repositories[0]]);
    expect(repositories).toHaveLength(2);
  });
});


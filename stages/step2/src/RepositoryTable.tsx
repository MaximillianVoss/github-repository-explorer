import type { Repository } from './api';

interface Props {
  repositories: Repository[];
}

export default function RepositoryTable({ repositories }: Props) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th scope="col">Full Name</th><th scope="col">URL</th></tr></thead>
        <tbody>
          {repositories.map((repo) => (
            <tr key={repo.id}>
              <td>{repo.full_name}</td>
              <td>
                <a href={repo.html_url} target="_blank" rel="noreferrer">
                  {repo.html_url}
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}


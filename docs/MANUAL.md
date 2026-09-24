# GitHub Repository Explorer — каждый этап от начала до конца

Стек: **React Web + TypeScript + Vite**.

[Краткое условие отдельно](ASSIGNMENT.md) · [Клонирование и запуск на Mac](../README.md)

## 1. Полный список требований

| Этап | Требование | Где готовая версия |
| --- | --- | --- |
| Step 1, 1 балл | При открытии загрузить поиск `react`; показать full_name и кликабельный html_url. | `stages/step1/src` |
| Step 2, 2 балла | Поле Keyword и Search; запрос только по событию; проверка пустого ввода. | `stages/step2/src` |
| Step 3, 2 балла | Поле «Filter results by repository name»; локальный фильтр по full_name без новых запросов. | `stages/step3/src` |
| Bonus | Вынести загрузку в собственный React hook. | Основная папка `src` |

Bonus в условии предлагает **custom hook ИЛИ TanStack Query**. Здесь выбран собственный hook: он позволяет объяснить логику без дополнительной библиотеки.
Ветки Git в этом условии **не предписаны**. Учебные снимки файлов сохранены в папках, а не выдаются за реальные коммиты или ветки.

Маршрут: **запуск проекта → Step 1 → Step 2 → Step 3 → Bonus → тесты → production-сборка → сдача**.

## 2. Подготовка на Mac

Нужен Node.js **24**. Полная установка Git и Node на Mac и команда клонирования — в [README](../README.md).

```bash
node --version
npm --version
```

Если nvm уже установлен:

```bash
nvm install 24
nvm use 24
```

Склонируйте репозиторий по README и перейдите именно в его корень с `package.json`:

```bash
cd "$HOME/Projects/github-repository-explorer"
npm ci
```

В комплект входит lock-файл, поэтому `npm ci` применим сразу. При ручном создании файлов без lock первый раз нужен `npm install`.

Ниже каждую команду запускайте **по очереди из этого же корня**, не из `stages/step1`:

```bash
npm run dev:step1
```

Откройте адрес, напечатанный Vite. Чтобы перейти дальше, остановите сервер Ctrl+C, затем:

```bash
npm run dev:step2
```

И затем аналогично:

```bash
npm run dev:step3
```

Финальная Bonus-версия:

```bash
npm run dev
```

Эти команды не копируют, не удаляют и не перезаписывают `src`.
При желании запускать этапы параллельно задайте разные порты, например `npm run dev:step2 -- --port 5178`.

## 3. Структура и перенос в Classroom

```text
github-repository-explorer/
  package.json
  package-lock.json
  index.html
  tsconfig.json
  vite.config.ts
  src/                    # Финальная Bonus-версия
    App.tsx
    api.ts
    RepositoryTable.tsx
    useRepositories.ts
    main.tsx
    styles.css
    App.test.tsx
    test/setup.ts
  stages/
    step1/index.html
    step1/src/            # Независимый полный src этапа 1
    step2/index.html
    step2/src/            # Независимый полный src этапа 2
    step3/index.html
    step3/src/            # Независимый полный src этапа 3
```

Каждый этап содержит собственные `App.tsx`, `api.ts`, `RepositoryTable.tsx`, `main.tsx`, `styles.css`.
Он не импортирует файлы из другого этапа. Общие только установленные зависимости и настройки сборки в корне.

Для Classroom сохраните свою работу перед заменой. Переносите **содержимое выбранного src в src своего Vite-репозитория**, а не создавайте App.tsx в корне.
Для Bonus добавьте также `useRepositories.ts`. Не удаляйте `.github` и преподавательские проверки. Не смешивайте код React Native с HTML.

Если преподаватель требует Git-историю, сохраняйте изменения последовательными коммитами по этапам. Названия веток и способ сдачи уточняются по правилам Classroom; из предоставленного условия их вывести нельзя.

## 4. Теория перед кодом

- **props** передают данные дочернему компоненту. `RepositoryTable` получает массив через `repositories`.
- **state** хранит ввод, результат загрузки и статус; setter просит React обновить интерфейс.
- **effect** связывает компонент с внешней системой при появлении/исчезновении. Здесь он нужен только для стартовой загрузки Step 1.
- **event handler** реагирует на конкретное действие. В Step 2/3/Bonus это отправка формы кнопкой Search или Enter.
- **custom hook** — функция с именем `use...`, объединяющая React-состояние и поведение для переиспользования. Она не означает автоматический запрос.
- **derived value** — вычисляемое значение. Отфильтрованный массив выводится из результата и строки фильтра; отдельное состояние для него не нужно.

Для формы использован `SubmitEvent<HTMLFormElement>` из установленного набора React-типов.
`event.preventDefault()` предотвращает стандартную перезагрузку страницы браузером.

## 5. Step 1 — фиксированный react и загрузка при открытии

Запуск: `npm run dev:step1`.

### Что сделать

1. Описать тип `Repository`: `id`, `full_name`, `html_url`.
2. Написать `searchRepositories`, которая отправляет запрос и возвращает список.
3. В `App` создать состояния списка, загрузки и ошибки.
4. В `useEffect(..., [])` вызвать `searchRepositories('react')`.
5. Показать таблицу и кликабельные ссылки.

Ответ GitHub — **объект**, а не массив. Список находится в поле `items`.
Поля `total_count` и `incomplete_results` описывают результаты всего серверного поиска.

`[]` означает, что эффект не зависит от вводимого текста. При удалении компонента cleanup вызывает `controller.abort()`, и поздний результат не меняет состояние.
В учебном `main.tsx` нет StrictMode, чтобы его дополнительные проверки разработки не воспринимались как лишний обязательный запрос. После горячего обновления или перезагрузки новый mount и новый запрос нормальны.

### Проверить

Открыть Network и перезагрузить страницу: появится запрос `...?q=react`.
Должны отображаться полные названия и работающие ссылки. Поля поиска на Step 1 ещё нет.

## 6. Step 2 — поиск по пользовательскому событию

Запуск: `npm run dev:step2`.

### Что меняется

1. Удаляется эффект стартового запроса.
2. Добавляется `keyword` и управляемый input: `value` + `onChange`.
3. Добавляется форма с `onSubmit={handleSearch}`.
4. Обработчик проверяет `keyword.trim()`.
5. Только после непустого ввода выполняется `searchRepositories(keyword)`.

При наборе букв меняется только `keyword`. Запрос не привязан к изменению состояния и не запускается эффектом.
`trim()` считает строку из пробелов пустой. `encodeURIComponent` безопасно помещает слова с пробелами и специальными символами в query string.

Кнопка имеет `type="submit"`, поэтому работает и клик, и Enter. Это соответствует требованию использовать обработчик события; `onClick` в условии приведён как пример.

### Проверить

- На открытии нет GitHub-запроса.
- При вводе `React Native` нет запросов.
- После Search — один запрос с закодированным ключевым словом.
- Пустое поле или пробелы — сообщение `Please enter a keyword.`, запрос не отправлен.

## 7. Step 3 — локальный фильтр уже загруженных данных

Запуск: `npm run dev:step3`.

Добавляем `filter` и второе поле с точной подписью из условия.
При каждом отображении вычисляем:

```ts
const visible = filterRepositories(repositories, filter);
```

Внутри функции используется `Array.filter` и `full_name.toLowerCase().includes(...)`.
Это **не API-запрос**: функция работает с массивом в памяти. Приведение к нижнему регистру делает поиск независимым от регистра.
Фильтрация не изменяет исходный массив. Очистка поля снова показывает все загруженные записи.

Разные состояния различаются явно:

- API вернул `items: []` → `No repositories found.`;
- API вернул данные, но локальный фильтр всё исключил → `No loaded repositories match the filter.`;
- HTTP/сеть не сработали → ошибка, а не «ничего не найдено».

### Проверить

Найти `react`, запомнить число запросов в Network, затем ввести `facebook/` в фильтр.
Число запросов не меняется. Очистить фильтр — остальные строки возвращаются.

## 8. Bonus — custom hook

Запуск: `npm run dev`.

Логика загрузки из App перемещена в `useRepositories.ts`.
Hook возвращает:

| Поле | Назначение |
| --- | --- |
| `repositories` | Загруженные записи текущего поиска. |
| `loading` | Выполняется ли запрос. |
| `error` | Сообщение об ошибке. |
| `searched` | Есть ли успешно завершённый поиск, даже с пустым результатом. |
| `totalCount` | Общее число совпадений, указанное GitHub. |
| `incomplete` | Сообщил ли GitHub о неполном результате. |
| `search(keyword)` | Действие, которое вызывается обработчиком формы. |

В hook **нет эффекта запроса**. Он выполняется только через `search`.
В App остаются поля ввода, локальный фильтр и JSX. Разделение уменьшает компонент, но не меняет требование «искать по событию».

`useRef(false)` хранит флаг `busy`. Он меняется сразу и дополнительно защищает от двух почти одновременных вызовов до следующего рендера.
В отличие от state, изменение ref само по себе не перерисовывает страницу; за видимую загрузку отвечает `loading`.

Собственный hook переиспользует **логику**, а не автоматически общее состояние между разными экземплярами компонентов. [React: custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks).

## 9. Карта функций и решений

| Элемент | Зачем |
| --- | --- |
| `searchRepositories` | Проверяет ввод, строит URL, выполняет fetch, проверяет HTTP и JSON. |
| `isRepository` | Убеждается, что запись содержит нужные типы и безопасную HTTPS-ссылку GitHub. |
| `filterRepositories` | Фильтрует загруженный full_name без сети и без изменения массива. |
| `RepositoryTable` | Один способ отрисовать строки и ссылки во всех этапах. |
| `handleSearch` | Реакция на кнопку/Enter; запрещает пустой ввод и повторную загрузку. |
| `useRepositories` | Выделенное состояние и действия поиска в Bonus. |
| `key={repo.id}` | React узнаёт строку по устойчивому API-id, а не по позиции. |
| `target="_blank" rel="noreferrer"` | Открывает репозиторий отдельно и не передаёт referrer. |
| `AbortSignal.timeout(15_000)` | Запрос не держит кнопку заблокированной бесконечно. |
| `unknown` и проверки | Типы TypeScript не заменяют проверку внешнего JSON. |

HTTP 429 и подтверждённый rate-limit HTTP 403 получают отдельное сообщение. Обычный 403 не выдаётся автоматически за лимит.
Автоматических повторов нет: они мешали бы учебному условию и могли бы расходовать лимит.

Показывается первая страница API, до 30 записей; это не обязательно все совпадения GitHub. В Bonus число найденных на сервере и число реально загруженных записей подписаны отдельно.
Пагинация не требовалась. [GitHub Search API](https://docs.github.com/en/rest/search/search#search-repositories).

Токен не нужен для этого учебного публичного поиска. **Не вставляйте токен в React-код или VITE-переменную**: браузерные переменные попадут в клиентскую сборку.

## 10. Проверки и сдача

```bash
npm test
npm run build
npm run build:stages
```

Тесты выполняются без обращений к настоящему GitHub и проверяют все четыре версии.
`build` собирает Bonus, `build:stages` — Step 1, Step 2, Step 3.

Просмотр Bonus production:

```bash
npm run preview
```

Просмотр production этапа 1:

```bash
npm run preview -- stages/step1
```

Для этапов 2/3 замените имя каталога. У всех этапов свои `dist`, поэтому сборки не перезаписывают друг друга.

Ручной чек-лист:

1. Проверить автозагрузку Step 1 и отсутствие автозагрузки на остальных этапах.
2. Убедиться, что ссылки открывают реальные репозитории.
3. Проверить пустой ввод и строку из пробелов.
4. Найти слово с пробелом.
5. После поиска проверить фильтр с другим регистром.
6. Убедиться в отсутствии новых запросов при фильтрации.
7. Проверить «ничего не найдено» отдельно от сетевой ошибки.
8. Для ошибки включить Offline в DevTools, нажать Search, затем выключить Offline.
9. Проверить узкое окно: таблица и форма должны оставаться доступными.
10. Не исчерпывать лимит GitHub специально: 403/429 проверяются моками в автоматических тестах.

Для сдачи передайте выбранный этап или финальную версию так, как требует Classroom. `node_modules` и `dist` в исходники обычно не включают.
Запуск локального проекта не выполняет за вас push в Classroom, создание PR или сдачу преподавателю.

## 11. Частые проблемы

- Стандартный Vite-counter остался: проверьте именно `src/App.tsx` и импорт в `src/main.tsx`.
- `react/jsx-runtime` не найден: выполните `npm ci` в корне проекта, затем перезапустите TS server редактора.
- Поиск идёт на каждую букву: не переносите запрос в `useEffect([keyword])`; используйте обработчик формы.
- Фильтр ищет новые данные в GitHub: он должен вызывать только `filterRepositories`.
- Скрипт запуска «не видит» папку: этот проект можно запустить напрямую через команды выше без универсального sh.
- `npm ci` не видит lock: вы либо в другой папке, либо создали файлы вручную; в последнем случае сначала `npm install`.
- После изменения src в preview старый экран: снова выполните `npm run build`.
- Занятый порт: используйте адрес Vite или задайте `-- --port 5178`.

## 12. Полное содержимое файлов всех этапов

Ниже без сокращений приведены конфигурация, Bonus, автоматические тесты и каждый независимый этап.
Большой сгенерированный `package-lock.json` находится в готовом проекте; вручную его переписывать не нужно.

### `package.json`

```json
{
  "name": "github-explorer",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": {
    "node": ">=22.12.0"
  },
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc --noEmit && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "test": "vitest run",
    "test:watch": "vitest",
    "dev:step1": "vite stages/step1 --config vite.config.ts --host 127.0.0.1",
    "dev:step2": "vite stages/step2 --config vite.config.ts --host 127.0.0.1",
    "dev:step3": "vite stages/step3 --config vite.config.ts --host 127.0.0.1",
    "build:stages": "tsc --noEmit && vite build stages/step1 --config vite.config.ts && vite build stages/step2 --config vite.config.ts && vite build stages/step3 --config vite.config.ts"
  },
  "dependencies": {
    "react": "19.2.7",
    "react-dom": "19.2.7"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "6.9.1",
    "@testing-library/react": "16.3.0",
    "@testing-library/user-event": "14.6.1",
    "@types/node": "24.13.2",
    "@types/react": "19.2.17",
    "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react": "6.0.2",
    "jsdom": "27.4.0",
    "typescript": "6.0.2",
    "vite": "8.1.0",
    "vitest": "4.1.0"
  }
}
```

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": [
      "vite/client",
      "@testing-library/jest-dom",
      "node"
    ]
  },
  "include": [
    "src",
    "stages/*/src",
    "vite.config.ts"
  ]
}
```

### `vite.config.ts`

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    restoreMocks: true,
    clearMocks: true,
  },
});
```

### `index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GitHub Repository Explorer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `.nvmrc`

```text
24
```

### `.gitignore`

```text
node_modules/
dist/
coverage/
.DS_Store
*.log
```

### `src/api.ts`

```ts
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
```

### `src/App.test.tsx`

```tsx
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
```

### `src/App.tsx`

```tsx
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
```

### `src/main.tsx`

```tsx
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element was not found.');
createRoot(root).render(<App />);
```

### `src/RepositoryTable.tsx`

```tsx
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
```

### `src/styles.css`

```css
:root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
  color: #172d3a; background: #eef4f6; font-synthesis: none; text-rendering: optimizeLegibility;
}
* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; }
.page { max-width: 1040px; margin: 0 auto; padding: 48px 24px; }
header { margin-bottom: 28px; }
.eyebrow { text-transform: uppercase; letter-spacing: .12em; color: #39717a; font-size: .8rem; font-weight: 750; }
h1 { font-size: clamp(2rem, 5vw, 3rem); margin: 10px 0; line-height: 1.12; }
.subtitle { color: #58707c; line-height: 1.6; max-width: 65ch; }
.panel { background: white; border: 1px solid #d6e3e7; border-radius: 18px; padding: 24px; }
form { display: flex; gap: 12px; align-items: end; margin-bottom: 22px; }
label { display: flex; flex: 1; flex-direction: column; gap: 8px; font-size: .9rem; font-weight: 650; }
input { min-width: 0; width: 100%; padding: 12px; border: 1px solid #a3b9c3; border-radius: 9px; font: inherit; }
button { padding: 13px 22px; border: 0; border-radius: 9px; font: inherit; font-weight: 700; background: #176275; color: white; cursor: pointer; }
button:hover { background: #104b5a; }
button:disabled { opacity: .6; cursor: wait; }
button:focus-visible, input:focus-visible, a:focus-visible { outline: 3px solid #cb932f; outline-offset: 3px; }
.filter { max-width: 510px; margin-bottom: 20px; }
.table-wrap { overflow-x: auto; border: 1px solid #dbe5e8; border-radius: 10px; }
table { width: 100%; border-collapse: collapse; font-size: .92rem; }
th, td { padding: 14px; text-align: left; vertical-align: top; border-bottom: 1px solid #dbe5e8; overflow-wrap: anywhere; }
th { background: #f1f6f8; color: #365a68; }
td:first-child { width: 36%; }
tr:last-child td { border-bottom: 0; }
a { color: #096980; }
.error { color: #942b36; background: #fff0f2; padding: 14px; border-radius: 9px; }
.status, .empty, .note { color: #58707c; line-height: 1.6; }
.note { font-size: .83rem; }
@media (max-width: 540px) {
  .page { padding: 24px 14px; }
  .panel { padding: 16px; }
  form { flex-direction: column; align-items: stretch; }
  th, td { padding: 10px; }
}
```

### `src/useRepositories.ts`

```ts
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
```

### `src/test/setup.ts`

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
```

### `stages/step1/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GitHub Explorer · Step 1</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `stages/step1/src/api.ts`

```ts
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
```

### `stages/step1/src/App.tsx`

```tsx
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
```

### `stages/step1/src/main.tsx`

```tsx
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element was not found.');
createRoot(root).render(<App />);
```

### `stages/step1/src/RepositoryTable.tsx`

```tsx
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
```

### `stages/step1/src/styles.css`

```css
:root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
  color: #172d3a; background: #eef4f6; font-synthesis: none; text-rendering: optimizeLegibility;
}
* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; }
.page { max-width: 1040px; margin: 0 auto; padding: 48px 24px; }
header { margin-bottom: 28px; }
.eyebrow { text-transform: uppercase; letter-spacing: .12em; color: #39717a; font-size: .8rem; font-weight: 750; }
h1 { font-size: clamp(2rem, 5vw, 3rem); margin: 10px 0; line-height: 1.12; }
.subtitle { color: #58707c; line-height: 1.6; max-width: 65ch; }
.panel { background: white; border: 1px solid #d6e3e7; border-radius: 18px; padding: 24px; }
form { display: flex; gap: 12px; align-items: end; margin-bottom: 22px; }
label { display: flex; flex: 1; flex-direction: column; gap: 8px; font-size: .9rem; font-weight: 650; }
input { min-width: 0; width: 100%; padding: 12px; border: 1px solid #a3b9c3; border-radius: 9px; font: inherit; }
button { padding: 13px 22px; border: 0; border-radius: 9px; font: inherit; font-weight: 700; background: #176275; color: white; cursor: pointer; }
button:hover { background: #104b5a; }
button:disabled { opacity: .6; cursor: wait; }
button:focus-visible, input:focus-visible, a:focus-visible { outline: 3px solid #cb932f; outline-offset: 3px; }
.filter { max-width: 510px; margin-bottom: 20px; }
.table-wrap { overflow-x: auto; border: 1px solid #dbe5e8; border-radius: 10px; }
table { width: 100%; border-collapse: collapse; font-size: .92rem; }
th, td { padding: 14px; text-align: left; vertical-align: top; border-bottom: 1px solid #dbe5e8; overflow-wrap: anywhere; }
th { background: #f1f6f8; color: #365a68; }
td:first-child { width: 36%; }
tr:last-child td { border-bottom: 0; }
a { color: #096980; }
.error { color: #942b36; background: #fff0f2; padding: 14px; border-radius: 9px; }
.status, .empty, .note { color: #58707c; line-height: 1.6; }
.note { font-size: .83rem; }
@media (max-width: 540px) {
  .page { padding: 24px 14px; }
  .panel { padding: 16px; }
  form { flex-direction: column; align-items: stretch; }
  th, td { padding: 10px; }
}
```

### `stages/step2/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GitHub Explorer · Step 2</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `stages/step2/src/api.ts`

```ts
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
```

### `stages/step2/src/App.tsx`

```tsx
import { useState, type SubmitEvent } from 'react';
import { EMPTY_KEYWORD, searchRepositories, type Repository } from './api';
import RepositoryTable from './RepositoryTable';

export default function App() {
  const [keyword, setKeyword] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);

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
        <p className="eyebrow">Step 2 · event-driven search</p>
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
        {error && <p className="error" role="alert">{error}</p>}
        {loading && <p className="status" role="status">Loading repositories…</p>}
        {!loading && !searched && !error && <p className="empty">Enter a keyword and click Search.</p>}
        {searched && (repositories.length === 0
          ? <p className="empty">No repositories found.</p>
          : <RepositoryTable repositories={repositories} />)}
        <p className="note">Only the first API page is loaded (up to 30 items).</p>
      </section>
    </main>
  );
}
```

### `stages/step2/src/main.tsx`

```tsx
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element was not found.');
createRoot(root).render(<App />);
```

### `stages/step2/src/RepositoryTable.tsx`

```tsx
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
```

### `stages/step2/src/styles.css`

```css
:root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
  color: #172d3a; background: #eef4f6; font-synthesis: none; text-rendering: optimizeLegibility;
}
* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; }
.page { max-width: 1040px; margin: 0 auto; padding: 48px 24px; }
header { margin-bottom: 28px; }
.eyebrow { text-transform: uppercase; letter-spacing: .12em; color: #39717a; font-size: .8rem; font-weight: 750; }
h1 { font-size: clamp(2rem, 5vw, 3rem); margin: 10px 0; line-height: 1.12; }
.subtitle { color: #58707c; line-height: 1.6; max-width: 65ch; }
.panel { background: white; border: 1px solid #d6e3e7; border-radius: 18px; padding: 24px; }
form { display: flex; gap: 12px; align-items: end; margin-bottom: 22px; }
label { display: flex; flex: 1; flex-direction: column; gap: 8px; font-size: .9rem; font-weight: 650; }
input { min-width: 0; width: 100%; padding: 12px; border: 1px solid #a3b9c3; border-radius: 9px; font: inherit; }
button { padding: 13px 22px; border: 0; border-radius: 9px; font: inherit; font-weight: 700; background: #176275; color: white; cursor: pointer; }
button:hover { background: #104b5a; }
button:disabled { opacity: .6; cursor: wait; }
button:focus-visible, input:focus-visible, a:focus-visible { outline: 3px solid #cb932f; outline-offset: 3px; }
.filter { max-width: 510px; margin-bottom: 20px; }
.table-wrap { overflow-x: auto; border: 1px solid #dbe5e8; border-radius: 10px; }
table { width: 100%; border-collapse: collapse; font-size: .92rem; }
th, td { padding: 14px; text-align: left; vertical-align: top; border-bottom: 1px solid #dbe5e8; overflow-wrap: anywhere; }
th { background: #f1f6f8; color: #365a68; }
td:first-child { width: 36%; }
tr:last-child td { border-bottom: 0; }
a { color: #096980; }
.error { color: #942b36; background: #fff0f2; padding: 14px; border-radius: 9px; }
.status, .empty, .note { color: #58707c; line-height: 1.6; }
.note { font-size: .83rem; }
@media (max-width: 540px) {
  .page { padding: 24px 14px; }
  .panel { padding: 16px; }
  form { flex-direction: column; align-items: stretch; }
  th, td { padding: 10px; }
}
```

### `stages/step3/index.html`

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>GitHub Explorer · Step 3</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `stages/step3/src/api.ts`

```ts
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
```

### `stages/step3/src/App.tsx`

```tsx
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
```

### `stages/step3/src/main.tsx`

```tsx
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Root element was not found.');
createRoot(root).render(<App />);
```

### `stages/step3/src/RepositoryTable.tsx`

```tsx
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
```

### `stages/step3/src/styles.css`

```css
:root {
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
  color: #172d3a; background: #eef4f6; font-synthesis: none; text-rendering: optimizeLegibility;
}
* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; }
.page { max-width: 1040px; margin: 0 auto; padding: 48px 24px; }
header { margin-bottom: 28px; }
.eyebrow { text-transform: uppercase; letter-spacing: .12em; color: #39717a; font-size: .8rem; font-weight: 750; }
h1 { font-size: clamp(2rem, 5vw, 3rem); margin: 10px 0; line-height: 1.12; }
.subtitle { color: #58707c; line-height: 1.6; max-width: 65ch; }
.panel { background: white; border: 1px solid #d6e3e7; border-radius: 18px; padding: 24px; }
form { display: flex; gap: 12px; align-items: end; margin-bottom: 22px; }
label { display: flex; flex: 1; flex-direction: column; gap: 8px; font-size: .9rem; font-weight: 650; }
input { min-width: 0; width: 100%; padding: 12px; border: 1px solid #a3b9c3; border-radius: 9px; font: inherit; }
button { padding: 13px 22px; border: 0; border-radius: 9px; font: inherit; font-weight: 700; background: #176275; color: white; cursor: pointer; }
button:hover { background: #104b5a; }
button:disabled { opacity: .6; cursor: wait; }
button:focus-visible, input:focus-visible, a:focus-visible { outline: 3px solid #cb932f; outline-offset: 3px; }
.filter { max-width: 510px; margin-bottom: 20px; }
.table-wrap { overflow-x: auto; border: 1px solid #dbe5e8; border-radius: 10px; }
table { width: 100%; border-collapse: collapse; font-size: .92rem; }
th, td { padding: 14px; text-align: left; vertical-align: top; border-bottom: 1px solid #dbe5e8; overflow-wrap: anywhere; }
th { background: #f1f6f8; color: #365a68; }
td:first-child { width: 36%; }
tr:last-child td { border-bottom: 0; }
a { color: #096980; }
.error { color: #942b36; background: #fff0f2; padding: 14px; border-radius: 9px; }
.status, .empty, .note { color: #58707c; line-height: 1.6; }
.note { font-size: .83rem; }
@media (max-width: 540px) {
  .page { padding: 24px 14px; }
  .panel { padding: 16px; }
  form { flex-direction: column; align-items: stretch; }
  th, td { padding: 10px; }
}
```

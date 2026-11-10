# src/AGENTS.md

## Module Context

React 19 + Vite 프론트엔드. `/api/generate`, `/api/config`로 서버와 통신하고 react-live로 생성 코드를 미리보기한다. 서버 API 형태에 의존한다 (`server/AGENTS.md`).

## Tech Stack & Constraints

- `verbatimModuleSyntax`가 켜져 있으므로 타입은 반드시 `import type`으로 가져온다. (`tsconfig.app.json`, 예: `src/hooks/useComponentGenerator.ts:2`)
- `erasableSyntaxOnly`가 켜져 있으므로 enum, namespace, 생성자 parameter property를 쓰지 마라.
- `noUnusedLocals`, `noUnusedParameters`가 켜져 있어 미사용 변수는 빌드가 실패한다.
- 서버 호출은 상대 경로(`/api/...`)만 사용한다. Vite proxy가 3002로 중계하므로 호스트/포트를 하드코딩하지 마라. (`src/hooks/useComponentGenerator.ts:23`, `src/App.tsx:26`)
- 스타일은 CSS 파일 + 변수(`--face`, `--ink`, `--accent` 등, `src/index.css`)로 관리한다. 새 색상은 변수로 추가한다. 폰트는 galmuri.

## Implementation Patterns

- 서버 통신과 상태는 `src/hooks/`의 훅에 두고, 컴포넌트는 props로 받는다. (`useComponentGenerator`)
- 모든 패널은 `Window` 컴포넌트로 감싼다 (`title` 필수, 오류 창은 `role="alert"`). (`src/components/Window.tsx`)
- 버튼은 `btn` 기본 클래스에 `btn--primary`, `btn--danger` 같은 수정자 클래스를 붙인다. (`src/App.css:101-137`)
- 공용 타입은 `src/types/index.ts`에 둔다.

## Testing Strategy

- 명령: `bunx vitest run src` (전체는 루트의 `bun run test`)
- Testing Library + `userEvent`로 사용자 관점 쿼리를 쓴다. 버튼은 `getByRole('button', { name })`처럼 한국어 라벨로 찾는다. (`src/components/PromptInput.test.tsx`)
- 정리는 `src/test/setup.ts`의 `afterEach(cleanup)`이 담당하므로 테스트에서 중복 호출하지 마라.
- 테스트가 있는 곳은 `PromptInput`, `App`(Provider/API 키 저장), `useComponentGenerator`(목록 저장), `usePromptHistory`, `useApiKey`, `utils/storage`다. `ComponentCard`, `CodeView`, `LivePreview`에는 없다. 이 파일들을 수정하면 변경 범위에 맞는 테스트를 함께 추가한다.
- localStorage 키는 `src/utils/storage.ts`의 `STORAGE_KEYS`에만 정의한다. 읽을 때는 `readStorage`로 검증 함수를 함께 넘겨 깨진 값을 기본값으로 대체한다.

## Local Golden Rules

- Don't: API 키를 `sessionStorage`/쿠키/로그에 저장하지 마라. `localStorage`에는 사용자가 "키 기억하기"를 켠 경우에만 `rcg.apiKeys`(provider별 맵)로 저장한다. 그 외에는 `useApiKey` 훅의 React state에만 존재한다. 입력창은 기본 `type="password"`를 유지한다. (`src/hooks/useApiKey.ts`, `src/App.tsx`)
- Do: Provider를 바꾸면 입력된 키가 다른 프로바이더로 전송되지 않도록 비운다. 입력 중인 키는 `useApiKey`가 provider와 짝지어 한 개만 가지므로 이 구조를 깨지 마라. (`src/hooks/useApiKey.ts`)
- Do: 생성 요청은 반드시 `App.handleGenerate`를 거쳐 키 유무를 먼저 검증한다. `ComponentCard`의 재생성도 이 함수를 `onRegenerate`로 전달받는다. 훅의 `generate`를 컴포넌트에서 직접 호출하지 마라. (`src/App.tsx:34-40,172`)
- Do: `Provider` 타입은 `src/types/index.ts:1`과 `server/index.ts:57`에 중복 정의되어 있다. 프로바이더를 추가하면 두 곳, `PROVIDER_CONFIG`(`src/App.tsx:9-12`)까지 함께 수정한다.
- Do: 새 에러 표시는 훅의 `error` 상태 한 곳으로 모은다. 서버의 `{ error }` 메시지를 그대로 보여주므로 UI에서 문구를 덮어쓰지 마라. (`src/hooks/useComponentGenerator.ts:31-33,43-45`)
- Do: "새로고침"은 `LivePreview`의 `key`를 바꿔 리마운트하는 방식이다. 서버 재요청으로 바꾸지 마라. 재요청은 "재생성"의 역할이다. (`src/components/ComponentCard.tsx:233,271`)
- Don't: `LivePreview`에서 `noInline`을 제거하지 마라. 생성 코드는 `render()` 호출 방식으로 작성된다. (`src/components/LivePreview.tsx:70`)

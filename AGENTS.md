# AGENTS.md

## Operational Commands

- 패키지 매니저는 `bun` 고정. npm/yarn/pnpm 사용 금지 (`bun.lock` 사용).
- 개발 서버(API + Vite 동시): `bun run dev`
- API 서버만: `bun run server` (Bun 런타임 필수, 포트 3002)
- 테스트: `bun run test` (vitest, jsdom). `bun test`는 Bun 내장 러너를 호출하므로 쓰지 않는다.
- 단일 파일 테스트: `bunx vitest run server/generator.test.ts`
- 린트: `bun run lint`
- 빌드/타입체크: `bun run build` (`tsc -b && vite build`)
- 작업 완료 전 `bun run lint`, `bun run test`, `bun run build`를 모두 통과시킨다.

## Golden Rules

### Immutable

- API 키를 클라이언트 응답으로 내려보내지 마라. `/api/config`는 키 유무(boolean)만 반환한다. (`server/index.ts:147-157`)
- `.env`는 커밋하지 마라. 키 이름 추가 시 `.env.example`에 빈 값으로만 추가한다. (`.gitignore`, `.env.example`)
- 미리보기는 react-live `noInline`으로 실행되므로 생성 코드에 `render(<Component />)` 호출이 반드시 있어야 한다. (`src/components/LivePreview.tsx:70`, `server/generator.ts:16-24`)

### Do's & Don'ts

- Do: 포트를 바꾸면 `server/index.ts:139`의 `port: 3002`와 `vite.config.ts`의 proxy target을 함께 수정한다. 한쪽만 바꾸면 `/api` 호출이 깨진다.
- Do: AI 응답 후처리는 `server/generator.ts`의 순수 함수에 두고 테스트를 함께 추가한다. `server/index.ts`는 `Bun.serve`를 즉시 실행하므로 import 기반 테스트가 불가능하다.
- Do: 새 서버 응답에는 `CORS_HEADERS`를 빠짐없이 붙인다. 모든 `Response.json` 호출이 이를 전달한다. (`server/index.ts:51-55`)
- Don't: 시스템 프롬프트(`SYSTEM_PROMPT`)에서 "import 금지", "TypeScript 문법 금지", "코드펜스 금지" 규칙을 완화하지 마라. react-live 스코프에는 React 전역만 있고 TS를 파싱하지 않는다. (`server/index.ts:7-20`)
- Don't: `server/generator.ts`의 `stripCodeFences`/`ensureRenderCall`을 "프롬프트가 이미 막는다"는 이유로 제거하지 마라. 프롬프트 지시와 후처리가 같은 위험을 이중으로 방어한다. (`server/index.ts:11,16` / `server/generator.ts:4-24`)
- Don't: Anthropic 호출에 Google식 폴백 로직이 없다는 점을 버그로 단정해 임의로 맞추지 마라. 폴백(`withModelFallback`)과 `MAX_TOKENS` 감지는 Google 경로에만 있다. 변경이 필요하면 사용자에게 먼저 확인한다. (`server/index.ts:5,123,135` vs `68-96`)
- Don't: 에러 분류를 위해 `message.includes('503')`, `includes('429')` 문자열 매칭에 의존하는 현 구조를 깨는 에러 메시지 변경을 하지 마라. `callAnthropic`/`callGoogleModel`의 `API error: ${status}` 형식이 핸들러와 결합되어 있다. (`server/index.ts:85,112,194-206`)
- Don't: Google API 키가 URL 쿼리에 포함되므로 해당 URL을 로그/에러 메시지에 출력하지 마라. (`server/index.ts:99`)

## Project Context

- 프롬프트로 React 컴포넌트를 생성하고 실시간 미리보기와 코드를 보여주는 도구.
- Stack: React 19, TypeScript, Vite, react-live, Bun(API 프록시), Vitest, Testing Library, ESLint.
- 설치/실행 개요와 기능 설명은 `README.md` 참조.

## Standards & References

- 소스 주석과 사용자 노출 문자열은 한국어로 작성한다 (기존 코드 관례).
- 커밋 메시지: `<type>: <한국어 요약>` (type: feat, fix, refactor, chore). 본문은 "왜" 중심. 상세 절차는 `.claude/skills/commit/SKILL.md`.
- 기본 브랜치에서 직접 커밋하지 않고 새 브랜치를 만든다.
- Maintenance Policy: 이 파일의 규칙과 실제 코드 사이에 괴리를 발견하면 임의로 넘어가지 말고 AGENTS.md 업데이트를 사용자에게 제안한다.

## Context Map

- **[서버 수정 (Bun API, 프롬프트, 폴백)](./server/AGENTS.md)** — `server/` 하위 파일 작업 시.
- **[프론트엔드 수정 (React UI, 훅, 테스트)](./src/AGENTS.md)** — `src/` 하위 파일 작업 시.

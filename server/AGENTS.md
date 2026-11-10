# server/AGENTS.md

## Module Context

Bun 런타임에서 실행되는 AI API 프록시. Vite 개발 서버의 `/api` 요청을 포트 3002에서 받아 Anthropic/Google API로 중계한다.

## Tech Stack & Constraints

- 런타임은 Bun (`Bun.serve`, `process.env`). 외부 SDK 없이 전역 `fetch`로 직접 호출한다. SDK 의존성을 추가하지 마라.
- 테스트는 vitest로 실행한다 (`vite.config.ts`의 `server/**/*.test.ts`). Bun 전용 API를 쓰는 코드는 테스트 대상에 import하지 마라.

## Implementation Patterns

- 순수 로직(`generator.ts`, `fallback.ts`)과 부수효과(`index.ts`)를 분리한다. 새 로직은 순수 함수로 만들어 `*.test.ts`를 옆에 둔다.
- 새 프로바이더 추가 시 `Provider` 타입, `ENV_KEYS`, `resolveApiKey` 경로, `/api/config`의 `envKeys`, `/api/generate` 분기를 모두 갱신한다. (`server/index.ts:57-62,147-157,183-186`)
- Google 모델 우선순위는 `GOOGLE_MODELS` 배열 순서이며 앞 모델 실패 시 다음 모델로 폴백한다. (`server/index.ts:5`)

## Testing Strategy

- `bunx vitest run server`
- 폴백은 `attempt` 콜백을 mock하여 순서/마지막 에러 전파를 검증한다. (`server/fallback.test.ts`)
- 후처리 테스트는 코드펜스 제거와 `render` 자동 주입 케이스를 다룬다. (`server/generator.test.ts`)
- `server/index.ts`(핸들러, 외부 API 호출)에는 테스트가 없다. 변경 시 `bun run server` 후 `curl`로 `/api/config`, `/api/generate`를 수동 확인한다.

## Local Golden Rules

- Do: 서버가 반환하는 에러 JSON은 `{ error: string }` 형태를 유지한다. 프론트가 `data.error`를 그대로 표시한다. (`src/hooks/useComponentGenerator.ts:32`)
- Do: 요청 본문의 `apiKey`가 `.env` 키보다 우선한다 (`clientKey || ENV_KEYS[provider]`). 이 우선순위를 바꾸지 마라. (`server/index.ts:65`)
- Don't: 환경변수 키 값 자체를 응답, 로그, 에러 메시지에 포함하지 마라.
- Don't: `withModelFallback`에서 에러를 삼키지 마라. 모두 실패하면 마지막 에러를 던져야 핸들러가 503/429를 분류할 수 있다. (`server/fallback.ts:7-19`)

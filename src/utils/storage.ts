/** 앱이 localStorage에 쓰는 키 목록. API 키는 사용자가 '키 기억하기'를 켠 경우에만 저장한다. */
export const STORAGE_KEYS = {
  provider: 'rcg.provider',
  promptHistory: 'rcg.promptHistory',
  components: 'rcg.components',
  rememberApiKey: 'rcg.rememberApiKey',
  apiKeys: 'rcg.apiKeys',
} as const;

/** localStorage에서 JSON 값을 읽는다. 없거나 깨졌거나 검증에 실패하면 기본값을 반환한다. */
export function readStorage<T>(
  key: string,
  fallback: T,
  isValid?: (value: unknown) => value is T,
): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;

    const parsed: unknown = JSON.parse(raw);
    if (isValid && !isValid(parsed)) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

/** 값을 JSON으로 localStorage에 저장한다. 용량 초과나 저장 차단 시 조용히 무시한다. */
export function writeStorage(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장에 실패해도 앱 동작은 계속되어야 하므로 무시한다.
  }
}

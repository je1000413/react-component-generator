import { useState } from 'react';
import type { Provider } from '../types';
import { readStorage, writeStorage, STORAGE_KEYS } from '../utils/storage';

type ApiKeyMap = Partial<Record<Provider, string>>;

function isBoolean(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

function isApiKeyMap(value: unknown): value is ApiKeyMap {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => typeof item === 'string')
  );
}

function readApiKeyMap(): ApiKeyMap {
  return readStorage<ApiKeyMap>(STORAGE_KEYS.apiKeys, {}, isApiKeyMap);
}

// 입력 중인 키는 한 번에 하나의 provider 것만 가진다. provider를 바꾸면 자연스럽게 비워진다.
export function useApiKey(provider: Provider) {
  const [remember, setRememberState] = useState(() =>
    readStorage(STORAGE_KEYS.rememberApiKey, false, isBoolean),
  );
  const [draft, setDraft] = useState<{ provider: Provider; value: string } | null>(null);

  const savedKey = remember ? (readApiKeyMap()[provider] ?? '') : '';
  const apiKey = draft?.provider === provider ? draft.value : savedKey;

  const setApiKey = (value: string) => {
    setDraft({ provider, value });
    if (remember) {
      writeStorage(STORAGE_KEYS.apiKeys, { ...readApiKeyMap(), [provider]: value });
    }
  };

  const setRemember = (value: boolean) => {
    setRememberState(value);
    writeStorage(STORAGE_KEYS.rememberApiKey, value);
    if (value) {
      writeStorage(STORAGE_KEYS.apiKeys, { ...readApiKeyMap(), [provider]: apiKey });
    } else {
      // 끄면 저장된 키만 지우고, 지금 입력된 키는 이번 세션 동안 유지한다.
      writeStorage(STORAGE_KEYS.apiKeys, {});
      setDraft({ provider, value: apiKey });
    }
  };

  return { apiKey, setApiKey, remember, setRemember };
}

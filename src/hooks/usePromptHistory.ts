import { useState, useCallback, useEffect } from 'react';
import { readStorage, writeStorage, STORAGE_KEYS } from '../utils/storage';

export const PROMPT_HISTORY_LIMIT = 20;

function isStringList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

export function usePromptHistory() {
  const [history, setHistory] = useState<string[]>(() =>
    readStorage<string[]>(STORAGE_KEYS.promptHistory, [], isStringList),
  );

  useEffect(() => {
    writeStorage(STORAGE_KEYS.promptHistory, history);
  }, [history]);

  // 같은 프롬프트는 중복 없이 맨 앞으로 옮기고, 최대 개수를 넘는 오래된 항목은 버린다.
  const addPrompt = useCallback((prompt: string) => {
    setHistory((prev) => [prompt, ...prev.filter((item) => item !== prompt)].slice(0, PROMPT_HISTORY_LIMIT));
  }, []);

  return { history, addPrompt };
}

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePromptHistory, PROMPT_HISTORY_LIMIT } from './usePromptHistory';
import { STORAGE_KEYS } from '../utils/storage';

describe('usePromptHistory', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('새 프롬프트를 목록 맨 앞에 추가한다', () => {
    const { result } = renderHook(() => usePromptHistory());

    act(() => result.current.addPrompt('첫 번째'));
    act(() => result.current.addPrompt('두 번째'));

    expect(result.current.history).toEqual(['두 번째', '첫 번째']);
  });

  it('같은 프롬프트를 다시 쓰면 중복 없이 맨 앞으로 옮긴다', () => {
    const { result } = renderHook(() => usePromptHistory());

    act(() => result.current.addPrompt('A'));
    act(() => result.current.addPrompt('B'));
    act(() => result.current.addPrompt('A'));

    expect(result.current.history).toEqual(['A', 'B']);
  });

  it('최대 개수를 넘으면 가장 오래된 항목을 버린다', () => {
    const { result } = renderHook(() => usePromptHistory());

    act(() => {
      for (let i = 0; i < PROMPT_HISTORY_LIMIT + 1; i++) {
        result.current.addPrompt(`프롬프트 ${i}`);
      }
    });

    expect(result.current.history).toHaveLength(PROMPT_HISTORY_LIMIT);
    expect(result.current.history[0]).toBe(`프롬프트 ${PROMPT_HISTORY_LIMIT}`);
    expect(result.current.history).not.toContain('프롬프트 0');
  });

  it('새로고침 후 저장된 히스토리를 복원한다', () => {
    window.localStorage.setItem(STORAGE_KEYS.promptHistory, JSON.stringify(['저장됨']));

    const { result } = renderHook(() => usePromptHistory());

    expect(result.current.history).toEqual(['저장됨']);
  });

  it('추가된 히스토리를 저장소에 기록한다', () => {
    const { result } = renderHook(() => usePromptHistory());

    act(() => result.current.addPrompt('기록'));

    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.promptHistory) ?? 'null')).toEqual([
      '기록',
    ]);
  });
});

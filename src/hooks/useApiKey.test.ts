import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApiKey } from './useApiKey';
import { STORAGE_KEYS } from '../utils/storage';

describe('useApiKey', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('기본값은 키 기억하기가 꺼져 있다', () => {
    const { result } = renderHook(() => useApiKey('google'));

    expect(result.current.remember).toBe(false);
  });

  it('키 기억하기가 꺼져 있으면 입력한 키를 저장소에 쓰지 않는다', () => {
    const { result } = renderHook(() => useApiKey('google'));

    act(() => result.current.setApiKey('AIza-secret'));

    expect(result.current.apiKey).toBe('AIza-secret');
    expect(window.localStorage.getItem(STORAGE_KEYS.apiKeys)).toBeNull();
  });

  it('키 기억하기가 켜져 있으면 provider별로 키를 저장한다', () => {
    const { result } = renderHook(() => useApiKey('anthropic'));

    act(() => result.current.setRemember(true));
    act(() => result.current.setApiKey('sk-ant-123'));

    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.apiKeys) ?? 'null')).toEqual({
      anthropic: 'sk-ant-123',
    });
  });

  it('새로고침 후 기억하기 설정과 현재 provider의 키를 복원한다', () => {
    window.localStorage.setItem(STORAGE_KEYS.rememberApiKey, JSON.stringify(true));
    window.localStorage.setItem(
      STORAGE_KEYS.apiKeys,
      JSON.stringify({ anthropic: 'sk-ant-1', google: 'AIza-2' }),
    );

    const { result } = renderHook(() => useApiKey('google'));

    expect(result.current.remember).toBe(true);
    expect(result.current.apiKey).toBe('AIza-2');
  });

  it('provider를 바꾸면 기억하지 않는 키는 비워진다', () => {
    const { result, rerender } = renderHook(({ provider }) => useApiKey(provider), {
      initialProps: { provider: 'google' as 'google' | 'anthropic' },
    });
    act(() => result.current.setApiKey('AIza-temp'));

    rerender({ provider: 'anthropic' });

    expect(result.current.apiKey).toBe('');
  });

  it('키 기억하기를 끄면 저장된 키를 삭제한다', () => {
    window.localStorage.setItem(STORAGE_KEYS.rememberApiKey, JSON.stringify(true));
    window.localStorage.setItem(STORAGE_KEYS.apiKeys, JSON.stringify({ google: 'AIza-2' }));
    const { result } = renderHook(() => useApiKey('google'));

    act(() => result.current.setRemember(false));

    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.apiKeys) ?? 'null')).toEqual({});
    expect(result.current.apiKey).toBe('AIza-2');
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useComponentGenerator } from './useComponentGenerator';
import { STORAGE_KEYS } from '../utils/storage';

const savedComponents = [
  {
    id: 'saved-1',
    prompt: 'KPI 카드',
    code: 'render(<div />)',
    createdAt: '2026-11-10T01:00:00.000Z',
  },
];

describe('useComponentGenerator 저장', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('새로고침 후 저장된 컴포넌트를 복원하고 createdAt을 Date로 되돌린다', () => {
    window.localStorage.setItem(STORAGE_KEYS.components, JSON.stringify(savedComponents));

    const { result } = renderHook(() => useComponentGenerator());

    expect(result.current.components).toHaveLength(1);
    expect(result.current.components[0].prompt).toBe('KPI 카드');
    expect(result.current.components[0].createdAt).toBeInstanceOf(Date);
  });

  it('컴포넌트를 제거하면 저장소에도 반영한다', () => {
    window.localStorage.setItem(STORAGE_KEYS.components, JSON.stringify(savedComponents));
    const { result } = renderHook(() => useComponentGenerator());

    act(() => result.current.removeComponent('saved-1'));

    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEYS.components) ?? 'null')).toEqual([]);
  });

  it('저장된 데이터가 형식에 맞지 않으면 빈 목록으로 시작한다', () => {
    window.localStorage.setItem(STORAGE_KEYS.components, JSON.stringify([{ foo: 1 }]));

    const { result } = renderHook(() => useComponentGenerator());

    expect(result.current.components).toEqual([]);
  });
});

import { describe, it, expect, beforeEach } from 'vitest';
import { readStorage, writeStorage } from './storage';

describe('storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('저장된 값이 없으면 기본값을 반환한다', () => {
    expect(readStorage('missing', ['기본'])).toEqual(['기본']);
  });

  it('쓴 값을 JSON으로 저장했다가 그대로 읽는다', () => {
    writeStorage('key', { a: 1 });
    expect(readStorage('key', null)).toEqual({ a: 1 });
  });

  it('저장된 JSON이 깨져 있으면 기본값을 반환한다', () => {
    window.localStorage.setItem('broken', '{not json');
    expect(readStorage('broken', 'fallback')).toBe('fallback');
  });

  it('검증 함수가 거부한 값이면 기본값을 반환한다', () => {
    writeStorage('num', 'text');
    const isNumber = (v: unknown): v is number => typeof v === 'number';
    expect(readStorage('num', 0, isNumber)).toBe(0);
  });
});

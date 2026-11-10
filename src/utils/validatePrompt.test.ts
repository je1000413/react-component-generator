import { describe, it, expect } from 'vitest';
import { PROMPT_MAX_LENGTH, validatePromptLength } from './validatePrompt';

describe('validatePromptLength', () => {
  it('최대 길이는 500자이다', () => {
    expect(PROMPT_MAX_LENGTH).toBe(500);
  });

  it('500자 이하이면 유효하다', () => {
    expect(validatePromptLength('a'.repeat(500))).toEqual({ valid: true, length: 500 });
  });

  it('501자 이상이면 유효하지 않다', () => {
    expect(validatePromptLength('a'.repeat(501))).toEqual({ valid: false, length: 501 });
  });

  it('앞뒤 공백은 길이에 포함하지 않는다', () => {
    expect(validatePromptLength(`  ${'a'.repeat(500)}  `)).toEqual({ valid: true, length: 500 });
  });

  it('빈 문자열도 길이 검증은 통과한다', () => {
    expect(validatePromptLength('')).toEqual({ valid: true, length: 0 });
  });
});

export const PROMPT_MAX_LENGTH = 500;

interface PromptLengthResult {
  valid: boolean;
  length: number;
}

/** 프롬프트 길이(앞뒤 공백 제외)가 최대 길이 이하인지 검증한다. */
export function validatePromptLength(prompt: string): PromptLengthResult {
  const length = prompt.trim().length;
  return { valid: length <= PROMPT_MAX_LENGTH, length };
}

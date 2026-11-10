import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { STORAGE_KEYS } from './utils/storage';

describe('App Provider 저장', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          json: () => Promise.resolve({ envKeys: { anthropic: false, google: false } }),
        }),
      ),
    );
  });

  it('선택한 Provider를 저장소에 기록한다', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.selectOptions(screen.getByLabelText('Provider'), 'anthropic');

    expect(window.localStorage.getItem(STORAGE_KEYS.provider)).toBe(JSON.stringify('anthropic'));
  });

  it('새로고침 후 저장된 Provider를 선택 상태로 복원한다', () => {
    window.localStorage.setItem(STORAGE_KEYS.provider, JSON.stringify('anthropic'));

    render(<App />);

    expect(screen.getByLabelText('Provider')).toHaveValue('anthropic');
  });

  it('키 기억하기를 켜지 않으면 API 키를 저장소에 쓰지 않는다', async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('API Key'), 'AIza-secret');

    expect(window.localStorage.getItem(STORAGE_KEYS.apiKeys)).toBeNull();
    expect(screen.getByRole('checkbox', { name: '키 기억하기' })).not.toBeChecked();
  });

  it('키 기억하기를 켜면 입력한 API 키를 저장하고 새로고침 후 복원한다', async () => {
    const user = userEvent.setup();
    const { unmount } = render(<App />);

    await user.click(screen.getByRole('checkbox', { name: '키 기억하기' }));
    await user.type(screen.getByLabelText('API Key'), 'AIza-kept');
    unmount();

    render(<App />);

    expect(screen.getByLabelText('API Key')).toHaveValue('AIza-kept');
    expect(screen.getByRole('checkbox', { name: '키 기억하기' })).toBeChecked();
  });

  it('저장된 값이 올바른 Provider가 아니면 기본값 google을 쓴다', () => {
    window.localStorage.setItem(STORAGE_KEYS.provider, JSON.stringify('openai'));

    render(<App />);

    expect(screen.getByLabelText('Provider')).toHaveValue('google');
  });
});

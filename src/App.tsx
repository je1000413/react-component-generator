import { useState, useEffect } from 'react';
import { PromptInput } from './components/PromptInput';
import { ComponentCard } from './components/ComponentCard';
import { Window } from './components/Window';
import { useComponentGenerator } from './hooks/useComponentGenerator';
import type { Provider } from './types';
import './App.css';

const PROVIDER_CONFIG = {
  anthropic: { label: 'Anthropic', placeholder: 'sk-ant-...' },
  google: { label: 'Google', placeholder: 'AIza...' },
} as const;

function App() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [provider, setProvider] = useState<Provider>('google');
  const [envKeys, setEnvKeys] = useState<Record<Provider, boolean>>({
    anthropic: false,
    google: false,
  });
  const { components, isLoading, error, generate, removeComponent, clearAll } =
    useComponentGenerator();

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setEnvKeys(data.envKeys))
      .catch(() => {});
  }, []);

  const hasEnvKey = envKeys[provider];

  const handleGenerate = (prompt: string) => {
    if (!apiKey.trim() && !hasEnvKey) {
      alert(`${PROVIDER_CONFIG[provider].label} API 키를 입력하거나 .env에 설정해주세요.`);
      return;
    }
    generate(prompt, apiKey || undefined, provider);
  };

  const handleProviderChange = (newProvider: Provider) => {
    setProvider(newProvider);
    setApiKey('');
  };

  const activeProvider = PROVIDER_CONFIG[provider].label;
  const hasKey = hasEnvKey || apiKey.trim().length > 0;

  return (
    <div className="app">
      <div className="desktop">
        <header className="app-header">
          <h1>프롬프트로 만드는 UI 워크벤치</h1>
          <p>만들고 싶은 화면을 문장으로 적으면, React 컴포넌트가 창으로 열립니다.</p>
        </header>

        <main className="workspace">
          <Window title="무엇을 만들까요?" className="composer-window">
            <PromptInput onGenerate={handleGenerate} isLoading={isLoading} />
          </Window>

          <Window title="실행 설정" className="settings-window">
            <div className="field">
              <label htmlFor="provider">Provider</label>
              <select
                id="provider"
                value={provider}
                onChange={(e) => handleProviderChange(e.target.value as Provider)}
              >
                {Object.entries(PROVIDER_CONFIG).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="api-key">API Key</label>
              <div className="api-key-field">
                <input
                  id="api-key"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder={
                    hasEnvKey
                      ? '서버 키 사용 중 (직접 입력으로 덮어쓰기 가능)'
                      : PROVIDER_CONFIG[provider].placeholder
                  }
                />
                <button
                  className="btn"
                  onClick={() => setShowKey(!showKey)}
                  type="button"
                  aria-pressed={showKey}
                >
                  {showKey ? '숨기기' : '보기'}
                </button>
              </div>
              <p className={`key-status ${hasEnvKey ? 'key-status--ready' : ''}`}>
                {hasEnvKey
                  ? '.env 키가 연결되어 있습니다.'
                  : '직접 입력하거나 서버 환경변수를 설정하세요.'}
              </p>
            </div>
          </Window>
        </main>

        {error && (
          <Window title="오류" className="error-window" role="alert">
            <p className="error-message">
              <span className="error-icon" aria-hidden="true">
                !
              </span>
              {error}
            </p>
          </Window>
        )}

        <section className="results-section" aria-label="생성 결과">
          {components.length > 0 && (
            <div className="results-header">
              <p>
                열린 창 <strong>{components.length}</strong>개
              </p>
              <button className="btn btn--danger" onClick={clearAll}>
                전체 삭제
              </button>
            </div>
          )}

          {components.length === 0 && !isLoading && (
            <Window title="생성된 컴포넌트" className="empty-window-box">
              <div className="empty-state">
                <div className="empty-preview" aria-hidden="true">
                  <div className="empty-bar" />
                  <div className="empty-canvas">
                    <div className="empty-card empty-card--primary" />
                    <div className="empty-card" />
                    <div className="empty-card empty-card--wide" />
                  </div>
                </div>
                <div className="empty-copy">
                  <h3>새 컴포넌트를 생성해보세요.</h3>
                  <p>
                    위 입력창에 만들고 싶은 UI를 적고 <strong>컴포넌트 생성</strong>을 누르세요.
                    결과는 이곳에 창으로 쌓입니다.
                  </p>
                </div>
              </div>
            </Window>
          )}

          {isLoading && (
            <Window title="생성 중" className="loading-window">
              <div className="loading-card" role="status">
                <p>컴포넌트를 생성하고 있습니다...</p>
                <div className="progress" aria-hidden="true">
                  <div className="progress-chunks" />
                </div>
              </div>
            </Window>
          )}

          <div className="results-grid">
            {components.map((component) => (
              <ComponentCard
                key={component.id}
                component={component}
                onRemove={removeComponent}
                onRegenerate={handleGenerate}
                isLoading={isLoading}
              />
            ))}
          </div>
        </section>
      </div>

      <footer className="taskbar">
        <div className="taskbar-brand">
          <span className="brand-mark" aria-hidden="true">
            RC
          </span>
          컴포넌트 생성기
        </div>
        <div className="taskbar-cell">
          Provider <strong>{activeProvider}</strong>
        </div>
        <div className="taskbar-cell taskbar-cell--key">
          <span className={`led ${hasKey ? 'led--on' : ''}`} aria-hidden="true" />
          {hasKey ? '키 준비됨' : '키 필요'}
        </div>
        <div className="taskbar-cell taskbar-cell--count">
          컴포넌트 <strong>{components.length}</strong>개
        </div>
      </footer>
    </div>
  );
}

export default App;

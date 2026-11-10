---
name: create-pr
description: |
  현재 브랜치의 커밋을 분석해 GitHub Pull Request를 생성한다.
  "/create-pr", "PR 생성", "PR 만들어줘", "create PR" 같은 요청에 활성화한다.
  인자 없이 실행하면 한국어 템플릿을, 인자로 `en` 또는 `영어`가 오면 영어 템플릿을 쓴다.
context: fork
allowed-tools: Read Glob Grep Bash
---

# Create PR

현재 브랜치의 변경을 검증하고 PR을 연다. 본문 템플릿은 `references/pr-template.md`를 따른다.

## 절차

### 1. 사전 점검

```bash
git rev-parse --is-inside-work-tree
git branch --show-current
git status --short
gh repo view --json defaultBranchRef -q .defaultBranchRef.name
```

중단하고 사용자에게 알리는 경우:
- git 저장소가 아니거나 현재 브랜치가 없는 상태(detached HEAD)다.
- 현재 브랜치가 기본 브랜치(보통 `main`)다. 새 브랜치를 만든 뒤 다시 실행하도록 안내한다.
- 커밋되지 않은 변경(`git status --short` 출력)이 있다. PR에는 커밋된 내용만 들어가므로 `/commit`을 먼저 실행하도록 안내한다.

### 2. 중복 PR 확인

```bash
gh pr list --head <현재 브랜치> --state open --json url -q '.[].url'
```

이미 열린 PR이 있으면 그 URL을 보고하고 종료한다. 새로 만들지 않는다.

### 3. 변경 내용 수집

```bash
git fetch origin <기본 브랜치>
git log --oneline origin/<기본 브랜치>..HEAD
git diff --stat origin/<기본 브랜치>...HEAD
git diff origin/<기본 브랜치>...HEAD
```

- 변경 파일이 많으면 `--stat`으로 전체 흐름을 잡고, 핵심 파일만 `git diff -- <path>`로 읽는다.
- 커밋 메시지와 diff를 함께 보고 "무엇을, 왜" 바꿨는지 정리한다.
- 커밋이 없으면(기본 브랜치와 차이가 없음) 종료하고 알린다.

### 4. 검증

AGENTS.md 규칙에 따라 PR 생성 전에 아래 명령을 실행하고 결과를 기록한다.

```bash
bun run lint
bun run test
bun run build
```

- 하나라도 실패하면 PR을 만들지 않고 실패 로그 요약을 보고한다.
- 검증 결과는 템플릿의 검증 항목에 실제 통과 여부로 채운다. 실행하지 않은 항목을 체크하지 않는다.

### 5. 제목과 본문 작성

- 제목: `<type>: <한국어 요약>` 형식을 쓴다. type은 `feat`, `fix`, `refactor`, `chore` 중 하나다. 커밋이 하나면 그 커밋 제목을 그대로 쓴다.
- 본문: `references/pr-template.md`에서 언어에 맞는 템플릿을 읽어 채운다.
  - 인자가 없으면 `references/pr-template.md`(한국어)를 쓴다.
  - 인자가 `en` 또는 `영어`이면 `references/pr-template.en.md`(영어)를 쓴다.
- 템플릿의 `<!-- -->` 주석은 본문에 남기지 않는다. 해당 사항이 없는 섹션은 "없음" 또는 생략한다.
- 본문에 실제 사용자 이름이나 `@name` 형태의 멘션을 쓰지 않는다. 역할이나 코드 표기는 백틱으로 감싼다.
- 본문에 API 키, 토큰, `.env` 내용을 넣지 않는다.

### 6. 브랜치 push와 PR 생성

upstream이 없거나 로컬 커밋이 원격보다 앞서 있으면 브랜치를 push한다. force push는 쓰지 않는다.

```bash
git push -u origin HEAD
```

PR을 생성한다. 본문은 HEREDOC으로 전달해 줄바꿈과 특수문자가 깨지지 않게 한다.

```bash
gh pr create --base <기본 브랜치> --head <현재 브랜치> --title "<제목>" --body "$(cat <<'EOF'
<채워진 본문>
EOF
)"
```

### 7. 결과 보고

생성된 PR URL, 제목, 대상 브랜치(base ← head), 검증 결과를 사용자에게 보고한다.

## 하지 않는 것

- 파일을 수정하거나 새 커밋을 만들지 않는다. 변경이 필요하면 `/commit`을 안내한다.
- force push, `--no-verify`, 기본 브랜치로의 직접 push는 쓰지 않는다.
- 검증이 실패했는데 PR을 강행하지 않는다.
- 이미 열린 PR이 있으면 중복으로 만들지 않는다.
- 사용자가 요청하지 않은 draft/reviewer/label 옵션은 임의로 추가하지 않는다.

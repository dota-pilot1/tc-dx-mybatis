# Tauri 앱 릴리즈 배포 가이드

이 문서는 `tc-dx-mybatis` Tauri 데스크톱 앱을 GitHub Actions로 macOS와 Windows 설치 파일 및 자동 업데이트 파일까지 배포하는 절차를 정리한 문서입니다.

## 1. 사전 조건

- GitHub 저장소: `dota-pilot1/tc-dx-mybatis`
- 릴리즈 워크플로: `.github/workflows/tauri-release.yml`
- 릴리즈 브랜치: `agent/mybatis-playbook-editor`
- GitHub CLI 로그인:

```bash
gh auth login -h github.com
```

## 2. GitHub Secrets 설정

### Tauri 자동 업데이트 서명

다음 Secrets가 필요합니다.

- `TAURI_SIGNING_PRIVATE_KEY`
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`

`TAURI_SIGNING_PRIVATE_KEY`에는 minisign 개인키 파일의 전체 내용을 저장합니다. 원문을 다시 Base64로 이중 인코딩하거나, 키의 일부만 복사하면 안 됩니다.

`src-tauri/tauri.conf.json`의 `plugins.updater.pubkey`에는 공개키 파일 전체를 한 줄 Base64 값으로 저장합니다. 공개키를 디코드한 두 줄 텍스트나 두 번째 줄의 `RW...` 본문만 넣으면 안 됩니다. 저장소에 사용하는 값은 `.pub` 파일의 내용을 그대로 사용해야 합니다.

Secret 값 자체를 터미널에 출력하지 않고 파일에서 직접 등록합니다.

```bash
SECRETS_DIR="/Users/terecal/english-agent-hub-container/배포 가이드/.local-secrets"
REPO="dota-pilot1/tc-dx-mybatis"

gh secret set TAURI_SIGNING_PRIVATE_KEY --repo "$REPO" \
  < "$SECRETS_DIR/aegis-tauri-updater.key"
gh secret set TAURI_SIGNING_PRIVATE_KEY_PASSWORD --repo "$REPO" \
  < "$SECRETS_DIR/tauri_signing_private_key_password.txt"
```

### macOS 서명 및 공증

다음 Secrets가 필요합니다.

- `APPLE_CERTIFICATE`
- `APPLE_CERTIFICATE_PASSWORD`
- `APPLE_ID`
- `APPLE_PASSWORD`
- `APPLE_SIGNING_IDENTITY`
- `APPLE_TEAM_ID`

인증서와 비밀번호는 서로 맞는 쌍이어야 합니다. 인증서 파일은 워크플로가 기대하는 Base64 형식으로 등록합니다.

```bash
gh secret set APPLE_CERTIFICATE --repo "$REPO" \
  < "$SECRETS_DIR/apple_certificate_base64.txt"
gh secret set APPLE_CERTIFICATE_PASSWORD --repo "$REPO" \
  < "$SECRETS_DIR/apple_certificate_password.txt"
gh secret set APPLE_ID --repo "$REPO" \
  < "$SECRETS_DIR/apple_id.txt"
gh secret set APPLE_PASSWORD --repo "$REPO" \
  < "$SECRETS_DIR/apple_app_specific_password.txt"

printf '%s' 'Developer ID Application: Hyunseok oh (5PRM3RRTSH)' \
  | gh secret set APPLE_SIGNING_IDENTITY --repo "$REPO"
printf '%s' '5PRM3RRTSH' \
  | gh secret set APPLE_TEAM_ID --repo "$REPO"

gh secret list --repo "$REPO"
```

## 3. 공개키 설정 검증

공개키 원문을 직접 출력하지 않고, 설정값과 원본 파일이 같은지만 확인합니다.

```bash
node -e '
const fs = require("fs");
const config = JSON.parse(fs.readFileSync("src-tauri/tauri.conf.json", "utf8"));
const source = fs.readFileSync(
  "/Users/terecal/english-agent-hub-container/배포 가이드/.local-secrets/aegis-tauri-updater.key.pub",
  "utf8"
).trim();
const actual = config.plugins.updater.pubkey;
if (actual !== source) throw new Error("updater pubkey does not match source .pub file");
console.log(`pubkey matches source file exactly: ${actual.length} characters`);
'
```

## 4. 릴리즈 실행

버전을 먼저 `src-tauri/tauri.conf.json`과 프로젝트 설정에 반영한 뒤 태그를 지정해 워크플로를 실행합니다.

```bash
REPO="dota-pilot1/tc-dx-mybatis"
gh workflow run tauri-release.yml \
  --repo "$REPO" \
  --ref agent/mybatis-playbook-editor \
  -f release_tag=vX.Y.Z
```

## 5. 실행 상태 확인

```bash
gh run list --repo "$REPO" --workflow tauri-release.yml
gh run watch RUN_ID --repo "$REPO"
gh run view RUN_ID --repo "$REPO" --log-failed
```

Windows와 macOS 작업이 모두 성공해야 릴리즈를 정상 배포할 수 있습니다. macOS 로그에서 `Notarizing Finished with status Accepted`가 확인되면 Apple 서명과 공증이 정상 처리된 것입니다.

## 6. 릴리즈 자산 검증

```bash
gh release view vX.Y.Z --repo "$REPO" \
  --json tagName,url,assets \
  --jq '{tagName,url,assets:[.assets[]|{name,size,url}]}'

curl -fsSI -L \
  "https://github.com/dota-pilot1/tc-dx-mybatis/releases/latest/download/latest.json"
```

정상 릴리즈에는 다음 자산이 포함됩니다.

- macOS universal `.dmg`
- macOS updater `.app.tar.gz` 및 `.sig`
- Windows NSIS `.exe` 및 `.sig`
- `latest.json`

최신 릴리즈 링크는 태그가 바뀌어도 유지됩니다.

`https://github.com/dota-pilot1/tc-dx-mybatis/releases/latest`

## 7. 주요 오류와 해결 방법

| 오류 | 원인 및 해결 |
|---|---|
| `Missing comment in secret key` | 개인키 원문이 아니거나 이중 인코딩된 값입니다. 개인키 파일 전체를 Secret으로 등록합니다. |
| `Invalid symbol 32` | `pubkey` 설정에 Base64가 아닌 공개키 주석/공백 포함 원문을 넣은 경우입니다. `.pub` 파일의 한 줄 Base64 값을 사용합니다. |
| `invalid utf-8 sequence` | 공개키의 `RW...` 본문만 넣은 경우입니다. 공개키 파일 전체를 사용합니다. |
| `Base64 conversion failed` | 공개키 값이 잘렸거나 수동 입력 중 변형된 경우입니다. 원본 `.pub` 파일과 설정값이 정확히 같은지 검증합니다. |
| `SecKeychainItemImport` | Apple 인증서 형식, Base64 인코딩, 인증서 비밀번호가 서로 맞지 않는 경우입니다. 인증서와 비밀번호를 다시 확인합니다. |
| 공증 단계 실패 | Apple ID, 앱 전용 비밀번호, Team ID 또는 서명 identity를 확인합니다. |

## 8. 검증 완료 기록

공개키 설정을 원본 파일과 일치시킨 뒤 다음 실행이 성공했습니다.

- Workflow run: `31128964412`
- Tag: `v0.1.18`
- macOS universal DMG, updater archive/signature, Windows installer/signature, `latest.json` 생성 확인
- Run URL: https://github.com/dota-pilot1/tc-dx-mybatis/actions/runs/31128964412
- Release URL: https://github.com/dota-pilot1/tc-dx-mybatis/releases/tag/v0.1.18

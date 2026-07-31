# TC Toolkit for Commerce

커머스 서비스를 빠르게 설계하고 구현하기 위한 Towercrane 기반 Tauri 데스크톱 툴킷입니다.

## 목적

커머스 개발은 코드보다 먼저 정리해야 할 도메인 지식과 정책이 많습니다. 이 앱은 10인분 하는 개발자가 바로 참고해서 커머스 설계와 구현 속도를 올릴 수 있는 도구를 하나씩 만들어 가는 작업대입니다.

## 초기 구성

- 시작하기

처음에는 메뉴를 늘리지 않고 `시작하기` 화면만 둡니다. 이 화면에서 커머스 청사진 생성기, 도메인 모델 사전, 기능 레시피, 상태머신/SQL 실험실, 외부 연동 플레이북, 프로토타입 런처 같은 후보 도구를 고르고 하나씩 실제 기능으로 승격합니다.

## 개발

```bash
npm install
npm run dev
```

Tauri 개발 모드는 원본 Towercrane 앱과 포트가 겹치지 않도록 Vite `1435` 포트를 사용합니다.

```bash
npm run tauri dev
```

## 검증

```bash
npm run build
cd src-tauri
cargo check
```

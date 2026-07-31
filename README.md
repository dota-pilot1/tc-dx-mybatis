# TC Toolkit for Commerce

커머스 서비스를 빠르게 설계하고 구현하기 위한 Towercrane 기반 Tauri 데스크톱 툴킷입니다.

## 목적

커머스 개발은 코드보다 먼저 정리해야 할 도메인 지식과 정책이 많습니다. 이 앱은 10인분 하는 개발자가 바로 참고해서 커머스 설계와 구현 속도를 올릴 수 있는 도구를 하나씩 만들어 가는 작업대입니다.

## 초기 구성

- 시작하기
- 프로토타입

처음에는 메뉴를 많이 늘리지 않고 `시작하기`와 `프로토타입`만 둡니다. `프로토타입`은 서버의 `/catalog/workspaces` API를 사용하는 프론트 화면이며, 커머스 제작 후보를 워크스페이스/주제/프로토타입 카드로 훑는 용도입니다.

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

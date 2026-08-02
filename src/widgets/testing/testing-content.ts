export type TestingStep = {
  id: string;
  title: string;
  description: string;
  command?: string;
  artifact: string;
};

export type TestingTrack = {
  id: string;
  group: string;
  title: string;
  summary: string;
  signal: string;
  tags: string[];
  steps: TestingStep[];
  doneWhen: string[];
};

const PRACTICE_SCENARIOS: TestingTrack[] = [
  {
    id: "scenario-purchase-trace",
    group: "04 바로 실행할 시나리오",
    title: "시나리오 1 · 물건 주문하고 배송 보기",
    summary: "후원 물품을 하나 주문하고, 배송 번호가 화면에 보이는지 확인합니다.",
    signal: "15분 실습",
    tags: ["화면", "서버", "배송"],
    steps: [
      { id: "data", title: "1. 테스트용 물건 넣기", description: "물건 1개, 후원 대상 1명, 재고 1개, 테스트 사용자를 준비합니다.", artifact: "준비한 데이터" },
      { id: "order", title: "2. 화면에서 주문하기", description: "물건을 고르고 주문한 뒤 주문 번호를 적습니다.", command: "npx playwright test --grep @donation-flow", artifact: "화면 테스트" },
      { id: "trace", title: "3. 배송 번호 확인하기", description: "주문 번호, 후원 대상, 배송 번호, 배송 상태가 모두 보이는지 확인합니다.", artifact: "확인한 화면" },
    ],
    doneWhen: ["주문이 끝까지 만들어진다", "주문 번호와 배송 번호가 이어진다", "후원자가 배송 상태를 볼 수 있다"],
  },
  {
    id: "scenario-duplicate-order",
    group: "04 바로 실행할 시나리오",
    title: "시나리오 2 · 같은 주문 두 번 막기",
    summary: "더블 클릭이나 인터넷 재시도에도 주문이 하나만 생기는지 확인합니다.",
    signal: "15분 실습",
    tags: ["서버", "중복"],
    steps: [
      { id: "same", title: "1. 같은 요청 두 번 보내기", description: "같은 주문 요청을 두 번 보내도 주문과 후원 기록이 하나만 생기는지 확인합니다.", command: "./gradlew test --tests '*Duplicate*'", artifact: "서버 테스트" },
      { id: "double", title: "2. 버튼 빠르게 두 번 누르기", description: "주문 버튼을 연속으로 눌러도 주문이 하나만 만들어지는지 확인합니다.", artifact: "화면 확인" },
      { id: "retry", title: "3. 응답을 못 받은 것처럼 해보기", description: "주문은 성공했지만 화면이 멈춘 상황에서 다시 확인해도 안전한지 확인합니다.", artifact: "다시 실행한 결과" },
    ],
    doneWhen: ["두 번 눌러도 주문은 하나다", "중복 기록이 남지 않는다", "다시 해도 안전하다"],
  },
  {
    id: "scenario-permission",
    group: "04 바로 실행할 시나리오",
    title: "시나리오 3 · 남의 주문 막기",
    summary: "후원자, 수혜기관, 운영자가 서로의 정보를 함부로 보거나 바꾸지 못하게 합니다.",
    signal: "15분 실습",
    tags: ["권한", "보안"],
    steps: [
      { id: "roles", title: "1. 사람별 할 일 적기", description: "후원자, 수혜기관, 운영자가 주문·배송·증빙에서 할 수 있는 일을 적습니다.", artifact: "권한 표" },
      { id: "other", title: "2. 남의 주문 번호 넣기", description: "내 주문 대신 다른 사람의 주문 번호를 넣었을 때 서버가 거절하는지 확인합니다.", command: "./gradlew test --tests '*Permission*'", artifact: "서버 테스트" },
      { id: "button", title: "3. 버튼을 숨겨도 다시 확인하기", description: "화면에서 버튼이 안 보여도 주소를 직접 호출하면 서버가 막는지 확인합니다.", artifact: "거절 결과" },
    ],
    doneWhen: ["사람별 할 일이 정리되어 있다", "서버가 남의 주문을 막는다", "비밀번호가 화면과 기록에 나오지 않는다"],
  },
  {
    id: "scenario-shipment-failure",
    group: "04 바로 실행할 시나리오",
    title: "시나리오 4 · 배송 실패 다시 처리하기",
    summary: "배송 업체가 멈추거나 반송되어도 기록을 잃지 않고 다시 처리합니다.",
    signal: "20분 실습",
    tags: ["배송", "실패"],
    steps: [
      { id: "states", title: "1. 배송 순서 그리기", description: "준비 → 발송 → 배송 중 → 도착 순서를 적고 실패와 반송도 표시합니다.", artifact: "배송 순서표" },
      { id: "fail", title: "2. 배송 조회 실패시키기", description: "배송 업체가 늦게 답하거나 못 찾는 상황에서도 마지막 상태가 남는지 확인합니다.", command: "./gradlew test --tests '*Shipment*'", artifact: "실패 테스트" },
      { id: "again", title: "3. 다시 보내고 환불하기", description: "다시 보내기나 환불 뒤에도 주문 기록과 후원 증빙이 이어지는지 확인합니다.", artifact: "처리 결과" },
    ],
    doneWhen: ["배송 순서가 엉키지 않는다", "배송 업체가 멈춰도 기록이 남는다", "다시 처리한 결과가 보인다"],
  },
  {
    id: "scenario-proof",
    group: "04 바로 실행할 시나리오",
    title: "시나리오 5 · 누가 무엇을 바꿨는지 보기",
    summary: "결제, 후원, 배송, 환불의 기록을 후원자가 직접 확인합니다.",
    signal: "20분 실습",
    tags: ["기록", "증빙"],
    steps: [
      { id: "events", title: "1. 꼭 남길 일 정하기", description: "결제, 후원 배정, 배송 변경, 환불, 증빙 등록 때 남길 내용을 적습니다.", artifact: "기록 목록" },
      { id: "history", title: "2. 바꾼 사람과 시간 남기기", description: "금액이나 배송 상태를 누가 언제 바꿨는지 지워지지 않게 저장되는지 확인합니다.", command: "./gradlew test --tests '*History*'", artifact: "서버 테스트" },
      { id: "screen", title: "3. 후원자 화면에서 보기", description: "주문 화면에서 배송과 증빙의 흐름을 후원자가 직접 볼 수 있는지 확인합니다.", command: "npx playwright test --grep @proof", artifact: "화면 테스트" },
    ],
    doneWhen: ["중요한 일이 빠짐없이 기록된다", "지난 기록이 지워지지 않는다", "누구나 무슨 일이 있었는지 알 수 있다"],
  },
];

/** 앞의 세 메뉴도 설명서가 아니라 바로 체크하고 실행하는 준비 작업이다. */
export const TESTING_TRACKS: TestingTrack[] = [
  {
    id: "method-first",
    group: "01 테스트 방법",
    title: "무엇부터 검사할지 정하기",
    summary: "돈, 주문, 배송처럼 틀리면 큰일 나는 것부터 하나 고릅니다.",
    signal: "5분 준비",
    tags: ["준비", "순서"],
    steps: [
      { id: "choose", title: "1. 하나 고르기", description: "금액, 중복 주문, 다른 사람 주문 보기, 배송 중 하나를 고릅니다.", artifact: "고른 문제" },
      { id: "write", title: "2. 성공과 실패 한 줄씩 쓰기", description: "정상일 때와 잘못됐을 때 화면에 무엇이 보여야 하는지 적습니다.", artifact: "두 문장" },
      { id: "make", title: "3. 테스트 파일 하나 만들기", description: "위의 두 문장을 테스트 이름으로 옮기고 먼저 실패하는지 확인합니다.", artifact: "첫 테스트" },
    ],
    doneWhen: ["검사할 일이 하나로 좁혀졌다", "성공과 실패가 적혀 있다", "실패하는 테스트가 하나 있다"],
  },
  {
    id: "method-layers",
    group: "01 테스트 방법",
    title: "작은 검사부터 큰 검사까지",
    summary: "계산은 빠르게, 서버는 실제처럼, 마지막에 화면을 눌러 봅니다.",
    signal: "검사 순서",
    tags: ["순서", "연습"],
    steps: [
      { id: "small", title: "1. 계산을 먼저 검사하기", description: "금액, 재고, 배송비처럼 함수로 계산되는 것을 먼저 확인합니다.", artifact: "빠른 테스트" },
      { id: "server", title: "2. 서버와 데이터 연결하기", description: "주문 API를 실제 데이터베이스에 연결해 저장과 조회를 확인합니다.", artifact: "서버 테스트" },
      { id: "screen", title: "3. 사람이 누르는 순서 확인하기", description: "상품 선택부터 주문 완료까지 화면에서 한 번 따라 합니다.", artifact: "화면 테스트" },
    ],
    doneWhen: ["계산 테스트가 먼저 끝난다", "서버에 실제로 저장된다", "화면에서도 같은 결과가 보인다"],
  },
  {
    id: "tools-server",
    group: "02 쓸 도구",
    title: "서버에서 쓸 도구",
    summary: "Spring Boot와 Postgres를 실제에 가깝게 확인하는 도구 세트입니다.",
    signal: "서버 준비",
    tags: ["서버", "Postgres"],
    steps: [
      { id: "junit", title: "1. JUnit으로 계산 검사하기", description: "금액·재고·배송비 계산을 빠르게 확인합니다.", command: "./gradlew test", artifact: "계산 테스트" },
      { id: "spring", title: "2. Spring으로 주문 검사하기", description: "주문 API가 정상·실패 응답을 제대로 보내는지 확인합니다.", command: "./gradlew test --tests '*Controller*'", artifact: "주문 테스트" },
      { id: "container", title: "3. 실제 Postgres로 저장하기", description: "가짜 데이터베이스 대신 테스트용 Postgres에 저장하고 다시 읽어 봅니다.", artifact: "저장 테스트" },
    ],
    doneWhen: ["계산과 주문 검사가 나뉘어 있다", "실패 응답도 검사한다", "테스트 DB에 저장해 봤다"],
  },
  {
    id: "tools-screen",
    group: "02 쓸 도구",
    title: "화면에서 쓸 도구",
    summary: "React 화면을 작은 조각부터 실제 주문 흐름까지 확인합니다.",
    signal: "화면 준비",
    tags: ["화면", "React"],
    steps: [
      { id: "component", title: "1. 화면 하나 검사하기", description: "주문 버튼이 보이고, 재고가 없으면 눌리지 않는지 확인합니다.", command: "npm run test:unit", artifact: "버튼 테스트" },
      { id: "request", title: "2. 서버 응답 바꿔 보기", description: "성공·실패 응답을 바꿔 넣어 화면이 알맞게 바뀌는지 확인합니다.", command: "npm run test:integration", artifact: "응답 테스트" },
      { id: "playwright", title: "3. 처음부터 끝까지 눌러 보기", description: "물건 선택부터 주문 완료까지 사람이 누르는 순서로 확인합니다.", command: "npx playwright test", artifact: "주문 흐름 테스트" },
    ],
    doneWhen: ["버튼 상태를 확인했다", "성공과 실패 화면을 확인했다", "주문 흐름을 끝까지 따라 했다"],
  },
  {
    id: "tools-safety",
    group: "02 쓸 도구",
    title: "안전하게 확인하는 도구",
    summary: "잘못된 값, 비밀번호 노출, 코드 변경을 자동으로 찾아냅니다.",
    signal: "안전 준비",
    tags: ["보안", "자동 검사"],
    steps: [
      { id: "bad-input", title: "1. 잘못된 값 보내기", description: "빈 값, 너무 긴 글, 이상한 문자를 보내고 서버가 막는지 확인합니다.", command: "npm run test:security", artifact: "나쁜 값 테스트" },
      { id: "secret", title: "2. 비밀번호 찾기", description: "코드와 로그에 비밀번호나 비밀 키가 들어갔는지 검사합니다.", command: "gitleaks detect", artifact: "비밀값 검사" },
      { id: "ci", title: "3. PR마다 자동으로 돌리기", description: "사람이 잊어도 코드 검사와 테스트가 자동으로 실행되게 연결합니다.", artifact: "자동 검사" },
    ],
    doneWhen: ["나쁜 값이 거절된다", "비밀값이 발견되지 않는다", "PR에서 자동 검사가 돈다"],
  },
  {
    id: "best-ten",
    group: "03 꼭 검사할 10가지",
    title: "후원+구매 커머스 필수 10개",
    summary: "이 10개는 기능을 만들 때마다 최소 한 번씩 확인합니다.",
    signal: "체크 10개",
    tags: ["체크리스트", "필수"],
    steps: [
      { id: "money", title: "1. 금액", description: "상품값과 배송비 합계가 맞는지 확인합니다.", artifact: "금액 결과" },
      { id: "stock", title: "2. 재고", description: "재고보다 많이 주문할 수 없는지 확인합니다.", artifact: "재고 결과" },
      { id: "duplicate", title: "3. 중복 주문", description: "버튼을 두 번 눌러도 주문이 하나인지 확인합니다.", artifact: "중복 결과" },
      { id: "permission", title: "4. 다른 사람 주문", description: "남의 주문과 주소를 볼 수 없는지 확인합니다.", artifact: "권한 결과" },
      { id: "input", title: "5. 잘못된 입력", description: "빈 값과 이상한 문자를 보내도 안전한지 확인합니다.", artifact: "입력 결과" },
      { id: "order-state", title: "6. 주문 상태", description: "주문 전·결제 후·취소 후 상태가 맞는지 확인합니다.", artifact: "상태 결과" },
      { id: "shipment", title: "7. 배송 상태", description: "발송·배송 중·도착·실패가 화면에 맞게 보이는지 확인합니다.", artifact: "배송 결과" },
      { id: "refund", title: "8. 환불", description: "환불 뒤 금액과 주문 상태가 맞는지 확인합니다.", artifact: "환불 결과" },
      { id: "history", title: "9. 변경 기록", description: "누가 무엇을 바꿨는지 남는지 확인합니다.", artifact: "기록 결과" },
      { id: "screen", title: "10. 처음부터 끝까지", description: "화면에서 주문하고 배송 번호를 보는 흐름을 확인합니다.", artifact: "화면 결과" },
    ],
    doneWhen: ["10개 중 빠진 것이 없다", "실패한 항목을 고쳤다", "팀원이 다시 실행할 수 있다"],
  },
  ...PRACTICE_SCENARIOS,
];

export const TESTING_GROUPS = Array.from(new Set(TESTING_TRACKS.map((track) => track.group))).map((group) => ({
  id: group,
  label: group,
  tracks: TESTING_TRACKS.filter((track) => track.group === group),
}));

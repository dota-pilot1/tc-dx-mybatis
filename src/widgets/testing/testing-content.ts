/**
 * Testing 모듈 콘텐츠. 아직 서버 스키마를 붙이지 않고 정적 데이터로 화면 구조만 잡는다.
 * 서버로 옮길 때는 TestingDoc이 그대로 레코드 하나가 되도록 형태를 맞춰 두었다.
 */

export type DocBlock =
  | { kind: "text"; text: string }
  | { kind: "bullets"; items: string[] }
  | { kind: "callout"; text: string }
  | { kind: "code"; lang: string; text: string };

export type DocSection = {
  id: string;
  heading: string;
  blocks: DocBlock[];
};

export type TestingDoc = {
  id: string;
  title: string;
  summary: string;
  /** 문서를 훑을 때 성격을 알려주는 짧은 꼬리표 */
  tags: string[];
  sections: DocSection[];
  /** 문서 하단에 붙는 실행 체크리스트. 이론과 실행을 한 문서에서 잇는다. */
  checklist: string[];
};

export type TestingGroup = {
  id: string;
  label: string;
  docs: TestingDoc[];
};

export const TESTING_GROUPS: TestingGroup[] = [
  {
    id: "foundation",
    label: "기초 이론",
    docs: [
      {
        id: "test-pyramid",
        title: "테스트 피라미드와 트로피",
        summary:
          "어느 층에 얼마나 투자할지 정하는 기준. 층을 나누는 이유부터 프로토타입 단계의 배분까지.",
        tags: ["이론", "전략"],
        sections: [
          {
            id: "why-layers",
            heading: "왜 층을 나누는가",
            blocks: [
              {
                kind: "text",
                text: "테스트는 실행 비용과 신뢰도가 반비례한다. 단위 테스트는 밀리초 단위로 돌지만 '화면이 실제로 동작한다'는 건 증명하지 못하고, E2E는 그 반대다. 층을 나누는 목적은 분류 자체가 아니라 이 두 축을 의도적으로 섞는 것이다.",
              },
              {
                kind: "bullets",
                items: [
                  "속도: 단위 → 통합 → E2E 순으로 느려진다",
                  "신뢰도: 반대 방향으로 올라간다",
                  "유지비: 위로 갈수록 깨지기 쉽고 원인 추적이 어렵다",
                ],
              },
              {
                kind: "callout",
                text: "층은 목표가 아니라 예산 배분 도구다. '피라미드를 지켰는가'가 아니라 '깨졌을 때 몇 분 만에 원인을 찾는가'로 판단한다.",
              },
            ],
          },
          {
            id: "pyramid-vs-trophy",
            heading: "피라미드 vs 트로피",
            blocks: [
              {
                kind: "text",
                text: "고전적 피라미드는 단위 테스트를 가장 두껍게 쌓는다. 프런트엔드에서는 통합 층을 가장 두껍게 잡는 '테스팅 트로피' 배분이 더 잘 맞는 경우가 많다. 컴포넌트 하나를 격리해서 검증해도 실제 사용자 흐름과의 거리가 멀기 때문이다.",
              },
              {
                kind: "bullets",
                items: [
                  "피라미드: 단위 다수 · 통합 중간 · E2E 소수 — 로직 중심 백엔드에 적합",
                  "트로피: 정적 검사 → 단위 → 통합(가장 두껍게) → E2E — UI 중심 앱에 적합",
                  "정적 검사(타입, 린트)는 가장 싼 테스트다. 이 층을 먼저 채운다",
                ],
              },
            ],
          },
          {
            id: "prototype-mix",
            heading: "프로토타입 단계의 배분",
            blocks: [
              {
                kind: "text",
                text: "구조가 매주 바뀌는 단계에서는 테스트가 자산이 아니라 부채가 될 수 있다. 이때는 '무너지면 데모 자체가 불가능해지는 경로'만 얇게 덮는다.",
              },
              {
                kind: "bullets",
                items: [
                  "타입 체크와 빌드 통과 — 무조건 유지",
                  "핵심 해피 패스 E2E 1~3개 — 로그인, 주요 생성 흐름",
                  "순수 로직(계산, 포맷, 정렬) 단위 테스트 — 리팩터링해도 안 깨진다",
                  "화면 세부 마크업 단언 — 이 단계에서는 생략",
                ],
              },
            ],
          },
        ],
        checklist: [
          "정적 검사(타입·린트)가 CI에서 강제되는가",
          "핵심 해피 패스가 최소 하나 자동으로 검증되는가",
          "전체 스위트 실행 시간이 개발 중 돌릴 만한가",
          "실패했을 때 어느 층에서 깨졌는지 바로 구분되는가",
        ],
      },
      {
        id: "what-to-test",
        title: "무엇을 테스트할 것인가",
        summary:
          "커버리지 숫자가 아니라 위험을 기준으로 대상을 고르는 방법. 테스트하지 말아야 할 것도 함께.",
        tags: ["이론", "우선순위"],
        sections: [
          {
            id: "contract-not-implementation",
            heading: "구현이 아니라 계약을 테스트한다",
            blocks: [
              {
                kind: "text",
                text: "내부 구현에 결합된 테스트는 리팩터링할 때마다 깨진다. 그러면 팀은 테스트를 고치는 대신 지워버린다. 관찰 가능한 입출력 — 사용자가 보는 것, 호출자가 받는 것 — 만 단언한다.",
              },
              {
                kind: "code",
                lang: "ts",
                text: `// 나쁨: 내부 상태를 들여다본다
expect(cart.state.items.length).toBe(2);

// 좋음: 사용자가 보는 결과를 단언한다
expect(screen.getByText("상품 2개")).toBeInTheDocument();`,
              },
              {
                kind: "callout",
                text: "판별법: 동작을 바꾸지 않는 리팩터링에서 이 테스트가 깨지는가? 깨진다면 구현을 테스트하고 있는 것이다.",
              },
            ],
          },
          {
            id: "risk-based",
            heading: "위험 기반 우선순위",
            blocks: [
              {
                kind: "text",
                text: "커버리지 80%는 목표가 아니다. '깨졌을 때 피해 × 깨질 확률'이 큰 순서로 덮는다.",
              },
              {
                kind: "bullets",
                items: [
                  "돈·주문·권한이 걸린 경로 — 최우선",
                  "조건 분기가 많은 정책 로직 — 사람 눈으로 못 잡는다",
                  "과거에 한 번 터진 곳 — 회귀 테스트로 고정",
                  "외부 연동 경계 — 응답이 바뀌면 조용히 깨진다",
                ],
              },
            ],
          },
          {
            id: "do-not-test",
            heading: "테스트하지 말아야 할 것",
            blocks: [
              {
                kind: "bullets",
                items: [
                  "서드파티 라이브러리 자체의 동작 — 그쪽 책임이다",
                  "정적 문구, 색상값 같은 곧 바뀔 표현",
                  "getter/setter처럼 분기가 없는 코드",
                  "아직 요구사항이 확정되지 않은 화면",
                ],
              },
              {
                kind: "callout",
                text: "테스트를 지우는 것도 유지보수다. 6개월간 한 번도 실패로 문제를 잡아내지 못한 테스트는 비용만 내고 있는 것이다.",
              },
            ],
          },
        ],
        checklist: [
          "이 테스트는 리팩터링에도 살아남는가",
          "실패 메시지만 보고 원인을 짐작할 수 있는가",
          "가장 위험한 경로부터 덮고 있는가",
          "덮지 않기로 한 영역을 팀이 알고 있는가",
        ],
      },
      {
        id: "first-principles",
        title: "좋은 테스트의 조건",
        summary: "FIRST 원칙과 AAA 구조. 테스트 자체의 품질을 판단하는 기준.",
        tags: ["이론", "작성법"],
        sections: [
          {
            id: "first",
            heading: "FIRST 원칙",
            blocks: [
              {
                kind: "bullets",
                items: [
                  "Fast — 느린 테스트는 아무도 안 돌린다",
                  "Isolated — 다른 테스트의 결과나 실행 순서에 의존하지 않는다",
                  "Repeatable — 시간, 네트워크, 랜덤값에 좌우되지 않는다",
                  "Self-validating — 통과/실패가 자동으로 판정된다. 로그를 눈으로 읽지 않는다",
                  "Timely — 구현 직후, 늦어도 같은 PR 안에서 작성한다",
                ],
              },
            ],
          },
          {
            id: "aaa",
            heading: "AAA 구조와 이름 짓기",
            blocks: [
              {
                kind: "text",
                text: "본문은 준비(Arrange) · 실행(Act) · 단언(Assert) 세 덩어리로 나눈다. 이름은 '무엇을 했을 때 무엇이 되는가'를 그대로 적는다.",
              },
              {
                kind: "code",
                lang: "ts",
                text: `it("재고가 0이면 장바구니 담기 버튼이 비활성화된다", () => {
  // Arrange
  render(<ProductCard product={{ ...base, stock: 0 }} />);

  // Act — 이 경우엔 렌더가 곧 실행이다
  const button = screen.getByRole("button", { name: "장바구니" });

  // Assert
  expect(button).toBeDisabled();
});`,
              },
              {
                kind: "callout",
                text: "단언은 테스트당 하나의 개념만. 여러 개를 넣으면 첫 실패 뒤 나머지가 가려진다.",
              },
            ],
          },
        ],
        checklist: [
          "테스트 이름만 읽고 사양을 이해할 수 있는가",
          "실행 순서를 바꿔도 통과하는가",
          "고정된 시각·고정된 시드를 쓰는가",
          "준비 코드가 본문보다 길지 않은가",
        ],
      },
    ],
  },
  {
    id: "levels",
    label: "레벨별 전략",
    docs: [
      {
        id: "unit-test",
        title: "단위 테스트",
        summary: "순수 로직을 빠르게 고정하는 층. 무엇이 '단위'인지 정하는 것이 절반이다.",
        tags: ["실무", "단위"],
        sections: [
          {
            id: "unit-scope",
            heading: "단위의 경계 정하기",
            blocks: [
              {
                kind: "text",
                text: "'함수 하나 = 단위'로 잡으면 테스트가 구현에 붙는다. '모듈이 외부에 노출한 동작 하나 = 단위'로 잡는 편이 오래 간다. 내부 헬퍼는 공개 진입점을 통해 자연히 덮인다.",
              },
              {
                kind: "bullets",
                items: [
                  "계산·변환·검증 로직 — 단위 테스트가 가장 잘 맞는다",
                  "날짜/통화 포맷터, 정렬·필터 규칙",
                  "상태 리듀서, 폼 유효성 규칙",
                ],
              },
            ],
          },
          {
            id: "boundary-cases",
            heading: "경계값을 먼저 쓴다",
            blocks: [
              {
                kind: "text",
                text: "버그는 대부분 경계에서 난다. 정상 케이스 하나보다 경계 세 개가 값어치가 크다.",
              },
              {
                kind: "bullets",
                items: [
                  "빈 값 · null · 빈 배열",
                  "0, 음수, 최댓값, 소수점",
                  "정렬 기준이 같은 동점 항목",
                  "시간대·자정 경계",
                ],
              },
            ],
          },
        ],
        checklist: [
          "경계값 케이스가 정상 케이스만큼 있는가",
          "외부 I/O 없이 순수하게 돌아가는가",
          "실행이 수 초 안에 끝나는가",
          "내부 private 함수를 직접 부르지 않는가",
        ],
      },
      {
        id: "integration-test",
        title: "통합 테스트와 테스트 더블",
        summary:
          "UI 앱에서 가장 두껍게 가져갈 층. 어디까지 진짜로 쓰고 어디부터 가짜로 대체할지의 문제.",
        tags: ["실무", "통합"],
        sections: [
          {
            id: "seam",
            heading: "가짜로 바꿀 경계 고르기",
            blocks: [
              {
                kind: "text",
                text: "대체 지점을 함수 단위로 잡으면 리팩터링마다 깨진다. 네트워크 경계에서 가로채면 내부 구조를 바꿔도 테스트가 살아남는다.",
              },
              {
                kind: "bullets",
                items: [
                  "권장: HTTP 요청 자체를 가로채고 앱 코드는 손대지 않는다",
                  "비권장: API 모듈 함수를 통째로 스텁 — 실제 직렬화/에러 처리를 못 덮는다",
                  "시간·랜덤은 반드시 고정한다",
                ],
              },
            ],
          },
          {
            id: "double-types",
            heading: "테스트 더블 구분",
            blocks: [
              {
                kind: "bullets",
                items: [
                  "Stub — 정해진 값을 돌려준다. 상태 검증용",
                  "Mock — 호출 여부·인자를 검증한다. 남용하면 구현에 결합된다",
                  "Fake — 동작하는 간이 구현(인메모리 저장소 등). 가장 잘 늙는다",
                ],
              },
              {
                kind: "callout",
                text: "'호출됐는지' 대신 '결과가 맞는지'를 물어라. Mock 단언이 많아질수록 테스트는 구현 사본이 된다.",
              },
            ],
          },
          {
            id: "error-paths",
            heading: "실패 경로를 반드시 넣는다",
            blocks: [
              {
                kind: "text",
                text: "실무 장애는 성공 응답이 아니라 4xx/5xx, 타임아웃, 빈 배열에서 난다. 통합 테스트에서 가장 값어치 있는 케이스가 여기다.",
              },
              {
                kind: "bullets",
                items: [
                  "401 → 로그인 화면으로 유도되는가",
                  "500 → 에러 UI가 뜨고 앱이 죽지 않는가",
                  "빈 목록 → 빈 상태 화면이 나오는가",
                  "느린 응답 → 로딩 상태가 유지되는가",
                ],
              },
            ],
          },
        ],
        checklist: [
          "네트워크 경계에서 가로채고 있는가",
          "실패 응답 케이스가 포함되어 있는가",
          "빈 상태 / 로딩 상태가 검증되는가",
          "Mock 호출 단언보다 결과 단언이 많은가",
        ],
      },
      {
        id: "e2e-ui",
        title: "E2E와 UI 플로우",
        summary: "가장 비싼 층. 개수를 늘리는 대신 고르는 데 시간을 쓴다.",
        tags: ["실무", "E2E"],
        sections: [
          {
            id: "select-flows",
            heading: "무엇을 E2E로 남길지",
            blocks: [
              {
                kind: "text",
                text: "E2E는 '이게 깨지면 제품이 없는 것과 같다'는 흐름만 남긴다. 앱당 3~7개면 충분한 경우가 많다.",
              },
              {
                kind: "bullets",
                items: [
                  "로그인 → 메인 진입",
                  "핵심 생성 흐름 한 개(주문, 게시, 등록)",
                  "결제·권한처럼 되돌릴 수 없는 경로",
                ],
              },
            ],
          },
          {
            id: "selectors",
            heading: "셀렉터 전략",
            blocks: [
              {
                kind: "text",
                text: "CSS 클래스나 DOM 경로로 요소를 찾으면 스타일 변경마다 깨진다. 접근성 역할과 라벨로 찾으면 테스트가 사용자 관점과 같아지고, 덤으로 접근성도 검증된다.",
              },
              {
                kind: "code",
                lang: "ts",
                text: `// 취약
page.locator(".btn-primary > span:nth-child(2)")

// 견고 — 역할 + 접근 가능한 이름
page.getByRole("button", { name: "주문하기" })

// 차선 — 테스트 전용 속성
page.getByTestId("submit-order")`,
              },
            ],
          },
          {
            id: "waiting",
            heading: "대기는 조건으로",
            blocks: [
              {
                kind: "callout",
                text: "고정 시간 sleep은 flaky의 1번 원인이다. '3초 기다린다'가 아니라 '이 요소가 보일 때까지 기다린다'로 쓴다.",
              },
            ],
          },
        ],
        checklist: [
          "E2E 개수가 관리 가능한 범위인가",
          "역할·라벨 기반으로 요소를 찾는가",
          "고정 sleep이 하나도 없는가",
          "테스트 간 데이터가 격리되는가",
        ],
      },
    ],
  },
  {
    id: "prototype",
    label: "프로토타입 실전",
    docs: [
      {
        id: "prototype-tradeoff",
        title: "프로토타입 단계의 트레이드오프",
        summary:
          "언제 테스트를 쓰지 않는 것이 옳은가. 그리고 어느 시점에 안전망을 켜야 하는가.",
        tags: ["전략", "프로토타입"],
        sections: [
          {
            id: "when-to-skip",
            heading: "안 쓰는 게 맞는 구간",
            blocks: [
              {
                kind: "text",
                text: "요구사항이 매주 뒤집히는 탐색 단계에서 UI 세부를 단언하는 테스트는 순수 부채다. 화면을 지우면 테스트도 지워진다.",
              },
              {
                kind: "bullets",
                items: [
                  "레이아웃·문구가 확정되지 않은 화면",
                  "데모용으로만 존재할 일회성 코드",
                  "스키마가 아직 흔들리는 API 연동부",
                ],
              },
            ],
          },
          {
            id: "when-to-start",
            heading: "안전망을 켤 신호",
            blocks: [
              {
                kind: "bullets",
                items: [
                  "같은 버그가 두 번 재발했다 → 그 케이스를 회귀 테스트로 고정",
                  "다른 사람이 이 코드를 고치기 시작했다",
                  "수동 확인 절차가 문서 한 페이지를 넘겼다",
                  "배포 전 손으로 클릭하는 시간이 10분을 넘겼다",
                ],
              },
              {
                kind: "callout",
                text: "프로토타입이 프로덕션이 되는 순간은 공지되지 않는다. 위 신호 중 두 개가 겹치면 이미 넘어간 것이다.",
              },
            ],
          },
        ],
        checklist: [
          "테스트 없이 가기로 한 영역이 명시돼 있는가",
          "재발한 버그가 테스트로 고정됐는가",
          "수동 검증 절차가 문서로 남아 있는가",
          "안전망 전환 시점을 팀이 합의했는가",
        ],
      },
      {
        id: "visual-a11y",
        title: "시각 회귀와 접근성 체크",
        summary: "자동 단언으로 못 잡는 '보기에 깨진 것'을 다루는 층.",
        tags: ["실무", "UI"],
        sections: [
          {
            id: "visual-regression",
            heading: "시각 회귀",
            blocks: [
              {
                kind: "text",
                text: "레이아웃 붕괴, 잘린 텍스트, 대비 부족은 DOM 단언으로 안 잡힌다. 스크린샷 비교가 필요한 이유다. 대신 노이즈 관리가 전부다.",
              },
              {
                kind: "bullets",
                items: [
                  "애니메이션·커서 깜빡임을 끄고 촬영한다",
                  "동적 데이터(날짜, 랜덤 이름)를 고정한다",
                  "폰트 로딩 완료를 기다린다",
                  "대상 화면을 좁게 — 전체 페이지보다 컴포넌트 단위",
                ],
              },
            ],
          },
          {
            id: "a11y",
            heading: "접근성 자동 점검",
            blocks: [
              {
                kind: "text",
                text: "자동 도구가 잡는 건 전체 접근성 문제의 일부지만, 그 일부는 거의 공짜로 잡힌다. 테마를 다루는 앱이라면 대비 검사는 특히 값어치가 크다.",
              },
              {
                kind: "bullets",
                items: [
                  "이미지 대체 텍스트 누락",
                  "폼 컨트롤과 라벨 연결 누락",
                  "명도 대비 기준 미달 — light/dark 양쪽에서",
                  "키보드만으로 주요 흐름 완주 가능 여부",
                ],
              },
            ],
          },
        ],
        checklist: [
          "light·dark 두 테마에서 확인했는가",
          "스크린샷의 동적 요소가 고정됐는가",
          "키보드만으로 핵심 흐름을 완주할 수 있는가",
          "좁은 화면 폭에서 레이아웃이 유지되는가",
        ],
      },
    ],
  },
  {
    id: "maintenance",
    label: "유지보수",
    docs: [
      {
        id: "flaky",
        title: "불안정 테스트 잡기",
        summary:
          "가끔 실패하는 테스트는 실패하는 테스트보다 나쁘다. 팀이 실패를 무시하기 시작하기 때문이다.",
        tags: ["유지보수", "품질"],
        sections: [
          {
            id: "causes",
            heading: "흔한 원인",
            blocks: [
              {
                kind: "bullets",
                items: [
                  "고정 시간 대기 — 느린 CI에서만 터진다",
                  "테스트 간 공유 상태 — 실행 순서에 따라 달라진다",
                  "실제 시각·타임존·로케일 의존",
                  "정렬이 보장되지 않은 목록에 인덱스로 접근",
                  "정리되지 않은 비동기 작업이 다음 테스트로 새어 나감",
                ],
              },
            ],
          },
          {
            id: "policy",
            heading: "대응 정책",
            blocks: [
              {
                kind: "text",
                text: "재시도로 덮는 건 임시방편이다. 재시도는 '증상을 감추는 대신 기록을 남기는' 용도로만 쓴다.",
              },
              {
                kind: "callout",
                text: "격리 → 원인 수정 → 복귀. 원인을 못 찾으면 지운다. 무시되는 빨간불을 남겨두는 것이 최악이다.",
              },
            ],
          },
        ],
        checklist: [
          "같은 테스트를 연속 10회 돌려도 통과하는가",
          "실행 순서를 무작위로 바꿔도 통과하는가",
          "시각·로케일이 고정돼 있는가",
          "현재 격리된 테스트 목록이 관리되고 있는가",
        ],
      },
      {
        id: "regression-safety",
        title: "회귀 안전망 만들기",
        summary: "버그를 고치는 절차에 테스트를 끼워 넣어 스위트가 자연히 자라게 한다.",
        tags: ["유지보수", "프로세스"],
        sections: [
          {
            id: "bug-flow",
            heading: "버그 수정 순서",
            blocks: [
              {
                kind: "bullets",
                items: [
                  "1. 버그를 재현하는 실패 테스트를 먼저 쓴다",
                  "2. 그 테스트가 실패하는 것을 눈으로 확인한다",
                  "3. 코드를 고쳐 통과시킨다",
                  "4. 테스트 이름에 무엇이 잘못됐었는지 남긴다",
                ],
              },
              {
                kind: "callout",
                text: "2번을 건너뛰면 아무것도 검증하지 않는 테스트가 만들어진다. 반드시 빨간불을 한 번 본다.",
              },
            ],
          },
          {
            id: "ci",
            heading: "CI에서의 위치",
            blocks: [
              {
                kind: "text",
                text: "빠른 층은 매 푸시마다, 느린 층은 병합 전이나 야간에 돌린다. 개발자가 결과를 기다리는 시간이 10분을 넘기면 사람들은 CI를 우회하기 시작한다.",
              },
              {
                kind: "bullets",
                items: [
                  "푸시마다: 타입 체크 · 린트 · 단위",
                  "PR 병합 전: 통합 · 핵심 E2E",
                  "야간: 전체 E2E · 시각 회귀",
                ],
              },
            ],
          },
        ],
        checklist: [
          "수정 전에 실패하는 테스트를 먼저 봤는가",
          "PR마다 빠른 층이 자동으로 도는가",
          "실패한 CI를 무시하고 병합하는 일이 없는가",
          "스위트 실행 시간이 관리되고 있는가",
        ],
      },
    ],
  },
];

export const ALL_TESTING_DOCS: TestingDoc[] = TESTING_GROUPS.flatMap(
  (group) => group.docs,
);

export function findTestingDoc(docId: string): TestingDoc | undefined {
  return ALL_TESTING_DOCS.find((doc) => doc.id === docId);
}

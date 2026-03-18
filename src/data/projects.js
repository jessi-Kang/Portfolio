import { cloudSet, cloudDelete } from '../utils/db'

const STORAGE_KEY = 'portfolio_projects'

export const defaultProjects = {
  groups: [
    {
      title: 'LINE AI Friends',
      subtitle: 'AI 캐릭터 대화 서비스 | Product Management | 2025.10 ~ 현재',
      projects: [
        {
          id: 'conversation-quality',
          badge: 'AI · RETENTION',
          badgeType: 'ai',
          title: 'AI 캐릭터 대화 품질 개선 및 A/B 실험',
          subtitle: '프로필 파라미터 튜닝 + Legacy vs Revised 14일 비교 실험',
          problem: "인기 캐릭터 '코코로'의 대화가 단조롭고 반복적이며, 단답형 질문·수동적 확인 패턴에 머물러 유저 이탈이 발생하고 있었습니다.",
          solution: '대화 단계별 지침(Phase 0~4)을 설계하고 질문 수를 24→12회로 압축. 질문 방식을 입체적 상황극으로 전환하고, 14일 A/B 실험으로 검증했습니다.',
          collaboration: 'AI 모델링팀과 프로필 파라미터를 공동 설계하고, QA팀과 골든셋 기반 품질 검증 프로세스를 수립. 데이터팀과 14일 A/B 실험 설계 및 지표 트래킹 체계를 구축했습니다.',
          result: 'PoC 적용 후 DAU +81.8%, 신규 유입 +101.9%, 메시지 수 +68.5%. A/B 실험에서 기존 유저 D1~D7 리텐션 전 구간 10% 이상 상승을 달성했습니다.',
          insight: '대화형 AI에서는 "질문의 질"이 리텐션을 결정합니다. 핵심 경험을 압축할수록 유저 몰입이 높아지고, 능동적 대화 구조가 단순 정보 전달보다 효과적입니다.',
          metrics: ['14일 A/B 실험'],
          highlights: [
            { value: '+81.8%', label: 'DAU' },
            { value: '+101.9%', label: '신규 유입' },
            { value: '+68.5%', label: '메시지 수' },
            { value: '+10%↑', label: '기존 유저 리텐션' },
          ],
          fullWidth: false,
        },
        {
          id: 'service-ops',
          badge: 'OPS · POLICY',
          badgeType: 'ops',
          title: '서비스 운영 체계 구축',
          subtitle: '정책 수립 · CMS 설계 · 실험 체계 · IP 협업 프레임워크',
          problem: '서비스 확장 과정에서 운영 기준이 부재하여 개발·운영·QA 간 의사결정이 지연되고 있었습니다.',
          solution: 'Chat·Currency·Review 3대 정책, 100건 단위 일괄 심사 CMS, 주간 PoC 실험 체계, IP 캐릭터 협업 프레임워크를 체계적으로 구축했습니다.',
          collaboration: '개발·운영·QA·법무팀과 함께 정책을 정의하고, 외부 IP 소속사와 골든셋 평가 기준(Fact Accuracy 95%↑, Hallucination Rate 5%↓)을 합의했습니다.',
          result: '전체 조직이 참조하는 운영 표준을 확립하고, 주간 실험 사이클로 빠른 가설 검증이 가능해졌습니다.',
          insight: '초기 단계 서비스일수록 명확한 운영 기준이 속도를 높입니다. 정책 문서화는 비용이 아니라 투자입니다.',
          metrics: ['3대 정책', 'CMS 설계', '주간 실험', 'IP 프레임워크'],
          highlights: [],
          fullWidth: true,
        },
        {
          id: 'review-backlog',
          badge: 'OPS · AUTOMATION',
          badgeType: 'ops',
          title: '심사 적체 59,277건 전건 해소',
          subtitle: '일괄심사 CMS 도입 · 974만엔 비용 절감 · 14.7MM 인력 절감',
          problem: '캐릭터 심사 적체가 피크 시 59,277건에 달해 신규 캐릭터 출시가 지연되고, 유저 불만이 누적되고 있었습니다.',
          solution: '100건 단위 일괄심사 툴을 설계·도입하고, 심사 기준을 표준화하여 구조적 처리 능력을 대폭 향상시켰습니다.',
          collaboration: '운영팀·개발팀과 CMS 요구사항을 공동 정의하고, 법무팀과 심사 가이드라인을 수립했습니다.',
          result: '2026년 1월 적체 전건 해소를 달성하고, 필요 인건비 대비 약 974만엔, 14.7MM 인력을 절감했습니다.',
          insight: '운영 병목은 인력 충원이 아닌 도구와 프로세스 혁신으로 해결해야 합니다. 자동화의 ROI는 규모가 클수록 극대화됩니다.',
          metrics: [],
          highlights: [
            { value: '59,277→0건', label: '적체 해소' },
            { value: '974만엔', label: '비용 절감' },
            { value: '14.7MM', label: '인력 절감' },
          ],
          fullWidth: false,
        },
      ],
    },
    {
      title: 'LINE Wallet GetPoint',
      subtitle: '포인트 획득 캠페인 추천 모듈 | Product Management | 2024.02 ~ 2025.10',
      projects: [
        {
          id: 'getpoint',
          badge: 'ML · A/B TEST',
          badgeType: 'data',
          title: '추천 모델 A/B 테스트로 CTR 34.6% 개선',
          subtitle: 'Frost30 모델 교체 실험 설계·분석 | 일 서빙 ~20만 명',
          problem: '기존 MLP30 모델이 활동성 높은 유저에 편중되고 인기 캠페인 위주로 추천하여 다양성이 부족했습니다.',
          solution: '신규 Frost30 모델의 14일 A/B 테스트를 설계하고, Partner Boost 변수를 분리 분석하여 순수 모델 성능을 검증했습니다.',
          collaboration: 'ML팀과 모델 서빙 구조를 설계하고, 데이터팀과 통계 검증 방법(Welch\'s t-test, Z-test)을 합의. 파트너사 영향 변수 분리를 위해 비즈팀과 협업했습니다.',
          result: 'CTR +34.6%, UU CTR +81.2% 개선을 달성하여 모델 전체 교체를 결정했습니다.',
          insight: 'A/B 테스트에서 외부 변수(Partner Boost 등)를 분리하지 않으면 모델 성능을 과대평가할 수 있습니다. 정확한 실험 설계가 올바른 의사결정의 전제입니다.',
          metrics: ["Welch's t-test p<0.001", 'Warm/Cold 세그먼트'],
          highlights: [
            { value: '+34.6%', label: 'CTR' },
            { value: '+81.2%', label: 'UU CTR' },
            { value: '+39.7%', label: '일 클릭수' },
            { value: '+126%', label: 'Warm 유저 CTR' },
          ],
          fullWidth: true,
        },
      ],
    },
    {
      title: 'Demaecan',
      subtitle: '일본 최대 배달 서비스 프로덕트 리뉴얼 | PM / PO | 2021.03 ~ 2023.04',
      projects: [
        {
          id: 'delivery-renewal',
          badge: 'DELIVERY · ML',
          badgeType: 'ops',
          title: 'Delivery Product 전면 리뉴얼',
          subtitle: 'Driver App + ML 자동 배차 도입 | 35명 규모 | 일본 전국 전개',
          problem: '20년간 배달 시간을 3분도 줄이지 못했고, Shinjuku Control Center에서 200여 명이 수동 배차하는 비효율적 구조였습니다.',
          solution: 'Driver App을 전면 리뉴얼하고 ML 기반 자동 배차 엔진(Delivery Engine)을 도입. 다건 배달, Heat Map, Controller Web을 설계했습니다.',
          collaboration: '35명 규모의 크로스펑셔널 팀(Dev·ML·Design·Ops)을 리딩하고, 일본 전국 현장 운영팀과 단계적 전개 계획을 수립했습니다.',
          result: '약 1년 만에 배달 시간 7분 단축, 운영 자동화 0→95%, 인력 200명→10명으로 전환했습니다.',
          insight: '기술 도입의 핵심은 현장 운영과의 정합성입니다. ML 자동화는 기술만으로는 불가하고, 현장 프로세스 재설계가 함께 이루어져야 합니다.',
          metrics: [],
          highlights: [
            { value: '-7분', label: '배달 시간 (34.8→27.9분)' },
            { value: '0→95%', label: '자동화율' },
            { value: '200→10명', label: '운영 인력' },
          ],
          fullWidth: false,
        },
        {
          id: 'consumer-renewal',
          badge: 'CONSUMER · PO',
          badgeType: 'ux',
          title: 'Consumer Product 개선 및 피드백 체계',
          subtitle: 'App·Web 리뉴얼 전략 수립 + 피드백 수집 체계 | 12명 규모',
          problem: '소비자 측 서비스의 개선 방향이 불명확하고, 기사·소비자의 직접 피드백을 수집할 채널이 없었습니다.',
          solution: 'PO로서 소비자 측 전체 개선 로드맵을 설계하고, 직접 피드백 수집 기능 및 Admin을 구축했습니다.',
          collaboration: 'Demaecan CXO와 리뉴얼 방향을 합의하고, CS·운영팀과 피드백 분류 체계를 공동 설계했습니다.',
          result: 'CXO 합의 기반의 명확한 개선 로드맵을 확보하고, 데이터 기반 개선 사이클을 구축하여 CS 비용을 절감했습니다.',
          insight: 'C-레벨과의 합의는 실행력의 기반입니다. 정성적 피드백도 체계적으로 분류하면 정량적 의사결정의 근거가 됩니다.',
          metrics: ['CXO 전략 합의', 'CS 비용 감소'],
          highlights: [],
          fullWidth: false,
        },
      ],
    },
    {
      title: '29CM',
      subtitle: '패션 커머스 서비스 기획 | PM / UX | 2018.12 ~ 2020.06',
      projects: [
        {
          id: '29cm-coupon',
          badge: 'GROWTH · CONVERSION',
          badgeType: 'data',
          title: '첫 구매 쿠폰 개선으로 App 주문건수 681% 증가',
          subtitle: '혜택 정책 재설계 + 쿠폰 시스템 개선 | 7명 규모',
          problem: '첫 구매 전환율이 낮고, 혜택 정책이 체계적이지 않아 신규 고객 획득에 어려움이 있었습니다.',
          solution: '29CM의 혜택 정책 구조를 전면 재설계하고, 첫 구매 전환을 높이기 위한 쿠폰 시스템을 App/Web 각각 최적화했습니다.',
          collaboration: '마케팅팀과 혜택 전략을 공동 설계하고, 개발팀과 쿠폰 시스템 아키텍처를 재구조화했습니다.',
          result: 'App 첫구매 쿠폰 주문건수 일평균 681% 증가(58→453건), 전체 쿠폰 사용률 280% 증가, 첫 구매 고객수 13% 증가를 달성했습니다.',
          insight: '혜택의 크기보다 제공 시점과 구조가 전환에 더 큰 영향을 미칩니다. 정책 레벨의 변화가 퍼널 전체를 개선할 수 있습니다.',
          metrics: ['Web 주문건수 +36%'],
          highlights: [
            { value: '+681%', label: 'App 주문건수' },
            { value: '+280%', label: '쿠폰 사용률' },
            { value: '+13%', label: '첫 구매 고객수' },
          ],
          fullWidth: false,
        },
        {
          id: '29cm-identity',
          badge: 'UX · TRUST',
          badgeType: 'ux',
          title: '회원 인증 체계 도입 및 어뷰징 탐지',
          subtitle: '본인인증 도입 · 회원 정보 정제 · 악성 유저 파악 | 6명 규모',
          problem: '본인인증 체계가 없어 회원 정보 신뢰도가 낮고, 어뷰징 유저를 파악할 수 없었습니다.',
          solution: 'CI/DI 기반 본인인증을 도입하고, 전체 회원 데이터를 정제하여 어뷰징 유저를 체계적으로 탐지했습니다.',
          collaboration: '법무팀과 개인정보 처리방침을 개정하고, CS팀과 어뷰징 대응 프로세스를 수립했습니다.',
          result: '전체 회원 10%(202,189명) 인증 수집, 주문 371,559건 정보 정제, 동일 DI 다중 계정(58개, 22개) 어뷰징 탐지를 달성했습니다.',
          insight: '인증 체계는 보안뿐 아니라 데이터 품질의 기반입니다. 정제된 데이터가 올바른 비즈니스 의사결정을 만듭니다.',
          metrics: ['미성년자 103명 확인'],
          highlights: [
            { value: '20.2만명', label: '인증 수집' },
            { value: '37.1만건', label: '주문 정보 정제' },
          ],
          fullWidth: false,
        },
      ],
    },
  ],
}

export function loadProjects() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      // Validate structure: must have groups array with at least one project
      if (parsed?.groups?.length > 0 && parsed.groups.some((g) => g.projects?.some((p) => p.title))) {
        return parsed
      }
    }
  } catch (e) {
    // ignore
  }
  return defaultProjects
}

export function saveProjects(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  cloudSet('projects', data)
}

export function resetProjects() {
  localStorage.removeItem(STORAGE_KEY)
  cloudDelete('projects')
}

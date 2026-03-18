import { cloudSet, cloudDelete } from '../utils/db'

const STORAGE_KEY = 'portfolio_projects'

export const defaultProjects = {
  groups: [
    {
      title: 'LINE AI Friends',
      subtitle: 'AI 캐릭터 대화 서비스 | Product Management | 2025.10 ~ 현재',
      projects: [
        {
          id: 'retention-poc',
          badge: 'AI · RETENTION',
          badgeType: 'ai',
          title: 'AI 캐릭터 대화 품질 개선',
          subtitle: '프로필 파라미터 튜닝으로 캐릭터 대화 경험 개선',
          description: '단조롭고 반복적인 대화 문제를 해결하기 위해 프로필 파라미터 실험을 설계·주도하여 핵심 지표 전 영역에서 큰 폭의 개선을 달성했습니다.',
          metrics: [],
          highlights: [
            { value: '+81.8%', label: 'DAU' },
            { value: '+101.9%', label: '신규 유입' },
            { value: '+68.5%', label: '메시지 수' },
            { value: '+10%↑', label: '기존 유저 리텐션' },
          ],
          fullWidth: false,
        },
        {
          id: 'interaction-test',
          badge: 'AI · EXPERIMENT',
          badgeType: 'ai',
          title: '대화 전략 A/B 실험',
          subtitle: 'Legacy vs Revised 프로필 14일 비교 실험',
          description: '질문 방식을 단답형에서 상황극으로, 결과 대화를 능동적 정보 제공형으로 전환. 기존 유저 D1~D7 리텐션 전 구간 10% 이상 상승을 달성했습니다.',
          metrics: [],
          highlights: [
            { value: '+27.4%', label: '전체 DAU' },
            { value: '+13.3%', label: '기존 유저 D3' },
            { value: '+11.4%', label: '기존 유저 D7' },
          ],
          fullWidth: false,
        },
        {
          id: 'service-ops',
          badge: 'OPS · POLICY',
          badgeType: 'ops',
          title: '서비스 운영 체계 구축',
          subtitle: '정책 수립, CMS 설계, 실험 프로세스, IP 협업 프레임워크',
          description: 'Chat·Currency·Review 3대 정책, 100건 단위 일괄 심사 CMS, 주간 PoC 실험 체계, IP 캐릭터 협업 프레임워크(골든셋 평가·Guardrail)를 구축했습니다.',
          metrics: ['3대 정책 수립', '일괄 심사 CMS', '주간 실험 체계', 'IP 협업 프레임워크'],
          highlights: [],
          fullWidth: true,
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
          description: '기존 모델의 유저 편중·인기 캠페인 위주 추천 한계를 해소하기 위해 14일간 A/B 테스트를 설계하고 Partner Boost 변수를 분리 분석하여 정확한 모델 성능을 검증했습니다.',
          metrics: ["Welch's t-test p<0.001", 'Warm/Cold 세그먼트 분석'],
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
          description: '20년간 3분도 줄이지 못한 배달 시간을 약 1년 만에 7분 단축. 200명 수동 배차 체계를 ML 자동화로 전환하여 10명 운영 체제로 혁신했습니다.',
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
          subtitle: 'CXO 합의 기반 App·Web 리뉴얼 전략 수립 | 12명 규모',
          description: 'PO로서 소비자 측 전체 개선 로드맵을 설계하고, 기사·소비자 직접 피드백 수집 기능을 구축하여 데이터 기반 개선 사이클을 마련했습니다.',
          metrics: ['CXO 전략 합의', 'CS 비용 감소', '피드백 기반 개선 사이클'],
          highlights: [],
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

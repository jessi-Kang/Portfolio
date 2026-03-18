import { cloudSet, cloudDelete } from '../utils/db'

const STORAGE_KEY = 'portfolio_projects'

export const defaultProjects = {
  groups: [
    {
      title: 'LINE AI Friends — AI 캐릭터 대화 서비스',
      subtitle: 'LINE 메신저 내 AI 캐릭터와 대화하는 서비스 | PM | 2025.10 ~ 현재',
      projects: [
        {
          id: 'bulk-review',
          badge: 'OPS · CMS',
          badgeType: 'ops',
          title: 'CMS 일괄 심사(Bulk Review) 기능 설계',
          subtitle: '캐릭터 등록 심사 효율화를 위한 대량 처리 도구',
          description: '유저 생성 캐릭터(UGC) 심사 요청이 급증하면서 개별 심사의 한계를 해소하기 위해 100건 단위 일괄 심사 기능을 설계했습니다. 심사 상태 흐름(NEED_RE_REVIEW 신규 상태 추가), 동시 심사 충돌 처리 에러 케이스, 심사 이력 로그 정책까지 전체 CMS 스펙을 정의했습니다.',
          metrics: ['100건 단위 일괄 처리', '신규 상태 NEED_RE_REVIEW', '다국어(JP/EN/KR) 지원'],
          highlights: [],
          fullWidth: false,
        },
        {
          id: 'retention-poc',
          badge: 'AI · RETENTION',
          badgeType: 'ai',
          title: 'AI 캐릭터 대화 품질 개선 PoC',
          subtitle: '코코로 캐릭터 대상 프로필 튜닝 및 성과 검증',
          description: "인기 캐릭터 '코코로'의 대화가 단조롭고 반복적인 문제를 해결하기 위해 프로필 파라미터 실험을 주도했습니다. 대화 단계별 지침(Phase 0~4)과 콘텐츠 정책 슬롯을 신규 추가하고, 질문 수를 24회→12회로 압축하여 핵심 경험을 강화했습니다.",
          metrics: [],
          highlights: [
            { value: '+81.8%', label: 'DAU' },
            { value: '+101.9%', label: '신규 유입' },
            { value: '+68.5%', label: '메시지 수' },
            { value: '+10%↑', label: '기존 유저 D1~D7' },
          ],
          fullWidth: false,
        },
        {
          id: 'interaction-test',
          badge: 'AI · EXPERIMENT',
          badgeType: 'ai',
          title: '캐릭터 대화 전략 실험(Interaction Test)',
          subtitle: 'Legacy vs Revised 프로필 비교 분석 및 KPI 트래킹',
          description: '기존 대화의 문제를 정량·정성 양면으로 분석하여 개선안을 설계했습니다. 질문 방식을 단답형에서 입체적 상황극으로 전환하고, 결과 후 대화를 수동적 확인형에서 능동적 정보 제공형으로 변경했습니다. 14일 비교 결과, 기존 유저 D1~D7 리텐션 전 구간 10% 이상 상승을 달성했습니다.',
          metrics: [],
          highlights: [
            { value: '+27.4%', label: '전체 DAU' },
            { value: '+13.3%', label: '기존 유저 D3' },
            { value: '+11.4%', label: '기존 유저 D7' },
          ],
          fullWidth: false,
        },
        {
          id: 'chat-policy',
          badge: 'POLICY · UX',
          badgeType: 'ux',
          title: '서비스 핵심 정책 체계 수립',
          subtitle: 'Chat / Currency / Review 정책 문서화',
          description: '서비스 운영에 필수적인 3대 정책을 체계적으로 정의했습니다. 채팅 정책(메시지 전송·실패·재전송 규칙, 30일 데이터 보관 정책), 재화 정책(Talk Power/LINE Point/LINE Coin 5단계 소진 순서, 연동 동의 수집), 심사 정책(AI→Human Review 6단계 상태 플로우)을 수립하여 개발·운영·QA 전체의 기준을 마련했습니다.',
          metrics: ['3대 정책 수립', '6단계 심사 플로우', '5종 재화 체계'],
          highlights: [],
          fullWidth: false,
        },
        {
          id: 'ip-collab',
          badge: 'IP · COLLAB',
          badgeType: 'ai',
          title: 'IP 캐릭터 협업 (Fantastics)',
          subtitle: '외부 IP 소속사와의 AI 캐릭터 구축 프레임워크',
          description: '아이돌·드라마 IP를 AI 캐릭터화하는 전체 프로세스를 설계했습니다. 6단계 로드맵(데이터 수급→모델 개발→데모 검수→골든셋 평가→최종 승인→운영), 소속사 협업 가이드, 골든셋 평가 체계(Fact Accuracy 95%↑, Tone Consistency 90%↑, Hallucination Rate 5%↓ 등), Guardrail 정책(금기어, OOC 방지), Quantified Persona 양식을 구축했습니다.',
          metrics: ['6단계 로드맵', '골든셋 50~100세트', '4종 가이드 문서'],
          highlights: [],
          fullWidth: false,
        },
        {
          id: 'poc-ops',
          badge: 'POC · AGILE',
          badgeType: 'data',
          title: 'PoC 기반 빠른 실험 체계 구축',
          subtitle: '주간 릴리즈 사이클로 지표 개선 과제 검증',
          description: '정규 릴리즈와 별도로 주간 단위의 빠른 실험 체계를 설계했습니다. PM·Design·Dev가 매주 과제를 선정하고, Beta 검증 후 Real 배포하여 3/7일 단위로 성과를 측정합니다. PIA 사전 검토, branch 분리, 빠른 Roll-back 체계까지 리스크 관리도 포함하여 안전하고 빠른 실험 환경을 구축했습니다.',
          metrics: ['주간 릴리즈 사이클', '16+ Backlog 과제'],
          highlights: [],
          fullWidth: false,
        },
      ],
    },
    {
      title: 'LINE Wallet — GetPoint 모듈 추천 개선',
      subtitle: 'LINE Wallet Tab 내 포인트 획득 캠페인 추천 모듈 | PM | 2025.07 ~ 2025.10',
      projects: [
        {
          id: 'getpoint',
          badge: 'ML · A/B TEST',
          badgeType: 'data',
          title: 'GetPoint Phase 6.1 — 추천 모델 교체를 통한 CTR 34% 개선',
          subtitle: 'Frost30 모델 A/B 테스트 설계·실행·성과 분석',
          description: '기존 MLP30 모델의 한계(활동성 높은 유저 편중, 인기 캠페인 위주 추천)를 해소하기 위해 신규 Frost30 모델의 A/B 테스트를 설계·분석했습니다. 일 평균 약 1,200만 명(전체 20%)의 추론 대상 중 약 20만 명에게 실 서빙하며 14일간 실험을 진행했습니다. Partner Boost(특정 파트너사 캠페인 우선 노출) 변수가 결과에 미치는 영향을 분리 분석하여 정확한 모델 성능을 검증했습니다.',
          metrics: ["Welch's t-test p<0.001", 'Z-test p<0.001', 'Warm/Cold 유저 세그먼트 분석', '일 서빙 ~20만 명'],
          highlights: [
            { value: '+34.6%', label: 'CTR 개선' },
            { value: '+81.2%', label: 'UU CTR 개선' },
            { value: '+39.7%', label: '일 클릭수 증가' },
            { value: '+126%', label: 'Warm 유저 CTR (Boost 미적용)' },
          ],
          fullWidth: true,
        },
      ],
    },
    {
      title: 'Demaecan — 일본 최대 배달 서비스 프로덕트 리뉴얼',
      subtitle: 'LINE 자회사 출전관(Demaecan) 배달·소비자 프로덕트 총괄 | PM / PO | 2021.03 ~ 2023.04',
      projects: [
        {
          id: 'delivery-renewal',
          badge: 'DELIVERY · RENEWAL',
          badgeType: 'ops',
          title: 'Delivery Product 전체 리뉴얼',
          subtitle: 'Driver App + Controller Web + ML 자동 배차 도입 | 35명 규모',
          description: '배달 기사용 Driver App을 전면 리뉴얼하고 ML 기반 자동 배차 엔진(Delivery Engine)을 적용했습니다. 다건 배달 지원, Heat Map 제공, Controller Web 개선, User Feedback 수집 기능을 설계하여 2022년 8월 일본 전국 전개를 완료했습니다. Demaecan은 지난 20년간 배달 시간을 3분도 단축하지 못했으나, 본 프로젝트를 통해 약 1년 만에 7분을 단축하는 성과를 달성했습니다. 기존에 Shinjuku Control Center에서 200여 명이 수동 배차하던 체계를 시스템 자동화로 전환하여 외주 10명 체제로 운영 구조를 혁신했습니다.',
          metrics: ['35명 규모 프로젝트', '일본 전국 전개 완료', 'ML 자동 배차 엔진 도입'],
          highlights: [
            { value: '-7분', label: '배달 시간 단축 (34.8→27.9분)' },
            { value: '0→95%', label: '시스템 자동화율' },
            { value: '200→10명', label: '운영 인력 전환' },
          ],
          fullWidth: false,
        },
        {
          id: 'consumer-renewal',
          badge: 'CONSUMER · PO',
          badgeType: 'ux',
          title: 'Consumer Product Renewal 전략 수립',
          subtitle: '소비자 측 Mobile App · Web 전체 개선 방향 설계 | 12명 규모',
          description: 'Demaecan 서비스의 소비자 측(Consumer Side) Mobile App과 Web 전체의 개선 방향 및 전략을 수립했습니다. PO로서 Demaecan CXO와 Renewal 방향을 합의하고, 서비스 전반의 사용자 경험 개선 로드맵을 설계했습니다.',
          metrics: ['12명 규모 프로젝트', 'CXO 전략 합의', 'App + Web 전체 Renewal'],
          highlights: [],
          fullWidth: false,
        },
        {
          id: 'user-feedback',
          badge: 'USER FEEDBACK',
          badgeType: 'ux',
          title: 'User Feedback 수집 기능 및 Admin 설계',
          subtitle: '사용자 피드백 직접 수집 환경 구축',
          description: '배달 기사와 소비자의 직접적인 피드백을 수집할 수 있는 기능과 관리 시스템을 설계하여 CS 비용을 절감하고, 데이터 기반의 서비스 개선 사이클을 구축했습니다.',
          metrics: ['CS 비용 감소', '피드백 기반 개선 사이클 구축'],
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
    if (saved) return JSON.parse(saved)
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

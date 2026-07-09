export const chatbots = [
  {
    id: 'ruin-signal',
    name: 'RUIN SIGNAL',
    imagePosition: 'center',
    summary: '폐허가 된 네트워크 도시에서 사용자의 선택에 따라 태도를 바꾸는 SF 미스터리 챗봇.',
    platforms: [
      { label: 'Character.AI', href: 'https://example.com' },
      { label: 'Chub', href: 'https://example.com' },
    ],
  },
  {
    id: 'blue-hour',
    name: 'BLUE HOUR',
    imagePosition: 'left center',
    summary: '감정 기록과 대화 로그를 읽으며 관계를 복원하는 로맨스 기반 인터랙티브 챗봇.',
    platforms: [
      { label: 'JanitorAI', href: 'https://example.com' },
    ],
  },
  {
    id: 'winter-protocol',
    name: 'WINTER PROTOCOL',
    imagePosition: 'right center',
    summary: '러시아어 대사와 차가운 생존 서사를 중심으로 설계한 호러 시뮬레이션 챗봇.',
    platforms: [
      { label: 'Character.AI', href: 'https://example.com' },
      { label: 'Website', href: 'https://example.com' },
      { label: 'Mirror', href: 'https://example.com' },
    ],
  },
];

export const notes = [
  {
    id: 'opening-line-before-lore',
    date: '2026.07.09',
    title: '캐릭터의 첫 문장은 세계관보다 먼저 온다',
    body: '챗봇을 만들 때 긴 설정집보다 먼저 정하는 것은 첫 응답의 온도다. 사용자는 세계관을 읽으러 들어오는 것이 아니라, 누군가가 자신을 어떻게 맞이하는지 보러 들어온다.',
    tags: ['OPENING', 'TONE'],
  },
  {
    id: 'silence-in-horror-bots',
    date: '2026.06.18',
    title: '호러 챗봇에서 침묵을 쓰는 법',
    body: '무서운 대사는 많이 쓰면 금방 소모된다. 대신 정보가 비어 있는 구간, 너무 늦게 오는 답장, 설명하지 않는 사물을 남기면 대화 자체가 공간처럼 느껴진다.',
    tags: ['HORROR', 'PACING'],
  },
  {
    id: 'platform-tone-review',
    date: '2026.05.22',
    title: '플랫폼별 말투 조정 후기',
    body: '같은 캐릭터라도 플랫폼마다 응답 길이와 검열, 반복 패턴이 다르다. 그래서 완성본 하나를 올리는 느낌보다, 각 플랫폼에 맞게 다른 공연 버전을 만드는 쪽에 가깝다.',
    tags: ['REVIEW', 'PLATFORM'],
  },
];

export const widgets = [
  {
    id: 'terminal-card',
    name: 'TERMINAL PROFILE CARD',
    description: '어두운 배경 위에 작은 프로필 터미널을 띄우는 HTML 위젯.',
    html: `<div style="width:280px;border:2px solid #0055ff;background:#030712;color:#fff;font-family:monospace;padding:16px;box-shadow:0 0 30px rgba(0,85,255,.35)">
  <div style="color:#0055ff;font-size:12px;letter-spacing:2px">ASTERISM.LOG</div>
  <h3 style="margin:10px 0 8px;font-size:22px">AI CHATBOT CREATOR</h3>
  <p style="margin:0;color:#b8c7ff;line-height:1.6;font-size:13px">Narrative systems, character bots, and tiny haunted interfaces.</p>
</div>`,
  },
  {
    id: 'link-badge',
    name: 'BLUE ACCESS BADGE',
    description: '챗봇 링크나 외부 페이지로 보내는 작은 버튼형 HTML 조각.',
    html: `<a href="https://example.com" target="_blank" style="display:inline-flex;align-items:center;gap:8px;background:#0055ff;color:#fff;font-family:monospace;font-weight:700;text-decoration:none;padding:10px 14px;border:1px solid #fff">
  <span>▶</span>
  <span>PLAY CHATBOT</span>
</a>`,
  },
];

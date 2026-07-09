const notes = [
  {
    date: '2026.07.09',
    title: '캐릭터의 첫 문장은 세계관보다 먼저 온다',
    body: '챗봇을 만들 때 긴 설정집보다 먼저 정하는 것은 첫 응답의 온도다. 사용자는 세계관을 읽으러 들어오는 것이 아니라, 누군가가 자신을 어떻게 맞이하는지 보러 들어온다.',
    tags: ['OPENING', 'TONE'],
  },
  {
    date: '2026.06.18',
    title: '호러 챗봇에서 침묵을 쓰는 법',
    body: '무서운 대사는 많이 쓰면 금방 소모된다. 대신 정보가 비어 있는 구간, 너무 늦게 오는 답장, 설명하지 않는 사물을 남기면 대화 자체가 공간처럼 느껴진다.',
    tags: ['HORROR', 'PACING'],
  },
  {
    date: '2026.05.22',
    title: '플랫폼별 말투 조정 후기',
    body: '같은 캐릭터라도 플랫폼마다 응답 길이와 검열, 반복 패턴이 다르다. 그래서 완성본 하나를 올리는 느낌보다, 각 플랫폼에 맞게 다른 공연 버전을 만드는 쪽에 가깝다.',
    tags: ['REVIEW', 'PLATFORM'],
  },
];

function NotesPopup({ onClose }) {
  return (
    <div onClick={onClose} style={overlayStyle}>
      <article onClick={(e) => e.stopPropagation()} style={panelStyle}>
        <button onClick={onClose} style={closeButtonStyle}>×</button>
        <header style={headerStyle}>
          <div style={eyebrowStyle}>ARCHIVE NODE 03</div>
          <h2 style={titleStyle}>PRODUCTION NOTES</h2>
          <p style={introStyle}>챗봇 제작 노트, 후기, 짧은 일기들을 쌓아두는 블로그형 공간.</p>
        </header>

        <div style={noteListStyle}>
          {notes.map((note) => (
            <section key={note.title} style={noteStyle}>
              <div style={dateStyle}>{note.date}</div>
              <h3 style={noteTitleStyle}>{note.title}</h3>
              <p style={bodyStyle}>{note.body}</p>
              <div style={tagRowStyle}>
                {note.tags.map((tag) => (
                  <span key={tag} style={tagStyle}>{tag}</span>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed',
  inset: 0,
  zIndex: 100,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '24px',
  backgroundColor: 'rgba(0,0,0,0.82)',
};

const panelStyle = {
  position: 'relative',
  width: 'min(860px, 94vw)',
  maxHeight: '90vh',
  overflow: 'auto',
  border: '2px solid rgba(0,85,255,0.75)',
  background: 'linear-gradient(180deg, rgba(6,8,14,0.97), rgba(0,0,0,0.96))',
  boxShadow: '0 30px 80px rgba(0,0,0,0.9), inset 0 0 70px rgba(0,85,255,0.1)',
  color: '#fff',
  fontFamily: 'monospace',
};

const closeButtonStyle = {
  position: 'absolute',
  top: '12px',
  right: '14px',
  zIndex: 2,
  border: '1px solid #0055ff',
  background: '#000',
  color: '#fff',
  fontSize: '22px',
  width: '34px',
  height: '34px',
  cursor: 'pointer',
};

const headerStyle = {
  padding: '30px 62px 24px 30px',
  borderBottom: '1px solid rgba(0,85,255,0.55)',
};

const eyebrowStyle = {
  color: '#0055ff',
  fontSize: '12px',
  letterSpacing: '2px',
  marginBottom: '8px',
};

const titleStyle = {
  margin: 0,
  color: '#fff',
  fontSize: 'clamp(24px, 4vw, 42px)',
  lineHeight: 1,
  letterSpacing: 0,
};

const introStyle = {
  margin: '14px 0 0',
  color: '#b8c7ff',
  fontSize: '14px',
  lineHeight: 1.7,
};

const noteListStyle = {
  display: 'grid',
  gap: '16px',
  padding: '24px',
};

const noteStyle = {
  border: '1px dashed rgba(0,85,255,0.75)',
  background: 'rgba(255,255,255,0.035)',
  padding: '20px',
};

const dateStyle = {
  color: '#0055ff',
  fontSize: '12px',
  letterSpacing: '1px',
  marginBottom: '10px',
};

const noteTitleStyle = {
  margin: '0 0 12px',
  color: '#fff',
  fontSize: '20px',
  lineHeight: 1.35,
  letterSpacing: 0,
};

const bodyStyle = {
  margin: 0,
  color: '#d9e4ff',
  fontSize: '14px',
  lineHeight: 1.8,
};

const tagRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '8px',
  marginTop: '16px',
};

const tagStyle = {
  border: '1px solid #0055ff',
  color: '#0055ff',
  padding: '5px 8px',
  fontSize: '11px',
};

export default NotesPopup;

import { useEffect, useState } from 'react';
import { CONTENT_UPDATED_EVENT, getMergedContent, loadMergedContent } from './data/contentStore';

function NotesPopup({ onClose }) {
  const [content, setContent] = useState(() => getMergedContent());
  const { notes } = content;
  const [selectedId, setSelectedId] = useState(notes[0]?.id);
  const selectedNote = notes.find((note) => note.id === selectedId) || notes[0];

  useEffect(() => {
    let isMounted = true;
    const syncContent = async () => {
      const nextContent = await loadMergedContent();
      if (isMounted) setContent(nextContent);
    };
    const handleContentUpdate = () => {
      syncContent();
    };

    syncContent();
    window.addEventListener(CONTENT_UPDATED_EVENT, handleContentUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleContentUpdate);
    };
  }, []);

  return (
    <div onClick={onClose} style={overlayStyle}>
      <article onClick={(e) => e.stopPropagation()} style={panelStyle}>
        <button onClick={onClose} style={closeButtonStyle}>×</button>
        <header style={headerStyle}>
          <div style={eyebrowStyle}>ARCHIVE NODE 03</div>
          <h2 style={titleStyle}>PRODUCTION NOTES</h2>
          <p style={introStyle}>챗봇 제작 노트, 후기, 짧은 일기들을 쌓아두는 블로그형 공간.</p>
        </header>

        <div style={contentStyle}>
          <div style={noteListStyle}>
            {notes.map((note) => (
              <button
                key={note.id}
                type="button"
                onClick={() => setSelectedId(note.id)}
                style={{
                  ...noteButtonStyle,
                  borderColor: selectedId === note.id ? '#fff' : 'rgba(0,85,255,0.75)',
                  color: selectedId === note.id ? '#fff' : '#d9e4ff',
                }}
              >
                <span style={dateStyle}>{note.date}</span>
                <span style={noteButtonTitleStyle}>{note.title}</span>
              </button>
            ))}
          </div>

          {selectedNote && (
            <section style={noteDetailStyle}>
              <div style={dateStyle}>{selectedNote.date}</div>
              <h3 style={noteTitleStyle}>{selectedNote.title}</h3>
              {selectedNote.image && (
                <img src={selectedNote.image} alt="" style={noteImageStyle} />
              )}
              <p style={bodyStyle}>{selectedNote.body}</p>
              <div style={tagRowStyle}>
                {selectedNote.tags.map((tag) => (
                  <span key={tag} style={tagStyle}>{tag}</span>
                ))}
              </div>
            </section>
          )}
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

const contentStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
  gap: '18px',
  padding: '24px',
};

const noteListStyle = {
  display: 'grid',
  gap: '10px',
  alignContent: 'start',
};

const noteButtonStyle = {
  border: '1px dashed rgba(0,85,255,0.75)',
  background: 'rgba(255,255,255,0.035)',
  padding: '14px',
  cursor: 'pointer',
  display: 'grid',
  gap: '8px',
  textAlign: 'left',
  fontFamily: 'monospace',
};

const noteButtonTitleStyle = {
  fontSize: '15px',
  lineHeight: 1.45,
  fontWeight: 'bold',
};

const noteDetailStyle = {
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
  whiteSpace: 'pre-wrap',
};

const noteImageStyle = {
  width: '100%',
  maxHeight: '320px',
  objectFit: 'cover',
  border: '1px solid rgba(255,255,255,0.45)',
  marginBottom: '16px',
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

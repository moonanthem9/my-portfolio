import { useEffect, useState } from 'react';
import { CONTENT_UPDATED_EVENT, getMergedContent } from './data/contentStore';

function ChatbotPopup({ mainImageUrl, onClose }) {
  const [content, setContent] = useState(() => getMergedContent());
  const { chatbots } = content;
  const [selectedId, setSelectedId] = useState(chatbots[0]?.id);
  const selectedBot = chatbots.find((bot) => bot.id === selectedId) || chatbots[0];

  useEffect(() => {
    const handleContentUpdate = () => setContent(getMergedContent());
    window.addEventListener(CONTENT_UPDATED_EVENT, handleContentUpdate);

    return () => window.removeEventListener(CONTENT_UPDATED_EVENT, handleContentUpdate);
  }, []);

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={panelStyle}>
        <button onClick={onClose} style={closeButtonStyle}>×</button>
        <header style={headerStyle}>
          <div>
            <div style={eyebrowStyle}>ARCHIVE NODE 02</div>
            <h2 style={titleStyle}>CHATBOT GALLERY</h2>
          </div>
          <div style={statusStyle}>BOT_INDEX: {chatbots.length}</div>
        </header>

        <div style={contentStyle}>
          <section style={galleryStyle}>
            {chatbots.map((bot) => (
              <button
                key={bot.id}
                type="button"
                onClick={() => setSelectedId(bot.id)}
                style={{
                  ...cardStyle,
                  borderColor: selectedId === bot.id ? '#ffffff' : '#0055ff',
                  boxShadow: selectedId === bot.id ? '0 0 24px rgba(0,85,255,0.75)' : '0 10px 24px rgba(0,0,0,0.55)'
                }}
              >
                <span style={{
                  ...thumbStyle,
                  backgroundImage: `url(${bot.image || mainImageUrl})`,
                  backgroundPosition: bot.imagePosition,
                }} />
                <span style={cardLabelStyle}>{bot.name}</span>
              </button>
            ))}
          </section>

          <section style={detailStyle}>
            <div style={{
              ...detailImageStyle,
              backgroundImage: `url(${selectedBot?.image || mainImageUrl})`,
              backgroundPosition: selectedBot?.imagePosition || 'center',
            }} />
            <div style={detailTextStyle}>
              {selectedBot && (
                <>
                  <div style={fieldLabelStyle}>NAME</div>
                  <h3 style={detailTitleStyle}>{selectedBot.name}</h3>
                  <div style={fieldLabelStyle}>SUMMARY</div>
                  <p style={summaryStyle}>{selectedBot.summary}</p>
                  <div style={fieldLabelStyle}>PLAY_LINKS</div>
                  <div style={linkRowStyle}>
                    {selectedBot.platforms.map((platform) => (
                      <a key={platform.label} href={platform.href} target="_blank" rel="noreferrer" style={linkStyle}>
                        {platform.label}
                      </a>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </div>
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
  width: 'min(1040px, 94vw)',
  maxHeight: '90vh',
  overflow: 'auto',
  border: '2px solid rgba(0,85,255,0.75)',
  background: 'rgba(5,8,16,0.94)',
  boxShadow: '0 30px 80px rgba(0,0,0,0.9), inset 0 0 70px rgba(0,85,255,0.12)',
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
  display: 'flex',
  justifyContent: 'space-between',
  gap: '24px',
  padding: '28px 62px 20px 28px',
  borderBottom: '1px solid rgba(0,85,255,0.55)',
};

const eyebrowStyle = {
  color: '#0055ff',
  fontSize: '12px',
  letterSpacing: '2px',
  marginBottom: '6px',
};

const titleStyle = {
  margin: 0,
  color: '#fff',
  fontSize: 'clamp(24px, 4vw, 42px)',
  lineHeight: 1,
  letterSpacing: 0,
};

const statusStyle = {
  color: '#0055ff',
  fontSize: '12px',
  alignSelf: 'end',
  whiteSpace: 'nowrap',
};

const contentStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
  gap: '24px',
  padding: '24px',
};

const galleryStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
  gap: '14px',
  alignContent: 'start',
};

const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  minHeight: '190px',
  padding: '8px',
  border: '2px solid #0055ff',
  background: '#02040a',
  color: '#fff',
  cursor: 'pointer',
  textAlign: 'left',
};

const thumbStyle = {
  flex: 1,
  minHeight: '132px',
  backgroundSize: 'cover',
  filter: 'grayscale(0.4) contrast(1.15)',
};

const cardLabelStyle = {
  color: '#0055ff',
  fontSize: '12px',
  fontWeight: 'bold',
  letterSpacing: '1px',
};

const detailStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
  gap: '20px',
  minHeight: '410px',
  padding: '18px',
  border: '1px dashed rgba(0,85,255,0.8)',
  background: 'rgba(0,0,0,0.45)',
};

const detailImageStyle = {
  minHeight: '320px',
  backgroundSize: 'cover',
  border: '1px solid rgba(255,255,255,0.5)',
  filter: 'contrast(1.1)',
};

const detailTextStyle = {
  display: 'flex',
  flexDirection: 'column',
};

const fieldLabelStyle = {
  color: '#0055ff',
  fontSize: '11px',
  letterSpacing: '2px',
  marginBottom: '6px',
};

const detailTitleStyle = {
  margin: '0 0 24px',
  fontSize: '30px',
  color: '#fff',
  letterSpacing: 0,
};

const summaryStyle = {
  margin: '0 0 28px',
  color: '#d9e4ff',
  fontSize: '15px',
  lineHeight: 1.75,
};

const linkRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  marginTop: 'auto',
};

const linkStyle = {
  border: '1px solid #0055ff',
  background: '#0055ff',
  color: '#fff',
  padding: '9px 12px',
  textDecoration: 'none',
  fontSize: '12px',
  fontWeight: 'bold',
};

export default ChatbotPopup;

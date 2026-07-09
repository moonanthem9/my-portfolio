import { useEffect, useState } from 'react';
import { CONTENT_UPDATED_EVENT, getMergedContent, loadMergedContent } from './data/contentStore';

function WidgetsPopup({ onClose }) {
  const [content, setContent] = useState(() => getMergedContent());
  const { widgets } = content;
  const [selectedId, setSelectedId] = useState(widgets[0]?.id);
  const [copyStatus, setCopyStatus] = useState('COPY HTML');
  const selectedWidget = widgets.find((widget) => widget.id === selectedId) || widgets[0];

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

  const handleCopy = async () => {
    if (!selectedWidget) return;

    try {
      await navigator.clipboard.writeText(selectedWidget.html);
      setCopyStatus('COPIED');
      setTimeout(() => setCopyStatus('COPY HTML'), 1400);
    } catch {
      setCopyStatus('COPY FAILED');
      setTimeout(() => setCopyStatus('COPY HTML'), 1400);
    }
  };

  return (
    <div onClick={onClose} style={overlayStyle}>
      <div onClick={(e) => e.stopPropagation()} style={panelStyle}>
        <button onClick={onClose} style={closeButtonStyle}>×</button>
        <header style={headerStyle}>
          <div>
            <div style={eyebrowStyle}>ARCHIVE NODE 04</div>
            <h2 style={titleStyle}>HTML WIDGET VAULT</h2>
          </div>
          <button type="button" onClick={handleCopy} style={copyButtonStyle}>{copyStatus}</button>
        </header>

        <div style={contentStyle}>
          <aside style={listStyle}>
            {widgets.map((widget) => (
              <button
                key={widget.id}
                type="button"
                onClick={() => {
                  setSelectedId(widget.id);
                  setCopyStatus('COPY HTML');
                }}
                style={{
                  ...widgetButtonStyle,
                  borderColor: selectedId === widget.id ? '#fff' : '#0055ff',
                  color: selectedId === widget.id ? '#fff' : '#0055ff',
                }}
              >
                <span style={widgetNameStyle}>{widget.name}</span>
                <span style={widgetDescStyle}>{widget.description}</span>
              </button>
            ))}
          </aside>

          <main style={previewColumnStyle}>
            <section style={previewFrameStyle}>
              <iframe
                title={`${selectedWidget?.name || 'Widget'} preview`}
                srcDoc={selectedWidget?.html || ''}
                style={iframeStyle}
                sandbox=""
              />
            </section>
            <section style={codeBlockStyle}>
              <div style={codeHeaderStyle}>{selectedWidget?.name || 'EMPTY'}.html</div>
              <pre style={preStyle}>{selectedWidget?.html || ''}</pre>
            </section>
          </main>
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
  background: 'rgba(5,8,16,0.96)',
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
  gap: '18px',
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

const copyButtonStyle = {
  alignSelf: 'end',
  border: '1px solid #fff',
  background: '#0055ff',
  color: '#fff',
  padding: '10px 14px',
  fontFamily: 'monospace',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const contentStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
  gap: '20px',
  padding: '24px',
};

const listStyle = {
  display: 'grid',
  gap: '12px',
  alignContent: 'start',
};

const widgetButtonStyle = {
  display: 'grid',
  gap: '8px',
  border: '1px solid #0055ff',
  background: '#02040a',
  padding: '14px',
  textAlign: 'left',
  cursor: 'pointer',
  fontFamily: 'monospace',
};

const widgetNameStyle = {
  fontSize: '13px',
  fontWeight: 'bold',
};

const widgetDescStyle = {
  color: '#b8c7ff',
  fontSize: '12px',
  lineHeight: 1.55,
};

const previewColumnStyle = {
  display: 'grid',
  gap: '14px',
};

const previewFrameStyle = {
  minHeight: '260px',
  border: '1px dashed rgba(0,85,255,0.85)',
  background: 'repeating-linear-gradient(transparent, transparent 18px, rgba(0,85,255,0.08) 19px)',
  display: 'grid',
  placeItems: 'center',
  padding: '18px',
};

const iframeStyle = {
  width: '100%',
  height: '240px',
  border: 0,
  background: 'transparent',
};

const codeBlockStyle = {
  border: '1px solid rgba(0,85,255,0.7)',
  background: '#030712',
};

const codeHeaderStyle = {
  borderBottom: '1px solid rgba(0,85,255,0.7)',
  color: '#0055ff',
  padding: '9px 12px',
  fontSize: '12px',
};

const preStyle = {
  margin: 0,
  padding: '14px',
  maxHeight: '220px',
  overflow: 'auto',
  color: '#d9e4ff',
  fontSize: '12px',
  lineHeight: 1.6,
  whiteSpace: 'pre-wrap',
  textAlign: 'left',
};

export default WidgetsPopup;

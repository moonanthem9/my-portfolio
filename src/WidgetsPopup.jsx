import { useEffect, useMemo, useState } from 'react';
import './archivePopup.css';
import { CONTENT_UPDATED_EVENT, getMergedContent, loadMergedContent } from './data/contentStore';

function WidgetsPopup({ onClose }) {
  const [content, setContent] = useState(() => getMergedContent());
  const { widgets } = content;
  const [selectedId, setSelectedId] = useState(widgets[0]?.id);
  const [fieldValues, setFieldValues] = useState({});
  const [copyStatus, setCopyStatus] = useState('COPY HTML');
  const selectedWidget = widgets.find((widget) => widget.id === selectedId) || widgets[0];
  const currentFields = useMemo(() => selectedWidget?.fields || [], [selectedWidget?.fields]);
  const mergedFieldValues = useMemo(
    () => ({ ...getDefaultFieldValues(currentFields), ...fieldValues }),
    [currentFields, fieldValues],
  );
  const renderedHtml = renderTemplate(selectedWidget?.html || '', mergedFieldValues, currentFields);

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
      await navigator.clipboard.writeText(renderedHtml);
      setCopyStatus('COPIED');
      setTimeout(() => setCopyStatus('COPY HTML'), 1400);
    } catch {
      setCopyStatus('COPY FAILED');
      setTimeout(() => setCopyStatus('COPY HTML'), 1400);
    }
  };

  return (
    <div className="archive-overlay" onClick={onClose}>
      <div className="archive-panel" onClick={(event) => event.stopPropagation()}>
        <button className="archive-close" onClick={onClose}>×</button>
        <header className="archive-header">
          <div>
            <div className="archive-eyebrow">ARCHIVE NODE 04</div>
            <h2 className="archive-title">HTML WIDGET VAULT</h2>
            <p className="archive-subtitle">공유 가능한 HTML 조각을 미리 보고, 필요한 코드를 복사합니다.</p>
          </div>
          <div className="archive-meta">WIDGET_INDEX: {widgets.length}</div>
        </header>

        <div className="archive-body">
          <div className="widget-layout">
            <aside className="widget-list">
              {widgets.map((widget) => (
                <button
                  key={widget.id}
                  type="button"
                  className={`widget-button ${selectedId === widget.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setSelectedId(widget.id);
                    setFieldValues({});
                    setCopyStatus('COPY HTML');
                  }}
                >
                  <span className="widget-name">{widget.name}</span>
                  <span className="widget-desc">{widget.description}</span>
                </button>
              ))}
            </aside>

            <main className="widget-workspace">
              <section className="preview-frame">
                <iframe
                  title={`${selectedWidget?.name || 'Widget'} preview`}
                  srcDoc={renderedHtml}
                  sandbox=""
                />
              </section>
              {currentFields.length > 0 && (
                <section className="customizer-card">
                  <div className="field-label">CUSTOMIZE</div>
                  <div className="customizer-grid">
                    {currentFields.map((field) => (
                      <label key={field.key} className="customizer-field">
                        <span>{field.label || field.key}</span>
                        <input
                          value={mergedFieldValues[field.key] || ''}
                          onChange={(event) => {
                            setFieldValues((prev) => ({
                              ...prev,
                              [field.key]: event.target.value,
                            }));
                          }}
                        />
                      </label>
                    ))}
                  </div>
                </section>
              )}
              <section className="code-card">
                <div className="code-header">
                  <span>{selectedWidget?.name || 'EMPTY'}.html</span>
                  <button type="button" onClick={handleCopy} className="copy-button">{copyStatus}</button>
                </div>
                <pre>{renderedHtml}</pre>
              </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function getDefaultFieldValues(fields) {
  return Object.fromEntries(fields.map((field) => [field.key, field.defaultValue || '']));
}

function renderTemplate(html, values, fields) {
  return fields.reduce((result, field) => {
    const value = values[field.key] ?? field.defaultValue ?? '';
    return result.replaceAll(`{{${field.key}}}`, value);
  }, html);
}

export default WidgetsPopup;

import { useEffect, useState } from 'react';
import {
  clearAdminPassword,
  deleteContentItem,
  getAdminPassword,
  getStoredContent,
  loadStoredContent,
  makeContentId,
  saveContentItem,
  setAdminPassword,
  uploadImage,
} from './data/contentStore';

const initialForms = {
  chatbots: {
    name: '',
    summary: '',
    image: '',
    platform1Label: '',
    platform1Href: '',
    platform2Label: '',
    platform2Href: '',
    platform3Label: '',
    platform3Href: '',
  },
  notes: {
    title: '',
    body: '',
    image: '',
    tags: '',
  },
  widgets: {
    name: '',
    description: '',
    html: '',
  },
};

function AdminPage() {
  const [section, setSection] = useState('notes');
  const [forms, setForms] = useState(initialForms);
  const [savedContent, setSavedContent] = useState(() => getStoredContent());
  const [password, setPassword] = useState(() => getAdminPassword());
  const [isUnlocked, setIsUnlocked] = useState(() => Boolean(getAdminPassword()));
  const [isBusy, setIsBusy] = useState(false);
  const [status, setStatus] = useState('READY');

  const activeForm = forms[section];

  useEffect(() => {
    let isMounted = true;

    loadStoredContent().then((content) => {
      if (isMounted) setSavedContent(content);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateField = (field, value) => {
    setForms((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!password) {
      setStatus('PASSWORD_REQUIRED');
      return;
    }

    setIsBusy(true);
    setStatus('UPLOADING_IMAGE');

    try {
      const imageUrl = await uploadImage(file, password);
      updateField('image', imageUrl);
      setStatus('IMAGE_UPLOADED');
    } catch (error) {
      setStatus(error.message === 'Unauthorized.' ? 'UNAUTHORIZED' : 'IMAGE_UPLOAD_FAILED');
    } finally {
      setIsBusy(false);
    }
  };

  const handleUnlock = (event) => {
    event.preventDefault();

    if (!password.trim()) {
      setStatus('PASSWORD_REQUIRED');
      return;
    }

    setAdminPassword(password);
    setIsUnlocked(true);
    setStatus('UNLOCKED');
  };

  const handleLock = () => {
    clearAdminPassword();
    setPassword('');
    setIsUnlocked(false);
    setStatus('LOCKED');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const item = buildContentItem(section, activeForm);
    if (!item) {
      setStatus('TITLE_REQUIRED');
      return;
    }

    setIsBusy(true);
    setStatus('SAVING');

    try {
      const nextContent = await saveContentItem(section, item, password);
      setSavedContent(nextContent);
      setForms((prev) => ({ ...prev, [section]: initialForms[section] }));
      setStatus('SAVED_TO_GITHUB');
    } catch (error) {
      setStatus(error.message === 'Unauthorized.' ? 'UNAUTHORIZED' : 'SAVE_FAILED');
    } finally {
      setIsBusy(false);
    }
  };

  const handleDelete = async (targetSection, id) => {
    setIsBusy(true);
    setStatus('DELETING');

    try {
      const nextContent = await deleteContentItem(targetSection, id, password);
      setSavedContent(nextContent);
      setStatus('DELETED_FROM_GITHUB');
    } catch (error) {
      setStatus(error.message === 'Unauthorized.' ? 'UNAUTHORIZED' : 'DELETE_FAILED');
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <main style={pageStyle}>
      <section style={panelStyle}>
        <header style={headerStyle}>
          <div>
            <div style={eyebrowStyle}>ASTERISM ADMIN</div>
            <h1 style={titleStyle}>WRITE ARCHIVE ENTRY</h1>
          </div>
          <div style={headerActionStyle}>
            {isUnlocked && <button type="button" onClick={handleLock} style={lockButtonStyle}>LOCK</button>}
            <a href="/" style={homeLinkStyle}>RETURN</a>
          </div>
        </header>

        {!isUnlocked ? (
          <form onSubmit={handleUnlock} style={formStyle}>
            <Field
              label="ADMIN PASSWORD"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Vercel ADMIN_PASSWORD"
            />
            <div style={actionRowStyle}>
              <button type="submit" style={saveButtonStyle}>UNLOCK ADMIN</button>
              <div style={statusStyle}>STATUS: {status}</div>
            </div>
          </form>
        ) : (
          <>
            <nav style={tabRowStyle} aria-label="content type">
              {[
                ['notes', 'NOTES'],
                ['chatbots', 'CHATBOT'],
                ['widgets', 'WIDGET'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSection(id);
                    setStatus('READY');
                  }}
                  style={{
                    ...tabStyle,
                    background: section === id ? '#0055ff' : '#050812',
                    color: section === id ? '#fff' : '#0055ff',
                  }}
                >
                  {label}
                </button>
              ))}
            </nav>

            <form onSubmit={handleSubmit} style={formStyle}>
              {section === 'notes' && (
                <>
                  <Field label="TITLE" value={activeForm.title} onChange={(value) => updateField('title', value)} />
                  <TextArea label="BODY" value={activeForm.body} onChange={(value) => updateField('body', value)} minHeight="220px" />
                  <Field label="TAGS" value={activeForm.tags} onChange={(value) => updateField('tags', value)} placeholder="OPENING, REVIEW, DIARY" />
                  <ImageField image={activeForm.image} onUpload={handleImageUpload} onClear={() => updateField('image', '')} />
                </>
              )}

              {section === 'chatbots' && (
                <>
                  <Field label="NAME" value={activeForm.name} onChange={(value) => updateField('name', value)} />
                  <TextArea label="SUMMARY" value={activeForm.summary} onChange={(value) => updateField('summary', value)} />
                  <ImageField image={activeForm.image} onUpload={handleImageUpload} onClear={() => updateField('image', '')} />
                  <div style={subGridStyle}>
                    <Field label="PLATFORM 1 NAME" value={activeForm.platform1Label} onChange={(value) => updateField('platform1Label', value)} />
                    <Field label="PLATFORM 1 URL" value={activeForm.platform1Href} onChange={(value) => updateField('platform1Href', value)} />
                    <Field label="PLATFORM 2 NAME" value={activeForm.platform2Label} onChange={(value) => updateField('platform2Label', value)} />
                    <Field label="PLATFORM 2 URL" value={activeForm.platform2Href} onChange={(value) => updateField('platform2Href', value)} />
                    <Field label="PLATFORM 3 NAME" value={activeForm.platform3Label} onChange={(value) => updateField('platform3Label', value)} />
                    <Field label="PLATFORM 3 URL" value={activeForm.platform3Href} onChange={(value) => updateField('platform3Href', value)} />
                  </div>
                </>
              )}

              {section === 'widgets' && (
                <>
                  <Field label="NAME" value={activeForm.name} onChange={(value) => updateField('name', value)} />
                  <Field label="DESCRIPTION" value={activeForm.description} onChange={(value) => updateField('description', value)} />
                  <TextArea label="HTML" value={activeForm.html} onChange={(value) => updateField('html', value)} minHeight="260px" />
                </>
              )}

              <div style={actionRowStyle}>
                <button type="submit" disabled={isBusy} style={saveButtonStyle}>SAVE ENTRY</button>
                <div style={statusStyle}>STATUS: {status}</div>
              </div>
            </form>
          </>
        )}
      </section>

      <aside style={previewPanelStyle}>
        <div style={eyebrowStyle}>GITHUB CONTENT</div>
        <h2 style={sideTitleStyle}>SAVED ENTRIES</h2>
        <ContentCount label="NOTES" count={savedContent.notes.length} />
        <ContentCount label="CHATBOTS" count={savedContent.chatbots.length} />
        <ContentCount label="WIDGETS" count={savedContent.widgets.length} />
        {isUnlocked && (
          <SavedContentList content={savedContent} onDelete={handleDelete} isBusy={isBusy} />
        )}
        <p style={hintStyle}>저장과 삭제는 GitHub의 `src/data/userContent.json`에 커밋됩니다. Vercel 환경 변수 설정이 필요합니다.</p>
      </aside>
    </main>
  );
}

function buildContentItem(section, form) {
  if (section === 'notes') {
    if (!form.title.trim()) return null;

    return {
      id: makeContentId(form.title),
      date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      title: form.title.trim(),
      body: form.body.trim(),
      image: form.image,
      tags: form.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    };
  }

  if (section === 'chatbots') {
    if (!form.name.trim()) return null;

    const platforms = [1, 2, 3]
      .map((index) => ({
        label: form[`platform${index}Label`].trim(),
        href: form[`platform${index}Href`].trim(),
      }))
      .filter((platform) => platform.label && platform.href);

    return {
      id: makeContentId(form.name),
      name: form.name.trim(),
      summary: form.summary.trim(),
      image: form.image,
      imagePosition: 'center',
      platforms,
    };
  }

  if (section === 'widgets') {
    if (!form.name.trim()) return null;

    return {
      id: makeContentId(form.name),
      name: form.name.trim(),
      description: form.description.trim(),
      html: form.html,
    };
  }

  return null;
}

function Field({ label, value, onChange, placeholder = '', type = 'text' }) {
  return (
    <label style={labelStyle}>
      <span style={labelTextStyle}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        style={inputStyle}
      />
    </label>
  );
}

function SavedContentList({ content, onDelete, isBusy }) {
  return (
    <div style={savedListStyle}>
      {[
        ['notes', 'NOTES'],
        ['chatbots', 'CHATBOTS'],
        ['widgets', 'WIDGETS'],
      ].map(([section, label]) => (
        <section key={section} style={savedSectionStyle}>
          <div style={labelTextStyle}>{label}</div>
          {content[section].length === 0 && <div style={emptyTextStyle}>EMPTY</div>}
          {content[section].map((item) => (
            <div key={item.id} style={savedItemStyle}>
              <span>{item.title || item.name}</span>
              <button
                type="button"
                disabled={isBusy}
                onClick={() => onDelete(section, item.id)}
                style={deleteButtonStyle}
              >
                DELETE
              </button>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

function TextArea({ label, value, onChange, minHeight = '160px' }) {
  return (
    <label style={labelStyle}>
      <span style={labelTextStyle}>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ ...inputStyle, minHeight, resize: 'vertical' }}
      />
    </label>
  );
}

function ImageField({ image, onUpload, onClear }) {
  return (
    <div style={labelStyle}>
      <span style={labelTextStyle}>PHOTO / BLOB UPLOAD / MAX 3MB</span>
      <input type="file" accept="image/*" onChange={onUpload} style={fileInputStyle} />
      {image && (
        <div style={imagePreviewWrapStyle}>
          <img src={image} alt="" style={imagePreviewStyle} />
          <div style={imageUrlStyle}>{image}</div>
          <button type="button" onClick={onClear} style={clearButtonStyle}>CLEAR PHOTO</button>
        </div>
      )}
    </div>
  );
}

function ContentCount({ label, count }) {
  return (
    <div style={countRowStyle}>
      <span>{label}</span>
      <strong>{count}</strong>
    </div>
  );
}

const pageStyle = {
  minHeight: '100vh',
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
  gap: '20px',
  padding: '24px',
  background: '#050505',
  color: '#fff',
  fontFamily: 'monospace',
  boxSizing: 'border-box',
};

const panelStyle = {
  border: '2px solid rgba(0,85,255,0.78)',
  background: 'rgba(5,8,16,0.96)',
  boxShadow: 'inset 0 0 70px rgba(0,85,255,0.12)',
};

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '20px',
  padding: '28px',
  borderBottom: '1px solid rgba(0,85,255,0.55)',
};

const headerActionStyle = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '10px',
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
  fontSize: 'clamp(26px, 5vw, 48px)',
  lineHeight: 1,
  letterSpacing: 0,
};

const homeLinkStyle = {
  alignSelf: 'start',
  border: '1px solid #0055ff',
  color: '#fff',
  background: '#000',
  textDecoration: 'none',
  padding: '10px 14px',
  fontWeight: 'bold',
};

const lockButtonStyle = {
  border: '1px solid #0055ff',
  color: '#fff',
  background: '#000',
  padding: '10px 14px',
  fontFamily: 'monospace',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const tabRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  padding: '18px 28px 0',
};

const tabStyle = {
  border: '1px solid #0055ff',
  padding: '10px 14px',
  fontFamily: 'monospace',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const formStyle = {
  display: 'grid',
  gap: '18px',
  padding: '28px',
};

const subGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
  gap: '14px',
};

const labelStyle = {
  display: 'grid',
  gap: '8px',
};

const labelTextStyle = {
  color: '#0055ff',
  fontSize: '12px',
  letterSpacing: '2px',
};

const inputStyle = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid rgba(0,85,255,0.8)',
  background: '#02040a',
  color: '#fff',
  padding: '12px',
  font: '14px/1.6 monospace',
  outline: 'none',
};

const fileInputStyle = {
  ...inputStyle,
  cursor: 'pointer',
};

const imagePreviewWrapStyle = {
  display: 'grid',
  gap: '10px',
  maxWidth: '360px',
};

const imagePreviewStyle = {
  width: '100%',
  maxHeight: '220px',
  objectFit: 'cover',
  border: '1px solid rgba(255,255,255,0.45)',
};

const imageUrlStyle = {
  color: '#8fa7ff',
  fontSize: '11px',
  lineHeight: 1.5,
  wordBreak: 'break-all',
};

const clearButtonStyle = {
  border: '1px solid #0055ff',
  background: '#000',
  color: '#fff',
  padding: '9px 12px',
  fontFamily: 'monospace',
  cursor: 'pointer',
};

const actionRowStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '14px',
};

const saveButtonStyle = {
  border: '1px solid #fff',
  background: '#0055ff',
  color: '#fff',
  padding: '12px 18px',
  fontFamily: 'monospace',
  fontWeight: 'bold',
  cursor: 'pointer',
};

const savedListStyle = {
  display: 'grid',
  gap: '18px',
  marginTop: '22px',
};

const savedSectionStyle = {
  display: 'grid',
  gap: '8px',
};

const savedItemStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: '10px',
  border: '1px solid rgba(0,85,255,0.4)',
  padding: '9px',
  color: '#d9e4ff',
  fontSize: '12px',
};

const deleteButtonStyle = {
  border: '1px solid #ef4444',
  background: '#190506',
  color: '#fff',
  padding: '6px 8px',
  fontFamily: 'monospace',
  fontSize: '11px',
  cursor: 'pointer',
};

const emptyTextStyle = {
  color: '#6074b6',
  fontSize: '12px',
};

const statusStyle = {
  color: '#b8c7ff',
  fontSize: '12px',
};

const previewPanelStyle = {
  border: '2px solid rgba(0,85,255,0.55)',
  background: 'rgba(0,0,0,0.68)',
  padding: '22px',
  alignSelf: 'start',
};

const sideTitleStyle = {
  margin: '0 0 18px',
  fontSize: '20px',
  color: '#fff',
};

const countRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  borderBottom: '1px solid rgba(0,85,255,0.35)',
  padding: '12px 0',
  color: '#d9e4ff',
};

const hintStyle = {
  margin: '18px 0 0',
  color: '#8fa7ff',
  fontSize: '12px',
  lineHeight: 1.7,
};

export default AdminPage;

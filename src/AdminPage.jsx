import { useEffect, useState } from 'react';
import {
  clearAdminPassword,
  DEFAULT_BACKGROUND_IMAGE,
  deleteContentItem,
  getAdminPassword,
  getStoredContent,
  loadStoredContent,
  makeContentId,
  saveContentItem,
  setAdminPassword,
  updateContentItem,
  updateSiteSettings,
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
    fields: [],
  },
  settings: {
    backgroundImage: '',
  },
};
const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
const BACKGROUND_CONVERT_BYTES = 1 * 1024 * 1024;
const BACKGROUND_JPEG_QUALITY = 0.78;

function AdminPage() {
  const [section, setSection] = useState('notes');
  const [forms, setForms] = useState(initialForms);
  const [savedContent, setSavedContent] = useState(() => getStoredContent());
  const [password, setPassword] = useState(() => getAdminPassword());
  const [isUnlocked, setIsUnlocked] = useState(() => Boolean(getAdminPassword()));
  const [editingEntry, setEditingEntry] = useState(null);
  const [isBusy, setIsBusy] = useState(false);
  const [status, setStatus] = useState('READY');

  const activeForm = forms[section];

  useEffect(() => {
    let isMounted = true;

    loadStoredContent().then((content) => {
      if (isMounted) {
        setSavedContent(content);
        setForms((prev) => ({
          ...prev,
          settings: {
            backgroundImage: content.settings.backgroundImage,
          },
        }));
      }
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

  const updateWidgetField = (index, field, value) => {
    setForms((prev) => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        fields: prev.widgets.fields.map((entry, entryIndex) => (
          entryIndex === index ? { ...entry, [field]: value } : entry
        )),
      },
    }));
  };

  const addWidgetField = () => {
    setForms((prev) => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        fields: [...prev.widgets.fields, { key: '', label: '', defaultValue: '' }],
      },
    }));
  };

  const removeWidgetField = (index) => {
    setForms((prev) => ({
      ...prev,
      widgets: {
        ...prev.widgets,
        fields: prev.widgets.fields.filter((_, entryIndex) => entryIndex !== index),
      },
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_UPLOAD_BYTES) {
      setStatus('IMAGE_TOO_LARGE_MAX_3MB');
      return;
    }

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
      setStatus(`IMAGE_UPLOAD_FAILED: ${error.message}`);
    } finally {
      setIsBusy(false);
    }
  };

  const handleBackgroundUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!password) {
      setStatus('PASSWORD_REQUIRED');
      return;
    }

    setIsBusy(true);
    setStatus('OPTIMIZING_BACKGROUND');

    try {
      const uploadFile = await prepareBackgroundFile(file);
      if (uploadFile.size > MAX_UPLOAD_BYTES) {
        setStatus('BACKGROUND_TOO_LARGE_MAX_3MB');
        return;
      }

      setStatus(uploadFile === file ? 'UPLOADING_BACKGROUND' : 'UPLOADING_OPTIMIZED_BACKGROUND');
      const imageUrl = await uploadImage(uploadFile, password, 'site-backgrounds');
      setForms((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          backgroundImage: imageUrl,
        },
      }));
      setStatus(uploadFile === file ? 'BACKGROUND_UPLOADED' : 'BACKGROUND_OPTIMIZED_AND_UPLOADED');
    } catch (error) {
      setStatus(`BACKGROUND_UPLOAD_FAILED: ${error.message}`);
    } finally {
      setIsBusy(false);
      event.target.value = '';
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

    if (section === 'settings') {
      setIsBusy(true);
      setStatus('SAVING_SETTINGS');

      try {
        const nextContent = await updateSiteSettings({
          backgroundImage: activeForm.backgroundImage || DEFAULT_BACKGROUND_IMAGE,
        }, password);
        setSavedContent(nextContent);
        setStatus('SETTINGS_SAVED_TO_GITHUB');
      } catch (error) {
        setStatus(error.message === 'Unauthorized.' ? 'UNAUTHORIZED' : `SETTINGS_SAVE_FAILED: ${error.message}`);
      } finally {
        setIsBusy(false);
      }
      return;
    }

    const item = buildContentItem(section, activeForm, editingEntry);
    if (!item) {
      setStatus('TITLE_REQUIRED');
      return;
    }

    setIsBusy(true);
    setStatus(editingEntry ? 'UPDATING' : 'SAVING');

    try {
      const nextContent = editingEntry
        ? await updateContentItem(section, item, password)
        : await saveContentItem(section, item, password);
      setSavedContent(nextContent);
      setForms((prev) => ({ ...prev, [section]: initialForms[section] }));
      setEditingEntry(null);
      setStatus(editingEntry ? 'UPDATED_IN_GITHUB' : 'SAVED_TO_GITHUB');
    } catch (error) {
      setStatus(error.message === 'Unauthorized.' ? 'UNAUTHORIZED' : `SAVE_FAILED: ${error.message}`);
    } finally {
      setIsBusy(false);
    }
  };

  const handleEdit = (targetSection, item) => {
    setSection(targetSection);
    setEditingEntry({ section: targetSection, id: item.id, item });
    setForms((prev) => ({
      ...prev,
      [targetSection]: formFromContentItem(targetSection, item),
    }));
    setStatus('EDITING_ENTRY');
  };

  const handleCancelEdit = () => {
    setForms((prev) => ({ ...prev, [section]: initialForms[section] }));
    setEditingEntry(null);
    setStatus('EDIT_CANCELLED');
  };

  const handleDelete = async (targetSection, id) => {
    setIsBusy(true);
    setStatus('DELETING');

    try {
      const nextContent = await deleteContentItem(targetSection, id, password);
      setSavedContent(nextContent);
      if (editingEntry?.section === targetSection && editingEntry.id === id) {
        handleCancelEdit();
      }
      setStatus('DELETED_FROM_GITHUB');
    } catch (error) {
      setStatus(error.message === 'Unauthorized.' ? 'UNAUTHORIZED' : `DELETE_FAILED: ${error.message}`);
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
                ['settings', 'SETTINGS'],
              ].map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setSection(id);
                    setEditingEntry(null);
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
                  <WidgetFieldsEditor
                    fields={activeForm.fields}
                    onAdd={addWidgetField}
                    onRemove={removeWidgetField}
                    onChange={updateWidgetField}
                  />
                </>
              )}

              {section === 'settings' && (
                <SettingsEditor
                  backgroundImage={activeForm.backgroundImage || DEFAULT_BACKGROUND_IMAGE}
                  onUpload={handleBackgroundUpload}
                  onReset={() => updateField('backgroundImage', DEFAULT_BACKGROUND_IMAGE)}
                />
              )}

              <div style={actionRowStyle}>
                <button type="submit" disabled={isBusy} style={saveButtonStyle}>
                  {section === 'settings' ? 'SAVE SETTINGS' : editingEntry ? 'UPDATE ENTRY' : 'SAVE ENTRY'}
                </button>
                {editingEntry && (
                  <button type="button" onClick={handleCancelEdit} disabled={isBusy} style={cancelButtonStyle}>CANCEL EDIT</button>
                )}
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
          <SavedContentList content={savedContent} onEdit={handleEdit} onDelete={handleDelete} isBusy={isBusy} />
        )}
        <p style={hintStyle}>저장과 삭제는 GitHub의 `src/data/userContent.json`에 커밋됩니다. Vercel 환경 변수 설정이 필요합니다.</p>
      </aside>
    </main>
  );
}

function buildContentItem(section, form, editingEntry) {
  if (section === 'notes') {
    if (!form.title.trim()) return null;

    return {
      id: editingEntry?.id || makeContentId(form.title),
      date: editingEntry?.item?.date || new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
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
      id: editingEntry?.id || makeContentId(form.name),
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
      id: editingEntry?.id || makeContentId(form.name),
      name: form.name.trim(),
      description: form.description.trim(),
      html: form.html,
      fields: normalizeWidgetFields(form.fields),
    };
  }

  return null;
}

function formFromContentItem(section, item) {
  if (section === 'notes') {
    return {
      title: item.title || '',
      body: item.body || '',
      image: item.image || '',
      tags: (item.tags || []).join(', '),
    };
  }

  if (section === 'chatbots') {
    const platforms = item.platforms || [];

    return {
      name: item.name || '',
      summary: item.summary || '',
      image: item.image || '',
      platform1Label: platforms[0]?.label || '',
      platform1Href: platforms[0]?.href || '',
      platform2Label: platforms[1]?.label || '',
      platform2Href: platforms[1]?.href || '',
      platform3Label: platforms[2]?.label || '',
      platform3Href: platforms[2]?.href || '',
    };
  }

  if (section === 'widgets') {
    return {
      name: item.name || '',
      description: item.description || '',
      html: item.html || '',
      fields: item.fields || [],
    };
  }

  return initialForms[section];
}

function normalizeWidgetFields(fields) {
  return fields
    .map((field) => ({
      key: field.key.trim(),
      label: field.label.trim() || field.key.trim(),
      defaultValue: field.defaultValue,
    }))
    .filter((field) => field.key);
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

function SavedContentList({ content, onEdit, onDelete, isBusy }) {
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
              <div style={savedActionStyle}>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onEdit(section, item)}
                  style={editButtonStyle}
                >
                  EDIT
                </button>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => onDelete(section, item.id)}
                  style={deleteButtonStyle}
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}

function WidgetFieldsEditor({ fields, onAdd, onRemove, onChange }) {
  return (
    <section style={variablePanelStyle}>
      <div style={variableHeaderStyle}>
        <div>
          <div style={labelTextStyle}>WIDGET VARIABLES</div>
          <p style={variableHintStyle}>HTML에 {'{{key}}'}를 쓰고, 여기서 key와 기본값을 정의하세요.</p>
        </div>
        <button type="button" onClick={onAdd} style={smallButtonStyle}>ADD VARIABLE</button>
      </div>
      {fields.length === 0 && <div style={emptyTextStyle}>NO VARIABLES</div>}
      {fields.map((field, index) => (
        <div key={index} style={variableRowStyle}>
          <Field label="KEY" value={field.key} onChange={(value) => onChange(index, 'key', value)} placeholder="name" />
          <Field label="LABEL" value={field.label} onChange={(value) => onChange(index, 'label', value)} placeholder="Name" />
          <Field label="DEFAULT" value={field.defaultValue} onChange={(value) => onChange(index, 'defaultValue', value)} placeholder="ASTERISM" />
          <button type="button" onClick={() => onRemove(index)} style={deleteButtonStyle}>REMOVE</button>
        </div>
      ))}
    </section>
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

function SettingsEditor({ backgroundImage, onUpload, onReset }) {
  return (
    <section style={settingsPanelStyle}>
      <div>
        <div style={labelTextStyle}>MAIN BACKGROUND</div>
        <p style={variableHintStyle}>WEBP는 그대로 저장하고, 큰 PNG/JPEG는 업로드 전에 가벼운 JPG로 압축합니다.</p>
      </div>
      <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onUpload} style={fileInputStyle} />
      <div style={imagePreviewWrapStyle}>
        <img src={backgroundImage} alt="" style={backgroundPreviewStyle} />
        <div style={imageUrlStyle}>{backgroundImage}</div>
        <button type="button" onClick={onReset} style={clearButtonStyle}>RESET TO DEFAULT</button>
      </div>
    </section>
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

async function prepareBackgroundFile(file) {
  if (file.type === 'image/webp') return file;

  const shouldConvert = file.type === 'image/png' || file.size > BACKGROUND_CONVERT_BYTES;
  if (!shouldConvert) return file;

  const image = await loadImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth || image.width;
  canvas.height = image.naturalHeight || image.height;

  const context = canvas.getContext('2d');
  if (!context) throw new Error('Could not prepare background image.');

  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const blob = await canvasToBlob(canvas, 'image/jpeg', BACKGROUND_JPEG_QUALITY);
  return new File([blob], replaceImageExtension(file.name, 'jpg'), { type: 'image/jpeg' });
}

function loadImageBitmap(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not read background image.'));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not optimize background image.'));
    }, type, quality);
  });
}

function replaceImageExtension(filename, extension) {
  return filename.replace(/\.[a-z0-9]+$/i, '') + `.${extension}`;
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

const cancelButtonStyle = {
  border: '1px solid #6074b6',
  background: '#050812',
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

const savedActionStyle = {
  display: 'flex',
  gap: '6px',
};

const editButtonStyle = {
  border: '1px solid #0055ff',
  background: '#06122f',
  color: '#fff',
  padding: '6px 8px',
  fontFamily: 'monospace',
  fontSize: '11px',
  cursor: 'pointer',
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

const variablePanelStyle = {
  display: 'grid',
  gap: '14px',
  border: '1px solid rgba(0,85,255,0.45)',
  padding: '14px',
  background: 'rgba(0,0,0,0.25)',
};

const settingsPanelStyle = {
  display: 'grid',
  gap: '14px',
  border: '1px solid rgba(0,85,255,0.45)',
  padding: '14px',
  background: 'rgba(0,0,0,0.25)',
};

const backgroundPreviewStyle = {
  width: '100%',
  aspectRatio: '16 / 10',
  objectFit: 'cover',
  border: '1px solid rgba(255,255,255,0.45)',
};

const variableHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: '14px',
  alignItems: 'start',
};

const variableHintStyle = {
  margin: '6px 0 0',
  color: '#8fa7ff',
  fontSize: '12px',
  lineHeight: 1.6,
};

const variableRowStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
  gap: '10px',
  alignItems: 'end',
};

const smallButtonStyle = {
  border: '1px solid #0055ff',
  background: '#06122f',
  color: '#fff',
  padding: '8px 10px',
  fontFamily: 'monospace',
  fontSize: '11px',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
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

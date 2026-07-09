import { useEffect, useState } from 'react';
import './archivePopup.css';
import { CONTENT_UPDATED_EVENT, getMergedContent, loadMergedContent } from './data/contentStore';

const NOTE_PAGE_SIZE = 7;

function NotesPopup({ onClose }) {
  const [content, setContent] = useState(() => getMergedContent());
  const { notes } = content;
  const [selectedId, setSelectedId] = useState(notes[0]?.id);
  const [page, setPage] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const pageCount = Math.max(1, Math.ceil(notes.length / NOTE_PAGE_SIZE));
  const visibleNotes = notes.slice(page * NOTE_PAGE_SIZE, (page + 1) * NOTE_PAGE_SIZE);
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
    <div className="archive-overlay" onClick={onClose}>
      <article className="archive-panel" onClick={(event) => event.stopPropagation()}>
        <button className="archive-close" onClick={onClose}>×</button>
        <header className="archive-header">
          <div>
            <div className="archive-eyebrow">ARCHIVE NODE 03</div>
            <h2 className="archive-title">PRODUCTION NOTES</h2>
            <p className="archive-subtitle">제작 기록, 후기, 짧은 일기를 읽는 공간입니다. 제목을 선택하면 본문이 열립니다.</p>
          </div>
          <div className="archive-meta">NOTE_INDEX: {notes.length}</div>
        </header>

        <div className="archive-body">
          <div className={`note-layout ${isDetailOpen ? 'is-detail-open' : ''}`}>
            <nav className="note-list" aria-label="note list">
              {visibleNotes.map((note) => (
                <button
                  key={note.id}
                  type="button"
                  className={`note-list-button ${selectedId === note.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setSelectedId(note.id);
                    setIsDetailOpen(true);
                  }}
                >
                  <span className="note-date">{note.date}</span>
                  <span className="note-list-title">{note.title}</span>
                </button>
              ))}
              <Pagination
                page={page}
                pageCount={pageCount}
                onPageChange={(nextPage) => {
                  const nextNote = notes[nextPage * NOTE_PAGE_SIZE];
                  setPage(nextPage);
                  setSelectedId(nextNote?.id);
                  setIsDetailOpen(false);
                }}
              />
            </nav>

            {selectedNote && (
              <section className="note-detail">
                <button type="button" className="mobile-back-button" onClick={() => setIsDetailOpen(false)}>
                  BACK TO LIST
                </button>
                <div className="note-date">{selectedNote.date}</div>
                <h3 className="note-title">{selectedNote.title}</h3>
                {selectedNote.image && (
                  <img src={selectedNote.image} alt="" className="note-image" />
                )}
                <div className="scroll-copy">
                  <p className="readable-text">{selectedNote.body}</p>
                </div>
                <div className="pill-row">
                  {(selectedNote.tags || []).map((tag) => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </article>
    </div>
  );
}

function Pagination({ page, pageCount, onPageChange }) {
  if (pageCount <= 1) return null;

  return (
    <div className="pagination-row">
      <button type="button" disabled={page === 0} onClick={() => onPageChange(page - 1)}>
        PREV
      </button>
      <span>{page + 1} / {pageCount}</span>
      <button type="button" disabled={page === pageCount - 1} onClick={() => onPageChange(page + 1)}>
        NEXT
      </button>
    </div>
  );
}

export default NotesPopup;

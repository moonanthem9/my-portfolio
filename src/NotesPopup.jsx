import { useState } from 'react';
import { ArchivePopupShell, Pagination } from './ArchiveShell';
import { useArchiveContent } from './useArchiveContent';

const NOTE_PAGE_SIZE = 7;

function NotesPopup({ onClose }) {
  const { notes } = useArchiveContent();
  const [selectedId, setSelectedId] = useState(notes[0]?.id);
  const [page, setPage] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const pageCount = Math.max(1, Math.ceil(notes.length / NOTE_PAGE_SIZE));
  const visibleNotes = notes.slice(page * NOTE_PAGE_SIZE, (page + 1) * NOTE_PAGE_SIZE);
  const selectedNote = notes.find((note) => note.id === selectedId) || notes[0];

  return (
    <ArchivePopupShell
      node="ARCHIVE NODE 03"
      title="PRODUCTION NOTES"
      subtitle="제작 기록, 후기, 짧은 일기를 읽는 공간입니다. 제목을 선택하면 본문이 열립니다."
      meta={`NOTE_INDEX: ${notes.length}`}
      onClose={onClose}
    >
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
    </ArchivePopupShell>
  );
}

export default NotesPopup;

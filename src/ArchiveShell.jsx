import { useEffect, useState } from 'react';
import './archivePopup.css';

export function ArchivePopupShell({ node, title, subtitle, meta, onClose, children }) {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="archive-overlay" onClick={onClose}>
      <article
        className="archive-panel"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <span className="archive-corner is-tl" aria-hidden="true" />
        <span className="archive-corner is-tr" aria-hidden="true" />
        <span className="archive-corner is-bl" aria-hidden="true" />
        <span className="archive-corner is-br" aria-hidden="true" />

        <button className="archive-close" onClick={onClose} aria-label="닫기">×</button>

        <header className="archive-header">
          <div>
            <div className="archive-eyebrow">
              <span className="archive-rec-dot" aria-hidden="true" />
              <span className="archive-rec-label">REC</span>
              <span className="archive-node">{node}</span>
            </div>
            <h2 className="archive-title">{title}</h2>
            <p className="archive-subtitle">{subtitle}</p>
          </div>
          <div className="archive-meta">{meta}</div>
        </header>

        <div className="archive-body">{children}</div>

        <footer className="archive-statusbar">
          <span>CAM_01 // ASTERISM-SYS</span>
          <span className="archive-statusbar-clock">
            {time.toLocaleTimeString('en-US', { hour12: false })}
          </span>
          <span>SIGNAL: STABLE</span>
        </footer>
      </article>
    </div>
  );
}

export function Pagination({ page, pageCount, onPageChange }) {
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

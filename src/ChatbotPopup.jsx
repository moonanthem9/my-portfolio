import { useEffect, useState } from 'react';
import './archivePopup.css';
import { CONTENT_UPDATED_EVENT, getMergedContent, loadMergedContent } from './data/contentStore';

const CHATBOT_PAGE_SIZE = 6;

function ChatbotPopup({ mainImageUrl, onClose }) {
  const [content, setContent] = useState(() => getMergedContent());
  const { chatbots } = content;
  const [selectedId, setSelectedId] = useState(chatbots[0]?.id);
  const [page, setPage] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const pageCount = Math.max(1, Math.ceil(chatbots.length / CHATBOT_PAGE_SIZE));
  const visibleChatbots = chatbots.slice(page * CHATBOT_PAGE_SIZE, (page + 1) * CHATBOT_PAGE_SIZE);
  const selectedBot = chatbots.find((bot) => bot.id === selectedId) || chatbots[0];

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
      <div className="archive-panel" onClick={(event) => event.stopPropagation()}>
        <button className="archive-close" onClick={onClose}>×</button>
        <header className="archive-header">
          <div>
            <div className="archive-eyebrow">ARCHIVE NODE 02</div>
            <h2 className="archive-title">CHATBOT GALLERY</h2>
            <p className="archive-subtitle">캐릭터 챗봇을 핀보드처럼 둘러보고, 선택한 봇의 설정과 플레이 링크를 확인합니다.</p>
          </div>
          <div className="archive-meta">BOT_INDEX: {chatbots.length}</div>
        </header>

        <div className="archive-body">
          <div className={`pin-grid ${isDetailOpen ? 'is-detail-open' : ''}`}>
            <section className="masonry-list" aria-label="chatbot list">
              {visibleChatbots.map((bot) => (
                <button
                  key={bot.id}
                  type="button"
                  className={`pin-card ${selectedId === bot.id ? 'is-active' : ''}`}
                  onClick={() => {
                    setSelectedId(bot.id);
                    setIsDetailOpen(true);
                  }}
                >
                  <span
                    className="pin-thumb"
                    style={{
                      backgroundImage: `url(${bot.image || mainImageUrl})`,
                      backgroundPosition: bot.imagePosition || 'center',
                    }}
                  />
                  <span className="pin-label">{bot.name}</span>
                </button>
              ))}
              <Pagination
                page={page}
                pageCount={pageCount}
                onPageChange={(nextPage) => {
                  const nextBot = chatbots[nextPage * CHATBOT_PAGE_SIZE];
                  setPage(nextPage);
                  setSelectedId(nextBot?.id);
                  setIsDetailOpen(false);
                }}
              />
            </section>

            {selectedBot && (
              <section className="feature-card">
                <button type="button" className="mobile-back-button" onClick={() => setIsDetailOpen(false)}>
                  BACK TO LIST
                </button>
                <div
                  className="feature-image"
                  style={{
                    backgroundImage: `url(${selectedBot.image || mainImageUrl})`,
                    backgroundPosition: selectedBot.imagePosition || 'center',
                  }}
                />
                <div className="feature-copy">
                  <div className="field-label">NAME</div>
                  <h3 className="feature-title">{selectedBot.name}</h3>
                  <div className="field-label">SUMMARY</div>
                  <div className="scroll-copy">
                    <p className="readable-text">{selectedBot.summary}</p>
                  </div>
                  <div className="pill-row">
                    {(selectedBot.platforms || []).map((platform) => (
                      <a key={platform.label} href={platform.href} target="_blank" rel="noreferrer" className="archive-link">
                        {platform.label}
                      </a>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
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

export default ChatbotPopup;

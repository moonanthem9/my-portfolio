import { useState } from 'react';
import { ArchivePopupShell, Pagination } from './ArchiveShell';
import { useArchiveContent } from './useArchiveContent';

const CHATBOT_PAGE_SIZE = 6;

function ChatbotPopup({ mainImageUrl, onClose }) {
  const { chatbots } = useArchiveContent();
  const [selectedId, setSelectedId] = useState(chatbots[0]?.id);
  const [page, setPage] = useState(0);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const pageCount = Math.max(1, Math.ceil(chatbots.length / CHATBOT_PAGE_SIZE));
  const visibleChatbots = chatbots.slice(page * CHATBOT_PAGE_SIZE, (page + 1) * CHATBOT_PAGE_SIZE);
  const selectedBot = chatbots.find((bot) => bot.id === selectedId) || chatbots[0];

  return (
    <ArchivePopupShell
      node="ARCHIVE NODE 02"
      title="CHATBOT GALLERY"
      subtitle="캐릭터 챗봇을 핀보드처럼 둘러보고, 선택한 봇의 설정과 플레이 링크를 확인합니다."
      meta={`BOT_INDEX: ${chatbots.length}`}
      onClose={onClose}
    >
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
    </ArchivePopupShell>
  );
}

export default ChatbotPopup;

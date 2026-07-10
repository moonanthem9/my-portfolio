import { useState, useRef, useEffect } from 'react';
import AdminPage from './AdminPage';
import ChatbotPopup from './ChatbotPopup';
import NotesPopup from './NotesPopup';
import ProfilePopup from './ProfilePopup';
import WidgetsPopup from './WidgetsPopup';
import {
  CONTENT_UPDATED_EVENT,
  DEFAULT_BACKGROUND_IMAGE,
  getMergedContent,
  loadMergedContent,
} from './data/contentStore';
import './App.css';

function App() {
  const isAdminRoute = window.location.pathname === '/admin';
  const initialContent = getMergedContent();
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [time, setTime] = useState(new Date());
  const [backgroundImage, setBackgroundImage] = useState(initialContent.settings.backgroundImage);
  
  // 팝업 상태 (새 방에서 이 변수를 활용해 팝업을 띄우게 됩니다)
  const [activePopup, setActivePopup] = useState(null);
  
  const [isBooting, setIsBooting] = useState(true);
  const [progress, setProgress] = useState(0);
  const [imageSize, setImageSize] = useState({ w: 16, h: 9 });

  const BASE_SIZE = (windowSize.w + windowSize.h) / 2; 
  const MAG = 2.5; 
  const GAP = 30; 
  const ANIM_SPEED = '0.15s';
  const MAIN_IMAGE_URL = backgroundImage || DEFAULT_BACKGROUND_IMAGE;
  const imageScale = Math.max(windowSize.w / imageSize.w, windowSize.h / imageSize.h);
  const coverSize = {
    w: imageSize.w * imageScale,
    h: imageSize.h * imageScale,
  };
  const coverOffset = {
    x: (windowSize.w - coverSize.w) / 2,
    y: (windowSize.h - coverSize.h) / 2,
  };
  const coverBackground = {
    backgroundSize: `${coverSize.w}px ${coverSize.h}px`,
    backgroundPosition: `${coverOffset.x}px ${coverOffset.y}px`,
    backgroundRepeat: 'no-repeat',
  };

  useEffect(() => {
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    let currentProgress = 0;
    const progressTimer = setInterval(() => {
      currentProgress += Math.random() * 15;
      if (currentProgress >= 100) currentProgress = 99;
      setProgress(Math.floor(currentProgress));
    }, 100);

    let isCompleted = false;
    const completeBoot = () => {
      if (isCompleted) return;
      isCompleted = true;
      clearInterval(progressTimer);
      setProgress(100);
      setTimeout(() => setIsBooting(false), 800);
    };

    const img = new Image();
    img.src = DEFAULT_BACKGROUND_IMAGE;
    img.onload = () => {
      setImageSize({ w: img.naturalWidth || 16, h: img.naturalHeight || 9 });
      completeBoot();
    };
    img.onerror = completeBoot;
    const fallbackTimer = setTimeout(completeBoot, 4000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(timer);
      clearInterval(progressTimer);
      clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const syncBackground = async () => {
      const nextContent = await loadMergedContent();
      if (isMounted) setBackgroundImage(nextContent.settings.backgroundImage);
    };
    const handleContentUpdate = () => {
      syncBackground();
    };

    syncBackground();
    window.addEventListener(CONTENT_UPDATED_EVENT, handleContentUpdate);

    return () => {
      isMounted = false;
      window.removeEventListener(CONTENT_UPDATED_EVENT, handleContentUpdate);
    };
  }, []);

  useEffect(() => {
    const img = new Image();
    img.src = MAIN_IMAGE_URL;
    img.onload = () => {
      setImageSize({ w: img.naturalWidth || 16, h: img.naturalHeight || 9 });
    };
  }, [MAIN_IMAGE_URL]);

  const [targets, setTargets] = useState([
    { id: 1, px: 0.15, py: 0.20, br: 0.12, tr: 0.18, label: 'PROFILE', defaultDir: 'right' },
    { id: 2, px: 0.60, py: 0.35, br: 0.15, tr: 0.22, label: 'CHATBOT', defaultDir: 'left' },
    { id: 3, px: 0.20, py: 0.70, br: 0.10, tr: 0.15, label: 'NOTES', defaultDir: 'right' },
    { id: 4, px: 0.65, py: 0.75, br: 0.13, tr: 0.19, label: 'WIDGETS', defaultDir: 'left' },
  ]);

  const [draggingId, setDraggingId] = useState(null);
  const containerRef = useRef(null);
  const [blink, setBlink] = useState(true);
  
  useEffect(() => {
    const interval = setInterval(() => setBlink(b => !b), 800);
    return () => clearInterval(interval);
  }, []);

  const handlePointerDown = (id, e) => {
    setDraggingId(id);
    e.target.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e) => {
    if (draggingId === null || !containerRef.current) return;
    const target = targets.find(t => t.id === draggingId);
    if (!target) return;
    
    const boxSize = Math.max(90, BASE_SIZE * target.br);
    let newX = e.clientX - (boxSize / 2);
    let newY = e.clientY - (boxSize / 2);
    
    newX = Math.max(0, Math.min(newX, windowSize.w - boxSize));
    newY = Math.max(0, Math.min(newY, windowSize.h - boxSize));
    
    setTargets(prev => prev.map(t => 
      t.id === draggingId ? { ...t, px: newX / windowSize.w, py: newY / windowSize.h } : t
    ));
  };

  const handlePointerUp = () => setDraggingId(null);

  if (isAdminRoute) {
    return <AdminPage />;
  }

  // --- 부팅 시퀀스 화면 ---
  if (isBooting) {
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: '#050505', color: '#0055ff', fontFamily: 'monospace', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
        <div style={{ width: '100%', maxWidth: '800px', display: 'flex', flexDirection: 'column', fontSize: windowSize.w < 768 ? '12px' : '16px' }}>
          <div style={{ marginBottom: '40px' }}>
            <div style={{ color: '#fff', fontSize: '2em', fontWeight: 'bold', letterSpacing: '4px', marginBottom: '10px' }}>asterism.sys</div>
            <div>BOOT SEQUENCE INITIATED...</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: 0.8 }}>
            <div>{'>'} INITIALIZING 2D_LOOP_RENDER ENGINE ... OK</div>
            {progress > 30 && <div>{'>'} MOUNTING ARCHIVE ASSETS ... OK</div>}
            {progress > 60 && <div>{'>'} CONNECTING SECURE NODE (RU) ... ESTABLISHED</div>}
            {progress > 85 && <div>{'>'} OVERRIDING ACCESS PROTOCOLS ... GRANTED</div>}
          </div>
          <div style={{ marginTop: '50px', fontSize: '1.2em' }}>
            SYSTEM_LOAD: <span style={{ color: progress === 100 ? '#fff' : '#0055ff' }}>{progress}%</span>
          </div>
          <div style={{ marginTop: '10px', width: '100%', height: '2px', backgroundColor: '#111' }}>
            <div style={{ width: `${progress}%`, height: '100%', backgroundColor: progress === 100 ? '#fff' : '#0055ff', transition: 'width 0.1s' }} />
          </div>
        </div>
      </div>
    );
  }

  // --- 메인 CCTV 화면 ---
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', backgroundColor: '#000', color: '#fff', fontFamily: 'monospace' }}>
      
      <div
        ref={containerRef}
        style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${MAIN_IMAGE_URL})`,
          ...coverBackground,
          cursor: draggingId !== null ? 'grabbing' : 'crosshair',
          touchAction: 'none',
          // 팝업이 켜졌을 때 배경 흐리게 처리
          filter: activePopup ? 'blur(8px) brightness(0.4)' : 'none',
          transition: 'filter 0.4s ease'
        }}
        onPointerMove={handlePointerMove}
      >
        {/* HUD UI */}
        <div style={{ position: 'absolute', top: 40, left: 40, zIndex: 5, pointerEvents: 'none', textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', backgroundColor: '#ef4444', opacity: blink ? 1 : 0.2, transition: 'opacity 0.2s', boxShadow: '0 0 12px #ef4444' }} />
            <span style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '3px', color: '#ef4444', textShadow: '0 2px 4px rgba(0,0,0,0.8)' }}>REC</span>
          </div>
          <div style={{ color: '#0055ff', fontSize: '12px', letterSpacing: '2px', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>CAM_01 // ASTERISM_SYS</div>
        </div>
        
        <div style={{ position: 'absolute', top: 40, right: 40, zIndex: 5, pointerEvents: 'none', textAlign: 'right', color: '#0055ff', textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
          <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold', letterSpacing: '2px', marginBottom: '6px' }}>{time.toLocaleTimeString('en-US', { hour12: false })}</div>
          <div style={{ fontSize: '12px', letterSpacing: '2px', marginBottom: '4px' }}>{time.toLocaleDateString().replace(/\//g, '.')}</div>
          <div style={{ fontSize: '10px', opacity: 0.7, letterSpacing: '1px' }}>COORD: {windowSize.w} x {windowSize.h}</div>
        </div>

        <div style={{ position: 'absolute', bottom: 40, left: 40, zIndex: 5, pointerEvents: 'none', textAlign: 'left', textShadow: '0 2px 6px rgba(0,0,0,0.9)' }}>
          <div style={{ color: '#fff', fontSize: '24px', fontWeight: 'bold', letterSpacing: '3px', marginBottom: '8px' }}>asterism</div>
          <div style={{ color: '#0055ff', fontSize: '13px', letterSpacing: '1px', marginBottom: '4px' }}>PERSONAL_ARCHIVE_ONLINE</div>
          <div style={{ color: '#0055ff', fontSize: '10px', opacity: 0.7 }}>AUTHORIZATION: GRANTED</div>
        </div>

        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '60px', height: '60px', pointerEvents: 'none', zIndex: 2, opacity: 0.4 }}>
           <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', backgroundColor: '#0055ff' }} />
           <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', backgroundColor: '#0055ff' }} />
        </div>

        <div style={{ position: 'absolute', top: 30, left: 30, width: 30, height: 30, borderTop: '2px solid #0055ff', borderLeft: '2px solid #0055ff', opacity: 0.5, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 30, left: 30, width: 30, height: 30, borderBottom: '2px solid #0055ff', borderLeft: '2px solid #0055ff', opacity: 0.5, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 30, right: 30, width: 30, height: 30, borderTop: '2px solid #0055ff', borderRight: '2px solid #0055ff', opacity: 0.5, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 30, right: 30, width: 30, height: 30, borderBottom: '2px solid #0055ff', borderRight: '2px solid #0055ff', opacity: 0.5, pointerEvents: 'none' }} />

        {/* 타겟 렌더링 */}
        {targets.map(target => {
          const boxSize = Math.max(90, BASE_SIZE * target.br);
          const thumbSize = Math.max(130, BASE_SIZE * target.tr);
          const targetX = target.px * windowSize.w;
          const targetY = target.py * windowSize.h;
          const spaceOnRight = windowSize.w - (targetX + boxSize + GAP);
          const spaceOnLeft = targetX - GAP;
          
          let currentDir = target.defaultDir;
          if (currentDir === 'right' && spaceOnRight < thumbSize && spaceOnLeft >= thumbSize) { currentDir = 'left'; } 
          else if (currentDir === 'left' && spaceOnLeft < thumbSize && spaceOnRight >= thumbSize) { currentDir = 'right'; }
          
          const targetCx = boxSize / 2;
          const targetCy = boxSize / 2;
          const relThumbX = currentDir === 'right' ? boxSize + GAP : -GAP - thumbSize;
          const relThumbY = Math.max(0, Math.min(targetY, windowSize.h - thumbSize)) - targetY;
          const thumbCx = relThumbX + thumbSize / 2;
          const thumbCy = relThumbY + thumbSize / 2;
          const dx = thumbCx - targetCx;
          const dy = thumbCy - targetCy;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          const targetAbsCx = targetX + boxSize / 2;
          const targetAbsCy = targetY + boxSize / 2;
          const thumbBgPosX = (coverOffset.x - targetAbsCx) * MAG + thumbSize / 2;
          const thumbBgPosY = (coverOffset.y - targetAbsCy) * MAG + thumbSize / 2;
          const boxBgPosX = coverOffset.x - targetX;
          const boxBgPosY = coverOffset.y - targetY;

          return (
            <div key={target.id} style={{ position: 'absolute', left: targetX, top: targetY, zIndex: draggingId === target.id ? 30 : 20 }}>
              {/* 기계 팔 & 돋보기 */}
              <div style={{ position: 'absolute', left: targetCx, top: targetCy, width: `${distance}px`, height: 0, transformOrigin: '0 0', transform: `rotate(${angle}deg)`, transition: `width ${ANIM_SPEED} ease-out, transform ${ANIM_SPEED} ease-out`, zIndex: 10 }}>
                <div style={{ width: '100%', borderTop: '2px dashed rgba(0, 85, 255, 0.8)' }} />
                <div
                  // 💡 이 부분을 클릭하면 activePopup 상태가 변경됩니다.
                  onClick={() => setActivePopup(target.label)}
                  style={{
                    position: 'absolute', left: '100%', top: 0, width: `${thumbSize}px`, height: `${thumbSize}px`,
                    transform: `translate(-50%, -50%) rotate(${-angle}deg)`, transition: `transform ${ANIM_SPEED} ease-out`,
                    backgroundImage: `url(${MAIN_IMAGE_URL})`, backgroundSize: `${coverSize.w * MAG}px ${coverSize.h * MAG}px`, backgroundPosition: `${thumbBgPosX}px ${thumbBgPosY}px`, backgroundRepeat: 'no-repeat',
                    border: '2px solid #0055ff', cursor: 'pointer', boxShadow: '0 10px 40px rgba(0,0,0,0.9)',
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(transparent, transparent 2px, rgba(0, 85, 255, 0.15) 3px, rgba(0, 85, 255, 0.15) 3px)', pointerEvents: 'none' }} />
                  <div style={{ backgroundColor: '#0055ff', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '6px 8px', position: 'absolute', bottom: '-28px', left: '-2px', letterSpacing: '1px', pointerEvents: 'none', whiteSpace: 'nowrap', textAlign: 'left' }}> 
                    CLICK TO ACCESS 
                  </div>
                </div>
              </div>

              {/* 드래그 박스 (위장막) */}
              <div
                onPointerDown={(e) => handlePointerDown(target.id, e)} onPointerUp={handlePointerUp}
                style={{
                  position: 'absolute', left: 0, top: 0, width: `${boxSize}px`, height: `${boxSize}px`,
                  backgroundImage: `url(${MAIN_IMAGE_URL})`, backgroundSize: `${coverSize.w}px ${coverSize.h}px`, backgroundPosition: `${boxBgPosX}px ${boxBgPosY}px`, backgroundRepeat: 'no-repeat',
                  cursor: 'grab', zIndex: 20
                }}
              >
                 <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0, 85, 255, 0.15)', border: '2px solid #0055ff', transition: 'background-color 0.2s' }} />
                 <div style={{ backgroundColor: '#0055ff', color: 'white', fontSize: '13px', fontWeight: 'bold', padding: '4px 6px', position: 'absolute', top: '-22px', left: '-2px', whiteSpace: 'nowrap', letterSpacing: '1px', textAlign: 'left' }}> 
                   {target.label} 
                 </div>
                 <div style={{ position: 'absolute', top: 0, left: 0, width: 8, height: 8, borderTop: '3px solid #fff', borderLeft: '3px solid #fff' }} />
                 <div style={{ position: 'absolute', top: 0, right: 0, width: 8, height: 8, borderTop: '3px solid #fff', borderRight: '3px solid #fff' }} />
                 <div style={{ position: 'absolute', bottom: 0, left: 0, width: 8, height: 8, borderBottom: '3px solid #fff', borderLeft: '3px solid #fff' }} />
                 <div style={{ position: 'absolute', bottom: 0, right: 0, width: 8, height: 8, borderBottom: '3px solid #fff', borderRight: '3px solid #fff' }} />
              </div>
            </div>
          );
        })}

        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(transparent, transparent 2px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 3px)', pointerEvents: 'none', zIndex: 40 }} />
        <div style={{ position: 'absolute', inset: 0, boxShadow: 'inset 0 0 150px rgba(0,0,0,0.95)', pointerEvents: 'none', zIndex: 40 }} />
        <div className="cctv-interference" aria-hidden="true">
          <span className="cctv-noise" />
          <span className="cctv-scan-jump cctv-scan-jump-a" />
          <span className="cctv-scan-jump cctv-scan-jump-b" />
          <span className="cctv-flicker" />
        </div>
      </div>

      {activePopup === 'PROFILE' && (
        <ProfilePopup
          mainImageUrl={MAIN_IMAGE_URL}
          onClose={() => setActivePopup(null)}
        />
      )}

      {activePopup === 'CHATBOT' && (
        <ChatbotPopup
          mainImageUrl={MAIN_IMAGE_URL}
          onClose={() => setActivePopup(null)}
        />
      )}

      {activePopup === 'NOTES' && (
        <NotesPopup onClose={() => setActivePopup(null)} />
      )}

      {activePopup === 'WIDGETS' && (
        <WidgetsPopup onClose={() => setActivePopup(null)} />
      )}
      
    </div>
  );
}

export default App;

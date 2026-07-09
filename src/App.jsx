import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [time, setTime] = useState(new Date());
  
  // 팝업 상태 (새 방에서 이 변수를 활용해 팝업을 띄우게 됩니다)
  const [activePopup, setActivePopup] = useState(null);
  
  const [isBooting, setIsBooting] = useState(true);
  const [progress, setProgress] = useState(0);

  const BASE_SIZE = (windowSize.w + windowSize.h) / 2; 
  const MAG = 2.5; 
  const GAP = 30; 
  const ANIM_SPEED = '0.15s';
  const MAIN_IMAGE_URL = "https://images.unsplash.com/photo-1544669641-f7ee8ebac251?q=80&w=1920&auto=format&fit=crop";

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
    img.src = MAIN_IMAGE_URL;
    img.onload = completeBoot;
    img.onerror = completeBoot;
    const fallbackTimer = setTimeout(completeBoot, 4000);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(timer);
      clearInterval(progressTimer);
      clearTimeout(fallbackTimer);
    };
  }, []);

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
          backgroundSize: `${windowSize.w}px ${windowSize.h}px`, 
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
          const bgPosX = -(targetAbsCx * MAG - thumbSize / 2);
          const bgPosY = -(targetAbsCy * MAG - thumbSize / 2);

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
                    backgroundImage: `url(${MAIN_IMAGE_URL})`, backgroundSize: `${windowSize.w * MAG}px ${windowSize.h * MAG}px`, backgroundPosition: `${bgPosX}px ${bgPosY}px`,
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
                  backgroundImage: `url(${MAIN_IMAGE_URL})`, backgroundSize: `${windowSize.w}px ${windowSize.h}px`, backgroundPosition: `-${targetX}px -${targetY}px`,
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
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap');

        @keyframes popupAnim {
          0% { transform: scale(0.9) translateY(20px); opacity: 0; filter: blur(5px); }
          100% { transform: scale(1) translateY(0); opacity: 1; filter: blur(0); }
        }
        
        .collage-item {
          transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          cursor: pointer;
          box-sizing: border-box;
        }
        .collage-item:hover {
          z-index: 120 !important;
          transform: scale(1.25) rotate(0deg) !important;
          box-shadow: 0 20px 50px rgba(0,0,0,0.9) !important;
        }

        .bag-container {
          container-type: inline-size;
        }
        
        .barcode-black {
          background: repeating-linear-gradient(90deg, #000, #000 2px, transparent 2px, transparent 4px, #000 4px, #000 5px, transparent 5px, transparent 8px);
          height: 100%; width: 100%;
        }

        /* 펜글씨 폰트 클래스 */
        .handwritten {
          font-family: 'Caveat', cursive, sans-serif;
          color: #222;
        }
      `}</style>

      {/* =========================================
          💡 프로필: 증거물 콜라주 (EVIDENCE BAG) 팝업 
          ========================================= */}
      {activePopup === 'PROFILE' && (
        <div 
          onClick={() => setActivePopup(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 100, 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }}
        >
          {/* 콜라주를 담는 아우터 컨테이너 */}
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bag-container"
            style={{
              position: 'relative',
              width: '92vw', 
              maxWidth: '680px', 
              aspectRatio: '1 / 1.45', 
              maxHeight: '90vh',
              animation: 'popupAnim 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              fontFamily: 'monospace' // ★ 전체 폰트 메인과 동일하게 통일
            }}
          >
            {/* 세련되게 개선된 닫기 버튼 */}
<button onClick={() => setActivePopup(null)} style={{ position: 'absolute', top: '-30px', right: '0', background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', zIndex: 100 }}>×</button>

            {/* 실제 증거물이 담기는 지퍼백 외부 껍데기 */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(8px)',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              boxShadow: 'inset 0 0 60px rgba(0, 50, 255, 0.05), 0 30px 60px rgba(0,0,0,0.9)',
            }}>
               
               {/* ❌ 입구 구역 (상단 11% - 서류가 절대 침범하지 못하는 영역) ❌ */}
               <div style={{ position: 'absolute', top: '0', left: 0, right: 0, height: '6%', borderBottom: '3px double rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.05)', zIndex: 40, pointerEvents: 'none', display: 'flex', alignItems: 'center', padding: '0 5%' }}>
                 <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '3.2cqi', fontWeight: 'bold', letterSpacing: '2px' }}>
                    EVIDENCE 749
                 </div>
               </div>


              {/* 🟢 내용물 구역 (Safe Zone) : 오직 이 안에서만 서류가 렌더링됨 🟢 */}
              <div style={{ position: 'absolute', top: '13%', bottom: '2%', left: '2%', right: '2%' }}>

                {/* 1. 사이버펑크 엑스포 티켓 (파란 배경 + 검은 글씨) */}
                <div className="collage-item" style={{
                  position: 'absolute', top: '2%', left: '3.5%', 
                  width: '32%', aspectRatio: '1 / 3', 
                  backgroundColor: '#0055ff', // 파란색 배경
                  transform: 'rotate(-4deg)', zIndex: 10,
                  boxShadow: '5px 10px 20px rgba(0,0,0,0.6)',
                  display: 'flex', flexDirection: 'column',
                  color: '#000' // 검은색 글씨
                }}>
                  {/* 절취선 상단 */}
                  <div style={{ padding: '8%', borderBottom: '2px dashed #000', textAlign: 'center' }}>
                    <div style={{ fontSize: '3.5cqi', fontWeight: '900', letterSpacing: '1px' }}>ADMIT</div>
                    <div style={{ fontSize: '2.5cqi', letterSpacing: '2px' }}>ONE</div>
                  </div>
                  {/* 티켓 본문 */}
                  <div style={{ flex: 1, padding: '10%', display: 'flex', flexDirection: 'column', gap: '5%' }}>
                    <div>
                      <div style={{ fontSize: '2cqi', color: '#222' }}>EVENT</div>
                      <div style={{ fontSize: '3.2cqi', fontWeight: '900' }}>SYS_EXPO</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '2cqi', color: '#222' }}>DATE</div>
                      <div style={{ fontSize: '2.5cqi', fontWeight: 'bold' }}>2026.07.09</div>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <div>
                        <div style={{ fontSize: '2cqi', color: '#222' }}>SEC</div>
                        <div style={{ fontSize: '3.2cqi', fontWeight: '900' }}>05</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '2cqi', color: '#222' }}>ROW</div>
                        <div style={{ fontSize: '3.2cqi', fontWeight: '900' }}>A</div>
                      </div>
                    </div>
                  </div>
                  {/* 바코드 하단 */}
                  <div style={{ height: '15%', padding: '8%', borderTop: '2px dashed #000' }}>
                    <div className="barcode-black" />
                  </div>
                </div>


                {/* 2. 빈티지 서류 (중간, 오른쪽 상단) */}
                <div className="collage-item" style={{
                  position: 'absolute', top: '0%', right: '2.5%', 
                  width: '62%', aspectRatio: '1 / 1.3', 
                  backgroundColor: '#e6e1d6', 
                  transform: 'rotate(2deg)', zIndex: 20,
                  boxShadow: '0 15px 25px rgba(0,0,0,0.7)',
                  padding: '4%',
                  color: '#111'
                }}>
                  <div style={{ position: 'absolute', top: '-4%', left: '40%', width: '15%', height: '8%', backgroundColor: 'rgba(218, 196, 117, 0.85)', transform: 'rotate(-5deg)' }} />
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #111', paddingBottom: '2%', marginBottom: '4%' }}>
                    <span style={{ fontSize: '3.5cqi', fontWeight: '900' }}>WORK EXPERIENCE</span>
                    <span style={{ backgroundColor: '#0055ff', color: '#fff', padding: '1% 3%', fontSize: '2.5cqi', fontWeight: 'bold' }}>2024-2026</span>
                  </div>
                  
                  <div style={{ fontSize: '2.5cqi', lineHeight: '1.4', marginBottom: '4%' }}>
                    Drove creative projects blending <strong>SF, horror, and romance</strong> genres to develop highly engaging narrative systems.
                  </div>
                  
                  <div style={{ display: 'flex', gap: '4%', height: '40%' }}>
                    <div style={{ width: '45%', height: '100%', backgroundColor: '#000', backgroundImage: `url(${MAIN_IMAGE_URL})`, backgroundSize: 'cover', border: '1px solid #111', filter: 'sepia(0.2) contrast(1.1)' }} />
                    <div style={{ flex: 1, fontSize: '2cqi', lineHeight: '1.4', color: '#333' }}>
                      &gt; Designed 2D anime-style animations.<br/><br/>
                      &gt; Authored Russian language dialogue matrices.
                    </div>
                  </div>
                </div>


{/* 3. 하얀색 플라스틱 ID 카드 (최상단, 오리지널 디자인 기반 정렬 완벽 교정) */}
                <div className="collage-item" style={{
                  position: 'absolute', top: '35%', left: '8%', 
                  width: '84%', aspectRatio: '1.7 / 1', 
                  backgroundColor: '#fff', borderRadius: '8px',
                  transform: 'rotate(-2deg)', zIndex: 50, 
                  boxShadow: '0 15px 35px rgba(0,0,0,0.85)',
                  display: 'flex', padding: '3.5%',
                  color: '#111', fontFamily: 'monospace', // 메인 화면 폰트 통일
                  boxSizing: 'border-box'
                }}>
                  {/* ★ 증명사진 (가로세로 3:4 고정 비율 적용) */}
                  <div style={{ 
                    height: '100%', aspectRatio: '3 / 4', // 리얼 증명사진 비율
                    backgroundColor: '#ccc', borderRadius: '4px', 
                    backgroundImage: `url(${MAIN_IMAGE_URL})`, backgroundSize: 'cover', backgroundPosition: 'center', 
                    filter: 'grayscale(100%) contrast(1.2)', border: '1px solid #ddd', flexShrink: 0 
                  }} />
                  
                  {/* ID 카드 내용 및 정렬 */}
                  <div style={{ flex: 1, paddingLeft: '5%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    
                    {/* 상단: 이름 & 역할 (사진 윗선과 완벽하게 수평 정렬) */}
                    <div style={{ borderBottom: '2px solid #0055ff', paddingBottom: '3%' }}>
                      <div style={{ fontSize: '5.5cqi', fontWeight: '900', letterSpacing: '-0.5px' }}>asterism</div>
                      <div style={{ fontSize: '2.5cqi', color: '#0055ff', fontWeight: 'bold', marginTop: '2%' }}>AI CHATBOT CREATOR</div>
                    </div>
                    
                    {/* 중앙: 소개 문구 (Bio) */}
                    <div style={{ fontSize: '2cqi', color: '#333', marginTop:'2.4cqi', lineHeight: '1.4', fontWeight: 'bold' }}>
                      [BIO] DEVELOPING INTERACTIVE NARRATIVE SYSTEMS AND CYBERPUNK-THEMED AI CHATBOTS. [BIO] DEVELOPING INTERACTIVE NARRATIVE SYSTEMS.
                    </div>
                    
                    {/* 하단: 이메일 주소 영역 (사진 밑선과 완벽하게 수평 정렬) */}
                    <div style={{ display: 'flex', marginTop: 'auto', alignItems: 'center', gap: '4%', backgroundColor: '#0055ff', padding: '3% 4%', borderRadius: '4px' }}>
                      <div style={{ fontSize: '2.5cqi', color: '#ffffff', display: 'flex', alignItems: 'center' }}>✉</div>
                      <div style={{ fontSize: '2.05cqi', fontWeight: 'bold', color: '#f9f9f9', letterSpacing: '0.5px' }}>asterism260521@gmail.com</div>
                    </div>
                    
                  </div>
                </div>


                {/* 4. 스킬 보드 (사이버펑크 감성, 맨 아래) */}
                <div className="collage-item" style={{
                  position: 'absolute', bottom: '4%', left: '10%', 
                  width: '80%', aspectRatio: '3 / 1',
                  backgroundColor: '#000', 
                  border: '2px dashed #0055ff', 
                  padding: '4%',
                  transform: 'rotate(1deg)', zIndex: 40,
                  boxShadow: '0 8px 15px rgba(0,0,0,0.9)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center'
                }}>
                  <div style={{ fontSize: '3cqi', color: '#0055ff', marginBottom: '3%', fontWeight: 'bold' }}>▶ IDENTIFIED_SKILLS</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2%' }}>
                    <span style={{ backgroundColor: '#0055ff', color: '#fff', padding: '1.5% 3%', fontSize: '2.5cqi', fontWeight: 'bold' }}>NARRATIVE_DEV</span>
                    <span style={{ backgroundColor: '#111', color: '#0055ff', border: '1px solid #0055ff', padding: '1.5% 3%', fontSize: '2.5cqi' }}>PROMPT_ENG</span>
                    <span style={{ backgroundColor: '#111', color: '#0055ff', border: '1px solid #0055ff', padding: '1.5% 3%', fontSize: '2.5cqi' }}>RU_BOT_MAINT</span>
                    <span style={{ backgroundColor: '#111', color: '#0055ff', border: '1px solid #0055ff', padding: '1.5% 3%', fontSize: '2.5cqi' }}>2D_ANIM</span>
                  </div>
                </div>

              </div>
              {/* 🟢 내용물 구역 끝 🟢 */}

            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

export default App;
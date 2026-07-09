function ProfilePopup({ mainImageUrl, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)'
      }}
    >
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

        .handwritten {
          font-family: 'Caveat', cursive, sans-serif;
          color: #222;
        }
      `}</style>

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
          fontFamily: 'monospace'
        }}
      >
        <button onClick={onClose} style={{ position: 'absolute', top: '-30px', right: '0', background: 'none', border: 'none', color: '#fff', fontSize: '24px', cursor: 'pointer', zIndex: 100 }}>×</button>

        <div style={{
          position: 'absolute', inset: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(8px)',
          border: '2px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '8px',
          boxShadow: 'inset 0 0 60px rgba(0, 50, 255, 0.05), 0 30px 60px rgba(0,0,0,0.9)',
        }}>
          <div style={{ position: 'absolute', top: '0', left: 0, right: 0, height: '6%', borderBottom: '3px double rgba(255,255,255,0.3)', backgroundColor: 'rgba(255,255,255,0.05)', zIndex: 40, pointerEvents: 'none', display: 'flex', alignItems: 'center', padding: '0 5%' }}>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '3.2cqi', fontWeight: 'bold', letterSpacing: '2px' }}>
              EVIDENCE 749
            </div>
          </div>

          <div style={{ position: 'absolute', top: '13%', bottom: '2%', left: '2%', right: '2%' }}>
            <div className="collage-item" style={{
              position: 'absolute', top: '2%', left: '3.5%',
              width: '32%', aspectRatio: '1 / 3',
              backgroundColor: '#0055ff',
              transform: 'rotate(-4deg)', zIndex: 10,
              boxShadow: '5px 10px 20px rgba(0,0,0,0.6)',
              display: 'flex', flexDirection: 'column',
              color: '#000'
            }}>
              <div style={{ padding: '8%', borderBottom: '2px dashed #000', textAlign: 'center' }}>
                <div style={{ fontSize: '3.5cqi', fontWeight: '900', letterSpacing: '1px' }}>ADMIT</div>
                <div style={{ fontSize: '2.5cqi', letterSpacing: '2px' }}>ONE</div>
              </div>
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
              <div style={{ height: '15%', padding: '8%', borderTop: '2px dashed #000' }}>
                <div className="barcode-black" />
              </div>
            </div>

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
                <div style={{ width: '45%', height: '100%', backgroundColor: '#000', backgroundImage: `url(${mainImageUrl})`, backgroundSize: 'cover', border: '1px solid #111', filter: 'sepia(0.2) contrast(1.1)' }} />
                <div style={{ flex: 1, fontSize: '2cqi', lineHeight: '1.4', color: '#333' }}>
                  &gt; Designed 2D anime-style animations.<br /><br />
                  &gt; Authored Russian language dialogue matrices.
                </div>
              </div>
            </div>

            <div className="collage-item" style={{
              position: 'absolute', top: '35%', left: '8%',
              width: '84%', aspectRatio: '1.7 / 1',
              backgroundColor: '#fff', borderRadius: '8px',
              transform: 'rotate(-2deg)', zIndex: 50,
              boxShadow: '0 15px 35px rgba(0,0,0,0.85)',
              display: 'flex', padding: '3.5%',
              color: '#111', fontFamily: 'monospace',
              boxSizing: 'border-box'
            }}>
              <div style={{
                height: '100%', aspectRatio: '3 / 4',
                backgroundColor: '#ccc', borderRadius: '4px',
                backgroundImage: `url(${mainImageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'grayscale(100%) contrast(1.2)', border: '1px solid #ddd', flexShrink: 0
              }} />

              <div style={{ flex: 1, paddingLeft: '5%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div style={{ borderBottom: '2px solid #0055ff', paddingBottom: '3%' }}>
                  <div style={{ fontSize: '5.5cqi', fontWeight: '900', letterSpacing: '-0.5px' }}>asterism</div>
                  <div style={{ fontSize: '2.5cqi', color: '#0055ff', fontWeight: 'bold', marginTop: '2%' }}>AI CHATBOT CREATOR</div>
                </div>

                <div style={{ fontSize: '2cqi', color: '#333', marginTop: '2.4cqi', lineHeight: '1.4', fontWeight: 'bold' }}>
                  [BIO] DEVELOPING INTERACTIVE NARRATIVE SYSTEMS AND CYBERPUNK-THEMED AI CHATBOTS. [BIO] DEVELOPING INTERACTIVE NARRATIVE SYSTEMS.
                </div>

                <div style={{ display: 'flex', marginTop: 'auto', alignItems: 'center', gap: '4%', backgroundColor: '#0055ff', padding: '3% 4%', borderRadius: '4px' }}>
                  <div style={{ fontSize: '2.5cqi', color: '#ffffff', display: 'flex', alignItems: 'center' }}>✉</div>
                  <div style={{ fontSize: '2.05cqi', fontWeight: 'bold', color: '#f9f9f9', letterSpacing: '0.5px' }}>asterism260521@gmail.com</div>
                </div>
              </div>
            </div>

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
        </div>
      </div>
    </div>
  );
}

export default ProfilePopup;

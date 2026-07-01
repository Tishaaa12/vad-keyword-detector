import React from 'react';
import Header from './components/Header.jsx';
import TalkingAvatar from './components/TalkingAvatar.jsx';
import VADVisualizer from './components/VADVisualizer.jsx';
import ConfigPanel from './components/ConfigPanel.jsx';
import KeywordCards from './components/KeywordCards.jsx';
import useVAD from './hooks/useVAD.js';

export default function App() {
  const {
    isActive,
    status,
    audioLevel,
    errorMessage,
    mouthHeight,
    speakingWord,
    keywords,
    threshold,
    silenceDelay,
    setThreshold,
    setSilenceDelay,
    setKeywords,
    toggleSession
  } = useVAD();

  return (
    <React.Fragment>
      {errorMessage && (
        <div className="glass-panel" style={{ borderColor: '#ef4444', background: 'rgba(239, 68, 68, 0.08)', padding: '1rem 1.5rem', color: '#fca5a5', fontSize: '0.9rem', borderRadius: '12px' }}>
          <strong>Error: </strong> {errorMessage}
        </div>
      )}

      <Header isActive={isActive} status={status} />

      <main className="main-layout">
        <section className="glass-panel avatar-section">
          <div className="panel-title">
            <span>Talking Assistant</span>
          </div>

          <TalkingAvatar status={status} mouthHeight={mouthHeight} />

          <VADVisualizer status={status} audioLevel={audioLevel} threshold={threshold} />
        </section>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', overflow: 'hidden', minHeight: 0 }}>
          <ConfigPanel 
            isActive={isActive}
            threshold={threshold}
            setThreshold={setThreshold}
            silenceDelay={silenceDelay}
            setSilenceDelay={setSilenceDelay}
            toggleSession={toggleSession}
          />

          <KeywordCards 
            keywords={keywords} 
            speakingWord={speakingWord} 
            onClear={() => setKeywords([])} 
          />
        </section>
      </main>
    </React.Fragment>
  );
}

import React from 'react';
import { Mic } from 'lucide-react';

export default function Header({ isActive, status }) {
  const getBadgeClass = () => {
    switch (status) {
      case 'IDLE': return 'state-idle';
      case 'LISTENING': return 'state-listening';
      case 'PROCESSING': return 'state-processing';
      case 'SPEAKING': return 'state-speaking';
      default: return 'state-idle';
    }
  };

  return (
    <header className="glass-panel app-header">
      <div className="app-title-group">
        <h1>
          <Mic size={24} style={{ verticalAlign: 'middle', color: '#06b6d4', marginRight: '0.1rem' }} />
          VAD Keyword Detector
        </h1>
        <p className="app-subtitle">Real-time Voice Activity Detection with Gemini AI Extraction</p>
      </div>
      {isActive && (
        <div className={`status-badge ${getBadgeClass()}`}>
          <span className="dot"></span>
          {status}
        </div>
      )}
    </header>
  );
}

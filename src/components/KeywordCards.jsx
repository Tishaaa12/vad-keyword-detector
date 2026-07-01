import React from 'react';
import { Trash2, MessageSquarePlus } from 'lucide-react';

export default function KeywordCards({ keywords, speakingWord, onClear }) {
  return (
    <div className="glass-panel keywords-panel">
      <div className="keywords-header-row">
        <div className="panel-title">
          <MessageSquarePlus size={20} style={{ color: 'var(--color-speaking)' }} />
          <span>Extracted Keywords</span>
        </div>
        {keywords.length > 0 && (
          <button 
            className="btn btn-secondary" 
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }} 
            onClick={onClear}
          >
            <Trash2 size={13} style={{ marginRight: '0.2rem' }} /> Clear List
          </button>
        )}
      </div>

      <div className="keywords-container">
        {keywords.length === 0 ? (
          <div className="empty-keywords">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="12" y1="16" x2="12" y2="8" />
            </svg>
            <p>No keywords detected yet.</p>
            <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.75rem' }}>
              Press "Start Detector Session" and say something. The key terms will be listed here automatically.
            </p>
          </div>
        ) : (
          keywords.map((word) => (
            <div 
              key={word.id} 
              className={`keyword-card ${speakingWord.toLowerCase().includes(word.text.toLowerCase()) ? 'highlighted' : ''}`}
              title={`Extracted at ${word.timestamp}`}
            >
              <span>{word.text}</span>
              <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginLeft: '0.25rem' }}>
                {word.timestamp}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

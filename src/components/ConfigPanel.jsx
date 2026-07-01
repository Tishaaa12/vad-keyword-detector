import React from 'react';
import { Settings, Play, Square } from 'lucide-react';

export default function ConfigPanel({
  isActive,
  threshold,
  setThreshold,
  silenceDelay,
  setSilenceDelay,
  toggleSession
}) {
  return (
    <div className="glass-panel" style={{ padding: '1.25rem', flexShrink: 0 }}>
      <div className="panel-title">
        <Settings size={18} />
        <span>Configurations</span>
      </div>

      <div className="settings-group">
        <div className="setting-item">
          <div className="setting-label">
            <span>VAD Speech Threshold (RMS Amplitude)</span>
            <span className="setting-value">{threshold}</span>
          </div>
          <input 
            type="range" 
            className={`setting-input ${isActive ? 'slider-listening' : ''}`}
            min="3" 
            max="60" 
            value={threshold} 
            onChange={(e) => setThreshold(Number(e.target.value))} 
          />
        </div>

        <div className="setting-item">
          <div className="setting-label">
            <span>Silence Timeout (duration to end speaking)</span>
            <span className="setting-value">{silenceDelay} ms</span>
          </div>
          <input 
            type="range" 
            className="setting-input" 
            min="600" 
            max="3500" 
            step="100" 
            value={silenceDelay} 
            onChange={(e) => setSilenceDelay(Number(e.target.value))} 
          />
        </div>
      </div>

      <button 
        className={`btn ${isActive ? 'btn-stop' : 'btn-start'}`} 
        onClick={toggleSession}
      >
        {isActive ? (
          <React.Fragment>
            <Square size={16} style={{ marginRight: '0.4rem' }} />
            Stop Detector Session
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Play size={16} style={{ marginRight: '0.4rem' }} />
            Start Detector Session
          </React.Fragment>
        )}
      </button>
    </div>
  );
}

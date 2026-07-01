import React from 'react';

export default function VADVisualizer({ status, audioLevel, threshold }) {
  return (
    <React.Fragment>
      <div className="visualizer-container">
        <canvas id="visualizer-canvas" className="visualizer-canvas" width="400" height="60"></canvas>
      </div>

      <div style={{ width: '100%', position: 'relative' }}>
        <div className="setting-label">
          <span>Mic Voice Activity Level</span>
          <span className="setting-value">{audioLevel} / 100</span>
        </div>
        <div className="level-meter-container">
          <div 
            className="level-meter-bar" 
            style={{ 
              width: `${audioLevel}%`, 
              backgroundColor: status === 'LISTENING' ? 'var(--color-listening)' : 'var(--color-idle)' 
            }}
          ></div>
          <div 
            className="level-meter-threshold-line" 
            style={{ left: `${threshold}%` }} 
            title={`Trigger Threshold (${threshold})`}
          ></div>
        </div>
      </div>
    </React.Fragment>
  );
}

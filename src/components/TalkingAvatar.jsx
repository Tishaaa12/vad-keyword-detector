import React from 'react';

export default function TalkingAvatar({ status, mouthHeight }) {
  const getAvatarHaloClass = () => {
    switch (status) {
      case 'IDLE': return 'glow-idle';
      case 'LISTENING': return 'glow-listening';
      case 'PROCESSING': return 'glow-processing';
      case 'SPEAKING': return 'glow-speaking';
      default: return '';
    }
  };

  const getAvatarBulbColor = () => {
    switch (status) {
      case 'LISTENING': return '#10b981';
      case 'PROCESSING': return '#8b5cf6';
      case 'SPEAKING': return '#f59e0b';
      default: return '#06b6d4';
    }
  };

  return (
    <div className={`avatar-halo ${getAvatarHaloClass()}`}>
      <svg viewBox="0 0 100 100" className="avatar-svg">
        <path d="M 40,82 L 60,82 L 56,95 L 44,95 Z" fill="#1e293b" stroke="#334155" strokeWidth="2.5" />
        
        <g className="avatar-bob">
          <rect x="18" y="42" width="7" height="15" rx="3" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
          
          <rect x="75" y="42" width="7" height="15" rx="3" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
          
          <rect x="23" y="25" width="54" height="50" rx="14" fill="#151f32" stroke="#1e293b" strokeWidth="3" />
          
          <rect x="25" y="27" width="50" height="46" rx="12" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          
          <rect x="30" y="33" width="40" height="20" rx="6" fill="#0b0f19" stroke="#1e293b" strokeWidth="2" />
          
          <g>
            <circle cx="42" cy="43" r="3.5" fill="#06b6d4" className="avatar-eye-left" />
            <circle cx="42" cy="43" r="1.2" fill="#ffffff" />
            
            <circle cx="58" cy="43" r="3.5" fill="#06b6d4" className="avatar-eye-right" />
            <circle cx="58" cy="43" r="1.2" fill="#ffffff" />
          </g>
          
          <ellipse cx="50" cy="61" rx="8" ry={mouthHeight} fill="#06b6d4" opacity="0.85" />
          
          <circle cx="33" cy="59" r="2" fill="#f472b6" opacity="0.3" />
          <circle cx="67" cy="59" r="2" fill="#f472b6" opacity="0.3" />
          
          <line x1="50" y1="25" x2="50" y2="12" stroke="#475569" strokeWidth="3" />
          <circle cx="50" cy="9" r="4.5" fill={getAvatarBulbColor()} style={{ transition: 'fill 0.3s ease', filter: `drop-shadow(0 0 6px ${getAvatarBulbColor()})` }} />
        </g>
      </svg>
    </div>
  );
}

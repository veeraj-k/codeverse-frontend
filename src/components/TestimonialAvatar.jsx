import React from 'react';

const TestimonialAvatar = ({ name, color }) => {
  // Generate a consistent color based on the name
  const getColor = (name) => {
    const colors = {
      'Sarah Chen': '#4a9eff',
      'Michael Rodriguez': '#ff5f56',
      'Priya Patel': '#27c93f',
      'default': '#4a9eff'
    };
    return colors[name] || colors.default;
  };

  const bgColor = getColor(name);
  const initials = name.split(' ').map(n => n[0]).join('');

  return (
    <div className="relative w-12 h-12">
      <svg width="48" height="48" viewBox="0 0 48 48" className="absolute inset-0">
        {/* Animated background circle */}
        <circle cx="24" cy="24" r="22" fill={bgColor} opacity="0.2">
          <animate
            attributeName="r"
            values="22;24;22"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
        
        {/* Main circle */}
        <circle cx="24" cy="24" r="20" fill={bgColor} />
        
        {/* Decorative elements */}
        <circle cx="24" cy="24" r="18" fill="none" stroke="white" strokeWidth="1" opacity="0.3">
          <animate
            attributeName="r"
            values="18;20;18"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        
        {/* Initials */}
        <text
          x="24"
          y="28"
          textAnchor="middle"
          fill="white"
          fontSize="16"
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
        >
          {initials}
        </text>
      </svg>
    </div>
  );
};

export default TestimonialAvatar; 
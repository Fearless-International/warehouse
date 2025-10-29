// FullscreenButton.jsx
import React from 'react';

const FullscreenButton = () => {
  const handleFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    }
  };

  return (
    <button onClick={handleFullscreen}>
      Enter Fullscreen
    </button>
  );
};

export default FullscreenButton;

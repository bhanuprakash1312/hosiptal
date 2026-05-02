import React from 'react';
import { Activity } from 'lucide-react';

const LoadingScreen = ({ message = 'Loading...', fullScreen = true }) => {
  const containerClass = fullScreen ? 'loading-overlay' : 'loading-container-local';

  return (
    <div className={containerClass}>
      <div className="glass-panel loading-panel">
        <div className="spinner-container">
          <div className="premium-spinner"></div>
          <Activity className="spinner-icon" size={24} />
        </div>
        <h3 className="loading-text text-gradient">{message}</h3>
      </div>
    </div>
  );
};

export default LoadingScreen;

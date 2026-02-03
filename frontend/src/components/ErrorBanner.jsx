import React from "react";

const ErrorBanner = ({ title = "Something went wrong", message, onRetry }) => {
  return (
    <div className="error-banner">
      <span className="error-banner-icon">⚠️</span>
      <div className="error-banner-content">
        <div className="error-banner-title">{title}</div>
        {message && <div>{message}</div>}
      </div>
      {onRetry && (
        <button className="error-banner-retry" onClick={onRetry}>
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorBanner;

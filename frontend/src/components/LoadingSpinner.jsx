import React from "react";

const LoadingSpinner = ({ text = "Loading...", small = false }) => {
  if (small) {
    return <div className={`spinner spinner--small`} />;
  }

  return (
    <div className="spinner-container">
      <div className="spinner" />
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;

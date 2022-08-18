import React from "react";

const TrackingButton = ({ step, onClick, isAllowingTrackingOnSpotify }) => {
  const renderButtonLabel = () => {
    if (isAllowingTrackingOnSpotify) return "Allowing tracking ...";
    else if (step > 2) return "✅ Tracking songs.";
    else return "Start tracking";
  };

  return (
    <a
      id="tracking-btn"
      href={`${process.env.REACT_APP_API_URL}api/spotify/auth`}
      className={`btn ${step <= 2 ? "btn-primary" : "btn-success"} ${
        step === 2 ? "active" : "disabled"
      }`}
      onClick={onClick}
    >
      {renderButtonLabel()}
    </a>
  );
};

export default TrackingButton;

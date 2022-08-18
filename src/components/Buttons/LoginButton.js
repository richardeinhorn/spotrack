import React from "react";

const LoginButton = ({
  step,
  onSignIn,
  user,
  isLoggingInOnSpotify,
  ...buttonProps
}) => {
  const renderButtonLabel = () => {
    if (isLoggingInOnSpotify) return "Signing in ...";
    else if (step > 1 && user?.user_metadata?.name)
      return `✅ Hello ${user?.user_metadata?.name}!`;
    else return "Sign in with Spotify";
  };

  return (
    <button
      id="signin-btn"
      type="button"
      className={`btn ${step === 1 ? "btn-primary" : "btn-success"}`}
      onClick={onSignIn}
      disabled={(step !== 1) | isLoggingInOnSpotify}
      {...buttonProps}
    >
      {renderButtonLabel()}
    </button>
  );
};

export default LoginButton;

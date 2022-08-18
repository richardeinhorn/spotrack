import React from "react";

const StepButton = ({ step, onConfirmEmail, isCreatingCalendarOnServer }) => {
  const renderContent = () => {
    if (isCreatingCalendarOnServer)
      return <p className="button-label">Creating calendar ...</p>;
    else if (step === 3) {
      return (
        <div>
          <div align="right">
            <button
              id="calendar-btn"
              type="button"
              className="btn btn-primary"
              disabled={step !== 3 || isCreatingCalendarOnServer}
              onClick={onConfirmEmail}
            >
              <span style={{ whiteSpace: "nowrap" }}>Create your calendar</span>
            </button>
          </div>
        </div>
      );
    } else
      return (
        <p className="button-label">
          {step > 3 ? "✅ Calendar created." : "Create your calendar"}
        </p>
      );
  };

  return (
    <div
      id="calendar-btn-container"
      className={`${
        step === 3 ? "" : step < 3 ? "btn btn-primary" : "btn btn-success"
      } ${step === 2 ? "active" : "disabled"}`}
    >
      {renderContent()}
    </div>
  );
};

export default StepButton;

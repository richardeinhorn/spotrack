import React, { useState } from "react";
import { Box, Button } from "@chakra-ui/react";
import { useCalendar } from "../../../hooks";

const ChangeEmail = ({ initialValue }) => {
  const [newEmail, setNewEmail] = useState(initialValue);
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  const { changeCalendarEmail, isChangingEmailOnServer } = useCalendar();

  if (!isChangingEmail)
    return (
      <button
        id="change-email-btn"
        type="button"
        className={"btn btn-outline-success"}
        onClick={() => setIsChangingEmail(true)}
      >
        Need to change email address?
      </button>
    );

  return (
    <Box id="change-email-container">
      <div>
        <label htmlFor="calendar-email" style={{ fontSize: "0.9em" }}>
          Your Google account email:
        </label>
        <div className="input-group mb-3" style={{ margin: "0px !important" }}>
          <input
            type="text"
            className="form-control"
            id="calendar-email"
            aria-describedby="basic-addon3"
            name="calendarEmail"
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            disabled={isChangingEmailOnServer}
          />
        </div>
      </div>
      <Button
        id="save-new-email-btn"
        type="button"
        isLoading={isChangingEmailOnServer}
        variant="outline"
        className="btn btn-outline-success"
        onClick={() =>
          changeCalendarEmail(newEmail, () => setIsChangingEmail(false))
        }
        disabled={!newEmail}
      >
        Save
      </Button>
    </Box>
  );
};

export default ChangeEmail;

// TODO: remove block
// <div id="change-email-container">
//   <div>
//     <label
//       htmlFor="calendar-email"
//       style={{ fontSize: "0.9em" }}
//     >
//       Your Google account email:
//     </label>
//     <div
//       className="input-group mb-3"
//       style={{ margin: "0px !important" }}
//     >
//       <input
//         type="text"
//         className="form-control"
//         id="calendar-email"
//         aria-describedby="basic-addon3"
//         name="calendarEmail"
//         value={newEmail}
//         onChange={(event) => setNewEmail(event.target.value)}
//         disabled={isChangingEmailOnServer}
//       />
//     </div>
//   </div>
//   <button
//     id="save-new-email-btn"
//     type="button"
//     className="btn btn-outline-success"
//     onClick={async () => await onChangeCalendarEmail()}
//     disabled={!calendarEmail || isChangingEmailOnServer}
//   >
//     {isChangingEmailOnServer ? "Saving ..." : "Save"}
//   </button>
// </div>

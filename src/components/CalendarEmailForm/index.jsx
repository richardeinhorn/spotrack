import React from 'react'

const CalendarEmailForm = ({calendarEmail, setCalendarEmail, isCreatingCalendarOnServer}) => {
  return (
    <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "flex-start",
                }}
              >
                <label htmlFor="calendar-email" style={{ fontSize: "0.9em" }}>
                  Your Google account email:
                </label>
                <div
                  className="input-group mb-3"
                  style={{ margin: "0px !important" }}
                >
                  <input
                    type="text"
                    className="form-control"
                    id="calendar-email"
                    aria-describedby="basic-addon3"
                    name="calendarEmail"
                    value={calendarEmail}
                    onChange={(event) => setCalendarEmail(event.target.value)}
                    disabled={isCreatingCalendarOnServer}
                  />
                </div>
              </div>
  )
}

export default CalendarEmailForm
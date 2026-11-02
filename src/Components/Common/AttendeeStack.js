import React, { useState } from "react";
import { resolveFileUrl } from "../../helpers/fileUrl";

const SIZE = 32;
const OVERLAP = 10;

const circle = (index) => ({
  width: SIZE,
  height: SIZE,
  marginLeft: index === 0 ? 0 : -OVERLAP,
  border: "2px solid var(--vz-card-bg, #fff)",
  fontSize: 11,
});

const Avatar = ({ attendee, index }) => {
  const [failed, setFailed] = useState(false);
  const className =
    "rounded-circle flex-shrink-0 d-inline-flex align-items-center justify-content-center";

  if (attendee.image && !failed) {
    return (
      <img
        src={resolveFileUrl(attendee.image)}
        alt=""
        className={className}
        style={{ ...circle(index), objectFit: "cover" }}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span
      className={`${className} bg-primary-subtle text-primary fw-semibold`}
      style={circle(index)}
    >
      {attendee.initials || "?"}
    </span>
  );
};

const AttendeeStack = ({ preview, label = "going" }) => {
  if (!preview?.count) {
    return <span className="text-muted fs-13">No registrations yet</span>;
  }

  const { count, attendees } = preview;
  const extra = count - attendees.length;

  return (
    <div className="d-flex align-items-center">
      {attendees.map((attendee, index) => (
        <Avatar key={index} attendee={attendee} index={index} />
      ))}
      {extra > 0 && (
        <span
          className="rounded-circle flex-shrink-0 d-inline-flex align-items-center justify-content-center bg-light text-body fw-semibold"
          style={circle(attendees.length)}
        >
          +{extra}
        </span>
      )}
      <span className="ms-2 text-muted fs-13">
        {count} {label}
      </span>
    </div>
  );
};

export default AttendeeStack;

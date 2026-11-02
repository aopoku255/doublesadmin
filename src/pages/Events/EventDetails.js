import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { Badge, Card, CardBody, Col, Container, Row, Spinner } from "reactstrap";
import AttendeeStack from "../../Components/Common/AttendeeStack";
import {
  getAttendeePreviews,
  getEventById,
  getMe,
} from "../../helpers/fakebackend_helper";
import DeleteEventModal from "./DeleteEventModal";
import { resolveFileUrl } from "../../helpers/fileUrl";
import { eventTiming, formatEventTime, isEventOver } from "./eventHelpers";

const dateText = (event) => {
  const format = (value) =>
    new Date(value).toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  const start = format(event.eventStartDate);
  const end = format(event.eventEndDate);
  return start === end ? start : `${start} to ${end}`;
};

const Fact = ({ icon, title, children }) => (
  <div className="d-flex mb-3">
    <span className="avatar-xs flex-shrink-0 me-3">
      <span className="avatar-title rounded bg-primary-subtle text-primary fs-16">
        <i className={icon}></i>
      </span>
    </span>
    <div>
      <p className="text-muted fs-12 mb-0">{title}</p>
      <div className="fw-medium">{children}</div>
    </div>
  </div>
);

const EventDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { state } = useLocation();
  const [event, setEvent] = useState(state?.event || null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [canDelete, setCanDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    getMe()
      .then((response) => setCanDelete(response.data.isSuper))
      .catch(() => setCanDelete(false));
  }, []);

  useEffect(() => {
    document.title = "Event | Doubles";
    // Always refreshed, so a reopened link or a stale list never shows old details.
    getEventById(id)
      .then((response) => setEvent(response.data))
      .catch((message) => setError(String(message)));
    getAttendeePreviews([id])
      .then((response) => setPreview(response.data[id]))
      .catch(() => setPreview(null));
  }, [id]);

  if (error && !event) {
    return (
      <div className="page-content">
        <Container fluid>
          <p className="text-danger">{error}</p>
        </Container>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="page-content text-center py-5">
        <Spinner color="primary">Loading...</Spinner>
      </div>
    );
  }

  const timing = eventTiming(event);
  const speakers = (event.eventHost || "")
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean);
  const image = resolveFileUrl(event.eventImages);

  return (
    <div className="page-content">
      <DeleteEventModal
        event={deleting ? event : null}
        onClose={() => setDeleting(false)}
        onDeleted={() =>
          navigate(isEventOver(event) ? "/past-events" : "/upcoming-events")
        }
      />
      <Container fluid>
        <div className="d-flex align-items-start justify-content-between mb-4">
          <div>
            <Badge color={timing.color} className="mb-2">
              {timing.label}
            </Badge>
            <h1 className="mb-0">{event.eventTitle}</h1>
          </div>
          <button
            type="button"
            className="btn btn-soft-dark flex-shrink-0"
            onClick={() => navigate(-1)}
          >
            <i className="ri-arrow-left-line align-bottom me-1"></i> Back
          </button>
        </div>

        <Row>
          <Col xl={8}>
            <Card className="overflow-hidden">
              {image && (
                <img
                  src={image}
                  alt={event.eventTitle}
                  className="w-100"
                  style={{ maxHeight: 380, objectFit: "cover" }}
                />
              )}
              <CardBody>
                <h5 className="mb-3">About this event</h5>
                {event.eventDescription ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: event.eventDescription,
                    }}
                  />
                ) : (
                  <p className="text-muted mb-0">No description yet.</p>
                )}
              </CardBody>
            </Card>
          </Col>
          <Col xl={4}>
            <Card>
              <CardBody>
                <Fact icon="ri-calendar-event-line" title="Date">
                  {dateText(event)}
                </Fact>
                <Fact icon="ri-time-line" title="Time">
                  {formatEventTime(event.eventStartTime)} to{" "}
                  {formatEventTime(event.eventEndTime)}
                </Fact>
                {event.eventLocation && (
                  <Fact icon="ri-map-pin-line" title="Location">
                    {event.eventLocation}
                  </Fact>
                )}
                {speakers.length > 0 && (
                  <Fact icon="ri-mic-line" title="Speakers and hosts">
                    {speakers.map((speaker) => (
                      <div key={speaker}>{speaker}</div>
                    ))}
                  </Fact>
                )}
              </CardBody>
            </Card>
            <Card>
              <CardBody>
                <h5 className="mb-3">Attendees</h5>
                <div className="mb-3">
                  <AttendeeStack
                    preview={preview}
                    label={isEventOver(event) ? "registered" : "going"}
                  />
                </div>
                <Link
                  className="btn btn-primary w-100 mb-2"
                  to={`/event-registrations/${event.id}`}
                >
                  View registrations
                </Link>
                <Link
                  className="btn btn-soft-dark w-100 mb-2"
                  to="/edit-event"
                  state={{ event }}
                >
                  <i className="ri-pencil-line align-bottom me-1"></i> Edit
                  event
                </Link>
                {event.eventQRCode && (
                  <a
                    className="btn btn-light w-100"
                    href={event.eventQRCode}
                    download={`event-${event.id}.png`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="ri-qr-code-line align-bottom me-1"></i>
                    Download QR code
                  </a>
                )}
                {canDelete && (
                  <button
                    type="button"
                    className="btn btn-soft-danger w-100 mt-2"
                    onClick={() => setDeleting(true)}
                  >
                    <i className="ri-delete-bin-line align-bottom me-1"></i>
                    Delete event
                  </button>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EventDetails;

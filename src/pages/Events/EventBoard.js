import React, { useEffect, useMemo, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Row,
  Spinner,
  Table,
  UncontrolledDropdown,
} from "reactstrap";
import AttendeeStack from "../../Components/Common/AttendeeStack";
import {
  getAdminEvents,
  getAttendeePreviews,
  getMe,
} from "../../helpers/fakebackend_helper";
import { resolveFileUrl } from "../../helpers/fileUrl";
import DeleteEventModal from "./DeleteEventModal";
import { eventTiming, formatEventTime, isEventOver } from "./eventHelpers";

const startOf = (event) => new Date(event.eventStartDate);

const longDate = (event) =>
  startOf(event).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const EventImage = ({ event, height, width = "100%" }) => {
  const [failed, setFailed] = useState(false);
  const url = resolveFileUrl(event.eventImages);
  const style = { height, width, flexShrink: 0 };

  if (!url || failed) {
    return (
      <div
        className="d-flex align-items-center justify-content-center bg-light"
        style={style}
      >
        <i className="ri-calendar-2-line text-muted fs-3"></i>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt=""
      style={{ ...style, objectFit: "cover" }}
      onError={() => setFailed(true)}
    />
  );
};

const DateBadge = ({ event }) => (
  <div
    className="bg-white rounded text-center px-2 py-1"
    style={{ minWidth: 48 }}
  >
    <div className="fw-bold fs-16 lh-1 text-dark">{startOf(event).getDate()}</div>
    <div className="text-uppercase text-primary fs-11 fw-semibold">
      {startOf(event).toLocaleDateString("en-GB", { month: "short" })}
    </div>
  </div>
);

const EventMenu = ({ event, canDelete, onDelete }) => {
  const navigate = useNavigate();

  return (
    <UncontrolledDropdown onClick={(e) => e.stopPropagation()}>
      <DropdownToggle
        tag="button"
        type="button"
        className="btn btn-sm btn-light"
        aria-label={`Actions for ${event.eventTitle}`}
      >
        <i className="ri-more-2-fill"></i>
      </DropdownToggle>
      <DropdownMenu end container="body">
        <DropdownItem
          onClick={() => navigate(`/event-registrations/${event.id}`)}
        >
          <i className="ri-group-line me-2 text-muted align-bottom"></i>
          Registrations
        </DropdownItem>
        <DropdownItem
          onClick={() => navigate("/edit-event", { state: { event } })}
        >
          <i className="ri-pencil-line me-2 text-muted align-bottom"></i>
          Edit
        </DropdownItem>
        {canDelete && (
          <>
            <DropdownItem divider />
            <DropdownItem className="text-danger" onClick={() => onDelete(event)}>
              <i className="ri-delete-bin-line me-2 align-bottom"></i>
              Delete
            </DropdownItem>
          </>
        )}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

const useOpenEvent = () => {
  const navigate = useNavigate();
  return (event) => navigate(`/event-details/${event.id}`, { state: { event } });
};

const clickable = (open, event) => ({
  style: { cursor: "pointer" },
  onClick: () => open(event),
});

const NextUp = ({ event, preview, menu }) => {
  const open = useOpenEvent();
  const timing = eventTiming(event);

  return (
    <Card className="overflow-hidden" {...clickable(open, event)}>
      <Row className="g-0">
        <Col md={5} className="position-relative" style={{ minHeight: 240 }}>
          <EventImage event={event} height="100%" />
          <div className="position-absolute top-0 start-0 m-3">
            <DateBadge event={event} />
          </div>
        </Col>
        <Col md={7}>
          <CardBody className="h-100 d-flex flex-column p-4">
            <div className="d-flex align-items-start justify-content-between">
              <Badge color={timing.color}>{timing.label}</Badge>
              {menu}
            </div>
            <Link
              to={`/event-details/${event.id}`}
              state={{ event }}
              className="text-reset"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="mt-2 mb-3">{event.eventTitle}</h3>
            </Link>
            <p className="text-muted mb-1">
              <i className="ri-time-line align-bottom me-1"></i>
              {longDate(event)} · {formatEventTime(event.eventStartTime)}
            </p>
            <p className="text-muted mb-3">
              <i className="ri-map-pin-line align-bottom me-1"></i>
              {event.eventLocation || "No location set"}
            </p>
            <div className="mt-auto">
              <AttendeeStack preview={preview} />
            </div>
          </CardBody>
        </Col>
      </Row>
    </Card>
  );
};

const EventTile = ({ event, preview, menu }) => {
  const open = useOpenEvent();
  const timing = eventTiming(event);

  return (
    <Col xl={4} md={6}>
      <Card className="h-100 overflow-hidden" {...clickable(open, event)}>
        <div className="position-relative">
          <EventImage event={event} height={140} />
          <div className="position-absolute top-0 start-0 m-2">
            <DateBadge event={event} />
          </div>
          <Badge
            color={timing.color}
            className="position-absolute top-0 end-0 m-2"
          >
            {timing.label}
          </Badge>
        </div>
        <CardBody className="d-flex flex-column">
          <div className="d-flex align-items-start justify-content-between gap-2">
            <Link
              to={`/event-details/${event.id}`}
              state={{ event }}
              className="text-reset text-truncate"
              onClick={(e) => e.stopPropagation()}
            >
              <h5 className="mb-1 text-truncate">{event.eventTitle}</h5>
            </Link>
            {menu}
          </div>
          <p className="text-muted mb-3 text-truncate">
            {formatEventTime(event.eventStartTime)} ·{" "}
            {event.eventLocation || "No location set"}
          </p>
          <div className="mt-auto">
            <AttendeeStack preview={preview} />
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

const UpcomingView = ({ events, previews, menuFor }) => {
  const live = events.filter((event) => startOf(event) <= new Date());
  const scheduled = events.filter((event) => startOf(event) > new Date());
  const [next, ...later] = scheduled;

  const tiles = (list) => (
    <Row className="g-4 mb-4">
      {list.map((event) => (
        <EventTile
          key={event.id}
          event={event}
          preview={previews[event.id]}
          menu={menuFor(event)}
        />
      ))}
    </Row>
  );

  return (
    <>
      {live.length > 0 && (
        <>
          <h5 className="mb-3">Happening now</h5>
          {tiles(live)}
        </>
      )}
      {next && (
        <>
          <h5 className="mb-3">Next up</h5>
          <NextUp event={next} preview={previews[next.id]} menu={menuFor(next)} />
        </>
      )}
      {later.length > 0 && (
        <>
          <h5 className="mb-3 mt-4">Later</h5>
          {tiles(later)}
        </>
      )}
    </>
  );
};

const turnout = (event) => {
  const registered = event.registrations || 0;
  return registered ? Math.round(((event.checkIns || 0) / registered) * 100) : null;
};

const PastView = ({ events, menuFor }) => {
  const open = useOpenEvent();

  const months = useMemo(() => {
    const groups = new Map();
    events.forEach((event) => {
      const label = startOf(event).toLocaleDateString("en-GB", {
        month: "long",
        year: "numeric",
      });
      groups.set(label, [...(groups.get(label) || []), event]);
    });
    return [...groups];
  }, [events]);

  return (
    <Card>
      <CardBody>
        <Table responsive className="align-middle mb-0">
          <thead>
            <tr>
              <th>Event</th>
              <th>Date</th>
              <th className="text-end">Registered</th>
              <th className="text-end">Checked in</th>
              <th style={{ width: 150 }}>Turnout</th>
              <th></th>
            </tr>
          </thead>
          {months.map(([month, list]) => (
            <tbody key={month}>
              <tr className="table-light">
                <th colSpan={6} className="fs-13 text-muted fw-medium">
                  {month}
                </th>
              </tr>
              {list.map((event) => {
                const percent = turnout(event);
                return (
                  <tr key={event.id} {...clickable(open, event)}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="rounded overflow-hidden">
                          <EventImage event={event} height={44} width={64} />
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <Link
                            to={`/event-details/${event.id}`}
                            state={{ event }}
                            className="text-reset fw-medium"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {event.eventTitle}
                          </Link>
                          <div className="text-muted fs-12">
                            {event.eventLocation}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="text-nowrap">{longDate(event)}</td>
                    <td className="text-end">{event.registrations ?? 0}</td>
                    <td className="text-end">{event.checkIns ?? 0}</td>
                    <td>
                      {percent === null ? (
                        <span className="text-muted">No registrations</span>
                      ) : (
                        <div className="d-flex align-items-center gap-2">
                          <div className="progress flex-grow-1" style={{ height: 6 }}>
                            <div
                              className="progress-bar bg-success"
                              style={{ width: `${Math.min(percent, 100)}%` }}
                            ></div>
                          </div>
                          <span className="fs-12 text-muted">{percent}%</span>
                        </div>
                      )}
                    </td>
                    <td className="text-end">{menuFor(event)}</td>
                  </tr>
                );
              })}
            </tbody>
          ))}
        </Table>
      </CardBody>
    </Card>
  );
};

const EventBoard = ({ past = false }) => {
  document.title = `${past ? "Past" : "Upcoming"} Events | Doubles`;

  const [events, setEvents] = useState(null);
  const [previews, setPreviews] = useState({});
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [canDelete, setCanDelete] = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = async () => {
    setError(null);
    try {
      const { data } = await getAdminEvents();
      setEvents(data);
      if (data.length) {
        // Newest 50 only: the API caps one request, and older pages rarely matter.
        const ids = data.slice(0, 50).map((event) => event.id);
        getAttendeePreviews(ids)
          .then((response) => setPreviews(response.data))
          .catch(() => setPreviews({}));
      }
    } catch (message) {
      setError(String(message));
    }
  };

  useEffect(() => {
    load();
    getMe()
      .then((response) => setCanDelete(response.data.isSuper))
      .catch(() => setCanDelete(false));
  }, []);

  const all = events || [];
  const upcomingCount = all.filter((event) => !isEventOver(event)).length;

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (events || [])
      .filter((event) => isEventOver(event) === past)
      .filter((event) =>
        `${event.eventTitle} ${event.eventLocation} ${event.eventHost}`
          .toLowerCase()
          .includes(term)
      )
      .sort((a, b) => {
        const gap = startOf(a) - startOf(b);
        return past ? -gap : gap;
      });
  }, [events, past, search]);

  const menuFor = (event) => (
    <EventMenu event={event} canDelete={canDelete} onDelete={setDeleting} />
  );

  const handleDeleted = (event) => {
    setDeleting(null);
    setEvents((list) => list.filter((item) => item.id !== event.id));
    toast.success(`${event.eventTitle} deleted`, { autoClose: 3000 });
  };

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <DeleteEventModal
        event={deleting}
        onClose={() => setDeleting(null)}
        onDeleted={handleDeleted}
      />
      <Container fluid>
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h1 className="mb-0">Events</h1>
          <Link className="btn btn-primary" to="/create-event">
            <i className="ri-add-line align-bottom me-1"></i> Create Event
          </Link>
        </div>

        <Row className="g-2 align-items-center mb-4">
          <Col md={6}>
            <ul className="nav nav-pills">
              <li className="nav-item">
                <NavLink className="nav-link" to="/upcoming-events">
                  Upcoming{events ? ` (${upcomingCount})` : ""}
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/past-events">
                  Past{events ? ` (${all.length - upcomingCount})` : ""}
                </NavLink>
              </li>
            </ul>
          </Col>
          <Col md={6}>
            <div className="search-box">
              <Input
                type="search"
                aria-label="Search events"
                placeholder="Search title, location or host"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <i className="ri-search-line search-icon"></i>
            </div>
          </Col>
        </Row>

        {error && (
          <Card>
            <CardBody className="d-flex align-items-center justify-content-between">
              <span className="text-danger">{error}</span>
              <Button color="light" onClick={load}>
                Try again
              </Button>
            </CardBody>
          </Card>
        )}
        {!events && !error && (
          <div className="text-center py-5">
            <Spinner color="primary">Loading...</Spinner>
          </div>
        )}
        {events && visible.length === 0 && (
          <div className="text-center py-5">
            <i
              className="ri-calendar-2-line text-body-secondary"
              style={{ fontSize: "5rem" }}
            ></i>
            <h4 className="text-body-secondary">
              {search
                ? "No events match your search"
                : past
                ? "No past events yet"
                : "No upcoming events"}
            </h4>
          </div>
        )}
        {visible.length > 0 &&
          (past ? (
            <PastView events={visible} menuFor={menuFor} />
          ) : (
            <UpcomingView
              events={visible}
              previews={previews}
              menuFor={menuFor}
            />
          ))}
      </Container>
    </div>
  );
};

export default EventBoard;

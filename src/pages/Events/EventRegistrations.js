import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import {
  Badge,
  Button,
  Card,
  CardBody,
  Col,
  Container,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Progress,
  Row,
  Spinner,
  Table,
} from "reactstrap";
import {
  checkinUser,
  getEventById,
  getMe,
  getRegistrants,
} from "../../helpers/fakebackend_helper";

const PAGE_SIZE = 25;

const fullName = (registration) =>
  `${registration.user?.firstName || ""} ${
    registration.user?.lastName || ""
  }`.trim() || "Unnamed";

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const formatTime = (value) =>
  new Date(value).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

// Spreadsheets run cells that start like a formula, and names are user-entered.
const csvCell = (value) => {
  let text = String(value ?? "");
  if (/^[=@\t\r]/.test(text) || /^[+-](?![\d\s]+$)/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replace(/"/g, '""')}"`;
};

const DETAILS = [
  ["Gender", "gender"],
  ["Age", "age"],
  ["Spouse", "nameOfSpouse"],
  ["Spouse's age", "ageOfSpouse"],
  ["Spouse's phone", "phoneNumberOfSpouse"],
  ["Married for", "marriageDuration"],
];

const Stat = ({ label, value, icon, color }) => (
  <Col xl={3} sm={6}>
    <Card className="card-animate">
      <CardBody className="d-flex align-items-center justify-content-between">
        <div>
          <p className="text-uppercase fw-medium text-muted mb-2">{label}</p>
          <h4 className="fs-22 fw-semibold ff-secondary mb-0">{value}</h4>
        </div>
        <div className="avatar-sm flex-shrink-0">
          <span className={`avatar-title rounded fs-3 bg-${color}-subtle`}>
            <i className={`text-${color} ${icon}`}></i>
          </span>
        </div>
      </CardBody>
    </Card>
  </Col>
);

const EventRegistrations = () => {
  document.title = "Registrations | Doubles";

  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [registrations, setRegistrations] = useState(null);
  const [error, setError] = useState(null);
  const [canCheckIn, setCanCheckIn] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [details, setDetails] = useState(null);
  const [checkingIn, setCheckingIn] = useState(null);
  const [saving, setSaving] = useState(false);
  const [checkInError, setCheckInError] = useState(null);

  const load = useCallback(() => {
    setError(null);
    return getRegistrants(eventId)
      .then((response) => setRegistrations(response.data))
      .catch((message) => setError(String(message)));
  }, [eventId]);

  useEffect(() => {
    load();
    getEventById(eventId)
      .then((response) => setEvent(response.data))
      .catch(() => setEvent(null));
    getMe()
      .then(({ data }) =>
        setCanCheckIn(
          data.isSuper || data.permissions.includes("events.checkin")
        )
      )
      .catch(() => setCanCheckIn(false));
  }, [eventId, load]);

  useEffect(() => {
    setPage(1);
  }, [search, filter]);

  const list = useMemo(() => registrations || [], [registrations]);
  const arrived = list.filter((item) => item.checkedInAt).length;
  const couples = list.filter((item) => item.attendingWithSpouse).length;
  const percent = list.length ? Math.round((arrived / list.length) * 100) : 0;

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return list.filter((item) => {
      if (filter === "arrived" && !item.checkedInAt) return false;
      if (filter === "waiting" && item.checkedInAt) return false;
      if (!term) return true;
      return [fullName(item), item.user?.email, item.user?.phone]
        .join(" ")
        .toLowerCase()
        .includes(term);
    });
  }, [list, search, filter]);

  const pages = Math.max(Math.ceil(visible.length / PAGE_SIZE), 1);
  const shown = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCsv = () => {
    const header = [
      "Name",
      "Email",
      "Phone",
      "With spouse",
      ...DETAILS.map(([label]) => label),
      "Registered",
      "Checked in",
    ];
    const rows = visible.map((item) => [
      fullName(item),
      item.user?.email,
      item.user?.phone,
      item.attendingWithSpouse ? "Yes" : "No",
      ...DETAILS.map(([, key]) => item.user?.[key]),
      formatDate(item.createdAt),
      item.checkedInAt
        ? `${formatDate(item.checkedInAt)} ${formatTime(item.checkedInAt)}`
        : "",
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `registrations-event-${eventId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const closeCheckIn = () => {
    setCheckingIn(null);
    setCheckInError(null);
  };

  const confirmCheckIn = async () => {
    setSaving(true);
    setCheckInError(null);
    try {
      await checkinUser({
        userId: checkingIn.userId,
        eventId: checkingIn.eventId,
      });
      toast.success(`${fullName(checkingIn)} checked in`, { autoClose: 3000 });
      closeCheckIn();
      await load();
    } catch (message) {
      setCheckInError(String(message));
    }
    setSaving(false);
  };

  return (
    <div className="page-content">
      <ToastContainer closeButton={false} limit={1} />
      <Container fluid>
        <div className="d-flex align-items-start justify-content-between mb-4">
          <div>
            <h1 className="mb-1">Registrations</h1>
            {event && (
              <p className="text-muted mb-0">
                {event.eventTitle} · {formatDate(event.eventStartDate)}
              </p>
            )}
          </div>
          <Link
            className="btn btn-soft-dark"
            to={`/event-details/${eventId}`}
            state={{ event }}
          >
            <i className="ri-arrow-left-line align-bottom me-1"></i> Event
          </Link>
        </div>

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
        {!registrations && !error && (
          <div className="text-center py-5">
            <Spinner color="primary">Loading...</Spinner>
          </div>
        )}

        {registrations && (
          <>
            <Row>
              <Stat
                label="Registered"
                value={list.length}
                icon="ri-coupon-3-line"
                color="primary"
              />
              <Stat
                label="Checked in"
                value={arrived}
                icon="ri-user-follow-line"
                color="success"
              />
              <Stat
                label="Yet to arrive"
                value={list.length - arrived}
                icon="ri-time-line"
                color="warning"
              />
              <Stat
                label="With spouse"
                value={couples}
                icon="ri-hearts-line"
                color="danger"
              />
            </Row>

            <Card>
              <CardBody>
                <div className="d-flex justify-content-between mb-1">
                  <span className="fw-medium">Attendance</span>
                  <span className="text-muted">{percent}%</span>
                </div>
                <Progress value={percent} color="success" className="mb-4" />

                <Row className="g-2 mb-3">
                  <Col md={6}>
                    <div className="search-box">
                      <Input
                        type="search"
                        aria-label="Search registrations"
                        placeholder="Search name, email or phone"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                      <i className="ri-search-line search-icon"></i>
                    </div>
                  </Col>
                  <Col md={3}>
                    <Input
                      type="select"
                      aria-label="Filter by arrival"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                    >
                      <option value="all">Everyone</option>
                      <option value="waiting">Yet to arrive</option>
                      <option value="arrived">Checked in</option>
                    </Input>
                  </Col>
                  <Col md={3} className="d-flex gap-2">
                    <Button color="light" className="flex-fill" onClick={load}>
                      <i className="ri-refresh-line align-bottom me-1"></i>
                      Refresh
                    </Button>
                    <Button
                      color="primary"
                      className="flex-fill"
                      disabled={visible.length === 0}
                      onClick={exportCsv}
                    >
                      <i className="ri-file-download-line align-bottom me-1"></i>
                      Export
                    </Button>
                  </Col>
                </Row>

                {list.length === 0 ? (
                  <p className="text-muted text-center py-5 mb-0">
                    Nobody has registered for this event yet.
                  </p>
                ) : visible.length === 0 ? (
                  <p className="text-muted text-center py-5 mb-0">
                    Nobody matches your search.
                  </p>
                ) : (
                  <Table responsive className="align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Coming</th>
                        <th>Registered</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {shown.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <button
                              type="button"
                              className="btn btn-link p-0 fw-medium text-start"
                              onClick={() => setDetails(item)}
                            >
                              {fullName(item)}
                            </button>
                            <div className="text-muted fs-12">
                              {item.user?.email}
                            </div>
                          </td>
                          <td>{item.user?.phone}</td>
                          <td>
                            {item.attendingWithSpouse ? "With spouse" : "Alone"}
                          </td>
                          <td>{formatDate(item.createdAt)}</td>
                          <td>
                            {item.checkedInAt ? (
                              <Badge color="success">
                                Checked in {formatTime(item.checkedInAt)}
                              </Badge>
                            ) : (
                              <Badge color="warning">Yet to arrive</Badge>
                            )}
                          </td>
                          <td className="text-end">
                            {!item.checkedInAt && canCheckIn && (
                              <Button
                                size="sm"
                                color="primary"
                                onClick={() => setCheckingIn(item)}
                              >
                                Check in
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}

                {pages > 1 && (
                  <div className="d-flex align-items-center justify-content-end gap-2 mt-3">
                    <Button
                      size="sm"
                      color="light"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-muted">
                      Page {page} of {pages}
                    </span>
                    <Button
                      size="sm"
                      color="light"
                      disabled={page === pages}
                      onClick={() => setPage(page + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </>
        )}

        <Modal isOpen={!!details} toggle={() => setDetails(null)} centered>
          <ModalHeader toggle={() => setDetails(null)}>
            {details && fullName(details)}
          </ModalHeader>
          <ModalBody>
            {details && (
              <>
                <p className="text-muted mb-1">{details.user?.email}</p>
                <p className="text-muted mb-3">{details.user?.phone}</p>
                <dl className="row mb-0">
                  {DETAILS.map(([label, key]) => (
                    <React.Fragment key={key}>
                      <dt className="col-5 fw-medium">{label}</dt>
                      <dd className="col-7">
                        {details.user?.[key] || (
                          <span className="text-muted">Not provided</span>
                        )}
                      </dd>
                    </React.Fragment>
                  ))}
                </dl>
              </>
            )}
          </ModalBody>
        </Modal>

        <Modal isOpen={!!checkingIn} toggle={closeCheckIn} centered>
          <ModalHeader toggle={closeCheckIn}>Check in</ModalHeader>
          <ModalBody>
            <p className="mb-0">
              Check in <b>{checkingIn && fullName(checkingIn)}</b>
              {checkingIn?.attendingWithSpouse ? " and their spouse" : ""}?
              They will get a confirmation by email and SMS.
            </p>
            {checkInError && (
              <p className="text-danger mt-3 mb-0">{checkInError}</p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="light" onClick={closeCheckIn}>
              Cancel
            </Button>
            <Button color="primary" disabled={saving} onClick={confirmCheckIn}>
              {saving && <Spinner size="sm" className="me-2" />}
              Check in
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default EventRegistrations;

import React, { useCallback, useEffect, useMemo, useState } from "react";
import BootstrapTheme from "@fullcalendar/bootstrap";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import FullCalendar from "@fullcalendar/react";
import Flatpickr from "react-flatpickr";
import { toast, ToastContainer } from "react-toastify";
import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Col,
  Container,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Row,
  Table,
} from "reactstrap";
import {
  createAppointmentSlot,
  getAppointments,
  getAppointmentSlots,
  removeAppointmentSlot,
  setAppointmentStatus,
} from "../../helpers/fakebackend_helper";

const STATUS_COLORS = {
  confirmed: "info",
  completed: "success",
  cancelled: "secondary",
  no_show: "warning",
};

const STATUS_LABELS = {
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
};

const CALENDAR_COLORS = {
  open: "#0ab39c",
  confirmed: "#299cdb",
  completed: "#405189",
  no_show: "#f7b84b",
};

const formatTime = (value) =>
  new Date(value).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const Appointments = () => {
  document.title = "Appointments | Doubles";

  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("");
  const [start, setStart] = useState(null);
  const [minutes, setMinutes] = useState(60);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [view, setView] = useState("calendar");
  const [selected, setSelected] = useState(null);

  const loadSlots = useCallback(() => {
    return getAppointmentSlots()
      .then((response) => setSlots(response.data))
      .catch((message) => setError(String(message)));
  }, []);

  const loadBookings = useCallback(() => {
    return getAppointments(filter)
      .then((response) => setBookings(response.data))
      .catch((message) => setError(String(message)));
  }, [filter]);

  useEffect(() => {
    loadSlots();
  }, [loadSlots]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const addSlot = async () => {
    setSaving(true);
    try {
      const endsAt = new Date(start.getTime() + minutes * 60 * 1000);
      await createAppointmentSlot({ startsAt: start, endsAt });
      setStart(null);
      toast.success("Time published", { autoClose: 3000 });
      await loadSlots();
    } catch (message) {
      toast.error(String(message), { autoClose: 4000 });
    }
    setSaving(false);
  };

  const removeSlot = async (slot) => {
    if (!window.confirm(`Remove ${formatTime(slot.startsAt)}?`)) return;
    try {
      await removeAppointmentSlot(slot.id);
      setSelected(null);
      toast.success("Time removed", { autoClose: 3000 });
      await loadSlots();
    } catch (message) {
      toast.error(String(message), { autoClose: 4000 });
    }
  };

  const changeStatus = async (booking, status) => {
    if (!window.confirm(`Mark as ${STATUS_LABELS[status]}?`)) return;
    try {
      await setAppointmentStatus(booking.id, status);
      setSelected(null);
      toast.success("Appointment updated", { autoClose: 3000 });
      await Promise.all([loadBookings(), loadSlots()]);
    } catch (message) {
      toast.error(String(message), { autoClose: 4000 });
    }
  };

  const openSlots = useMemo(
    () => slots.filter((slot) => slot.isActive),
    [slots]
  );

  const calendarEvents = useMemo(() => {
    const open = openSlots
      .filter((slot) => !slot.appointments?.length)
      .map((slot) => ({
        id: `slot-${slot.id}`,
        title: "Open",
        start: slot.startsAt,
        end: slot.endsAt,
        color: CALENDAR_COLORS.open,
        extendedProps: { slot },
      }));

    const booked = bookings
      .filter((booking) => booking.status !== "cancelled")
      .map((booking) => ({
        id: `booking-${booking.id}`,
        title:
          `${booking.user?.firstName || ""} ${booking.user?.lastName || ""}`.trim() ||
          "Booked",
        start: booking.slot?.startsAt,
        end: booking.slot?.endsAt,
        color: CALENDAR_COLORS[booking.status],
        extendedProps: { booking },
      }));

    return [...open, ...booked];
  }, [openSlots, bookings]);

  // Days have no time of their own, so a picked day starts at 09:00.
  const pickDay = ({ date }) => {
    const picked = new Date(date);
    picked.setHours(9, 0, 0, 0);

    if (picked <= new Date()) {
      toast.info("Choose a day in the future", { autoClose: 3000 });
      return;
    }
    setStart(picked);
  };

  const bookingActions = (booking) => {
    const started = new Date(booking.slot?.startsAt) <= new Date();
    if (booking.status !== "confirmed") return null;

    return (
      <>
        {started && (
          <>
            <Button
              size="sm"
              color="soft-success"
              className="me-1"
              onClick={() => changeStatus(booking, "completed")}
            >
              Completed
            </Button>
            <Button
              size="sm"
              color="soft-warning"
              className="me-1"
              onClick={() => changeStatus(booking, "no_show")}
            >
              No-show
            </Button>
          </>
        )}
        <Button
          size="sm"
          color="light"
          onClick={() => changeStatus(booking, "cancelled")}
        >
          Cancel
        </Button>
      </>
    );
  };

  const publishForm = (
    <Row className="g-3 align-items-end mb-4">
      <Col sm={6}>
        <Label className="form-label" htmlFor="slot-start">
          Start
        </Label>
        <Flatpickr
          id="slot-start"
          className="form-control"
          placeholder="Choose date and time"
          value={start}
          onChange={([date]) => setStart(date)}
          options={{
            enableTime: true,
            minDate: "today",
            dateFormat: "Y-m-d H:i",
          }}
        />
      </Col>
      <Col sm={3}>
        <Label className="form-label" htmlFor="slot-length">
          Length
        </Label>
        <Input
          id="slot-length"
          type="select"
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
        >
          <option value={30}>30 min</option>
          <option value={45}>45 min</option>
          <option value={60}>1 hour</option>
          <option value={90}>1.5 hours</option>
          <option value={120}>2 hours</option>
        </Input>
      </Col>
      <Col sm={3}>
        <Button
          color="primary"
          className="w-100"
          disabled={!start || saving}
          onClick={addSlot}
        >
          Publish
        </Button>
      </Col>
    </Row>
  );

  const selectedBooking = selected?.booking;
  const selectedSlot = selected?.slot;

  return (
    <div className="page-content">
      <ToastContainer />
      <Container fluid>
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h1 className="mb-0">Appointments</h1>
          <ButtonGroup>
            <Button
              color="primary"
              outline={view !== "calendar"}
              onClick={() => setView("calendar")}
            >
              <i className="ri-calendar-line align-bottom me-1"></i> Calendar
            </Button>
            <Button
              color="primary"
              outline={view !== "list"}
              onClick={() => setView("list")}
            >
              <i className="ri-list-check align-bottom me-1"></i> List
            </Button>
          </ButtonGroup>
        </div>
        {error && <p className="text-danger">{error}</p>}
        {view === "calendar" && (
          <Card>
            <CardBody>
              {publishForm}
              <FullCalendar
                plugins={[
                  BootstrapTheme,
                  dayGridPlugin,
                  interactionPlugin,
                  listPlugin,
                ]}
                initialView="dayGridMonth"
                themeSystem="bootstrap"
                height="auto"
                dayMaxEvents={3}
                eventDisplay="block"
                displayEventEnd={false}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,dayGridWeek,listMonth",
                }}
                buttonText={{
                  today: "Today",
                  dayGridMonth: "Month",
                  dayGridWeek: "Week",
                  listMonth: "Agenda",
                }}
                events={calendarEvents}
                dateClick={pickDay}
                eventClick={({ event }) => setSelected(event.extendedProps)}
                eventDidMount={({ el, event, view }) => {
                  // The theme forces one colour on every calendar event.
                  if (view.type.startsWith("list")) return;
                  el.style.setProperty(
                    "background-color",
                    event.backgroundColor,
                    "important"
                  );
                  el.style.setProperty(
                    "border-color",
                    event.backgroundColor,
                    "important"
                  );
                }}
                eventContent={({ event, timeText, view }) =>
                  view.type.startsWith("list") ? (
                    event.title
                  ) : (
                    <div className="px-1 text-truncate text-white">
                      <small className="me-1">{timeText}</small>
                      {event.title}
                    </div>
                  )
                }
              />
              <div className="d-flex flex-wrap gap-3 mt-3">
                {[
                  ["Open", CALENDAR_COLORS.open],
                  ["Booked", CALENDAR_COLORS.confirmed],
                  ["Completed", CALENDAR_COLORS.completed],
                  ["No-show", CALENDAR_COLORS.no_show],
                ].map(([label, color]) => (
                  <span key={label} className="text-muted fs-13">
                    <i
                      className="ri-checkbox-blank-circle-fill align-middle me-1"
                      style={{ color }}
                    ></i>
                    {label}
                  </span>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
        {view === "list" && (
        <Row>
          <Col xl={5}>
            <Card>
              <CardHeader>
                <h4 className="card-title mb-0">Available times</h4>
              </CardHeader>
              <CardBody>
                {publishForm}
                {openSlots.length === 0 ? (
                  <p className="text-muted mb-0">
                    No upcoming times. Users can't book until you publish one.
                  </p>
                ) : (
                  <Table className="align-middle mb-0">
                    <tbody>
                      {openSlots.map((slot) => {
                        const booked = slot.appointments?.length > 0;
                        return (
                          <tr key={slot.id}>
                            <td>{formatTime(slot.startsAt)}</td>
                            <td>
                              <Badge color={booked ? "info" : "success"}>
                                {booked ? "Booked" : "Open"}
                              </Badge>
                            </td>
                            <td className="text-end">
                              {!booked && (
                                <Button
                                  size="sm"
                                  color="light"
                                  onClick={() => removeSlot(slot)}
                                >
                                  Remove
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </Col>
          <Col xl={7}>
            <Card>
              <CardHeader className="d-flex align-items-center justify-content-between">
                <h4 className="card-title mb-0">Bookings</h4>
                <Input
                  type="select"
                  aria-label="Filter bookings"
                  style={{ width: "auto" }}
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {Object.entries(STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </Input>
              </CardHeader>
              <CardBody>
                {bookings.length === 0 ? (
                  <p className="text-muted mb-0">No bookings here yet.</p>
                ) : (
                  <Table responsive className="align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Who</th>
                        <th>When</th>
                        <th>Status</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map((booking) => {
                        return (
                          <tr key={booking.id}>
                            <td>
                              {booking.user?.firstName} {booking.user?.lastName}
                              <div className="text-muted fs-12">
                                {booking.user?.email}
                              </div>
                            </td>
                            <td>{formatTime(booking.slot?.startsAt)}</td>
                            <td>
                              <Badge color={STATUS_COLORS[booking.status]}>
                                {STATUS_LABELS[booking.status] ||
                                  booking.status}
                              </Badge>
                            </td>
                            <td className="text-end text-nowrap">
                              {bookingActions(booking)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
        )}
        <Modal isOpen={!!selected} toggle={() => setSelected(null)} centered>
          <ModalHeader toggle={() => setSelected(null)}>
            {selectedBooking ? "Appointment" : "Open time"}
          </ModalHeader>
          <ModalBody>
            {selectedBooking && (
              <>
                <h5 className="mb-1">
                  {selectedBooking.user?.firstName}{" "}
                  {selectedBooking.user?.lastName}
                </h5>
                <p className="text-muted mb-1">{selectedBooking.user?.email}</p>
                <p className="text-muted mb-3">{selectedBooking.user?.phone}</p>
                <p className="mb-1">
                  {selectedBooking.withSpouse
                    ? "Coming with their spouse"
                    : "Coming alone"}
                </p>
                {selectedBooking.reason && (
                  <p className="mb-3">{selectedBooking.reason}</p>
                )}
                <p className="mb-2">
                  {formatTime(selectedBooking.slot?.startsAt)}
                </p>
                <Badge color={STATUS_COLORS[selectedBooking.status]}>
                  {STATUS_LABELS[selectedBooking.status] ||
                    selectedBooking.status}
                </Badge>
              </>
            )}
            {selectedSlot && (
              <p className="mb-0">
                {formatTime(selectedSlot.startsAt)} is open for booking.
              </p>
            )}
          </ModalBody>
          <ModalFooter>
            {selectedBooking && bookingActions(selectedBooking)}
            {selectedSlot && (
              <Button
                size="sm"
                color="light"
                onClick={() => removeSlot(selectedSlot)}
              >
                Remove
              </Button>
            )}
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default Appointments;

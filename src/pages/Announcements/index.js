import React, { useCallback, useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import {
  Badge,
  Button,
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
  Spinner,
  Table,
} from "reactstrap";
import {
  getAnnouncementAudience,
  getAnnouncements,
  sendAnnouncement,
} from "../../helpers/fakebackend_helper";

const TITLE_MAX = 120;
const BODY_MAX = 1000;

const formatTime = (value) =>
  new Date(value).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const people = (count) => `${count} ${count === 1 ? "person" : "people"}`;

const Counter = ({ value, max }) => (
  <small className={value > max ? "text-danger" : "text-muted"}>
    {value}/{max}
  </small>
);

const Delivery = ({ delivery, channels }) => {
  if (!delivery) return <span className="text-muted">Sending…</span>;
  const parts = [
    ["Inbox", delivery.inbox, true],
    ["Push", delivery.push, true],
    ["Email", delivery.email, channels?.email],
    ["SMS", delivery.sms, channels?.sms],
  ].filter(([, , used]) => used);
  return (
    <div className="d-flex flex-wrap gap-1">
      {parts.map(([label, count]) => (
        <Badge key={label} color="light" className="text-body">
          {label} {count}
        </Badge>
      ))}
    </div>
  );
};

const Announcements = () => {
  document.title = "Announcements | Doubles";

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [email, setEmail] = useState(false);
  const [sms, setSms] = useState(false);
  const [audience, setAudience] = useState(null);
  const [history, setHistory] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);

  const load = useCallback(() => {
    setLoadError(null);
    return Promise.all([getAnnouncementAudience(), getAnnouncements()])
      .then(([audienceResponse, historyResponse]) => {
        setAudience(audienceResponse.data);
        setHistory(historyResponse.data);
      })
      .catch((message) => setLoadError(String(message)));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const trimmedTitle = title.trim();
  const trimmedBody = body.trim();
  const valid =
    trimmedTitle.length > 0 &&
    trimmedTitle.length <= TITLE_MAX &&
    trimmedBody.length > 0 &&
    trimmedBody.length <= BODY_MAX;

  const send = async () => {
    setSending(true);
    try {
      const response = await sendAnnouncement({
        title: trimmedTitle,
        body: trimmedBody,
        channels: { email, sms },
      });
      setConfirming(false);
      setTitle("");
      setBody("");
      setEmail(false);
      setSms(false);
      toast.success(
        `Sent to ${people(response.data.recipientCount)}`,
        { autoClose: 3000 },
      );
      await load();
    } catch (message) {
      toast.error(String(message), { autoClose: 4000 });
    }
    setSending(false);
  };

  const channelOption = (id, label, checked, onChange, count, note) => (
    <div className="form-check mb-2">
      <Input
        className="form-check-input"
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <Label className="form-check-label" htmlFor={id}>
        {label}
        {audience && (
          <span className="text-muted ms-1">
            ({people(audience[count])})
          </span>
        )}
      </Label>
      {note && <div className="text-muted small">{note}</div>}
    </div>
  );

  return (
    <div className="page-content">
      <ToastContainer />
      <Container fluid>
        <div className="mb-4">
          <h1 className="mb-1">Announcements</h1>
          <p className="text-muted mb-0">
            Send a message to everyone using the app.
          </p>
        </div>
        {loadError && (
          <p className="text-danger">
            {loadError}{" "}
            <Button color="link" className="p-0 align-baseline" onClick={load}>
              Try again
            </Button>
          </p>
        )}
        <Row>
          <Col xl={7}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">New announcement</h5>
              </CardHeader>
              <CardBody>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <Label htmlFor="announcement-title">Title</Label>
                    <Counter value={trimmedTitle.length} max={TITLE_MAX} />
                  </div>
                  <Input
                    id="announcement-title"
                    value={title}
                    placeholder="e.g. Venue change for Saturday"
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <div className="d-flex justify-content-between">
                    <Label htmlFor="announcement-body">Message</Label>
                    <Counter value={trimmedBody.length} max={BODY_MAX} />
                  </div>
                  <Input
                    id="announcement-body"
                    type="textarea"
                    rows={6}
                    value={body}
                    placeholder="What do people need to know?"
                    onChange={(e) => setBody(e.target.value)}
                  />
                </div>

                <Label className="d-block">Send to</Label>
                <div className="form-check mb-2">
                  <Input
                    className="form-check-input"
                    type="checkbox"
                    id="channel-app"
                    checked
                    disabled
                  />
                  <Label className="form-check-label" htmlFor="channel-app">
                    App inbox and push
                    {audience && (
                      <span className="text-muted ms-1">
                        ({people(audience.users)}, {audience.push} with
                        push turned on)
                      </span>
                    )}
                  </Label>
                </div>
                {channelOption(
                  "channel-email",
                  "Email",
                  email,
                  setEmail,
                  "email",
                )}
                {channelOption(
                  "channel-sms",
                  "SMS",
                  sms,
                  setSms,
                  "sms",
                  "Each text is charged. Long messages are sent as several texts.",
                )}
                <p className="text-muted small mb-3">
                  People who turned a channel off in the app won't get it there.
                </p>

                <Button
                  color="primary"
                  disabled={!valid || !audience || audience.users === 0}
                  onClick={() => setConfirming(true)}
                >
                  <i className="ri-send-plane-line align-bottom me-1"></i>
                  Review and send
                </Button>
              </CardBody>
            </Card>
          </Col>
          <Col xl={5}>
            <Card>
              <CardHeader>
                <h5 className="card-title mb-0">Preview</h5>
              </CardHeader>
              <CardBody>
                <div
                  className="rounded-3 p-3 border bg-light"
                  style={{ maxWidth: 380 }}
                >
                  <div className="d-flex align-items-center mb-2">
                    <span
                      className="avatar-xxs rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-2"
                      style={{ fontSize: 11 }}
                    >
                      D
                    </span>
                    <small className="text-muted text-uppercase fw-semibold">
                      Doubles · now
                    </small>
                  </div>
                  <div className="fw-semibold text-body">
                    {trimmedTitle || "Your title"}
                  </div>
                  <div
                    className="text-muted"
                    style={{
                      whiteSpace: "pre-line",
                      display: "-webkit-box",
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {trimmedBody || "Your message"}
                  </div>
                </div>
                <p className="text-muted small mt-2 mb-0">
                  Phones shorten long messages. The full text is in the app
                  inbox.
                </p>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Card>
          <CardHeader>
            <h5 className="card-title mb-0">Sent</h5>
          </CardHeader>
          <CardBody>
            {history === null && !loadError && <Spinner size="sm" />}
            {history?.length === 0 && (
              <p className="text-muted mb-0">No announcements yet.</p>
            )}
            {history?.length > 0 && (
              <div className="table-responsive">
                <Table className="align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Sent</th>
                      <th>Announcement</th>
                      <th>By</th>
                      <th>People</th>
                      <th>Delivered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id}>
                        <td className="text-nowrap">
                          {formatTime(item.createdAt)}
                        </td>
                        <td style={{ minWidth: 240 }}>
                          <div className="fw-semibold">{item.title}</div>
                          <div
                            className="text-muted small text-truncate"
                            style={{ maxWidth: 360 }}
                          >
                            {item.body}
                          </div>
                        </td>
                        <td className="text-muted">{item.adminEmail || "—"}</td>
                        <td>{item.recipientCount}</td>
                        <td>
                          <Delivery
                            delivery={item.delivery}
                            channels={item.channels}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </CardBody>
        </Card>

        <Modal
          isOpen={confirming}
          toggle={() => !sending && setConfirming(false)}
          centered
        >
          <ModalHeader toggle={() => !sending && setConfirming(false)}>
            Send this announcement?
          </ModalHeader>
          <ModalBody>
            <p className="fw-semibold mb-1">{trimmedTitle}</p>
            <p className="text-muted" style={{ whiteSpace: "pre-line" }}>
              {trimmedBody}
            </p>
            {audience && (
              <ul className="mb-0">
                <li>
                  App inbox for {people(audience.users)}, with push
                  to {audience.push}
                </li>
                {email && <li>Email to {people(audience.email)}</li>}
                {sms && <li>SMS to {people(audience.sms)}</li>}
              </ul>
            )}
            <p className="text-muted small mt-3 mb-0">
              It can't be recalled once sent.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="light"
              disabled={sending}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
            <Button color="primary" disabled={sending} onClick={send}>
              {sending ? <Spinner size="sm" /> : "Send now"}
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default Announcements;

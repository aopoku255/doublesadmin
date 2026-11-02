import React, { useEffect, useState } from "react";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Spinner,
} from "reactstrap";
import {
  getRegistrants,
  removeEvent,
} from "../../helpers/fakebackend_helper";

const CONFIRM_WORD = "DELETE";

const DeleteEventModal = ({ event, onClose, onDeleted }) => {
  const [impact, setImpact] = useState(null);
  const [typed, setTyped] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setImpact(null);
    setTyped("");
    setError(null);
    if (!event) return;

    getRegistrants(event.id)
      .then(({ data }) =>
        setImpact({
          registered: data.length,
          arrived: data.filter((item) => item.checkedInAt).length,
        })
      )
      .catch((message) => setError(String(message)));
  }, [event]);

  const confirm = async () => {
    setSaving(true);
    setError(null);
    try {
      await removeEvent(event.id);
      onDeleted(event);
    } catch (message) {
      setError(String(message));
    }
    setSaving(false);
  };

  return (
    <Modal isOpen={!!event} toggle={saving ? undefined : onClose} centered>
      <ModalHeader toggle={saving ? undefined : onClose}>Delete event</ModalHeader>
      <ModalBody>
        <p>
          You are about to permanently delete <b>{event?.eventTitle}</b>. This
          can't be undone.
        </p>
        {!impact && !error && <Spinner size="sm" color="primary" />}
        {impact && impact.registered === 0 && (
          <p className="text-muted">Nobody has registered for this event.</p>
        )}
        {impact && impact.registered > 0 && (
          <div className="alert alert-danger">
            This also removes <b>{impact.registered}</b>{" "}
            {impact.registered === 1 ? "registration" : "registrations"} and
            their tickets
            {impact.arrived > 0 && (
              <>
                , and <b>{impact.arrived}</b> check-in
                {impact.arrived === 1 ? "" : "s"}
              </>
            )}
            . Registered people are <b>not told</b> automatically.
          </div>
        )}
        <label className="form-label" htmlFor="delete-confirm">
          Type {CONFIRM_WORD} to confirm
        </label>
        <Input
          id="delete-confirm"
          autoComplete="off"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
        />
        {error && <p className="text-danger mt-3 mb-0">{error}</p>}
      </ModalBody>
      <ModalFooter>
        <Button color="light" disabled={saving} onClick={onClose}>
          Cancel
        </Button>
        <Button
          color="danger"
          disabled={!impact || typed !== CONFIRM_WORD || saving}
          onClick={confirm}
        >
          {saving && <Spinner size="sm" className="me-2" />}
          Delete event
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default DeleteEventModal;

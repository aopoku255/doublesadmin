import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Input, Label } from "reactstrap";
import Flatpickr from "react-flatpickr";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import { useDispatch } from "react-redux";
import { editEvent } from "../../slices/thunks";
import LocationInput from "../../Components/Common/LocationInput";
import { ToastContainer } from "react-toastify";

const EditEvent = () => {
  const navigate = useNavigate();
  const { quillRef, quill } = useQuill();
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const dispatch = useDispatch();

  const location = useLocation();
  const event = location.state?.event;

  const [eventDetails, setEventDetails] = useState({
    eventName: event?.eventTitle || "",
    startDate: event?.eventStartDate || "",
    endDate: event?.eventEndDate || "",
    location: event?.eventLocation || "",
    eventHost: event?.eventHost || "",
    eventDescription: event?.eventDescription || "",
    eventImages: "",
    adminId: "",
    eventStartTime: "",
    eventEndTime: "",
    image: null,
  });

  const handleChange = (e, fieldName) => {
    if (Array.isArray(e)) {
      setEventDetails((prevDetails) => ({
        ...prevDetails,
        [fieldName]: e[0], // Capture date from Flatpickr
      }));
    } else {
      const { name, type, value, files } = e.target;
      setEventDetails((prevDetails) => ({
        ...prevDetails,
        [name]: type === "file" ? files[0] : value, // Correctly set file object
      }));
      if (type === "file") {
        setFiles(files[0]); // Also update the `files` state
      }
    }
  };

  // Listen for Quill text changes and update eventDescription
  useEffect(() => {
    if (quill) {
      // Set initial HTML content when editor is ready
      if (event?.eventDescription) {
        quill.root.innerHTML = event.eventDescription;
      }

      // Listen for changes and update the state
      quill.on("text-change", () => {
        setEventDetails((prevDetails) => ({
          ...prevDetails,
          eventDescription: quill.root.innerHTML,
        }));
      });
    }
  }, [quill, event?.eventDescription]);

  function handleAcceptedFiles(files) {
    setFiles(files.map((file) => file.file));
  }
  const handleSubmit = async () => {
    const extractTime = (dateTime) => {
      const date = new Date(dateTime);
      return date.toTimeString().split(" ")[0]; // Extract time in HH:MM:SS format
    };

    const data = new FormData();
    if (files[0]) data.append("image", files[0]);
    data.append("eventTitle", eventDetails.eventName);
    data.append("eventLocation", eventDetails.location);
    data.append("eventHost", eventDetails.eventHost);
    data.append("eventDescription", eventDetails.eventDescription);
    // Dates left alone keep their saved times.
    if (eventDetails.startDate instanceof Date) {
      data.append("eventStartDate", eventDetails.startDate);
      data.append("eventStartTime", extractTime(eventDetails.startDate));
    }
    if (eventDetails.endDate instanceof Date) {
      data.append("eventEndDate", eventDetails.endDate);
      data.append("eventEndTime", extractTime(eventDetails.endDate));
    }

    setSaving(true);
    await dispatch(editEvent(event.id, data, navigate));
    setSaving(false);
  };

  if (!event) return <Navigate to="/upcoming-events" />;

  return (
    <div className="page-content">
      <ToastContainer />
      <Container fluid>
        <Row className="justify-content-between mb-5">
          <Col>
            <h1>EDIT EVENT</h1>
          </Col>
          <Col className="text-end">
            <Link className="btn btn-soft-dark" to="/upcoming-events">
              <i className="ri-back-line align-bottom me-1"></i> Events
            </Link>
          </Col>
        </Row>
        <Row className="justify-content-center mb-3">
          <Col lg={4}>
            {event.eventImages && (
              <img
                src={event.eventImages}
                alt={event.eventTitle}
                className="img-fluid rounded mb-3"
              />
            )}
            <FilePond
              labelIdle="Replace the image (optional)"
              files={files}
              onupdatefiles={handleAcceptedFiles}
              allowMultiple={false}
              name="image"
              className="filepond filepond-input-multiple"
              maxFiles={1}
            />
            {/* <input
              type="file"
              name="image"
              id="image"
              onChange={handleChange}
            /> */}
          </Col>
          <Col lg={6}>
            <Input
              type="textarea"
              placeholder="Event Name"
              className="bg-light"
              name="eventName"
              onChange={handleChange}
              value={eventDetails.eventName}
              style={{
                height: "5rem",
                fontSize: "2.5rem",
                fontWeight: "bold",
                border: "none",
              }}
            />
            <div className="bg-white p-3 rounded">
              <Flatpickr
                className="form-control bg-light"
                placeholder="Select Start Date and Time"
                name="startDate"
                value={eventDetails.startDate}
                onChange={(date) => handleChange(date, "startDate")}
                options={{ enableTime: true, dateFormat: "Y-m-d H:i" }}
              />
              <Flatpickr
                className="form-control bg-light mt-3"
                placeholder="Select End Date and Time"
                name="endDate"
                value={eventDetails.endDate}
                onChange={(date) => handleChange(date, "endDate")}
                options={{
                  enableTime: true,
                  dateFormat: "Y-m-d H:i",
                  minDate: eventDetails.startDate,
                }}
              />
            </div>
            <div className="mt-3">
              <Label className="form-label mb-0 mx-3">Location</Label>
              <LocationInput
                value={eventDetails.location}
                onChange={(location) =>
                  setEventDetails((prev) => ({ ...prev, location }))
                }
              />
            </div>
            <div className="mt-3">
              <Label className="form-label mb-0 mx-3">Event Host</Label>
              <Input
                placeholder="Add Event Host"
                name="eventHost"
                onChange={handleChange}
                value={eventDetails.eventHost}
              />
            </div>
            <div className="mt-3 mb-5">
              <Label className="form-label mb-0 mx-3">Event Description</Label>
              <div className="snow-editor" style={{ height: 300, marginBottom: 90 }}>
                <div ref={quillRef} />
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              type="button"
              className="w-100"
              color="dark"
              outline
              disabled={saving}
            >
              Save Changes
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EditEvent;

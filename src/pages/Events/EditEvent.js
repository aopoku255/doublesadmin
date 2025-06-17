import React, { useState, useEffect } from "react";
import { Container, Row, Col, Button, Input, Label } from "reactstrap";
import Flatpickr from "react-flatpickr";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import { useDispatch, useSelector } from "react-redux";
import { addEvent } from "../../slices/thunks";
import axios from "axios";
import { ToastContainer } from "react-toastify";

const EditEvent = () => {
  const navigate = useNavigate();
  const baseUrl = axios.create({
    baseURL: "http://localhost:8080/api/v1",
  });
  const user = useSelector((state) => state?.Login?.user);
  const { quillRef, quill } = useQuill();
  const [files, setFiles] = useState(null);
  const dispatch = useDispatch();

  const location = useLocation();
  const event = location.state?.event;

  console.log(event);

  const [eventDetails, setEventDetails] = useState({
    eventName: event?.eventTitle || "",
    startDate: "",
    endDate: "",
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

    const startTime = extractTime(eventDetails.startDate);
    const endTime = extractTime(eventDetails.endDate);
    const details = {
      ...eventDetails,
      eventImages: files,
      adminId: user?.id,
      eventStartTime: startTime,
      eventEndTime: endTime,
    };

    dispatch(addEvent(details, navigate));
  };

  useEffect(() => {
    if (event?.eventImages) {
      setFiles([
        {
          source: `http://localhost:8080${event.eventImages}`,
          options: {
            type: "local",
          },
        },
      ]);
    }
  }, [event?.eventImages]);

  return (
    <div className="page-content">
      <ToastContainer />
      <Container fluid>
        <Row className="justify-content-between mb-5">
          <Col>
            <h1>CREATE NEW EVENT</h1>
          </Col>
          <Col className="text-end">
            <Link className="btn btn-soft-dark" to="/events">
              <i className="ri-back-line align-bottom me-1"></i> Events
            </Link>
          </Col>
        </Row>
        <Row className="justify-content-center mb-3">
          <Col lg={4}>
            <FilePond
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
                onChange={(date) => handleChange(date, "startDate")}
                options={{ enableTime: true, dateFormat: "Y-m-d H:i" }}
              />
              <Flatpickr
                className="form-control bg-light mt-3"
                placeholder="Select End Date and Time"
                name="endDate"
                onChange={(date) => handleChange(date, "endDate")}
                options={{ enableTime: true, dateFormat: "Y-m-d H:i" }}
              />
            </div>
            <div className="mt-3">
              <Label className="form-label mb-0 mx-3">Location</Label>
              <Input
                placeholder="Add Event Location"
                name="location"
                onChange={handleChange}
                value={eventDetails.location}
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
              <div className="snow-editor" style={{ height: 300 }}>
                <div ref={quillRef} />
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              type="button"
              className="w-100"
              color="dark"
              outline
            >
              Create Event
            </Button>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default EditEvent;

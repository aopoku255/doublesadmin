import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Button,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from "reactstrap";
import Flatpickr from "react-flatpickr";
import { useQuill } from "react-quilljs";
import "quill/dist/quill.snow.css";
import { Link, useNavigate } from "react-router-dom";
import { FilePond } from "react-filepond";
import "filepond/dist/filepond.min.css";
import { useDispatch, useSelector } from "react-redux";
import {
  addEvent,
  createEventSpeakers,
  getEventSpeakers,
} from "../../slices/thunks";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import Select from "react-select";
import {
  GoogleMap,
  useJsApiLoader,
  StandaloneSearchBox,
} from "@react-google-maps/api";
import { useRef } from "react";
import { Loader } from "feather-icons-react/build/IconComponents";

const CreateEvent = () => {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyA7HjmbpODa6QsSiusofrZoGGGLBP9tCQI",
    libraries: ["places", "marker", "maps"],
  });

  const inputRef = useRef(null);

  const handleOnPlacesChanged = () => {
    const places = inputRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      console.log(place);
      // You can choose what you want to store
      const formattedAddress =
        `${place.name} ${place.formatted_address}` || place.name;

      // Update your form state with the selected location
      setEventDetails((prev) => ({
        ...prev,
        location: formattedAddress,
      }));
    }
  };

  const navigate = useNavigate();
  const baseUrl = axios.create({
    baseURL: "http://localhost:8080/api/v1",
  });
  const user = useSelector((state) => state?.Login?.user);
  const { quillRef, quill } = useQuill();
  const [files, setFiles] = useState(null);
  const [addEventLoading, setAddEventLoading] = useState(false);

  const dispatch = useDispatch();

  const [eventDetails, setEventDetails] = useState({
    eventName: "",
    startDate: "",
    endDate: "",
    location: "",
    eventHost: [],
    eventDescription: "",
    eventImages: "",
    adminId: "",
    eventStartTime: "",
    eventEndTime: "",
    image: null,
  });

  const handleChange = (e, fieldName) => {
    // For react-select (multi or single)
    if (fieldName === "eventHost") {
      setEventDetails((prevDetails) => ({
        ...prevDetails,
        eventHost: e, // e is an array of selected options if isMulti={true}
      }));
      return;
    }

    // For Flatpickr (date picker)
    if (Array.isArray(e)) {
      setEventDetails((prevDetails) => ({
        ...prevDetails,
        [fieldName]: e[0], // Capture date from Flatpickr
      }));
      return;
    }

    // For normal inputs and files
    const { name, type, value, files } = e.target;
    setEventDetails((prevDetails) => ({
      ...prevDetails,
      [name]: type === "file" ? files[0] : value,
    }));
    if (type === "file") {
      setFiles(files[0]); // Also update the `files` state
    }
  };

  // Listen for Quill text changes and update eventDescription
  useEffect(() => {
    if (quill) {
      quill.on("text-change", () => {
        setEventDetails((prevDetails) => ({
          ...prevDetails,
          eventDescription: quill.root.innerHTML, // Get Quill content as HTML
        }));
      });
    }
  }, [quill]);

  function handleAcceptedFiles(files) {
    setFiles(files.map((file) => file.file));
  }
  const handleSubmit = async () => {
    setAddEventLoading(true);
    const extractTime = (dateTime) => {
      const date = new Date(dateTime);
      return date.toTimeString().split(" ")[0]; // Extract time in HH:MM:SS format
    };

    const startTime = extractTime(eventDetails.startDate);
    const endTime = extractTime(eventDetails.endDate);
    const details = {
      ...eventDetails,
      eventHost: eventDetails?.eventHost.map((opt) => opt.label).join(", "),
      eventImages: files,
      adminId: user?.id,
      eventStartTime: startTime,
      eventEndTime: endTime,
    };

    dispatch(addEvent(details, navigate))
      .then(() => {
        setAddEventLoading(false);
      })
      .catch(() => {
        setAddEventLoading(false);
      });
  };

  const [openSpeakerModal, setOpenSpeakerModal] = useState(false);
  const [eventSpeakers, setEventSpeakers] = useState([]);

  const handleCreateNewSpeaker = () => {
    setOpenSpeakerModal(true);
  };

  const [createSpeakerData, setCreateSpeakerData] = useState({
    speakerName: "",
    speakerDesignation: "",
  });
  const [createSpeakerLoading, setCreateSpeakerLoading] = useState(false);

  const handleCreateSpeakerChange = (e) => {
    const { name, value } = e.target;
    setCreateSpeakerData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateSpeakerSubmit = () => {
    setCreateSpeakerLoading(true);
    dispatch(createEventSpeakers(createSpeakerData))
      .then(() => {
        setCreateSpeakerLoading(false);
      })
      .catch(() => {
        setCreateSpeakerLoading(false);
      });

    setCreateSpeakerData({
      speakerName: "",
      speakerDesignation: "",
    });

    setOpenSpeakerModal(false);
  };

  useEffect(() => {
    dispatch(getEventSpeakers());
  }, [dispatch]);

  const speakers = useSelector((state) => state?.Events?.eventSpeakers);

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
              {isLoaded && (
                <StandaloneSearchBox
                  onLoad={(ref) => (inputRef.current = ref)}
                  onPlacesChanged={handleOnPlacesChanged}
                >
                  <Input
                    placeholder="Add Event Location"
                    name="location"
                    onChange={handleChange}
                    value={eventDetails.location}
                  />
                </StandaloneSearchBox>
              )}
            </div>
            <div className="mt-3">
              <Label className="form-label mb-0 mx-3">Speakers/Host</Label>
              <div className="input-group">
                <Select
                  name="eventHost"
                  value={eventDetails.eventHost}
                  onChange={(selected) => handleChange(selected, "eventHost")}
                  isMulti={true}
                  isClearable={true}
                  className="form-control form-control-sm"
                  options={speakers.map((speaker) => ({
                    value: speaker.speakerName,
                    label: `${speaker.speakerName} - ${speaker.speakerDesignation}`,
                  }))}
                />

                <button
                  className="btn btn-dark mt-0"
                  onClick={handleCreateNewSpeaker}
                >
                  Create new
                </button>
              </div>
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
              {addEventLoading ? (
                              <Spinner size="sm" className="me-2">
                                {" "}
                                Loading...{" "}
                              </Spinner>
                            ) : null}
              Create Event
            </Button>
          </Col>
        </Row>
      </Container>
      <Modal
        centered
        isOpen={openSpeakerModal}
        toggle={() => setOpenSpeakerModal(!openSpeakerModal)}
      >
        <ModalHeader toggle={() => setOpenSpeakerModal(!openSpeakerModal)}>
          Create New Speaker
        </ModalHeader>
        <ModalBody>
          <Input
            type="text"
            placeholder="Speaker Name"
            name="speakerName"
            onChange={handleCreateSpeakerChange}
          />
          <Input
            type="select"
            placeholder="Speaker Designation"
            className="mt-3 form-select"
            name="speakerDesignation"
            onChange={handleCreateSpeakerChange}
          >
            <option value="">Select Designation</option>
            <option value="host">Host</option>
            <option value="speaker">Speaker</option>
          </Input>
        </ModalBody>
        <ModalFooter>
          <Button color="dark" onClick={handleCreateSpeakerSubmit}>
            {createSpeakerLoading ? (
                              <Spinner size="sm" className="me-2">
                                {" "}
                                Loading...{" "}
                              </Spinner>
                            ) : null}
            Add Speaker
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default CreateEvent;

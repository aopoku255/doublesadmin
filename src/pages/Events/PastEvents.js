import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  UncontrolledTooltip,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { getAllEvents, getPastEvents } from "../../slices/thunks";

const PastEvents = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const events = useSelector((state) => state?.Events?.pastEvents);

  useEffect(() => {
    dispatch(getPastEvents());
  }, [dispatch]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row className="justify-content-between">
            <Col>
              <h1>Past Events</h1>
            </Col>
            <Col className="text-end">
              <Link className="btn btn-soft-dark" to="/create-event">
                <i className="ri-add-line align-bottom me-1"></i> Create Event
              </Link>
            </Col>
          </Row>

          {events?.length === 0 ? (
            <Row className="justify-content-center mt-3">
              <Col lg={4}>
                <div className="text-center">
                  <i
                    className="ri-calendar-2-line text-body-secondary"
                    style={{ fontSize: "10rem" }}
                  ></i>
                  <h2 className="text-body-secondary">No Events Created Yet</h2>
                  <Link className="btn btn-soft-dark" to="/create-event">
                    <i className="ri-add-line align-bottom me-1"></i> Create
                    Event
                  </Link>
                </div>
              </Col>
            </Row>
          ) : (
            <Row className="justify-content-center">
              <Col lg={9}>
                {events?.map((event) => (
                  <Card
                    key={event?._id}
                    onClick={() =>
                      navigate(`/event-details/${event._id}`, {
                        state: { event },
                      })
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <CardBody>
                      <Row className="g-0 bg-light position-relative">
                        <Col md={5}>
                          <div>
                            <img
                              src={event?.eventImages}
                              className="rounded-start img-fluid h-100"
                              alt={event?.eventTitle}
                            />
                          </div>
                        </Col>
                        <Col md={7} className="p-4">
                          <h2>{event?.eventTitle}</h2>
                          <p>
                            <i className="ri-map-pin-line mx-2"></i>
                            {event?.eventLocation}
                          </p>
                          <p>
                            <i className="ri-calendar-event-fill mx-2"></i>
                            {new Date(event?.eventStartDate).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
                          </p>
                          <p>
                            <i className="ri-time-line mx-2"></i>
                            {event?.eventStartTime}
                          </p>
                          <p className="fw-bold">
                            <span className="ms-2">Host:</span>
                            <span className="ms-2">{event?.eventHost}</span>
                          </p>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                ))}
              </Col>
            </Row>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default PastEvents;

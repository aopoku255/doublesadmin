import React, { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  UncontrolledTooltip,
} from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { getAllEvents } from "../../slices/thunks";

const EventDetails = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const event = state?.event;

  useEffect(() => {
    dispatch(getAllEvents());
  }, [dispatch]);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Row className="justify-content-between">
            <Col>{/* <h1>Events Details</h1> */}</Col>
            <Col className="text-end">
              <Link className="btn btn-soft-dark" onClick={() => navigate(-1)}>
                <i className="ri-arrow-left-line align-bottom me-1"></i> Back
              </Link>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col lg={6}>
              <Card>
                <CardBody>
                  <Col lg={12}>
                    <img
                      src={event?.eventImages}
                      className="rounded-start img-fluid"
                      alt={event?.eventTitle}
                    />
                  </Col>
                  <Col md={12} className="p-4">
                    <h2 className="fw-bold">{event?.eventTitle}</h2>
                    <p>
                      <i className=" ri-account-circle-line mx-2"></i>
                      Hosted by {event?.eventHost}
                    </p>
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

                    <h6>Description</h6>
                    <hr />
                    <div
                      dangerouslySetInnerHTML={{
                        __html: event?.eventDescription,
                      }}
                    >
                      {/* {event?.eventDescription} */}
                    </div>
                    <Link to={`/event-registrations/${event?.id}`}>
                      View Event Registrations
                    </Link>
                  </Col>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default EventDetails;

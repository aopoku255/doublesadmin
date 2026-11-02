import React from "react";
import { Col, Row } from "reactstrap";
import { createSelector } from "reselect";
import { useSelector } from "react-redux";

const Section = (props) => {
  const selectDashboardData = createSelector(
    (state) => state.Login.user,
    (user) => user
  );
  // Inside your component
  const profileData = useSelector(selectDashboardData);

  return (
    <React.Fragment>
      <Row className="mb-3 pb-1">
        <Col xs={12}>
          <div className="d-flex align-items-lg-center flex-lg-row flex-column">
            <div className="flex-grow-1">
              <h4 className="fs-16 mb-1">
                Good Day {profileData?.firstName || "User"}
              </h4>
              <p className="text-muted mb-0">Here's how Doubles is doing.</p>
            </div>
          </div>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default Section;

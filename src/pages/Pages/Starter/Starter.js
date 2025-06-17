import React from "react";
import { Col, Container, Row } from "reactstrap";
import BreadCrumb from "../../../Components/Common/BreadCrumb";

const Starter = ({ children }) => {
  document.title = "Starter | Velzon - React Admin & Dashboard Template";
  return (
    <React.Fragment>
      <div className="page-content">
        <Container>
          {/* <BreadCrumb title="Starter" pageTitle="Pages" /> */}
          <Row>
            <Col xs={12}>{children}</Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default Starter;

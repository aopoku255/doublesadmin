import React, { useState } from "react";
import {
  Col,
  Dropdown,
  DropdownMenu,
  DropdownToggle,
  Nav,
  NavItem,
  NavLink,
  Row,
  TabContent,
  TabPane,
} from "reactstrap";
import { Link } from "react-router-dom";
import classnames from "classnames";

//import images
import avatar2 from "../../assets/images/users/avatar-2.jpg";
import avatar8 from "../../assets/images/users/avatar-8.jpg";
import avatar3 from "../../assets/images/users/avatar-3.jpg";
import avatar6 from "../../assets/images/users/avatar-6.jpg";
import bell from "../../assets/images/svg/bell.svg";

//SimpleBar
import SimpleBar from "simplebar-react";

const NotificationDropdown = () => {
  //Dropdown Toggle
  const [isNotificationDropdown, setIsNotificationDropdown] = useState(false);
  const toggleNotificationDropdown = () => {
    setIsNotificationDropdown(!isNotificationDropdown);
  };

  //Tab
  const [activeTab, setActiveTab] = useState("1");
  const toggleTab = (tab) => {
    if (activeTab !== tab) {
      setActiveTab(tab);
    }
  };
  return (
    <React.Fragment>
      <Dropdown
        isOpen={isNotificationDropdown}
        toggle={toggleNotificationDropdown}
        className="topbar-head-dropdown ms-1 header-item"
      >
        <DropdownToggle
          type="button"
          tag="button"
          className="btn btn-icon btn-topbar btn-ghost-secondary rounded-circle"
        >
          <i className="bx bx-bell fs-22"></i>
          <span className="position-absolute topbar-badge fs-10 translate-middle badge rounded-pill bg-danger">
            0<span className="visually-hidden">unread messages</span>
          </span>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-lg dropdown-menu-end p-0">
          <div className="dropdown-head bg-primary bg-pattern rounded-top">
            <div className="p-3">
              <Row className="align-items-center">
                <Col>
                  <h6 className="m-0 fs-16 fw-semibold text-white">
                    {" "}
                    Notifications{" "}
                  </h6>
                </Col>
                <div className="col-auto dropdown-tabs">
                  <span className="badge bg-light-subtle fs-13"> 4 New</span>
                </div>
              </Row>
            </div>

            <div className="px-2 pt-2">
              <Nav className="nav-tabs dropdown-tabs nav-tabs-custom">
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({ active: activeTab === "1" })}
                    onClick={() => {
                      toggleTab("1");
                    }}
                  >
                    All (4)
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({ active: activeTab === "2" })}
                    onClick={() => {
                      toggleTab("2");
                    }}
                  >
                    Messages
                  </NavLink>
                </NavItem>
                <NavItem>
                  <NavLink
                    href="#"
                    className={classnames({ active: activeTab === "3" })}
                    onClick={() => {
                      toggleTab("3");
                    }}
                  >
                    Alerts
                  </NavLink>
                </NavItem>
              </Nav>
            </div>
          </div>

          <TabContent activeTab={activeTab}>
            <TabPane tabId="1" className="py-2 ps-2">
              <SimpleBar style={{ maxHeight: "300px" }} className="pe-2">
                <div className="w-25 w-sm-50 pt-3 mx-auto">
                  <img src={bell} className="img-fluid" alt="user-pic" />
                </div>
                <div className="text-center pb-5 mt-2">
                  <h6 className="fs-18 fw-semibold lh-base">
                    Hey! You have no any notifications{" "}
                  </h6>
                </div>
              </SimpleBar>
            </TabPane>

            <TabPane tabId="2" className="py-2 ps-2">
              <SimpleBar style={{ maxHeight: "300px" }} className="pe-2">
                <div className="w-25 w-sm-50 pt-3 mx-auto">
                  <img src={bell} className="img-fluid" alt="user-pic" />
                </div>
                <div className="text-center pb-5 mt-2">
                  <h6 className="fs-18 fw-semibold lh-base">
                    Hey! You have no any notifications{" "}
                  </h6>
                </div>
              </SimpleBar>
            </TabPane>
            <TabPane tabId="3" className="p-4">
              <div className="w-25 w-sm-50 pt-3 mx-auto">
                <img src={bell} className="img-fluid" alt="user-pic" />
              </div>
              <div className="text-center pb-5 mt-2">
                <h6 className="fs-18 fw-semibold lh-base">
                  Hey! You have no any notifications{" "}
                </h6>
              </div>
            </TabPane>
          </TabContent>
        </DropdownMenu>
      </Dropdown>
    </React.Fragment>
  );
};

export default NotificationDropdown;

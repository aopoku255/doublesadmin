import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import { getDashboard } from "../../helpers/fakebackend_helper";
import Section from "./Section";

const STATS = [
  {
    label: "Active users",
    value: (d) => d.users?.active || 0,
    icon: "ri-user-3-line",
    color: "success",
  },
  {
    label: "Couples linked",
    value: (d) => d.couples,
    icon: "ri-hearts-line",
    color: "danger",
  },
  {
    label: "New users, last 15 days",
    value: (d) => d.newUsers,
    icon: "ri-user-add-line",
    color: "info",
  },
  {
    label: "Upcoming events",
    value: (d) => d.upcomingEvents,
    icon: "ri-calendar-event-line",
    color: "primary",
  },
  {
    label: "Event registrations",
    value: (d) => d.registrations,
    icon: "ri-coupon-3-line",
    color: "warning",
  },
  {
    label: "Upcoming appointments",
    value: (d) => d.upcomingAppointments,
    icon: "ri-calendar-check-line",
    color: "success",
  },
  {
    label: "Open appointment times",
    value: (d) => d.openSlots,
    icon: "ri-time-line",
    color: "info",
  },
  {
    label: "Completed appointments",
    value: (d) => d.appointments?.completed || 0,
    icon: "ri-checkbox-circle-line",
    color: "primary",
  },
];

const DashboardEcommerce = () => {
  document.title = "Dashboard | Doubles";

  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getDashboard()
      .then((response) => setData(response.data))
      .catch((message) => setError(String(message)));
  }, []);

  const trend = data?.trend || [];

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Section />
          {error && <p className="text-danger">{error}</p>}
          {!data && !error && <p className="text-muted">Loading...</p>}
          {data && (
            <>
              <Row>
                {STATS.map((stat) => (
                  <Col xl={3} md={6} key={stat.label}>
                    <Card className="card-animate">
                      <CardBody className="d-flex align-items-center justify-content-between">
                        <div>
                          <p className="text-uppercase fw-medium text-muted mb-2">
                            {stat.label}
                          </p>
                          <h4 className="fs-22 fw-semibold ff-secondary mb-0">
                            {stat.value(data)}
                          </h4>
                        </div>
                        <div className="avatar-sm flex-shrink-0">
                          <span
                            className={`avatar-title rounded fs-3 bg-${stat.color}-subtle`}
                          >
                            <i className={`text-${stat.color} ${stat.icon}`}></i>
                          </span>
                        </div>
                      </CardBody>
                    </Card>
                  </Col>
                ))}
              </Row>
              <Card>
                <CardHeader>
                  <h4 className="card-title mb-0">
                    New users, last 15 days
                  </h4>
                </CardHeader>
                <CardBody>
                  <ReactApexChart
                    type="bar"
                    height={300}
                    series={[
                      { name: "New users", data: trend.map((row) => row.count) },
                    ]}
                    options={{
                      chart: { toolbar: { show: false } },
                      colors: ["#405189"],
                      dataLabels: { enabled: false },
                      plotOptions: {
                        bar: { borderRadius: 3, columnWidth: "55%" },
                      },
                      xaxis: {
                        categories: trend.map((row) => row.day.slice(5)),
                        labels: { rotate: -45, hideOverlappingLabels: true },
                      },
                      yaxis: {
                        forceNiceScale: true,
                        min: 0,
                        labels: { formatter: (value) => Math.round(value) },
                      },
                    }}
                  />
                </CardBody>
              </Card>
            </>
          )}
        </Container>
      </div>
    </React.Fragment>
  );
};

export default DashboardEcommerce;

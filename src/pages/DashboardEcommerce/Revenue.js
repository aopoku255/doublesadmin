import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import { RevenueCharts } from "./DashboardEcommerceCharts";
import CountUp from "react-countup";
import { useSelector, useDispatch } from "react-redux";
import { getRevenueChartsData } from "../../slices/thunks";
import { createSelector } from "reselect";

const Revenue = () => {
  const dispatch = useDispatch();

  const [chartData, setchartData] = useState([]);

  const selectDashboardData = createSelector(
    (state) => state.DashboardEcommerce.revenueData,
    (revenueData) => revenueData
  );
  // Inside your component
  const revenueData = useSelector(selectDashboardData);

  useEffect(() => {
    setchartData(revenueData);
  }, [revenueData]);

  const onChangeChartPeriod = (pType) => {
    dispatch(getRevenueChartsData(pType));
  };

  useEffect(() => {
    dispatch(getRevenueChartsData("all"));
  }, [dispatch]);
  return (
    <React.Fragment>
      <Card>
        <CardHeader className="border-0 align-items-center d-flex">
          <h4 className="card-title mb-0 flex-grow-1">Revenue</h4>
          <div className="d-flex gap-1">
            <button
              type="button"
              className="btn btn-soft-secondary btn-sm"
              onClick={() => {
                onChangeChartPeriod("all");
              }}
            >
              ALL
            </button>
            <button
              type="button"
              className="btn btn-soft-secondary btn-sm"
              onClick={() => {
                onChangeChartPeriod("month");
              }}
            >
              1M
            </button>
            <button
              type="button"
              className="btn btn-soft-secondary btn-sm"
              onClick={() => {
                onChangeChartPeriod("halfyear");
              }}
            >
              6M
            </button>
            <button
              type="button"
              className="btn btn-soft-primary btn-sm"
              onClick={() => {
                onChangeChartPeriod("year");
              }}
            >
              1Y
            </button>
          </div>
        </CardHeader>

        <CardHeader className="p-0 border-0 bg-light-subtle">
          <Row className="g-0 text-center">
            <Col xs={6} sm={4}>
              <div className="p-3 border border-dashed border-start-0">
                <h5 className="mb-1">
                  <CountUp start={0} end={0} duration={3} separator="," />
                </h5>
                <p className="text-muted mb-0">Checked-in Registrations</p>
              </div>
            </Col>
            <Col xs={6} sm={4}>
              <div className="p-3 border border-dashed border-start-0">
                <h5 className="mb-1">
                  <CountUp
                    suffix=""
                    prefix=""
                    start={0}
                    decimals={0}
                    end={0}
                    duration={3}
                  />
                </h5>
                <p className="text-muted mb-0">Pending Checkins</p>
              </div>
            </Col>
            <Col xs={6} sm={4}>
              <div className="p-3 border border-dashed border-start-0">
                <h5 className="mb-1">
                  <CountUp
                    suffix=""
                    prefix=""
                    start={0}
                    decimals={0}
                    end={0}
                    duration={3}
                  />
                </h5>
                <p className="text-muted mb-0">Cancelled Registrations</p>
              </div>
            </Col>
          </Row>
        </CardHeader>

        <CardBody className="p-0 pb-2">
          <div className="w-100">
            <div dir="ltr">
              <RevenueCharts
                series={chartData}
                dataColors='["--vz-primary", "--vz-success", "--vz-danger"]'
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </React.Fragment>
  );
};

export default Revenue;

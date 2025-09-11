import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardHeader,
  Modal,
  Form,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Label,
  Input,
  FormFeedback,
  Button,
  Spinner,
} from "reactstrap";

import { Link, useParams } from "react-router-dom";
import Flatpickr from "react-flatpickr";
import { isEmpty } from "lodash";
import * as moment from "moment";

// Formik
import * as Yup from "yup";
import { useFormik } from "formik";

// Export Modal
import ExportCSVModal from "../../../Components/Common/ExportCSVModal";

//Import Breadcrumb
import BreadCrumb from "../../../Components/Common/BreadCrumb";
import DeleteModal from "../../../Components/Common/DeleteModal";

import {
  getCustomers as onGetCustomers,
  getRegistrants as onGetRegistrants,
  addNewCustomer as onAddNewCustomer,
  updateCustomer as onUpdateCustomer,
  deleteCustomer as onDeleteCustomer,
  checkinUser,
} from "../../../slices/thunks";

//redux
import { useSelector, useDispatch } from "react-redux";
import TableContainer from "../../../Components/Common/TableContainer";

import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "../../../Components/Common/Loader";
import { createSelector } from "reselect";

const EcommerceCustomers = () => {
  const dispatch = useDispatch();
  const { eventId } = useParams();

  const selectLayoutState = (state) => state.Ecommerce;
  const ecomCustomerProperties = createSelector(selectLayoutState, (ecom) => ({
    customers: ecom.registrants,
    isCustomerSuccess: ecom?.isCustomerSuccess,
    error: ecom?.error,
  }));
  // Inside your component
  const { customers, isCustomerSuccess, error } = useSelector(
    ecomCustomerProperties
  );

  const [isEdit, setIsEdit] = useState(false);
  const [customer, setCustomer] = useState([]);

  // Delete customer
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteModalMulti, setDeleteModalMulti] = useState(false);

  const [modal, setModal] = useState(false);

  const toggle = useCallback(() => {
    if (modal) {
      setModal(false);
      setCustomer(null);
    } else {
      setModal(true);
    }
  }, [modal]);

  const customermocalstatus = [
    {
      options: [
        { label: "Status", value: "Status" },
        { label: "Active", value: "Active" },
        { label: "Block", value: "Block" },
      ],
    },
  ];

  // Delete Data
  const onClickDelete = (customer) => {
    setCustomer(customer);
    setDeleteModal(true);
  };

  // validation
  const validation = useFormik({
    // enableReinitialize : use this flag when initial values needs to be changed
    enableReinitialize: true,

    initialValues: {
      customer: (customer && customer.customer) || "",
      email: (customer && customer.email) || "",
      phone: (customer && customer.phone) || "",
      date: (customer && customer.date) || "",
      status: (customer && customer.status) || "",
    },
    validationSchema: Yup.object({
      customer: Yup.string().required("Please Enter Customer Name"),
      email: Yup.string().required("Please Enter Your Email"),
      phone: Yup.string().required("Please Enter Your Phone"),
      status: Yup.string().required("Please Enter Your Status"),
    }),
    onSubmit: (values) => {
      if (isEdit) {
        const updateCustomer = {
          _id: customer ? customer._id : 0,
          customer: values.customer,
          email: values.email,
          phone: values.phone,
          date: date,
          status: values.status,
        };
        // update customer
        dispatch(onUpdateCustomer(updateCustomer));
        validation.resetForm();
      } else {
        const newCustomer = {
          _id: (Math.floor(Math.random() * (30 - 20)) + 20).toString(),
          customer: values["customer"],
          email: values["email"],
          phone: values["phone"],
          date: date,
          status: values["status"],
        };
        // save new customer
        dispatch(onAddNewCustomer(newCustomer));
        validation.resetForm();
      }
      toggle();
    },
  });

  // Delete Data
  const handleDeleteCustomer = () => {
    if (customer) {
      dispatch(onDeleteCustomer(customer._id));
      setDeleteModal(false);
    }
  };

  // Update Data
  const handleCustomerClick = useCallback(
    (arg) => {
      const customer = arg;
      console.log(arg);
      setCustomer({
        _id: customer._id,
        customer: customer.customer,
        email: customer.email,
        phone: customer.phone,
        date: customer.date,
        status: customer.status,
        userId: customer.userId,
        eventId: customer.eventId,
      });

      setIsEdit(true);
      toggle();
    },
    [toggle]
  );

  const [checkinloading, setcheckinloading] = useState(false);

  const handleUserCheckin = () => {
    setcheckinloading(true);
    const { userId, eventId } = customer;
    const data = { userId, eventId };

    dispatch(checkinUser(data))
      .then((res) => {
        setcheckinloading(false);

        if (res?.payload?.status === "Success") {
          setModal(false);
          toast.success("User checked in successfully!");
        } else {
          setModal(false);
          toast.error(res?.message || "User already checked in");
        }
      })
      .catch((err) => {
        setcheckinloading(false);
        setModal(false);
        toast.error("An error occurred during check-in");
      });
  };

  useEffect(() => {
    dispatch(onGetRegistrants(eventId));
  }, [eventId]);

  useEffect(() => {
    setCustomer(customers);
  }, [customers]);

  useEffect(() => {
    if (!isEmpty(customers)) {
      setCustomer(customers);
      setIsEdit(false);
    }
  }, [customers]);

  // Add Data
  const handleCustomerClicks = () => {
    setCustomer("");
    setIsEdit(false);
    toggle();
  };

  // Node API
  // useEffect(() => {
  //   if (isCustomerCreated) {
  //     setCustomer(null);
  //     dispatch(onGetCustomers());
  //   }
  // }, [
  //   dispatch,
  //   isCustomerCreated,
  // ]);

  const handleValidDate = (date) => {
    const date1 = moment(new Date(date)).format("DD MMM Y");
    return date1;
  };

  // Checked All
  const checkedAll = useCallback(() => {
    const checkall = document.getElementById("checkBoxAll");
    const ele = document.querySelectorAll(".customerCheckBox");

    if (checkall.checked) {
      ele.forEach((ele) => {
        ele.checked = true;
      });
    } else {
      ele.forEach((ele) => {
        ele.checked = false;
      });
    }
    deleteCheckbox();
  }, []);

  // Delete Multiple
  const [selectedCheckBoxDelete, setSelectedCheckBoxDelete] = useState([]);
  const [isMultiDeleteButton, setIsMultiDeleteButton] = useState(false);

  const deleteMultiple = () => {
    const checkall = document.getElementById("checkBoxAll");
    selectedCheckBoxDelete.forEach((element) => {
      dispatch(onDeleteCustomer(element.value));
      setTimeout(() => {
        toast.clearWaitingQueue();
      }, 3000);
    });
    setIsMultiDeleteButton(false);
    checkall.checked = false;
  };

  const deleteCheckbox = () => {
    const ele = document.querySelectorAll(".customerCheckBox:checked");
    ele.length > 0
      ? setIsMultiDeleteButton(true)
      : setIsMultiDeleteButton(false);
    setSelectedCheckBoxDelete(ele);
  };

  // Customers Column
  const columns = useMemo(
    () => [
      {
        Header: "",
        accessor: "id",
        hiddenColumns: true,
        Cell: (cell) => {
          return <input type="hidden" value={cell.value} />;
        },
      },
      {
        Header: "Customer",
        accessor: "customer",
        filterable: false,
      },
      {
        Header: "Email",
        accessor: "email",
        filterable: false,
      },
      {
        Header: "Phone",
        accessor: "phone",
        filterable: false,
      },
      {
        Header: "With Spouse",
        accessor: "attendingWithSpouse",
        filterable: false,
        Cell: (cell) => {
          switch (cell.value) {
            case true:
              return <span>Yes</span>;
            default:
              return <span>No</span>;
          }
        },
      },
      {
        Header: "Gender",
        accessor: "gender",
        filterable: false,
      },
      {
        Header: "Age",
        accessor: "age",
        filterable: false,
      },
      {
        Header: "Spouse Name",
        accessor: "nameOfSpouse",
        filterable: false,
      },
      {
        Header: "Spouse Age",
        accessor: "ageOfSpouse",
        filterable: false,
      },
      {
        Header: "Spouse No.",
        accessor: "phoneNumberOfSpouse",
        filterable: false,
      },
      {
        Header: "Married For",
        accessor: "marriageDuration",
        filterable: false,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: (cell) => {
          switch (cell.value) {
            case "Active":
              return (
                <span className="badge text-uppercase bg-success-subtle text-success">
                  {" "}
                  {cell.value}{" "}
                </span>
              );
            case "Block":
              return (
                <span className="badge text-uppercase bg-danger-subtle text-danger">
                  {" "}
                  {cell.value}{" "}
                </span>
              );
            default:
              return (
                <span className="badge text-uppercase bg-info-subtle text-info">
                  {" "}
                  {cell.value}{" "}
                </span>
              );
          }
        },
      },
      {
        Header: "Action",
        Cell: (cellProps) => {
          return (
            <ul className="list-inline hstack gap-2 mb-0">
              <li className="list-inline-item edit" title="Edit">
                <Link
                  to="#"
                  className=" d-inline-block edit-item-btn btn btn-primary"
                  onClick={() => {
                    const customerData = cellProps.row.original;
                    handleCustomerClick(customerData);
                  }}
                >
                  Check-in
                </Link>
              </li>
              {/* <li className="list-inline-item" title="Remove">
                <Link
                  to="#"
                  className="text-danger d-inline-block remove-item-btn"
                  onClick={() => {
                    const customerData = cellProps.row.original;
                    onClickDelete(customerData);
                  }}
                >
                  <i className="ri-delete-bin-5-fill fs-16"></i>
                </Link>
              </li> */}
            </ul>
          );
        },
      },
    ],
    [handleCustomerClick, checkedAll]
  );

  const dateFormat = () => {
    let d = new Date(),
      months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
    return (
      d.getDate() +
      " " +
      months[d.getMonth()] +
      ", " +
      d.getFullYear()
    ).toString();
  };

  const [date, setDate] = useState(dateFormat());

  const dateformate = (e) => {
    const date = e.toString().split(" ");
    const joinDate = (date[2] + " " + date[1] + ", " + date[3]).toString();
    setDate(joinDate);
  };

  // Export Modal
  const [isExportCSV, setIsExportCSV] = useState(false);

  document.title = "Registrations";

  const newRegistrants = customers.map((registers) => {
    return {
      id: 1,
      userId: registers?.userId,
      eventId: registers?.eventId,
      customerId: "#VZ2101",
      customer: `${registers?.user?.firstName} ${registers?.user?.lastName}`,
      email: registers?.user?.email,
      phone: registers?.user?.phone,
      date: registers?.user?.registrationDate,
      status: registers?.status,
      attendingWithSpouse: registers?.attendingWithSpouse,
      gender: registers?.user?.gender,
      age: registers?.user?.age,
      nameOfSpouse: registers?.user?.nameOfSpouse,
      ageOfSpouse: registers?.user?.ageOfSpouse,
      phoneNumberOfSpouse: registers?.user?.phoneNumberOfSpouse,
      marriageDuration: registers?.user?.marriageDuration,
      statusClass: "success",
    };
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <ExportCSVModal
          show={isExportCSV}
          onCloseClick={() => setIsExportCSV(false)}
          data={newRegistrants}
        />
        <DeleteModal
          show={deleteModal}
          onDeleteClick={handleDeleteCustomer}
          onCloseClick={() => setDeleteModal(false)}
        />
        <DeleteModal
          show={deleteModalMulti}
          onDeleteClick={() => {
            deleteMultiple();
            setDeleteModalMulti(false);
          }}
          onCloseClick={() => setDeleteModalMulti(false)}
        />
        <Container fluid>
          <BreadCrumb title="Registrations" pageTitle="Registrations" />
          <Row>
            <Col lg={12}>
              <Card id="customerList">
                <CardHeader className="border-0">
                  <Row className="g-4 align-items-center">
                    <div className="col-sm">
                      <div>
                        <h5 className="card-title mb-0">Registrations</h5>
                      </div>
                    </div>
                    <div className="col-sm-auto">
                      <div>
                        {isMultiDeleteButton && (
                          <button
                            className="btn btn-soft-danger me-1"
                            onClick={() => setDeleteModalMulti(true)}
                          >
                            <i className="ri-delete-bin-2-line"></i>
                          </button>
                        )}
                        {/* <button
                          type="button"
                          className="btn btn-success add-btn"
                          id="create-btn"
                          onClick={() => {
                            setIsEdit(false);
                            toggle();
                          }}
                        >
                          <i className="ri-add-line align-bottom me-1"></i> Add
                          Customer
                        </button>{" "} */}
                        <button
                          type="button"
                          className="btn btn-info"
                          onClick={() => setIsExportCSV(true)}
                        >
                          <i className="ri-file-download-line align-bottom me-1"></i>{" "}
                          Export
                        </button>
                      </div>
                    </div>
                  </Row>
                </CardHeader>
                <div className="card-body pt-0">
                  <div>
                    <TableContainer
                      columns={columns}
                      data={newRegistrants}
                      isGlobalFilter={true}
                      isAddUserList={false}
                      customPageSize={8}
                      className="custom-header-css responsive"
                      handleCustomerClick={handleCustomerClicks}
                      SearchPlaceholder="Search for customer, email, phone, status or something..."
                    />
                  </div>
                  <Modal id="showModal" isOpen={modal} toggle={toggle} centered>
                    <ModalHeader className="bg-light p-3" toggle={toggle}>
                      Check-in confirmation
                    </ModalHeader>
                    <ModalBody>
                      <p>
                        Are you sure you want to check-in{" "}
                        <b>{customer?.customer}</b> user?
                      </p>

                      {/* <Button color="success">Confirm</Button> */}
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        color="primary"
                        onClick={handleUserCheckin}
                        className="d-flex"
                      >
                        {checkinloading ? (
                          <Spinner size="sm" className="me-2">
                            {" "}
                            Loading...{" "}
                          </Spinner>
                        ) : null}
                        Confirm
                      </Button>
                      <Button color="secondary" onClick={toggle}>
                        Cancel
                      </Button>
                    </ModalFooter>
                  </Modal>
                  <ToastContainer closeButton={false} limit={1} />
                </div>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default EcommerceCustomers;

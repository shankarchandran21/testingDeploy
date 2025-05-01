import "./CertificateRequest.css";

import React, { Component } from "react";
import { autorun } from "mobx";
import { Card, Table, message, Spin } from "antd";
import AuthService from "../../services/api";
import { withRouter } from "react-router-dom";
import {
  statusRejectMapping,
  statusMapping,
  capitalizingFirstLetter,
  changeDateFormat,
  setCertificateStorageDetails,
  certificateNameMapping,
  dataFormatToDisplay,
} from "../../utils/general";
import DashboardSearch from "../../components/DashboardSearch/DashboardSearch";
import { inject, observer } from "mobx-react";
import ProfileReject from "../../components/Profile/ProfileReject";

class ApprovedCertificateList extends Component {
  constructor(props) {
    super(props);
    //state initialization
    this.state = {
      data: [],
      pagination: {
        current: 1,
        pagesize: 5,
      },
    };
    this.child = React.createRef();
  }

  //invoked immediatley after the component is being rendered.
  componentDidMount() {
    //api call
    this.fetchData();

    this.autoUpdateDisposer = autorun(() => {
      if (this.props.dataStore.certificates.certificateFetchData) {
        this.fetchData();
      }
    });
  }

  componentWillUnmount() {
    this.autoUpdateDisposer();
    //resetting all the search fields, once the page is killed
    this.props.dataStore.certificates.certificateSearchObject = {};
    this.props.dataStore.reports.certificateCsvData = [];
  }

  //api call : Certificate Request, Method : GET , headers: Authorization token
  fetchData = () => {
    if (document.getElementById("requested-list-spin") !== null)
      document.getElementById("requested-list-spin").style.display = "block";
    const {
      courseId,
      requisitionerId,
      dateArray,
      studentName,
      campusName,
      certificate,
    } = this.props.dataStore.certificates.certificateSearchObject;

    const formData = new FormData();
    //course
    if (courseId && courseId.length > 0) {
      courseId.map((item, index) => {
        formData.append(`course_id[${index}]`, item);
      });
    }
    //requisitioner
    if (requisitionerId && requisitionerId.length > 0) {
      requisitionerId.map((item, index) => {
        formData.append(`requisitioner_id[${index}]`, item);
      });
    }
    //certificate
    if (certificate && certificate !== "SCT") {
      formData.append("certificate_type", certificate);
    }
    //date
    if (dateArray && dateArray[1])
      formData.append("requested_to_date", changeDateFormat(dateArray[1]));
    if (dateArray && dateArray[0])
      formData.append("requested_from_date", changeDateFormat(dateArray[0]));

    if (studentName) formData.append("student_name", studentName);
    //campus
    if (campusName) formData.append("campus_name", campusName);

    AuthService.requestWithPost("/printableCertificatesList", formData)
      .then((response) => {
        this.props.dataStore.reports.certificateCsvData = [];
        if (document.getElementById("requested-list-spin") !== null)
          document.getElementById("requested-list-spin").style.display = "none";
        if (response) {
          response.data.map((keys) => {
            const { dateFormat } = this.props.dataStore.settings;
            if (!keys) return;
            this.props.dataStore.reports.certificateCsvData.push(
              Object.assign({
                id: keys.id,
                requisitioner_name: keys.requisitioner.requisitioner_name,
                course_name: keys.course.course_name,
                student_name: keys.student.student_name,
                requested_date: dataFormatToDisplay(
                  keys.requested_date,
                  dateFormat
                ),
                campus_name: keys.campus.campus_name,
                certificate_type: certificateNameMapping(keys.certificate_type),
                credential_number: keys.fileName.substring(
                  keys.fileName.lastIndexOf("_") + 1,
                  keys.fileName.length
                ),
                credential_status:
                  keys.reprint_status === 2
                    ? statusRejectMapping(keys.reprint_status)
                    : statusMapping(keys.credential_status),
              })
            );
          });
        }
        this.setState({
          data: this.props.dataStore.reports.certificateCsvData,
        });
        this.props.dataStore.certificates.disableSearchButton = false;
        this.props.dataStore.certificates.selectedCheckBoxRows = [];
      })
      .catch((error) => {
        if (document.getElementById("requested-list-spin") !== null)
          document.getElementById("requested-list-spin").style.display = "none";
        console.log(error);
        this.props.dataStore.certificates.disableSearchButton = false;
      });

    //make the autorun variable false, after the api is called.
    this.props.dataStore.certificates.certificateFetchData = false;
  };

  handleColumnClick = (index) => {
    const { isFromLocalStorage } = this.props.dataStore.header;
    //getting the particular id of the selected row and pass the selected data to profile page
    var id = "id";
    this.props.history.push({
      pathname: "/certificates/send-to-print-list/" + index[id],
      id: index[id],
    });

    //suppose navigated to profile page and the user refreshes the page, history will be empty
    //and no data will be displayed.
    //so need to store the selected ids in the local storage.
    let certificateArray = Object.assign({
      certificate_id: index[id],
      certificate_list: "sent-to-print-list",
    });

    setCertificateStorageDetails(isFromLocalStorage, certificateArray);
  };

  handleStandardTableChanges = (paginationProps) => {
    let { pagination } = this.state;
    pagination.pagesize = paginationProps.pagesize;
    pagination.current = paginationProps.current;
  };

  handlePrintClick = (index) => {
    // if (document.getElementById("requested-list-spin") !== null)
    //   document.getElementById("requested-list-spin").style.display = "block";

    let body = {};
    body.student_certificate_id = index.id;
    let endPoint;

    if (index.credential_status === "Reprint Approved") {
      endPoint = "/reprintCertificate_list";
    } else {
      endPoint = "/printCertificate_list";
    }

    this.child.current.setModalVisibility(
      true,
      false,
      index.id,
      endPoint,
      body,
      index.credential_number
    );
  };

  handleCertificateListingPage = () => {
    this.props.dataStore.certificates.certificateFetchData = true;
  };

  render() {
    const { pagination } = this.state;

    //columns
    const columns = [
      {
        title: "Sl.No",
        dataIndex: "",
        key: "",
        width: 75,
        render: (index, text, record) => {
          return (
            <>
              {index.id ? (
                <span
                  style={{
                    color: "#515974",
                  }}
                >
                  {(pagination.current - 1) * 10 + record + 1}
                </span>
              ) : null}
            </>
          );
        },
      },
      {
        title: "Student Name",
        dataIndex: "student_name",
        key: "student_name",
        width: 180,
        sorter: (a, b) => {
          a = a.student_name || "";
          b = b.student_name || "";
          return a.localeCompare(b);
        },
        render: (student_name) => {
          return (
            <span
              style={{
                color: "#515974",
              }}
            >
              {capitalizingFirstLetter(student_name)}
            </span>
          );
        },
      },
      {
        title: "Course",
        dataIndex: "course_name",
        key: "course_name",
        width: 200,
        sorter: (a, b) => {
          a = a.course_name || "";
          b = b.course_name || "";
          return a.localeCompare(b);
        },
        render: (course_name) => {
          return (
            <span
              style={{
                color: "#515974",
              }}
            >
              {capitalizingFirstLetter(course_name)}
            </span>
          );
        },
      },
      {
        title: "Campus",
        dataIndex: "campus_name",
        key: "campus_name",
        width: 200,
        sorter: (a, b) => {
          a = a.campus_name || "";
          b = b.campus_name || "";
          return a.localeCompare(b);
        },
        render: (campus_name) => {
          return (
            <span
              style={{
                color: "#515974",
              }}
            >
              {campus_name}
            </span>
          );
        },
      },
      {
        title: "Requested By",
        dataIndex: "requisitioner_name",
        key: "requisitioner_name",
        width: 180,
        sorter: (a, b) => {
          a = a.requisitioner_name || "";
          b = b.requisitioner_name || "";
          return a.localeCompare(b);
        },
        render: (requisitioner_name) => {
          return (
            <span
              style={{
                color: "#515974",
              }}
            >
              {capitalizingFirstLetter(requisitioner_name)}
            </span>
          );
        },
      },
      {
        title: "Requested Date",
        dataIndex: "requested_date",
        key: "requested_date",
        sorter: (a, b) =>
          new Date(a.requested_date) - new Date(b.requested_date),
        width: 130,
        render: (index) => {
          return (
            <span
              style={{
                color: "#515974",
              }}
            >
              {index}
            </span>
          );
        },
      },
      {
        title: "Certificate Name",
        dataIndex: "credential_number",
        key: "credential_number",
        width: 160,
        sorter: (a, b) => {
          a = a.credential_number || "";
          b = b.credential_number || "";
          return a.localeCompare(b);
        },
        render: (credential_number, record) => {
          return (
            <span
              style={{
                color: "#515974",
              }}
            >
              {credential_number}
            </span>
          );
        },
      },
      {
        title: "Status",
        dataIndex: "credential_status",
        key: "credential_status",
        width: 100,
        sorter: (a, b) => {
          a = a.credential_status || "";
          b = b.credential_status || "";
          return a.localeCompare(b);
        },
        render: (credential_status, record) => {
          return (
            <span
              style={{
                color: "#1277b1",
              }}
            >
              {credential_status}
            </span>
          );
        },
      },
      {
        title: "Certificate Type",
        dataIndex: "certificate_type",
        key: "certificate_type",
        width: 100,
        sorter: (a, b) => {
          a = a.certificate_type || "";
          b = b.certificate_type || "";
          return a.localeCompare(b);
        },
        render: (certificate_type) => {
          return (
            <span
              style={{
                color: "#515974",
              }}
            >
              {certificate_type}
            </span>
          );
        },
      },
      {
        title: "Action",
        dataIndex: "",
        key: "",
        width: 105,
        render: (index) => {
          return (
            <>
              {index.id ? (
                <span
                  style={{
                    cursor: "pointer",
                    backgroundColor: "#57c059",
                    padding: "5px 15px 5px 15px",
                    borderRadius: 15,
                    color: "#fff",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.handleColumnClick(index);
                  }}
                >
                  {index.id ? <span>Details</span> : null}
                </span>
              ) : null}
            </>
          );
        },
      },
      {
        title: "Print",
        dataIndex: "",
        key: "",
        width: 110,
        render: (index) => {
          return (
            <>
              {index.id ? (
                <span
                  style={{
                    cursor: "pointer",
                    backgroundColor: "#57c059",
                    padding: "5px 15px 5px 15px",
                    borderRadius: 15,
                    color: "#fff",
                    minWidth: 110,
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.handlePrintClick(index);
                  }}
                >
                  {index.id ? (
                    index.credential_status === "Reprint Approved" ? (
                      <span>Reprint</span>
                    ) : (
                      <span>Print</span>
                    )
                  ) : null}
                </span>
              ) : null}
            </>
          );
        },
      },
    ];

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        let uniqueCourses = [];
        let uniqueStatus = [];

        this.props.dataStore.certificates.selectedCheckBoxRows =
          selectedRowKeys;

        selectedRows.map((rowKeys) => {
          if (uniqueCourses) {
            uniqueCourses.push(rowKeys.course_name);
            this.props.dataStore.certificates.selectedCheckboxCourses = [
              ...new Set(uniqueCourses),
            ];
          }

          if (uniqueStatus) {
            uniqueStatus.push(rowKeys.credential_status);
            this.props.dataStore.certificates.selectedCheckboxStatus = [
              ...new Set(uniqueStatus),
            ];
          }
        });
      },
    };

    return (
      <div className="requested-list-container">
        <div
          id="requested-list-spin"
          style={{ display: "none", position: "relative" }}
        >
          <Spin className="spin-user" size="large" />
        </div>
        <Card className="requested-list-header">CERTIFICATE APPROVED</Card>
        <div className="requested-list-vertical" />
        <DashboardSearch from="dashboard" list="send-to-print" />
        <Table
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
          rowSelection={rowSelection}
          columns={columns}
          dataSource={this.state.data}
          className="requested-list-table"
          pagination={pagination}
          pagesize={pagination.pagesize}
          onChange={this.handleStandardTableChanges}
          rowKey={(record) => record.id}
        />
        <ProfileReject
          ref={this.child}
          handleClick={this.handleCertificateListingPage}
        />
      </div>
    );
  }
}

export default withRouter(
  inject("dataStore")(observer(ApprovedCertificateList))
);

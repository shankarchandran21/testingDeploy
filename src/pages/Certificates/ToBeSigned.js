import "./CertificateRequest.css";
import React, { Component } from "react";
import { Card, Table, Spin } from "antd";
import {
  statusMapping,
  capitalizingFirstLetter,
  changeDateFormat,
  setCertificateStorageDetails,
  certificateNameMapping,
  dataFormatToDisplay,
} from "../../utils/general";
import AuthService from "../../services/api";
import { withRouter } from "react-router-dom";
import DashboardSearch from "../../components/DashboardSearch/DashboardSearch";
import { inject, observer } from "mobx-react";
import { autorun } from "mobx";

const uniqueSignee = 4;
class Approvedlist extends Component {
  constructor(props) {
    super(props);
    // state initialization
    this.state = {
      data: [],
      selectedRowKeys: [],
      pagination: {
        current: 1,
        pagesize: 5,
      },
    };
  }

  componentDidMount() {
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

  handleColumnClick = (index, from) => {
    const { isFromLocalStorage } = this.props.dataStore.header;
    //getting the particular id of the selected row and pass the selected data to view page
    var id = "id";

    if (from === "details") {
      this.props.history.push({
        pathname: "/certificates/to-be-signed-list/" + index[id],
        id: index[id],
      });
    } else {
      this.props.history.push({
        pathname: `/certificates/to-be-signed-list/${index[id]}/preview`,
        from: "to-be-signed-list",
        id: index[id],
      });
    }

    //suppose navigated to view page and the user refreshes the page, history will be empty
    //and no data will be displayed.
    //so need to store the selected ids in the local storage.
    let certificateArray = Object.assign({
      certificate_id: index[id],
      certificate_list: "to-be-signed-list",
    });

    setCertificateStorageDetails(isFromLocalStorage, certificateArray);
  };

  // api call

  fetchData = () => {
    this.setState({
      selectedRowKeys: [],
    });
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

    AuthService.requestWithPost("/searchApprovedCertificate", formData)
      .then((response) => {
        const { dateFormat } = this.props.dataStore.settings;
        this.props.dataStore.reports.certificateCsvData = [];
        if (document.getElementById("requested-list-spin") !== null)
          document.getElementById("requested-list-spin").style.display = "none";

        if (response) {
          response.data.map((keys) => {
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
                credential_number: keys.credential_number,
                credential_status: statusMapping(keys.credential_status),
                certificate_type: certificateNameMapping(keys.certificate_type),
              })
            );
          });
        }
        this.setState({
          data: this.props.dataStore.reports.certificateCsvData,
        });
        this.props.dataStore.certificates.disableSearchButton = false;
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

  handleStandardTableChanges = (paginationProps) => {
    let { pagination } = this.state;
    pagination.pagesize = paginationProps.pagesize;
    pagination.current = paginationProps.current;
  };

  // start = () => {
  //   this.setState({ loading: true });
  //   setTimeout(() => {
  //     this.setState({
  //       selectedRowKeys: [],
  //       loading: false,
  //     });
  //   }, 1000);
  // };

  render() {
    const { pagination, selectedRowKeys, data } = this.state;
    const { storage } = this.props.dataStore.header;

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
        width: 200,
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
        width: 250,
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
        width: 200,
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
        width: 150,
        sorter: (a, b) =>
          new Date(a.requested_date) - new Date(b.requested_date),
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
        title: "Credential Number",
        dataIndex: "credential_number",
        key: "credential_number",
        width: 150,
        sorter: (a, b) => {
          a = a.credential_number || "";
          b = b.credential_number || "";
          return a.localeCompare(b);
        },
        render: (credential_number, index) => {
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
        render: (credential_status) => {
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
        width: 100,
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
                    this.handleColumnClick(index, "details");
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
        title: "Certificate Preview",
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
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    this.handleColumnClick(index, "preview");
                  }}
                >
                  {index.id ? <span>Preview</span> : null}
                </span>
              ) : null}
            </>
          );
        },
      },
    ];

    const rowSelection = {
      onChange: (selectedRowKeys, selectedRows) => {
        let uniqueChars = [];

        this.props.dataStore.certificates.selectedCheckBoxRows =
          selectedRowKeys;

        selectedRows.map((rowKeys) => {
          if (uniqueChars) {
            uniqueChars.push(rowKeys.course_name);
            this.props.dataStore.certificates.selectedCheckboxCourses = [
              ...new Set(uniqueChars),
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
        <Card className="requested-list-header">
          {" "}
          CERTIFICATE TO BE SIGNED{" "}
        </Card>{" "}
        <div className="requested-list-vertical" />
        <DashboardSearch from="dashboard" list="to-be=signed-list" />
        <Table
        
          rowClassName={(record, index) =>
            index % 2 === 0 ? "table-row-light" : "table-row-dark"
          }
          rowSelection={ null }
          columns={columns}
          dataSource={data}
          className="requested-list-table"
          pagination={pagination}
          pagesize={pagination.pagesize}
          onChange={this.handleStandardTableChanges}
          rowKey={(record) => record.id}
        />
      </div>
    );
  }
}

export default withRouter(inject("dataStore")(observer(Approvedlist)));

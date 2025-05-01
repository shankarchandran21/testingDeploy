import "./ExportCsv.css";
import React, { Component } from "react";
import { CSVLink } from "react-csv";
import { inject, observer } from "mobx-react";

const reportHeaders = [
  //   { label: "Sl.No", key: "id" },
  { label: "Student Name", key: "student_name" },
  { label: "Course", key: "course_name" },
  { label: "Campus", key: "campus_name" },
  { label: "Requested Name", key: "requisitioner_name" },
  { label: "Credential Date", key: "credential_date" },
  { label: "Requested Date", key: "requested_date" },
  { label: "Credential Number", key: "credential_number" },
  { label: "Status", key: "credential_status" },
  { label: "Certificate Type", key: "certificate_type" },
];

const certificateHeaders = [
  { label: "Student Name", key: "student_name" },
  { label: "Course", key: "course_name" },
  { label: "Campus", key: "campus_name" },
  { label: "Requested Name", key: "requisitioner_name" },
  { label: "Requested Date", key: "requested_date" },
  { label: "Credential Number", key: "credential_number" },
  { label: "Status", key: "credential_status" },
  { label: "Certificate Type", key: "certificate_type" },
];

class AsyncCSV extends Component {
  constructor(props) {
    super(props);
    this.csvLinkEl = React.createRef();
  }

  downloadReport = () => {
    this.csvLinkEl.current.link.click();
  };

  render() {
    const { csvData } = this.props.dataStore.reports;
    const { certificateCsvData } = this.props.dataStore.reports;
    return (
      <>
        {(csvData && csvData.length > 0) ||
        (certificateCsvData && certificateCsvData.length > 0) ? (
          <div className="csv-container">
            <input
              type="button"
              value="Export To CSV"
              onClick={this.downloadReport}
              className="csv"
            />
            {this.props.from === "reports" ? (
              <CSVLink
                headers={reportHeaders}
                filename="Report.csv"
                data={csvData}
                ref={this.csvLinkEl}
              />
            ) : (
              <CSVLink
                headers={certificateHeaders}
                filename="Certificates.csv"
                data={certificateCsvData}
                ref={this.csvLinkEl}
              />
            )}
          </div>
        ) : null}
      </>
    );
  }
}

export default inject("dataStore")(observer(AsyncCSV));

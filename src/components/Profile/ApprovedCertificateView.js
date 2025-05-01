import "./Profile.css";

import { Card, Button, Spin, message } from "antd";
import React, { Component } from "react";
import AuthService from "../../services/api";
import { withRouter } from "react-router-dom";
import { inject, observer } from "mobx-react";
import {
  certificateNameMapping,
  certificateStorageDetails,
  dataFormatToDisplay,
} from "../../utils/general";
import ProfileReject from "./ProfileReject";
import { StepBackwardOutlined } from "@ant-design/icons";

let noOfSignees,
  certificateDetails,
  signeearray = [];
class ApprovedCertificateView extends Component {
  constructor() {
    super();
    this.state = {
      reprint: null,
    };
    this.child = React.createRef();
  }
  componentDidMount() {
    const { isFromLocalStorage } = this.props.dataStore.header;
    certificateDetails = certificateStorageDetails(isFromLocalStorage);

    let id = "";
    //get the selected id passed as history param from dashboard page.
    //suppose page is refreshed , then history param will be empty, in that case
    //take the id from local storage.
    if (this.props.location.id) {
      id = this.props.location.id;
    } else if (certificateDetails && certificateDetails.certificate_id) {
      id = certificateDetails.certificate_id;
    }

    //api call, with id as path param
    this.fetchCertificateViewData(id);
  }

  componentWillUnmount() {
    // the selected id is stored in local storage, will navigated back to the main dashboard listing page
    //the local storage need to be cleared.
    // localStorage.removeItem("certificate-approved-id");
    this.props.dataStore.certificates.certificateRequestDetails = {};
    signeearray = [];
  }

  fetchCertificateViewData = (id) => {
    const { dateFormat } = this.props.dataStore.settings;
    if (document.getElementById("profile-spin") !== null)
      document.getElementById("profile-spin").style.display = "block";

    AuthService.requestMethod(`/printableCertificateView/${id}`)
      .then((response) => {
        if (document.getElementById("profile-spin") !== null)
          document.getElementById("profile-spin").style.display = "none";

        if (response && response.data) {
          if (response.data.success === 0 && response.data.message) {
            message.error(response.data.message);
          } else {
            //intially approve and reject buttons are hidden, it will be visible only
            //if the api returns the result
            document.getElementById("back-button").style.visibility = "visible";
            //storing the id in a mobx variable, because for approve/reject/preview
            //need to pass the id in the api.
            this.props.dataStore.certificates.id = id;

            let details, signeeDetails, refinedDetails;
            //response data is stored in mobx variable
            //response is array of objects, so storing the values as an object
            details = response.data.certificate_data;

            //set visibility of print button based on the credential status
            if (
              (details.credential_status && details.credential_status === 4) ||
              details.reprint_status === 2
            ) {
              document.getElementById("print-button").style.visibility =
                "visible";
            }
            //now details will have full list of details, refine it to necessary keys by
            //deleting the unwanted keys
            if (details.id !== undefined && details.id !== null)
              delete details.id;
            if (details.status) delete details.status;
            if (details.credential_status) delete details.credential_status;
            if (details.credential_number) delete details.credential_number;
            if (
              details.reprint_status !== null ||
              details.reprint_status !== undefined ||
              details.reprint_status
            ) {
              this.setState({
                reprint: details.reprint_status,
              });
              delete details.reprint_status;
            }

            //adding the certificate name key and value
            if (
              details.fileName ||
              details.certificate_type ||
              details.requested_date ||
              details.approved_on ||
              details.issued_on ||
              details.printed_on ||
              details.reprint_accepted_on ||
              details.reprint_requested_on
            ) {
              refinedDetails = Object.assign({
                fileName: details.fileName.substring(
                  details.fileName.lastIndexOf("_") + 1,
                  details.fileName.length
                ),
                certificate_type: certificateNameMapping(
                  details.certificate_type
                ),

                requested_date: dataFormatToDisplay(
                  details.requested_date,
                  dateFormat
                ),
                approved_on: dataFormatToDisplay(
                  details.approved_on,
                  dateFormat
                ),
                issued_on: dataFormatToDisplay(details.issued_on, dateFormat),
                printed_on: dataFormatToDisplay(details.printed_on, dateFormat),
                reprint_accepted_on: details.reprint_accepted_on
                  ? dataFormatToDisplay(details.reprint_accepted_on, dateFormat)
                  : null,
                reprint_requested_on: details.reprint_requested_on
                  ? dataFormatToDisplay(
                      details.reprint_requested_on,
                      dateFormat
                    )
                  : null,
              });
            }

            //to take signee details
            if (details.signed_by.length > 0) {
              noOfSignees = details.signed_by.length;
              details.signed_by.map((signee, index) => {
                signeearray.push({
                  signedByValue: signee.user.signed_by,
                  signedOnValue: dataFormatToDisplay(
                    signee.created_date,
                    dateFormat
                  ),
                  signedByKey: `signed_by ${index}`,
                  signedOnKey: `signed_on ${index}`,
                  signedByLabel: `Signee ${index + 1}`,
                  signedOnLabel: `Signed On`,
                });
              });

              signeeDetails = Object.assign({
                signed_by: signeearray,
              });
            }

            //merging the two objects into single and storing in mobx variable
            let merged = { ...details, ...refinedDetails, ...signeeDetails };

            //refined object is stored to the mobx variable
            this.props.dataStore.certificates.certificateRequestDetails =
              merged;
          }
        }
      })
      .catch((error) => {
        if (document.getElementById("profile-spin") !== null)
          document.getElementById("profile-spin").style.display = "none";
        console.log(error);
      });
  };

  handlePrintClick = (buttonIds) => {
    if (document.getElementById("profile-spin") !== null)
      document.getElementById("profile-spin").style.display = "none";
    const { id } = this.props.dataStore.certificates;
    const filename = this.props.dataStore.certificates.certificateRequestDetails.fileName;
    let body = {};
    body.student_certificate_id = id;

    if (buttonIds === "print-button") {
      this.child.current.setModalVisibility(
        true,
        false,
        id,
        "/printCertificate",
        body,filename
      );
    } else if (buttonIds === "reprint-button") {
      this.child.current.setModalVisibility(
        true,
        false,
        id,
        "/reprintCertificate",
        body,filename
      );
    }else if (buttonIds === "download") {
      this.child.current.setModalVisibility(
        true,
        false,
        id,
        this.state.reprint ? "/reprintCertificate":'/printCertificate',
        body,filename,
        true
      );
    } else {
      window.history.back();
    }
  };

  handleCertificateListingPage = () => {
    this.props.dataStore.certificates.fetchNotifications = true;
    window.history.back();
  };

  render() {
    //the data that needs to be displayed is stored in an object as key value pair.
    //key -> same as the key from api
    //value -> the data that need to be displayed
    const displayObjects = {
      student_name: "Student Name",
      course_name: "Course",
      requested_date: "Requested Date",
      fileName: "Certificate Name",
      certificate_name: "Certificate Name",
      certificate_type: "Certificate Type",
      requisitioner_name: "Requested By",
      approved_by: "Approved By",
      approved_on: "Approved On",
      issued_by: "Issued By",
      issued_on: "Issued On",
      printed_by: "Printed By",
      printed_on: "Printed On",
      reprint_accepted_by: "Reprint Accepted By",
      reprint_accepted_on: "Reprint Accepted On",
      reprint_requested_by: "Reprint Requested By",
      reprint_requested_on: "Reprint Requested On",
      campus_name: "Campus",
      approved_comments: "Approval Comment"
    };

    //this condition will check for all falsy values
    if (this.props.dataStore.certificates.certificateRequestDetails)
      var certificateRequestDetails =
        this.props.dataStore.certificates.certificateRequestDetails;
    const { reprint } = this.state;

    //JSX - looping the mobx variable(object of key-value pair)
    return (
      <div className="certificate-profile-container">
        <div
          id="profile-spin"
          style={{ display: "none", position: "relative" }}
        >
          <Spin className="spin-user" size="large" />
        </div>
        <Card className="certificate-profile-header">
          Certificate Approved Details{" "}
        </Card>
        <div className="certificate-profile-divider" />

        <div class="certificate-profile-wrapper">
          {Object.keys(certificateRequestDetails).map(function (key) {
            return key === "signed_by" ? (
              certificateRequestDetails[key].map((list) => {
                return (
                  <>
                    <div>{list.signedByLabel}</div>
                    <div>{list.signedByValue}</div>
                    <div>{list.signedOnLabel}</div>
                    <div>{list.signedOnValue}</div>
                  </>
                );
              })
            ) : (
              <>
                <div>
                  {certificateRequestDetails[key] ? displayObjects[key] : null}
                </div>
                <div>{certificateRequestDetails[key]}</div>
              </>
            );
          })}
        </div>

        <div className="certificate-profile-sub-divider" />

        <Button
          size={"medium"}
          id="back-button"
          className="back-button-details"
          onClick={this.handlePrintClick.bind(this, "back-button")}
          style={{ backgroundColor: "#ff8c59" }}
        >
          <StepBackwardOutlined />
          Back
        </Button>
        {reprint ? (
          <Button
            size={"medium"}
            id="print-button"
            className="approve-button-signed"
            onClick={this.handlePrintClick.bind(this, "reprint-button")}
            style={{ backgroundColor: "#01cab8" }}
          >
            Reprint
          </Button>
        ) : (
          <Button
            size={"medium"}
            id="print-button"
            className="approve-button-signed"
            onClick={this.handlePrintClick.bind(this, "print-button")}
            style={{ backgroundColor: "#01cab8" }}
          >
            Print
          </Button>
        )}
        {/* <Button
            size={"medium"}
            id="print-button"
            className="back-button-details"
            onClick={this.handlePrintClick.bind(this, "download")}
            style={{ backgroundColor: "#01cab8", marginLeft:'0px' }}
          >
            Download
          </Button> */}
        <ProfileReject
          ref={this.child}
          handleClick={this.handleCertificateListingPage}
        />
      </div>
    );
  }
}

export default withRouter(
  inject("dataStore")(observer(ApprovedCertificateView))
);

import "./Profile.css";

import { Card, Spin, Button } from "antd";
import React, { Component } from "react";
import AuthService from "../../services/api";
import { withRouter } from "react-router-dom";
import { inject, observer } from "mobx-react";
import {
  certificateNameMapping,
  certificateStorageDetails,
} from "../../utils/general";
import { StepBackwardOutlined } from "@ant-design/icons";

let noOfSignees,
  certificateDetails,
  signeearray = [];
class RejectedCertificateView extends Component {
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
    // localStorage.removeItem("certificate-rejected-id");
    this.props.dataStore.certificates.certificateRequestDetails = {};
    signeearray = [];
  }

  fetchCertificateViewData = (id) => {
    if (document.getElementById("profile-spin") !== null)
      document.getElementById("profile-spin").style.display = "block";

    AuthService.requestMethod(`/rejectedCertificateView/${id}`)
      .then((response) => {
        if (document.getElementById("profile-spin") !== null)
          document.getElementById("profile-spin").style.display = "none";

        if (response && response.data) {
          this.props.dataStore.certificates.id = id;

          let details, refinedDetails, signeeDetails;
          //response data is stored in mobx variable
          //response is array of objects, so storing the values as an object
          details = response.data.certificate_data;
          //now details will have full list of details, refine it to necessary keys by
          //deleting the unwanted keys
          if (details.credential_status) delete details.credential_status;
          if (details.id) delete details.id;
          if (details.status !== null || details.status !== undefined)
            delete details.status;
          if (details.fileName) delete details.fileName;

          if (details.certificate_type) {
            refinedDetails = Object.assign({
              certificate_type: certificateNameMapping(
                details.certificate_type
              ),
            });
          }

          //to take signee details
          if (details.signed_by.length > 0) {
            noOfSignees = details.signed_by.length;
            details.signed_by.map((signee, index) => {
              signeearray.push({
                signedByValue: signee.user.signed_by,
                signedOnValue: signee.created_date,
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
          this.props.dataStore.certificates.certificateRequestDetails = merged;
        }
      })
      .catch((error) => {
        if (document.getElementById("profile-spin") !== null)
          document.getElementById("profile-spin").style.display = "none";
        console.log(error);
      });
  };

  handleCertificateListingPage = () => {
    window.history.back();
  };

  render() {
    //the data that needs to be displayed is stored in an object as key value pair.
    //key -> same as the key from api
    //value -> the data that need to be displayed
    const displayObjects = {
      student_name: "Student Name",
      course_name: "Course",
      requested_date: "Requested On",
      credential_number: "Credential Number",
      certificate_type: "Certificate Type",
      requisitioner_name: "Requested By",
      approved_by: "Approved By",
      approved_on: "Approved By",
      rejected_on: "Rejected On",
      rejected_by: "Rejected By",
      rejection_comment: "Rejection Comment",
      cancellation_comment: "Cancellation Comment",
      cancelled_by: "Cancelled By",
      cancelled_on: "Cancelled On",
      issued_by: "Issued By",
      issued_on: "Issued On",
      printed_by: "Printed By",
      printed_on: "Printed On",
      reprint_rejected_by: "Reprint Rejected By",
      reprint_rejected_on: "Reprint Rejected On",
      reprint_requested_by: "Reprint Requested By",
      reprint_requested_on: "Reprint Requested On",
      campus_name: "Campus",
    };

    //this condition will check for all falsy values
    if (this.props.dataStore.certificates.certificateRequestDetails)
      var certificateRequestDetails = this.props.dataStore.certificates
        .certificateRequestDetails;

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
          Certificate Rejected/Cancelled Details{" "}
        </Card>
        <div className="certificate-profile-divider" />

        <div class="certificate-profile-wrapper">
          {Object.keys(certificateRequestDetails).map(function (key, index) {
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
                <div>{displayObjects[key]}</div>
                <div>{certificateRequestDetails[key]}</div>
              </>
            );
          })}
        </div>

        <div className="certificate-profile-sub-divider-reject" />

        <Button
          size={"medium"}
          id="back-button"
          className="back-button-details"
          onClick={this.handleCertificateListingPage}
          style={{ backgroundColor: "#ff8c59" }}
        >
          <StepBackwardOutlined />
          Back
        </Button>
      </div>
    );
  }
}

export default withRouter(
  inject("dataStore")(observer(RejectedCertificateView))
);

import "./Profile.css";

import { Card, Button, message, Spin } from "antd";
import React, { Component } from "react";
import AuthService from "../../services/api";
import { withRouter } from "react-router-dom";
import { inject, observer } from "mobx-react";
import {
  certificateNameMapping,
  certificateStorageDetails,
  getCertificateSignDetails,
} from "../../utils/general";
import ProfileCancel from "./ProfileCancel";
import ProfileReject from "./ProfileReject";
import { StepBackwardOutlined } from "@ant-design/icons";


let noOfSignees,
  certificateDetails,
  signeearray = [];
class SignedView extends Component {
  constructor() {
    super();
    this.child = React.createRef();
    this.issue = React.createRef();
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
    this.props.dataStore.certificates.certificateRequestDetails = {};
    signeearray = [];
  }

  fetchCertificateViewData = (id) => {
    const { storage, isFromLocalStorage } = this.props.dataStore.header;

    if (document.getElementById("profile-spin") !== null)
      document.getElementById("profile-spin").style.display = "block";

    AuthService.requestMethod(`/signedCertificateView/${id}`)
      .then((response) => {
        if (document.getElementById("profile-spin") !== null)
          document.getElementById("profile-spin").style.display = "none";

        if (response && response.data) {
          if (response.data.success === 0 && response.data.message) {
            message.error(response.data.message);
          } else {
            document.getElementById("preview-button").style.visibility =
              "visible";

            let certificateSignedId = getCertificateSignDetails(
              isFromLocalStorage
            );

            //The button should be visible only for QA Manager
            // if (
            //   storage.role &&
            //   storage.role.length > 0 &&
            //   storage.role.includes(3) &&
            //   Number(certificateSignedId) !== Number(id)
            // ) {
            //   document.getElementById("issue-button").style.visibility =
            //     "visible";
            //   document.getElementById("cancel-button").style.visibility =
            //     "visible";
            // } else {
            //   document.getElementById("issue-button").style.visibility =
            //     "hidden";
            //   document.getElementById("cancel-button").style.visibility =
            //     "hidden";
            // }

            //storing the id in a mobx variable, because for approve/reject/preview
            //need to pass the id in the api.
            this.props.dataStore.certificates.id = id;

            let details, refinedDetails, signeeDetails;
            //response data is stored in mobx variable
            //response is array of objects, so storing the values as an object
            details = response.data.certificate_data;
            //now details will have full list of details, refine it to necessary keys by
            //deleting the unwanted keys

            if (details.fileName) delete details.fileName;
            if (details.id !== undefined && details.id !== null)
              delete details.id;
            if (details.status) delete details.status;

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

            //merging the  objects into single and storing in mobx variable
            let merged = { ...details, ...refinedDetails, ...signeeDetails };

            //refined object is stored to the mobx variable
            this.props.dataStore.certificates.certificateRequestDetails = merged;
          }
        }
      })
      .catch((error) => {
        if (document.getElementById("profile-spin") !== null)
          document.getElementById("profile-spin").style.display = "none";
        console.log(error);
      });
  };

  handleButtonClick = (buttonIds) => {
    const { id } = this.props.dataStore.certificates;

    // if (buttonIds === "preview-button") {
    this.props.history.push({
      pathname: `/certificates/signed-list/${id}/preview`,
      from: "signed-list",
      id: id,
    });
    // }
    // } else if (buttonIds === "issue-button") {
    //   this.issue.current.setModalVisibility(
    //     true,
    //     false,
    //     id,
    //     "issue-certificate"
    //   );
    // } else {
    //   this.child.current.setModalVisibility(
    //     true,
    //     false,
    //     id,
    //     "/cancelCertificate"
    //   );
    // }
  };

  //after rejection , navigate back to listing page
  handleIssueNavigation = () => {
    this.props.history.push({
      pathname: `/certificates/signed-list`,
    });
  };

  //after rejection , navigate back to listing page
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
      approved_on: "Approved On",
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
          Certificate Signed Details{" "}
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

        <div
          className="certificate-profile-sub-divider"
          style={{ marginBottom: 20 }}
        />

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

        <Button
          size={"medium"}
          id="preview-button"
          className="preview-button"
          // className="approve-button-signed"
          onClick={this.handleButtonClick.bind(this, "preview-button")}
          style={{ backgroundColor: "#f9c41e" }}
        >
          Preview
        </Button>

        {/* <Button
          size={"medium"}
          id="issue-button"
          className="approve-button"
          onClick={this.handleButtonClick.bind(this, "issue-button")}
          style={{ backgroundColor: "#01cab8" }}
        >
          Issue Certificate
        </Button> */}

        {/* <Button
          size={"medium"}
          id="cancel-button"
          className="reject-button"
          onClick={this.handleButtonClick.bind(this, "cancel-button")}
          style={{ backgroundColor: "#ff8c59" }}
        >
          Cancel Certificate
        </Button> */}
        <ProfileReject
          ref={this.issue}
          handleClick={this.handleCertificateListingPage}
          handleIssueNavigation={this.handleIssueNavigation}
        />
        <ProfileCancel
          ref={this.child}
          handleCancelCertificateClick={this.handleCertificateListingPage}
        />
      </div>
    );
  }
}

export default withRouter(inject("dataStore")(observer(SignedView)));

import "./Profile.css";

import { Card, Button, message, Spin } from "antd";
import React, { Component } from "react";
import AuthService from "../../services/api";
import { withRouter } from "react-router-dom";
import { inject, observer } from "mobx-react";
import ProfileReject from "./ProfileReject";
import {
  certificateNameMapping,
  certificateStorageDetails,
  getCertificateSignDetails,
  dataFormatToDisplay,
} from "../../utils/general";
import { StepBackwardOutlined } from "@ant-design/icons";
import { PROFILE_URL } from "../../config";

let certificateDetails;
class Profile extends Component {
  constructor() {
    super();
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
    // localStorage.removeItem("certificate-requested-id");
    this.props.dataStore.certificates.certificateRequestDetails = {};
  }

  fetchCertificateViewData = (id) => {
    const { isFromLocalStorage } = this.props.dataStore.header;
    if (document.getElementById("profile-spin") !== null)
      document.getElementById("profile-spin").style.display = "block";

    AuthService.requestMethod(`/requestedCertificateView/${id}`)
      .then((response) => {
        const { dateFormat } = this.props.dataStore.settings;
        if (document.getElementById("profile-spin") !== null)
          document.getElementById("profile-spin").style.display = "none";
        if (response && response.data) {
          console.log(response.data);
          if (response.data.success === 0 && response.data.message) {
            message.error(response.data.message);
          } else {
            //intially approve and reject buttons are hidden, it will be visible only
            //if the api returns the result
            document.getElementById("preview-button").style.visibility =
              "visible";
            // let certificateSignedId = getCertificateSignDetails(isFromLocalStorage)

            // if (Number(certificateSignedId) !== Number(id)) {
            //   document.getElementById("reject-button").style.visibility =
            //     "visible";
            //   document.getElementById("approve-button").style.visibility =
            //     "visible";
            // } else {
            //   document.getElementById("reject-button").style.visibility =
            //     "hidden";
            //   document.getElementById("approve-button").style.visibility =
            //     "hidden";
            // }

            // document.getElementById("back-button").style.visibility = "visible";
            //storing the id in a mobx variable, because for approve/reject/preview
            //need to pass the id in the api.
            this.props.dataStore.certificates.id = id;

            let details;
            let refinedDetails;
            //response data is stored in mobx variable
            //response is array of objects, so storing the values as an object
            details = Object.assign({}, ...response.data);
            //now details will have full list of details, refine it to necessary keys by
            //deleting the unwanted keys
            if (details.id) delete details.id;
            if (details.status !== null || details.status !== undefined)
              delete details.status;
            if (details.fileName) delete details.fileName;
            if (details.skip_sign !== null || details.skip_sign !== undefined)
              delete details.skip_sign;

            refinedDetails = Object.assign({
              certificate_type: certificateNameMapping(
                details.certificate_type
              ),
              requested_date: dataFormatToDisplay(
                details.requested_date,
                dateFormat
              ),
            });

            //merging the two objects into single and storing in mobx variable
            let merged = { ...details, ...refinedDetails };

            console.log(JSON.stringify(merged));

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

  //after rejection , navigate back to listing page
  handleListingPage = () => {
    window.history.back();
  };

  // handleButtonClick = (buttonIds) => {
  //   if (document.getElementById("profile-spin") !== null)
  //     document.getElementById("profile-spin").style.display = "block";
  //   const { id } = this.props.dataStore.certificates;

  //   if (buttonIds === "approve-button") {
  //     if (document.getElementById("profile-spin") !== null)
  //       document.getElementById("profile-spin").style.display = "none";
  //     this.child.current.setModalVisibility(
  //       true,
  //       false,
  //       this.props.dataStore.certificates.id,
  //       "requested-list-approve"
  //     );
  //   } else {
  //     if (document.getElementById("profile-spin") !== null)
  //       document.getElementById("profile-spin").style.display = "none";
  //     this.child.current.setModalVisibility(
  //       true,
  //       false,
  //       this.props.dataStore.certificates.id,
  //       "requested-list-reject"
  //     );
  //   }
  // };

  onPreviewCertificateRequestClick = () => {
    const { id } = this.props.dataStore.certificates;
    this.props.history.push({
      pathname: `/certificates/requested-list/${id}/preview`,
      from: "requested-list",
      id: id,
    });
  };

  handleBackButtonClick = () => {
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
      fileName: "Certificate Name",
      campus_name: "Campus",
      enrolment_id: "Assessment Report",
    };

    //this condition will check for all falsy values
    if (this.props.dataStore.certificates.certificateRequestDetails)
      var certificateRequestDetails =
        this.props.dataStore.certificates.certificateRequestDetails;
        

    //JSX - looping the mobx variable(object of key-value pair)
    const assessmentReportsPath = `${PROFILE_URL}academic/students/assessment_reports_redirect/`;
    return (
      <div className="certificate-profile-container">
        <div
          id="profile-spin"
          style={{ display: "none", position: "relative" }}
        >
          <Spin className="spin-user" size="large" />
        </div>
        <Card className="certificate-profile-header">
          Certificate Request Details{" "}
        </Card>
        <div className="certificate-profile-divider" />

        <div class="certificate-profile-wrapper">
          {Object.keys(certificateRequestDetails).map(function (key, index) {
            return (
              <>
          <div>{displayObjects[key]}</div>
          {key === "enrolment_id" ? (
              <div>
                <a target="_blank" href={`${assessmentReportsPath}${certificateRequestDetails[key]}`} > Click Here</a>
              </div>
            ) : (
              <div>{certificateRequestDetails[key]}</div>
            )}
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
          onClick={this.handleBackButtonClick}
          style={{ backgroundColor: "#ff8c59" }}
        >
          <StepBackwardOutlined />
          Back
        </Button>

        <Button
          size={"medium"}
          id="preview-button"
          className="preview-button"
          onClick={this.onPreviewCertificateRequestClick}
          style={{ backgroundColor: "#f9c41e" }}
        >
          Preview
        </Button>

        {/* <Button
          size={"medium"}
          id="approve-button"
          className="approve-button"
          onClick={this.handleButtonClick.bind(this, "approve-button")}
          style={{ backgroundColor: "#01cab8" }}
        >
          Approve
        </Button> */}

        {/* <Button
          size={"medium"}
          id="reject-button"
          className="reject-button"
          onClick={this.handleButtonClick.bind(this, "reject-button")}
          style={{ backgroundColor: "#ff8c59" }}
        >
          Reject
        </Button> */}

        <ProfileReject ref={this.child} handleClick={this.handleListingPage} />
      </div>
    );
  }
}

export default withRouter(inject("dataStore")(observer(Profile)));

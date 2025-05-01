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
import ProfileReject from "./ProfileReject";
import { StepBackwardOutlined } from "@ant-design/icons";

let certificateDetails;
class Approvedview extends Component {
  constructor() {
    super();
    this.child = React.createRef();
    this.state = {
      imageAlredayUploaded: false,
    };
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
    this.fetchCertificatesSignedData();
  }

  fetchCertificatesSignedData = () => {
    AuthService.requestMethod("/signatureDetails")
      .then((response) => {
        if (response && response.data) {
          if (response.data.success === 1) {
            this.setState({
              imageAlredayUploaded: true,
            });
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  UNSAFE_componentWillReceiveProps() {
    const { isFromLocalStorage } = this.props.dataStore.header;
    certificateDetails = certificateStorageDetails(isFromLocalStorage);

    let id = "";

    if (certificateDetails && certificateDetails.certificate_id) {
      id = certificateDetails.certificate_id;
    }

    //api call, with id as path param
    this.fetchCertificateViewData(id);
  }

  componentWillUnmount() {
    // the selected id is stored in local storage, will navigated back to the main dashboard listing page
    //the local storage need to be cleared.
    this.props.dataStore.certificates.certificateApprovedDetails = {};
  }

  fetchCertificateViewData = (id) => {
    const { storage, isFromLocalStorage } = this.props.dataStore.header;

    if (document.getElementById("profile-spin") !== null)
      document.getElementById("profile-spin").style.display = "block";
    AuthService.requestMethod(`/approvedCertificateView/${id}`)
      .then((response) => {
        if (document.getElementById("profile-spin") !== null)
          document.getElementById("profile-spin").style.display = "none";
        if (response && response.data) {
          if (response.data.success === 0 && response.data.message) {
            message.error(response.data.message);
          } else {
            let data = response.data;

            //intially approve and reject buttons are hidden, it will be visible only
            //if the api returns the result
            if (document.getElementById("preview-button") !== null)
              document.getElementById("preview-button").style.visibility =
                "visible";

            // let signeeDetails = [];
            // if (data.signee_details) {
            //   if (data.signee_details.signee1_user_id)
            //     signeeDetails.push(data.signee_details.signee1_user_id);
            //   if (data.signee_details.signee2_user_id)
            //     signeeDetails.push(data.signee_details.signee2_user_id);
            //   if (data.signee_details.signee3_user_id)
            //     signeeDetails.push(data.signee_details.signee3_user_id);

            //   let certificateSignedId = getCertificateSignDetails(isFromLocalStorage)

            //   if (storage && storage.userid && signeeDetails.length > 0) {
            //     signeeDetails.includes(storage.userid) &&
            //     Number(certificateSignedId) !== Number(id)
            //       ? (document.getElementById("sign-button").style.visibility =
            //           "visible")
            //       : (document.getElementById("sign-button").style.visibility =
            //           "none");
            //   }
            // }

            //storing the id in a mobx variable, because for approve/reject/preview
            //need to pass the id in the api.
            this.props.dataStore.certificates.id = id;
            let details;
            let refinedDetails;

            //response data is stored in mobx variable
            //response is array of objects, so storing the values as an object
            details = data.certificate_data;
            //now details will have full list of details, refine it to necessary keys by
            //deleting the unwanted keys
            if (details.id) delete details.id;
            if (details.status !== null || details.status !== undefined)
              delete details.status;
            if (details.fileName) delete details.fileName;

            refinedDetails = Object.assign({
              certificate_type: certificateNameMapping(
                details.certificate_type
              ),
            });

            //merging the two objects into single and storing in mobx variable
            let merged = { ...details, ...refinedDetails };

            //refined object is stored to the mobx variable
            this.props.dataStore.certificates.certificateApprovedDetails = merged;
          }
        }
      })
      .catch((error) => {
        if (document.getElementById("profile-spin") !== null)
          document.getElementById("profile-spin").style.display = "none";
        console.log(error);
      });
  };

  // handleSignClick = () => {
  //   const { id } = this.props.dataStore.certificates;
  //   const { imageAlredayUploaded } = this.state;
  //   this.child.current.setModalVisibility(
  //     true,
  //     false,
  //     id,
  //     "to-be-signed-list",
  //     imageAlredayUploaded
  //   );
  // };

  handleSignNavigation = () => {
    const { imageAlredayUploaded } = this.state;
    const { id } = this.props.dataStore.certificates;
    if (imageAlredayUploaded) {
      this.props.history.push({
        pathname: `/certificates/to-be-signed-list/${id}/sign`,
        id: id,
        from: "to-be-signed-list",
      });
    } else {
      this.props.history.push({
        pathname: `/settings/upload-signature`,
      });
    }
  };

  onPreviewClick = () => {
    const { id } = this.props.dataStore.certificates;
    this.props.history.push({
      pathname: `/certificates/to-be-signed-list/${id}/preview`,
      from: "to-be-signed-list",
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
      approved_by: "Approved By",
      created_date: "Approved On",
      campus_name: "Campus",
      comments: "Approval Comment"
    };

    //this condition will check for all falsy values
    if (this.props.dataStore.certificates.certificateApprovedDetails)
      var certificateApprovedDetails = this.props.dataStore.certificates
        .certificateApprovedDetails;

    const { id } = this.props.dataStore.certificates;

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
          Certificate To Be Signed Details{" "}
        </Card>
        <div className="certificate-profile-divider" />

        <div className="certificate-profile-wrapper">
          {certificateApprovedDetails
            ? Object.keys(certificateApprovedDetails).map(function (key) {
                return (
                  <>
                    <div>{displayObjects[key]}</div>
                    <div>{certificateApprovedDetails[key]}</div>
                  </>
                );
              })
            : null}
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
          onClick={this.onPreviewClick}
          style={{ backgroundColor: "#f9c41e" }}
        >
          Preview
        </Button>

        {/* <Button
          size={"medium"}
          id="sign-button"
          className="sign-button"
          onClick={this.handleSignClick}
          style={{ backgroundColor: "#01cab8" }}
        >
          Sign
        </Button> */}
        <ProfileReject
          ref={this.child}
          handleSignNavigation={this.handleSignNavigation}
        />
      </div>
    );
  }
}

export default withRouter(inject("dataStore")(observer(Approvedview)));

import "./Profile.css";
import React, { Component } from "react";
import { API_URL } from "../../config";
import { Input, Button, Spin, message } from "antd";
import AuthService from "../../services/api";
import { inject, observer } from "mobx-react";
import ProfileReject from "./ProfileReject";
import { Redirect, withRouter } from "react-router-dom";
import ProfileCancel from "./ProfileCancel";
import {
  certificateStorageDetails,
  setCertificateSignDetails,
  getCertificateSignDetails,
} from "../../utils/general";
import { StepBackwardOutlined } from "@ant-design/icons";

let certificateDetails;
class SignCertificates extends Component {
  constructor() {
    super();
    this.state = {
      id: null,
      password: "",
      from: null,
      isSigned: false,
      imageAlredayUploaded: false,
      isSubmitClicked: false,
      isSkipSign: null,
      fileName: null,
    };
    this.child = React.createRef();
    this.cancel = React.createRef();
  }

  componentDidMount() {
    this.fetchCertificatesSignedData();

    const { isFromLocalStorage } = this.props.dataStore.header;
    certificateDetails = certificateStorageDetails(isFromLocalStorage);

    if (this.props.location) {
      // id -> set it to state variable
      if (this.props.location.id) {
        this.setState({
          id: this.props.location.id,
        });
      } else if (certificateDetails && certificateDetails.certificate_id) {
        this.setState({
          id: certificateDetails.certificate_id,
        });
      }

      //from
      if (this.props.location.from) {
        this.setState({
          from: this.props.location.from,
        });
      } else if (certificateDetails && certificateDetails.certificate_list) {
        this.setState({
          from: certificateDetails.certificate_list,
        });
      }

      //from
      if (this.props.location.fileName) {
        this.setState({
          fileName: this.props.location.fileName,
        });
      } else if (certificateDetails && certificateDetails.fileName) {
        this.setState({
          fileName: certificateDetails.fileName,
        });
      }

      this.setState({
        isSkipSign: certificateDetails.skip_sign,
      });
    }
  }

  componentWillUnmount() {
    // fix Warning: Can't perform a React state update on an unmounted component
    this.setState = (state, callback) => {
      return;
    };
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

  fetchCertificateData = (id) => {
    const { from } = this.state;
    const { storage, isFromLocalStorage } = this.props.dataStore.header;
    if (from !== "to-be-signed-list") return;
    AuthService.requestMethod(`/approvedCertificateView/${id}`)
      .then((response) => {
        if (document.getElementById("profile-spin") !== null)
          document.getElementById("profile-spin").style.display = "none";
        if (response && response.data) {
          if (response.data.success === 0 && response.data.message) {
            message.error(response.data.message);
          } else {
            let data = response.data;
            let signeeDetails = [];

            //mapping and storing signees and designation in an array
            for (const [key, value] of Object.entries(data.signee_details)) {
              if (key.includes("_user_id") && value) {
                signeeDetails.push(value);
              }
            }

            let certificateSignedId =
              getCertificateSignDetails(isFromLocalStorage);

            if (
              storage &&
              storage.userid &&
              signeeDetails.length > 0 &&
              signeeDetails.includes(storage.userid) &&
              Number(certificateSignedId) !== Number(id)
            ) {
              if (document.getElementById("sign-button-certificate") !== null)
                document.getElementById(
                  "sign-button-certificate"
                ).style.display = "block";
            }
          }
        }
      })
      .catch((error) => {
        if (document.getElementById("profile-spin") !== null)
          document.getElementById("profile-spin").style.display = "none";
        console.log(error);
      });
  };

  handleVerification = () => {
    const { password, id, isSubmitClicked } = this.state;
    const { storage, isFromLocalStorage } = this.props.dataStore.header;

    if (isSubmitClicked) return;
    this.setState({
      isSubmitClicked: true,
    });

    if (document.getElementById("profile-spin") !== null)
      document.getElementById("profile-spin").style.display = "block";

    let body = {};
    body.password = password;
    //verify password , if yes then call sign api
    AuthService.requestWithPost("/passwordToCheck", body)
      .then((response) => {
        message.destroy();
        this.setState({
          isSubmitClicked: false,
        });
        if (response && response.data) {
          if (response.data.success === 1 && response.data.message) {
            if (document.getElementById("profile-spin") !== null)
              document.getElementById("profile-spin").style.display = "none";

            if (storage && storage.userid) {
              // after signing call the notifications api
              this.props.dataStore.certificates.fetchNotifications = true;

              //handling with 2 iframes , else when clicking back button , it will cause issues
              //making the new iframe visible

              if (
                document.getElementById("iframe-container-after-sign") !== null
              ) {
                document.getElementById(
                  "iframe-container-after-sign"
                ).visibility = "block";
              }

              // removing the current iframe container and make is signed -> trueS
              if (
                document.getElementById("iframe-container") !== null &&
                storage &&
                storage.password
              ) {
                var frame = document.getElementById("iframe-container");
                if (frame) frame.parentNode.removeChild(frame);
                this.setState({
                  isSigned: true,
                });
              }

              //storing the certificate id in local storage, because after signing then back button is pressed
              //then dont show sign button
              setCertificateSignDetails(isFromLocalStorage, id);
            }
          } else {
            if (document.getElementById("profile-spin") !== null)
              document.getElementById("profile-spin").style.display = "none";
            message.error(response.data.message);
          }
        }
      })
      .catch((error) => {
        this.setState({
          isSubmitClicked: false,
        });
        console.log(error);
        if (document.getElementById("profile-spin") !== null)
          document.getElementById("profile-spin").style.display = "none";
      });
  };

  //on change method
  passwordChange = (event) => {
    this.setState({
      password: event.target.value,
    });
  };

  findUrl = (list) => {
    const { id, fileName } = this.state;
    switch (list) {
      case "requested-list":
        return `${API_URL}/generate-pdf/${id}/preview#toolbar=0&navpanes=0`;
      case "to-be-signed-list":
        this.fetchCertificateData(id);
        return `${API_URL}/generate-pdf/${id}/preview#toolbar=0&navpanes=0`;
      case "signed-list":
        return `${API_URL}/generate-pdf/${id}/preview#toolbar=0&navpanes=0`;
      case "reports":
        return `${fileName}`;
    }
  };

  iframeTitle = (list) => {
    switch (list) {
      case "requested-list":
        return "Certificate Requested List";
      case "to-be-signed-list":
        return "To Be Signed List";
      case "signed-list":
        return "Signed List";
      case "reports":
        return "Reports";
    }
  };

  handleBackButtonClick = () => {
    var url = window.location.href;
    var lastPart = url.substr(url.lastIndexOf("/") + 1);
    if (lastPart === "sign" && this.state.isSigned) {
      this.props.history.push({
        pathname: "/certificates/to-be-signed-list",
      });
      // window.location.replace("/certificates/to-be-signed-list");
    } else {
      window.history.back();
    }
  };

  handleButtonClick = (buttonIds) => {
    const { id } = this.state;
    if (document.getElementById("profile-spin") !== null)
      document.getElementById("profile-spin").style.display = "block";

    if (buttonIds === "approve-button") {
      if (document.getElementById("profile-spin") !== null)
        document.getElementById("profile-spin").style.display = "none";
      this.child.current.setModalVisibility(
        true,
        false,
        id,
        "requested-list-approve"
      );
    } else if (buttonIds === "reject-button") {
      if (document.getElementById("profile-spin") !== null)
        document.getElementById("profile-spin").style.display = "none";
      this.child.current.setModalVisibility(
        true,
        false,
        id,
        "requested-list-reject"
      );
    } else if (buttonIds === "cancel-button") {
      if (document.getElementById("profile-spin") !== null)
        document.getElementById("profile-spin").style.display = "none";
      this.cancel.current.setModalVisibility(
        true,
        false,
        id,
        "/cancelCertificate"
      );
    } else if (buttonIds === "issue-button") {
      if (document.getElementById("profile-spin") !== null)
        document.getElementById("profile-spin").style.display = "none";
      this.child.current.setModalVisibility(
        true,
        false,
        id,
        "issue-certificate"
      );
    }
  };

  //after rejection , navigate back to listing page
  handleIssueNavigation = () => {
    this.props.dataStore.certificates.fetchNotifications = true;
    this.props.history.push({
      pathname: `/certificates/signed-list`,
    });
  };

  handleListingPage = () => {
    window.history.back();
  };

  handleSignClick = () => {
    const { imageAlredayUploaded } = this.state;
    const { storage } = this.props.dataStore.header;

    //if password security is false , set isSigned as true.
    //so when back button is clicked , redirect to main page
    if (storage && storage.password === false) {
      this.setState({
        isSigned: true,
      });
    }

    this.child.current.setModalVisibility(
      true,
      false,
      this.props.dataStore.certificates.id,
      "to-be-signed-list",
      imageAlredayUploaded
    );
  };

  handleSignNavigation = () => {
    const { id, imageAlredayUploaded } = this.state;
    if (imageAlredayUploaded) {
      this.props.history.push({
        pathname: `/certificates/to-be-signed-list/${id}/sign`,
      });
    } else {
      this.props.history.push({
        pathname: `/settings/upload-signature`,
      });
    }
  };

  render() {
    const { from, password, isSigned, id, isSkipSign } = this.state;
    const { storage, isFromLocalStorage } = this.props.dataStore.header;
    // console.log("isSigned", isSigned);

    // let windowLocation = window.location.pathname.split("/").pop();
    var url = window.location.href;
    var lastPart = url.substr(url.lastIndexOf("/") + 1);

    let certificateSignedId = getCertificateSignDetails(isFromLocalStorage);

    // if (!storage) return <Redirect exact to="/user/login" />;
    return (
      <div className="sign-certificate-container">
        <div
          id="profile-spin"
          style={{ display: "none", position: "relative" }}
        >
          <Spin className="spin-user" size="large" />
        </div>

        <div className="sign-certificate-buttons">
          <Button
            size={"medium"}
            id="back-button"
            className="back-button-preview"
            onClick={this.handleBackButtonClick}
            style={{ backgroundColor: "#ff8c59", color: "#fff" }}
          >
            <StepBackwardOutlined />
            Back
          </Button>

          {from === "requested-list" &&
          Number(certificateSignedId) !== Number(id) ? (
            <>
              <Button
                size={"medium"}
                id="approve-button"
                className="approve-button-preview"
                onClick={this.handleButtonClick.bind(this, "approve-button")}
              >
                {isSkipSign ? "Approve and Sign" : "Approve"}
              </Button>

              <Button
                size={"medium"}
                id="reject-button"
                className="reject-button-preview"
                onClick={this.handleButtonClick.bind(this, "reject-button")}
              >
                Reject
              </Button>
            </>
          ) : null}

          {from === "to-be-signed-list" &&
          lastPart !== "sign" &&
          isSigned === false ? (
            <Button
              size={"medium"}
              id="sign-button-certificate"
              className="approve-button-preview"
              onClick={this.handleSignClick}
              style={{ backgroundColor: "#01cab8", display: "none" }}
            >
              Sign
            </Button>
          ) : null}

          {from === "signed-list" ? (
            <>
              <Button
                size={"medium"}
                id="issue-button"
                className="approve-button-preview"
                onClick={this.handleButtonClick.bind(this, "issue-button")}
                style={{ backgroundColor: "#01cab8" }}
              >
                Issue Certificate
              </Button>

              <Button
                size={"medium"}
                id="cancel-button"
                className="reject-button-preview"
                onClick={this.handleButtonClick.bind(this, "cancel-button")}
                style={{ backgroundColor: "#cc3333" }}
              >
                Cancel Certificate
              </Button>
            </>
          ) : null}
        </div>

        {(storage && storage.password) || lastPart === "preview" ? (
          <iframe
            id="iframe-container"
            src={this.findUrl(from)}
            title={this.iframeTitle(from)}
            className={
              from === "to-be-signed-list" && lastPart !== "preview"
                ? "iframe-container-sign"
                : "iframe-container"
            }
          />
        ) : null}

        {(isSigned || (storage && storage.password === false)) &&
        lastPart !== "preview" ? (
          <>
            <iframe
              id="iframe-container-after-sign"
              src={`${API_URL}/certificate/${id}/signed/${storage.userid}#toolbar=0&navpanes=0`}
              title="Signed Certificate"
              className="iframe-container"
            />
            {setCertificateSignDetails(isFromLocalStorage, id)}
            {(this.props.dataStore.certificates.fetchNotifications = true)}
          </>
        ) : null}

        {from === "to-be-signed-list" &&
        lastPart !== "preview" &&
        !isSigned &&
        storage &&
        storage.password ? (
          <>
            <div
              id="sign-certificate-iframe"
              className="sign-certificate-iframe"
            >
              <label className="sign-certificate-iframe-label ">
                Enter Password
              </label>
              <Input type="password" onChange={this.passwordChange} />
              {password ? (
                <Button
                  size={"medium"}
                  id="sign-button"
                  className="sign-button-iframe"
                  onClick={this.handleVerification}
                  style={{ backgroundColor: "#01cab8" }}
                >
                  Sign
                </Button>
              ) : null}
            </div>
          </>
        ) : null}
        <ProfileReject
          ref={this.child}
          handleClick={this.handleListingPage}
          handleSignNavigation={this.handleSignNavigation}
          handleIssueNavigation={this.handleIssueNavigation}
        />
        <ProfileCancel
          ref={this.cancel}
          handleCancelCertificateClick={this.handleListingPage}
        />
      </div>
    );
  }
}

export default withRouter(inject("dataStore")(observer(SignCertificates)));

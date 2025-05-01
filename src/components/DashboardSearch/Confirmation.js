import React, { Component } from "react";
import { Modal, Input, message, Spin } from "antd";
import AuthService from "../../services/api";
import { inject, observer } from "mobx-react";

class Confirmation extends Component {
  constructor(props) {
    super(props);
    //state initialization
    this.state = {
      isVisible: false,
      password: "",
      certificateList: "",
      isSubmitBlocked: false,
    };
  }

  //set modal visibility
  //intially while opening the modal, id is passed as third param ans storing that id as state variable.
  setModalVisibility(modalVisiblity, isFromOkClick, from) {
    const { storage } = this.props.dataStore.header;
    const { password, certificateList } = this.state;
    //ok click , call api
    if (isFromOkClick) {
      const { isSubmitBlocked } = this.state;

      if (isSubmitBlocked) return;
      this.setState({
        isSubmitBlocked: true,
      });

      if (certificateList === "print") {
        this.bulkPrintHandler();
      } else {
        if (storage && storage.password) {
          message.destroy();
          if (password) this.passwordCheckApiHandler();
          else message.error("Please Enter Password");
        } else {
          this.bulkSignApiHandler();
        }
      }
    } else {
      this.setState({
        isVisible: modalVisiblity,
        password: "",
        certificateList: from,
      });
    }
  }

  //on change method
  passwordChange = (event) => {
    this.setState({
      password: event.target.value,
    });
  };

  passwordCheckApiHandler = () => {
    const { password } = this.state;
    const { storage } = this.props.dataStore.header;

    let body = {};
    body.password = password;
    //verify password , if yes then call sign api
    AuthService.requestWithPost("/passwordToCheck", body)
      .then((response) => {
        message.destroy();

        if (response && response.data) {
          if (response.data.success === 1 && response.data.message) {
            message.success(response.data.message);
            this.bulkSignApiHandler();
            if (storage && storage.userid) {
              // after signing call the notifications api
              this.props.dataStore.certificates.fetchNotifications = true;
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

  bulkSignApiHandler = () => {
    //body is passed as form data
    const formData = new FormData();
    this.props.dataStore.certificates.selectedCheckBoxRows.map(
      (certificateIds, index) => {
        formData.append(`certificate[${index}]`, certificateIds);
      }
    );
    AuthService.requestWithPost("/bulkSignCertificate", formData)
      .then((response) => {
        message.destroy();
        if (response && response.data) {
          if (response.data.success === 1) {
            message.success(response.data.message);
            this.setState({
              isVisible: false,
            });
            //make the autorun variable true to call the api
            this.props.dataStore.certificates.certificateFetchData = true;
          } else {
            message.error(response.data.message);
          }
          this.setState({
            isSubmitBlocked: false,
          });
        }
      })
      .catch((error) => {
        this.setState({
          isSubmitBlocked: false,
        });
        console.log(error);
      });
  };

  bulkPrintHandler = () => {
    if (document.getElementById("cancel-popup-spin") !== null)
      document.getElementById("cancel-popup-spin").style.display = "block";
    //body is passed as form data
    const formData = new FormData();
    this.props.dataStore.certificates.selectedCheckBoxRows.map(
      (certificateIds, index) => {
        formData.append(`certificate[${index}]`, certificateIds);
      }
    );

    AuthService.requestForDownload("/bulkPrintCertificate", formData)
      .then((response) => {
        this.setState({
          isVisible: false,
        });
        if (document.getElementById("cancel-popup-spin") !== null)
          document.getElementById("cancel-popup-spin").style.display = "none";
        if (response && response.data) {
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", "file.pdf");
          document.body.appendChild(link);
          link.click();
          //make the autorun variable true to call the api
          this.props.dataStore.certificates.certificateFetchData = true;
          this.setState({
            isSubmitBlocked: false,
          });
        }
      })
      .catch((error) => {
        if (document.getElementById("cancel-popup-spin") !== null)
          document.getElementById("cancel-popup-spin").style.display = "none";
        this.setState({
          isSubmitBlocked: false,
        });
        console.log(error);
      });
  };

  render() {
    const { isVisible, password, certificateList } = this.state;
    const { storage } = this.props.dataStore.header;
    return (
      <Modal
        className="assign-roles-modal"
        title={
          certificateList === "print"
            ? "Certificate Approve"
            : "Certificate Sign"
        }
        centered
        visible={isVisible}
        onOk={() => this.setModalVisibility(false, true)}
        onCancel={() => this.setModalVisibility(false)}
      >
        <div
          id="cancel-popup-spin"
          style={{ display: "none", position: "relative" }}
        >
          <Spin className="spin-user" size="large" />
        </div>

        {certificateList === "print" ? (
          "Do you want to print the certificates?"
        ) : storage && storage.password ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "130px 275px",
              justifyContent: "center",
            }}
          >
            <label style={{ alignSelf: "center" }}>Enter Password</label>
            <Input
              type="password"
              value={password}
              onChange={this.passwordChange}
            />
          </div>
        ) : (
          "Do you want to sign the certificates?"
        )}
      </Modal>
    );
  }
}

export default inject("dataStore")(observer(Confirmation));

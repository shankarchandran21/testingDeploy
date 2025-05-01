import "./Profile.css";

import React, { Component } from "react";
import { Modal, Input, message, Spin } from "antd";
import AuthService from "../../services/api";
import { setCertificateSignDetails } from "../../utils/general";
import { inject, observer } from "mobx-react";

const { TextArea } = Input;
class ProfileCancel extends Component {
  constructor(props) {
    super(props);
    //state initialization
    this.state = {
      isVisible: false,
      comment: "",
      userId: null,
      apiEndPoint: "",
      isButtonClicked: false,
    };
  }

  //set modal visibility
  //intially while opening the modal, id is passed as third param ans storing that id as state variable.
  setModalVisibility(modalVisiblity, isFromOkClick, userId, apiEndPont) {
    const { isButtonClicked } = this.state;
    const { isFromLocalStorage } = this.props.dataStore.header;
    const { handleCancelCertificateClick } = this.props;
    //ok click , call api
    if (isFromOkClick) {
      if (isButtonClicked) return;
      this.setState({
        isButtonClicked: true,
      });

      message.destroy();
      let body = {};
      if (!this.state.comment) {
        message.error("Please add comment");
        this.setState({
          isButtonClicked: false,
        });
        return;
      }
      body.student_certificate_id = this.state.userId;
      body.cancellation_comment = this.state.comment;

      AuthService.requestWithPost(this.state.apiEndPoint, body)
        .then((response) => {
          if (response && response.data) {
            // if (document.getElementById("profile-spin") !== null)
            //   document.getElementById("profile-spin").style.display = "none";
            //display the success message and go back to the certificate request listing page.
            if (response.data.success === 1 && response.data.message) {
              message.success(response.data.message);
              this.setState({
                isVisible: modalVisiblity,
                comment: "",
              });
              setCertificateSignDetails(isFromLocalStorage, this.state.userId);
              handleCancelCertificateClick();
              //after succeess call the method in parent class
            } else {
              message.error(response.data.message);
            }
            this.setState({
              isButtonClicked: false,
            });
          }
        })
        .catch((error) => {
          // if (document.getElementById("profile-spin") !== null)
          //   document.getElementById("profile-spin").style.display = "none";
          console.log(error);
          this.setState({
            isButtonClicked: false,
          });
        });
    } else {
      this.setState({
        isVisible: modalVisiblity,
        comment: "",
        userId: userId,
        apiEndPoint: apiEndPont,
      });
    }
  }

  handleInputChange = (event) => {
    this.setState({
      comment: event.target.value,
    });
  };

  render() {
    const { isVisible, apiEndPoint } = this.state;
    return (
      <Modal
        className="assign-roles-modal"
        title={
          apiEndPoint === "/cancelCertificate"
            ? "Certificate Cancellation"
            : "Certificate Rejection"
        }
        centered
        visible={isVisible}
        onOk={() => this.setModalVisibility(false, true)}
        onCancel={() => this.setModalVisibility(false)}
      >
        <div>Reason</div>
        <TextArea rows={4} onChange={this.handleInputChange} />
      </Modal>
    );
  }
}

export default inject("dataStore")(observer(ProfileCancel));

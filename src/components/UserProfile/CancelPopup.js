import "./UserProfile.css";

import React, { Component } from "react";
import { Modal, Input, message, Spin } from "antd";
import AuthService from "../../services/api";
import { inject, observer } from "mobx-react";

class CancelPopUp extends Component {
  constructor(props) {
    super(props);
    //state initialization
    this.state = {
      isVisible: false,
      userId: null,
      isButtonClicked: false,
    };
  }

  //set modal visibility
  //intially while opening the modal, id is passed as third param ans storing that id as state variable.
  setModalVisibility(modalVisiblity, isFromOkClick, recordId) {
    const { isButtonClicked, userId } = this.state;

    //ok click , call api
    if (isFromOkClick) {
      if (isButtonClicked) return;
      this.setState({
        isButtonClicked: true,
      });

      if (document.getElementById("cancel-popup-spin") !== null)
        document.getElementById("cancel-popup-spin").style.display = "block";

      AuthService.requestWithDelete(`/user/${userId}/delete`)
        .then((response) => {
          if (document.getElementById("cancel-popup-spin") !== null)
            document.getElementById("cancel-popup-spin").style.display = "none";
          message.destroy();
          this.setState({
            isButtonClicked: false,
          });
          if (response && response.data && response.data.user_details) {
            this.setState({
              isVisible: modalVisiblity,
            });
            if (response.data.success === 1)
              message.success(response.data.user_details);
            else message.error(response.data.user_details);
            //call the lsiting api on success of delete api : so that list is refreshed.
            this.props.dataStore.settings.fetchUserManagementData = true;
          }
        })
        .catch((error) => {
          if (document.getElementById("cancel-popup-spin") !== null)
            document.getElementById("cancel-popup-spin").style.display = "none";
          this.setState({
            isButtonClicked: false,
          });
          console.log(error);
        });
    } else {
      this.setState({
        isVisible: modalVisiblity,
        userId: recordId,
      });
    }
  }

  render() {
    const { isVisible } = this.state;
    return (
      <Modal
        className="assign-roles-modal"
        title="Confirm Deletion"
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
        <div>Do you want to delete the current user?</div>
      </Modal>
    );
  }
}

export default inject("dataStore")(observer(CancelPopUp));

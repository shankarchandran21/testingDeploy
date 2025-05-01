import "./AssignRoles.css";

import React, { Component } from "react";
import { Modal, Checkbox, message, Spin } from "antd";
import { inject, observer } from "mobx-react";
import AuthService from "../../services/api";

let tempArray = [];
class AssignRoles extends Component {
  constructor(props) {
    super(props);
    //state initialization
    this.state = {
      isModalVisible: false,
      userId: null,
      checkedValue: [],
      assignRolesOptions: [],
      isSubmitBlocked: false,
    };
  }

  //set modal visibility
  //intially while opening the modal, id is passed as third param ans storing that id as state variable.
  setModalVisibility(
    modalVisiblity,
    isFromOkClick,
    userId,
    roles,
    assignRolesOptions
  ) {
    if (assignRolesOptions) {
      this.setState({
        assignRolesOptions: assignRolesOptions,
      });
    }
    if (roles && roles.length > 0) {
      var assignedRoles = [];
      roles.forEach(function (arrayItem) {
        assignedRoles.push(arrayItem.id);
      });

      this.setState({
        checkedValue: assignedRoles,
      });
    }

    // if checkbox is selected , so when clicked ok then api should be called
    if (isFromOkClick) {
      const { isSubmitBlocked } = this.state;
      if (isSubmitBlocked) return;
      this.setState({
        isSubmitBlocked: true,
      });
      if (document.getElementById("assign-roles-spin") !== null)
        document.getElementById("assign-roles-spin").style.display = "block";
      //form data, we pass the userid, and role id accordingly.
      const formData = new FormData();
      formData.append("user_id", this.state.userId);
      this.state.checkedValue.map((item, index) => {
        formData.append(`role_ids[${item - 1}]`, item);
      });

      AuthService.requestWithPost("/assignRole", formData)
        .then((response) => {
          if (document.getElementById("assign-roles-spin") !== null)
            document.getElementById("assign-roles-spin").style.display = "none";
          if (!response) return;
          if (response && response.data) {
            if (response.data.success === 0 && response.data.message)
              message.error(response.data.message);
            else {
              message.success(response.data.message);
              this.setState({
                isModalVisible: modalVisiblity,
              });
              this.state.checkedValue = [];
              //on okay click, making a mobx variable true, if true then in settings page
              //listing api is called
              this.props.dataStore.settings.fetchUserManagementData = true;
            }
            this.setState({
              isSubmitBlocked: false,
            });
          }
        })
        .catch((error) => {
          if (document.getElementById("assign-roles-spin") !== null)
            document.getElementById("assign-roles-spin").style.display = "none";
          console.log(error);
          this.setState({
            isSubmitBlocked: false,
          });
        });
    } else {
      this.state.checkedValue = [];

      this.setState({
        isModalVisible: modalVisiblity,
        userId: userId,
      });
    }
  }

  //when checkbox item is changed/not
  onCheckboxItemChanged = (checkedValues) => {
    this.setState({
      checkedValue: checkedValues,
    });
  };

  render() {
    const { isModalVisible, assignRolesOptions } = this.state;
    return (
      <Modal
        className="assign-roles-modal"
        title="Assign Roles"
        centered
        visible={isModalVisible}
        onOk={() => this.setModalVisibility(false, true)}
        onCancel={() => this.setModalVisibility(false)}
      >
        <div
          id="assign-roles-spin"
          style={{ display: "none", position: "relative" }}
        >
          <Spin className="spin-user" size="large" />
        </div>

        <Checkbox.Group
          options={assignRolesOptions}
          value={this.state.checkedValue}
          onChange={this.onCheckboxItemChanged}
        />
      </Modal>
    );
  }
}

export default inject("dataStore")(observer(AssignRoles));

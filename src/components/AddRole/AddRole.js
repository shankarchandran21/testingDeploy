import "./AddRole.css";
import React, { Component } from "react";
import { Modal, Spin, Input, message, Switch, Select } from "antd";
import { inject, observer } from "mobx-react";
import AuthService from "../../services/api";
import { changeStatusForApi } from "../../utils/general";

const { Option } = Select;

class AddRole extends Component {
  constructor(props) {
    super(props);
    //state initialization
    this.state = {
      isModalVisible: false,
      roleName: "",
      status: true,
      from: null,
      data: null,
      record: null,
      unassignedUsers: [],
      assignUsers: null,
      rollId: null,
      isSubmitBlocked: false,
    };
  }

  assignRoleApi = (id) => {
    let users = [];
    let body = {};
    body.role_id = id;
    AuthService.requestWithPost("/unassignedUsers", body)
      .then((response) => {
        if (document.getElementById("add-roles-spin") !== null)
          document.getElementById("add-roles-spin").style.display = "none";
        if (response && response.data) {
          if (response.data.success === 1 && response.data.users.length > 0) {
            response.data.users.map((key) => {
              users.push({
                value: key.id,
                label: key.full_name,
              });
              return "";
            });
          }
          this.setState({
            unassignedUsers: users,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        if (document.getElementById("add-roles-spin") !== null)
          document.getElementById("add-roles-spin").style.display = "none";
      });
  };

  assignUsers = () => {
    if (document.getElementById("add-roles-spin") !== null)
      document.getElementById("add-roles-spin").style.display = "block";
    const { roleId, assignUsers } = this.state;
    //body is passed as form data
    const formData = new FormData();
    formData.append("role_id", roleId);
    if (assignUsers && assignUsers.length > 0) {
      assignUsers.map((item, index) => {
        formData.append(`user_ids[${index}]`, item);
      });
    }

    message.destroy();
    AuthService.requestWithPost("/assignUsers", formData)
      .then((response) => {
        this.setState({
          isSubmitBlocked: false,
        });
        if (document.getElementById("add-roles-spin") !== null)
          document.getElementById("add-roles-spin").style.display = "none";
        if (response && response.data) {
          if (response.data.success === 1) {
            message.success(response.data.message);
            this.props.dataStore.settings.fetchUserManagementData = true;
          } else {
            message.error(response.data.message);
          }
          this.setState({
            isModalVisible: false,
          });
        }
      })
      .catch((error) => {
        this.setState({
          isSubmitBlocked: false,
        });
        if (document.getElementById("add-roles-spin") !== null)
          document.getElementById("add-roles-spin").style.display = "none";
        console.log(error);
      });
  };

  //set modal visibility
  //intially while opening the modal, id is passed as third param ans storing that id as state variable.
  setModalVisibility(
    modalVisiblity,
    isFromOkClick,
    fromWhichClick,
    record,
    id
  ) {
    if (document.getElementById("add-roles-spin") !== null)
      document.getElementById("add-roles-spin").style.display = "none";
    if (isFromOkClick) {
      const { isSubmitBlocked } = this.state;
      if (isSubmitBlocked) return;
      this.setState({
        isSubmitBlocked: true,
      });

      //form data, we pass the userid, and role id accordingly.
      const formData = new FormData();
      if (this.state.roleName) formData.append("name", this.state.roleName);
      formData.append("status", changeStatusForApi(this.state.status));

      if (this.state.from === "add-role") {
        message.destroy();
        this.handleApiData("/createRole", formData, modalVisiblity);
      } else if (this.state.from === "edit-role") {
        if (this.state.data && this.state.data.id)
          formData.append("role_id", this.state.data.id);
        this.handleApiData("/editRole", formData, modalVisiblity);
      } else {
        this.assignUsers();
      }
    } else {
      if (fromWhichClick === "edit-role") {
        let name, status;
        if (record && record.name) name = record.name;
        if (record && record.status) status = record.status;
        this.setState({
          isModalVisible: modalVisiblity,
          from: fromWhichClick,
          roleName: name,
          status: status,
          data: record,
        });
      } else {
        if (id) {
          if (document.getElementById("add-roles-spin") !== null)
            document.getElementById("add-roles-spin").style.display = "block";
          this.assignRoleApi(id);
        }
        this.setState({
          isModalVisible: modalVisiblity,
          roleName: "",
          status: true,
          data: null,
          from: fromWhichClick,
          record: record,
          roleId: id,
        });
      }
    }
  }

  handleApiData = (apiEndPoint, formData, modalVisiblity) => {
    message.destroy();
    if (document.getElementById("add-roles-spin") !== null)
      document.getElementById("add-roles-spin").style.display = "block";

    AuthService.requestWithPost(apiEndPoint, formData)
      .then((response) => {
        this.setState({
          isSubmitBlocked: false,
        });
        if (document.getElementById("add-roles-spin") !== null)
          document.getElementById("add-roles-spin").style.display = "none";
        if (!response) return;
        if (response && response.data) {
          if (response.data.success === 0 && response.data.message)
            message.error(response.data.message);
          else {
            message.success(response.data.message);
            this.setState({
              isModalVisible: modalVisiblity,
              roleName: "",
              status: true,
            });
            //on okay click, making a mobx variable true, if true then in settings page
            //listing api is called
            this.props.dataStore.settings.fetchUserManagementData = true;
          }
        }
      })
      .catch((error) => {
        this.setState({
          isSubmitBlocked: false,
        });
        if (document.getElementById("add-roles-spin") !== null)
          document.getElementById("add-roles-spin").style.display = "none";
        console.log(error);
      });
  };

  handleInputOnChange = (event) => {
    this.setState({
      roleName: event.target.value,
    });
  };

  toggleOnChange = (checked) => {
    this.setState({
      status: checked,
    });
  };

  findText = (content) => {
    switch (content) {
      case "add-role":
        return "Add Role";
      case "edit-role":
        return "Edit Role";
      case "details":
        return "Assign Users";
    }
  };

  onChange = (values) => {
    this.setState({
      assignUsers: values,
    });
  };

  render() {
    const {
      isModalVisible,
      status,
      roleName,
      from,
      record,
      unassignedUsers,
    } = this.state;

    return (
      <Modal
        className="add-role-modal"
        title={this.findText(from)}
        centered
        visible={isModalVisible}
        onOk={() => this.setModalVisibility(false, true)}
        onCancel={() => this.setModalVisibility(false)}
      >
        <div
          id="add-roles-spin"
          style={{ display: "none", position: "relative" }}
        >
          <Spin className="spin-user" size="large" />
        </div>

        {from === "details" ? (
          <div className="details-container">
            <div className="assigned-users">Assign Users</div>
            {unassignedUsers.length > 0 ? (
              <>
                <Select
                  showSearch
                  className="assigned-users-select"
                  mode="multiple"
                  placeholder="Assign Users"
                  optionFilterProp="children"
                  onChange={this.onChange}
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {unassignedUsers
                    ? unassignedUsers.map((users) => (
                        <Option value={users.value}>{users.label}</Option>
                      ))
                    : null}
                </Select>
              </>
            ) : (
              <div>No Unassigned Users</div>
            )}

            <div className="assigned-users">Assigned Users</div>
            {record.length > 0 ? (
              record.map((values, index) => {
                let names = values.first_name + " " + values.last_name;
                if (index === record.length - 1) return <span>{names}</span>;
                else return <span>{names + "," + " "}</span>;
              })
            ) : (
              <div>No Users Assigned</div>
            )}
          </div>
        ) : (
          // <div
          //   className={
          //     from === "add-role" ? "add-role-container" : "edit-role-container"
          //   }
          // >
          <div className="edit-role-container">
            <div className="add-role-container-name">
              <span className="add-role-name-text">Role Name</span>
              <Input
                placeholder="Role Name"
                onChange={this.handleInputOnChange}
                value={roleName}
              />
            </div>

            {/* {from === "add-role" ? (
              <div className="add-role-switch">
                <span className="add-role-switch-name">Status</span>
                <Switch
                  checkedChildren="Active"
                  unCheckedChildren="Inactive"
                  checked={status}
                  onChange={this.toggleOnChange}
                />
              </div>
            ) : null} */}
          </div>
        )}
      </Modal>
    );
  }
}

export default inject("dataStore")(observer(AddRole));

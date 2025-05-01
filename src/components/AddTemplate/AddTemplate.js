import "./AddTemplate.css";
import React, { Component } from "react";
import {
  Modal,
  Upload,
  Button,
  Spin,
  Input,
  InputNumber,
  message,
  Checkbox,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { inject, observer } from "mobx-react";
import AuthService from "../../services/api";
import {changeStatusForApi} from "../../utils/general"

class AddTemplate extends Component {
  constructor(props) {
    super(props);
    //state initialization
    this.state = {
      isModalVisible: false,
      fileList: [],
      showUploadSection: false,
      name: "",
      noOfSignees: 1,
      isSubmitBlocked: false,
      checkedValue: false,
    };
  }

  //set modal visibility
  //intially while opening the modal, id is passed as third param ans storing that id as state variable.
  setModalVisibility(modalVisiblity, isFromOkClick) {
    if (isFromOkClick) {
      const { isSubmitBlocked } = this.state;
      if (isSubmitBlocked) return;
      this.setState({
        isSubmitBlocked: true,
      });

      if (document.getElementById("assign-roles-spin") !== null)
        document.getElementById("assign-roles-spin").style.display = "block";

      message.destroy();
      //form data, we pass the userid, and role id accordingly.
      const formData = new FormData();
      if (this.state.name) formData.append("name", this.state.name);
      if (this.state.noOfSignees)
        formData.append("no_of_signees", this.state.noOfSignees);

      formData.append("skip_sign", changeStatusForApi(this.state.checkedValue));

      //passing signature as form data
      if (this.state.fileList.length >= 1)
        formData.append("certificate", this.state.fileList[0].originFileObj);

      AuthService.requestWithPost("/createCertificate", formData)
        .then((response) => {
          this.setState({
            isSubmitBlocked: false,
          });
          if (document.getElementById("assign-roles-spin") !== null)
            document.getElementById("assign-roles-spin").style.display = "none";
          if (!response) return;
          if (response && response.data) {
            if (response.data.success === 0 && response.data.message) {
              message.error(response.data.message);
            } else {
              message.success(response.data.message);
              this.setState({
                isModalVisible: modalVisiblity,
                fileList: [],
                showUploadSection: false,
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
          if (document.getElementById("assign-roles-spin") !== null)
            document.getElementById("assign-roles-spin").style.display = "none";
          console.log(error);
        });
    } else {
      this.setState({
        isModalVisible: modalVisiblity,
        fileList: [],
        showUploadSection: false,
      });
    }
  }

  handleInputOnChange = (event) => {
    this.setState({
      name: event.target.value,
    });
  };

  handleInputNumberOnChange = (value) => {
    this.setState({
      noOfSignees: value,
    });
  };

  onChange = (e) => {
    this.setState({
      checkedValue: e.target.checked,
    });
  };

  //upload file changes
  handleChange = ({ fileList }) => this.setState({ fileList: fileList });

  render() {
    const { isModalVisible, fileList } = this.state;
    return (
      <Modal
        className="assign-template-modal"
        title="Add Template"
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

        <div className="add-template-container">
          <div className="add-template-container-name">
            <span className="add-template-name-text">Template Name</span>
            <Input
              placeholder="Template Name"
              onChange={this.handleInputOnChange}
            />
          </div>

          <div className="add-template-container-signess">
            <span className="add-templates-signees-label">No Of Signees</span>
            <InputNumber
              size="small"
              min={1}
              max={10}
              defaultValue={1}
              onChange={this.handleInputNumberOnChange}
            />
          </div>
        </div>
        <div className="upload-pdf">
          <Upload
            accept=".pdf"
            listType="picture"
            onChange={this.handleChange}
            beforeUpload={() => false}
          >
            {fileList && fileList[0] ? (
              <Button disabled icon={<UploadOutlined />}>
                Upload Template
              </Button>
            ) : (
              <Button icon={<UploadOutlined />}>Upload Template</Button>
            )}
          </Upload>
          <Checkbox style={{ alignSelf: "center" }} onChange={this.onChange}>
            Skip Sign
          </Checkbox>
        </div>
      </Modal>
    );
  }
}

export default inject("dataStore")(observer(AddTemplate));

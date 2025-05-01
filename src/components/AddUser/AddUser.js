import "./AddUser.css";
import React, { Component } from "react";
import { Card, Form, Input, Switch, Button, message, Spin } from "antd";
import { withRouter } from "react-router-dom";
import AuthService from "../../services/api";
import { changeStatusForApi } from "../../utils/general";

const text = [];
text.push("Password must contain at least one");
text.push("lowercase letter, uppercase letter,");
text.push("digit, and special character.");

var isSubmitBlocked = false;
class AddUser extends Component {
  //when cancel button is clicked, redirect back to settings listing page
  cancelHandleClickListener = () => {
    this.props.history.push({
      pathname: "/settings/user-management",
    });
  };

  //on submitting call the api, on sucess of api redirect back to settings listing page
  onHandleSubmit = (values) => {
    if (document.getElementById("add-user-spin") !== null)
      document.getElementById("add-user-spin").style.display = "block";

    if (!isSubmitBlocked) {
      isSubmitBlocked = true;

      //body params to be passed as form data
      let params = {};
      params.first_name = Object.values(values)[0];
      params.last_name = Object.values(values)[1];
      params.email = Object.values(values)[3];
      params.mobile_number = Object.values(values)[2];
      params.password = Object.values(values)[4];
      if (Object.values(values)[5])
        params.status = changeStatusForApi(Object.values(values)[5]);
      else params.status = changeStatusForApi(true);

      AuthService.requestWithPost("/addUser", params)
        .then((response) => {
          message.destroy();
          if (document.getElementById("add-user-spin") !== null)
            document.getElementById("add-user-spin").style.display = "none";
          if (response && response.data && response.data.message) {
            if (response.data.success === 0 && response.data.message)
              message.error(response.data.message);
            else {
              message.success(response.data.message);
              this.props.history.push({
                pathname: "/settings/user-management",
              });
            }
          }
          isSubmitBlocked = false;
        })
        .catch((error) => {
          isSubmitBlocked = false;
          if (document.getElementById("add-user-spin") !== null)
            document.getElementById("add-user-spin").style.display = "none";
          console.log(error);
        });
    }
  };

  render() {
    // const { toggleSelect } = this.state;
    return (
      <div className="user-form">
        <div
          id="add-user-spin"
          style={{ display: "none", position: "relative" }}
        >
          <Spin className="spin-user" size="large" />
        </div>
        <div className="user-vertical-line" />
        <Card>
          <div className="user-form-header">Add User</div>
          <Form
            className="add-user-form"
            onFinish={this.onHandleSubmit}
            autocomplete="false"
          >
            <Form.Item
              name="firstname"
              rules={[
                {
                  required: true,
                  message: "Please enter First name",
                },
              ]}
            >
              <div className="add-user-name">
                <Input
                  placeholder="First Name"
                  className="add-user-credentials"
                />
              </div>
            </Form.Item>

            <Form.Item
              name="lastname"
              rules={[
                {
                  required: true,
                  message: "Please enter Last name",
                },
              ]}
            >
              <div className="add-user-name">
                <Input
                  placeholder="Last Name"
                  className="add-user-credentials"
                />
              </div>
            </Form.Item>

            <Form.Item
              name="mobileNumber"
              rules={[
                {
                  required: true,
                  message: "Please enter Mobile Number",
                },
              ]}
            >
              <div className="add-user-name">
                <Input
                  placeholder="Mobile Number"
                  className="add-user-credentials"
                />
              </div>
            </Form.Item>

            <Form.Item
              name="new-email"
              rules={[
                {
                  type: "email",
                  message: "Please enter a valid email",
                },
                {
                  required: true,
                  message: "Please enter your email",
                },
              ]}
            >
              <div className="add-user-name">
                <Input
                  placeholder="Email"
                  className="add-user-credentials"
                  autocomplete="new-email"
                />
              </div>
            </Form.Item>

            <Form.Item
              name="new-password"
              rules={[
                {
                  required: true,
                  message: "Please enter Password",
                },
                { min: 5, message: "Password must be minimum 6 characters." },
                {
                  pattern: new RegExp(
                    "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
                  ),
                  message: text.map((e) => <div>{e}</div>),
                },
              ]}
            >
              <div className="add-user-name">
                <Input
                  autocomplete="new-password"
                  type="password"
                  placeholder="Password"
                  className="add-user-credentials"
                />
              </div>
            </Form.Item>

            <Form.Item name="switch" label="Status" valuePropName="checked">
              <Switch defaultChecked />
            </Form.Item>

            <div className="user-form-button">
              <Form.Item noStyle>
                <div className="user-form-submit-container">
                  <Button htmlType="submit" className="user-form-submit">
                    Submit
                  </Button>
                </div>
              </Form.Item>

              <Form.Item noStyle>
                <div className="user-form-cancel-container">
                  <Button
                    className="user-form-cancel"
                    onClick={this.cancelHandleClickListener}
                  >
                    Back
                  </Button>
                </div>
              </Form.Item>
            </div>
          </Form>
        </Card>
      </div>
    );
  }
}

export default withRouter(AddUser);

import "./AddStudent.css";
import React, { Component } from "react";
import { Card, Form, Input, Switch, Button, message, DatePicker, Spin } from "antd";
import { withRouter } from "react-router-dom";
import AuthService from "../../services/api";
import { changeStatusForApi } from "../../utils/general";

const text = [];
text.push("Password must contain at least one");
text.push("lowercase letter, uppercase letter,");
text.push("digit, and special character.");

var isSubmitBlocked = false;
class AddStudent extends Component {
  formRef = React.createRef();
  constructor(props) {
    super(props);
    console.log(this.props)
    this.state = {
      dateFormat: ''
    }
  }
  //when cancel button is clicked, redirect back to settings listing page
  cancelHandleClickListener = () => {
    this.props.history.push({
      pathname: "/master/student-list",
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
      params.student_id = Object.values(values)[0];
      params.first_name = Object.values(values)[1];
      params.middle_name = Object.values(values)[2];
      params.last_name = Object.values(values)[3];
      params.mobile = Object.values(values)[4];
      params.email = Object.values(values)[5];
      params.dob = Object.values(values)[6];
      AuthService.requestWithPost("/addStudent", params)
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
                pathname: "/master/student-list",
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
  datePickerChange = (from, date, dateString) => {
    const setString = { dob: dateString }
    this.formRef.current.setFieldsValue(setString);
};

  render() {
    const { dateFormat } = this.state;
    return (
      <div className="user-form">
        <div
          id="add-user-spin"
          style={{ display: "none", position: "relative" }}
        >
          <Spin className="spin-user overlay" size="large" />
        </div>
        {/* <div className="user-vertical-line" /> */}
        <Card>
          <div className="user-form-header">Add Student</div>
          <Form
            className="add-user-form"
            onFinish={this.onHandleSubmit}
            autocomplete="false"
            ref={this.formRef}
          >
            <Form.Item
              name="student_id"
              rules={[
                {
                  required: true,
                  message: "Please enter Student ID",
                },
              ]}
            ><div className="add-user-name">
                <Input
                  placeholder="Student ID"
                  className="add-user-credentials"
                />
              </div>
            </Form.Item>
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
              name="middlename"
              rules={[
                {
                  required: false,
                  message: "Please enter Middle name",
                },
              ]}
            >
              <div className="add-user-name">
                <Input
                  placeholder="Middle Name"
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
                { min: 10, message: "Please enter Valid Mobile Number" },
              ]}
            >
              <div className="add-user-name">
                <Input
                  placeholder="Mobile Number"
                  className="add-user-credentials"
                  maxLength={10}
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
             name="dob"
             validateTrigger={['onChange', 'onBlur']}
             rules={[
                 {
                     required: true,
                     message: "Please enter your DOB",
                 },
             ]}
            >
              <div className="add-user-name">
                <DatePicker
                  format={dateFormat ? dateFormat.toUpperCase() : null}
                  className="add-user-credentials"
                  style={{width:'100%',height:'38px'}}
                  placeholder="Date of Birth"
                  onChange={this.datePickerChange.bind(this, false)}                />
              </div>
            </Form.Item>
            <Form.Item></Form.Item>

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

export default withRouter(AddStudent);

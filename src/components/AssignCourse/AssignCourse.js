import "./AssignCourse.css";
import React, { Component } from "react";
import { Modal, Select, message, Spin } from "antd";
import { inject, observer } from "mobx-react";
import { certificateTypeDropDown } from "../../utils/constants";
import AuthService from "../../services/api";
import { certificateNameMapping } from "../../utils/general";

const { Option } = Select;

class AssignCourse extends Component {
  constructor(props) {
    super(props);
    //state initialization
    this.state = {
      isModalVisible: false,
      certificateId: null,
      course: [],
      certificateType: [],
      isSubmitBlocked: false,
      assignedCourses: [],
    };
  }

  fetchCourseSigneeDetails = (id) => {
    AuthService.requestMethod(`/certificateCourseSignee/${id}`)
      .then((response) => {
        if (document.getElementById("assign-course-spin") !== null)
          document.getElementById("assign-course-spin").style.display = "none";
        if (!response && !response.data) return;

        //if course is present
        if (response.data.certificate_courses)
          this.setState({
            assignedCourses: response.data.certificate_courses,
          });

      })
      .catch((error) => {
        if (document.getElementById("assign-course-spin") !== null)
          document.getElementById("assign-course-spin").style.display = "none";
        console.log(error);
      });
  };

  setModalVisibility(modalVisiblity, isFromOkClick, id) {
    const { certificateType, course, certificateId } = this.state;
    if (isFromOkClick) {
      const { isSubmitBlocked } = this.state;
      if (isSubmitBlocked) return;
      this.setState({
        isSubmitBlocked: true,
      });

      // if all the options are not selected then return
      if (
        (course && course.length === 0) ||
        (certificateType && certificateType === "SCT")
      ) {
        message.destroy();
        this.setState({
          isSubmitBlocked: false,
        });
        message.error("Please select all the required fields");
        return;
      }

      if (document.getElementById("assign-course-spin") !== null)
        document.getElementById("assign-course-spin").style.display = "block";

      //body is passed as form data
      const formData = new FormData();
      formData.append("certificate_id", certificateId);
      course.map((item, index) => {
        formData.append(`course_id[${item - 1}]`, item);
      });

      if (certificateType && certificateType.length > 0 && certificateType !== "SCT")
        formData.append("certificate_type", certificateType);

      message.destroy();

      AuthService.requestWithPost("/assignCourse", formData)
        .then((response) => {
          this.setState({
            isSubmitBlocked: false,
          });
          if (document.getElementById("assign-course-spin") !== null)
            document.getElementById("assign-course-spin").style.display =
              "none";
          if (!response) return;
          if (response && response.data) {
            if (response.data.success === 0 && response.data.message) {
              message.error(response.data.message);
            } else {
              message.success(response.data.message);
              this.setState({
                isModalVisible: modalVisiblity,
              });
            }
          }
        })
        .catch((error) => {
          this.setState({
            isSubmitBlocked: false,
          });
          if (document.getElementById("assign-course-spin") !== null)
            document.getElementById("assign-course-spin").style.display =
              "none";
          console.log(error);
        });
    } else {
      if (id !== undefined) {
        if (document.getElementById("assign-course-spin") !== null)
          document.getElementById("assign-course-spin").style.display = "block";
        this.fetchCourseSigneeDetails(id);
      }
      this.setState({
        isModalVisible: modalVisiblity,
        certificateId: id,
        course: [],
        certificateType: [],
        assignedCourses: [],
      });
    }
  }

  onDropDownChange = (isFromMultiSelection, value) => {
    if (isFromMultiSelection) {
      this.setState({
        course: value,
      });
    } else {
      this.setState({
        certificateType: value,
      });
    }
  };

  render() {
    let firstPart, secondPart;
    const {
      isModalVisible,
      course,
      certificateType,
      assignedCourses,
    } = this.state;
    const { courseDetailsDropDown } = this.props.dataStore.certificates;

    return (
      <Modal
        className="assign-roles-modal"
        title="Assign Courses"
        centered
        visible={isModalVisible}
        onOk={() => this.setModalVisibility(false, true)}
        onCancel={() => this.setModalVisibility(false)}
      >
        <div
          id="assign-course-spin"
          style={{ display: "none", position: "relative" }}
        >
          <Spin className="spin-user" size="large" />
        </div>
        <div className="assign-course-container">
          <span className="assign-course-header">Course</span>
          <Select
            showSearch
            style={{ width: 220 }}
            placeholder="Select a course"
            optionFilterProp="children"
            mode="multiple"
            value={course}
            onChange={this.onDropDownChange.bind(this, true)}
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
          >
            {courseDetailsDropDown
              ? courseDetailsDropDown.map((course) =>
                  course.value !== 0 ? (
                    <Option value={course.value}>{course.label}</Option>
                  ) : null
                )
              : null}
          </Select>

          <span className="assign-course-header">Certificate Type</span>
          <Select
            showSearch
            // allowClear
            style={{ width: 205 }}
            placeholder="Select Certificate Type"
            optionFilterProp="children"
            value={certificateType}
            onChange={this.onDropDownChange.bind(this, false)}
            filterOption={(input, option) =>
              option.props.children
                .toLowerCase()
                .indexOf(input.toLowerCase()) >= 0
            }
          >
            {certificateTypeDropDown
              ? certificateTypeDropDown.map((certificateType) => (
                  <Option value={certificateType.value}>
                    {certificateType.label}
                  </Option>
                ))
              : null}
          </Select>
        </div>

        <div className="assigned-courses-title">Assigned Courses</div>
        <div className="assigned-courses-container">
          {assignedCourses && assignedCourses.length > 0 ? (
            assignedCourses.map((courses) => {
              var index = courses.lastIndexOf("-");
              firstPart = courses.substr(0, index);
              secondPart = courses.substr(index + 1);
              if (!firstPart && !secondPart) return;
              return (
                <ul>
                  <li>
                    {firstPart + "-" + " " + certificateNameMapping(secondPart)}
                  </li>
                </ul>
              );
            })
          ) : (
            <div style={{marginLeft:10}}>No Certificate Course Details </div>
          )}
        </div>
      </Modal>
    );
  }
}
export default inject("dataStore")(observer(AssignCourse));

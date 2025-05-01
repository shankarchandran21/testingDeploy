import "./AssignSignee.css";
import React, { Component } from "react";
import { Modal, Select, message, Spin, Input } from "antd";
import { inject, observer } from "mobx-react";
import AuthService from "../../services/api";

const { Option } = Select;

class AssignSignee extends Component {
  constructor(props) {
    super(props);
    //state initialization
    this.state = {
      isModalVisible: false,
      templateId: null,
      assignedSignee: [],
      assignedDesignation: [],
      isSubmitBlocked: false,
      signeeCount: null,
      detailsArray: null,
      alreadyAssignedSigneeDetails: [],
    };
  }

  componentWillUnmount() {
    this.setState({
      assignedSignee: [],
    });
  }

  fetchCourseSigneeDetails = (id) => {
    let signeeDataArray = [];
    AuthService.requestMethod(`/certificateCourseSignee/${id}`)
      .then((response) => {
        const data = response.data;
        if (document.getElementById("assign-signee-spin") !== null)
          document.getElementById("assign-signee-spin").style.display = "none";
        if (!response && !response.data) return;

        //certificate signees
        if (data.certificate_signees && data.certificate_signees.length > 0) {
          //loop an array of objects
          data.certificate_signees.forEach(function (arrayItem) {
            //arrayitem is an object , loop through object
            let signeeData = {};
            for (const [key, value] of Object.entries(arrayItem)) {
              //designaton
              if (key.includes("_designation") && value) {
                Object.assign(signeeData, {
                  [key]: value,
                });
              }

              // signees
              if (key.includes("signee_") && value && value.full_name) {
                Object.assign(signeeData, {
                  [key]: value.full_name,
                });
              }
            }

            //sorting the object keys, before it is being pushed to array
            const ordered = Object.keys(signeeData)
              .sort()
              .reduce((obj, key) => {
                obj[key] = signeeData[key];
                return obj;
              }, {});
            signeeDataArray.push(ordered);
          });
        }

        this.setState({
          alreadyAssignedSigneeDetails: signeeDataArray,
        });
      })
      .catch((error) => {
        if (document.getElementById("assign-signee-spin") !== null)
          document.getElementById("assign-signee-spin").style.display = "none";
        console.log(error);
      });
  };

  setModalVisibility(
    modalVisiblity,
    isFromOkClick,
    idForTemplate,
    noOfSignees
  ) {
    const { templateId, assignedSignee, assignedDesignation, signeeCount } =
      this.state;
    if (isFromOkClick) {
      message.destroy();

      const { isSubmitBlocked } = this.state;
      if (isSubmitBlocked) return;
      this.setState({
        isSubmitBlocked: true,
      });

      //body is passed as form data
      const formData = new FormData();

      if (assignedSignee.length > 0) {
        assignedSignee.map((signee) =>
          signee.value !== 0
            ? (formData.append(`${signee.key}`, signee.value),
              formData.append("template_id", templateId))
            : null
        );
      }

      if (assignedDesignation.length > 0) {
        assignedDesignation.map((designation) => {
          if (
            designation.value !== undefined &&
            designation.value !== null &&
            designation.value !== ""
          )
            formData.append(`${designation.key}`, designation.value);
        });
      }

      if (
        assignedSignee.length === signeeCount &&
        assignedDesignation.length === signeeCount
      ) {
        if (document.getElementById("assign-signee-spin") !== null)
          document.getElementById("assign-signee-spin").style.display = "block";

        AuthService.requestWithPost("/assignSignee", formData)
          .then((response) => {
            this.setState({
              isSubmitBlocked: false,
            });
            if (document.getElementById("assign-signee-spin") !== null)
              document.getElementById("assign-signee-spin").style.display =
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
            if (document.getElementById("assign-signee-spin") !== null)
              document.getElementById("assign-signee-spin").style.display =
                "none";
            console.log(error);
          });
      } else {
        this.setState({
          isSubmitBlocked: false,
        });
        message.error("Please enter all the required fields");
      }
    } else {
      if (idForTemplate !== undefined) {
        if (document.getElementById("assign-signee-spin") !== null)
          document.getElementById("assign-signee-spin").style.display = "block";
        this.fetchCourseSigneeDetails(idForTemplate);
      }
      this.setState({
        isModalVisible: modalVisiblity,
        templateId: idForTemplate,
        signeeCount: noOfSignees,
        assignedSignee: [],
        assignedDesignation: [],
        alreadyAssignedSigneeDetails: [],
      });
    }
  }

  onDropDownChange = (signee, key, value) => {
    // if (value === 0) return;
    const { assignedSignee } = this.state;
    let dropDownArrayForSignee = assignedSignee || [];

    //if the state array already have an signee_1 value, then remove it
    if (dropDownArrayForSignee.length > 0) {
      if (dropDownArrayForSignee.some((details) => details.label === signee)) {
        dropDownArrayForSignee.splice(
          dropDownArrayForSignee.findIndex(
            (details) => details.label === signee
          ),
          1
        );
      }
    }

    //adding the values to dropdownarray
    if (value !== 0) {
      dropDownArrayForSignee.push({
        value: value,
        label: signee,
        key: key,
      });
    }

    //setting the dropdwonarray to state
    this.setState({
      assignedSignee: dropDownArrayForSignee,
    });
  };

  onInputChange = (designation, event) => {
    const { assignedDesignation } = this.state;
    let designationArray = assignedDesignation || [];

    //if the state array already have an designation1 value, then remove it
    if (designationArray.length > 0) {
      if (designationArray.some((details) => details.key === designation)) {
        designationArray.splice(
          designationArray.findIndex((details) => details.key === designation),
          1
        );
      }
    }

    if (event.target.value) {
      designationArray.push({
        value: event.target.value,
        key: designation,
      });
    }

    this.setState({
      assignedDesignation: designationArray,
    });
  };

  //to display the value of designation in ui
  valueToBeDisplayedInDropDown = (dropDownArray, key) => {
    let valueToBeReturned;
    dropDownArray.map((arrayItem) => {
      valueToBeReturned =
        key === arrayItem.key ? arrayItem.value : valueToBeReturned;
    });
    return valueToBeReturned;
  };

  displaySigneeDetails = () => {
    const { alreadyAssignedSigneeDetails } = this.state;
    return alreadyAssignedSigneeDetails.map((details, index) => {
      return (
        <>
          {Object.keys(details).map(function (key) {
            return (
              <div className="assign-signee-wrapper-sub">
                <div className="assign-signee-details-key">
                  {key.replace(/_/g, " ")}
                </div>
                <span className="assign-signee-details">{details[key]}</span>
              </div>
            );
          })}

          {index !== alreadyAssignedSigneeDetails.length - 1 ? (
            <hr className="assign-signee-details-divider" />
          ) : null}
        </>
      );
    });
  };

  render() {
    const {
      isModalVisible,
      assignedSignee,
      assignedDesignation,
      signeeCount,
      alreadyAssignedSigneeDetails,
    } = this.state;
    const { signeeDetailsDropDown } = this.props.dataStore.certificates;

    let signeeArray = [];
    for (let index = 0; index < signeeCount; index++) {
      signeeArray.push({
        value: `signee_${index + 1}`,
        label: `Signee ${index + 1}`,
        key: `signee_ids[${index}]`,
        designationLabel: `Designation ${index + 1}`,
        designationKey: `signee${index + 1}_designation`,
      });
    }

    return (
      <Modal
        className="assign-signee-modal"
        title="Assign Signee"
        centered
        visible={isModalVisible}
        onOk={() => this.setModalVisibility(false, true)}
        onCancel={() => this.setModalVisibility(false)}
      >
        <div
          id="assign-signee-spin"
          style={{ display: "none", position: "relative" }}
        >
          <Spin className="spin-user" size="large" />
        </div>
        <div className="assign-signee-container">
          {signeeArray.map((signees) => {
            return (
              <>
                <label className="required" style={{ alignSelf: "center" }}>
                  {signees.designationLabel}
                </label>
                <Input
                  value={this.valueToBeDisplayedInDropDown(
                    assignedDesignation,
                    signees.designationKey
                  )}
                  onChange={this.onInputChange.bind(
                    this,
                    signees.designationKey
                  )}
                />
                <span className="assign-signee-header">{signees.label}</span>
                <Select
                  showSearch
                  style={{ width: 175 }}
                  placeholder="Select a signee"
                  optionFilterProp="children"
                  onChange={this.onDropDownChange.bind(
                    this,
                    signees.value,
                    signees.key
                  )}
                  value={this.valueToBeDisplayedInDropDown(
                    assignedSignee,
                    signees.key
                  )}
                  filterOption={(input, option) =>
                    option.props.children
                      .toLowerCase()
                      .indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {signeeDetailsDropDown.length > 0
                    ? signeeDetailsDropDown.map((signeeDropdown, index) => {
                        return (
                          <Option
                            disabled={
                              assignedSignee.length > 0
                                ? assignedSignee.find(
                                    (signeesAssigne) =>
                                      signeesAssigne.label !== signees.value &&
                                      signeesAssigne.value ===
                                        signeeDropdown.value &&
                                      signeesAssigne.value !== 0
                                  )
                                : null
                            }
                            value={signeeDropdown.value}
                          >
                            {signeeDropdown.label}
                          </Option>
                        );
                      })
                    : null}
                </Select>
              </>
            );
          })}
        </div>

        <div className="assigned-signees-title">
          Assigned Signees and Designations
        </div>
        {alreadyAssignedSigneeDetails &&
        alreadyAssignedSigneeDetails.length > 0 ? (
          <>
            <div className="assign-signee-wrapper">
              <span>{this.displaySigneeDetails()}</span>
            </div>
          </>
        ) : (
          <div className="assign-signee-courses">
            No Certificate Signee Details{" "}
          </div>
        )}
      </Modal>
    );
  }
}
export default inject("dataStore")(observer(AssignSignee));

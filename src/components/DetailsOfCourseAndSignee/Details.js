import "./Details.css";
import React, { Component } from "react";
import { Modal, Spin, Switch } from "antd";
import { inject, observer } from "mobx-react";
import AuthService from "../../services/api";
import { certificateNameMapping } from "../../utils/general";

class Details extends Component {
  constructor(props) {
    super(props);
    //state initialization
    this.state = {
      isModalVisible: false,
      details: [],
      skipSign: null,
      signeeDetails: [],
    };
  }

  fetchCourseSigneeDetails = (id) => {
    let signeeDataArray = [];
    AuthService.requestMethod(`/certificateCourseSignee/${id}`)
      .then((response) => {
        const data = response.data;
        if (document.getElementById("assign-details-spin") !== null)
          document.getElementById("assign-details-spin").style.display = "none";
        if (!response && !data) return;

        //certificate courses
        if (data.certificate_courses && data.certificate_courses.length > 0)
          this.setState({
            details: data.certificate_courses,
          });

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

              //valid from
              if (key === "valid_from" && value) {
                Object.assign(signeeData, {
                  [key]: value,
                });
              }

              //valid to
              if (key === "valid_to" && value) {
                Object.assign(signeeData, {
                  [key]: value,
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
          signeeDetails: signeeDataArray,
        });
      })
      .catch((error) => {
        if (document.getElementById("assign-details-spin") !== null)
          document.getElementById("assign-details-spin").style.display = "none";
        console.log(error);
      });
  };

  setModalVisibility(modalVisiblity, idForCourseAndSignee, skipSign) {
    if (idForCourseAndSignee) {
      if (document.getElementById("assign-details-spin") !== null)
        document.getElementById("assign-details-spin").style.display = "block";
      //api call , id will be present only if clicked from table.
      this.fetchCourseSigneeDetails(idForCourseAndSignee);
      this.setState({
        isModalVisible: modalVisiblity,
        skipSign: skipSign,
      });
    } else {
      this.setState({
        isModalVisible: modalVisiblity,
        details: {},
        signeeDetails: [],
        skipSign: null,
      });
    }
  }

  displaySigneeDetails = () => {
    const { signeeDetails } = this.state;
    return signeeDetails.map((details, index) => {
      return (
        <>
          {Object.keys(details).map(function (key) {
            return (
              <div className="assign-details-wrapper-sub">
                <div className="assign-signee-details-key">
                  {key.replace(/_/g, " ")}
                </div>
                <span className="assign-signee-details">{details[key]}</span>
              </div>
            );
          })}
  
          {index !== signeeDetails.length - 1 ? (
            <hr className="assign-signee-details-divider" />
          ) : null}
        </>
      );
    });
  };

  render() {
    let index, firstPart, secondPart;
    const { isModalVisible, details, skipSign, signeeDetails } = this.state;

    return (
      <Modal
        className="assign-signee-modal"
        title="Assigned Courses and Signees"
        centered
        visible={isModalVisible}
        onOk={() => this.setModalVisibility(false)}
        // cancelButtonProps={{ style: { display: 'none' } }}
        okButtonProps={{ style: { display: "none" } }}
        onCancel={() => this.setModalVisibility(false)}
      >
        <div id="assign-details-spin" style={{ position: "relative" }}>
          <Spin className="assign-details-spin-user" size="large" />
        </div>
        <div>
          <div className="assign-details-signee-header-top">
            <div className="assign-details-signee-header-title">
              Certificate Signees
            </div>
            <div className="assign-details-signee-header-sub-title">
              {skipSign !== null ? (
                <div>
                  <span className="skip-sign"> Skip Sign : </span>{" "}
                  <Switch disabled={true} checked={skipSign} />{" "}
                </div>
              ) : null}{" "}
            </div>
          </div>

          <div className="assign-header-divider" />

          {signeeDetails && signeeDetails.length > 0 ? (
            <>
              <div className="assign-details-wrapper">
                <span>{this.displaySigneeDetails()}</span>
              </div>
            </>
          ) : (
            <div className="assign-details-courses">
              No Certificate Signee Details{" "}
            </div>
          )}

          <div
            className="assign-details-signee-header"
            style={{ marginTop: 15 }}
          >
            Certificate Courses and Type
          </div>
          <div className="assign-header-divider" />

          {details.length > 0 ? (
            <>
              <div className="assign-details-courses">
                {details.map((courses) => {
                  var index = courses.lastIndexOf("-");
                  firstPart = courses.substr(0, index);
                  secondPart = courses.substr(index + 1);
                  if (!firstPart && !secondPart) return;
                  return (
                    <ul>
                      <li>
                        {firstPart +
                          "-" +
                          " " +
                          certificateNameMapping(secondPart)}
                      </li>
                    </ul>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="assign-details-courses">
              No Certificate Course Details{" "}
            </div>
          )}
        </div>
      </Modal>
    );
  }
}
export default inject("dataStore")(observer(Details));

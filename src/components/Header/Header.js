import "./Header.css";
import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import Avatar from "react-avatar";
import { Menu, Dropdown } from "antd";
import ClientLogo from "../../assets/client-logo.png";
import gravatar from "gravatar";
import AuthService from "../../services/api";
import { inject, observer } from "mobx-react";
import { withRouter } from "react-router-dom";
import SettingsIcon from "../../assets/settings.png";
import Certificate from "../../assets/certificate.png";
import CertificateHover from "../../assets/certificate-hover.png";
import Master from "../../assets/master.png";
import MasterHover from "../../assets/master-hover.png";
import Notifications from "../Noifications/Notifications";
import ServiceRequestIcon from "../../assets/service-request.svg";

// import Graph from "../../assets/graph.png";
// import GraphHover from "../../assets/graph-hover.png";
import Dashboard from "../../assets/dashboard.png";
import DashboardHover from "../../assets/dashboard-hover.png";
// import Details from "../../assets/deatils-list.png";
// import DetailsHover from "../../assets/deatils-list-hover.png";
import Report from "../../assets/resportic.png";
import ReportHover from "../../assets/resportic-hover.png";
import { autorun } from "mobx";

//to set username
let userName = "";
let email = "";
class Header extends Component {
  constructor() {
    super();
    this.state = {
      notificationsCount: 0,
      notifications: [],
    };
  }
  componentDidMount() {
    //function -> to check if token is in localstorage or session storage
    this.checkStorage();

    //api call -> to get the dropdown data [course and requisitioner]
    this.fetchCertificateListingDropdown();

    //api call -> Template listing signee dropdown
    this.fetchSigneeDetails();

    //api call -> notifications listing
    this.fetchNotificationsData();

    this.autoUpdateDisposer = autorun(() => {
      if (this.props.dataStore.certificates.fetchNotifications) {
        this.fetchNotificationsData();
      }
    });
  }

  componentWillUnmount() {
    this.autoUpdateDisposer();

    // fix Warning: Can't perform a React state update on an unmounted component
    this.setState = (state, callback) => {
      return;
    };
  }

  checkStorage = () => {
    if (localStorage.getItem("certificate-automation-authority") !== null) {
      this.props.dataStore.header.storage = JSON.parse(
        localStorage.getItem("certificate-automation-authority")
      );
      this.props.dataStore.header.isFromLocalStorage = true;
    } else if (
      sessionStorage.getItem("certificate-automation-authority") !== null
    ) {
      this.props.dataStore.header.storage = JSON.parse(
        sessionStorage.getItem("certificate-automation-authority")
      );
      this.props.dataStore.header.isFromLocalStorage = false;
    }
  };

  fetchNotificationsData = () => {
    AuthService.requestWithPost("/notifications")
      .then((response) => {
        if (response && response.data && response.data.notifications)
          this.setState({
            notifications: response.data.notifications,
          });

        if (response.data.unread_notifications)
          this.setState({
            notificationsCount: response.data.unread_notifications,
          });
      })
      .catch((error) => {
        console.log(error);
      });
    this.props.dataStore.certificates.fetchNotifications = false;
  };

  fetchCertificateListingDropdown = () => {
    let courseDetails = [];
    let requesitionerDetails = [];
    AuthService.requestMethod("/requisitionerCourseDetails")
      .then((response) => {
        if (response && response.data) {
          //course details array is stored in datastore in value/label format for convinence of handling
          if (response.data.course_details) {
            response.data.course_details.map((course) => {
              courseDetails.push({
                value: course.id,
                label: course.course_name,
              });
              return "";
            });
          }
          this.props.dataStore.certificates.courseDetailsDropDown =
            courseDetails;

          //date format
          if (response.data.display_date_format)
            this.props.dataStore.settings.dateFormat =
              response.data.display_date_format;

          //requisitioner details array is stored in datastore
          if (response.data.requisitioner_details) {
            response.data.requisitioner_details.map((requisitioner) => {
              requesitionerDetails.push({
                value: requisitioner.id,
                label: requisitioner.requisitioner_name,
              });
              return "";
            });
          }
          this.props.dataStore.certificates.requisitionerDetailsDropDown =
            requesitionerDetails;
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  fetchSigneeDetails = () => {
    let signeeDetails = [];
    AuthService.requestMethod("/SigneeDetails")
      .then((response) => {
        if (response && response.data) {
          //signee details array is stored in datastore in value/label format for convinence of handling
          if (response.data.signees) {
            signeeDetails.unshift({
              value: 0,
              label: "Select a Signee",
            });
            response.data.signees.map((signee) => {
              signeeDetails.push({
                value: signee.id,
                label: signee.first_name + " " + signee.last_name,
              });
              return "";
            });
          }
          this.props.dataStore.certificates.signeeDetailsDropDown =
            signeeDetails;
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  //sign out api integration
  signout = () => {
    AuthService.requestWithPost("/logout")
      .then((response) => {
        //clear all the local storage, reset data store
        if (response) {
          localStorage.clear();
          sessionStorage.clear();
          this.props.dataStore.reset();

          try {
            //redirect
            if (window.location.pathname !== "/user/login")
              this.props.history.push("/user/login");
          } catch (error) {
            if (error) console.log(error);
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  userMenu = (
    <Menu>
      <Menu.Item key="3" onClick={this.signout}>
        Logout
      </Menu.Item>
    </Menu>
  );

  certificatesMenu = (value) => (
    <Menu>
      {value && value.certificates
        ? value.certificates.map((module, index) => (
            <>
              <Menu.Item
                key={module.key}
                onClick={() => {
                  this.props.history.push(module.module_url);
                }}
              >
                {module.module_name}
              </Menu.Item>
              {index === value.certificates.length - 1 ? null : (
                <Menu.Divider />
              )}
            </>
          ))
        : null}
    </Menu>
  );
  masterMenu = (value) => (
    <Menu>
      {value && value.master
        ? value.master.map((module, index) => (
            <>
              <Menu.Item
                key={module.key}
                onClick={() => {
                  this.props.history.push(module.module_url);
                }}
              >
                {module.module_name}
              </Menu.Item>
              {index === value.master.length - 1 ? null : (
                <Menu.Divider />
              )}
            </>
          ))
        : null}
    </Menu>
  );

  settingsMenu = (value) => (
    <Menu>
      {value && value.settings
        ? value.settings.map((module, index) => (
            <>
              <Menu.Item
                key={module.key}
                onClick={() => {
                  this.props.history.push(module.module_url);
                }}
              >
                {module.module_name}
              </Menu.Item>
              {index === value.settings.length - 1 ? null : <Menu.Divider />}
            </>
          ))
        : null}
    </Menu>
  );

  render() {
    const { notificationsCount, notifications } = this.state;
    const { storage } = this.props.dataStore.header;

    if (storage && storage.email) email = storage.email;

    //setting username
    const username = (value) => {
      if (value && value.username) {
        return (userName = value.username);
      } else {
        return userName;
      }
    };

    return (
      <div className="header-outer-container">
        <header>
          <div className="header-logo-and-nav">
            <div className="header-left">
              <div className="logo">
                <NavLink to="/dashboard">
                  {storage && storage.productLogo ? (
                    <div>
                      <img className="main-logo" src={storage.productLogo} />
                    </div>
                  ) : null}
                </NavLink>
              </div>
            </div>
            <div className="navigation-div">
              <NavLink
                to="/dashboard"
                className="navigation"
                activeClassName="selected-nav"
              >
                <div className="navigation-icon">
                  <a className="navigation-icon-anchor">
                    <img
                      src={Dashboard}
                      alt="certificate"
                      className="certificate-icon"
                    />{" "}
                    <img
                      src={DashboardHover}
                      alt="certificateHover"
                      className="certificate-icon"
                    />{" "}
                  </a>
                  <div className="navigation-name">Dashboard</div>
                </div>
              </NavLink>

              <NavLink
                to="/reports"
                className="navigation"
                activeClassName="selected-nav"
              >
                <div className="navigation-icon">
                  <a className="navigation-icon-anchor">
                    <img
                      src={Report}
                      alt="certificate"
                      className="certificate-icon"
                    />{" "}
                    <img
                      src={ReportHover}
                      alt="certificateHover"
                      className="certificate-icon"
                    />{" "}
                  </a>
                  <div className="navigation-name">Certificate Register</div>
                </div>
              </NavLink>

              {storage && storage.certificates.length > 0 ? (
                <Dropdown overlay={this.certificatesMenu(storage)}>
                  <NavLink
                    to="/certificates"
                    className="navigation"
                    activeClassName="selected-nav"
                  >
                    <div className="navigation-icon">
                      <a className="navigation-icon-anchor">
                        <img
                          src={Certificate}
                          alt="certificate"
                          className="certificate-icon"
                        />{" "}
                        <img
                          src={CertificateHover}
                          alt="certificateHover"
                          className="certificate-icon"
                        />{" "}
                      </a>
                      <div className="navigation-name">Certificates</div>
                    </div>
                  </NavLink>
                </Dropdown>
              ) : null}

              {storage && storage.master.length > 0 ? (
                <Dropdown overlay={this.masterMenu(storage)}>
                  <NavLink
                    to="/master"
                    className="navigation"
                    activeClassName="selected-nav"
                  >
                    <div className="navigation-icon">
                      <a className="navigation-icon-anchor">
                        <img
                          src={Master}
                          alt="Master"
                          className="certificate-icon"
                        />{" "}
                        <img
                          src={MasterHover}
                          alt="certificateHover"
                          className="certificate-icon"
                        />{" "}
                      </a>
                      <div className="navigation-name">Master</div>
                    </div>
                  </NavLink>
                </Dropdown>
              ) : null}
            </div>
          </div>
          <div className="header-right">
            <div style={{ textAlign: "right" }}>
              {storage && storage.clientLogo ? (
                <div>
                  <img className="sub-heading-logo" src={storage.clientLogo} />
                </div>
              ) : (
                <img
                  className="sub-heading-logo-static"
                  src={ClientLogo}
                  width="100"
                />
              )}
            </div>
          </div>
        </header>

        <div className="sub-heading" style={{ height: 43 }}>
          {/* <p
            className="service-request"
            style={{ alignSelf: "center", cursor: "pointer" }}
          >
            <a
              href="https://edusystems.atlassian.net/servicedesk/customer/portal/23"
              target="_blank"
            >
              <img
                src={ServiceRequestIcon}
                alt="Service Request"
                title="Service Request"
                className="settings-icon"
                style={{ height: 31 }}
              />
            </a>
          </p> */}

          <Notifications
            count={notificationsCount}
            notifications={notifications}
            className="notification-icon"
          />
          {storage && storage.settings.length > 0 ? (
            <Dropdown
              overlay={this.settingsMenu(storage)}
              className="settings-icon-container"
            >
              <img
                src={SettingsIcon}
                alt="settings"
                className="settings-icon"
                style={{ height: 40 }}
              />
            </Dropdown>
          ) : null}

          <Dropdown overlay={this.userMenu} className="drop-down-user-menu">
            <div className="user-menu">
              <Avatar
                className="profile-icon"
                size={25}
                round="50%"
                src={gravatar.url(email, {
                  s: "100",
                  r: "r",
                  d: "mp",
                })}
                alt="profile_icon"
                id="profile-icon"
              />
              <div className="current-user">{username(storage)}</div>
            </div>
          </Dropdown>
        </div>
      </div>
    );
  }
}

export default withRouter(inject("dataStore")(observer(Header)));

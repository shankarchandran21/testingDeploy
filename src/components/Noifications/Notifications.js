import React, { Component } from "react";
import AuthService from "../../services/api";
import { Dropdown, Menu, message, Badge } from "antd";
import NotificationIcon from "../../assets/notification.png";
import { withRouter } from "react-router-dom";
import { inject, observer } from "mobx-react";
import { setCertificateStorageDetails } from "../../utils/general";

class Notifications extends Component {
  notificationMenu = (data) => (
    <Menu>
      {data && data.length > 0
        ? data.map((notifications, index) => (
            <>
              <Menu.Item
                key={notifications.id}
                onClick={() => {
                  this.updateNotificationsMenu(
                    notifications.id,
                    notifications.action_id,
                    notifications.subject
                  );
                }}
              >
                {notifications.message}
              </Menu.Item>
              {index === data.length - 1 ? null : <Menu.Divider />}
            </>
          ))
        : null}
    </Menu>
  );

  updateNavigationPage = (subject) => {
    switch (subject) {
      case "CERTIFICATE_APPROVED":
        return "to-be-signed-list";
      case "CERTIFICATE_SIGNED":
        return "signed-list";
      case "CERTIFICATE_ISSUED":
        return "send-to-print-list";
      case "CERTIFICATE_PRINTED":
        return "printed-list";
    }
  };

  updateNotificationsMenu = (notificationId, actionId, subject) => {
    const { isFromLocalStorage } = this.props.dataStore.header;
    let body = {};
    body.notification_id = notificationId;

    let toberedirected = this.updateNavigationPage(subject);

    AuthService.requestWithPost("/readNotification", body)
      .then((response) => {
        if (response && response.data) {
          if (response.data.success && response.data.success === 1) {
            //suppose the page is refreshed, then history will be empty and will end up in blank page
            //to avoid that store it in local storage, so even if history is empty, it will take
            //from local storage.
            let certificateArray = Object.assign({
              certificate_id: actionId,
              certificate_list: toberedirected,
            });

            setCertificateStorageDetails(isFromLocalStorage, certificateArray);

            //redirect to history listing page
            this.props.history.push({
              pathname: `/certificates/${toberedirected}/${actionId}`,
              id: actionId,
            });

            this.props.dataStore.certificates.fetchNotifications = true;
          } else {
            if (response.data.notifications)
              message.error(response.data.notifications);
          }
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  render() {
    const { count, notifications } = this.props;
    return (
      <div style={{ marginRight:15 }}>
        {notifications && notifications.length > 0 ? (
          <Dropdown
            overlay={this.notificationMenu(notifications)}
            trigger={["click"]}
          >
            {count > 0 ? (
              <Badge count={count}>
                <img
                  src={NotificationIcon}
                  alt="settings"
                  className="notification-icon"
                />
              </Badge>
            ) : (
              <img
                src={NotificationIcon}
                alt="settings"
                className="notification-icon"
              />
            )}
          </Dropdown>
        ) : null}
      </div>
    );
  }
}

export default withRouter(inject("dataStore")(observer(Notifications)));

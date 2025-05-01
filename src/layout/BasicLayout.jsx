import "./BasicLayout.css";

import { Switch, BrowserRouter as Router } from "react-router-dom";
import React from "react";
import DocumentTitle from "react-document-title";
import PrivateRoute from "../components/PrivateRoute/PrivateRoute";
import MainDashboard from "../pages/Dashboard/MainDashboard";
import Reports from "../pages/Reports/MainReports";
import Settings from "../pages/Settings/MainSettings";
import Help from "../pages/Help/Help";
import Header from "../components/Header/Header";
import Certificates from "../pages/Certificates/Certificates";
import Master from "../pages/Master/Master";

//DocumentTitle - sets the title of the page
//on each route load the corresponding components
//if the path is - /user, then also redirect to dashboard page
const BasicLayout = () => {
  return (
    <DocumentTitle title="eTestamur">
      <div className="basic-container">
        <Header />
        <Switch>
          <PrivateRoute exact path="/" component={MainDashboard} />
          <PrivateRoute path="/dashboard" component={MainDashboard} />
          <PrivateRoute path="/reports" component={Reports} />
          <PrivateRoute path="/certificates" component={Certificates} />
          <PrivateRoute path="/master" component={Master} />
          <PrivateRoute path="/settings" component={Settings} />
          <PrivateRoute path="/help" component={Help} />
        </Switch>
      </div>
    </DocumentTitle>
  );
};

export default BasicLayout;

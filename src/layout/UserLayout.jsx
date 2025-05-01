import "./UserLayout.css";

import { Route, Redirect, Switch } from "react-router-dom";
import React from "react";
import DocumentTitle from "react-document-title";

import Exception from "../components/Exception/Exception";
import Login from "../pages/User/Login";
import ForgotPassword from "../pages/User/ForgotPassword";
import ForgotPasswordSent from "../pages/User/ForgotPasswordSent";
import ResetPassword from "../pages/User/ResetPassword";

//DocumentTitle - sets the title of the page
//on each route load the corresponding components
//if the path is - /user, then also redirect to login page
//if none of the routes matches - load the exception page

const UserLayout = () => {
  return (
    <DocumentTitle title="eTestamur">
      <div className="main-container">
        <div className="main-container-bg">
          <div className="main-container-center">
            <Switch>
              <Route path="/user/login" component={Login} exact />
              <Route path="/user/reset" component={ResetPassword} />
              <Route path="/user/forgot-password" component={ForgotPassword} />
              <Route
                path="/user/forgot-password-sent"
                component={ForgotPasswordSent}
              />
              <Route
                exact
                path="/user"
                render={() => <Redirect to="/user/login" />}
              />
              <Route component={Exception} />
            </Switch>
          </div>
        </div>
      </div>
    </DocumentTitle>
  );
};

export default UserLayout;

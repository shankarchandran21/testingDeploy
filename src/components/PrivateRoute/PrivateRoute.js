import { Redirect, Route } from "react-router-dom";
import React from "react";

//For restricting the routes.
const PrivateRoute = ({ component: Component, ...rest }) => {
  let isLoggedSuccess = 0;
  //for logged in users the key "success" will give 1
  //else key "success" will give 0
  if (
    localStorage.getItem("certificate-automation-authority-details") !== null
  ) {
    isLoggedSuccess = JSON.parse(
      localStorage.getItem("certificate-automation-authority-details")
    ).success;
    sessionStorage.clear();
  } else if (
    sessionStorage.getItem("certificate-automation-authority-details") !== null
  ) {
    isLoggedSuccess = JSON.parse(
      sessionStorage.getItem("certificate-automation-authority-details")
    ).success;
    localStorage.clear();
  }

  return (
    //Show the component only when the user is logged in
    //Otherwise, redirect to the user/login page

    <Route
      {...rest}
      render={(props) =>
        isLoggedSuccess === 1 ? (
          rest.path === "/" ? (
            <Redirect to="/dashboard" />
          ) : (
            <Component {...props} />
          )
        ) : (
          <Redirect to="/user/login" />
        )
      }
    />
  );
};

export default PrivateRoute;

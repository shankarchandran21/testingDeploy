import "./CertificateRequest.css";
import { Route, Switch, Redirect } from "react-router-dom";
import React from "react";

import RequestedCertificates from "./CertificateRequest";
import Exception from "../../components/Exception/Exception";
import PrivateRoute from "../../components/PrivateRoute/PrivateRoute";
import Profile from "../../components/Profile/Profile";
import ToBeSignedList from "./ToBeSigned";
import SignedCertificates from "./SignedCertificates";
import SignedView from "../../components/Profile/SignedView";
import ToBeSignedView from "../../components/Profile/ToBeSignedView";
import ApprovedList from "./ApprovedCertificateList";
import ApprovedListView from "../../components/Profile/ApprovedCertificateView";
import RejectedCertificates from "./RejectedCertificates";
import RejectedCertificatesView from "../../components/Profile/RejectedCertificateView";
import PrintedCertificates from "./PrintedCertificates";
import PrintedCertificatesView from "../../components/Profile/PrintedCerticatesView";
import SignCertificates from "../../components/Profile/SignCertificates";
import ReprintCertificates from "./ReprintRequestedCertificate";
import ReprintRequestedView from "../../components/Profile/ReprintRequestedView";
import RequestCertificate from "./RequestCertificate";

const Certificates = () => {
  let user =
    JSON.parse(localStorage.getItem("certificate-automation-authority")) ||
    JSON.parse(sessionStorage.getItem("certificate-automation-authority"));
  return (
    <div className="main-certificates-continer">
      <div style={{ marginTop: 150 }} />
      <Switch>
        <PrivateRoute
          path="/certificates/requested-list/:id/preview"
          component={SignCertificates}
        />
        <PrivateRoute
          path="/certificates/requested-list/:id"
          component={Profile}
        />
        <PrivateRoute
          path="/certificates/signed-list/:id/preview"
          component={SignCertificates}
        />
        <PrivateRoute
          path="/certificates/signed-list/:id"
          component={SignedView}
        />

        <PrivateRoute
          path="/certificates/to-be-signed-list/:id/sign"
          component={SignCertificates}
        />
        <PrivateRoute
          path="/certificates/to-be-signed-list/:id/preview"
          component={SignCertificates}
        />

        <PrivateRoute
          path="/certificates/to-be-signed-list/:id"
          component={ToBeSignedView}
        />

        <PrivateRoute
          path="/certificates/send-to-print-list/:id"
          component={ApprovedListView}
        />

        <PrivateRoute
          path="/certificates/rejected-list/:id"
          component={RejectedCertificatesView}
        />

        <PrivateRoute
          path="/certificates/printed-list/:id"
          component={PrintedCertificatesView}
        />

        <PrivateRoute
          path="/certificates/reprint-request-list/:id"
          component={ReprintRequestedView}
        />

        <Route
          exact
          path="/certificates/requested-list"
          component={RequestedCertificates}
        />
        <Route
          exact
          path="/certificates/to-be-signed-list"
          component={ToBeSignedList}
        />
        <Route
          exact
          path="/certificates/signed-list"
          component={SignedCertificates}
        />
        <Route
          exact
          path="/certificates/send-to-print-list"
          component={ApprovedList}
        />
        <Route
          exact
          path="/certificates/rejected-list"
          component={RejectedCertificates}
        />

        <Route
          exact
          path="/certificates/printed-list"
          component={PrintedCertificates}
        />

        <Route
          exact
          path="/certificates/reprint-request-list"
          component={ReprintCertificates}
        />
        <Route
          exact
          path="/certificates/request-certificate/:id?"
          component={RequestCertificate}
        />

        {user && user.certificates ? (
          user.certificates.map((module, index) => (
            <Route
              exact
              path="/certificates"
              render={() => <Redirect to={module.module_url} />}
              key={index}
            />
          ))
        ) : (
          <Route
            exact
            path="/certificates"
            render={() => <Redirect to="/certificates/requested-list" />}
          />
        )}

        <Route component={Exception} />
      </Switch>
    </div>
  );
};

export default Certificates;

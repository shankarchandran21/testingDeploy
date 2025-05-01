import { Route, BrowserRouter as Router, Switch } from "react-router-dom";
import React from "react";

import PrivateRoute from "./components/PrivateRoute/PrivateRoute";
import BasicLayout from "./layout/BasicLayout";
import UserLayout from "./layout/UserLayout";
import Exception from "./components/Exception/Exception";
import Master from "./pages/Master/Master";

//routing is added
//Userlayout - layout for login, forgot password etc
//Basiclayout - layout for inner pages
//Exception - suppose no routes are matching then will show the exception page.

const App = () => {
  return (
    <Router>
      <Switch>
        <PrivateRoute exact path="/" component={BasicLayout}  />
        <PrivateRoute path="/dashboard" component={BasicLayout} />
        <PrivateRoute path="/reports" component={BasicLayout} />
        <PrivateRoute path="/certificates" component={BasicLayout} />
        <PrivateRoute path="/master" component={BasicLayout} />
        <PrivateRoute path="/settings" component={BasicLayout} />
        <PrivateRoute path="/help" component={BasicLayout} />
        <Route path="/user" component={UserLayout} />
        <Route path="/exception" component={Exception} />
        <Route component={Exception} />
      </Switch>
    </Router>
  );
};

export default App;

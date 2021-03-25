import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { BrowserRouter,Route,Switch } from "react-router-dom";
import Register from "./Screens/Register";
import Login from "./Screens/Login";
import Forget from "./Screens/Forget";
import Activate from "./Screens/Activate";
import Reset from "./Screens/Reset";

import "react-toastify/dist/ReactToastify.css";


ReactDOM.render(
    <BrowserRouter>
      <Switch>
        <Route path="/" exact render={props => <App {...props} />}/>
        <Route path="/register" exact render={props => <Register {...props} />}/>
        <Route path="/login" exact render={props => <Login {...props} />} />
        <Route path="/users/activate/:token" exact render={props => <Activate {...props} />} />
        <Route path="/users/password/forget" exact render={props => <Forget {...props} />} />
        <Route path="/users/password/reset/:token" exact render={props => <Reset {...props} />} />
      </Switch>
    </BrowserRouter>,
  document.getElementById("root")
);
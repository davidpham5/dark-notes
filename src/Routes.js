import React from "react";
import { Route, Switch } from "react-router-dom";

import NotFound from "./components/404";
import AuthRoute from "./components/AuthRoute";
import UnAuthRoute from "./components/UnAuthRoute";
import Home from "./components/Home";
import Login from "./components/Login";
import AddNote from "./components/Notes/AddNote";
import Notes from "./components/Notes/Notes";
import { RouteProvider } from "./components/RoutesProvider";
import Settings from './components/Settings';
import Signup from "./components/SignUp";

export default function Routes() {
  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <UnAuthRoute exact path="/login">
        <Login />
      </UnAuthRoute>
      <UnAuthRoute exact path="/signup">
        <Signup />
      </UnAuthRoute>

      <AuthRoute exact path="/notes/:id">
        <Notes />
      </AuthRoute>
      <AuthRoute exact path="/note/new">
        <AddNote />
      </AuthRoute>
      <AuthRoute exact path="/settings">
        <Settings />
      </AuthRoute>
    </Switch>
  );
}

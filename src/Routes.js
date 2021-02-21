import React from "react";
import { Route, Switch } from "react-router-dom";
import { RouteProvider } from "./components/RoutesProvider";
import AuthRoute from "./components/AuthRoute";
import UnAuthRoute from "./components/UnAuthRoute";

import Home from "./components/Home";
import NotFound from "./components/404";
import Login from "./components/Login";
import Signup from "./components/SignUp";
import AddNote from "./components/Notes/AddNote";
import Notes from "./components/Notes/Notes";

// export default ({ bindings }) => {
//   return (
//     <Switch>
//       <RouteProvider path="/" exact component={Home} props={bindings} />
//       <UnAuthRoute path="/login" exact component={Login} props={bindings} />
//       <UnAuthRoute path="/signup" exact component={Signup} props={bindings} />
//       <AuthRoute path="/notes/new" exact component={AddNote} props={bindings} />
//       <AuthRoute path="/notes/:id" exact component={Notes} props={bindings} />
//       {/* Finally, catch all unmatched routes */}
//       <Route component={NotFound} />
//     </Switch>
//   );
// };

export default function Routes() {
  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route exact path="/login">
        <Login />
      </Route>
      <Route exact path="/signup">
        <Signup />
      </Route>

      <Route exact path="/notes/new">
      <AddNote />
    </Route>

    </Switch>
  );
}

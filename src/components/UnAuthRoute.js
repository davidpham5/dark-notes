import React from "react";
import { Route, Redirect } from "react-router-dom";

function querystring(name, url = window.location.href) {
  name = name.replace(/[[]]/g, "\\$&");

  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)", "i");
  const results = regex.exec(url);

  if (!results) {
    return null;
  }
  if (!results[2]) {
    return "";
  }

  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function UnAuthRoute({ component: Comp, props: bindings, ...rest }) {
  const redirect = querystring("redirect");
  function notAuth(props) {
    return !bindings.isAuthenticated ? (
      <Comp {...props} {...bindings} />
    ) : (
      <Redirect to={redirect === "" || redirect === null ? "/" : redirect} />
    );
  }
  return <Route {...rest} render={notAuth} />;
}

export default UnAuthRoute;

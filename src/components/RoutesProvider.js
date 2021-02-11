import React from "react";
import { Route } from "react-router-dom";

function RouteProvider({ component: Component, props: bindings, ...rest }) {
  const childComponent = (props) => {
    return <Component {...props} {...bindings} />;
  };

  return <Route {...rest} render={childComponent} />;
}

export { RouteProvider };

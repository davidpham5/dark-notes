import React from "react";
import { Route } from "react-router-dom";

function RouteProvider({ component: Component, props: bindings, path }) {
  return <Route path={path} element={<Component {...bindings} />} />;
}

export { RouteProvider };

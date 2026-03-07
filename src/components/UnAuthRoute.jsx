import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppContext } from "../libs/contextLib";

function querystring(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

export default function UnAuthRoute({ children }) {
  const { isAuthenticated } = useAppContext();
  const redirect = querystring("redirect");

  if (isAuthenticated) {
    return <Navigate to={redirect || "/"} replace />;
  }

  return children;
}

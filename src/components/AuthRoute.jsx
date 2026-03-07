import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppContext } from "../libs/contextLib";

function AuthRoute({ children }) {
  const { pathname, search } = useLocation();
  const { isAuthenticated } = useAppContext();

  if (!isAuthenticated) {
    return <Navigate to={`/login?redirect=${pathname}${search}`} replace />;
  }

  return children;
}

export default AuthRoute;

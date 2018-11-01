import React from 'react'
import { Route, Redirect } from 'react-router-dom'

function AuthRoute ({component: Component, props: bindings, ...rest}) {
  const isAuth = (props) =>
    bindings.isAuthenticated
      ? <Component {...props} {...bindings} />
      : <Redirect to={`/login?redirect=${props.location.pathname} ${props.location.search}`} />

  return (
    <Route {...rest} render={isAuth} />
  )
}

export default AuthRoute

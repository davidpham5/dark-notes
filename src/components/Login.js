import React, { useState } from "react";
import { Auth } from "aws-amplify";

import "../styles/App.css";
import "../styles/Base.css";

function Login({ userHasAuthenticated }) {
  const [state, setState] = useState({
    email: "",
    password: "",
    message: "",
    isLoading: false,
  });

  function validateForm() {
    return state.email.length > 0 && state.password.length > 0;
  }

  function handleChange(event) {
    return setState({
      ...state,
      [event.target.id]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setState({ isLoading: true });

    try {
      await Auth.signIn(state.email, state.password);
      userHasAuthenticated(true);
    } catch (error) {
      setState({ message: error.message });
      setState({ isLoading: false });
    }
  }

  return (
    <div className="Login">
      <form onSubmit={handleSubmit}>
        {state.message ? <h3 className="alert">{state.message}</h3> : ""}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            className="p-2 mb-5"
            id="email"
            autoFocus
            type="email"
            value={state.email}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            className="p-2 mb-5"
            id="password"
            value={state.password}
            onChange={handleChange}
            type="password"
          />
        </div>
        <button
          className="btn btn-primary"
          // disabled={!validateForm()}
          type="submit"
        >
          Login
        </button>
      </form>
    </div>
  );
}

export default Login;

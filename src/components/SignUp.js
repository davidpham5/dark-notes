import React, { useState } from "react";
import {
  // HelpBlock,
  FormGroup,
  FormControl,
  // label,
} from "react-bootstrap";

import { Auth } from "aws-amplify";
import LoaderButton from "./Buttons/LoaderButton";

export default function Signup({ userHasAuthenticated, history }) {
  const [state, setState] = useState({
    isLoading: false,
    email: "",
    password: "",
    confirmPassword: "",
    confirmationCode: "",
    newUser: null,
  });

  function validateForm() {
    return (
      state.email.length > 0 &&
      state.password.length > 0 &&
      state.password === state.confirmPassword
    );
  }

  function validateConfirmationForm() {
    return state.confirmationCode.length > 0;
  }

  function handleChange(event) {
    setState({
      [event.target.id]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setState({ isLoading: true });

    try {
      const newUser = await Auth.signUp({
        username: state.email,
        password: state.password,
      });
      setState({
        newUser,
      });
    } catch (e) {
      alert(e.message);
    }

    setState({ isLoading: false });
  }

  async function handleConfirmationSubmit(event) {
    event.preventDefault();

    setState({ isLoading: true });

    try {
      await Auth.confirmSignUp(state.email, state.confirmationCode);
      await Auth.signIn(state.email, state.password);

      userHasAuthenticated(true);
      history.push("/");
    } catch (e) {
      alert(e.message);
      setState({ isLoading: false });
    }
  }

  function renderConfirmationForm() {
    return (
      <form onSubmit={handleConfirmationSubmit}>
        <FormGroup controlId="confirmationCode" bsSize="large">
          <label>Confirmation Code</label>
          <FormControl
            autoFocus
            type="tel"
            value={state.confirmationCode}
            onChange={handleChange}
          />
          <HelpBlock>Please check your email for the code.</HelpBlock>
        </FormGroup>
        <LoaderButton
          block
          bsSize="large"
          disabled={!validateConfirmationForm()}
          type="submit"
          isLoading={state.isLoading}
          text="Verify"
          loadingText="Verifying…"
          className="btn btn-primary"
        />
      </form>
    );
  }

  function renderForm() {
    return (
      <form onSubmit={handleSubmit}>
        <FormGroup controlId="email" bsSize="large">
          <label>Email</label>
          <FormControl
            className="p-2 mb-5"
            autoFocus
            type="email"
            value={state.email}
            onChange={handleChange}
          />
        </FormGroup>
        <FormGroup controlId="password" bsSize="large">
          <label>Password</label>
          <FormControl
            className="p-2 mb-5"
            value={state.password}
            onChange={handleChange}
            type="password"
          />
        </FormGroup>
        <FormGroup controlId="confirmPassword" bsSize="large">
          <label>Confirm Password</label>
          <FormControl
            className="p-2 mb-5"
            value={state.confirmPassword}
            onChange={handleChange}
            type="password"
          />
        </FormGroup>
        <LoaderButton
          block
          bsSize="large"
          disabled={!validateForm()}
          type="submit"
          isLoading={state.isLoading}
          text="Signup"
          loadingText="Signing up…"
          className="btn btn-primary"
        >
          Signup
        </LoaderButton>
      </form>
    );
  }

  return (
    <div className="Signup">
      {state.newUser === null ? renderForm() : renderConfirmationForm()}
    </div>
  );
}

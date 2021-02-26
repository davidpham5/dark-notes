import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import {useHistory} from 'react-router-dom';
import LoaderButton from "./Buttons/LoaderButton";
import { useAppContext } from '../libs/contextLib';
import { useFormFields } from '../libs/hooksLib'
import { onError } from '../libs/errorsLibs';

import { Auth } from "aws-amplify";

export default function Signup() {
  const [fields, handleFieldChange] = useFormFields({
    isLoading: false,
    email: "",
    password: "",
    confirmPassword: "",
    confirmationCode: ""
  });

  const history = useHistory();
  const [newUser, setNewUser] = useState(null);
  const {userHasAuthenticated} = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('')

  function validateForm() {
    return (
      fields.email.length > 0 &&
      fields.password.length > 0 &&
      fields.password === fields.confirmPassword
    );
  }

  function validateConfirmationForm() {
    return fields.confirmationCode.length > 0;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setError('')
    try {
      const newUser = await Auth.signUp({
        username: fields.email,
        password: fields.password,
      });
      setIsLoading(false);
      setNewUser(newUser)
    } catch (e) {
      onError(e.message);
      setError(e.message)
      setIsLoading(false)
    }
  }

  async function handleConfirmationSubmit(event) {
    event.preventDefault();

    setIsLoading(true);
    try {
      await Auth.confirmSignUp(fields.email, fields.confirmationCode);
      await Auth.signIn(fields.email, fields.password);

      userHasAuthenticated(true);
      history.push("/");
    } catch (e) {
      onError(e.message);
      /*
      TODO: handle user refreshes page on confirmation code view
      1. Check for the UsernameExistsException in the handleSubmit function’s catch block.
      2. Use the Auth.resendSignUp() method to resend the code if the user has not been previously confirmed. Here is a link to the Amplify API docs.
      3. Confirm the code just as we did before.
      https://serverless-stack.com/chapters/signup-with-aws-cognito.html
    */
      setIsLoading(false);
    }
  }

  function renderConfirmationForm() {
    return (
      <Form onSubmit={handleConfirmationSubmit}>
        <Form.Group controlId="confirmationCode" size="lg">
          <Form.Label>Confirmation Code</Form.Label>
          <Form.Control
            autoFocus
            className="p-2 mb-5"
            type="tel"
            value={fields.confirmationCode}
            onChange={handleFieldChange}
          />
          <Form.Text muted>Please check your email for the code.</Form.Text>
        </Form.Group>
        <LoaderButton
          block
          size="lg"
          disabled={!validateConfirmationForm()}
          type="submit"
          isLoading={isLoading}
          variant="success"
          className="btn btn-primary mt-5"
        >
        Verify</LoaderButton>
      </Form>
    );
  }

  function renderForm() {
    return (
      <form onSubmit={handleSubmit}>
        <Form.Text className="mb-5 text-red-500">{error}</Form.Text>
        <Form.Group controlId="email" size="lg">
          <Form.Label>Email</Form.Label>
          <Form.Control
            className="p-2 mb-5"
            autoFocus
            type="email"
            value={fields.email}
            onChange={handleFieldChange}
          />
        </Form.Group>
        <Form.Group controlId="password" size="lg">
          <Form.Label>Password</Form.Label>
          <Form.Control
            className="p-2 mb-5"
            value={fields.password}
            onChange={handleFieldChange}
            type="password"
          />
        </Form.Group>
        <Form.Group controlId="confirmPassword" size="lg">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            className="p-2 mb-5"
            value={fields.confirmPassword}
            onChange={handleFieldChange}
            type="password"
          />
        </Form.Group>
        <LoaderButton
          block
          size="lg"
          type="submit"
          variant="success"
          isLoading={isLoading}
          disabled={!validateForm()}
          >Signup</LoaderButton>
      </form>
    );
  }

  return (
    <div className="Signup">
    {newUser === null ? renderForm() : renderConfirmationForm()}
    </div>
  );
}

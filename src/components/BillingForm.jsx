import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import React, { useState } from "react";
import Form from "react-bootstrap/Form";
import { useFormFields } from "../libs/hooksLib";
import LoaderButton from "./Buttons/LoaderButton";

export default function BillingForm ({isLoading, onSubmit, ...props}) {
  const [fields, handleFieldChange] = useFormFields({
    name: "",
    storage: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCardComplete, setIsCardComplete] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  isLoading = isProcessing || isLoading;

  function validateForm() {
    return fields.name !== "" && fields.storage !== "" && isCardComplete;
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setIsProcessing(true);
    // Use elements.getElement to get a reference to the mounted Element.
    const cardElement = elements.getElement(CardElement);

    // Pass the Element directly to other Stripe.js methods:
    // e.g. createToken - https://stripe.com/docs/js/tokens_sources/create_token?type=cardElement
    const {token, error} = await stripe.createToken(cardElement);

    setIsProcessing(false);

    onSubmit(fields.storage, { token, error });
  }

  return (
    <Form onSubmit={handleSubmit} className="width-400 rounded overflow-hidden shadow-lg bg-gray-900 text-white p-5">
      <Form.Group controlId="storage" className="mb-6">
        <Form.Label>Storage</Form.Label>
        <Form.Control
          min="0"
          type="number"
          value={fields.storage}
          onChange={handleFieldChange}
          placeholder="Number of notes to store"
          className="p-3"
        />
      </Form.Group>

      <Form.Group controlId="name" className="mb-6">
        <Form.Label>Cardholder&apos;s name</Form.Label>
        <Form.Control
          type="text"
          value={fields.name}
          onChange={handleFieldChange}
          placeholder="Name on the card"
          className="p-3"
        />
      </Form.Group>
      <Form.Label>Credit Card Info</Form.Label>
      <CardElement
        className="card-field mb-6 p-3 text-white"
        onChange={(e) => setIsCardComplete(e.complete)}
        options={{
          iconStyle: 'solid',
          style: {
            base: {
              iconColor: '#c4f0ff',
              color: '#fff',
              fontSize: '16px',
            },
            invalid: {
              iconColor: '#FFC7EE',
              color: '#FFC7EE',
            },
          },
        }}
      />
      <LoaderButton
        block
        size="lg"
        type="submit"
        isLoading={isLoading}
        disabled={!validateForm()}
      >
        Purchase
      </LoaderButton>
    </Form>

  );
}
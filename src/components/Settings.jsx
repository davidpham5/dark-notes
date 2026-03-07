import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { post } from 'aws-amplify/api';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import BillingForm from "../components/BillingForm";
import config from '../config';
import { onError } from '../libs/errorsLibs';

export default function Settings () {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [stripe, setStripe] = useState(null);

  async function billUser(details) {
    console.log({details});
    const { body } = await post({
      apiName: "notes",
      path: "/billing",
      options: { body: details },
    }).response;
    return body.json();
  }

  useEffect(() => {
    // setStripe(window.Stripe(config.STRIPE_KEY));
  }, []);

  async function handleFormSubmit(storage, { token, error }) {
    if (error) {
      onError(error);
      return;
    }

    setIsLoading(true);

    try {
      await billUser({
        storage,
        source: token.id
      });

      alert("Your card has been charged successfully!");
      navigate("/");
    } catch (e) {
      onError(e);
      setIsLoading(false);
    }
  }
  const stripePromise = loadStripe(config.STRIPE_KEY); //test

  return (
    <div>
      <h1 className="text-2xl mb-4">Settings</h1>
      <Elements stripe={stripePromise}>
        <BillingForm isLoading={isLoading} onSubmit={handleFormSubmit} />
      </Elements>
    </div>
  )
}


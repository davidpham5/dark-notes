import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { API } from 'aws-amplify';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import BillingForm from "../components/BillingForm";
import config from '../config';
import { onError } from '../libs/errorsLibs';

export default function Settings () {
  const history = useHistory();
  const [isLoading, setIsLoading] = useState(false);
  const [stripe, setStripe] = useState(null);

  function billUser(details) {
    console.log({details});
    return API.post("notes", "/billing", {
      body: details
    });

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
      history.push("/");
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


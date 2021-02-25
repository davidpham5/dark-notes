export default {
  MAX_ATTACHMENT_SIZE: 5000000,
  s3: {
    REGION: "us-east-1",
    BUCKET: "dpham-notes-app-uploads",
  },
  apiGateway: {
    REGION: "us-east-1",
    URL: "https://4udlh2ihb8.execute-api.us-east-1.amazonaws.com/prod",
  },
  cognito: {
    REGION: "us-west-2",
    USER_POOL_ID: "us-west-2_bsIZ85FW1",
    APP_CLIENT_ID: "6ggrt8js84onh7ihj1mu2osenc",
    IDENTITY_POOL_ID: "us-west-2:7a008f7f-b917-4098-b3e6-293bfc5d9d4a",
  },
  STRIPE_KEY: process.env.REACT_APP_STRIPE_KEY
};

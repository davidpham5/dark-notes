export default {
  MAX_ATTACHMENT_SIZE: 5000000,
  s3: {
    REGION: import.meta.env.VITE_S3_REGION,
    BUCKET: import.meta.env.VITE_S3_BUCKET,
  },
  apiGateway: {
    REGION: import.meta.env.VITE_API_GATEWAY_REGION,
    URL: import.meta.env.VITE_API_GATEWAY_URL,
  },
  cognito: {
    REGION: import.meta.env.VITE_COGNITO_REGION,
    USER_POOL_ID: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    APP_CLIENT_ID: import.meta.env.VITE_COGNITO_APP_CLIENT_ID,
    IDENTITY_POOL_ID: import.meta.env.VITE_COGNITO_IDENTITY_POOL_ID,
  },
  STRIPE_KEY: import.meta.env.VITE_STRIPE_KEY,
};

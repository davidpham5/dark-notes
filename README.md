# Getting Started

Dark notes is serverless app. The API endpoints live in AWS apiGateway. Authentication leverages AWS Cognito. This repo is the frontend, React.

To start, at root
- `yarn install`
- 'yarn start`
In a separate bash window
- `yarn watch-css`

To deploy to serverless
- `cd serverless/API`
- `serverless deploy`
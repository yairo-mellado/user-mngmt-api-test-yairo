# User Management API Tests

This project contains automated API tests for a user management service using Jest, TypeScript, and Supertest.

## What this project covers

The test suite validates CRUD behavior for:

- `/dev/users`
- `/prod/users`

It checks:

- successful retrieval of users
- creation of new users
- fetching a specific user by email
- updating a user
- authorization behavior for delete requests

## Tech stack

- TypeScript
- Jest
- Supertest
- ts-jest

## Prerequisites

Make sure the API under test is running locally at:

- `http://localhost:3000`

## Installation

Run the following command in the project root:

```bash
npm install
```

## Running tests

Execute the test suite with:

```bash
npm test
```

This runs Jest with coverage enabled.

## Project structure

- `tests/dev.users.spec.ts` - API tests for the dev environment
- `tests/prod.users.spec.ts` - API tests for the prod environment
- `tests/helpers.ts` - shared base URL and auth token constants
- `jest.config.js` - Jest configuration for TypeScript support

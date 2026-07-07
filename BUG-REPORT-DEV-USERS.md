# Bug Report: DEV user management contract failures

- **Bug ID:** QA-DEV-001
- **Summary:** The DEV user management API does not consistently return the expected status codes for validation, not-found, and delete authorization scenarios.
- **Component:** User Management API - DEV
- **Environment:** Local API at `http://localhost:3000`
- **Severity:** High
- **Priority:** P1

## Preconditions

1. The DEV API is running locally.
2. The test suite can create and delete users through `/dev/users`.

## Steps to Reproduce

1. Create a user via `POST /dev/users`.
2. Submit a duplicate create request with the same email.
3. Request a user that does not exist using `GET /dev/users/{email}`.
4. Send an unauthenticated `DELETE /dev/users/{email}` request.
5. Send an authenticated `DELETE /dev/users/{email}` request with a valid token.

## Actual Result

- Duplicate email creation returned **500 Internal Server Error** instead of **409 Conflict**.
- Fetching a missing user returned **500 Internal Server Error** instead of **404 Not Found**.
- Unauthenticated delete returned **204 No Content** instead of **401 Unauthorized**.
- Authenticated delete returned **404 Not Found** instead of **204 No Content**.

## Expected Result

- Duplicate email should return **409 Conflict** with an error payload.
- Missing users should return **404 Not Found** with an error payload.
- Unauthenticated delete should return **401 Unauthorized**.
- Authenticated delete should return **204 No Content** after successful deletion.

## Test Coverage

- `tests/dev.users.spec.ts`
- `tests/user-management.contract.ts`
  - `POST /users should reject duplicate email`
  - `GET /users/{email} should return 404 for an unknown user`
  - `DELETE /users/{email} should require auth`
  - `DELETE /users/{email} with token should delete user`

## Details

- The latest review confirmed that DEV is failing multiple contract expectations beyond the original delete flow.
- These issues suggest missing or incorrect handling for validation errors, missing-resource errors, and delete authorization.

## Notes

- The defects appear to be related to route-level validation, error handling, and authentication middleware for the DEV environment.
- The behavior should be aligned with the OpenAPI contract and the shared user-management test scenarios.

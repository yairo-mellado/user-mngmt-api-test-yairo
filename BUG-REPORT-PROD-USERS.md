# Bug Report: PROD user management contract failures

- **Bug ID:** QA-PROD-001
- **Summary:** The PROD user management API does not consistently return the expected status codes for duplicate-user, missing-user, and delete authorization scenarios.
- **Component:** User Management API - PROD
- **Environment:** Local API at `http://localhost:3000`
- **Severity:** Major
- **Priority:** P2

## Preconditions

1. The PROD API is running locally.
2. The test suite can create and delete users through `/prod/users`.

## Steps to Reproduce

1. Create a user via `POST /prod/users`.
2. Submit a duplicate create request with the same email.
3. Request a user that does not exist using `GET /prod/users/{email}`.
4. Send an authenticated `DELETE /prod/users/{email}` request with a valid token.

## Actual Result

- Duplicate email creation returned **500 Internal Server Error** instead of **409 Conflict**.
- Fetching a missing user returned **500 Internal Server Error** instead of **404 Not Found**.
- Authenticated delete returned **401 Unauthorized** instead of **204 No Content**.

## Expected Result

- Duplicate email should return **409 Conflict** with an error payload.
- Missing users should return **404 Not Found** with an error payload.
- Authenticated delete should return **204 No Content** after successful deletion.

## Test Coverage

- `tests/prod.users.spec.ts`
- `tests/user-management.contract.ts`
  - `POST /users should reject duplicate email`
  - `GET /users/{email} should return 404 for an unknown user`
  - `DELETE /users/{email} with token should delete user`

## Details

- The latest review showed that PROD is also failing multiple contract expectations beyond the earlier delete-auth issue.
- These behaviors indicate a broader implementation gap in error handling and authorization for the PROD environment.

## Notes

- The defects appear to be related to duplicate detection, missing-resource handling, and delete authorization for the PROD endpoint.
- The implementation should be aligned with the OpenAPI contract and the shared user-management regression tests.

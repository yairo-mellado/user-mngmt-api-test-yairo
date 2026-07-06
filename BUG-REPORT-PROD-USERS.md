# Bug Report: PROD DELETE /prod/users/{email}

- **Bug ID:** QA-PROD-001
- **Summary:** DELETE `/prod/users/{email}` incorrectly rejects authenticated requests with 401.
- **Component:** User Management API - PROD
- **Environment:** Local API at `http://localhost:3000`
- **Severity:** Major
- **Priority:** P2

## Preconditions

1. The PROD user management API is running locally.
2. The test user `lpotter@example.com` exists or is created by previous test setup.

## Steps to Reproduce

1. Send an authenticated DELETE request to `/prod/users/lpotter@example.com` using a valid authorization token.
2. Observe the response status code.

## Actual Result

- Authenticated DELETE returned **401 Unauthorized** instead of successfully deleting the user.

## Expected Result

- Authenticated DELETE should return **204 No Content** when the request is authorized and the resource is deleted.

## Test Coverage

- `tests/prod.users.spec.ts`
  - `DELETE /prod/users/{email} with token should delete user`

## Details

- Failure occurred in `tests/prod.users.spec.ts` at line 38.
- The assertion expects a successful delete response, but the API is rejecting the authorized request.

## Notes

- This defect indicates a problem in authorization handling for the PROD delete flow.
- Investigate token validation and route permissions for the `/prod/users/{email}` endpoint.

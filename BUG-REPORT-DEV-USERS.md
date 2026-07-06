# Bug Report: DEV DELETE /dev/users/{email}

- **Bug ID:** QA-DEV-001
- **Summary:** DELETE `/dev/users/{email}` does not enforce authentication and returns incorrect status codes.
- **Component:** User Management API - DEV
- **Environment:** Local API at `http://localhost:3000`
- **Severity:** High
- **Priority:** P1

## Preconditions

1. The DEV user management API is running locally.
2. The test user `lpotter@example.com` exists or is created by previous test setup.

## Steps to Reproduce

1. Send an unauthenticated DELETE request to `/dev/users/lpotter@example.com`.
2. Observe the response status code.
3. Send an authenticated DELETE request to `/dev/users/lpotter@example.com` using a valid authorization token.
4. Observe the response status code.

## Actual Result

- Unauthenticated DELETE returned **204 No Content** instead of rejecting the request.
- Authenticated DELETE returned **404 Not Found** instead of successfully deleting the user.

## Expected Result

- Unauthenticated DELETE should return **401 Unauthorized**.
- Authenticated DELETE should return **204 No Content** after successfully deleting the user.

## Test Coverage

- `tests/dev.users.spec.ts`
  - `DELETE /dev/users/{email} should require auth`
  - `DELETE /dev/users/{email} with token should delete user`

## Details

- Failure occurred in `tests/dev.users.spec.ts` at lines 33 and 38.
- The test assertion failures show mismatched status codes for both unauthorized and authorized delete flows.

## Notes

- The two defects are related to route authorization and delete behavior for the DEV endpoint.
- The root cause may be missing auth middleware for unauthenticated requests or incorrect resource handling when the request is authorized.

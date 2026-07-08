# Bug Report: DEV user management contract failures

- **Bug ID:** QA-DEV-001
- **Summary:** The DEV user management API does not consistently return the expected status codes for validation, not-found, duplicate-email, and delete authorization scenarios.
- **Component:** User Management API - DEV
- **Environment:** Local API at `http://localhost:3000`
- **Severity:** High
- **Priority:** P1

## Preconditions

1. The DEV API is running locally.
2. The test suite can create and delete users through `/dev/users`.

## Steps to Reproduce

1. Create a user via `POST /dev/users` using a payload such as:
   ```json
   {"name":"Test User","email":"seed-dev@example.com","age":30}
   ```
2. Submit a duplicate create request with the same email:
   ```json
   {"name":"Test User","email":"seed-dev@example.com","age":30}
   ```
3. Request a user that does not exist using `GET /dev/users/missing-dev@example.com`.
4. Send invalid payloads for create/update, for example:
   ```json
   {"name":"Bad Email","email":"not-an-email","age":30}
   ```
   and
   ```json
   {"name":"Boundary User","email":"boundary-dev@example.com","age":151}
   ```
5. Send an unauthenticated `DELETE /dev/users/seed-dev@example.com` request.
6. Send an authenticated `DELETE /dev/users/seed-dev@example.com` request with the header:
   ```http
   Authorization: Bearer mysecrettoken
   ```

## Actual Result

- Duplicate email creation returned **500 Internal Server Error** instead of **409 Conflict**.
- Fetching a missing user returned **500 Internal Server Error** instead of **404 Not Found**.
- Invalid payloads such as missing required fields and malformed emails were accepted as **201 Created** instead of being rejected with **400 Bad Request**.
- Unauthenticated delete returned **204 No Content** instead of **401 Unauthorized**.
- Authenticated delete returned **404 Not Found** instead of **204 No Content**.

## Expected Result

- Duplicate email should return **409 Conflict** with an error payload.
- Missing users should return **404 Not Found** with an error payload.
- Invalid create/update payloads should return **400 Bad Request**.
- Unauthenticated delete should return **401 Unauthorized**.
- Authenticated delete should return **204 No Content** after successful deletion.

## Test Coverage

- `tests/dev.users.spec.ts`
- `tests/user-management.contract.ts`
  - `POST /users should reject invalid email formats and missing required fields`
  - `POST /users should reject duplicate email`
  - `GET /users/{email} should return 404 for an unknown user`
  - `DELETE /users/{email] should require auth`
  - `DELETE /users/{email} with token should delete user`

## Details

- The latest review confirmed that DEV is failing multiple contract expectations beyond the original delete flow.
- The new boundary-validation scenarios exposed that invalid input is not being rejected consistently, and that missing-resource and duplicate-email errors are not being mapped to the expected HTTP statuses.
- Sample data used in validation runs included `seed-dev@example.com`, `boundary-dev@example.com`, and `missing-dev@example.com`.

## Notes

- The defects appear to be related to route-level validation, error handling, and authentication middleware for the DEV environment.
- The behavior should be aligned with the OpenAPI contract and the shared user-management regression scenarios.

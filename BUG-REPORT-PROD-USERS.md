# Bug Report: PROD user management contract failures

- **Bug ID:** QA-PROD-001
- **Summary:** The PROD user management API does not consistently return the expected status codes for validation, not-found, duplicate-email, and delete authorization scenarios.
- **Component:** User Management API - PROD
- **Environment:** Local API at `http://localhost:3000`
- **Severity:** Major
- **Priority:** P2

## Preconditions

1. The PROD API is running locally.
2. The test suite can create and delete users through `/prod/users`.

## Steps to Reproduce

1. Create a user via `POST /prod/users` using a payload such as:
   ```json
   {"name":"Test User","email":"seed-prod@example.com","age":30}
   ```
2. Submit a duplicate create request with the same email:
   ```json
   {"name":"Test User","email":"seed-prod@example.com","age":30}
   ```
3. Request a user that does not exist using `GET /prod/users/missing-prod@example.com`.
4. Send invalid payloads for create/update, for example:
   ```json
   {"name":"Bad Email","email":"not-an-email","age":30}
   ```
   and
   ```json
   {"name":"Boundary User","email":"boundary-prod@example.com","age":151}
   ```
5. Send an authenticated `DELETE /prod/users/seed-prod@example.com` request with the header:
   ```http
   Authorization: Bearer mysecrettoken
   ```

## Actual Result

- Duplicate email creation returned **500 Internal Server Error** instead of **409 Conflict**.
- Fetching a missing user returned **500 Internal Server Error** instead of **404 Not Found**.
- Invalid payloads such as missing required fields and malformed emails were accepted as **201 Created** instead of being rejected with **400 Bad Request**.
- Authenticated delete returned **401 Unauthorized** instead of **204 No Content**.

## Expected Result

- Duplicate email should return **409 Conflict** with an error payload.
- Missing users should return **404 Not Found** with an error payload.
- Invalid create/update payloads should return **400 Bad Request**.
- Authenticated delete should return **204 No Content** after successful deletion.

## Test Coverage

- `tests/prod.users.spec.ts`
- `tests/user-management.contract.ts`
  - `POST /users should reject invalid email formats and missing required fields`
  - `POST /users should reject duplicate email`
  - `GET /users/{email} should return 404 for an unknown user`
  - `DELETE /users/{email} with token should delete user`

## Test Data / Sample Payloads Used

- Duplicate-email scenario: `{"name":"Test User","email":"seed-prod@example.com","age":30}` submitted twice.
- Missing-user scenario: `GET /prod/users/missing-prod@example.com`.
- Invalid create payload samples:
  - `{"name":"No Email","age":30}`
  - `{"name":"Bad Email","email":"not-an-email","age":30}`
  - `{"email":"missing-name-prod@example.com","age":30}`
  - `{"name":"Missing Age","email":"missing-age-prod@example.com"}`
- Boundary-validation samples: age values `0`, `151`, `-1`, `12.5`, and `"30"`.
- Delete-auth sample: authenticated delete against `delete-auth-<timestamp>@example.com`.

## Latest Validation Evidence

- The latest `npm test` run reported 2 failed suites, 11 failed tests, and 25 passed tests.
- The failures were concentrated in validation, duplicate-email handling, missing-resource handling, and delete authorization behavior for PROD.

## Details

- The latest review showed that PROD is also failing multiple contract expectations beyond the earlier delete-auth issue.
- The new boundary-validation scenarios exposed that invalid input is not being rejected consistently, and that missing-resource and duplicate-email errors are not being mapped to the expected HTTP statuses.
- Sample data used in validation runs included `seed-prod@example.com`, `boundary-prod@example.com`, and `missing-prod@example.com`.

## Notes

- The defects appear to be related to duplicate detection, missing-resource handling, validation logic, and delete authorization for the PROD endpoint.
- The implementation should be aligned with the OpenAPI contract and the shared user-management regression tests.

import request from "supertest";
import { BASE_URL, TOKEN } from "./helpers";

type EnvironmentConfig = {
  label: string;
  prefix: string;
};

export function testUserManagementApi({ label, prefix }: EnvironmentConfig) {
  describe(`User Management API - ${label}`, () => {
    const basePath = `${prefix}/users`;
    const seedEmail = `seed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
    const createEmail = `create-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`;
    let seededUser: { name: string; email: string; age: number };

    const buildUser = (email: string) => ({
      name: "Test User",
      email,
      age: 30,
    });

    beforeAll(async () => {
      const res = await request(BASE_URL).post(basePath).send(buildUser(seedEmail));
      expect(res.status).toBe(201);
      seededUser = res.body;
    });

    it("GET /users should return an array", async () => {
      const res = await request(BASE_URL).get(basePath);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
    });

    it("POST /users should create a user", async () => {
      const newUser = buildUser(createEmail);
      const res = await request(BASE_URL).post(basePath).send(newUser);
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject({
        name: newUser.name,
        email: newUser.email,
        age: newUser.age,
      });
    });

    it("POST /users should create a user with boundary age values", async () => {
      const boundaryCases = [1, 150];
      for (const age of boundaryCases) {
        const email = `boundary-${age}-${Date.now()}@example.com`;
        const res = await request(BASE_URL).post(basePath).send({
          name: "Boundary User",
          email,
          age,
        });
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject({ name: "Boundary User", email, age });
      }
    });

    it("POST /users should reject invalid age boundaries and invalid types", async () => {
      const invalidPayloads = [
        { name: "Invalid Age", email: `invalid-age-${Date.now()}@example.com`, age: 0 },
        { name: "Invalid Age", email: `invalid-age-${Date.now()}@example.com`, age: 151 },
        { name: "Invalid Age", email: `invalid-age-${Date.now()}@example.com`, age: -1 },
        { name: "Invalid Age", email: `invalid-age-${Date.now()}@example.com`, age: 12.5 },
        { name: "Invalid Age", email: `invalid-age-${Date.now()}@example.com`, age: "30" },
      ];

      for (const payload of invalidPayloads) {
        const res = await request(BASE_URL).post(basePath).send(payload);
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      }
    });

    it("POST /users should reject invalid email formats and missing required fields", async () => {
      const invalidPayloads = [
        { name: "No Email", age: 30 },
        { name: "Bad Email", email: "not-an-email", age: 30 },
        { email: `missing-name-${Date.now()}@example.com`, age: 30 },
        { name: "Missing Age", email: `missing-age-${Date.now()}@example.com` },
      ];

      for (const payload of invalidPayloads) {
        const res = await request(BASE_URL).post(basePath).send(payload);
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      }
    });

    it("POST /users should ignore unknown extra fields or reject them consistently", async () => {
      const res = await request(BASE_URL).post(basePath).send({
        name: "Extra Field User",
        email: `extra-${Date.now()}@example.com`,
        age: 29,
        role: "admin",
      });

      expect([200, 201, 400]).toContain(res.status);
      if (res.status !== 400) {
        expect(res.body).toMatchObject({ name: "Extra Field User", email: expect.any(String), age: 29 });
      }
    });

    it("POST /users should reject duplicate email", async () => {
      const res = await request(BASE_URL).post(basePath).send(buildUser(seededUser.email));
      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty("error");
    });

    it("GET /users/{email} should return an existing user", async () => {
      const res = await request(BASE_URL).get(`${basePath}/${seededUser.email}`);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        name: seededUser.name,
        email: seededUser.email,
        age: seededUser.age,
      });
    });

    it("GET /users/{email} should return 404 for an unknown user", async () => {
      const missingEmail = `missing-${Date.now()}@example.com`;
      const res = await request(BASE_URL).get(`${basePath}/${missingEmail}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("PUT /users/{email} should update a user", async () => {
      const updatedUser = { ...seededUser, age: 31 };
      const res = await request(BASE_URL).put(`${basePath}/${seededUser.email}`).send(updatedUser);
      expect(res.status).toBe(200);
      expect(res.body).toMatchObject(updatedUser);
    });

    it("PUT /users/{email} should reject invalid request payload", async () => {
      const res = await request(BASE_URL).put(`${basePath}/${seededUser.email}`).send({
        name: "",
        email: "bad-email",
        age: 0,
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
    });

    it("PUT /users/{email} should reject age boundaries and invalid types", async () => {
      const invalidPayloads = [
        { name: "Boundary Update", email: seededUser.email, age: 0 },
        { name: "Boundary Update", email: seededUser.email, age: 151 },
        { name: "Boundary Update", email: seededUser.email, age: -1 },
        { name: "Boundary Update", email: seededUser.email, age: 12.5 },
        { name: "Boundary Update", email: seededUser.email, age: "31" },
      ];

      for (const payload of invalidPayloads) {
        const res = await request(BASE_URL).put(`${basePath}/${seededUser.email}`).send(payload);
        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty("error");
      }
    });

    it("PUT /users/{email} should reject duplicate email on update", async () => {
      const duplicateEmail = `duplicate-${Date.now()}@example.com`;
      const firstCreate = await request(BASE_URL).post(basePath).send(buildUser(duplicateEmail));
      expect(firstCreate.status).toBe(201);

      const res = await request(BASE_URL).put(`${basePath}/${seededUser.email}`).send({
        ...seededUser,
        email: duplicateEmail,
      });
      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty("error");
    });

    it("PUT /users/{email} should return 404 for an unknown user", async () => {
      const missingEmail = `missing-${Date.now()}@example.com`;
      const res = await request(BASE_URL).put(`${basePath}/${missingEmail}`).send(buildUser(missingEmail));
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("DELETE /users/{email} should require auth", async () => {
      const res = await request(BASE_URL).delete(`${basePath}/${seededUser.email}`);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
    });

    it("DELETE /users/{email} should return 404 for an unknown user when authenticated", async () => {
      const missingEmail = `missing-${Date.now()}@example.com`;
      const res = await request(BASE_URL).delete(`${basePath}/${missingEmail}`).set("Authorization", `Bearer ${TOKEN}`);
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
    });

    it("DELETE /users/{email} with token should delete user", async () => {
      const res = await request(BASE_URL).delete(`${basePath}/${seededUser.email}`).set("Authorization", `Bearer ${TOKEN}`);
      expect(res.status).toBe(204);
    });

    it("should support a create-read-delete lifecycle for a user", async () => {
      const lifecycleEmail = `lifecycle-${Date.now()}@example.com`;
      const createRes = await request(BASE_URL).post(basePath).send(buildUser(lifecycleEmail));
      expect(createRes.status).toBe(201);

      const readRes = await request(BASE_URL).get(`${basePath}/${lifecycleEmail}`);
      expect(readRes.status).toBe(200);
      expect(readRes.body.email).toBe(lifecycleEmail);

      const deleteRes = await request(BASE_URL).delete(`${basePath}/${lifecycleEmail}`).set("Authorization", `Bearer ${TOKEN}`);
      expect(deleteRes.status).toBe(204);

      const finalGetRes = await request(BASE_URL).get(`${basePath}/${lifecycleEmail}`);
      expect(finalGetRes.status).toBe(404);
    });
  });
}

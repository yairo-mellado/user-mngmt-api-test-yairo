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

    it("POST /users should reject invalid request payload", async () => {
      const res = await request(BASE_URL).post(basePath).send({
        name: "",
        email: "not-an-email",
        age: 0,
      });
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
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
  });
}

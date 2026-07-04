import request from "supertest";
import { BASE_URL, TOKEN } from "./helpers";

describe("User Management API - PROD", () => {
  it("GET /prod/users should return array", async () => {
    const res = await request(BASE_URL).get("/prod/users");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it("POST /prod/users should create user", async () => {
    const newUser = { name: "Larry Potter", email: "lpotter@example.com", age: 30 };
    const res = await request(BASE_URL).post("/prod/users").send(newUser);
    expect(res.status).toBe(201);
    expect(res.body.email).toBe(newUser.email);
  });

  it("GET /prod/users/{email} should return user", async () => {
    const res = await request(BASE_URL).get("/prod/users/lpotter@example.com");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Larry Potter");
  });

  it("PUT /prod/users/{email} should update user", async () => {
    const updatedUser = { name: "Larry Potter", email: "lpotter@example.com", age: 31 };
    const res = await request(BASE_URL).put("/prod/users/lpotter@example.com").send(updatedUser);
    expect(res.status).toBe(200);
    expect(res.body.age).toBe(31);
  });

  it("DELETE /prod/users/{email} should require auth", async () => {
    const res = await request(BASE_URL).delete("/prod/users/lpotter@example.com");
    expect(res.status).toBe(401);
  });

  it("DELETE /prod/users/{email} with token should delete user", async () => {
    const res = await request(BASE_URL).delete("/prod/users/lpotter@example.com").set("Authorization", `Bearer ${TOKEN}`);
    expect(res.status).toBe(204);
  });
});

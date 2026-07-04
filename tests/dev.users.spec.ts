import request from "supertest";
import { BASE_URL, TOKEN } from "./helpers";

describe("User Management API - DEV", () => {
  it("GET /dev/users should return array", async () => {
    const res = await request(BASE_URL).get("/dev/users");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it("POST /dev/users should create user", async () => {
    const newUser = { name: "Larry Potter", email: "lpotter@example.com", age: 30 };
    const res = await request(BASE_URL).post("/dev/users").send(newUser);
    expect(res.status).toBe(201);
    expect(res.body.email).toBe(newUser.email);
  });

  it("GET /dev/users/{email} should return user", async () => {
    const res = await request(BASE_URL).get("/dev/users/lpotter@example.com");
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Larry Potter");
  });

  it("PUT /dev/users/{email} should update user", async () => {
    const updatedUser = { name: "Larry Potter", email: "lpotter@example.com", age: 31 };
    const res = await request(BASE_URL).put("/dev/users/lpotter@example.com").send(updatedUser);
    expect(res.status).toBe(200);
    expect(res.body.age).toBe(31);
  });

  it("DELETE /dev/users/{email} should require auth", async () => {
    const res = await request(BASE_URL).delete("/dev/users/lpotter@example.com");
    expect(res.status).toBe(401);
  });

  it("DELETE /dev/users/{email} with token should delete user", async () => {
    const res = await request(BASE_URL).delete("/dev/users/lpotter@example.com").set("Authorization", `Bearer ${TOKEN}`);
    expect(res.status).toBe(204);
  });
});

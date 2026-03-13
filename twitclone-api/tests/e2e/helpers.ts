import supertest from "supertest";

const BASE_URL = process.env.API_TEST_URL || "http://localhost:3000";

export const request = supertest(BASE_URL);

export async function signUp(name: string, email: string, password: string) {
  return request
    .post("/api/auth/sign-up/email")
    .send({ name, email, password })
    .set("Content-Type", "application/json");
}

export async function signIn(email: string, password: string) {
  const res = await request
    .post("/api/auth/sign-in/email")
    .send({ email, password })
    .set("Content-Type", "application/json");

  const cookies = res.headers["set-cookie"];
  return {
    response: res,
    cookies: Array.isArray(cookies) ? cookies : cookies ? [cookies] : [],
    token: res.body?.token,
    userId: res.body?.user?.id,
  };
}

export function authHeader(cookies: string[]) {
  return { Cookie: cookies.join("; ") };
}

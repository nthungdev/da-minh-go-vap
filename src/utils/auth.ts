const AUTH_USER = process.env.AUTH_USER;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD;

if (!AUTH_USER || !AUTH_PASSWORD) {
  throw new Error("Missing BASIC_AUTH_USER or BASIC_AUTH_PASSWORD");
}

/**
 * @returns true if passes verification, else false
 */
export function verifyHttpBasicAuth(authorizationHeader: string) {
  // Expected format: "Basic base64encoded(user:pass)"
  const expectedAuth =
    "Basic " + Buffer.from(`${AUTH_USER}:${AUTH_PASSWORD}`).toString("base64");

  return authorizationHeader === expectedAuth;
}

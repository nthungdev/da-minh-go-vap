import "server-only";

const BASIC_AUTH_ENABLED = process.env.BASIC_AUTH_ENABLED === "true";
const AUTH_USER = process.env.AUTH_USER;
const AUTH_PASSWORD = process.env.AUTH_PASSWORD;

/**
 * @returns true if basic auth is disabled or the header matches configured credentials, else false
 */
export function verifyHttpBasicAuth(authorizationHeader: string) {
  if (!BASIC_AUTH_ENABLED) {
    return true;
  }

  if (!(AUTH_USER && AUTH_PASSWORD)) {
    return false;
  }

  // Expected format: "Basic base64encoded(user:pass)"
  const expectedAuth = `Basic ${Buffer.from(`${AUTH_USER}:${AUTH_PASSWORD}`).toString("base64")}`;

  return authorizationHeader === expectedAuth;
}

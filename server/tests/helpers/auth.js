import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret-key-for-testing-only-do-not-use-in-production"

/**
 * Generate a valid admin JWT token for use in test Authorization headers.
 * @param {object} overrides - override default token payload fields
 * @returns {string} signed JWT
 */
export function makeAdminToken(overrides = {}) {
  const payload = {
    id: "admin-test-id-001",
    email: "admin@cookersdelight.com",
    role: "admin",
    ...overrides,
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" })
}

/**
 * Generate a valid customer JWT token for use in test Authorization headers.
 * @param {object} overrides - override default token payload fields
 * @returns {string} signed JWT
 */
export function makeCustomerToken(overrides = {}) {
  const payload = {
    id: "customer-test-id-001",
    email: "customer@test.com",
    role: "customer",
    ...overrides,
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" })
}

/**
 * Generate an expired JWT token for expiry tests.
 */
export function makeExpiredToken(role = "admin") {
  const payload = { id: "expired-user-id", email: "expired@test.com", role }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "0s" })
}

/**
 * Generate a token signed with a wrong secret (tampered signature).
 */
export function makeTamperedToken(role = "admin") {
  const payload = { id: "tampered-id", email: "hacker@evil.com", role }
  return jwt.sign(payload, "wrong-secret-totally-invalid", { expiresIn: "1h" })
}

/**
 * Return the Authorization header object for use in supertest .set()
 */
export function adminAuthHeader(overrides = {}) {
  return { Authorization: `Bearer ${makeAdminToken(overrides)}` }
}

export function customerAuthHeader(overrides = {}) {
  return { Authorization: `Bearer ${makeCustomerToken(overrides)}` }
}

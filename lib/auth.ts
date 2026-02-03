/**
 * Simple authentication helpers
 */

/**
 * Verify scan authorization
 * Checks for a simple password or API key in the request
 */
export function verifyScanAuth(authHeader: string | null): boolean {
  const scanPassword = process.env.SCAN_PASSWORD;

  // If no password is set, allow access (backward compatible)
  if (!scanPassword) {
    return true;
  }

  // Check if authorization header matches
  if (authHeader === `Bearer ${scanPassword}`) {
    return true;
  }

  return false;
}

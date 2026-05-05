/**
 * Food Log OAuth function — exchanges authorization codes for tokens, and
 * refreshes expired access tokens using a refresh_token.
 *
 * Endpoint: POST /food-oauth (single endpoint, dispatched by `grant_type` in body)
 *
 * Body for initial code exchange:
 *   { "grant_type": "authorization_code", "code": "<auth code from Google>" }
 *
 * Body for refresh:
 *   { "grant_type": "refresh_token", "refresh_token": "<the refresh token>" }
 *
 * Returns: tokens JSON from Google.
 *   - For "authorization_code": full tokens including refresh_token.
 *   - For "refresh_token": new access_token (Google may not include a new refresh_token,
 *     so we echo back the one the caller sent).
 *
 * Environment variables:
 *   GOOGLE_CLIENT_ID
 *   GOOGLE_CLIENT_SECRET
 *   REDIRECT_URI                 — must match what was used to obtain the auth code
 *   ALLOWED_ORIGIN  (optional)   — defaults to https://bogdanripa.github.io
 *
 * Notes:
 *   - The function does NOT log token material.
 *   - CORS allows ALLOWED_ORIGIN only.
 */

const { google } = require("googleapis");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://bogdanripa.github.io";

function setCorsHeaders(res) {
  res.set("Access-Control-Allow-Origin", ALLOWED_ORIGIN);
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");
  res.set("Access-Control-Max-Age", "3600");
}

function makeOAuthClient() {
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
}

exports.oauth = async (req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") return res.status(204).send("");
  if (req.method !== "POST") return res.status(405).json({ error: "method_not_allowed" });

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    console.error("Missing env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or REDIRECT_URI");
    return res.status(500).json({ error: "server_misconfigured" });
  }

  const body = req.body || {};
  // Default grant_type for backward compat: if 'code' is present, assume authorization_code
  const grantType = body.grant_type || (body.code ? "authorization_code" : null);

  try {
    if (grantType === "authorization_code") {
      const code = body.code;
      if (!code || typeof code !== "string") {
        return res.status(400).json({ error: "missing_code" });
      }
      const oauth2Client = makeOAuthClient();
      const { tokens } = await oauth2Client.getToken(code);
      return res.status(200).json(tokens);
    }

    if (grantType === "refresh_token") {
      const refreshToken = body.refresh_token;
      if (!refreshToken || typeof refreshToken !== "string") {
        return res.status(400).json({ error: "missing_refresh_token" });
      }
      const oauth2Client = makeOAuthClient();
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      const resp = await oauth2Client.getAccessToken();
      // resp.res contains the full response when available; resp.token is the access token
      const tokenData = (resp && resp.res && resp.res.data)
        ? resp.res.data
        : { access_token: resp && resp.token };
      // Always include the refresh_token (Google often omits it on refresh)
      if (!tokenData.refresh_token) tokenData.refresh_token = refreshToken;
      return res.status(200).json(tokenData);
    }

    return res.status(400).json({ error: "unsupported_grant_type" });
  } catch (err) {
    console.error("OAuth operation failed:", err && err.message ? err.message : "unknown");
    return res.status(400).json({ error: "exchange_failed" });
  }
};

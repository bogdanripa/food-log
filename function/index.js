/**
 * Food Log OAuth code-exchange function.
 *
 * Single endpoint:
 *   POST /  with JSON body: { "code": "<authorization code from Google>" }
 *   Returns: token JSON from Google, ready for the local script to save as token.json.
 *
 * Environment variables required:
 *   GOOGLE_CLIENT_ID      — OAuth Web client ID
 *   GOOGLE_CLIENT_SECRET  — OAuth Web client secret (set this in Cloud Console env vars)
 *   REDIRECT_URI          — Must match the redirect_uri the auth URL was generated with.
 *                           Example: https://bogdanripa.github.io/food-log/auth-callback.html
 *
 * Notes:
 *   - The function does NOT log tokens. Tokens are exchanged and returned in-memory.
 *   - CORS allows the GitHub Pages origin only.
 *   - Scope is enforced server-side by Google (we don't request it here; it was
 *     pinned at auth-url time by the local script).
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

exports.oauth = async (req, res) => {
  setCorsHeaders(res);

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(204).send("");
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "method_not_allowed" });
  }

  const code = req.body && req.body.code;
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "missing_code" });
  }

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    // Configuration error — log without exposing details to caller
    console.error("Missing one or more env vars: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, REDIRECT_URI");
    return res.status(500).json({ error: "server_misconfigured" });
  }

  const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

  try {
    const { tokens } = await oauth2Client.getToken(code);
    // Return the tokens as-is. The local script writes them directly to token.json.
    // DO NOT log `tokens` — they are sensitive credentials.
    return res.status(200).json(tokens);
  } catch (err) {
    // Log the error type/message but not the code or any token material.
    console.error("Token exchange failed:", err && err.message ? err.message : "unknown");
    return res.status(400).json({ error: "exchange_failed" });
  }
};

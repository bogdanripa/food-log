const { google } = require("googleapis");

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

function getOAuthClient() {
  return new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
}

exports.oauth = async (req, res) => {
  const oauth2Client = getOAuthClient();

  // Start OAuth
  if (req.path === "/start") {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/drive"
      ]
    });

    return res.redirect(url);
  }

  // OAuth callback
  if (req.path === "/callback") {
    const code = req.query.code;

    if (!code) {
      return res.status(400).send("Missing code");
    }

    try {
      const { tokens } = await oauth2Client.getToken(code);

      // TODO: store securely (Firestore / Secret Manager)
      console.log("TOKENS:", JSON.stringify(tokens, null, 2));

      return res.send(`
        <h2>Drive connected</h2>
        <p>You can close this window.</p>
      `);
    } catch (err) {
      console.error(err);
      return res.status(500).send("OAuth failed");
    }
  }

  // Root
  res.send(`
    <h2>Food Logger OAuth</h2>
    <p><a href="/start">Connect Google Drive</a></p>
  `);
};

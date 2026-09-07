<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/0458f8be-2311-4684-affe-e18989d6dbdb

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Authentication

StudyHub uses SQLite-backed users and server-side sessions. Public registration always creates a `user` account; admin registration is not exposed.

To create the first admin account during development, set these variables in `.env.local` before starting the server:

```text
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=use-a-unique-password-at-least-12-characters
ADMIN_FULL_NAME=StudyHub Administrator
ADMIN_COLLEGE=StudyHub
```

The bootstrap runs only when no admin exists. Keep `.env.local` private and never commit credentials.

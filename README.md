<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ba1ab68d-8be8-49cc-bbec-fdd644e7f28f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Subject & Chapter system update
- Subjects are user-created; no default academic subjects are created.
- Chapters can be used independently of Topics and Notes.
- Topics are optional and are represented by the existing chapter checklist UI.
- Chapters with zero topics can be manually marked Completed.
- Subject progress derives from real chapter completion; a subject with no chapters is 0%.
- Study time continues to derive from completed study sessions.
- Subject/chapter records created in the client are tagged with the current NOTIQ profile identity while retaining the existing device-scoped storage architecture.
- Target study hours are optional and default to 0 rather than an imposed target.

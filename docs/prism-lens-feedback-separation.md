# Prism Lens and feedback separation

## What changed

- **Feedback Vault** submissions are explicitly stored as `type = 'feedback'`. Ask DJ requests are not written to Feedback Vault.
- **Ask DJ vault** is a separate, authenticated table. Saving is explicit: the user taps the book icon in Ask DJ. If they do not save, the current chat remains temporary in the browser session.
- **Prism Lens** appears when a user selects a short phrase in refracted text. It offers:
  - **Ask DJ**: asks for a plain-language, context-aware explanation.
  - **Google definition**: opens a new tab for the selected term without sending the document to Google through Prism.
- The first Lens slice is intentionally reversible and provider-neutral. It does not change refraction, quotas, shadow mode, or AI routing.

## Database step required before production use

Apply `supabase/migrations/004_feedback_and_ask_dj_vaults.sql` to the Prism Supabase project before enabling the Ask DJ save button in production. Until that migration is applied, the save endpoint fails safely and the current chat still works.

## Google key handling

The application reads `GEMINI_API_KEY` on the server. Add the key in the Vercel project environment settings for the required environments (Preview and/or Production), using the exact name `GEMINI_API_KEY`. Do not put it in the notebook folder, commit it, or rename it to a `NEXT_PUBLIC_` variable. A key alone does not create a callback from Google; the server must call a supported Gemini API route, and billing/quota/model access must be configured in the corresponding Google account/project.

## Future Lens phases

1. Keep external Google definition search as an opt-in link.
2. Add a provider-backed definition endpoint only after measuring cost, latency, citation quality, and privacy behavior.
3. Add difficult-word suggestions only as a reviewable hint, never as an automatic judgment about a user's ability.
4. Add a dismiss/disable control and preserve the original text unchanged.

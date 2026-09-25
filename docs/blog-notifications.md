# Manual blog email workflow

## Publishing and sending are separate

1. Publish the article through the normal GitHub `main` push and Cloudflare deployment.
2. When the article is live and ready to announce, open Resend and create a Broadcast for the **Blog Updates** segment.
3. Start from the **HadithCritic Blog Post Announcement** template.
4. Replace the bracketed title, update the button destination to the article's full URL, and update the plain-text link.
5. Include Resend's unsubscribe footer, preview the message, and send it manually when ready.

A site deployment does not send an email. The site signup endpoint only adds a contact to Resend; it has no broadcast-send call or GitHub Actions trigger.

## What the site signup tells people

The footer signup is for new blog-post announcements. A successful submission means Resend accepted the address into the list; no confirmation email is sent. The page now says the address is on the blog update list rather than claiming email ownership has been confirmed.

The signup route validates email addresses, ignores filled honeypot fields, and applies the Cloudflare rate limit when available.

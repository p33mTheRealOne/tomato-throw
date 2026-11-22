# Security policy

## Reporting a vulnerability

Please don't open a public issue for a security problem.

Use GitHub's private reporting: on the repository page, open the **Security** tab and choose **Report a vulnerability**. If that button isn't there, contact me through the links on [tomatothrow.com](https://tomatothrow.com) (Contact button) and say only that you have a security report; I'll reply with a private channel.

Include what you found, how to reproduce it, and what you think the impact is. I'll acknowledge within about a week. I'm one person working on this in spare time, so a fix may take longer, but I'll tell you where it stands.

Only the `main` branch is supported.

## What's in scope

- Anything that lets a visitor read, replace or delete pictures they don't own, or reach the admin routes without `ADMIN_TOKEN`.
- Upload handling: file type checks, size limits, stored-name handling, and anything that makes the server execute or misserve an uploaded file.
- Cross-site scripting through picture names or any other user input.
- Leaking secrets or server error details to visitors.

## Known limitations

These are already known, so reports about them alone won't be treated as new findings:

- The upload and report rate limits are in memory per serverless instance. They're a speed bump, not a global cap. Use Vercel's firewall rules for a real one.
- Anyone with a picture's link can view it. Pages are `noindex`, but links aren't secret.
- Reports are anonymous and auto-delete a picture at the threshold. A group of people on different networks could remove someone's picture.
- Preview images cached by other services (X, Facebook, Slack) outlive a deleted picture.

## If you run your own deployment

- Set `ADMIN_TOKEN` to a long random value, or leave it unset to disable the admin routes entirely.
- Set your own `REPORT_SALT`. The default is in the source, so reporter hashes made with it are guessable.
- Use a private Vercel Blob store.
- Never commit `.env` files. `.gitignore` already excludes them.
- Add a firewall rate-limit rule for `/api/upload` and `/api/report`, and set a spend limit on your hosting account; uploads and preview generation cost money at volume.
- You are responsible for what people upload to your instance, including removing illegal content promptly.

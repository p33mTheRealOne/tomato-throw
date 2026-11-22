# Contributing

Thanks for looking. This is a small project and I'm the only maintainer, so replies can take a few days.

## Before you start

For anything bigger than a typo or an obvious bug, open an issue first and say what you want to change. A pull request that rewrites the throw animation, or adds a database, is much easier to discuss before the code exists than after.

Things I'd happily take: bugs on specific phones or browsers, accessibility fixes, better moderation tooling, performance work on the splat layer, small polish. Things I'll probably decline: accounts or logins, ads or trackers, big new dependencies for something a few lines can do.

## Setup

```bash
git clone https://github.com/p33mTheRealOne/throw-the-tomato.git
cd throw-the-tomato
npm install
npm run dev
```

Node 20.9 or newer. No environment variables are needed locally; see the README if you want to try the Blob backend or the admin routes.

## Making a change

1. Branch from `main`: `git checkout -b fix-short-description`.
2. Keep the change focused. One fix or feature per pull request.
3. Run `npm run typecheck` and `npm run build`. Both must pass; CI runs the same two.
4. Try it by hand, because there's no automated test suite yet. At minimum: upload a picture, open the link, throw a few tomatoes, press **Save image**, press **Report**. If you touched layout, check a phone-sized window and a landscape one too.
5. Open a pull request and say what changed and why. A screenshot or a short clip helps for anything visual.

Tests are welcome. If you add a test setup, keep it light and tell me what it covers in the pull request.

## Style

- TypeScript, no `any` unless there's a comment explaining why.
- Follow the patterns already in the file you're editing. The code has no formatter config yet, so match the surrounding style (two spaces, double quotes, semicolons).
- User-facing text is English, short, and doesn't expose error details. Errors go to the server log; the browser gets a short code or a plain message.
- Keep the splat geometry deterministic. `lib/splat-shape.ts` feeds the page, the preview image and Save image; changing the order it consumes random numbers changes every existing preview.
- Respect `prefers-reduced-motion` for any new animation.

## Test pictures and screenshots

Don't commit pictures of real people, and don't use them in screenshots or issues. Drawings, animals, objects and memes are fine. Never commit the contents of `.uploads/` or any `.env` file.

## Pull request checklist

- [ ] `npm run typecheck` and `npm run build` pass
- [ ] I tried it in a browser, on a phone-sized window if the change is visual
- [ ] No secrets, no `.env` files, no uploaded pictures
- [ ] README or `.env.example` updated if I added or changed an environment variable

## Reporting problems with the live site

A picture on [tomatothrow.com](https://tomatothrow.com) that shouldn't be there: use the **Report** button on that page. Don't file a GitHub issue with the link; that spreads it.

By contributing you agree that your work is released under the [MIT license](LICENSE).

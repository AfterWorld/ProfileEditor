# Shadow Monarch — SeenU Theme Generator

A form-driven generator for the Shadow Monarch (Solo Leveling-inspired) SeenU
profile theme. Fill in your stats, pick your colors, and it produces a
paste-ready code block — with a live preview built from SeenU's actual
element classes, so what you see is a close approximation of what you'll get.

No backend, no build step, no dependencies beyond two Google Fonts. Three files.

## Deploy it to GitHub Pages (~5 minutes)

1. Create a new repository on GitHub (public or private — Pages works with both
   on a paid plan; public repos get Pages free).
2. Upload all four files from this folder to the repo root:
   `index.html`, `style.css`, `generator.js`, `README.md`.
3. Go to **Settings → Pages**.
4. Under **Source**, choose **Deploy from a branch**.
5. Under **Branch**, choose `main` (or `master`) and `/ (root)`, then **Save**.
6. Wait about a minute, then visit `https://<your-username>.github.io/<repo-name>/`.

That's it — no `npm install`, no build command. It's plain HTML/CSS/JS.

## Using it

1. Fill in the panels on the left: identity, rank, system message, the
   Monarch Record window, the Daily Quest window, colors, and effect toggles.
2. Watch the live preview on the right update as you type.
3. Copy the code from the **OUTPUT** panel and paste it into your SeenU
   profile's layout code box. Save.
4. If it breaks the page, clear the code box and save — your normal theme
   comes right back.

### About the floating windows

The Monarch Record (kill counter) and the gate/rank ring around your avatar
are positioned with raw pixel offsets, because every profile's header layout
places things slightly differently and there's no reliable way to detect that
from outside the page. The generator ships with reasonable starting values,
but **expect to nudge the offset fields once** after you see it live on your
actual profile — that's normal, not a bug.

### About "once per session" splash

The checkbox that limits the intro splash to once per browser session works
by injecting a small `<script>` tag using `sessionStorage`. Some sites strip
script tags from user-submitted layout code for security reasons — if that
happens here, the splash simply falls back to playing (quickly) every time
you load the page instead of failing loudly. Safe to leave on either way.

### About the 20,000-character limit

SeenU's layout code box has a 20,000 character cap. The generator counts the
*minified* output (comments and whitespace stripped) live, and the counter
turns amber near 15,000 and red at the limit. If you go over, the fastest
fixes are: trim Daily Quest / Monarch Record rows, or turn off an effect you
don't need (grain and shimmer are the cheapest to cut).

### About "SeenU quirk fixes"

This toggle bundles a handful of selectors that hide/restyle a few SeenU
platform elements (decorative tab overlays, a background monitor widget)
that don't have dedicated CSS classes — they were identified by inspecting
a real profile's rendered HTML. They're written as attribute selectors
(`[class*="..."]`) so they should generalize across SeenU profiles, but SeenU
could change its markup at any time, and other profile layouts may have
slightly different elements this doesn't catch. If something on your profile
looks unstyled that shouldn't be, right-click it → Inspect → Copy → Copy
outerHTML, and add matching CSS by hand.

## Customizing further

Everything is plain, commented code — no framework, no build tooling.
- `index.html` — form fields and preview markup
- `style.css` — the generator tool's own look (not the exported theme)
- `generator.js` — state, the CSS/HTML block builders, and the minifier

To add a new field: add an input in `index.html`, read/write it in
`readFormIntoState()` / `syncFormFromState()` in `generator.js`, and use it
inside the relevant `block*()` function.

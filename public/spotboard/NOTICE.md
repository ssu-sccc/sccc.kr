# Spotboard attribution

Vendored from https://github.com/spotboard/spotboard
Commit: d9a930c37c8a0bfc205c2111fb2638ba87e88953
Version: 0.7.0
Authors: Jongwook Choi (@wookayin), Wonha Ryu (@beingryu).
Upstream declares MIT LICENSE in its README and package.json. Original author
credits and dependency license headers are retained. Upstream does not include
a separate LICENSE file at this revision.

Included webapp source, styles, fonts, balloon assets and icons. Dependencies
under js/lib retain their original notices; icons are credited to FatCow by
upstream. Do not remove the original on-screen attribution.

SCCC changes:
- Use a static launch page to read anonymous CLICS endpoints directly in the browser.
- Replace the app bootstrap with sccc-bridge.js and parent messages.
- The SCCC launcher generates URLs only; no server, credentials, or award controls.
- Add sccc-bridge.css for the embedded presentation and metadata.js.
- Compile contest.coffee using coffee-script 1.12.7; retain CoffeeScript source.
- Honor the contest's configurable penalty instead of hard-coded 20 minutes.
- Fix Team constructor's group check so parentheses in a team name survive.
- Escape problem labels used in dynamic CSS and fix award icon relative paths.
- Use authoritative public ranking and rebuild live snapshots for rejudging.
- No original sample data or external feed server is used.

To recompile after changing contest.coffee:
  pnpm dlx --package coffee-script@1.12.7 coffee -c public/spotboard/js/contest.coffee

No upstream build or runtime download is required to serve the vendored files.

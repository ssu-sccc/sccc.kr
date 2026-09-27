# Spotboard v0.6.0

Official upstream: https://github.com/spotboard/spotboard
Release: https://github.com/spotboard/spotboard/releases/tag/v0.6
Archive: https://github.com/spotboard/spotboard/releases/download/v0.6/spotboard-webapp-0.6.0.tar.gz
Archive SHA-256: f685a8fdf83ff9f788fcf5aab18ed00ebcd9aa8d5f1e3710d09009947ded2a55

The upstream project declares the MIT license. Original attribution, bundled
library license notices and credits are retained. Authors: Jongwook Choi
(wookayin), Wonha Ryu (Being), and the Spotboard contributors.

`index.html` is the unmodified release template. `public/vendor/spotboard/`
contains the unmodified release's assets, css, img, js and config.js. Example
contest data is not shipped. No upstream install or build is required.

The Astro division route adds charset/viewport/asset-base metadata, a title,
and static-feed configuration. It disables live WebSocket initialization for
the archive. All score computation, rendering, colors, balloons, search and
controls use the original release code. A separate outer page adds division
navigation without injecting SCCC CSS into the Spotboard document.

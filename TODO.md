# TODO

- bg image slideshow
  -> investigate bg slideshow works with fade
  - try loading -bg1.$bgext
  - if successful
    - cache and show it
    - start a setInterval, which
      - tries loading -bg$next.$bgext
      - if successful
        - cache and show it
        - increase $bgnext
      - if unsuccessful
        - reset $bgnext and show from cache

- vertically center the loading div

- investigate normal mapping
  - <https://dev.to/ndesmic/webgl-engine-from-scratch-15-normal-maps-3227>
  - <http://olegon.github.io/html5-webgl-normalmapping/>

- per-name json files for informations (multi paragraph description, links etc)
  - info is provided as variable (same way as config)
  - info could contain the full name (displayed in the lower area, used for meta tags)
  - implement info as sidebar

- handle touch events <https://developer.mozilla.org/en-US/docs/Web/API/Touch_events>
    -> for zoom, the main html should implement `<meta name="viewport" content="user-scalable=no"/>`

- motion blur (shader)

- logger (with loglevel by query param)

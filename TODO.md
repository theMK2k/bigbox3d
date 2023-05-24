# TODO

- create an interactive demo site (maybe also a config generator?)

- background filters pop up and get closed shortly after (see: <https://themk2k.github.io/bigbox3d/embedded.html>), better show the effects when everything's settled

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

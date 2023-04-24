# TODO

## Other

- background image (as alternative to background color)
  - see: <https://www.ragbag.info/3DBB/box.html?h=285&w=215&d=27&b=aaa&bgfx=https://www.ragbag.info/3DBB/boxen/Insta/Ports_of_Call/PoC.gif&s=100&z=1&f=0&t=boxen/Insta/Ports_of_Call/PoC_3D.jpg>
  - [x] new option: bgext (different file extension of the background image, e.g. gif)
  - [ ] stay compatible to colored background options
  - [ ] loading text visibility
- [x] add external link to top-right, but only if embedded

- per-name json files for informations (multi paragraph description, links etc)
  - info is provided as variable (same way as config)
  - info could contain the full name (displayed in the lower area, used for meta tags)
  - implement info as sidebar
- handle touch events <https://developer.mozilla.org/en-US/docs/Web/API/Touch_events>
    -> for zoom, the main html should implement `<meta name="viewport" content="user-scalable=no"/>`
- motion blur (shader)
- logger (with loglevel by query param)

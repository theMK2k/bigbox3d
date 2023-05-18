# DONE

## v1.5.0 (WIP)

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
- video background (use bgext=mp4) and have `gamename-bg.mp4` available
- rename extlink to openexclusively
- rename extlink2 to extlink (also: options, README.md, bigbox3d.config.json.example)
- vertically center the loading div

## v1.4.0

- show loading counter, e.g. "loading... (3 / 6)"
- background image (as alternative to background color)
  - see: <https://www.ragbag.info/3DBB/box.html?h=285&w=215&d=27&b=aaa&bgfx=https://www.ragbag.info/3DBB/boxen/Insta/Ports_of_Call/PoC.gif&s=100&z=1&f=0&t=boxen/Insta/Ports_of_Call/PoC_3D.jpg>
  - [x] new option: bgext (different file extension of the background image, e.g. gif)
  - [x] stay compatible to colored background options
  - [x] loading text visibility
- [x] add external link to top-right, but only if embedded

## v1.3.0

- extended functionality with bigbox3d.php

  - provides specific meta tags for sharing links in Facebook, Twitter etc.
  - utilized bigbox3d.conf.json so that you can omit URL params like path, ext and bg

- some replacing in opts necessary because Facebook alters URL parameters

## v1.2.0

- optimize (see comments)
- properly react to resize

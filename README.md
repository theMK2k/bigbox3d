# Big Box 3D

A 3D Big Box web viewer. Check out the Demo Site: <https://themk2k.github.io/bigbox3d/>.

Get the latest release at <https://github.com/theMK2k/bigbox3d/releases>.

![demo gif](demo.gif)

## Usage

Place the contents of the .zip file in your web directory.

Make sure you have 7 image files for each box according to each side of the box:

- gamename-front.jpg
- gamename-back.jpg
- gamename-top.jpg
- gamename-bottom.jpg
- gamename-left.jpg
- gamename-right.jpg
- gamename-preview.jpg (_this could be a shrinked gamename-front.jpg to 10% size_)

_In this example we use the .jpg file format, formats like .png are possible._

Optionally, provide one or more background images, starting with `-bg0`:

- gamename-bg0.png
- gamename-bg1.png
- gamename-bg2.png

or an mp4 video file:

- gamename-bg.mp4

**bigbox3d** accepts the following URL parameters:

parameter|description|default value|examples
-|-|-|-
name|the base name of the image files|`template-`|`?name=gamename-`, `?name=Ultimate%20DOOM_`
path|base path to files|`null`|`?path=/img/` if files are in "img" sub-directory
ext|the file extension of the files|`jpg`|`?ext=png` if you have .png files
bg|the background color, **IMPORTANT**: always use 6 hex characters!|`000000`|`?bg=ffffff` if you want a white background
bgvignette|use a vignette effect for the background|`true`|`?bgvignette=false` to turn it off
bgpattern|use a pattern effect for the background|`true`|`?bgpattern=false` to turn it off
bgext|the file extension of the background images|(same as ext)|`?bgext=gif` if you have .gif files or `?bgext=mp4` if you have a video file (for videos currently only `mp4` is supported)
bginterval|the interval in seconds to change the background image|`10`|`?bginterval=60` to change the background image every minute

## Extended Usage

You can extend the usage by utilizing `bigbox3d.php` which will:

- load your default config from bigbox3d.config.json so you can omit URL parameters like path, ext and bg (see [bigbox3d.config.json.example](bigbox3d.config.json.example))
  - additional config options:
    - extlink
    - extlink_innerhtml
- provide specific meta tags (og:title, og:image, twitter:image) defined by the name URL parameter

## Controls inside the view

### Mouse

Rotate: click and hold the left mouse button

Move: click and hold the right mouse button

Zoom: use the mouse wheel

### Touch

Rotate: use one finger

Move: use two fingers

Zoom: use two fingers and pinch

### Keyboard

Move: use <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or cursor keys

## How to scan your box sides

Scan the front and back of the box as if you would scan a letter or document.

Scan the other sides (top, bottom, left and right) while the front of the box is facing towards you while operating the scanner.

## Supported Browsers

Big Box 3D has been tested with the following browsers, see below. The tests have been performed with the examples from the Demo Site <https://themk2k.github.io/bigbox3d/>.

Platform|Browser|Notes
-|-|-
Windows 10|Firefox 84|OK
Windows 10|Chrome 87|OK - main development environment
Windows 10|Edge 44|OK
Linux Mint 19.3|Firefox 84|OK
Linux Mint 19.3|Chromium 87|`*` may encounter memory issues, see below
macOS 10.14|Firefox 84|OK
macOS 10.14|Chrome 87|OK
macOS 10.14|Safari 12.1.2|doesn't recognize pointer events (rotate, move)
Android|Firefox 84|OK
Android|Chrome 87|`*` may encounter memory issues, see below

`*` Browsers which encounter memory issues won't load some textures and result in displaying a box with some or all of the sides being black. The error encountered here is `GL_OUT_OF_MEMORY`. Using images with lower resolution may mitigate the problem.

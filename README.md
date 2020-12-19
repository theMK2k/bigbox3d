# Big Box 3D

A 3D Big Box web viewer. Check out the Demo Site: <https://themk2k.github.io/bigbox3d/>.

Get the latest release at <https://github.com/theMK2k/bigbox3d/releases>.

![demo gif](demo.gif)

## Usage

Place the contents of the .zip file in your web directory.

Make sure you have 6 image files for each box according to each side of the box:

- gamename-front.ext
- gamename-back.ext
- gamename-top.ext
- gamename-bottom.ext
- gamename-left.ext
- gamename-right.ext

bigbox3d.html accepts the following URL parameters:

parameter|description|default value|examples
-|-|-|-
name|the base name of the image files|`template-`|`?name=gamename-`, `?name=Ultimate%20DOOM_`
path|base path to files|`null`|`?path=/img/` if files are in "img" sub-directory
ext|the file extension of the files|`jpg`|`?ext=png` if you have .png files
bg|the background color, **IMPORTANT**: always use 6 hex characters!|`999999`|`?bg=ffffff` if you want a white background

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

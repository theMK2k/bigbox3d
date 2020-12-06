# bigbox3d

A 3D Big Box web viewer. Check out the Demo Site: <https://themk2k.github.io/bigbox3d/>.

Get the latest release at <https://github.com/theMK2k/bigbox3d/releases>.

## Usage

Place the contents of this .zip file in your web directory.

Make sure you have 6 image files for each box according to each side of the box:

- gamename-front.ext
- gamename-back.ext
- gamename-top.ext
- gamename-bottom.ext
- gamename-left.ext
- gamename-right.ext

bigbox3d.html accepts the following URL parameters:

parameter|description|default value|examples
-|-|-
name|the base name of the image files|`template-`|`?name=gamename-`, `?name=Ultimate%20DOOM_`
path|base path to files|`null`|`?path=.%2Fimg%2F` if files are in "img" sub-directory
ext|the file extension of the files|`jpg`|`?ext=png` if you have .png files
bg|the background color, **IMPORTANT**: always use 6 hex characters!|`999999`|`ffffff` if you want a white background
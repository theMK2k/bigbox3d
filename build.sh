#!/bin/bash

rm -rf ./RELEASE/
mkdir -p ./RELEASE/bigbox3d

npx babel@5 bigbox3d.js --presets es2015 -o bigbox3d-babel.js
npx uglify-js ./bigbox3d-babel.js --output ./RELEASE/bigbox3d/bigbox3d.js
rm bigbox3d-babel.js
cp ./bigbox3d.html ./RELEASE/bigbox3d/bigbox3d.html
cp ./bigbox3d.php ./RELEASE/bigbox3d/bigbox3d.php
cp ./bigbox3d.config.json.example ./RELEASE/bigbox3d/bigbox3d.config.json.example
cp ./bg-pattern.png ./RELEASE/bigbox3d/bg-pattern.png
cp ./extlink.png ./RELEASE/bigbox3d/extlink.png
cp ./template* ./RELEASE/bigbox3d/
cp ./README.md ./RELEASE/bigbox3d/README.md
cp ./LICENSE.md ./RELEASE/bigbox3d/LICENSE.md
cp ./gl-matrix-min.js ./RELEASE/bigbox3d/gl-matrix-min.js

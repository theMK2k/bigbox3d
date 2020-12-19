#!/bin/bash

rm -rf ./RELEASE/
mkdir -p ./RELEASE/bigbox3d

npx babel bigbox3d.js --presets es2015 -o bigbox3d-babel.js
npx uglify-js ./bigbox3d-babel.js --output ./RELEASE/bigbox3d/bigbox3d.js
rm bigbox3d-babel.js
cp ./bigbox3d.html ./RELEASE/bigbox3d/bigbox3d.html
cp ./template* ./RELEASE/bigbox3d/
cp ./README.md ./RELEASE/bigbox3d/README.md
cp ./LICENSE.md ./RELEASE/bigbox3d/LICENSE.md

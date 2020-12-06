#!/bin/bash

rm -rf ./RELEASE/
mkdir -p ./RELEASE/bigbox3d

npx uglify-js ./bigbox3d.js --output ./RELEASE/bigbox3d/bigbox3d.js
cp ./bigbox3d.html ./RELEASE/bigbox3d/bigbox3d.html
cp ./template* ./RELEASE/bigbox3d/
cp ./README.md ./RELEASE/bigbox3d/README.md
cp ./LICENSE.md ./RELEASE/bigbox3d/LICENSE.md

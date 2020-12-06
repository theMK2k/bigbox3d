#!/bin/bash

rm -rf ./RELEASE/
mkdir -p ./RELEASE

npx uglify-js ./bigbox3d.js --output ./RELEASE/bigbox3d.js
cp ./bigbox3d.html ./RELEASE/bigbox3d.html
cp ./template* ./RELEASE/
cp ./README.md ./RELEASE/README.md
cp ./LICENSE.md ./RELEASE/LICENSE.md

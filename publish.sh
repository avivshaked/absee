#!/bin/bash

PACKAGE_VERSION=$(cat package.json \
  | grep version \
  | head -1 \
  | awk -F: '{ print $2 }' \
  | sed 's/[",]//g')

git checkout master &&
git pull origin master &&
npm install --strict-ssl=false && \
npm run lint && \
npm test && \
npm publish --strict-ssl=false && \
git tag $PACKAGE_VERSION && git push --tag

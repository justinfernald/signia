set -e

rm -rf node_modules
rm -rf **/*/node_modules
rm -rf **/*/.tsbuild
rm -rf **/*.tsbuildinfo
rm -rf packages/*/api
yarn install
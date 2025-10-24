#!/usr/bin/env node
const semver = process.versions.node.split('.')
const major = parseInt(semver[0], 10)
if (Number.isNaN(major)) {
  process.exit(0)
}
if (major >= 21) {
  console.error(`\nThis project requires Node 18.x or 20.x. Detected Node ${process.versions.node}.\n\nPlease switch to Node 20 LTS (recommended):\n  nvm install 20.16.0\n  nvm use 20.16.0\n\nAlternatively, Node 18.x also works.\n`)
  process.exit(1)
}
process.exit(0)

/**
 * @type {import('semantic-release').GlobalConfig}
 */
module.exports = {
  branches: ["main"],
  plugins: [
    [
      "@semantic-release/commit-analyzer",
      {
        "preset": "angular",
        "releaseRules": [
          { "type": "build", "release": "patch" }
        ],
      }
    ],
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm"
  ],
  prefix: "angular"
};
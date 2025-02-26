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
      }
    ],
    "@semantic-release/release-notes-generator",
    "@semantic-release/npm"
  ],
  prefix: "angular"
};
# GitHub Actions

Automated CI/CD workflows for testing and publishing.

## Workflows

### 🔄 CI (`ci.yml`)
- Runs on every push and PR
- Tests on Node.js 16, 18, 20
- Type checking and full test suite

### 📦 Publish (`publish.yml`)
- Triggers on GitHub Release
- Automatically publishes to npm

### 🏷️ Release (`release.yml`)
- Auto-creates GitHub Release from version tags

## Publishing

See **[PUBLISH_INSTRUCTIONS.md](PUBLISH_INSTRUCTIONS.md)** for complete setup and usage guide.


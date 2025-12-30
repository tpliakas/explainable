# Publishing Instructions

This package uses GitHub Actions to automatically publish to npm.

## Setup (One-Time)

### 1. Create npm Access Token

1. Go to https://www.npmjs.com/
2. Login to your account
3. Click your profile → **Access Tokens**
4. Click **Generate New Token** → **Classic Token**
5. Select **Automation** type (for CI/CD)
6. Copy the token (starts with `npm_...`)

### 2. Add Token to GitHub Secrets

1. Go to your GitHub repo
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click **Add secret**

## Publishing Methods

### Method 1: Create a GitHub Release (Recommended)

1. Update version in `package.json`:
   ```bash
   npm version patch  # or minor, or major
   ```

2. Push the tag:
   ```bash
   git push && git push --tags
   ```

3. Go to GitHub → **Releases** → **Draft a new release**
   - Choose the tag you just created (e.g., `v0.1.0`)
   - Title: `v0.1.0`
   - Description: Copy from CHANGELOG.md
   - Click **Publish release**

4. GitHub Actions will automatically:
   - Run tests
   - Build the package
   - Publish to npm

### Method 2: Manual Trigger

1. Go to **Actions** → **Publish to npm**
2. Click **Run workflow**
3. Enter the version tag (e.g., `v0.1.0`)
4. Click **Run workflow**

## Pre-Publish Checklist

Before creating a release:

- [ ] Update `package.json` version
- [ ] Update `CHANGELOG.md`
- [ ] All tests passing locally (`npm test`)
- [ ] Build succeeds (`npm run build`)
- [ ] README is up to date
- [ ] Commit and push all changes

## Monitoring

- **Check Actions tab** for workflow status
- **Check npm** at https://www.npmjs.com/package/explainable
- **View logs** in GitHub Actions for any errors

## Troubleshooting

### "Permission denied" error
- Make sure `NPM_TOKEN` secret is set correctly
- Token must have **Automation** or **Publish** permissions

### "Version already exists"
- Update version in `package.json`
- Create a new git tag

### Tests failing
- Check **Actions** tab for error details
- Fix locally and push again

## Version Numbering

Follow Semantic Versioning (semver):

- **Patch** (0.1.0 → 0.1.1): Bug fixes
- **Minor** (0.1.0 → 0.2.0): New features (backward compatible)
- **Major** (0.1.0 → 1.0.0): Breaking changes

```bash
npm version patch  # Bug fixes
npm version minor  # New features
npm version major  # Breaking changes
```

## First Publish

For the very first publish:

```bash
# Make sure you're logged in locally first
npm login

# Publish manually the first time
npm publish --access public

# After that, use GitHub Actions for all future releases
```


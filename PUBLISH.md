# NPM Deployment Guide

This monorepo uses **Nx** for builds and is configured for **Semantic Release**.

## 🚀 Automated Deployment (Recommended)

The project is already configured with `semantic-release`. To trigger a release:

1.  **Build all packages**:

    ```bash
    npm run build:all
    ```

2.  **Run Release**:
    ```bash
    npm run release
    ```
    _Note: This usually requires `GH_TOKEN` and `NPM_TOKEN` environment variables to be set in your CI (e.g., GitHub Actions)._

---

## 🛠️ Manual Deployment

If you want to publish individual packages manually:

### 1. Build the packages

```bash
npx nx build core
npx nx build angular-wrapper
npx nx build react-wrapper
npx nx build vue-wrapper
```

### 2. Publish from the `dist` folder

You **must** publish from the generated `dist` directory, as it contains the compiled code and the final `package.json`.

#### Angular Wrapper:

```bash
cd dist/libs/angular-wrapper
npm publish --access public
```

#### React Wrapper:

```bash
cd dist/libs/react-wrapper
npm publish --access public
```

#### Vue Wrapper:

```bash
cd dist/libs/vue-wrapper
npm publish --access public
```

---

## 🔍 Troubleshooting Common Errors

### 1. "Access token expired or revoked"

This means your NPM session has timed out.
**Fix**: Run `npm login` again and follow the prompts.

### 2. "E404 Not Found" (on manual publish)

If you get a 404 when running `npm publish` for a scoped package (like `@foisit/...`):

- **Missing Scope**: You might not have created the `foisit` organization on NPM yet.
- **Permission**: You might not be a member of the organization.
- **Privacy**: If you haven't added `--access public`, NPM might think you're trying to publish a private package, which requires a paid plan.

**Steps to fix**:

1. Check if the scope exists: Go to `npmjs.com/org/foisit`.
2. If it doesn't exist, you can create it for free.
3. Use the `--access public` flag: `npm publish --access public`.

### 3. Billing Issues

NPM only requires billing for **private** packages. As long as you publish with `--access public`, you do **not** need a paid plan or active billing.

### 4. Skip GitHub/Semantic Release

If you don't want to use the automated `semantic-release` flow, simply follow the **Manual Deployment** steps above after running `npm login`.

### 5. "Two-factor authentication (2FA) is required"

NPM requires 2FA for many accounts. When you run `npm publish`, it should prompt you for a 6-digit code from your authenticator app.

**If you are not prompted or it fails immediately**:
Use the `--otp` flag with your current code:

```bash
npm publish --access public --otp=123456
```

_(Replace `123456` with the code from your app at that moment)._

### 6. Using an NPM Token (To bypass 2FA)

If you have a **Granular Access Token** or a token with **Bypass 2FA** enabled:

**Option A (Environment Variable)**:
Run the command while providing the token in the environment:

```bash
NPM_TOKEN=your_token_here npm publish --access public
```

**Option B (Temporary .npmrc)**:
Create a temporary `.npmrc` file in the folder you are publishing from (e.g., `dist/libs/angular-wrapper`):

```text
//registry.npmjs.org/:_authToken=your_token_here
```

Then simply run `npm publish --access public`.

---

## ⚠️ Important Notes

- **Version Management**: The `semantic-release` tool automatically increments versions based on your commit messages (e.g., `feat:`, `fix:`).
- **Authentication**: Ensure you are logged into NPM via `npm login` before manual publishing.
- **Internal Core**: While `@foisit/core` is publishable, it is primarily an internal engine; focus on publishing the wrappers as they are the main entry points for users.

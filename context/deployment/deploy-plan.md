---
title: Deployment Plan — Jubilee MVP
version: 1.0
date: 2026-05-25
platform: GitHub Pages + GitHub Actions
tech_stack: React 19 + Vite + TypeScript + Firebase Firestore
status: Ready for Execution
---

# Deployment Plan — Jubilee MVP (GitHub Pages + GitHub Actions)

## 1. Overview

This document outlines the deployment strategy for **Jubilee**, a milestone celebration tracker, deploying to **GitHub Pages + GitHub Actions** as per @context/foundation/infrastructure.md. The plan covers:

- Pre-deployment validation and setup
- Secret management (Firebase credentials)
- Build pipeline configuration and validation
- GitHub Pages / GitHub Actions integration
- Firestore security rules and data initialization
- Testing the deployment flow (staging → production)
- Monitoring, incident response, and rollback procedures
- Post-launch checklist and handoff

**Target outcome**: A fully operational, zero-cost MVP deployment with zero downtime, automated CI/CD, and documented runbooks for incident response.

---

## 2. Tech Stack & Platform Alignment

### Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Database**: Firebase Firestore (managed, external)
- **Authentication**: Firebase Auth (managed, external)
- **Build tool**: Node.js 20 (via npm scripts)
- **Linting**: ESLint (flat config)
- **Type checking**: TypeScript strict mode (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`)

### Platform

- **Hosting**: GitHub Pages (static, HTTPS, CDN-backed)
- **CI/CD**: GitHub Actions (auto-deploy on push to `main`)
- **DNS**: Custom domain `www.jublio.pl` (via CNAME)
- **Cost**: $0/month (GitHub Pages + GitHub Actions free tier)

### Key Constraints from Infrastructure Decision

| Constraint                 | Impact                                                                      | Mitigation                                                 |
| -------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **No server-side compute** | Cannot render dynamic OpenGraph tags for social shares                      | Accept MVP limitation; plan pre-render service post-launch |
| **Firebase direct-access** | Security rules are the only defense against scrapers                        | Narrow security rules; enable Firestore rate limiting      |
| **GitHub Actions minutes** | 2,000 free minutes/month (20 concurrent jobs max)                           | Monitor build time; keep lint/build fast                   |
| **30–90s rebuild lag**     | Slower iteration than Netlify (5–10s rebuilds)                              | Accept as MVP trade-off; optimize Vite build later         |
| **Secrets in GitHub**      | Firebase keys stored as GitHub Secrets; leaked keys require manual rotation | Use explicit GitHub Secrets marking; audit logs monthly    |
| **Manual rollback**        | No one-click rollback; requires git revert + re-push                        | Document rollback SOP; MTTR ~3–5 minutes                   |

---

## 3. Pre-Deployment Checklist

### 3.1 Repository Configuration

- [ ] **Default branch is `main`**: Confirm GitHub repo settings > Branch > Default branch is set to `main` (where CI/CD triggers)
- [ ] **GitHub Actions workflow exists**: `.github/workflows/deploy.yml` is in place and triggers on push to `main`
- [ ] **Workflow references correct build script**: Workflow runs `npm run build` which compiles TypeScript and bundles Vite
- [ ] **Workflow publishes to `gh-pages` branch**: `peaceiris/actions-gh-pages@v3` step deploys `dist/` to `gh-pages`
- [ ] **CNAME file is generated**: Workflow step `echo "www.jublio.pl" > dist/CNAME` ensures GitHub Pages routes to custom domain

### 3.2 Firebase Project Setup

- [ ] **Firebase project is created**: Visit Firebase Console and verify project exists
- [ ] **Firestore database is initialized**: Create a Firestore instance (location: closest to your users, or us-central1 for MVP)
- [ ] **Firebase credentials are available**: Copy API key, auth domain, project ID, storage bucket, messaging sender ID, app ID from Firebase Console > Project Settings
- [ ] **Firestore collection schema is designed**: Document the schema (e.g., `milestones` collection with fields: `userId`, `date`, `title`, `createdAt`, etc.)

### 3.3 GitHub Pages Configuration

- [ ] **Pages source is set to `gh-pages` branch**: Repo Settings > Pages > Source = "Deploy from a branch" > Branch = `gh-pages`
- [ ] **Custom domain is configured**: Repo Settings > Pages > Custom domain = `www.jublio.pl`
- [ ] **DNS is pointing to GitHub**: Update DNS provider (Netlify, Route53, GoDaddy, etc.) to point `www.jublio.pl` to GitHub's servers or via CNAME
- [ ] **DNS propagation is complete**: Verify with `nslookup www.jublio.pl` or `dig www.jublio.pl` (can take 5–30 minutes)
- [ ] **GitHub Pages validates domain**: Repo Settings > Pages should show "Domain verified" (check after DNS is live; may take 10–15 minutes)
- [ ] **HTTPS is enforced**: GitHub Pages auto-provisions Let's Encrypt cert; confirm "Enforce HTTPS" is checked in Pages settings

### 3.4 Local Environment Setup

- [ ] **Node.js 20+ is installed**: Verify `node --version` returns v20+
- [ ] **npm dependencies are installed**: Run `npm ci` (clean install from package-lock.json)
- [ ] **TypeScript compiles cleanly**: Run `npm run build` locally; must pass TypeScript strict mode and ESLint
- [ ] **Build output exists**: Verify `dist/` directory contains `index.html`, JS bundles, CSS, and assets
- [ ] **Vite build is reproducible**: Run `npm run build` twice; output should be identical (no random hashes)

---

## 4. GitHub Secrets Configuration

### 4.1 Store Firebase Credentials

Create GitHub Secrets for each Firebase credential. These will be injected into the build environment at CI/CD time.

**Steps**:

1. Go to GitHub repo > Settings > Secrets and variables > Actions
2. Create **7 new repository secrets** (one per Firebase credential):

| Secret Name                         | Value Source                                             | Example Value                        |
| ----------------------------------- | -------------------------------------------------------- | ------------------------------------ |
| `VITE_FIREBASE_API_KEY`             | Firebase Console > Project Settings > Web API Key        | `AIzaSyD1-e7yXrJ2Nzk...`             |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Firebase Console > Project Settings                      | `jubilee-xyz.firebaseapp.com`        |
| `VITE_FIREBASE_PROJECT_ID`          | Firebase Console > Project Settings                      | `jubilee-xyz`                        |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Firebase Console > Project Settings                      | `jubilee-xyz.appspot.com`            |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase Console > Project Settings                      | `123456789012`                       |
| `VITE_FIREBASE_APP_ID`              | Firebase Console > Project Settings                      | `1:123456789012:web:abc...`          |
| `VITE_FIREBASE_DATABASE_URL`        | (Optional) Firebase Realtime DB URL if using Realtime DB | `https://jubilee-xyz.firebaseio.com` |

**Important**:

- Do NOT include these values in `firebaseConfig.json` or any committed file
- GitHub automatically masks these values in Actions logs (redacts as `***`)
- Only repo admins can read these values; contributors cannot

### 4.2 Inject Secrets into Build

The GitHub Actions workflow must reference these secrets and pass them to the build.

**Current workflow** (`.github/workflows/deploy.yml`) should be updated to:

```yaml
name: Deploy to GitHub Pages

on:
  push:
	branches: [main]

jobs:
  build-and-deploy:
	runs-on: ubuntu-latest

	env:
	  VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
	  VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
	  VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
	  VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
	  VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
	  VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}

	steps:
	  - uses: actions/checkout@v4

	  - uses: actions/setup-node@v4
		with:
		  node-version: '20'

	  - run: npm ci

	  - run: npm run lint

	  - run: npm run build

	  - name: Add CNAME file
		run: echo "www.jublio.pl" > dist/CNAME

	  - uses: peaceiris/actions-gh-pages@v3
		with:
		  github_token: ${{ secrets.GITHUB_TOKEN }}
		  publish_dir: ./dist
```

**Changes**:

- Added `env:` block to inject Firebase secrets as environment variables
- Added `npm run lint` step before build (catch ESLint errors early)
- CNAME generation remains intact

---

## 5. Build Pipeline Validation

### 5.1 Local Build Test

Before pushing to CI, validate the build locally to catch errors early.

**Steps**:

```bash
# Clean install dependencies
npm ci

# Run linter (must pass)
npm run lint

# Run TypeScript strict compilation (must pass)
npm run build

# Verify dist directory contents
ls -la dist/
  # Expected: index.html, main.*.js, main.*.css, favicon.ico, CNAME (will be added by GitHub Actions)

# Verify CNAME NOT in dist yet (Actions adds it)
cat dist/CNAME  # Should not exist locally; Actions adds it during deploy
```

### 5.2 Environment Variable Injection Test

Verify that Vite correctly injects Firebase env vars into the bundle.

**Local test** (simulate CI environment):

```bash
# Set env vars locally (simulate GitHub Actions injection)
export VITE_FIREBASE_API_KEY="test-api-key"
export VITE_FIREBASE_PROJECT_ID="test-project-id"
# ... (set all 6 Firebase env vars)

# Build
npm run build

# Check that env vars were injected into the bundle
grep -r "test-api-key" dist/  # Should find it in main.*.js (minified)
grep -r "test-project-id" dist/
```

If env vars are NOT in the bundle, verify that `src/main.tsx` or your Firebase config file correctly references `import.meta.env.VITE_*`.

### 5.3 Artifact Inspection

Verify the built artifacts are production-ready.

**Checklist**:

- [ ] `dist/index.html` exists and is an HTML file (not a directory)
- [ ] `dist/main.*.js` exists (main bundle, minified)
- [ ] `dist/main.*.css` exists (styles, minified)
- [ ] Total bundle size is under 500 KB (React 19 + Vite typical: 100–200 KB gzipped)
- [ ] No source maps in `dist/` (security: don't expose source code in production)
- [ ] `dist/favicon.ico` exists if configured

**Bundle size check**:

```bash
du -sh dist/
  # Expected: 200–400 KB (uncompressed); 50–100 KB (gzipped)
```

---

## 6. Firestore Security Rules Configuration

### 6.1 Initial Rules (MVP — Public Read, Authenticated Write)

For MVP launch, use permissive rules that allow:

- **Read**: Anyone can read all milestones (public discovery)
- **Write**: Only authenticated users can create/update milestones they own
- **Delete**: Only the owner (or admins) can delete

**Firestore Rules** (paste into Firebase Console > Firestore > Rules):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

	// Default deny
	match /{document=**} {
	  allow read, write: if false;
	}

	// Milestones collection
	match /milestones/{milestoneId} {
	  // Public read (anyone, even not authenticated)
	  allow read: if true;

	  // Authenticated users can create/update their own
	  allow create: if
		request.auth != null &&
		request.auth.uid == request.resource.data.userId;

	  allow update: if
		request.auth != null &&
		request.auth.uid == resource.data.userId;

	  allow delete: if
		request.auth != null &&
		request.auth.uid == resource.data.userId;
	}

	// Users collection (optional: store user profiles)
	match /users/{userId} {
	  allow read: if true;
	  allow write: if request.auth != null && request.auth.uid == userId;
	}
  }
}
```

**Publish these rules** by clicking "Publish" in the Firebase Console.

### 6.2 Rate Limiting (Firestore Quota Policy)

Firestore enforces quotas automatically. For MVP, default quotas are sufficient:

- **Read**: 50,000 reads/day (free tier); 1,000 reads/sec (burst)
- **Write**: 20,000 writes/day (free tier); 100 writes/sec (burst)

**Monitor quotas**:

- Firebase Console > Firestore > Usage > Quota usage (check daily during first week)
- Set up email alerts if approaching limits (Firebase Console > Billing > Quota alerts)

### 6.3 Test Rules in Firestore Simulator

Before launching, test security rules using the Firestore simulator.

**Test case 1: Unauthenticated read**

- Simulator > Query path: `milestones/{doc}`
- Request context: Unauthenticated (leave `auth` field empty or set to `null`)
- Expected: ✅ ALLOW (public read)

**Test case 2: Authenticated write (own milestone)**

- Simulator > Query path: `milestones` (create new)
- Request context: Authenticated (`auth.uid = "user123"`)
- Request data: `{ userId: "user123", date: "2026-06-01", title: "Engagement" }`
- Expected: ✅ ALLOW (user owns the milestone)

**Test case 3: Authenticated write (other user's milestone)**

- Simulator > Query path: `milestones/{doc}` (existing doc owned by "user456")
- Request context: Authenticated (`auth.uid = "user123"`)
- Request data: `{ userId: "user456", ... }` (trying to write as user456 but authenticated as user123)
- Expected: ❌ DENY (user does not own the milestone)

---

## 7. Firestore Data Initialization (Seed Data)

### 7.1 Initial Collections & Schema

Create the initial collections and seed data for testing.

**Collection**: `milestones`
**Schema**:

```json
{
  "userId": "user123", // String: Firebase Auth UID
  "date": "2026-06-01", // String: ISO 8601 date (YYYY-MM-DD)
  "title": "Engagement Anniversary", // String: user-friendly name
  "unitType": "days", // String: "days", "weeks", "months", etc.
  "createdAt": 1746000000, // Number: Unix timestamp (ms)
  "updatedAt": 1746000000, // Number: Unix timestamp (ms)
  "isPublic": true // Boolean: whether to show in public gallery
}
```

### 7.2 Seed Data Creation

Create 2–3 sample milestones in Firestore to test the app locally and in production.

**Steps**:

1. Firebase Console > Firestore > Create collection > `milestones`
2. Add document (auto-generate ID or use custom ID):
   ```json
   {
     "userId": "demo-user",
     "date": "2025-01-15",
     "title": "1000 Days Together",
     "unitType": "days",
     "createdAt": 1746000000,
     "updatedAt": 1746000000,
     "isPublic": true
   }
   ```
3. Repeat for 2–3 additional milestones

These seed milestones will be visible to all users in the public gallery and used for smoke testing post-deployment.

---

## 8. GitHub Actions Workflow Deployment

### 8.1 First Deployment (Trigger)

**Method 1: Manual push to `main`**

```bash
git add .
git commit -m "chore: prepare for initial deployment"
git push origin main
```

**Method 2: GitHub CLI**

```bash
gh workflow run deploy.yml  # If workflow file name is deploy.yml
```

**Expected behavior**:

- GitHub Actions job starts automatically (visible in repo > Actions tab)
- Workflow runs: checkout → setup Node → npm ci → npm run lint → npm run build → GitHub Pages deploy
- Takes ~2–3 minutes total (1 min build + 1 min GitHub Pages publish)

### 8.2 Monitor the Workflow

**In GitHub UI**:

1. Repo > Actions tab
2. Click on the workflow run (should show as "in progress")
3. Watch the build steps: each step shows logs in real-time
4. On success: workflow shows ✅ and publish step completes

**Via GitHub CLI**:

```bash
gh run list --workflow deploy.yml --limit 1
  # Shows the latest run status

gh run view <run-id> --log
  # Streams live logs of the run

gh run watch <run-id>
  # Waits for run to complete and shows final status
```

### 8.3 Verify Deployment

Once workflow completes, verify the site is live.

**Steps**:

1. **Visit the site**: Go to `https://www.jublio.pl` in your browser
2. **Check HTTP response**: Open DevTools (F12) > Network tab > reload > check that `index.html` returns HTTP 200 (not 404)
3. **Check browser console**: DevTools > Console tab > should be no critical errors (warnings are OK)
4. **Test Firebase connection**: Check that Firebase Firestore queries return data (e.g., milestone list loads)
5. **Check page source**: View > Page source (or right-click > View page source) > verify it contains your React bundle hash

**If deployment fails**:

1. Check GitHub Actions logs: repo > Actions > latest run > see error message
2. Common errors:
   - `npm run lint` fails → fix ESLint errors in code, commit, push
   - `npm run build` fails → fix TypeScript errors, commit, push
   - Secrets not set → check that all 6 Firebase secrets are in GitHub repo Settings > Secrets
   - CNAME domain not validated → check GitHub Pages settings > custom domain validation status

---

## 9. Testing the Deployed App (Smoke Tests)

### 9.1 Functional Tests

Once the site is live, run these smoke tests to verify core functionality.

**Test 1: Page loads**

- [ ] Visit `https://www.jublio.pl`
- [ ] Page loads within 3 seconds
- [ ] React app mounts (no blank page)
- [ ] Header, navigation, and layout are visible

**Test 2: Firestore queries work**

- [ ] Milestone list loads from Firestore
- [ ] Seed data appears in the UI
- [ ] Calculations display correctly (e.g., "1000 days")

**Test 3: User authentication (if implemented)**

- [ ] Sign-up/Login flow works
- [ ] Firebase Auth correctly returns user UID
- [ ] User-specific data is queryable after login

**Test 4: Create milestone (if implemented)**

- [ ] User can create a new milestone
- [ ] Data is saved to Firestore
- [ ] New milestone appears in the list
- [ ] Page refreshes; milestone persists (data is in DB, not just local state)

**Test 5: Browser compatibility**

- [ ] Test on Chrome, Firefox, Safari
- [ ] Verify responsive design (mobile, tablet, desktop)

### 9.2 Performance Tests

**Lighthouse audit** (Chrome DevTools):

1. Open site in Chrome
2. F12 > Lighthouse tab
3. Generate report for "Desktop" and "Mobile"
4. Expected scores (MVP baseline):
   - Performance: ≥ 70
   - Accessibility: ≥ 80
   - Best practices: ≥ 80
   - SEO: ≥ 70

**Bundle size check**:

- DevTools > Network tab > load page > check JS bundle size
- Expected: < 300 KB (React 19 + Vite typical: 100–150 KB gzipped)

### 9.3 Security Validation

**Firebase security check**:

- [ ] Unauthenticated users can read milestones (public read)
- [ ] Unauthenticated users **cannot** write milestones (should fail silently in UI or show error)
- [ ] Authenticated users can only modify their own milestones

**HTTPS check**:

- [ ] Site redirects HTTP to HTTPS (type `http://www.jublio.pl`, should redirect to `https://`)
- [ ] Browser shows secure lock 🔒 in address bar
- [ ] Certificate is valid (not expired, not self-signed)

---

## 10. Monitoring & Incident Response

### 10.1 Daily Monitoring (First Week Post-Launch)

**Checklist**:

- [ ] Check GitHub Actions logs daily for any build failures
- [ ] Monitor Firebase Console for quota usage (should be < 10% of daily limit for MVP)
- [ ] Monitor browser console errors (Firefox/Chrome DevTools; check from different regions if possible)
- [ ] Check site uptime (manually visit or use a simple uptime monitor like UptimeRobot)

### 10.2 Error Tracking

**Browser Console Errors**:

- Errors are logged to DevTools Console (only user can see; not centralized)
- Consider integrating Sentry, Rollbar, or similar for error tracking post-MVP

**Firebase Console Logs**:

- Firebase Console > Firestore > Usage & Logs
- Check for security rule violations, quota limits exceeded, etc.

### 10.3 Incident Response Runbook

**Scenario 1: Site returns 404 (not found)**

**Steps**:

1. Check GitHub Pages settings: Repo > Settings > Pages
2. Verify `gh-pages` branch exists and is up-to-date: `git branch -a`
3. Check GitHub Actions logs: Repo > Actions > latest run > see error
4. Fix issue (e.g., update GitHub Secrets, fix build error) and re-push to `main`
5. Wait 2–3 minutes for Actions to rebuild and publish
6. Verify site is live again

**Typical MTTR**: 5–10 minutes

---

**Scenario 2: Firebase queries fail (firestore error in console)**

**Steps**:

1. Check Firebase credentials in GitHub Secrets: Repo > Settings > Secrets
2. Verify Firebase project is live: Firebase Console > Overview
3. Check Firestore security rules: Firebase Console > Firestore > Rules
4. Test security rules in simulator (see Section 6.2)
5. Check browser console for specific Firebase error (e.g., `auth/invalid-api-key`)
6. If credentials are wrong, update GitHub Secrets and re-push to `main`
7. Rebuild and test

**Typical MTTR**: 5–15 minutes

---

**Scenario 3: GitHub Actions times out (build takes > 5 minutes)**

**Steps**:

1. Check Actions logs: Repo > Actions > latest run
2. Identify slow step (usually `npm run build` or `npm install`)
3. Check bundle size: `npm run build` locally and measure `dist/` size
4. If build is slow, optimize:
   - Remove unused dependencies
   - Enable Vite build caching: add `cacheDir` to `vite.config.ts`
   - Consider splitting bundle
5. Commit optimizations and re-push

**Typical MTTR**: 10–20 minutes (includes local testing)

---

### 10.4 Rollback Procedure

**If a deployment introduces a critical bug**:

**Steps**:

1. Identify the commit that caused the issue: `git log --oneline -n 10`
2. Revert the commit: `git revert <commit-hash>`
3. Push the revert commit: `git push origin main`
4. GitHub Actions triggers automatically; rebuilds and deploys the reverted code
5. Wait 2–3 minutes for Actions to complete and site to update
6. Verify site is working again

**Example**:

```bash
git log --oneline -n 5
# Output:
# abc1234 (HEAD) broke feature X
# def5678 added feature X
# ghi9012 (main)

git revert abc1234

git push origin main
# GitHub Actions automatically triggers and deploys the revert

# Check Actions tab in 2–3 minutes; site should be back to state before "broke feature X"
```

**Typical MTTR**: 3–5 minutes (just revert + re-push + wait for Actions)

---

## 11. Post-Launch Monitoring (Ongoing)

### 11.1 Weekly Checklist

- [ ] Monitor GitHub Actions build time (target: < 3 minutes)
- [ ] Check Firebase quota usage (should stay < 20% of daily limit)
- [ ] Review GitHub Actions logs for any warnings or deprecations
- [ ] Monitor custom domain DNS status (should remain "validated")

### 11.2 Monthly Checklist

- [ ] Audit GitHub Secrets (ensure no expired or unnecessary secrets)
- [ ] Review Firestore security rules (tighten if needed as features add)
- [ ] Monitor GitHub Actions minute usage (should stay well under 2,000/month)
- [ ] Update dependencies (run `npm outdated`; update non-major versions)

### 11.3 Security Hardening (Post-MVP)

These are out of scope for MVP but plan for post-launch:

- **Social sharing metadata**: Implement a pre-render service (e.g., `prerender.io` or self-hosted via Cloud Run) for OpenGraph tags
- **Backend gateway**: If Firestore direct-access becomes a bottleneck or security concern, add a backend (Cloud Run, Netlify Functions) as a gateway
- **Error tracking**: Integrate Sentry or Rollbar for centralized error logging
- **Rate limiting**: Firestore native rate limiting; if insufficient, add Cloudflare Rate Limiting or backend gateway rate limiter

---

## 12. Risk Mitigation Summary

| Risk                                | Mitigation                                                                                  | Owner     | Timeline   |
| ----------------------------------- | ------------------------------------------------------------------------------------------- | --------- | ---------- |
| **Firebase credentials leak**       | Audit Actions logs monthly; rotate keys immediately if exposed                              | DevOps    | Ongoing    |
| **Firestore quota exhaustion**      | Monitor Firebase Console daily (first week), weekly (ongoing); rate-limit clients if needed | DevOps    | Ongoing    |
| **Build failure blocks deployment** | ESLint + TypeScript must pass locally before push; Actions gate ensures early detection     | Developer | Pre-commit |
| **CNAME domain validation fails**   | Verify DNS is configured before deploying; GitHub Pages validates within 5–15 min           | DevOps    | Pre-launch |
| **Social sharing broken**           | Accept MVP limitation (no OpenGraph); plan pre-render service for post-MVP                  | Product   | Post-MVP   |
| **Slow rebuild times**              | Optimize Vite config; accept 30–90s lag as MVP trade-off                                    | DevOps    | Post-MVP   |

---

## 13. Deployment Checklist (Pre-Launch)

### Step 1: Secrets Setup

- [ ] 6 Firebase credentials are stored as GitHub Secrets
- [ ] Workflow file (`deploy.yml`) references secrets via `${{ secrets.VITE_* }}`
- [ ] Lint complete: no console.log statements that might leak secrets

### Step 2: Build Validation

- [ ] `npm ci` runs without errors locally
- [ ] `npm run lint` passes locally
- [ ] `npm run build` produces `dist/` with `index.html`, JS bundles, CSS
- [ ] Bundle size is < 500 KB (uncompressed)

### Step 3: GitHub Pages Setup

- [ ] `gh-pages` branch exists (will be created by Actions)
- [ ] Pages source is configured to deploy from `gh-pages`
- [ ] Custom domain is set to `www.jublio.pl`
- [ ] DNS is configured and pointing to GitHub
- [ ] Domain validation shows "verified" in GitHub Pages settings

### Step 4: Firebase Setup

- [ ] Firestore database is created and initialized
- [ ] Security rules are deployed (tested in simulator)
- [ ] Seed data is loaded (2–3 test milestones exist)

### Step 5: Local Validation

- [ ] Workflow file syntax is correct: `gh workflow validate .github/workflows/deploy.yml`
- [ ] Repository name and branch names are correct in workflow
- [ ] CNAME file generation is correct (hardcoded in workflow)

### Step 6: Pre-Deploy Smoke Test

- [ ] Push a test commit: `git commit --allow-empty -m "test: pre-deployment check"`
- [ ] Monitor Actions tab: workflow should succeed within 3 minutes
- [ ] Visit site: `https://www.jublio.pl` should load and display seed milestones
- [ ] Check browser console: no critical errors
- [ ] Revert test commit: `git reset --hard HEAD~1` (if needed)

### Step 7: Launch Approval

- [ ] All steps 1–6 complete ✓
- [ ] Team approves launch
- [ ] Final commit: `git commit -m "chore: launch jubilee to production"`
- [ ] Tag release: `git tag -a v1.0.0 -m "MVP launch"` and `git push origin v1.0.0`
- [ ] Announce launch (social, email, etc.)

---

## 14. Success Criteria

**MVP deployment is successful when**:

1. ✅ Site is live at `https://www.jublio.pl` and returns HTTP 200
2. ✅ React app loads without critical console errors
3. ✅ Firestore queries work; seed milestones are visible
4. ✅ Build passes ESLint + TypeScript checks automatically on every push to `main`
5. ✅ GitHub Pages publishes within 2–3 minutes of push
6. ✅ HTTPS is enforced; browser shows secure lock 🔒
7. ✅ Firestore security rules prevent unauthorized writes
8. ✅ Custom domain `www.jublio.pl` resolves and serves the app
9. ✅ Rollback procedure works: revert commit → site reverts to prior version within 5 minutes
10. ✅ Monitoring is in place: GitHub Actions logs, Firebase Console quotas, browser error tracking

---

## 15. References

- **Infrastructure decision**: @context/foundation/infrastructure.md (risk register, operational story, anti-bias checks)
- **Tech stack**: @context/foundation/tech-stack.md (React 19, Vite, TypeScript, Firebase)
- **Lessons learned**: @context/foundation/lessons.md (no lodash without justification; use native JS/TS)
- **Contributor guide**: @AGENTS.md (build/test/deploy commands; code style)
- **GitHub Actions docs**: https://docs.github.com/en/actions
- **GitHub Pages docs**: https://pages.github.com
- **Firebase Firestore docs**: https://firebase.google.com/docs/firestore
- **Vite build docs**: https://vitejs.dev/guide/build.html

---

## 16. Document History

| Version | Date       | Author     | Changes                                                                                                         |
| ------- | ---------- | ---------- | --------------------------------------------------------------------------------------------------------------- |
| 1.0     | 2026-05-25 | AI Copilot | Initial MVP deployment plan for GitHub Pages + GitHub Actions; aligned with infrastructure.md and tech-stack.md |

---

## 17. Sign-Off

**Deployment Plan reviewed and approved for execution.**

**Next steps**:

1. Execute checklist in Section 13 (steps 1–6)
2. Resolve any blockers (missing secrets, DNS issues, build failures)
3. Once checklist is complete, proceed to Section 13, Step 7 (launch)
4. Monitor post-launch (Section 11)

**Questions or blockers?** Reference the relevant section above or @context/foundation/infrastructure.md for platform constraints.

---

_End of Deployment Plan_

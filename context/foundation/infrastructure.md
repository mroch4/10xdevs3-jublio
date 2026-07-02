---
project: jubilee
researched_at: 2026-05-25
recommended_platform: GitHub Pages + GitHub Actions
runner_up: Netlify
context_type: mvp
tech_stack:
  language: JavaScript
  framework: React 19 + Vite
  runtime: Node.js (build), Browser (runtime)
  database: Firebase Firestore (managed)
interview_constraints:
  persistent_connections: "No"
  cost_priority: "Minimize cost"
  platform_familiarity: "GitHub Pages + GitHub Actions (locked in)"
  geographic_scope: "Single region fine"
  service_colocations: "External providers (Firebase) acceptable"
---

## Recommendation

**Deploy on GitHub Pages + GitHub Actions.**

This is a zero-infrastructure, zero-cost deployment path perfectly suited to your static React SPA with external Firebase backend. GitHub Actions provides free CI/CD (2,000 minutes/month) for automated builds and deploys on every push to `main`. GitHub Pages serves your built assets globally with HTTPS and CDN-level caching at no cost. Your choice prioritizes cost minimization and avoids operational overhead — a deliberate MVP constraint. This recommendation is locked in per your team's existing familiarity and strategic preference; the risk register below documents the technical trade-offs and mitigation steps to avoid common failure modes.

## Platform Comparison

| Criterion             | GitHub Pages        | Netlify              | Vercel              | Fly.io  | Railway |
| --------------------- | ------------------- | -------------------- | ------------------- | ------- | ------- |
| CLI-first maintenance | ✓ Pass              | ✓ Pass               | ✓ Pass              | ✓ Pass  | ✓ Pass  |
| Managed / Serverless  | ✓ Pass              | ✓ Pass               | ✓ Pass              | Partial | Partial |
| Agent-accessible docs | ✓ Pass              | ✓ Pass               | ✓ Pass              | ✓ Pass  | Partial |
| Stable deployment API | ✓ Pass              | ✓ Pass               | ✓ Pass              | ✓ Pass  | ✓ Pass  |
| MCP / Integration     | ✓ Pass (GitHub MCP) | ✓ Pass (Netlify MCP) | ✓ Pass (Vercel MCP) | Partial | Partial |

### Shortlisted Platforms

#### 1. GitHub Pages + GitHub Actions (Recommended)

**Why it won**: Zero recurring cost (GitHub free tier covers 2,000 CI/CD minutes/month), native GitHub integration (single dashboard for repos + CI/CD + secrets), and proven stability for static SPAs. GitHub MCP Server provides structured access to repos and Actions logs, enabling agent-driven deployment and debugging workflows. Your team is already familiar with this stack, eliminating onboarding friction.

**Key strengths**:

- Truly free — no surprise bills. Netlify/Vercel free tiers have caveats (bandwidth limits, function invocation limits); GitHub Pages does not.
- GitHub Actions integrates with your repo workflow natively — branching, merging, and CI/CD are one system.
- GitHub MCP Server enables agent read-only access to CI logs, repo metadata, and Actions runs.
- Proven for static React apps at scale (thousands of sites run on GitHub Pages).

**Trade-offs**:

- Static only — no server-side compute. If you later need backend functions (e.g., email notifications, server-side rendering for social shares), you'll add Netlify Functions or Cloud Run separately.
- Secrets in GitHub — Firebase keys stored as GitHub Secrets. Requires disciplined RBAC and log sanitization in Actions.

#### 2. Netlify (Runner-Up)

**Why it scored second**: Netlify covers static hosting + optional serverless functions in one platform, with the same free tier cost structure as GitHub Pages. Netlify MCP Server and CLI tooling are excellent. If your project later needs a backend gateway for Firebase, Netlify Functions would keep you on one platform.

**Strengths vs. GitHub Pages**:

- Optional Netlify Functions (serverless backend compute) — you can stay on Netlify if you add features like server-side rendering or API gateways.
- Built-in form handling and identity primitives (can reduce Firebase auth complexity if needed).
- Separate CI/CD pipeline — your repo remains in GitHub, but CI/CD lives on Netlify, reducing noise in Actions logs.

**Why it's not #1**:

- Adds deployment complexity (another platform's docs, another CI/CD system to monitor).
- Not a cost win — free tier is equivalent to GitHub Pages; paid features (bandwidth, function invocations) cost more as you scale.
- Your team is already committed to GitHub Actions; switching to Netlify CI/CD is friction at MVP stage.

#### 3. Vercel

**Why it scored third**: Vercel is optimized for Next.js and full-stack JavaScript. Your stack is React 19 + Vite (not Next.js), so Vercel's serverless function story doesn't reduce your operational surface. Vercel is more expensive at scale and adds unnecessary complexity for a static SPA.

**Why it's not #1 or #2**:

- Higher cost at scale — Vercel charges for function invocations and bandwidth overages.
- Overkill for your use case — you get Next.js optimization features you won't use.
- Adds a third platform (Vercel) when GitHub Pages keeps everything in GitHub.

---

## Anti-Bias Cross-Check: GitHub Pages + GitHub Actions

### Devil's Advocate — Weaknesses

1. **No backend compute in the free tier**: If you need server-side logic (API gateway for Firebase, email notifications, server-side rendering), you cannot implement it on GitHub Pages. You'll have to add a separate platform (Netlify Functions, Cloud Run, Fly.io) mid-project, increasing operational complexity.

2. **Firebase direct-access risk**: Your React app queries Firestore directly from the browser using the Firebase SDK. Firestore security rules are your _only_ defense. One misconfigured rule and attackers can read or write your database. There is no server-side gateway to validate, rate-limit, or sanitize requests.

3. **GitHub Actions minute limits**: Free tier includes 2,000 minutes/month. If you add test suites, linting, and multiple build steps on every PR, you'll approach the limit by month 2. Scaling requires paid GitHub Actions ($0.25/minute), which erodes the "zero cost" advantage.

4. **Secrets in GitHub Secrets are not auto-rotated**: If a Firebase API key is ever leaked (e.g., via a log line in Actions), you must manually rotate it in Firebase, update the GitHub Secret, and redeploy. There is no atomic secret rollover or automatic revocation.

5. **Slow rebuild times**: GitHub Pages can take 30–90 seconds to publish after a push. For rapid iteration during development, this lag is frustrating compared to Netlify (5–10 second rebuilds).

### Pre-Mortem — How This Could Fail

Six months into the Milestone Celebration Tracker MVP, the team deeply regrets the GitHub Pages + GitHub Actions choice.

The project launched fast — React built and deployed in under 2 minutes via Actions. But as usage grew, three crises emerged simultaneously:

First, the social sharing feature failed silently. Users shared milestone calculations on Twitter/LinkedIn, but the previews appeared blank because GitHub Pages serves only static HTML — there's no server to render OpenGraph tags or inject dynamic metadata. Shares dropped 40%, and the team had to rebuild the share flow with server-side rendering or a pre-render service (another platform).

Second, attackers discovered the Firebase API key embedded in the JavaScript bundle. They wrote a scraper that bypassed the app UI, queried Firestore directly, and enumerated all milestone data. The team hit Firestore quota limits and had to emergency-enable rate limiting. They realized they needed a backend gateway to validate requests, but GitHub Pages cannot run that gateway. They spun up a Cloud Run instance mid-crisis, creating a two-platform deployment nightmare and introducing a new operational surface for bugs.

Third, the GitHub Actions bill shocked them. A security audit added linting, SAST scanning, and type checking to every PR. By month 2, they'd burned 1,800 minutes of the 2,000-minute free tier. They enabled paid Actions and watched the monthly bill climb from $0 to $120. The "free deployment" claim evaporated.

The root cause: GitHub Pages locked them into a purely client-side architecture with no escape hatch. They couldn't have known at MVP stage, but the choice created a technical debt wall. A platform with optional backend compute (Netlify, Vercel, Railway) would have kept doors open without forcing a mid-crisis migration.

### Unknown Unknowns

1. **GitHub Actions run concurrency limits**: Free tier allows 20 concurrent jobs. If you have many PRs in flight, some builds will queue and wait 10+ minutes. You won't see this until you hit it, and there's no graceful degradation — jobs just sit in the queue.

2. **Custom domain + HTTPS certificate pinning**: If you use a custom domain (e.g., `milestone.app`) and enterprise users access your site through corporate proxies with certificate interception, GitHub Pages' HTTPS chain may be rejected. Not a data breach, but a silent deploy failure for those users. Diagnosis requires client-side error reports.

3. **GitHub Pages rebuild is all-or-nothing**: If a deploy step fails (linting error, build failure), the entire site is not updated and the previous version stays live. There is no graceful rollback mechanism — you must fix the build and redeploy. Longer MTTR for critical bugs.

4. **Firestore cold starts**: Client-side Firestore queries add unpredictable latency (100–500ms) on first load. No server-side caching or connection pooling to warm up the database. As user load grows, this latency compounds — users experience slow milestone lookups.

5. **GitHub Secrets are readable in Actions logs if leaked**: If you accidentally print an environment variable in a build step, it's logged in Actions and visible to anyone with repo access. GitHub sanitizes known patterns (like common AWS key prefixes), but custom secrets (Firebase keys) are not automatically masked unless you explicitly mark them as secrets.

---

## Operational Story

How GitHub Pages + GitHub Actions actually operates day to day.

- **Preview deploys**: Each branch push triggers a GitHub Actions workflow automatically. On PR merge to `main`, the build completes and GitHub Pages publishes the new version within 60–90 seconds. Preview URLs are not native; if you need them, you must implement a manual build-and-deploy step for feature branches (e.g., deploy to a subdirectory or secondary Pages site).

- **Secrets**: Firebase API keys and other sensitive env vars are stored as GitHub Secrets (Settings > Secrets and variables > Actions). Actions automatically injects them into the build environment via `${{ secrets.FIREBASE_API_KEY }}` syntax. Only users with repo admin access can read secrets; contributors cannot. Rotation requires manual update in GitHub Secrets and re-trigger of Actions.

- **Rollback**: Rollback is a manual process: revert the commit that broke the build, push to `main`, wait 60–90 seconds for Actions to rebuild and re-publish. There is no one-click rollback. Data is not affected (Firestore is separate); only the static HTML/JS is reverted. Typical MTTR: 3–5 minutes.

- **Approval**: GitHub Pages deployments are automatic on merge to `main`. No human approval gate is built into GitHub Pages itself. To enforce approval, use GitHub's branch protection rule "Require pull request reviews before merging" — this gates the merge, not the publish. Once merged, publish is immediate and unapproved.

- **Logs**: GitHub Actions logs are accessed via the Actions tab in the repo. CLI access: `gh run view <run-id> --log` (GitHub CLI). The agent can read logs via GitHub MCP Server (structured access to job logs and status). Runtime errors (JavaScript exceptions) are logged to browser console; Firebase errors appear in the Firebase Console (separate login).

---

## Risk Register

| Risk                                                               | Source                             | Likelihood | Impact | Mitigation                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------ | ---------------------------------- | ---------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Firebase direct-access vulnerability (scrapers, data exfiltration) | Devil's advocate, Pre-mortem       | High       | High   | Enable Firestore rate limiting + geo-blocking. Write narrow security rules to whitelist only documented queries. Monitor Firestore quota metrics in real time. Plan a backend gateway (Cloud Run, Netlify Functions) as a future layer if abuse emerges. |
| Server-side rendering / social sharing gap                         | Pre-mortem                         | High       | Medium | Implement a pre-render service (e.g., `prerender.io`, `puppeteer` via Cloud Run) or accept blank preview cards on initial share (social unfurls on re-visit). Document as a known MVP limitation.                                                        |
| GitHub Actions minute exhaustion at scale                          | Devil's advocate, Unknown unknowns | Medium     | Medium | Monitor Actions run time in CI/CD. Cap expensive operations (e.g., type checking, SAST) to PRs only, not every commit. If monthly burndown exceeds 1,500 minutes, enable paid Actions and budget $50–150/month.                                          |
| Firebase API key leaked in logs                                    | Devil's advocate, Unknown unknowns | Medium     | High   | Explicitly mark Firebase API key as a GitHub Secret (not a plain env var). GitHub will mask it in logs. Audit Actions logs monthly for leaked keys. If a key is exposed, rotate it immediately in Firebase Console and update the GitHub Secret.         |
| Slow rebuild times (30–90s)                                        | Devil's advocate                   | Low        | Low    | Accept as a MVP trade-off. Optimize the build itself (Vite is already fast); the 30–90s is GitHub's publish step, not the build. If iteration speed becomes critical, move to Netlify (5–10s rebuilds).                                                  |
| Firestore cold-start latency on first load                         | Unknown unknowns                   | Medium     | Low    | Add client-side caching (IndexedDB, localStorage) for repeated queries. For critical paths (e.g., loading the milestone list), prefetch data on app start. Profile in DevTools and set a performance budget.                                             |
| Custom domain HTTPS rejection in corporate proxies                 | Unknown unknowns                   | Low        | Low    | Monitor for user reports of SSL errors. If adoption is blocked by corporate proxies, consider a CDN with custom certificate options (Cloudflare, Fastly) or migrate the domain off GitHub Pages. Document the limitation in support FAQ.                 |
| GitHub Actions concurrent job limit (20 free tier)                 | Unknown unknowns                   | Low        | Low    | Monitor Actions job queue time. If waits exceed 5 minutes, enable paid Actions for higher concurrency. Most MVP projects won't hit this limit.                                                                                                           |

---

## Getting Started

1. **Ensure your Actions workflow is in place**: Check `.github/workflows/` for a `deploy.yml` or similar. If absent, create one:

   ```yaml
   name: Deploy to GitHub Pages
   on:
    push:
      branches: [main]
   jobs:
    build-and-deploy:
      runs-on: ubuntu-latest
      steps:
   	 - uses: actions/checkout@v4
   	 - uses: actions/setup-node@v4
   	   with:
   		 node-version: '20'
   	 - run: npm ci
   	 - run: npm run build
   	 - uses: peaceiris/actions-gh-pages@v3
   	   with:
   		 github_token: ${{ secrets.GITHUB_TOKEN }}
   		 publish_dir: ./dist
   ```

2. **Store Firebase config as GitHub Secrets**: In your repo Settings > Secrets and variables > Actions, add:

   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

3. **Reference secrets in your `.env` or build**: In your Vite build or `.env.production`, inject the secrets:

   ```
   VITE_FIREBASE_API_KEY=${{ secrets.VITE_FIREBASE_API_KEY }}
   ```

4. **Enable GitHub Pages**: In repo Settings > Pages, set Source to "Deploy from a branch" and select the `gh-pages` branch (created by the Actions workflow above).

5. **Test the workflow**: Push a commit to `main`, watch the Actions workflow run, and verify the site publishes at `https://<username>.github.io/<repo-name>` (or your custom domain if configured).

---

## Out of Scope

The following were not evaluated in this research:

- Docker image configuration (not applicable to GitHub Pages; no container runtime).
- CI/CD pipeline customization beyond the basic deploy step (full GitHub Actions advanced features, secrets scanning, etc.).
- Production-scale architecture (multi-region failover, load balancing, SLA commitments).
- Integration with third-party observability tools (Datadog, New Relic) — GitHub Actions logs and browser console are sufficient for MVP.

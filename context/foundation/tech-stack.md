---
starter_id: vite-react
package_manager: npm
project_name: jubilee
hints:
  language_family: js
  team_size: solo
  deployment_target: github-pages
  ci_provider: github-actions
  ci_default_flow: auto-deploy-on-merge
  bootstrapper_confidence: best-effort
  path_taken: custom
  quality_override: false
  self_check_answers:
	typed: true
	from_official_starter: true
	conventions: true
	docs_current: true
	can_judge_agent: false
  has_auth: true
  has_payments: false
  has_realtime: false
  has_ai: false
  has_background_jobs: false
---

## Why this stack

Vite + React 19 + TypeScript provides a modern, fast development experience with explicit type safety. Bootstrap handles styling with familiar utilities, reducing custom CSS overhead. Firebase Firestore offers serverless database + authentication out of the box, eliminating backend scaffolding complexity. GitHub Pages provides free static hosting with automatic deploys via GitHub Actions. This stack prioritizes simplicity and speed-to-ship for a solo builder focused on agentic workflow over architectural complexity—no server-side rendering, no edge functions, just a straightforward client-side SPA with managed backend services. The 4/5 self-check score (strong on types, conventions, and docs; learning on agent judgment) is typical for solo learners and can be compensated via CLAUDE.md rules and explicit review prompts.

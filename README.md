# Jublio - Milestone Celebration Tracker

> Turn everyday dates into surprise celebration moments by surfacing non-obvious anniversaries.

[![Tests](https://img.shields.io/badge/tests-116%20passing-brightgreen)](test-results/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb)](https://react.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.14-orange)](https://firebase.google.com/)

**Jublio** is a web application that helps you calculate, manage, and celebrate meaningful moments across different time units. Track relationship milestones, personal achievements, cultural events, and historical dates—then discover unique celebration opportunities like "1,000 days since our wedding" or "10,000 hours since I quit smoking."

## ✨ Features

### For Everyone (No Account Required)

- 📅 **Milestone Calculator** - Input any memorable date and instantly see future milestones in multiple time units
  - Days, weeks, months (for dates)
  - Hours, minutes, seconds (for dates with time)
  - Power-of-10 intervals: 10, 100, 1,000, 10,000, 100,000, 1,000,000
- 📆 **Calendar Export** - One-click export to Google Calendar, Apple Calendar, or Outlook with pre-filled event details
- 🎨 **Custom Milestones** - Add your own milestone values (e.g., 420 days, 777 hours) beyond the default power-of-10 intervals
- 🎯 **Smart Filtering** - Automatically filters unrealistic milestones (>75 years in the future)
- 🌍 **Multi-locale Support** - Date formatting respects your browser locale
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### For Logged-In Users

- 🔖 **Bookmark Portfolio** - Save important dates with unique labels and access them from any device
- 🔄 **Real-time Sync** - Your bookmarks automatically sync across all your devices
- ✏️ **Edit & Manage** - Update bookmark labels or dates with automatic milestone recalculation
- 🚫 **Title Uniqueness** - Prevents duplicate bookmark labels (case-insensitive)

### Sharing & Discovery

- 📲 **Social Share** - Share milestones with context-aware text generation
  - Automatic past/present/future tense: "Today's exactly 1,000 days..." or "On July 15, it will be exactly..."
  - Multiple platforms: WhatsApp, Twitter, LinkedIn, Reddit, Facebook, Email, Copy to clipboard
  - Character limits enforced (Twitter 280, Facebook 5,000)
  - Includes attribution link for viral growth

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Firebase account (for authentication and database)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/mroch4/10xdevs3-jublio.git
   cd 10xdevs3-jublio
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up Firebase**

   Create a `.env` file in the root directory with your Firebase configuration:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
   VITE_FIREBASE_PROJECT_ID=your_project_id_here
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket_here
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
   VITE_FIREBASE_APP_ID=your_app_id_here
   ```

   Get these values from your [Firebase Console](https://console.firebase.google.com/) project settings.

4. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

### Firebase Setup

You'll need to configure:

1. **Authentication**

   - Enable Email/Password sign-in (for magic link authentication)
   - Configure authorized domains for production

2. **Firestore Database**
   - Create a database (start in test mode, then configure security rules)
   - Recommended security rules:
     ```javascript
     rules_version = '2';
     service cloud.firestore {
       match /databases/{database}/documents {
         match /milestones/{email}/bookmarks/{document=**} {
           allow read, write: if request.auth != null && request.auth.token.email == email;
         }
       }
     }
     ```

## 🧪 Testing

Jublio has comprehensive test coverage with **116 passing tests** covering edge cases, business logic, and integrations.

```bash
# Run tests once (CI mode)
npm test

# Run tests in watch mode (development)
npm run test:watch
```

### Test Coverage Highlights

- ✅ **Leap year handling** - Validates date math across leap years (2020-02-29 + 1,000 days)
- ✅ **DST & timezone edge cases** - Temporal API integration prevents DST bugs
- ✅ **75-year life expectancy filter** - Tests boundary conditions (exactly 75 years vs 76 years)
- ✅ **Calendar export formats** - Validates Google Calendar URLs, Outlook URLs, and .ics files
- ✅ **Social share text generation** - Tests all 6 tense variants and character limits
- ✅ **Custom milestone validation** - Positive integers only, respects life expectancy filter

See [`context/foundation/test-plan.md`](context/foundation/test-plan.md) for the complete test strategy and risk mapping.

## 📦 Building for Production

```bash
# Build the app
npm run build

# Preview the production build locally
npm run preview
```

The build output will be in the `dist/` directory, ready for deployment to any static hosting service (GitHub Pages, Netlify, Vercel, etc.).

## 🛠️ Tech Stack

### Frontend

- **React 19.2** - UI library with modern hooks and concurrent features
- **TypeScript 6.0** - Type-safe development with strict mode enabled
- **Vite 8.1** - Fast build tool with HMR (Hot Module Replacement)
- **Bootstrap 5.3** - Responsive UI components and utilities

### Backend & Services

- **Firebase Authentication** - Passwordless magic link sign-in (email-based)
- **Firebase Firestore** - Real-time NoSQL database with offline support
- **Firebase Hosting** - Static site hosting (for production deployment)

### Key Libraries

- **[@js-temporal/polyfill](https://www.npmjs.com/package/@js-temporal/polyfill)** - Modern date/time handling (replaces legacy Date API)
  - Prevents DST bugs, leap year edge cases, and timezone issues
  - Used throughout the app for milestone calculations
- **file-saver** - Client-side .ics file generation for Apple Calendar
- **react-tooltip** - Accessible tooltips for UI hints

### Development & Testing

- **Vitest 4.1** - Fast unit/integration testing framework (Vite-native)
- **ESLint 10** - Code quality and consistency enforcement
- **Husky 9.1** - Git hooks for pre-commit linting/type-checking
- **TypeScript ESLint 8** - TypeScript-specific linting rules

## 📁 Project Structure

```
jublio/
├── src/
│   ├── components/          # React components
│   │   ├── modals/          # Modal dialogs (Auth, Bookmark, Calendar, Share, etc.)
│   │   ├── BookmarksView.tsx
│   │   ├── MilestoneCalculator.tsx
│   │   └── MilestoneResults.tsx
│   ├── contexts/            # React context providers
│   │   └── AuthContext.tsx  # Firebase auth state management
│   ├── firebase/            # Firebase configuration and services
│   │   ├── config.ts        # Firebase initialization
│   │   ├── authService.ts   # Magic link authentication logic
│   │   └── firestoreService.ts  # CRUD operations for bookmarks
│   ├── hooks/               # Custom React hooks
│   │   └── useAuth.ts       # Auth context consumer hook
│   ├── utils/               # Business logic and utilities
│   │   ├── classes/         # Core domain models
│   │   │   ├── CardBase.ts  # Base class for date cards
│   │   │   ├── DateCard.ts  # Date-only milestone calculations
│   │   │   ├── DateTimeCard.ts  # Date+time milestone calculations
│   │   │   ├── Milestone.ts # Milestone model with category logic
│   │   │   └── Bookmark.ts  # Bookmark model
│   │   ├── __tests__/       # Unit/integration tests
│   │   ├── calendarExport.ts
│   │   ├── socialShare.ts
│   │   ├── validation.ts
│   │   └── constants.ts
│   ├── App.tsx              # Root component
│   └── main.tsx             # Entry point
├── context/                 # 10xDevs workflow documentation
│   ├── foundation/          # Living project documentation
│   │   ├── prd.md           # Product Requirements Document (262 lines)
│   │   ├── test-plan.md     # Test strategy with risk mapping (326 lines)
│   │   ├── shape-notes.md   # Product shaping and vision
│   │   └── README.md        # Foundation doc conventions
│   ├── archive/             # Historical implementation notes
│   └── changes/             # Change-scoped documentation
├── test-results/            # Test output and reports
├── public/                  # Static assets
├── .github/                 # GitHub Actions CI/CD
└── package.json
```

## 🧑‍💻 Development Workflow

### Code Quality Tools

All code passes through:

1. **ESLint** - Enforces code style and catches common errors
2. **TypeScript Compiler** - Type-checks all code with strict mode
3. **Vitest** - Runs 116 tests on every commit
4. **Husky Pre-commit Hooks** - Prevents committing broken code

```bash
# Lint the codebase
npm run lint

# Type-check without building
npx tsc --noEmit
```

### Documentation-Driven Development

This project follows the **10xDevs workflow**:

1. **Foundation Docs First** - Write PRD, test plan, and shape notes BEFORE coding
2. **Change-Scoped Documentation** - Each feature/fix gets its own change doc
3. **Living Documentation** - Docs evolve with the codebase (edit-in-place)

Key documents:

- [`context/foundation/prd.md`](context/foundation/prd.md) - Product vision, user stories, requirements
- [`context/foundation/test-plan.md`](context/foundation/test-plan.md) - Risk-based test strategy
- [`context/foundation/shape-notes.md`](context/foundation/shape-notes.md) - Product shaping and persona

## 🎯 Roadmap & Future Enhancements

### Completed (MVP)

- ✅ Anonymous milestone calculation
- ✅ Magic link authentication
- ✅ Bookmark portfolio with CRUD operations
- ✅ Calendar export (Google, Apple, Outlook)
- ✅ Social sharing with context-aware text
- ✅ Custom milestone values
- ✅ Real-time Firestore sync
- ✅ Comprehensive test suite (116 tests)

### Planned (Post-MVP)

- 🔜 AI-generated social share images (DALL-E or Stable Diffusion)
- 🔜 E2E tests with Playwright (auth flow, bookmark sync)
- 🔜 Progressive Web App (PWA) features (offline support, install prompt)
- 🔜 Email/push notifications (optional alternative to calendar export)
- 🔜 Multi-language UI (i18n beyond date formatting)
- 🔜 Milestone analytics dashboard (most celebrated milestones, portfolio stats)

See [`context/foundation/prd.md`](context/foundation/prd.md) for detailed non-goals and open questions.

## 🤝 Contributing

This is a student project for the [10xDevs](https://10xdevs.io/) certification program. Contributions are welcome!

### Guidelines

1. Read the [PRD](context/foundation/prd.md) to understand the product vision
2. Check the [test plan](context/foundation/test-plan.md) before adding features
3. Write tests for new functionality (see existing tests in `src/utils/__tests__/`)
4. Follow the existing code style (enforced by ESLint)
5. Update documentation if you change behavior

### Running Locally

See the [Quick Start](#quick-start) section above.

## 📄 License

This project is part of the 10xDevs Builder certification block. All rights reserved.

## 🙏 Acknowledgments

- **10xDevs Program** - For the structured workflow and certification guidance
- **Temporal API Polyfill** - For making date math actually work correctly
- **Firebase** - For managed authentication and real-time database
- **React Community** - For the amazing ecosystem and tooling

## 📞 Contact

- **Author:** Marcin Rochowski
- **GitHub:** [@mroch4](https://github.com/mroch4)
- **Repository:** [10xdevs3-jublio](https://github.com/mroch4/10xdevs3-jublio)

---

**Built with ❤️ as part of the 10xDevs certification program**

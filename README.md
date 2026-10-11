# MaxOut Workout Tracker

MaxOut is a workout and fitness tracker built with React, TypeScript, Vite, and Supabase. It supports account sign-in, a guided fitness profile, workout planning and logging, progress statistics, achievements, and account settings.

## Requirements

- Node.js 20.19+ or 22.12+
- npm
- A Supabase project for authentication and cloud data storage

## Getting Started

1. Install dependencies from the project root:

   ```sh
   npm install
   ```

2. Create a `.env.local` file in the project root and add your Supabase project URL and anon key:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

   These are browser-side configuration values. Do not put a Supabase service-role key in a `VITE_` variable or commit real credentials.

3. In the Supabase dashboard, open **SQL Editor** and run [`supabase_setup.sql`](supabase_setup.sql) and [`supabase_diet.sql`](supabase_diet.sql). These scripts create the workout and core diet tables and enable row-level security policies for user data.

4. Start the development server:

   ```sh
   npm run dev
   ```

   Open the local URL printed by Vite, usually `http://localhost:5173`.

Create an account in the app, then complete onboarding to set up your profile and fitness goals.

## Features

- Email/password authentication, Google sign-in, and password reset
- Guided onboarding for profile details, biometrics, activity level, fitness goals, and dietary preferences
- Day templates that can be organized into scheduled workout programs
- Active and freestyle workout sessions with exercise and set logging
- Workout history, bodyweight tracking, progress statistics, strength estimates, and streaks
- Achievement tracking with categories and progress toward locked achievements
- Profile and account settings, password changes, and JSON data export

## Using the App

After signing in for the first time, complete onboarding. The profile information is used to personalize fitness goals and calculations. You can return to the Settings screen to update profile details or account security options.

| Screen | What it is for |
| --- | --- |
| Dashboard (`/`) | Review your training level, recent activity, active program, and achievement progress. |
| Planner (`/routines`) | Create day templates, assemble multi-day programs, browse templates, and activate a schedule. |
| Session (`/session`) | Start the active program's workout for today or start a freestyle session. |
| Workout (`/workout`) | Log exercises and sets during a session. A workout can also be opened with an ID at `/workout/:id`. |
| Measure (`/stats`) | Review workout trends, bodyweight history, exercise progress, streaks, and training goals. |
| Trophies (`/achievements`) | Review earned achievements, in-progress achievements, and achievement categories. |
| Settings (`/settings`) | Edit your fitness profile, change your password, export data, or sign out. |

### Suggested Workout Flow

1. Open **Planner** and create one or more day templates, such as a push, pull, or legs day. The Discover tab can also import a built-in template.
2. Create a program and assign a template or rest day to each day in its schedule.
3. Activate the program. The app uses its start date and schedule to determine the current program day.
4. Open **Session** and start the scheduled workout, or choose a freestyle workout.
5. Log exercises and sets, then use **Measure** and the dashboard to review your history and progress.

## Available Commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Type-check the app and create the production build in `dist/`. |
| `npm run preview` | Serve the production build locally for a preview. |
| `npm run lint` | Run ESLint across the project. |

## Supabase Notes

### Authentication Setup

The login screen supports email/password sign-in, account creation, password reset, and Google OAuth. In the Supabase dashboard:

1. Enable the email provider. Decide whether new accounts require email confirmation; when confirmation is required, users must follow the link sent by Supabase before signing in.
2. If you want Google sign-in, enable the Google provider and configure its credentials. Use the callback URL provided by Supabase in your Google OAuth client configuration.
3. In **Authentication → URL Configuration**, set the production site URL and allow the local development origin (usually `http://localhost:5173`) plus your deployed app origin. Update these values if Vite selects a different port or your domain changes.

### Database Setup

Run both SQL scripts once in the Supabase SQL Editor against the project used by the app:

- [`supabase_setup.sql`](supabase_setup.sql) creates `workouts`, `routines`, `bodyweights`, `goals`, `programs`, `active_program`, and exercise `favorites` tables.
- [`supabase_diet.sql`](supabase_diet.sql) creates `meals`, `water_logs`, `diet_goals`, `bodyweight_records`, `diet_routines`, `diet_programs`, and `active_diet_program` tables.

Both scripts enable row-level security and add policies that restrict rows to the signed-in user. Keep these policies enabled. If you change the schema or create additional tables, add equivalent user-scoped policies before storing personal data.

The included scripts do not create every table referenced by optional app features. In particular, profile synchronization expects a `profiles` table, while custom-food and favorite-meal synchronization expects `food_items` and `favorite_meals`. If those tables are missing, the app falls back to browser `localStorage` for those parts of the data. Local data is limited to the current browser/device, is not shared across devices, and is not included in Supabase backups. Create the additional tables and secure them with row-level security if those features need cloud sync.

Only the Supabase project URL and anon/public key belong in this frontend's `VITE_` environment variables. Never expose a service-role key in the app or commit credentials. The anon key is intended for client use when database access is protected by correct row-level security policies.

## Application Architecture

- `src/App.tsx` defines the public login route, protected onboarding route, and authenticated application routes. Route-level pages are lazy-loaded.
- `AuthProvider` manages the Supabase session and user profile. `WorkoutProvider` and `DietProvider` expose domain data to screens through React context hooks.
- `src/lib/supabase.ts` creates the Supabase client from the Vite environment variables.
- `src/data/` contains the exercise database, default workout templates, achievements, and food data used by the UI.
- `src/utils/` and `src/lib/` contain calculations and shared domain helpers such as streak and warm-up calculations.

## Deployment

1. Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the hosting provider's build environment.
2. Build the app with `npm run build`. Vite writes the static production files to `dist/`.
3. Publish `dist/` and configure the host's build command as `npm run build` and publish directory as `dist`.
4. Add an SPA fallback so requests for app routes return `index.html`. This is required for routes such as `/settings`, `/stats`, and `/workout/:id` when users open or refresh them directly.
5. Add the deployed site origin to Supabase's allowed redirect URLs and set it as the production Site URL.

Vite embeds `VITE_` values during the build. If you change either value in the hosting environment, trigger a new build and deployment. To test the production output locally, run `npm run preview` after `npm run build`.

## Troubleshooting

| Symptom | Checks |
| --- | --- |
| Supabase connection or login errors | Confirm `.env.local` is at the project root, both variable names are exact, and the development server was restarted after changing the file. Verify the URL and anon key in the Supabase project settings. |
| Email signup does not sign in immediately | Check whether email confirmation is enabled and follow the confirmation link. Verify the local or deployed origin is in Supabase's allowed redirect URLs. |
| Google sign-in fails | Confirm the Google provider is enabled in Supabase and the Supabase callback URL is registered in the Google OAuth client. |
| A route returns 404 after refresh or when opened directly | Configure the hosting provider's SPA fallback to return `index.html` for unknown file paths. Client-side navigation alone does not configure server rewrites. |
| Data appears on one device but not another | Check that the required Supabase tables and row-level security policies exist. Data using the local fallback remains in that browser and does not sync. |
| Production build fails | Run `npm run build` locally to see TypeScript or Vite errors before deploying. |

## Project Structure

```text
src/
  components/   Shared UI and dialogs
  context/      Authentication, workout, diet, and app-mode state
  data/         Default routines, exercises, and food data
  hooks/        Reusable state hooks
  lib/          Supabase client and domain helpers
  pages/        Route-level screens
  types/        Shared TypeScript types
  utils/        Fitness calculations and coaching helpers
scripts/        Data processing scripts
public/         Static assets and food data
```

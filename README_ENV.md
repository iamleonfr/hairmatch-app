Set up local environment variables

1. Copy the example file to create a local env file (this file is gitignored):

   cp .env.local.example .env.local

2. Open `.env.local` and fill in your Supabase project values:

   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key

   # Optional for AI features

   # REACT_APP_OPENAI_KEY=sk-...

3. Restart the dev server:

   npm start

Notes:

- `.env.local` is ignored by git by default (see `.gitignore`).
- After updating `.env.local`, you must restart the development server for CRA to pick up changes.

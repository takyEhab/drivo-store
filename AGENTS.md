# AGENTS.md

## Project Context

This is the Drivo Store application repository — a modern e-commerce storefront for car accessories in Egypt built with React 18, Vite, Tailwind CSS, and backed by Supabase.

Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup and environment variables.

## Key Files

- `src/`: frontend application source.
- `src/api/apiClient.js`: frontend API client exporting `api`, `entities`, `auth`, `functions`.
- `src/api/entities.js`: Supabase entities CRUD adapter.
- `src/lib/supabase.js`: Supabase SDK initialization.
- `vite.config.js`: Vite configuration and aliases.
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Use `npm run dev` for local frontend development.
- The backend runs on Supabase (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`).
- Run `npm run build` or relevant checks from `package.json` before finishing code changes.

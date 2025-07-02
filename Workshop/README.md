# Get Ready Workshop Display System

A complete vehicle preparation display system for car dealership workshops. Includes:
- TV Display (workshop-display): Large, live-updating queue for workshop TV
- Admin Panel (workshop-admin): Secure CRUD for jobs
- Mobile App (workshop-mobile): Salespeople can view/add/mark jobs complete
- Backend API (PD-Get-Ready/workshop-server): Node.js + Express + JSON/SQLite

## Project Structure

- `PD-Get-Ready/workshop-server/` — Node.js backend API
- `workshop-display/` — TV display React app
- `workshop-admin/` — Admin React app
- `workshop-mobile/` — Mobile React app for salespeople

## Local Development

1. **Backend**
   ```sh
   cd PD-Get-Ready/workshop-server
   npm install
   npm start
   ```
   Runs on http://localhost:3001 by default.

2. **Frontends** (in separate terminals)
   ```sh
   cd workshop-display && npm install && npm run dev
   cd workshop-admin && npm install && npm run dev
   cd workshop-mobile && npm install && npm run dev
   ```
   Each runs on its own Vite dev server (default: 5173, 5174, 5175).

## Deploying to Render

1. Push this repo to GitHub.
2. Go to [Render.com](https://render.com/), create a new Blueprint (YAML) deploy.
3. Connect your repo. Render will auto-detect `render.yaml` and set up four services:
   - Backend API (Node)
   - TV Display (static)
   - Admin (static)
   - Mobile (static)
4. Set any required environment variables in the Render dashboard (see `render.yaml`).
5. Deploy! Each service will get its own URL.

## Features
- Australian date/time formatting
- Live updates (WebSocket or polling)
- Secure admin and salesperson login
- Responsive, TV/mobile-optimized UIs

---

For questions or support, see the code comments or contact the maintainer. 
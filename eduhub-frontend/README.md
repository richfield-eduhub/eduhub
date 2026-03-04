# EduHub Frontend

The frontend application for the EduHub project, built with **React 19**, **TypeScript**, and **Vite**.

This package is part of the [EduHub monorepo](../README.md).

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- npm (comes with Node.js)

## Getting Started

### 1. Navigate to the frontend directory

From the monorepo root:

```bash
cd eduhub-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` by default. Vite provides Hot Module Replacement (HMR), so changes to your code will reflect in the browser instantly.

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `dev` | `npm run dev` | Start the Vite development server with HMR |
| `build` | `npm run build` | Type-check with TypeScript and build for production |
| `preview` | `npm run preview` | Preview the production build locally |
| `lint` | `npm run lint` | Run ESLint across the codebase |

## Project Structure

```
eduhub-frontend/
├── public/              # Static assets (served as-is, not processed by Vite)
├── src/
│   ├── assets/          # Images and other assets imported by components
│   ├── App.tsx          # Root application component
│   ├── App.css          # App component styles
│   ├── main.tsx         # Entry point — mounts the React app to the DOM
│   └── index.css        # Global styles
├── index.html           # HTML entry point
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript project references
├── tsconfig.app.json    # TypeScript config for app source code
├── tsconfig.node.json   # TypeScript config for build tooling
└── eslint.config.js     # ESLint configuration (flat config format)
```

## Tech Stack

- **React** 19 — UI library
- **TypeScript** 5.9 — Type-safe JavaScript (strict mode enabled)
- **Vite** 7 — Build tool and dev server
- **ESLint** 9 — Linting with React hooks and refresh plugins

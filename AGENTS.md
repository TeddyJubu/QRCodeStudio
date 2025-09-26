# QRCodeStudio Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-09-26

## Active Technologies

- TypeScript 5.6.3, React 18.3.1 + Vite 5.4.19, Express 4.21.2, Drizzle ORM 0.39.1, shadcn/ui components (001-setup-development-environment)
- PostgreSQL via Neon serverless, session storage with connect-pg-simple (001-setup-development-environment)

## Project Structure

```
client/
server/
shared/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript: Follow standard conventions

## Recent Changes

- 001-setup-development-environment: Added TypeScript 5.6.3, React 18.3.1 + Vite 5.4.19, Express 4.21.2, Drizzle ORM 0.39.1, shadcn/ui components

<!-- MANUAL ADDITIONS START -->

## Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run check` - Run TypeScript type checking
- `npm run db:push` - Push database schema changes

## Code Style

- **TypeScript**: Strict mode enabled, prefer explicit types
- **Components**: Functional components with hooks, PascalCase naming
- **Imports**: Use aliases `@/*` for client/src, `@shared/*` for shared
- **Styling**: Tailwind CSS with shadcn/ui components, follow design guidelines
- **Files**: PascalCase for components, camelCase for utilities
- **Error handling**: Try-catch with proper error logging and user feedback
<!-- MANUAL ADDITIONS END -->

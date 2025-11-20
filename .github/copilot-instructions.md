# AI Development Guidelines for Toyzinger PIM

This file provides instructions for AI assistants (Copilot, Antigravity, Cursor, etc.) working on this project.

## Package Management

- **Always use both `--legacy-peer-deps` and `--registry` flags** when running npm install commands
  ```bash
  npm install <package> --legacy-peer-deps --registry https://registry.npmjs.org/
  ```

## Project Structure

```
/
├── src/
│   ├── api/          # Backend API routes (Express)
│   ├── app/          # Angular application
│   └── server.ts     # SSR server entry point
├── uploads/          # User-uploaded images (gitignored)
│   └── images/
├── public/           # Static assets
└── dist/             # Production build output
```

## Development Workflow

- **Dev server**: `ng serve` → http://localhost:4200
- **SSR server**: `npm run serve:ssr:toyzinger-pim` → http://localhost:4000
- **Build**: `npm run build` (generates `dist/`)

## Code Standards

### TypeScript
- Use strict mode
- Prefer `const` over `let`
- Use type annotations

### Angular
- Follow Angular style guide
- Use standalone components
- Use signals where applicable

### Styling
- Use SCSS (not CSS)
- Variables in `src/styles/_variables.scss`
- BEM naming convention

## Environment Configuration

- Firebase already configured
- Storage bucket: `toyzinger-pim.firebasestorage.app`
- Uploads directory: `uploads/images/` (not in git)

## Build Considerations

- Bundle size limit: 2MB (configured in `angular.json`)
- If build fails due to size, adjust budgets
- Production build outputs to `dist/toyzinger-pim/`

## API Development

- API routes go in `src/api/`
- Mount routes in `src/server.ts`
- Use Express Router pattern
- Always validate request data
- Handle errors gracefully

## Git

- Never commit `node_modules/`
- Never commit `uploads/` folder
- Never commit environment secrets

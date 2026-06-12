# Dassah's Prism: Phase 3 Architecture
This document outlines the migration from the monolith structure to a monorepo.

## Structure
- `packages/core`: Shared components, utilities, and types.
- `apps/prism-parents`: Parent Dashboard.
- `apps/prism-exec`: Exec Dashboard.
- `apps/prism-scholar`: University Dashboard.

## Migration Steps
1. Create workspaces.
2. Extract components to `packages/core`.
3. Configure `turbo.json`.
4. Update `package.json` with workspace settings.

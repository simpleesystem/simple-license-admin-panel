# Changelog

All notable changes to the Simple License System Admin Panel are documented in
this file. This project adheres to
[Semantic Versioning](https://semver.org/) and the
[Keep a Changelog](https://keepachangelog.com/) format. Commit messages follow
[Conventional Commits](https://www.conventionalcommits.org/).

The version of record lives in `package.json`. Releases are tagged `v<x.y.z>`
in this repository; a version bump plus a changelog entry accompany every tag.

## [Unreleased]

Nothing yet.

## [1.0.0] - 2026-06-10

First declared release, capturing the panel as built between December 2025 and
June 2026. This versions the current state rather than re-narrating six months
of pre-release iteration; highlights below.

### Core infrastructure

- React + TypeScript + Vite single-page admin for the Simple License Server.
- JWT authentication with role-based permissions; CASL ability-driven UI gating
  (`IfCan` / `IfPermission`), route guards via TanStack Router, and login flows
  that hydrate user state and preserve the requested route through refresh.
- React Query data fetching with standardized error handling, error
  boundaries, in-flow toast banners, idle timeout, and cross-tab session sync.
- React Hook Form + Joi form infrastructure, reusable workflow blueprints, and
  shared UI "legos" (batch-action tables, pagination footers, table
  truncation/zero-run collapse, click-to-copy, entity cross-links).
- Vitest + MSW test architecture with Stryker mutation testing.

### Feature surfaces

- **Licenses**: create/edit/suspend, revoke vs. soft delete (clearly
  separated), batch soft delete, license freeze, and an admin Change Domain
  action backed by the server's atomic change-domain endpoint — including
  surfacing the created replacement if the revoke leg fails.
- **Products**: product/tier/entitlement configuration, a requires-license
  toggle (keyless free products), and first-class Woo catalog sync opt-in
  controls.
- **Users & agent service accounts**: user management, agent service-account
  creation/editing, credential issue/revoke with history filters and search,
  admin-initiated password reset, and a direct "Set Service Password" action
  for non-interactive service accounts.
- **Releases**: catalog listings with artifact-presence badges, download
  actions, set-live with artifact feedback, batch actions, auto-refresh, and
  live-sync activity indicators.
- **Analytics, health & audit**: usage/analytics tables with search and
  pagination, tenant health metric rendering (readable summaries of rollup
  data), and audit log views.
- **Tenants**: tenant administration with system-access guards.

# Document Management BE Agent Guide

This file defines the working conventions for AI agents editing `document-management-be`.

Use these rules as defaults unless the user explicitly asks for a different structure.

## Core Agent Principles

These principles are high priority. Apply them before local style preferences.

### 1. Think Before Coding

- Understand the request before editing.
- Infer the real goal, not just the surface symptom.
- Prefer a short concrete plan for non-trivial changes.
- Fix the structural root cause when it is obvious.

### 2. Simplicity First

- Prefer the simplest solution that fully solves the problem.
- Avoid speculative abstractions.
- Keep changes local when they can stay local.

### 3. Surgical Changes

- Touch only the code required for the requested outcome.
- Do not mix unrelated cleanup into the same task unless the broken structure blocks the fix.
- Preserve behavior unless the task explicitly changes behavior.
- Remove dead code left behind by refactors.

### 4. Goal-Driven Verification

- Define what “done” means for the current task.
- Run the smallest useful verification first.
- Prefer real verification over assumptions:
  - `yarn lint`
  - `yarn build`
  - `tsc --noEmit`
  - focused app boot or test execution

## Scope

- Applies to the Nest backend app in `document-management-be`.
- Prefer changing code to match this guide instead of introducing one-off patterns.

## Working Style

- Keep responses short, direct, and action-focused.
- Do the work instead of stopping at analysis when the requested direction is clear.
- Prefer concrete edits over long proposals.
- Prefer strong opinions with clear technical reasoning over passive agreement.

## Project Structure

- `src/modules`: domain modules and business features
- `src/migrations`: migrations only
- `nestjs-core-utilities`: shared/global backend code
- `generated`: generated clients/types only

## Ownership Rules

- Domain code belongs in `src/modules/<domain>/<feature>`.
- Shared/global code belongs in `nestjs-core-utilities/*`.
- Do not leak shared/global concerns back into `src` root.
- Keep Nest layers separated:
  - controller = transport layer
  - service = business logic
  - repository = external IO / integration / data access helper
  - dto = request/query/response shape
  - module = wiring

## Import Rules

Use repo aliases when they match ownership:

- `nestjs-core-utilities`
- `nest-modules`

Prefer:

```ts
import { ApiResponse, PrismaModule } from 'nestjs-core-utilities';
import { TemplatesModule } from 'nest-modules';
```

Avoid:

- deep relative imports crossing ownership boundaries when an alias already exists
- moving domain code into `nestjs-core-utilities`
- importing shared/global code from ad hoc local copies

## Folder and File Naming

- Use lowercase kebab-case for folders and filenames.
- Do not use camelCase filenames.

Use these suffixes:

- `*.controller.ts`
- `*.service.ts`
- `*.module.ts`
- `*.repository.ts`
- `*.dto.ts`
- `*.type.ts`
- `index.ts`
- `*.spec.ts`

Examples:

- `template-data.controller.ts`
- `template-data.service.ts`
- `document-extraction.repository.ts`
- `query-audit-log.dto.ts`

## Module Shape

For feature modules, prefer this structure:

```txt
feature-name/
  dto/
    query-feature-name.dto.ts
  feature-name.controller.ts
  feature-name.service.ts
  feature-name.module.ts
  index.ts
```

For repository-backed integrations:

```txt
feature-name/
  feature-name.repository.ts
  feature-name.service.ts
  feature-name.module.ts
```

If a feature grows large, split by bounded responsibility, but keep naming consistent.

## Export Rules

- Do not use `export default`.
- Prefer named exports everywhere.
- Keep barrel files explicit and simple.
- Do not write recursive or broken barrels.

Good:

```ts
export * from './template-data.service';
export * from './template-data.module';
```

Bad:

```ts
export * from '.';
```

## Type Naming

Use these prefixes consistently:

- `I`: interfaces
- `T`: type aliases
- `E`: enums

Examples:

- `IApiResponseOptions`
- `TPaginationQuery`
- `ETemplateStatus`

## DTO and Response Rules

- Request/query payloads go in `dto/`.
- Shared/global DTOs belong in `nestjs-core-utilities/dto`.
- Shared/global response helpers belong in `nestjs-core-utilities/api`.
- Do not duplicate common pagination/response contracts per module if a shared version already exists.

## Controller and Service Rules

- Controllers should stay thin.
- Controllers should delegate business logic to services.
- Services should not become transport wrappers with no logic.
- Repositories should encapsulate external API or lower-level integration details.

## Formatting and Tooling

Use the repo scripts that already exist.

Common commands:

```sh
cd document-management-be
yarn lint
yarn build
./node_modules/.bin/tsc -p tsconfig.json --noEmit
yarn test
yarn start:dev
```

## Refactor Priorities

When cleaning code, prefer this order:

1. keep behavior working
2. fix imports/exports
3. normalize naming
4. move code into the correct layer
5. move shared/global concerns into `nestjs-core-utilities`
6. remove dead code

## Avoid

- default exports
- camelCase filenames
- broken barrel exports
- controllers full of business logic
- shared/global helpers scattered under `src`
- speculative wrappers with no clear payoff

## Current Direction

The preferred backend architecture is:

- module = domain boundary
- controller = entrypoint
- service = business logic
- repository = external access / integration
- dto = contract
- `nestjs-core-utilities` = shared/global backend layer

If you add a new module, follow this structure by default.

# reactjs-platform

Shared UI components and platform utilities for Next.js apps.

Package này có 2 nhóm export chính:

- `reactjs-platform/ui/*`: shared UI components.
- `reactjs-platform/utilities/*`: hooks, stores, API helpers, config, utils.

## Import

Prefer direct subpath imports:

```ts
import { Button } from 'reactjs-platform/ui/button';
import { cn } from 'reactjs-platform/utilities/utils/common.util';
```

Có thể import barrel khi cần, nhưng direct import dễ tree-shake và dễ trace hơn:

```ts
import { Button } from 'reactjs-platform/ui';
import { CookieService } from 'reactjs-platform/utilities';
```

## Local Development

Trong project đang đặt `reactjs-platform` dưới dạng workspace:

```json
{
  "workspaces": ["reactjs-platform"],
  "dependencies": {
    "reactjs-platform": "0.1.0"
  }
}
```

Cài dependency từ root project:

```sh
yarn install
```

Build package:

```sh
yarn --cwd reactjs-platform build
```

Typecheck riêng package:

```sh
yarn --cwd reactjs-platform typecheck
```

Pack thử như một npm package thật:

```sh
yarn --cwd reactjs-platform pack
```

## Build Output

Build dùng:

- `tsup`: build ESM JavaScript vào `dist`.
- `tsc -p tsconfig.build.json`: emit declaration files `.d.ts`.
- `package.json` `exports`: khai báo public entrypoints.

Không cần script sửa tay import trong `dist`.

Consumer app không cần:

- `next.config` `transpilePackages`
- `tsconfig` path aliases for `reactjs-platform`
- `components.json`

## Consumer Requirements

App dùng package cần có các peer dependencies:

- `next`
- `react`
- `react-dom`
- `react-hook-form`
- `next-themes`

Các package còn lại package đang tự kéo qua `dependencies`, ví dụ Radix UI, `axios`, `zustand`, `sonner`, `lucide-react`.

## Publish To NPM

Trước khi publish public nên đổi tên package thành scoped package riêng:

```json
{
  "name": "@your-scope/reactjs-platform"
}
```

Nếu publish public, đổi license phù hợp, ví dụ:

```json
{
  "license": "MIT"
}
```

Build và pack kiểm tra trước:

```sh
yarn build
yarn pack
```

Publish public scoped package:

```sh
npm login
npm publish --access public
```

Publish private scoped package:

```sh
npm login
npm publish --access restricted
```

Sau khi publish, project khác cài như package bình thường:

```sh
yarn add @your-scope/reactjs-platform
```

## Current Notes

- `dist/` là build output, không cần commit.
- `node_modules/` không commit.
- `ui/core-table` hiện đang exclude khỏi build vì còn dependency/type issue riêng.

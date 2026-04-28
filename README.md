# form-edu-maping-with-params

## Local `reactjs-platform` Setup

Project này đang dùng `reactjs-platform` như một local npm package qua Yarn workspace. Mục tiêu là dùng giống package thật, không copy UI/utilities vào từng project.

### Cấu trúc cần có

Đặt thư mục package ở root project:

```txt
your-project/
  package.json
  tsconfig.json
  tsconfig.base.json
  reactjs-platform/
    package.json
    ui/
    utilities/
```

### Root `package.json`

Thêm workspace:

```json
{
  "workspaces": ["reactjs-platform"]
}
```

Thêm dependency:

```json
{
  "dependencies": {
    "reactjs-platform": "0.1.0"
  }
}
```

Nên thêm scripts để build package trước khi build app:

```json
{
  "scripts": {
    "build": "yarn build:platform && next build",
    "build:platform": "yarn --cwd reactjs-platform build",
    "dev": "yarn build:platform && next dev",
    "typecheck": "yarn build:platform && tsc -p tsconfig.json --noEmit",
    "typecheck:platform": "yarn --cwd reactjs-platform typecheck"
  }
}
```

### Peer Dependencies Project Cần Có

Project app cần tự có:

```sh
yarn add next react react-dom react-hook-form next-themes
```

Nếu app đã có sẵn các package này thì không cần cài lại.

### TypeScript Setup

Không alias `reactjs-platform` trỏ vào source. App nên dùng package output từ `dist`.

Ví dụ `tsconfig.base.json`:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    },
    "moduleResolution": "bundler",
    "noEmit": true
  },
  "exclude": ["node_modules", "build", "dist", "reactjs-platform/**/*"]
}
```

### Gitignore

Đảm bảo ignore toàn bộ `node_modules`, kể cả package local:

```gitignore
node_modules/
```

Không cần commit:

```gitignore
reactjs-platform/dist/
reactjs-platform/*.tgz
```

### Lệnh Setup Khi Copy Qua Project Mới

Sau khi copy thư mục `reactjs-platform/` vào root project mới:

```sh
yarn install
yarn --cwd reactjs-platform build
yarn typecheck
yarn dev
```

### Cách Import

Import UI:

```ts
import { Button } from 'reactjs-platform/ui/button';
```

Import utilities:

```ts
import { cn } from 'reactjs-platform/utilities/utils/common.util';
```

### Khi Sau Này Publish NPM

Khi package đã được publish, bỏ workspace local nếu không cần develop chung nữa, rồi cài package từ npm:

```sh
yarn add @your-scope/reactjs-platform
```

Sau đó đổi import từ:

```ts
import { Button } from 'reactjs-platform/ui/button';
```

sang:

```ts
import { Button } from '@your-scope/reactjs-platform/ui/button';
```

Nếu vẫn giữ name là `reactjs-platform` thì không cần đổi import.

## API proxy `/api/leads`

### Env
- `FRAPPE_TOKEN`: token fallback nếu WebView không bơm header. Ví dụ: `7c0403719248098:c307a8d2994c052`
- `FRAPPE_BASE_URL` (optional): mặc định `https://erpnext.aurora-tech.com/api/method/lead.get_leads`

> Nếu Flutter WebView đã set `Authorization: token xxx` vào header, không cần `FRAPPE_TOKEN` env.

### Query params được nhận (URL hoặc `/api/leads`)
- `filters`: JSON string (optional). Ví dụ: `{"custom_role":"Student"}`
- `order_by`: mặc định `modified desc`
- `page`: mặc định `1`
- `page_size`: mặc định `10`

Ví dụ gọi proxy:
```
/api/leads?filters={"custom_role":"Student"}&order_by=modified desc&page=1&page_size=10
```
Nếu không có filters: chỉ cần `/api/leads?page=1&page_size=10`.

### Click mở lead (gửi sang app Flutter)
- Trong bảng, click vào tên lead sẽ gọi handler:
```
payload = { type: "open_lead", leadId, lead }
window.ReactNativeWebView?.postMessage(JSON.stringify(payload))
```
- App Flutter lắng nghe `onMessage` để mở màn chi tiết theo `leadId`. Fallback: log ra console nếu không có webview.

### Dev
```
yarn dev
```
Truy cập http://localhost:3000/mobile-table

# form-edu-maping-with-params

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

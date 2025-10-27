## SweetHotel — Login & Admin Dashboard (Tailwind)

Tôi đã thêm một trang Login và một trang Admin Dashboard dùng Tailwind và tích hợp chức năng đăng nhập thực tế với API bạn cung cấp.

Nội dung README này tập trung vào cách cài đặt và chạy project trên Windows (PowerShell), cách kiểm tra luồng đăng nhập, và một vài hướng dẫn xử lý sự cố thường gặp.

---

### Những thay đổi chính (tóm tắt)

- Cấu hình Tailwind / PostCSS: `tailwind.config.cjs`, `postcss.config.cjs`.
- CSS chính: `src/index.css` (đã thêm directive Tailwind).
- Auth:

  - `src/context/AuthContext.jsx` — provider, lưu user vào localStorage
  - `src/hooks/useAuth.js` — hook tiện lợi
  - `src/services/authService.js` — gọi API đăng nhập thật (POST tới `https://api.sweethotel.kodopo.tech/api/Auth/Login`), giải mã JWT để lấy thông tin user, và đặt token

  - `src/services/api.js` — helper lưu/đọc token và bọc fetch để gửi Authorization header
- Router & pages:
  - `src/routes/AppRouter.jsx` — routes chính, `PrivateRoute` cho `/admin`
  - `src/pages/Login/Login.jsx` — form email/password (có nút Fill demo)

  - `src/pages/Admin/Dashboard.jsx` — dashboard ví dụ
  - `src/components/layout/AdminLayout.jsx` — sidebar + logout

---

## Yêu cầu trước khi chạy

- Node.js (LTS) và npm cài sẵn. Kiểm tra bằng:

- Môi trường phát triển: Windows PowerShell (bạn đang dùng PowerShell v5.1 theo context).

---

## Cài đặt phụ thuộc

Chạy những lệnh sau trong thư mục gốc dự án (`d:\SweetHotel.Web\SweetHotel`):

```powershell
# Cài react-router
npm install react-router-dom

# Cài Tailwind và PostCSS (dev dependencies)
npm install -D tailwindcss postcss autoprefixer

# (Tuỳ chọn) Nếu muốn khởi tạo cấu hình Tailwind bằng CLI:
# npx tailwindcss init -p
```

Ghi chú: Tôi đã thêm `tailwind.config.cjs` và `postcss.config.cjs` cho bạn, vì vậy bước `init` là tuỳ chọn.

---

## Chạy trong môi trường phát triển

```powershell
npm run dev
```

Vite sẽ in ra URL (ví dụ `http://localhost:5173`) — mở URL đó trong trình duyệt.

---

## Xây dựng & preview

```powershell
npm run build
npm run preview
```

`npm run preview` phục vụ phiên bản build tại một cổng tạm thời để kiểm tra trước khi deploy.

---

## Kiểm tra luồng đăng nhập

1. Mở `/login` (hoặc truy cập `/admin` sẽ tự redirect về `/login` nếu chưa đăng nhập).
2. Dùng demo credentials (từ ví dụ API bạn gửi):

  - Email: `user@example.com`
  - Password: `E]:X1lP5]9g,_W"b-![$wB[;G^-s-x%uW{U#`

  Hoặc nhấn nút `Fill demo` trên form.

3. Sau khi đăng nhập thành công bạn sẽ được chuyển tới `/admin`.

4. Logout: nhấn nút `Logout` trên sidebar — token và user sẽ bị xóa và app redirect về `/login`.

---

## Cách quản lý endpoint API (tùy chọn)

Hiện tại `src/services/authService.js` dùng URL tuyệt đối `https://api.sweethotel.kodopo.tech/api/Auth/Login`.
Để làm cho endpoint cấu hình được, bạn có thể:

1. Tạo biến môi trường Vite: thêm `VITE_API_BASE` vào `.env` (gốc dự án):

```text
VITE_API_BASE=https://api.sweethotel.kodopo.tech
```

2. Thay URL trong `authService.js` bằng:

```js
const LOGIN_URL = `${import.meta.env.VITE_API_BASE}/api/Auth/Login`
```

Sau đổi, restart dev server để biến môi trường có hiệu lực.

---

## Xử lý sự cố thường gặp

- CORS: Nếu trình duyệt báo lỗi CORS khi gọi API, server API cần cấu hình để cho phép origin của Vite (ví dụ `http://localhost:5173`). Đây là cấu hình trên server, không phải client.
- `@tailwind` / `@apply` lint warnings: editor có thể báo lỗi cho các at-rule này cho đến khi PostCSS chạy; đó là bình thường.
- Lỗi 4xx/5xx từ API: Kiểm tra response body — `authService` cố gắng parse message và hiển thị thông báo lỗi từ backend.
- Nếu token không được lưu/đính kèm: kiểm tra `localStorage` (key `sh_token`) và header Authorization trong request (DevTools -> Network).

---

## Gợi ý nâng cao (tuỳ chọn)

- Thêm refresh-token handling: sử dụng `refresh_token` từ response để tự động làm mới access token khi hết hạn.
- Chuyển từ localStorage sang httpOnly cookie để tăng bảo mật nếu bạn kiểm soát backend.
- Thêm validation form (`react-hook-form` + `yup`) để UX tốt hơn.

---

Nếu bạn muốn, tôi có thể: chạy các lệnh `npm install` hộ bạn, thay URL mặc định bằng biến môi trường, hoặc thêm xử lý refresh-token. Bạn muốn tôi làm bước nào tiếp theo?

***

README cập nhật — đã thêm hướng dẫn chi tiết để chạy và debug (PowerShell / Windows).

## SweetHotel — Login & Admin Dashboard (Tailwind)

Tôi đã thêm một trang Login và một trang Admin Dashboard dùng Tailwind và một luồng xác thực tối giản để bạn có thể bắt đầu phát triển.

### Những thay đổi chính

- Thêm cấu hình Tailwind / PostCSS:
  - `tailwind.config.cjs`
  - `postcss.config.cjs`

- Cập nhật CSS chính để chứa các directive Tailwind:
  - `src/index.css` (đã chèn `@tailwind base/components/utilities` và 1 lớp `app-root`)

- Context / Hook cho auth:
  - `src/context/AuthContext.jsx` — provider, lưu user vào localStorage
  - `src/hooks/useAuth.js` — hook tiện lợi để dùng auth

- Service (stub):
  - `src/services/authService.js` — fake login để demo (thay bằng API thật khi cần)

- Router & route bảo vệ:
  - `src/routes/AppRouter.jsx` — routes chính, có `PrivateRoute` để bảo vệ `/admin`

- Pages & layout:
  - `src/pages/Login/Login.jsx` — trang đăng nhập (giao diện Tailwind)
  - `src/pages/Admin/Dashboard.jsx` — trang dashboard (ví dụ đơn giản)
  - `src/components/layout/AdminLayout.jsx` — layout với sidebar

- App wiring:
  - `src/App.jsx` — bọc ứng dụng bằng `AuthProvider` và sử dụng `AppRouter`

### Hành vi / hợp đồng nhỏ

- Đăng nhập: dùng `authService.login({ username, password })` (hiện là stub).
- Demo credentials: `admin` / `password` (sử dụng nút "Fill demo" trên form để tự điền).
- Routes:
  - `/login` — trang đăng nhập
  - `/admin` — dashboard (yêu cầu đăng nhập, nếu chưa sẽ redirect về `/login`)

### Cách chạy (PowerShell trên Windows)

1. Cài thư viện cần thiết (chạy trong thư mục dự án: `d:\SweetHotel.Web\SweetHotel`):

```powershell
# React Router
npm install react-router-dom

# Tailwind toolchain (dev deps)
npm install -D tailwindcss postcss autoprefixer

# (Tuỳ chọn) Nếu muốn khởi tạo lại cấu hình Tailwind bằng CLI:
# npx tailwindcss init -p

# Sau khi cài xong, chạy dev server
npm run dev
```

2. Mở trang dev (Vite) theo URL mà Vite báo (thường `http://localhost:5173`).

### Kiểm tra luồng đăng nhập

1. Mở `/login` (nếu truy cập `/admin` khi chưa auth thì sẽ redirect về `/login`).
2. Nhập `admin` / `password` hoặc nhấn nút "Fill demo" rồi Sign in.
3. Bạn sẽ được chuyển tới `/admin`.

### Lưu ý, caveats và next steps

- Hiện tại auth là một stub (fake). Thay `src/services/authService.js` bằng các cuộc gọi API thật để tích hợp backend (token, refresh, xử lý lỗi chi tiết).
- `index.css` dùng `@apply` và các directive Tailwind — editor/linter có thể báo lỗi về các at-rule trước khi PostCSS chạy, nhưng đó là bình thường.
- Nếu bạn muốn route-based code-splitting, có thể lazy-load trang `Dashboard` và `Login`.
- Nâng cấp bảo mật: lưu token an toàn hơn (httpOnly cookies) thay vì localStorage nếu cần.

### Những việc tôi có thể làm tiếp (chọn 1 hoặc nhiều):

- Thay stub auth bằng tích hợp API (yêu cầu endpoint + spec).
- Thêm `services/api.js` để attach token vào header và xử lý lỗi chung.
- Thêm validation (yup/react-hook-form) cho form login.
- Viết vài unit tests cho `AuthContext` và `Login`.

Nếu bạn muốn, tôi có thể chạy các lệnh `npm install` cho bạn (hoặc hướng dẫn chính xác để bạn copy/paste vào terminal). Bạn muốn tôi thêm bước nào tiếp theo?

***
README được tạo tự động bởi các thay đổi hiện tại trong project. Hãy thông báo nếu bạn muốn README bằng tiếng Anh, hoặc muốn thêm ảnh chụp màn hình / hướng dẫn triển khai.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## SweetHotel 

Nội dung README này tập trung vào cách cài đặt và chạy project trên Windows (PowerShell), cách kiểm tra luồng đăng nhập, và một vài hướng dẫn xử lý sự cố thường gặp.

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

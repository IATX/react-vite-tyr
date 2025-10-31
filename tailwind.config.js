// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  // 扫描 src 目录下所有文件以生成样式
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // 关键配置：禁用 Tailwind 的 Preflight 基础样式，避免与 MUI 冲突
  corePlugins: {
    preflight: true,
  }
}
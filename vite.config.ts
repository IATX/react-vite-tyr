import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const basePath = env.VITE_JET_ASP_CONTEXT || '/';

  return {
    base: basePath,
    plugins: [react()],
    server: {
      port: 3000, // Custom port
    },
  }

})

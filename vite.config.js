import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' keeps asset paths relative so the build works on GitHub Pages
// regardless of repo name (user.github.io or user.github.io/repo).
export default defineConfig({
  plugins: [react()],
  base: './',
});

import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // Relative asset paths, so the build works at any URL: a user site
  // (user.github.io), a project site (user.github.io/repo/) or a custom
  // domain — without having to hard-code the repository name.
  base: './',
  plugins: [react()],
})

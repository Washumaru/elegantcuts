import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/elegantcuts/', // Nombre de tu repositorio
  envPrefix: 'VITE_'
});
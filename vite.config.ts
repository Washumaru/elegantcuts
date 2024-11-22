import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
   envPrefix: 'VITE_' // Esto asegura que Vite procese las variables de entorno con prefijo VITE_
});

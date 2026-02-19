import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://ahmadsyahani.github.io', // Sesuaikan dengan URL GitHub Pages lu
  vite: {
    plugins: [tailwindcss()]
  }
});
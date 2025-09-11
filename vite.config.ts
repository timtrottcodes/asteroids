import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  server: {
    port: 5173
  },
  resolve: {
    alias: {
      phaser: "phaser/dist/phaser.js"
    }
  }
});

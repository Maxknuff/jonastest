import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import vercel from "@astrojs/vercel/serverless"; // Der neue Adapter

// https://astro.build/config
export default defineConfig({
  output: 'server', // WICHTIG: Schaltet auf Live-Server um
  adapter: vercel(),
  integrations: [tailwind(), react()]
});
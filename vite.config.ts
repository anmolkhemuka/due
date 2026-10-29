import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import {VitePWA} from 'vite-plugin-pwa';
const base='/due/';
export default defineConfig({base,plugins:[react(),tailwindcss(),VitePWA({
 registerType:'prompt',base,scope:base,
 manifest:{id:base,name:'Due — Credit card bills',short_name:'Due',description:'Every card. Every payment. On time.',theme_color:'#FCFCF8',background_color:'#F3F4EE',display:'standalone',start_url:base,scope:base,icons:[{src:`${base}icon-192.png`,sizes:'192x192',type:'image/png'},{src:`${base}icon-512.png`,sizes:'512x512',type:'image/png',purpose:'any maskable'}]},
 workbox:{globPatterns:['**/*.{js,css,html,png,svg,woff2}'],navigateFallback:`${base}index.html`}
})]});

import config from './astro.config.mjs';
export default {...config,adapter:undefined,vite:{...config.vite,server:{watch:{ignored:['**/dist-fc-review*/**','**/dist-db/**','**/public/data/**','**/node_modules/**','**/.git/**']}}}};

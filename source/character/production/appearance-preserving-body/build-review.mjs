import{createRequire}from'node:module';
import{fileURLToPath}from'node:url';
const require=createRequire(new URL('../../../dafeiyu-dsh-panel/package.json',import.meta.url));
await require('esbuild').build({entryPoints:[fileURLToPath(new URL('finger-review.mjs',import.meta.url))],outfile:fileURLToPath(new URL('finger-review.bundle.js',import.meta.url)),bundle:true,format:'esm',platform:'browser',target:'chrome120',minify:true,legalComments:'inline'});
console.log('Built original-hand joint review; no selected source files modified.');

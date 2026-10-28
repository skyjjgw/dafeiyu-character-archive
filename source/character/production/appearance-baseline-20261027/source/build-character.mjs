import {readFile} from 'node:fs/promises';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const characterRoot=resolve(process.env.DAFEIYU_CHARACTER_ROOT||resolve(root,'..','dafeiyu-character-materials-20261025'));
const source=resolve(characterRoot,'production/animation-look-study');
const files={
  reference:resolve(characterRoot,'references/video-covers/BV1g2JX6HEHX.jpg'),
  garment:resolve(characterRoot,'production/v1/neutral-front.png'),
  turnaround:resolve(characterRoot,'production/animation-look-study/turnaround-auxiliary-v2.png')
};

/** Bundle original avatar modules without modifying or copying their sources. */
export async function buildCharacterBundle({preview=false}={}){
  const [reference,garment,turnaround]=await Promise.all([readFile(files.reference),readFile(files.garment),readFile(files.turnaround)]);
  const result=await build({
    absWorkingDir:root,entryPoints:[resolve(root,'hud/character-entry.js')],bundle:true,write:false,format:'iife',globalName:'DafeiyuCharacter',platform:'browser',target:'chrome120',
    minify:true,legalComments:'inline',metafile:true,charset:'utf8',
    define:{__DAFEIYU_CHARACTER_LOCAL_PREVIEW__:JSON.stringify(Boolean(preview))},
    plugins:[{name:'dafeiyu-local-character',setup(plugin){
      plugin.onResolve({filter:/^@dafeiyu-(three|character)$/},args=>({path:args.path==='@dafeiyu-three'?resolve(characterRoot,'production/rig3d-prototype/vendor/three.module.js'):resolve(source,'character.js')}));
      plugin.onResolve({filter:/^@dafeiyu-character-assets$/},()=>({path:'embedded-character-assets',namespace:'dafeiyu-assets'}));
      plugin.onLoad({filter:/.*/,namespace:'dafeiyu-assets'},()=>({loader:'js',contents:`export const referenceImage=${JSON.stringify(`data:image/jpeg;base64,${reference.toString('base64')}`)};export const garmentImage=${JSON.stringify(`data:image/png;base64,${garment.toString('base64')}`)};export const turnaroundImage=${JSON.stringify(`data:image/png;base64,${turnaround.toString('base64')}`)};`}));
    }}],
  });
  const external=Object.values(result.metafile.outputs).flatMap(output=>output.imports).filter(item=>item.external);
  if(external.length)throw new Error(`Character must be self-contained: ${external.map(item=>item.path).join(', ')}`);
  return{script:result.outputFiles[0].text,inputs:Object.keys(result.metafile.inputs),textureBytes:reference.length+garment.length+turnaround.length,textureCount:3,preview:Boolean(preview)};
}

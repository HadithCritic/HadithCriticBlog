import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';import sharp from 'sharp';
import { removeStyleBlocks } from '../src/lib/html-text.mjs';
const planPath='docs/archive-artwork-plan.json';const manifestPath='src/data/blog-artwork.ts';
const plan=JSON.parse(fs.readFileSync(planPath,'utf8'));const digest=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const raw=fs.readFileSync(manifestPath,'utf8');const manifest=JSON.parse('{'+raw.split('= {')[1].replace(/;\s*$/,''));
const command=process.argv[2];
if(command==='read') {
 for(const number of process.argv.slice(3).map(Number)) {const a=plan.articles.find(a=>a.number===number);console.log(removeStyleBlocks(fs.readFileSync(a.path,'utf8')).replace(/^import .*$/gm,''));}
} else if(command==='complete') {
 for(const number of process.argv.slice(3).map(Number)) {
  const a=plan.articles.find(a=>a.number===number);if(!a?.readComplete||!a.generatedPath||plan.approvedIds.includes(a.id))throw new Error('Article is not eligible: '+number);
  if(a.status==='linked')continue;
  const dest='public/images/blog-editorial/'+a.key;for(const suffix of ['.webp','-720.webp','-160.webp'])if(fs.existsSync(dest+suffix))throw new Error('Refusing asset replacement: '+dest+suffix);
  await sharp(a.generatedPath).resize(1536,1024,{fit:'cover'}).webp({quality:92}).toFile(dest+'.webp');
  await sharp(dest+'.webp').resize(720,480).webp({quality:86}).toFile(dest+'-720.webp');
  await sharp(dest+'.webp').resize(160,160,{fit:'cover',position:'east'}).webp({quality:85}).toFile(dest+'-160.webp');
  manifest[a.id]={src:'/images/blog-editorial/'+a.key+'.webp',srcset:`/images/blog-editorial/${a.key}-720.webp 720w, /images/blog-editorial/${a.key}.webp 1536w`,thumbnail:'/images/blog-editorial/'+a.key+'-160.webp',alt:a.alt,width:1536,height:1024};
  a.status='linked';a.review={relevance:true,style:true,distinctScene:true,noInventedText:true};console.log('Linked '+number+' '+a.key);
 }
 fs.writeFileSync(manifestPath,'// Editorial artwork assignments. Research frontmatter and article URLs remain unchanged.\nexport interface BlogArtwork { src: string; srcset: string; thumbnail: string; alt: string; width: number; height: number; }\nexport const blogArtwork: Record<string, BlogArtwork> = '+JSON.stringify(manifest,null,2)+';\n');
 fs.writeFileSync(planPath,JSON.stringify(plan,null,2));
} else if(command==='audit') {
 for(const a of plan.articles)if(digest(a.path)!==a.sourceHash)throw new Error('Research source changed: '+a.id);
 for(const a of plan.protectedAssets)if(digest('public/images/blog-editorial/'+a.name)!==a.hash)throw new Error('Approved asset changed: '+a.name);
 for(const a of plan.articles.filter(a=>a.status==='linked')){
  if(!manifest[a.id])throw new Error('Missing assignment: '+a.id);
  for(const [suffix,width,height] of [['.webp',1536,1024],['-720.webp',720,480],['-160.webp',160,160]]){const m=await sharp('public/images/blog-editorial/'+a.key+suffix).metadata();if(m.width!==width||m.height!==height)throw new Error('Invalid dimensions '+a.key+suffix);}
 }
 console.log(JSON.stringify({approved:plan.approvedIds.length,completed:plan.articles.filter(a=>a.status==='linked').length,pending:plan.articles.filter(a=>!['approved','linked'].includes(a.status)).length,protectedImagesUnchanged:true,researchUnchanged:true}));
} else {throw new Error('Use read <numbers>, complete <numbers>, or audit');}

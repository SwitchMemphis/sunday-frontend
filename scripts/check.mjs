import {readFile,readdir,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..'),dist=path.join(root,'dist');
const routes=JSON.parse(await readFile(path.join(root,'docs/routes.json'),'utf8'));
const errors=[];let refs=0;
for(const route of routes){
 const p=path.join(dist,route,'index.html'),html=await readFile(p,'utf8');
 if(!html.includes('Content-Security-Policy'))errors.push(`${route}: no CSP`);
 if(/<script[^>]+src=["']https?:/i.test(html))errors.push(`${route}: external executable script`);
 if(/<form[^>]+action=["']https?:/i.test(html))errors.push(`${route}: remote form action`);
 for(const m of html.matchAll(/(?:src|href|poster)=["'](\/(?!\/)[^"']*)["']/g)){
  const value=m[1].split(/[?#]/)[0];if(!value)continue;
  let f=path.join(dist,decodeURIComponent(value));
  try{const s=await stat(f);if(s.isDirectory())await stat(path.join(f,'index.html'));refs++;}catch{errors.push(`${route}: missing ${value}`);}
 }
}
const catalog=JSON.parse(await readFile(path.join(dist,'catalog.json'),'utf8'));
if(catalog.length!==40)errors.push(`Expected reference catalog count 40, got ${catalog.length}`);
console.log(JSON.stringify({routes:routes.length,products:catalog.length,localReferencesChecked:refs,errors:[...new Set(errors)]},null,2));
if(errors.length)process.exitCode=1;

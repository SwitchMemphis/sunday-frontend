import http from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../dist');
const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff','.mp4':'video/mp4','.pdf':'application/pdf'};
const portArg=process.argv.indexOf('--port');
const port=Number(portArg>=0?process.argv[portArg+1]:(process.env.PORT||3000));
http.createServer(async(req,res)=>{
 try {
  const route=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let f=path.resolve(root,'.'+route);
  if(!f.startsWith(root+path.sep)&&f!==root){res.writeHead(403);return res.end();}
  if((await stat(f)).isDirectory()) f=path.join(f,'index.html');
  const data=await readFile(f);
  res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);
 }catch {res.writeHead(404,{'Content-Type':'text/html'});res.end('<h1>Page not found</h1><a href="/shop/">Return to the Sunday catalog</a>');}
}).listen(port,'0.0.0.0',()=>console.log(`Sunday design preview on port ${port}`));

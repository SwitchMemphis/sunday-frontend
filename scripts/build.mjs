import {cp, mkdir, rm, readdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
await rm(path.join(root,'dist'),{recursive:true,force:true});
await mkdir(path.join(root,'dist'),{recursive:true});
await cp(path.join(root,'public'),path.join(root,'dist'),{recursive:true});
await cp(path.join(root,'src/pages'),path.join(root,'dist'),{recursive:true});
console.log('Built standalone frontend in dist/. No network or dependencies required.');

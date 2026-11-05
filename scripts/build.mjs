import {cp, mkdir, rm, readdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {brandPage, productPhotos, restyle} from './sol-theme.mjs';
const root=path.resolve(import.meta.dirname,'..');
await rm(path.join(root,'dist'),{recursive:true,force:true});
await mkdir(path.join(root,'dist'),{recursive:true});
await cp(path.join(root,'public'),path.join(root,'dist'),{recursive:true});
await cp(path.join(root,'src/pages'),path.join(root,'dist'),{recursive:true});
const dist = path.join(root, 'dist');
for (const file of await readdir(dist, {recursive: true})) {
  const output = path.join(dist, file);
  if (file.endsWith('.html')) {
    await writeFile(output, brandPage(await readFile(output, 'utf8')));
  } else if (file.endsWith('.css') && file !== 'sol.css') {
    await writeFile(output, restyle(await readFile(output, 'utf8')));
  }
}

const catalogPath = path.join(dist, 'catalog.json');
const catalog = JSON.parse(await readFile(catalogPath, 'utf8'));
for (const product of catalog) {
  product.image = productPhotos[product.image] ?? product.image;
}
await writeFile(catalogPath, JSON.stringify(catalog, null, 2) + '\n');

console.log('Built standalone frontend in dist/. No network or dependencies required.');

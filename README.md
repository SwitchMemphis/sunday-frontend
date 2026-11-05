# Sunday frontend recreation

Editable, standalone frontend of the Sunday site captured November 5, 2026. Original layouts, responsive CSS, fonts, product images and public copy are preserved. This is a **design preview**, not a working store.

## Run

Node.js 20.11 or newer. No dependency installation is needed.

```sh
npm run build
npm run check
npm run dev
```

Open http://localhost:3000/shop/ or http://localhost:3000/ . Use `PORT=4173 npm run dev` to change the port.

## Edit

- `src/pages/`: editable HTML for each route.
- `public/assets/`: original images, fonts, stylesheets and documentation files.
- `public/frontend.css`: scoped demo UI and accessibility additions.
- `public/frontend.js`: local cart, form boundaries and interaction adapters.
- `public/navigation.js`, `presentation.js`, `home.js`: adapted source presentation behavior.
- `public/catalog.json`: catalog used for browser-local search.
- `scripts/build.mjs`: copies source and public assets to `dist/`.
- `docs/`: asset provenance, routes and verification details.

HTML is real text and semantic elements, not flattened page screenshots. No WordPress, WooCommerce, PHP, database, keys or customer accounts are needed to run this version. One-time capture tooling is excluded from this deliverable. No Python tooling is needed to build or run the project.

## GitHub

Create an empty repository in your GitHub account, then run from this folder:

```sh
git init
git add .
git commit -m "Add Sunday frontend design recreation"
git branch -M main
git remote add origin YOUR_GITHUB_REPOSITORY_URL
git push -u origin main
```

`dist/` is intentionally ignored because it is reproducible. Build command: `npm run build`. Static output directory: `dist`. Serve from the domain root. GitHub Pages project subpaths require adapting root-relative URLs or a custom domain; the default package targets root hosting. No repository has been created or pushed on your behalf.

## Integration boundaries

The cart is stored only in localStorage. Search uses a local JSON file. Forms do not send, password entry is disabled, and checkout does not accept payment or create orders. Promotions, taxes, shipping calculations, live stock, accounts, affiliate systems, third-party chat and analytics are not implemented. Administrative and affiliate links are marked as unavailable demo services. Prices, availability, time-sensitive messages, promotions and claims are a snapshot of the reference, not independently verified or live data.

The content security policy blocks external scripts, network submissions and remote media. Production launch requires a developer to connect authorized services, verify facts and commercial terms, configure domain metadata, and replace the demo boundaries intentionally.

## Rights and provenance

Sunday brand assets and public content remain the source owner's materials. User-supplied original theme code and live assets were used for the requested design recreation. Font license notices are included in `docs/font-licenses/`. No claim of transferring third-party rights is made.

See `PROJECT-STATUS.md` and `docs/QA.md` for actual checks and limitations.

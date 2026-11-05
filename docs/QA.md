# Verification and limitations

Checked November 5, 2026 in cloud Chrome, with a local managed preview. Tests used browser-rendered desktop and iframe phone viewports, not physical devices.

## CONTENT review
- 58 local routes, including 40 product pages, shop, homepage, research/info pages, account presentation, cart and an explicit checkout boundary.
- Original public copy, images, font files and CSS retained. Catalog snapshot contains 40 products. Asset provenance is in asset-map.json.
- No prices, stock, research/quality claims, reviews or commercial promises were independently validated. They are captured source content.
- Two older linked articles returned 404 at source. Their links show an unavailable-service demo notice; no replacement article was invented. See capture-errors.json.
- Seven unavailable resized About hero files returned 404 at source. Valid original imagery is retained, and browser checks found no broken displayed images. See asset-errors.json.
- /membership/ resolved to the homepage in the source; this package retains that captured content.

## CRAFT review
- Inspected the live and local desktop shop opening and TRZ product page. Original layout, typography, image assets and cascade were retained.
- Inspected the local homepage opening, lower sections and footer, and phone shop, TRZ product and mobile navigation views.
- Scanned all 58 routes at iframe widths 390 and 1333 pixels: 116 route/viewport checks. Effective document widths were 375 and 1318 pixels because of scrollbars.
- Final complete scan: zero broken images; one 7-pixel overflow in the legacy research landing header. Applied a scoped phone-width correction and retested that page: document/client widths both 375px, no overflow.
- Corrected an existing phone shop title/two-price collision by placing the price on its own row.
- Browser inspection is not a pixel-difference certification. Every page was structurally scanned, but not every viewport and lower section was visually compared to live production. The live homepage displayed an age/research-use acknowledgement gate during comparison; it was not accepted. Local homepage content came from the supplied/live public source.

## FUNCTIONAL review
- Build and static route/local-reference checks pass; see validation.json.
- Search for TRZ returns matching catalog results; unmatched query shows an empty state. Escape closes search.
- Shop filters show 6 bundles, 5 melting strips and 40 total products.
- TRZ 20MG updates to $124. Quantity two produces a $248 local cart subtotal. Removal returns to the empty state.
- Bundle 1 starts at $198; 20MG selection updates to $223. Adding the default bundle creates a local $198 cart entry; removal works.
- Product gallery next selects image 2. Lightbox open/close checked. Mobile menu opens and closes with Escape.
- Original account presentation script is retained; real authentication is disabled. Forms and password controls are bounded as demos, not connected services.
- Static checking rejects external script sources and remote form actions. Content security policy restricts network connections to this origin and disallows form submissions.

## Deliberate differences and untested scope
- Small Design preview badge and explanatory notices; age/terms gate, third-party chat, tracking and server plugins omitted.
- Empty cart page preserves original markup; populated cart uses a local adapter. No BOGO fulfillment, tax, shipping, inventory synchronization or production cart parity is claimed.
- Checkout is an explanatory boundary page. Login, registration, newsletter and contact actions do not send or create records. No backend testing occurred.
- No physical-device, Safari, Firefox, screen-reader, deployment, performance benchmark or GitHub push testing occurred. Accessibility additions include focus visibility, Escape handling and modal background isolation, but this is not an accessibility conformance certification.
- Fidelity is a source-based design recreation with the documented exceptions, not a claim of certified pixel-perfect parity on all pages.

## Reproduce
Run npm run build and npm run check. To inspect the optional browser viewport harness, copy scripts/qa.html and scripts/qa.js into dist as __qa.html and __qa.js, run npm run dev, then open /__qa.html. The build intentionally does not ship the harness into the public site.

# Sunday frontend recreation

Requested 2026-11-05. Recreate https://sunday-usa.com/ one for one for frontend design, starting with the supplied /shop/ reference, and deliver editable GitHub-ready source.

## Approval and scope
The user explicitly selected the existing Sunday website as the approved treatment. No new art direction, concept selection, brand swap, or generated imagery is required. Preserve its name, fonts, colors, exact product assets, copy, page structure, and responsive rules.

Deliver standalone public storefront pages and a frontend interaction layer. Do not connect purchases, accounts, email, analytics, WordPress, payment providers, or production services. Do not publish or push to a GitHub account without a specified destination. Prices, availability, promotions and claims are captured reference content, not a live commercial catalog or independent verification.

## Sources
- User-provided Drive: Sunday-Site-Rebuild-Kit-2026-11-04.zip, file 1x9gpAq8AVk328oF4wNH9FYvF6NGgZdf1.
- Live public Sunday pages captured November 5, 2026.
- Devver v0.6 00, 04, 05 and 08 read from the Devr/System folder. 09 was not present in that folder listing. Handoff follows the explicit user instructions and available modules.

## Implementation
Static HTML/CSS/JavaScript, dependency-free Node build and preview. Saved public HTML supplies editable page content. Original styles are retained in their observed cascade. Original safe presentation scripts are adapted, with all backend calls removed. New local demo cart adapter is separate. See docs/routes.json and docs/asset-map.json for exact inventory.

Private WordPress exports, customer/order data, server code, access tokens, and analytics scripts are excluded from delivery.

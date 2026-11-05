# Design decisions

- Approved direction: exact existing Sunday public site, as requested on November 5, 2026. No conceptual redesign.
- Original HTML structure and CSS order retained. Fonts, image crops, product labels, section spacing, navigation and responsive breakpoints originate from the source site.
- Assets are downloaded byte-for-byte. Stable local names and their original URLs are recorded in docs/asset-map.json.
- CSS files remain separate to preserve the original cascade and provenance. Edits should be placed in public/frontend.css, after original rules, or in the relevant original asset.
- Typography: source font declarations and local fonts. No substitute font chosen.
- Deliberate deviations: a small fixed Design preview notice; blocked real credentials; demo notices at form and checkout boundaries; local cart in place of server-driven cart; analytics/chat widgets removed; no promotional fulfillment logic. Content remains captured reference copy.
- Existing presentation JS is adapted for menus, search, galleries, variants, quantity controls, accordions, responsive product order, and homepage motion.
- No generated assets, reconstructed logos, or image-flattened pages.

- Narrow phone repairs: shop featured price moves below the title to avoid overlap; legacy landing header width constrained to viewport gutters. Other composition remains source-driven.
- Original empty-cart page retained; populated cart and checkout are explicit frontend boundaries.
- The source age/research acknowledgement gate is not reproduced in this design-only preview. No acknowledgement or agreement was submitted on the live site.

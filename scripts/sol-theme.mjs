// Apply SOL tokens to the captured theme, including its route-specific inline CSS.
const cream = '#e0d6c8';
const brown = '#684936';
const petrol = '#3f555b';
const olive = '#606855';
const khaki = '#a99778';
const denim = '#70838c';

function palette(r, g, b) {
  if (g > r + 4 && g > b + 4) {
    if (g < 55) return '#293e44';
    if (g < 105) return petrol;
    if (g < 153) return olive;
    if (g < 210) return denim;
    return g > 241 ? '#f2ebe1' : cream;
  }
  if (r > 233 && g > 229 && b > 210 && (r !== g || g !== b)) return cream;
  if (r > g + 42 && g > b + 12) return r > 220 ? khaki : brown;
}

function restyle(css) {
  return css
    .replace(/url\([^)]*\)|#[\da-f]{3,8}(?![\w-])|rgba?\([\d\s.,/%]+\)/gi, (token, offset) => {
      if (token.startsWith('#')) {
        // Hex colors occur inside declarations. Leave selector IDs untouched.
        const next = css.slice(offset + token.length).search(/[{};]/);
        if (next !== -1 && css[offset + token.length + next] === '{') return token;
        let hex = token.slice(1);
        if (hex.length === 3 || hex.length === 4) hex = [...hex].map(c => c + c).join('');
        if (hex.length !== 6 && hex.length !== 8) return token;
        const [r, g, b] = hex.slice(0, 6).match(/../g).map(c => parseInt(c, 16));
        const replacement = palette(r, g, b);
        return replacement ? replacement + hex.slice(6) : token;
      }
      if (!/^rgba?\(/i.test(token) || token.includes('%')) return token;
      const [r, g, b, alpha] = token.match(/[\d.]+/g).map(Number);
      const replacement = palette(r, g, b);
      if (!replacement) return token;
      const channels = replacement.slice(1).match(/../g).map(c => parseInt(c, 16)).join(' ');
      return alpha === undefined ? replacement : `rgb(${channels} / ${alpha})`;
    })
    .replace(/((?:font-family|--[\w-]+)\s*:\s*)([^;{}]+)(?=[;}])/g, (declaration, property, value) => {
      const priority = value.match(/\s*!important\s*$/i)?.[0] || '';
      if (/\b(?:Besley|Georgia|LibreBaskerville|Times New Roman)\b/i.test(value)) {
        return `${property}"Times New Roman", Times, serif${priority}`;
      }
      if (/\b(?:Libre Franklin|IBM Plex Mono)\b|-apple-system|(?:^|,)\s*Arial,\s*sans-serif/i.test(value)) {
        return `${property}"Montserrat", Arial, sans-serif${priority}`;
      }
      return declaration;
    });
}

const productPhotos = {
  '/assets/6d8ca27008a3645c-rt-10mg.webp': '/assets/sol/rt-10mg.webp',
  '/assets/5860da7981f37f39-motsc-10mgs.webp': '/assets/sol/mots-c-10mg.webp',
  '/assets/f6c7977712c8fd52-Sunday-BPC-157-10mg-Website-Hero.webp': '/assets/sol/bpc-157-10mg.webp',
  '/assets/ac5619d2517d27a2-glowmgs.webp': '/assets/sol/glow-70mg.webp',
  '/assets/4f31f1d5f1a8127a-klowmgs.webp': '/assets/sol/klow-80mg.webp',
  '/assets/c98d8b36945f1fe4-Sunday-CJC-1295-No-DAC-10mg-Website-Hero.webp': '/assets/sol/cjc-1295-10mg.webp',
  '/assets/7b327138ab9cbd87-nad-500mg.webp': '/assets/sol/nad-500mg.webp',
  '/assets/63dc88c57ada8a76-tesamorelin-10mgs.webp': '/assets/sol/tesamorelin-10mg.webp',
  '/assets/ac6d9037b1ce9c2c-Sunday-SS-31-10mg-Website-Hero.webp': '/assets/sol/ss-31-10mg.webp',
};
const landscape = '/assets/sol/hill-country.webp';

function brandPage(html) {
  return html
    .replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (_, open, css, close) => open + restyle(css) + close)
    .replace(/( style=")([^"]*)(")/g, (_, open, css, close) => open + restyle(css).replaceAll('"', '&quot;') + close)
    .replace(/(<title>[^<]*)\bSunday(<\/title>)/g, '$1SOL Research Co.$2')
    .replace(/aria-label="Sunday home"/g, 'aria-label="SOL Research Co. home"')
    .replace(/(class="(?:sunday-logo|sunday-footer-wordmark)" href="\/">|class="srg-logo-text">)Sunday/g,
      '$1<span class="sol-signature" aria-label="SOL Research Co." role="img"></span>')
    .replace(/<img\b[^>]*class="custom-logo"[^>]*>/g,
      '<img alt="SOL Research Co." class="custom-logo" src="/assets/sol/signature.png" width="480" height="409"/>')
    .replace(/<link href="\/assets\/[^"]+sunday-favicon\.svg" rel="icon" type="image\/svg\+xml"\/>/g,
      '<link href="/assets/sol/favicon.png" rel="icon" type="image/png"/>')
    .replace(/<img\b[^>]*(?:class="sunday-full-hero"|data-sunday-card-image)[^>]*>/g, tag => {
      if (tag.includes('class="sunday-full-hero"')) {
        return tag.replace(/((?:data-sunday-hero-(?:desktop|mobile)|src)=")[^"]+"/g, `$1${landscape}"`);
      }
      return tag.replace(/src="([^"]+)"/, (attribute, src) =>
        productPhotos[src] ? `src="${productPhotos[src]}"` : attribute);
    })
    .replaceAll('/assets/f6c844efe0fad885-shop-hero-222-original.png', landscape)
    .replaceAll('/assets/78da28d60a4a2db5-sunday-121-serum-puddle.png', '/assets/sol/paper-and-stone.webp')
    .replaceAll('Green serum and droplet texture', 'Cotton paper on pale limestone')
    .replaceAll('Sunday GLOW vial in a green botanical setting', 'SOL GLOW research vial')
    .replace(/(<img alt="SOL GLOW research vial"[^>]*src=")[^"]+/g, '$1/assets/sol/glow-70mg.webp')
    .replaceAll('Sunday reward', 'SOL reward')
    .replaceAll('How Sunday works', 'How SOL works')
    .replaceAll('How to order from Sunday', 'How to order from SOL')
    .replaceAll('Shop Sunday</span>', 'Shop SOL</span>')
    .replace(/<\/head>/i, '<link href="/sol.css" rel="stylesheet"/></head>');
}

export {brandPage, productPhotos, restyle};

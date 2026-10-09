/**
 * Copyright 2026 Google LLC
 * Production-grade sample product and brand logo demo assets for instant 1-click testing.
 */

function svgToDataUrl(svg: string): string {
  const base64 = btoa(unescape(encodeURIComponent(svg.trim())));
  return `data:image/svg+xml;base64,${base64}`;
}

export interface DemoProduct {
  id: string;
  name: string;
  nameEn: string;
  category: string;
  icon: string;
  dataUrl: string;
  recommendedPrompt: string;
}

export interface DemoLogo {
  id: string;
  name: string;
  icon: string;
  dataUrl: string;
}

// 1. Luxury Perfume Bottle (奢华香水瓶)
const perfumeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff5eb" stop-opacity="0.95"/>
      <stop offset="40%" stop-color="#ffd8a8" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#e8590c" stop-opacity="0.85"/>
    </linearGradient>
    <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#ffd43b"/>
      <stop offset="50%" stop-color="#fff9db"/>
      <stop offset="100%" stop-color="#f59f00"/>
    </linearGradient>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1a1a24"/>
      <stop offset="100%" stop-color="#0a0a0f"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="15" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <rect width="600" height="600" fill="url(#bgGrad)" />
  <circle cx="300" cy="340" r="160" fill="#f08c00" opacity="0.15" filter="url(#glow)"/>
  
  <!-- Perfume Cap -->
  <rect x="250" y="140" width="100" height="70" rx="8" fill="url(#capGrad)" stroke="#fab005" stroke-width="2"/>
  <rect x="280" y="210" width="40" height="25" fill="#f59f00"/>
  
  <!-- Perfume Glass Body -->
  <path d="M 180 240 C 180 235, 185 235, 230 235 L 370 235 C 415 235, 420 235, 420 240 L 410 490 C 410 500, 400 505, 390 505 L 210 505 C 200 505, 190 500, 190 490 Z" 
        fill="url(#glassGrad)" stroke="#ffe8cc" stroke-width="3" filter="url(#glow)"/>
  
  <!-- Liquid Level -->
  <path d="M 195 300 Q 300 310 405 300 L 400 485 C 400 495, 395 498, 385 498 L 215 498 C 205 498, 200 495, 200 485 Z" fill="#d9480f" opacity="0.65"/>
  
  <!-- Label Badge -->
  <rect x="230" y="340" width="140" height="90" rx="4" fill="#ffffff" stroke="#d4af37" stroke-width="2"/>
  <text x="300" y="375" font-family="'Cinzel', 'Playfair Display', serif" font-size="16" font-weight="bold" fill="#111" text-anchor="middle" letter-spacing="3">L'ÉLIXIR</text>
  <line x1="260" y1="388" x2="340" y2="388" stroke="#d4af37" stroke-width="1"/>
  <text x="300" y="405" font-family="sans-serif" font-size="9" fill="#666" text-anchor="middle" letter-spacing="2">EAU DE PARFUM</text>
  <text x="300" y="420" font-family="sans-serif" font-size="8" fill="#999" text-anchor="middle">50ml · 1.7 FL. OZ</text>
  
  <!-- Light highlights -->
  <path d="M 200 250 L 210 480" stroke="#ffffff" stroke-width="6" stroke-linecap="round" opacity="0.6"/>
  <path d="M 215 250 L 220 470" stroke="#ffffff" stroke-width="2" stroke-linecap="round" opacity="0.4"/>
</svg>
`;

// 2. Air Modern Sneaker (潮流跑鞋)
const sneakerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="shoeBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="soleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="50%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#ec4899"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#shoeBg)" />
  <!-- Shadow -->
  <ellipse cx="300" cy="460" rx="220" ry="25" fill="#000" opacity="0.4"/>
  
  <!-- Outsole & Midsole -->
  <path d="M 120 410 Q 180 435 300 425 Q 420 415 480 370 C 490 390, 480 430, 440 445 C 380 460, 240 460, 140 445 C 110 440, 105 420, 120 410 Z" fill="url(#soleGrad)"/>
  
  <!-- Upper Shoe Body -->
  <path d="M 140 410 C 130 350, 160 270, 220 250 C 270 235, 310 280, 370 310 C 430 340, 470 345, 480 370 C 450 410, 360 415, 300 415 C 220 415, 170 410, 140 410 Z" fill="#f8fafc" stroke="#cbd5e1" stroke-width="2"/>
  
  <!-- Collar & Heel -->
  <path d="M 190 260 C 210 210, 240 215, 270 250 L 250 280 Z" fill="#0284c7"/>
  
  <!-- Dynamic Swoosh / Wave -->
  <path d="M 180 360 Q 280 330 380 320 Q 320 370 240 395 Z" fill="#f43f5e"/>
  
  <!-- Lacing Details -->
  <path d="M 280 270 L 320 295 M 295 285 L 335 310 M 310 300 L 350 325" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
  
  <text x="300" y="530" font-family="'Inter', sans-serif" font-size="14" font-weight="bold" fill="#94a3b8" text-anchor="middle" letter-spacing="4">HYPER·PULSE NITRO V2</text>
</svg>
`;

// 3. Wireless Headphones (头戴式无线耳机)
const headphoneSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="headBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#18181b"/>
      <stop offset="100%" stop-color="#27272a"/>
    </linearGradient>
    <linearGradient id="goldAccent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#facc15"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#headBg)"/>
  
  <!-- Headband Arc -->
  <path d="M 160 320 C 140 160, 460 160, 440 320" fill="none" stroke="#3f3f46" stroke-width="26" stroke-linecap="round"/>
  <path d="M 170 310 C 155 175, 445 175, 430 310" fill="none" stroke="#18181b" stroke-width="12" stroke-linecap="round"/>
  <path d="M 230 190 C 270 180, 330 180, 370 190" fill="none" stroke="url(#goldAccent)" stroke-width="6"/>

  <!-- Left Earcup -->
  <ellipse cx="160" cy="350" rx="45" ry="70" fill="#09090b" stroke="url(#goldAccent)" stroke-width="3"/>
  <ellipse cx="160" cy="350" rx="30" ry="50" fill="#27272a"/>
  
  <!-- Right Earcup -->
  <ellipse cx="440" cy="350" rx="45" ry="70" fill="#09090b" stroke="url(#goldAccent)" stroke-width="3"/>
  <ellipse cx="440" cy="350" rx="30" ry="50" fill="#27272a"/>

  <text x="300" y="520" font-family="sans-serif" font-size="14" font-weight="600" fill="#a1a1aa" text-anchor="middle" letter-spacing="5">AURA STUDIO PRO · ANC</text>
</svg>
`;

// 4. Artisan Coffee Cup (精品咖啡杯)
const coffeeSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="100%" height="100%">
  <defs>
    <linearGradient id="cupBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#292524"/>
      <stop offset="100%" stop-color="#1c1917"/>
    </linearGradient>
    <linearGradient id="ceramicGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fafaf9"/>
      <stop offset="70%" stop-color="#f5f5f4"/>
      <stop offset="100%" stop-color="#e7e5e4"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" fill="url(#cupBg)"/>
  
  <!-- Saucer -->
  <ellipse cx="300" cy="460" rx="180" ry="30" fill="url(#ceramicGrad)" stroke="#d6d3d1" stroke-width="2"/>
  <ellipse cx="300" cy="455" rx="130" ry="20" fill="#e7e5e4"/>

  <!-- Coffee Cup Body -->
  <path d="M 200 280 L 230 440 C 235 450, 365 450, 370 440 L 400 280 Z" fill="url(#ceramicGrad)" stroke="#d6d3d1" stroke-width="2"/>
  <ellipse cx="300" cy="280" rx="100" ry="25" fill="#e7e5e4" stroke="#d6d3d1" stroke-width="1"/>
  
  <!-- Coffee Liquid & Foam Art -->
  <ellipse cx="300" cy="282" rx="92" ry="20" fill="#78350f"/>
  <!-- Latte Art Heart -->
  <path d="M 285 280 C 275 272, 290 268, 300 276 C 310 268, 325 272, 315 280 L 300 292 Z" fill="#fef3c7"/>
  
  <!-- Handle -->
  <path d="M 380 300 C 440 310, 440 400, 370 410" fill="none" stroke="url(#ceramicGrad)" stroke-width="16" stroke-linecap="round"/>

  <!-- Steam Whisps -->
  <path d="M 270 240 Q 260 210 280 180" stroke="#f5f5f4" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.4"/>
  <path d="M 320 240 Q 340 200 320 170" stroke="#f5f5f4" stroke-width="3" fill="none" stroke-linecap="round" opacity="0.4"/>

  <text x="300" y="535" font-family="'Playfair Display', serif" font-size="15" fill="#d6d3d1" text-anchor="middle" letter-spacing="3">ROAST &amp; CO. ROASTERY</text>
</svg>
`;

// 5. Sample Transparent Brand Logos
const logoLuminaSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="100%" height="100%">
  <rect width="400" height="120" fill="transparent"/>
  <circle cx="60" cy="60" r="28" fill="none" stroke="#ffffff" stroke-width="4"/>
  <path d="M 60 40 L 60 80 M 40 60 L 80 60" stroke="#f59e0b" stroke-width="3" stroke-linecap="round"/>
  <text x="110" y="68" font-family="'Cinzel', serif" font-size="28" font-weight="bold" fill="#ffffff" letter-spacing="6">LUMINA</text>
  <text x="112" y="85" font-family="sans-serif" font-size="10" fill="#9ca3af" letter-spacing="4">PARIS · STUDIO</text>
</svg>
`;

const logoAeroSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="100%" height="100%">
  <rect width="400" height="120" fill="transparent"/>
  <path d="M 40 75 L 75 35 L 90 75 Z" fill="#38bdf8"/>
  <path d="M 65 75 L 95 35 L 110 75 Z" fill="#ec4899"/>
  <text x="135" y="70" font-family="'Montserrat', sans-serif" font-size="32" font-weight="900" font-style="italic" fill="#ffffff" letter-spacing="2">AERO</text>
  <text x="250" y="70" font-family="'Montserrat', sans-serif" font-size="32" font-weight="300" fill="#38bdf8" letter-spacing="1">MAX</text>
</svg>
`;

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    id: 'demo-perfume',
    name: '🧴 奢华法式香水',
    nameEn: 'Luxury French Perfume',
    category: 'beauty',
    icon: '🧴',
    dataUrl: '/products/demo_perfume.png',
    recommendedPrompt:
      'Place this luxury perfume bottle in the center of an opulent Italian marble vanity table. Soft morning sunlight streaming through sheer linen curtains, casting warm golden caustics and subtle reflections. Minimalist organic floral vase in soft background blur. Editorial high-end beauty commercial advertisement photography, cinematic depth of field, 8k resolution.',
  },
  {
    id: 'demo-sneaker',
    name: '👟 极简潮酷跑鞋',
    nameEn: 'Air Modern Sneaker',
    category: 'fashion',
    icon: '👟',
    dataUrl: '/products/demo_sneaker.png',
    recommendedPrompt:
      'Dynamic street fashion commercial for these running sneakers. Floating in mid-air above a wet asphalt street in a neon-lit cyberpunk metropolis at dusk. Neon pink and cyan reflections on the wet ground, dramatic rim lighting emphasizing the aerodynamic sole curves, cinematic motion blur, commercial advertising poster.',
  },
  {
    id: 'demo-headphone',
    name: '🎧 降噪头戴耳机',
    nameEn: 'Wireless ANC Headphones',
    category: 'tech',
    icon: '🎧',
    dataUrl: '/products/demo_headphone.png',
    recommendedPrompt:
      'Professional industrial design showcase for premium over-ear headphones. Displayed resting on a sleek dark brushed titanium stand in a modern minimalist architect loft studio. Warm dramatic studio spot lighting highlighting the metallic chamfered edges, dark matte background, ultra-sharp texture detail.',
  },
  {
    id: 'demo-coffee',
    name: '☕ 精品手冲咖啡',
    nameEn: 'Artisan Craft Coffee',
    category: 'fnb',
    icon: '☕',
    dataUrl: '/products/demo_coffee.png',
    recommendedPrompt:
      'Artisanal cafe atmosphere featuring this handcrafted ceramic latte cup on a rustic dark oak table. Roasted whole coffee beans scattered artfully around the saucer, steam rising gently in the warm golden afternoon lighting. Cozy Nordic bakery aesthetic, rich earthy tones, professional food & beverage catalog styling.',
  },
];

export const DEMO_LOGOS: DemoLogo[] = [
  {
    id: 'logo-lumina',
    name: '✨ LUMINA PARIS (奢华白金标)',
    icon: '✨',
    dataUrl: svgToDataUrl(logoLuminaSvg),
  },
  {
    id: 'logo-aero',
    name: '⚡ AERO MAX (潮酷渐变标)',
    icon: '⚡',
    dataUrl: svgToDataUrl(logoAeroSvg),
  },
];

export const PROMPT_SCENE_CHIPS = [
  {
    label: '🏢 现代都市街拍',
    text: 'Set on a modern urban street with glass skyscrapers and sunny morning city atmosphere.',
  },
  {
    label: '✨ 奢华大理石展台',
    text: 'Displayed on a polished white Carrara marble pedestal with soft golden hour lighting and clean aesthetic.',
  },
  {
    label: '🌿 极简北欧自然',
    text: 'Surrounded by fresh green monstera leaves and warm neutral beige tones in a bright Scandinavian studio.',
  },
  {
    label: '🌅 黄金日落暖光',
    text: 'Bathed in dramatic sunset golden light casting long soft shadows with cinematic warmth.',
  },
  {
    label: '⚡ 赛博未来霓虹',
    text: 'Dark reflective cyberpunk scene illuminated by neon blue and magenta rim lights.',
  },
  {
    label: '🎨 纯色极简棚拍',
    text: 'Clean minimalist commercial studio photography on a seamless pastel gradient background.',
  },
];
